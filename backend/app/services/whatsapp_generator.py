import os
import re
from openai import AsyncOpenAI
from app.services.scrubber import scrubber

from app.services.llm_client import client, LLM_MODEL, generate_chat_completion

WHATSAPP_PROMPT = """
You are MedSafe, a clinical assistant creating an ultra-short WhatsApp summary for a patient's family member or caregiver after hospital discharge.

=== FULL CLINICAL INSTRUCTIONS ===
{full_instructions}

=== YOUR TASK ===
Distill the above instructions into a mobile-friendly WhatsApp format.

Rules:
1. MAX 5 Bullet Points. (Keep it extremely concise)
2. Use these EXACT emojis for medication status:
   - 💊 START = New medication started
   - 🛑 STOP = Medication discontinued
   - 🔄 CHANGE = Dose or frequency changed
   - ✅ CONTINUE = Medication unchanged
   - ⚠️ = Warnings or alerts
3. For EACH medication bullet, include the timing (e.g. "Morning", "Night", "Twice daily") so the caregiver knows WHEN to give it.
   Example: "💊 START Ticagrelor 90mg — Morning & Night (prevents blood clots)"
4. Do NOT include Markdown tables.
5. Keep the tone friendly but urgent.
6. If a caregiver language is specified ({caregiver_lang}), generate the summary in that language. Otherwise, use English.
7. End with a brief reminder: "📋 Full details in the printed Medication Guide."

Output ONLY the WhatsApp message content.
"""

async def generate_whatsapp_summary(full_instructions_md: str, caregiver_lang: str = "None") -> str:
    """
    Condenses the full Markdown clinical instructions into a short, 
    emoji-rich WhatsApp summary using the Local LLM.
    """
    
    # 1. Anonymize the input just in case Patient Name made it into the Markdown
    anonymized_instructions = scrubber.scrub_text(full_instructions_md)
    
    prompt = WHATSAPP_PROMPT.format(
        full_instructions=anonymized_instructions,
        caregiver_lang=caregiver_lang
    )
    
    try:
        response = await generate_chat_completion(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert medical translator. Create mobile-friendly WhatsApp summaries. Use the exact emoji mapping provided (💊 START, 🛑 STOP, 🔄 CHANGE, ✅ CONTINUE). Always include medication timing in each bullet point."
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.4, # Lower temperature for more focused/deterministic formatting
            max_tokens=500,
            timeout=60.0
        )
        
        raw_content = response.choices[0].message.content
        
        # Clean <think> tags if using DeepSeek/Qwen Reasoning models
        clean_content = re.sub(r'<think>.*?</think>', '', raw_content, flags=re.DOTALL)
        
        return clean_content.strip()
        
    except Exception as e:
        print(f"[whatsapp_generator] Error calling LLM: {str(e)}")
        
        # Try to extract medication names from the full instructions for a better fallback
        med_lines = []
        try:
            # Match patterns like "💊 START | MedName", "🛑 STOP | MedName", bold medication names, etc.
            # Pattern 1: Table rows with status emoji
            table_matches = re.findall(
                r'\|\s*(💊\s*START|🛑\s*STOP|🔄\s*CHANGE|✅\s*CONTINUE)\s*\|\s*([^|]+)',
                full_instructions_md
            )
            for status, med_name in table_matches[:5]:  # Limit to 5
                status = status.strip()
                med_name = med_name.strip()
                if med_name and med_name != "Medication" and med_name != "[Drug Name]":
                    emoji = "💊" if "START" in status else "🛑" if "STOP" in status else "🔄" if "CHANGE" in status else "✅"
                    label = "START" if "START" in status else "STOP" if "STOP" in status else "CHANGE" if "CHANGE" in status else "CONTINUE"
                    med_lines.append(f"{emoji} {label}: {med_name}")

            # Pattern 2: Bold medication names like **MedName**
            if not med_lines:
                bold_matches = re.findall(r'\*\*([A-Za-z][A-Za-z\s]+(?:\d+\s*mg)?)\*\*', full_instructions_md)
                seen = set()
                for med_name in bold_matches[:5]:
                    med_clean = med_name.strip()
                    if med_clean.lower() not in seen and len(med_clean) > 3:
                        seen.add(med_clean.lower())
                        med_lines.append(f"💊 {med_clean}")
        except Exception:
            pass  # If parsing fails, use generic fallback

        if med_lines:
            med_summary = "\n".join(med_lines)
            return (
                "🏥 *Medication Update*\n\n"
                f"{med_summary}\n\n"
                "⚠️ Please check the full printed Medication Guide for dosage details and timing.\n"
                "📋 Bring the guide to the next clinic visit."
            )
        else:
            # Fully generic fallback if nothing could be parsed
            return (
                "🏥 *Medication Update*\n"
                "There have been changes to the patient's medications.\n"
                "Please check the full printed Medication Guide or consult the pharmacist for details."
            )
