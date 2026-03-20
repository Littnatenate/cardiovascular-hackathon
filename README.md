# MedSafe Discharge Tool

Welcome to the **MedSafe Discharge Tool** repository! This project is designed for medical professionals to streamline medication reconciliation for patients leaving hospital care.

## 🚀 Getting Started

### 1. Prerequisites
- Python 3.11+
- Node.js 18+

### 2. Setup
1. **Clone the repo**
2. **Backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   uvicorn app.main:app --reload
   ```
3. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 📂 Project Structure
- `frontend/`: React/Vite web application.
- `backend/`: FastAPI server and business logic.
- `data/`: Datasets and scenario JSONs.
- `docs/`: Product specs and workflows.
- `prompts/`: LLM prompt templates.

## 👥 Collaboration
Please read the [Collaboration Guide](docs/collaboration_guide.md) before contributing!
