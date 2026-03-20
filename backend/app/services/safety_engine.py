import json
import os
import difflib
from typing import List, Dict, Any, Optional
from itertools import combinations

# ── Dataset Loading ──────────────────────────────────────────────

DATA_DIR = os.path.join(os.path.dirname(__file__), "..", "..", "..", "data", "mappings")

def _load_json(filename: str) -> dict:
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"[SafetyEngine] WARNING: {filepath} not found, using empty dataset.")
        return {}
    with open(filepath, "r", encoding="utf-8") as f:
        return json.load(f)

# Load datasets once at import time
_rxnorm_data = _load_json("rxnorm.json")
_ddinter_blood = _load_json("ddinter_blood.json")
_ddinter_stomach = _load_json("ddinter_stomach.json")

BRAND_TO_GENERIC: dict[str, str] = _rxnorm_data.get("brand_to_generic", {})
GENERIC_ALIASES: dict[str, str] = _rxnorm_data.get("generic_aliases", {})
BLOOD_INTERACTIONS: list[dict] = _ddinter_blood.get("interactions", [])
STOMACH_INTERACTIONS: list[dict] = _ddinter_stomach.get("interactions", [])


# ── Name Resolution (RxNorm) ────────────────────────────────────

def resolve_to_generic(name: str) -> str:
    """
    Resolves a drug name to its canonical generic name using RxNorm data.
    Includes fuzzy matching for typos.
    """
    lower = name.lower().strip()

    # 1. Exact match in brands
    if lower in BRAND_TO_GENERIC:
        return BRAND_TO_GENERIC[lower]

    # 2. Exact match in aliases
    if lower in GENERIC_ALIASES:
        return GENERIC_ALIASES[lower]

    # 3. Fuzzy match in brands (handles typos like "Lipitir")
    brand_matches = difflib.get_close_matches(lower, BRAND_TO_GENERIC.keys(), n=1, cutoff=0.8)
    if brand_matches:
        return BRAND_TO_GENERIC[brand_matches[0]]

    # 4. Fuzzy match in aliases
    alias_matches = difflib.get_close_matches(lower, GENERIC_ALIASES.keys(), n=1, cutoff=0.8)
    if alias_matches:
        return GENERIC_ALIASES[alias_matches[0]]

    # Already a generic or unknown — return as-is
    return lower


def normalize_med_name(name: str) -> str:
    """Resolves to generic name via RxNorm, then normalizes."""
    return resolve_to_generic(name)


# ── Interaction Checking (DDInter) ──────────────────────────────

def check_interactions(med_names: List[str]) -> List[Dict[str, Any]]:
    """
    Checks all pairs of medications against both DDInter datasets.
    Returns a list of flagged interactions.
    """
    # Normalize all names to generic
    generic_names = [resolve_to_generic(n) for n in med_names]
    all_interactions = BLOOD_INTERACTIONS + STOMACH_INTERACTIONS
    flags: List[Dict[str, Any]] = []

    # Build a lookup set for quick pair matching
    interaction_lookup: dict[tuple, dict] = {}
    for entry in all_interactions:
        key = tuple(sorted([entry["drug_a"].lower(), entry["drug_b"].lower()]))
        interaction_lookup[key] = entry

    # Check every pair
    for a, b in combinations(generic_names, 2):
        pair_key = tuple(sorted([a, b]))
        if pair_key in interaction_lookup:
            interaction = interaction_lookup[pair_key]
            flags.append({
                "drug_a": a,
                "drug_b": b,
                "severity": interaction["severity"],
                "effect": interaction["effect"],
                "recommendation": interaction["recommendation"],
                "source": "DDInter"
            })

    return flags


# ── Core Comparison ─────────────────────────────────────────────

