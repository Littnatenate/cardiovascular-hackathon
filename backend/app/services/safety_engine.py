# Safety Engine Logic

def normalize_med_name(name: str) -> str:
    """Basic normalization for MVP (lowercase, strip)."""
    return name.lower().strip()

def compare_lists(home_list: list[dict], discharge_list: list[dict]) -> dict:
    """
    Core function to compare home meds vs discharge meds.
    Returns categorized medications and escalation flags.
    """
    results: dict = {
        "summary": {"continued": 0, "changed": 0, "stopped": 0, "new": 0},
        "medications": [],
        "escalations": []
    }
    
    # Create quick lookups
    home_dict = {normalize_med_name(m["name"]): m for m in home_list}
    discharge_dict = {normalize_med_name(m["name"]): m for m in discharge_list}
    
    # Check Discharge list (New, Continued, Changed)
    for d_name, d_med in discharge_dict.items():
        if d_name in home_dict:
            h_med = home_dict[d_name]
            if d_med.get("dose") != h_med.get("dose"):
                results["summary"]["changed"] += 1
                results["medications"].append({
                    "name": d_med["name"],
                    "status": "CHANGED",
                    "old_dose": h_med.get("dose"),
                    "new_dose": d_med.get("dose"),
                    "reason": "Dose was modified during hospitalization."
                })
            else:
                results["summary"]["continued"] += 1
                results["medications"].append({
                    "name": d_med["name"],
                    "status": "CONTINUED"
                })
        else:
            results["summary"]["new"] += 1
            results["medications"].append({
                "name": d_med["name"],
                "status": "NEW",
                "reason": "New medication added during hospitalization."
            })
            
    # Check Home list (Stopped)
    for h_name, h_med in home_dict.items():
        if h_name not in discharge_dict:
            results["summary"]["stopped"] += 1
            results["medications"].append({
                "name": h_med["name"],
                "status": "STOPPED",
                "reason": "Home medication not found on discharge list."
            })

    return results

