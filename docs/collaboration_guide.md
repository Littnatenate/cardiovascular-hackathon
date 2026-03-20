# Team Collaboration Guide

Welcome to the Team! Here is how we work together using this project structure.

## 1. Branching Strategy
*   **main**: Always keep this branch "deployable" (no broken code).
*   **feat/xx** or **fix/xx**: Create a new branch for every task.
    *   Example: `git checkout -b feat/login-ui`
*   **Pull Requests**: Merge your code into `main` via a Pull Request. Have at least one other teammate "LGTM" (Looks Good To Me) your code.

## 2. Directory Separation
*   **Frontend Developers**: Work in `frontend/`
*   **Backend Developers**: Work in `backend/`
*   **AI/Prompt Engineers**: Work in `prompts/` and `backend/app/services/`

## 3. Communication
*   Agree on the **API Contract** (`docs/api-contract.md`) before starting frontend/backend integration.
*   Document major changes in the `docs/` folder.

## 4. Environment Variables
1. Copy `.env.example` to `.env`.
2. Add your own API keys.
3. **NEVER** commit `.env` to GitHub.

---

## ⚡ AI Integration Changes (March 20, 2026)

### What Nathan's Branch (`LebronJames`) Changed

The AI backend is now **fully functional**. Here's what was added/modified:

### Backend (DO NOT TOUCH — Nathan's territory)
| File | What It Does |
|------|-------------|
| `backend/app/services/safety_engine.py` | The AI brain — RxNorm + DDInter drug checking |
| `backend/app/api/med_recon.py` | The `/reconcile` API endpoint |
| `data/mappings/rxnorm.json` | Brand-to-Generic drug mapping (34 pairs) |
| `data/mappings/ddinter_blood.json` | Blood interaction database (10 pairs) |
| `data/mappings/ddinter_stomach.json` | Stomach interaction database (7 pairs) |

### Frontend (SHARED — coordinate before editing)
| File | What Changed | Safe to Restyle? |
|------|-------------|-----------------|
| `components/med-entry/home-meds-entry.tsx` | Added `localStorage` save/load | ✅ Yes — don't remove `useEffect` hooks |
| `components/discharge-meds/discharge-meds-screen.tsx` | Full rewrite with inline forms + persistence | ✅ Yes — don't remove `useEffect` hooks |
| `app/medication-review/page.tsx` | Loads real data + calls AI backend | ✅ Yes — don't remove `handleRunAnalysis` |
| `components/med-reconcile/comparison-results.tsx` | Reads AI results from `localStorage` | ✅ Yes — don't remove the `useEffect` |
| `components/new-session-form.tsx` | Clears old data on "New Session" | ✅ Yes |
| `components/ocr-review/photo-capture-ocr-screen.tsx` | Persists scanned meds to `localStorage` | ✅ Yes |
| `lib/api.ts` | API client for Python backend | ⛔ Don't change |

### How Data Flows Now
```
New Session → clears localStorage
    ↓
Home Meds → saves to localStorage("medrecon_home_list")
    ↓
Discharge Meds → saves to localStorage("medrecon_discharge_list")
    ↓
Review Screen → loads BOTH lists from localStorage
    ↓
"Run AI Comparison" → sends to Python backend → RxNorm + DDInter
    ↓
Results Screen → reads from localStorage("recon_results")
```

### Key Rule for the UI Dev
> **You can freely change CSS, layouts, colors, and component structure.**
> Just don't remove the `useEffect` hooks or the `localStorage` calls — those are the "wires" connecting the AI.
