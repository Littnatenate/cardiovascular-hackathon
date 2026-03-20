import json
import os
from typing import List, Dict

# Mock OCR Engine
# In a real app, this would use pytesseract or an LLM to parse image text.
# For the hackathon, we match the "photo" name to our pre-defined scenarios.

def simulate_ocr(image_name: str) -> List[Dict]:
    """
    Simulates scanning a medication bottle.
    Returns a list of medication objects based on the 'scanned' image.
    """
    # Logic: If the image name contains 'margaret', return Margaret's home meds.
    # Otherwise, return a default set.
    
    image_lower = image_name.lower()
    
    if "margaret" in image_lower:
        return [
            { "name": "Lipitor", "dose": "20mg", "frequency": "Once daily", "source": "photo" },
            { "name": "Metformin", "dose": "500mg", "frequency": "Twice daily", "source": "photo" }
        ]
    elif "edward" in image_lower:
        return [
            { "name": "Symbicort", "dose": "160/4.5mcg", "frequency": "2 puffs twice daily", "source": "photo" },
            { "name": "Spiriva", "dose": "18mcg", "frequency": "One capsule inhaled daily", "source": "photo" }
        ]
    
    # Default fallback
    return [
        { "name": "Aspirin", "dose": "81mg", "frequency": "Once daily", "source": "photo" }
    ]
