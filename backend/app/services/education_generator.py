import os
import asyncio
from openai import AsyncOpenAI
from typing import List, Dict, Any
from app.services.scrubber import scrubber
from app.services.clinical_rag import rag_engine

from app.services.llm_client import client, LLM_MODEL, generate_chat_completion

# Prompt Template — Loaded from prompts/education-generation.md
PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "prompts", "education-generation.md")

def _load_prompt_template() -> str:
    if os.path.exists(PROMPT_PATH):
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    return "You are an expert nurse. Generate discharge instructions for: {{notes}}"

PROMPT_TEMPLATE = _load_prompt_template()

# ── Generative Service ──────────

async def generate_patient_instructions(
    comparison_results: Dict[str, Any], 
    patient_data: Dict[str, Any] = None,
    target_lang: str = "English",
    caregiver_lang: str = "None"
) -> str:
    """
    Generates empathetic, patient-friendly discharge instructions using a Local/Remote LLM.
    Uses OpenAI-compatible protocol (LM Studio, Vertex AI, etc.)
    """
    if patient_data is None:
        patient_data = {}

    # 1. Anonymize data before sending to AI (Safety First)
    anonymized_context = scrubber.prepare_llm_context(patient_data, comparison_results)
    
    # 2. Fetch Clinical RAG Facts (Zero Hallucination Guardrail)
    meds_to_fetch = []
    for cat in ["new_medications", "discrepancies", "continuing_medications"]:
        for m in comparison_results.get(cat, []):
            meds_to_fetch.append(m.get("generic") or m.get("name"))
            
    rag_facts_blocks = []
    for med in set(filter(None, meds_to_fetch)):
        facts = await rag_engine.get_medication_facts(med)
        rag_facts_blocks.append(facts)
    rag_context = "\n".join(rag_facts_blocks)

    # 3. Call LLM with retry logic (OpenAI-compatible)
    base_prompt = _load_prompt_template().replace("{{notes}}", anonymized_context)
    prompt = f"{base_prompt}\n\n=== VERIFIED CLINICAL FACTS (DO NOT HALLUCINATE) ===\n{rag_context}\n"

    max_attempts = 2  # Try once, retry once on failure
    last_error = None

    for attempt in range(max_attempts):
        try:
            response = await generate_chat_completion(
                model=LLM_MODEL,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a Precision Clinical Assistant specializing in Cardiovascular Discharge. "
                            "Your goal is to provide a high-authority, structured medication guide. "
                            "1. ALWAYS start with a Markdown Table summarising all medication changes (START/STOP/CHANGE). "
                            "2. Use Markdown blockquotes with emoji (e.g. > ⚠️ **IMPORTANT:**) for life-saving warnings. Do NOT use GitHub-style [!IMPORTANT] alerts. "
                            "3. Use the provided 'VERIFIED CLINICAL FACTS' for all medical claims. "
                            "4. Maintain a professional, precise, and efficient tone (the Singapore clinical vibe). "
                            f"5. The PRIMARY patient guide MUST be written in {target_lang}. "
                            f"6. If the caregiver language is not 'None' (currently: {caregiver_lang}), YOU MUST append a separate 'Caregiver Summary' section at the very end, translating the key action items into {caregiver_lang}. "
                            "7. Do NOT output any HTML tags. Use only Markdown formatting. "
                            "8. Do NOT truncate the medication table. List every single medication. "
                            "9. Do NOT mix languages within a single sentence. "
                            "Start your response immediately with the header '# Your Personal Medication Guide'."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
                temperature=0.4,
                max_tokens=3000,
                timeout=120.0
            )
            
            import re
            raw_content = response.choices[0].message.content
            
            # 1. Strip XML-style <think> tags (DeepSeek/Qwen style)
            clean_content = re.sub(r'<think>.*?</think>', '', raw_content, flags=re.DOTALL)
            
            # 2. Strip "Thinking Process:" or "Thinking Progress:" blocks (LM Studio/Qwen text style)
            # We look for the start of the actual content to know where the thinking ends
            markers = ["# Your Personal Medication Guide", "## Your Personal Medication Guide", "Your Personal Medication Guide"]
            start_index = -1
            for marker in markers:
                pos = clean_content.find(marker)
                if pos != -1:
                    start_index = pos
                    break
            
            if start_index != -1:
                # If we found a header, everything before it is likely "Thinking" junk
                clean_content = clean_content[start_index:]
            else:
                # If no header found, just try to strip the thinking header itself if it exists
                clean_content = re.sub(r'(?i)Thinking Process:.*?\n', '', clean_content, flags=re.DOTALL)
                clean_content = re.sub(r'(?i)Thinking Progress:.*?\n', '', clean_content, flags=re.DOTALL)

            return clean_content.strip() if clean_content.strip() else raw_content.strip()

        except Exception as e:
            import traceback
            last_error = e
            print(f"[AI Education] ERROR calling LLM (attempt {attempt + 1}/{max_attempts}): {str(e)}")
            print(f"[AI Education] Traceback: {traceback.format_exc()}")
            if attempt < max_attempts - 1:
                print("[AI Education] Retrying in 2 seconds...")
                await asyncio.sleep(2)

    # All retries exhausted — fall back to template
    print("[AI Education] All LLM attempts failed. Falling back to Template-based generation.")
    return _generate_template_instructions(comparison_results)


