from typing import List, Dict

# Patient Education Generator
# This service transforms clinical 'flags' into patient-friendly language.

def generate_patient_instructions(comparison_results: Dict) -> str:
    """
    Takes the output of the Safety Engine and generates a Markdown instruction sheet.
    """
    sections = ["# Your Personal Medication Guide\n"]
    sections.append("This guide explains the changes to your medications after your hospital stay.\n")

    # Grouping changes
    changed = comparison_results.get("summary", {}).get("changed", 0)
    new_meds = comparison_results.get("summary", {}).get("new", 0)
    stopped = comparison_results.get("summary", {}).get("stopped", 0)

    if new_meds > 0:
        sections.append("### 🌟 New Medications")
        sections.append("You have some new medicines to help you recover. Please start taking these as prescribed.")
        for med in comparison_results.get("new_medications", []):
            sections.append(f"- **{med['name']}**: {med['frequency']}. ({med.get('notes', 'No specific notes')})")
        sections.append("")

    if changed > 0:
        sections.append("### ⚠️ Changed Medications")
        sections.append("Some of your usual medicines have been adjusted. **Check the new doses carefully!**")
        for med in comparison_results.get("discrepancies", []):
            sections.append(f"- **{med['name']}**: Now taking {med['discharge_dose']} ({med['discharge_freq']}).")
            sections.append(f"  *Previously: {med['home_dose']}*")
        sections.append("")

    if stopped > 0:
        sections.append("### 🛑 Stopped Medications")
        sections.append("You should **STOP** taking these medicines for now.")
        for med in comparison_results.get("stopped_medications", []):
            sections.append(f"- **{med['name']}**: Do not take this until your next doctor's visit.")
        sections.append("")

    sections.append("---")
    sections.append("> [!IMPORTANT]")
    sections.append("> If you feel dizzy, nauseous, or have a rash, contact your nurse or doctor immediately.")

    return "\n".join(sections)