def compare_lists(home_list: list[dict], discharge_list: list[dict], allergies: list[str] | None = None) -> dict:
    """
    Core function to compare home meds vs discharge meds.
    Uses RxNorm for name resolution and DDInter for interaction checking.
    Checks for patient allergies against the discharge list.
    """
    if allergies is None:
        allergies = []

    results: dict = {
        "summary": {"continued": 0, "changed": 0, "stopped": 0, "new": 0},
        "new_medications": [],
        "stopped_medications": [],
        "discrepancies": [],
        "interactions": [],
        "allergy_alerts": [],
        "escalations": [],
        "rxnorm_mappings": []
    }

    # Normalize allergies for matching
    normalized_allergies = [a.lower().strip() for a in allergies]

    # Build lookups using RxNorm-resolved names
    home_dict: dict[str, dict] = {}
    for m in home_list:
        generic = normalize_med_name(m.get("name") or m.get("drugName") or "")
        original = m.get("name") or m.get("drugName") or "Unknown"
        if generic != original.lower().strip() and generic != "unknown":
            results["rxnorm_mappings"].append({"original": original, "resolved": generic})
        home_dict[generic] = m

    discharge_dict: dict[str, dict] = {}
    for m in discharge_list:
        name_val = m.get("name") or m.get("drugName") or ""
        generic = normalize_med_name(name_val)
        original = name_val
        
        # Check for ALLERGIES against this medication
        for allergy in normalized_allergies:
            if allergy in generic or allergy in original.lower():
                alert = {
                    "medication": original,
                    "allergy": allergy,
                    "severity": "CRITICAL",
                    "reason": f"Patient has documented allergy to '{allergy}'"
                }
                results["allergy_alerts"].append(alert)
                results["escalations"].append(f"🚨 CRITICAL ALLERGY: Patient is allergic to {allergy} but was prescribed {original}")

        if generic != original.lower().strip() and generic != "unknown":
            results["rxnorm_mappings"].append({"original": original, "resolved": generic})
        discharge_dict[generic] = m

    # ── Phase 1: Compare lists ──
    for d_name, d_med in discharge_dict.items():
        if d_name in home_dict:
            h_med = home_dict[d_name]
            if d_med.get("dose") != h_med.get("dose") or d_med.get("strength") != h_med.get("strength") or d_med.get("frequency") != h_med.get("frequency"):
                results["summary"]["changed"] += 1
                results["discrepancies"].append({
                    "name": d_med.get("name") or d_med.get("drugName"),
                    "generic_name": d_name,
                    "home_dose": h_med.get("dose") or h_med.get("strength"),
                    "home_freq": h_med.get("frequency"),
                    "discharge_dose": d_med.get("dose") or d_med.get("strength"),
                    "discharge_freq": d_med.get("frequency"),
                    "reason": "Dose or frequency change observed."
                })
            else:
                results["summary"]["continued"] += 1
        else:
            results["summary"]["new"] += 1
            results["new_medications"].append({
                **d_med,
                "generic_name": d_name
            })

    # Check for stopped meds 
    for h_name, h_med in home_dict.items():
        if h_name not in discharge_dict:
            results["summary"]["stopped"] += 1
            results["stopped_medications"].append({
                **h_med,
                "generic_name": h_name
            })
            results["escalations"].append(
                f"WARNING: Previously taken {h_med.get('name') or h_med.get('drugName')} is NOT on discharge list."
            )

    # ── Phase 2: Check drug-drug interactions on the DISCHARGE list ──
    discharge_names = [m.get("name") or m.get("drugName") or "" for m in discharge_list]
    interactions = check_interactions(discharge_names)

    for interaction in interactions:
        results["interactions"].append(interaction)
        severity_emoji = {"low": "ℹ️", "moderate": "⚠️", "high": "🚨", "critical": "🚨🚨"}.get(
            interaction["severity"], "⚠️"
        )
        results["escalations"].append(
            f"{severity_emoji} INTERACTION: {interaction['drug_a']} + {interaction['drug_b']} — {interaction['effect']}"
        )

    return results
