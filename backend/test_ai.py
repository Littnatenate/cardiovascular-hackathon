import sys
import json

# Fix Windows console encoding for emojis
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.safety_engine import compare_lists, resolve_to_generic, check_interactions

print("=" * 60)
print("TEST 1: RxNorm Name Resolution")
print("=" * 60)

tests = [
    ("Lipitor",      "atorvastatin"),
    ("Coumadin",     "warfarin"),
    ("Glucophage",   "metformin"),
    ("Atorvastatin", "atorvastatin"),  # Already generic
    ("Metformin",    "metformin"),     # Already generic
    ("Ventolin",     "salbutamol"),
    ("Spiriva",      "tiotropium"),
]

all_pass = True
for brand, expected in tests:
    result = resolve_to_generic(brand)
    status = "PASS" if result == expected else "FAIL"
    if status == "FAIL":
        all_pass = False
    print(f"  {status}: {brand} -> {result} (expected: {expected})")

print()

print("=" * 60)
print("TEST 2: Margaret Thompson (RxNorm + Reconciliation)")
print("=" * 60)

with open("../data/scenarios/margaret_thompson.json", "r") as f:
    margaret = json.load(f)

results = compare_lists(margaret["home_meds"], margaret["discharge_meds"])
print(f"  Summary: {json.dumps(results['summary'], indent=4)}")
print(f"  RxNorm Mappings: {json.dumps(results['rxnorm_mappings'], indent=4)}")
print(f"  Discrepancies: {json.dumps(results['discrepancies'], indent=4)}")
print(f"  New Meds: {json.dumps(results['new_medications'], indent=4)}")
print(f"  Stopped: {json.dumps(results['stopped_medications'], indent=4)}")
print(f"  Interactions: {json.dumps(results['interactions'], indent=4)}")

# Validate Margaret's results
assert results["summary"]["changed"] == 1, f"Expected 1 changed, got {results['summary']['changed']}"
assert results["summary"]["continued"] == 1, f"Expected 1 continued, got {results['summary']['continued']}"
assert results["summary"]["stopped"] == 1, f"Expected 1 stopped, got {results['summary']['stopped']}"
assert results["summary"]["new"] == 1, f"Expected 1 new, got {results['summary']['new']}"
assert len(results["rxnorm_mappings"]) > 0, "Expected RxNorm mapping for Lipitor"

print("\n  Margaret Thompson: ALL ASSERTIONS PASSED")

print()
print("=" * 60)
print("TEST 3: DDInter Interaction Check")
print("=" * 60)

# Check Margaret's discharge meds for interactions
# Her discharge has: Atorvastatin, Metformin, Warfarin
interactions = check_interactions(["Atorvastatin", "Metformin", "Warfarin"])
print(f"  Found {len(interactions)} interaction(s):")
for i in interactions:
    print(f"    {i['severity'].upper()}: {i['drug_a']} + {i['drug_b']} — {i['effect']}")

print()
print("=" * 60)
print("TEST 4: Edward Chen (Case C)")
print("=" * 60)

with open("../data/scenarios/case-c.json", "r") as f:
    edward = json.load(f)

results_c = compare_lists(edward["home_meds"], edward["discharge_meds"])
print(f"  Summary: {json.dumps(results_c['summary'], indent=4)}")
print(f"  Interactions: {json.dumps(results_c['interactions'], indent=4)}")
print(f"  Escalations: {results_c['escalations']}")

# Validate Edward's results  
assert results_c["summary"]["changed"] == 1, f"Expected 1 changed (Prednisolone), got {results_c['summary']['changed']}"
assert results_c["summary"]["new"] == 2, f"Expected 2 new, got {results_c['summary']['new']}"
assert results_c["summary"]["stopped"] == 1, f"Expected 1 stopped (Spiriva), got {results_c['summary']['stopped']}"

print("\n  Edward Chen: ALL ASSERTIONS PASSED")

print()
print("=" * 60)
if all_pass:
    print("ALL TESTS PASSED!")
else:
    print("SOME TESTS FAILED — review output above")
print("=" * 60)
