import os
from openai import AsyncOpenAI
from app.services.scrubber import scrubber

# Reuse the same Local LLM configuration
LLM_BASE_URL = os.getenv("MEDSAFE_LLM_BASE_URL", "http://localhost:1234/v1")
LLM_API_KEY = os.getenv("MEDSAFE_LLM_API_KEY", "lm-studio")
LLM_MODEL = os.getenv("MEDSAFE_LLM_MODEL", "qwen2.5-7b-instruct-1m")

client = AsyncOpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY)

WHATSAPP_PROMPT = """
You are MedSafe, a clinical assistant creating an ultra-short WhatsApp summary for a patient's family member or caregiver after hospital discharge.

=== FULL CLINICAL INSTRUCTIONS ===
{full_instructions}

=== YOUR TASK ===
Distill the above instructions into a mobile-friendly WhatsApp format.
Rules:
1. MAX 5 Bullet Points. (Keep it extremely concise)
2. Use Emojis for readability (e.g. 💊 for pills, 🛑 for stopped meds, ⚠️ for warnings).
3. Do NOT include Markdown tables.
4. Keep the tone friendly but urgent.
5. If a caregiver language is specified ({caregiver_lang}), generate the summary in that language. Otherwise, use English.

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
        response = await client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": "You are an expert medical translator. Create mobile-friendly WhatsApp summaries."
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
        import re
        clean_content = re.sub(r'<think>.*?</think>', '', raw_content, flags=re.DOTALL)
        
        return clean_content.strip()
        
    except Exception as e:
        print(f"[whatsapp_generator] Error calling LLM: {str(e)}")
        # Urgent fallback if Local AI is down
        return (
            "🏥 *Medication Update*\n"
            "There have been changes to the patient's medications.\n"
            "Please check the full printed Medication Guide or consult the pharmacist for details."
        )
