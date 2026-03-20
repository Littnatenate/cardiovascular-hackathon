import re
from typing import Dict, Any, List

class PIIScrubber:
    """
    Utility to anonymize patient data before sending to LLM.
    Ensures HIPAA/PDPA compliance by stripping names and IDs.
    """

    # Patterns to catch NRIC/ID (Simple regex for 7-9 chars with letters)
    ID_PATTERN = re.compile(r'\b[A-Za-z]\d{7,8}[A-Za-z]\b')
    
    # Simple placeholder mapping
    PLACEHOLDERS = {
        "name": "[PATIENT NAME]",
        "nric": "[PATIENT ID]",
        "id": "[PATIENT ID]",
        "nric_id": "[PATIENT ID]",
        "ward": "[WARD]",
        "bed": "[BED]"
    }

    def scrub_text(self, text: str) -> str:
        """Removes common PII from a block of text."""
        if not text:
            return ""
        
        # Scrub ID patterns
        scrubbed = self.ID_PATTERN.sub("[PATIENT ID]", text)
        return scrubbed

    def scrub_patient_data(self, patient: Dict[str, Any]) -> Dict[str, Any]:
        """Returns a generic version of the patient object."""
        scrubbed = patient.copy()
        
        # Replace sensitive keys with placeholders
        for key in self.PLACEHOLDERS:
            if key in scrubbed and scrubbed[key]:
                scrubbed[key] = self.PLACEHOLDERS[key]
        
        # Special handling for 'allergies' — keep them but scrub any names inside
        if "allergies" in scrubbed and isinstance(scrubbed["allergies"], list):
            scrubbed["allergies"] = [self.scrub_text(str(a)) for a in scrubbed["allergies"]]
            
        return scrubbed

    def prepare_llm_context(self, patient: Dict[str, Any], results: Dict[str, Any]) -> str:
        """
        Creates a completely anonymized narrative context for the LLM.
        """
        s_patient = self.scrub_patient_data(patient)
        
        context = f"Patient Profile:\n"
        context += f"- Age/Gender: {s_patient.get('age', 'N/A')} {s_patient.get('gender', 'N/A')}\n"
        context += f"- Critical Allergies: {', '.join(s_patient.get('allergies', []))}\n\n"
        
        context += "Medication Reconciliation Results:\n"
        context += f"- Summary: {results.get('summary', {})}\n"
        
        # Extract new and changed meds for reasoning
        new_meds = [m.get('name') for m in results.get('new_medications', [])]
        discrepancies = [f"{m.get('name')} (Adjusted)" for m in results.get('discrepancies', [])]
        interactions = [f"{i.get('drug_a')} + {i.get('drug_b')}: {i.get('effect')}" for i in results.get('interactions', [])]
        
        if new_meds: context += f"- NEW: {', '.join(new_meds)}\n"
        if discrepancies: context += f"- ADJUSTED: {', '.join(discrepancies)}\n"
        if interactions: 
             context += "- SAFETY ALERTS:\n"
             for inter in interactions:
                 context += f"  * {inter}\n"
        
        return context

# Global instance
scrubber = PIIScrubber()