def _generate_template_instructions(comparison_results: Dict) -> str:
    """
    Robust template generator used as a safety net when the AI server is down.
    Produces a structured guide with actual medication names, daily schedule, and safety warnings.
    """
    sections = ["# Your Personal Medication Guide (Standard)\n"]
    sections.append("> ⚠️ **NOTICE:** This guide was generated using a backup template because the AI service is temporarily unavailable. Please verify all details with your ward pharmacist before discharge.\n")

    summary = comparison_results.get("summary", {})

    # ── Daily Action Plan Table ──
    table_rows = []
    new_meds = comparison_results.get("new_medications", [])
    discrepancies = comparison_results.get("discrepancies", [])
    stopped_meds = comparison_results.get("stopped_medications", [])
    continuing_meds = comparison_results.get("continuing_medications", [])

    for med in new_meds:
        name = med.get("name", "Unknown")
        freq = med.get("frequency", "As directed")
        table_rows.append(f"| 💊 START | {name} | {freq} | New medication — see details below |")

    for med in discrepancies:
        name = med.get("name", "Unknown")
        new_dose = med.get("discharge_dose", "See below")
        new_freq = med.get("discharge_freq", "See below")
        table_rows.append(f"| 🔄 CHANGE | {name} | {new_freq} | Dose changed to {new_dose} |")

    for med in stopped_meds:
        name = med.get("name", "Unknown")
        reason = med.get("reason", "Discontinued by doctor")
        table_rows.append(f"| 🛑 STOP | {name} | — | {reason} |")

    for med in continuing_meds:
        name = med.get("name", "Unknown")
        freq = med.get("frequency", "As before")
        table_rows.append(f"| ✅ CONTINUE | {name} | {freq} | Continue as before |")

    if table_rows:
        sections.append("## Daily Action Plan\n")
        sections.append("| Status | Medication | Timing | Purpose |")
        sections.append("| :---: | :--- | :--- | :--- |")
        sections.extend(table_rows)
        sections.append("")

    # ── New Medications Detail ──
    if new_meds:
        sections.append("## 🌟 New Medications\n")
        for med in new_meds:
            name = med.get("name", "Unknown")
            dose = med.get("dose", "")
            freq = med.get("frequency", "As directed")
            sections.append(f"**{name}** {dose}".strip())
            sections.append(f"- **When to take:** {freq}")
            sections.append(f"- **Why prescribed:** New medication started during this admission")
            sections.append("")

    # ── Changed Medications Detail ──
    if discrepancies:
        sections.append("## ⚠️ Adjusted Medications\n")
        for med in discrepancies:
            name = med.get("name", "Unknown")
            old_dose = med.get("admission_dose", "previous dose")
            new_dose = med.get("discharge_dose", "new dose")
            new_freq = med.get("discharge_freq", "as directed")
            sections.append(f"**{name}**")
            sections.append(f"- **Previous dose:** {old_dose}")
            sections.append(f"- **New dose:** {new_dose}")
            sections.append(f"- **When to take:** {new_freq}")
            sections.append("")

    # ── Stopped Medications ──
    if stopped_meds:
        sections.append("## 🛑 Stopped Medications\n")
        for med in stopped_meds:
            name = med.get("name", "Unknown")
            reason = med.get("reason", "Discontinued by your doctor")
            sections.append(f"- **{name}**: {reason}")
        sections.append("")

    # ── Basic Daily Schedule ──
    all_active_meds = new_meds + [m for m in discrepancies] + continuing_meds
    if all_active_meds:
        sections.append("## 🕐 Suggested Daily Schedule\n")
        sections.append("| Time of Day | Medications |")
        sections.append("| :--- | :--- |")
        morning_meds = []
        night_meds = []
        other_meds = []
        for med in all_active_meds:
            name = med.get("name", "Unknown")
            freq = (med.get("frequency") or med.get("discharge_freq") or "").lower()
            if "morning" in freq or "am" in freq or "daily" in freq or "once" in freq:
                morning_meds.append(name)
            elif "night" in freq or "pm" in freq or "bedtime" in freq:
                night_meds.append(name)
            else:
                morning_meds.append(name)  # Default to morning if unclear
        sections.append(f"| 🌅 Morning | {', '.join(morning_meds) if morning_meds else '—'} |")
        sections.append(f"| 🌙 Night | {', '.join(night_meds) if night_meds else '—'} |")
        sections.append("")

    # ── Safety Warnings ──
    sections.append("## ⚠️ Important Safety Reminders\n")
    sections.append("> ⚠️ **CRITICAL:** If you experience chest pain, difficulty breathing, or sudden weakness, call **995** immediately.\n")
    sections.append("- Do **NOT** stop any medication without consulting your doctor")
    sections.append("- Bring this medication guide to every follow-up appointment")
    sections.append("- Store all medications in a cool, dry place away from children")
    sections.append("- If you miss a dose, take it as soon as you remember — but do NOT double up")
    sections.append("")

    sections.append("---")
    sections.append("*This is a simplified summary generated by the MedSafe backup system. For the full AI-powered guide, please try again later or consult your ward pharmacist.*")

    return "\n".join(sections)
