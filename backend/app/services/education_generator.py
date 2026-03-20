import os
import asyncio
from openai import AsyncOpenAI
from typing import List, Dict, Any
from app.services.scrubber import scrubber

# ── Configuration (Model-Agnostic) ──────────
# Point this to LM Studio (default: http://127.0.0.1:1234/v1)
LLM_BASE_URL = os.getenv("MEDSAFE_LLM_BASE_URL", "http://127.0.0.1:1234/v1")
LLM_API_KEY = os.getenv("MEDSAFE_LLM_API_KEY", "lm-studio")
LLM_MODEL = os.getenv("MEDSAFE_LLM_MODEL", "qwen/qwen3.5-9b")

# Initialize Client
client = AsyncOpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY)

# Prompt Template — Loaded from prompts/education-generation.md
PROMPT_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "..", "prompts", "education-generation.md")

def _load_prompt_template() -> str:
    if os.path.exists(PROMPT_PATH):
        with open(PROMPT_PATH, "r", encoding="utf-8") as f:
            return f.read()
    return "You are an expert nurse. Generate discharge instructions for: {{notes}}"

PROMPT_TEMPLATE = _load_prompt_template()

# ── Generative Service ──────────

async def generate_patient_instructions(comparison_results: Dict[str, Any], patient_data: Dict[str, Any] = None) -> str:
    """
    Generates empathetic, patient-friendly discharge instructions using a Local/Remote LLM.
    Uses OpenAI-compatible protocol (LM Studio, Vertex AI, etc.)
    """
    if patient_data is None:
        patient_data = {}

    # 1. Anonymize data before sending to AI (Safety First)
    anonymized_context = scrubber.prepare_llm_context(patient_data, comparison_results)
    
    try:
        # 2. Call LLM (OpenAI-compatible)
        prompt = PROMPT_TEMPLATE.replace("{{notes}}", anonymized_context)
        
        response = await client.chat.completions.create(
            model=LLM_MODEL,
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a compassionate cardiovascular discharge nurse. "
                        "Respond ONLY with the final patient discharge instructions. "
                        "DO NOT include any internal 'Thinking Process', reasoning, or monologue. "
                        "Start your response immediately with the header '# Your Personal Medication Guide'."
                    )
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.7,
            max_tokens=2000,
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
        print(f"[AI Education] ERROR calling LLM: {str(e)}")
        print(f"[AI Education] Traceback: {traceback.format_exc()}")
        print("[AI Education] Falling back to Template-based generation.")
        
        # 3. Clinical Fallback (Robust Template Generator)
        return _generate_template_instructions(comparison_results)


def _generate_template_instructions(comparison_results: Dict) -> str:
    """
    Original robotic template generator. 
    Kept as a 'Safety Net' in case the AI server is down.
    """
    sections = ["# Your Personal Medication Guide (Standard)\n"]
    sections.append("This is a simplified summary of your medication changes.\n")

    summary = comparison_results.get("summary", {})
    
    if comparison_results.get("new_medications"):
        sections.append("### 🌟 New Medications")
        for med in comparison_results.get("new_medications", []):
            sections.append(f"- **{med.get('name')}**: {med.get('frequency')}.")

    if comparison_results.get("discrepancies"):
        sections.append("### ⚠️ Adjusted Doses")
        for med in comparison_results.get("discrepancies", []):
            sections.append(f"- **{med.get('name')}**: Now taking {med.get('discharge_dose')} ({med.get('discharge_freq')}).")

    sections.append("\n---")
    sections.append("> [!IMPORTANT]")
    sections.append("> AI Nurse service is currently unavailable. Please verify these instructions with your ward nurse before discharge.")

    return "\n".join(sections)
