# Team Collaboration Guide

Welcome to the Team! Here is how we work together using this project structure.

## 1. Branching Strategy
*   **main**: Always keep this branch "deployable" (no broken code).
*   **feat/xx** or **fix/xx**: Create a new branch for every task.
    *   Example: `git checkout -b feat/login-ui`
*   **Pull Requests**: Merge your code into `main` via a Pull Request. Have at least one other teammate "LGTM" (Looks Good To Me) your code.

## 2. Directory Separation
*   **Frontend Developers**: Work in `frontend/`.
*   **Backend Developers**: Work in `backend/`.
*   **AI/Prompt Engineers**: Work in `prompts/` and `backend/app/services/`.

## 3. Communication
*   Agree on the **API Contract** (`docs/api-contract.md`) before starting frontend/backend integration.
*   Document major changes in the `docs/` folder.

## 4. Environment Variables
1. Copy `.env.example` to `.env`.
2. Add your own API keys.
3. **NEVER** commit `.env` to GitHub.
