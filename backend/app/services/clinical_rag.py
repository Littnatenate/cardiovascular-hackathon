import httpx
import asyncio
from typing import Dict, Any, List

class ClinicalRAG:
    """
    Retrieval-Augmented Generation (RAG) engine for Medication Instructions.
    Fetches real-world clinical data (OpenFDA) and local regulatory context (Singapore HSA simulation).
    """
    def __init__(self):
        self.fda_base_url = "https://api.fda.gov/drug/label.json"
        
        # In a real production system, this would query data.gov.sg or MOH APIs.
        # For the hackathon, we simulate the Singapore context layer (HSA Registered + Healthier SG).
        self.sg_context_db = {
            "aspirin": {"hsa_registered": True, "healthier_sg_subsidized": True},
            "atorvastatin": {"hsa_registered": True, "healthier_sg_subsidized": True},
            "metformin": {"hsa_registered": True, "healthier_sg_subsidized": True},
            "lisinopril": {"hsa_registered": True, "healthier_sg_subsidized": True},
        }

        # Cache to prevent spamming the FDA API
        self.cache: Dict[str, str] = {}

    async def get_medication_facts(self, generic_name: str) -> str:
        """
        Retrieves clinical facts for a given medication and formats it as a strict 
        context prompt for the AI.
        """
        generic_name = generic_name.lower().strip()
        
        if generic_name in self.cache:
            return self.cache[generic_name]

        # 1. Fetch Global Clinical Data (OpenFDA)
        fda_facts = await self._fetch_openfda(generic_name)
        
        # 2. Fetch Local Singapore Data (HSA / Healthier SG)
        sg_facts = self._fetch_sg_context(generic_name)

        # 3. Combine into a strict context block
        context_block = f"--- CLINICAL FACTS FOR {generic_name.upper()} ---\n"
        context_block += f"Local Status (Singapore): {sg_facts}\n"
        context_block += f"Clinical Warnings & Side Effects (FDA): {fda_facts}\n"
        context_block += "---------------------------------------\n"
        
        self.cache[generic_name] = context_block
        return context_block

    async def _fetch_openfda(self, generic_name: str) -> str:
        """Queries the OpenFDA API for adverse reactions and boxed warnings."""
        try:
            # FDA API requires exact matches or specific queries. We do a basic search by generic name.
            # Using httpx for async HTTP requests
            url = f"{self.fda_base_url}?search=openfda.generic_name:\"{generic_name}\"&limit=1"
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                
            if response.status_code == 200:
                data = response.json()
                results = data.get("results", [])
                if results:
                    label = results[0]
                    # Try to extract the most critical sections
                    warnings = label.get("boxed_warning", label.get("warnings", ["No major boxed warnings."]))[0]
                    adverse = label.get("adverse_reactions", ["No common adverse reactions listed."])[0]
                    
                    # Truncate to avoid blowing up the prompt (FDA labels are HUGE)
                    warnings = warnings[:500] + "..." if len(warnings) > 500 else warnings
                    adverse = adverse[:500] + "..." if len(adverse) > 500 else adverse
                    
                    return f"WARNINGS: {warnings} | COMMON SIDE EFFECTS: {adverse}"
                
            return "No specific FDA clinical data found. Rely on standard medical knowledge for extreme cases only."
        except Exception as e:
            print(f"[RAG] OpenFDA API Error for {generic_name}: {e}")
            return "API Unavailable. Rely on standard medical knowledge."

    def _fetch_sg_context(self, generic_name: str) -> str:
        """Simulates querying HSA and Healthier SG databases."""
        data = self.sg_context_db.get(generic_name)
        if data:
            hsa = "HSA Registered" if data["hsa_registered"] else "Not HSA Registered"
            hsg = "Fully Subsidized under Healthier SG" if data["healthier_sg_subsidized"] else "Not Subsidized"
            return f"{hsa}, {hsg}"
        return "Not listed in primary Singapore registries."

# Singleton instance
rag_engine = ClinicalRAG()
