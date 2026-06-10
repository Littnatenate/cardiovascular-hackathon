import os
import sqlite3
import json
from datetime import datetime
from typing import List, Dict, Any, Optional

DB_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "data"))
DB_PATH = os.path.join(DB_DIR, "medsafe.db")

# Mock data to pre-populate database if empty (keeps the app functional on startup)
INITIAL_SESSIONS = [
    {
        "id": "SESSION-1",
        "patient_name": "Tan Ah Kow",
        "patient_id": "S1234567A",
        "ward": "Ward 5A – General Medicine",
        "bed_number": "12A",
        "allergies": ["Penicillin"],
        "discharge_date": datetime.now().strftime("%Y-%m-%d"),
        "status": "in-progress",
        "home_meds": [
            {"id": "h1", "drugName": "Aspirin", "strength": "100mg", "dose": "1 tab", "frequency": "once daily", "source": "admission"},
            {"id": "h2", "drugName": "Metformin", "strength": "500mg", "dose": "1 tab", "frequency": "twice daily", "source": "admission"}
        ],
        "discharge_meds": [
            {"id": "d1", "drugName": "Aspirin", "strength": "100mg", "dose": "1 tab", "frequency": "once daily", "source": "manual"},
            {"id": "d2", "drugName": "Metformin", "strength": "500mg", "dose": "1 tab", "frequency": "twice daily", "source": "manual"}
        ]
    },
    {
        "id": "SESSION-2",
        "patient_name": "Siti Aminah",
        "patient_id": "S7654321B",
        "ward": "Ward 6A – Cardiology",
        "bed_number": "8B",
        "allergies": [],
        "discharge_date": datetime.now().strftime("%Y-%m-%d"),
        "status": "completed",
        "home_meds": [],
        "discharge_meds": []
    },
    {
        "id": "SESSION-3",
        "patient_name": "Rajesh Kumar",
        "patient_id": "S9876543C",
        "ward": "Ward 7A – Neurology",
        "bed_number": "3C",
        "allergies": ["Aspirin"],
        "discharge_date": datetime.now().strftime("%Y-%m-%d"),
        "status": "escalated",
        "home_meds": [],
        "discharge_meds": []
    }
]

def get_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes the SQLite database schema and pre-populates it if empty."""
    os.makedirs(DB_DIR, exist_ok=True)
    
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                patient_name TEXT NOT NULL,
                patient_id TEXT NOT NULL,
                ward TEXT,
                bed_number TEXT,
                allergies TEXT, -- JSON array of strings
                discharge_date TEXT,
                status TEXT NOT NULL DEFAULT 'in-progress',
                created_at TEXT NOT NULL,
                updated_at TEXT NOT NULL,
                home_meds TEXT, -- JSON array of medications
                discharge_meds TEXT, -- JSON array of medications
                reconciliation_results TEXT, -- JSON of analysis results
                patient_education TEXT, -- Markdown
                whatsapp_summary TEXT -- String
            )
        """)
        
        # Check if database is empty
        cursor = conn.cursor()
        cursor.execute("SELECT COUNT(*) FROM sessions")
        if cursor.fetchone()[0] == 0:
            print("[Database] Pre-populating database with initial sessions...")
            for session in INITIAL_SESSIONS:
                now_str = datetime.now().isoformat()
                conn.execute("""
                    INSERT INTO sessions (
                        id, patient_name, patient_id, ward, bed_number, allergies, 
                        discharge_date, status, created_at, updated_at, home_meds, discharge_meds
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    session["id"],
                    session["patient_name"],
                    session["patient_id"],
                    session["ward"],
                    session["bed_number"],
                    json.dumps(session["allergies"]),
                    session["discharge_date"],
                    session["status"],
                    now_str,
                    now_str,
                    json.dumps(session.get("home_meds", [])),
                    json.dumps(session.get("discharge_meds", []))
                ))
            conn.commit()

# Run database setup on module import
init_db()

def serialize_row(row) -> Dict[str, Any]:
    if not row:
        return {}
    d = dict(row)
    # Parse JSON fields
    for field in ["allergies", "home_meds", "discharge_meds", "reconciliation_results"]:
        if d.get(field):
            try:
                d[field] = json.loads(d[field])
            except Exception:
                d[field] = [] if field != "reconciliation_results" else {}
        else:
            d[field] = [] if field != "reconciliation_results" else {}
    return d

def get_all_sessions() -> List[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.execute("SELECT * FROM sessions ORDER BY updated_at DESC")
        return [serialize_row(row) for row in cursor.fetchall()]

def get_session_by_id(session_id: str) -> Optional[Dict[str, Any]]:
    with get_connection() as conn:
        cursor = conn.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
        row = cursor.fetchone()
        return serialize_row(row) if row else None

def create_session(data: Dict[str, Any]) -> Dict[str, Any]:
    session_id = data.get("id") or f"SESSION-{int(datetime.now().timestamp() * 1000)}"
    patient_name = data.get("patient_name", "Unknown Patient")
    patient_id = data.get("patient_id", "N/A")
    ward = data.get("ward")
    bed_number = data.get("bed_number")
    allergies = data.get("allergies") or []
    discharge_date = data.get("discharge_date") or datetime.now().strftime("%Y-%m-%d")
    status = data.get("status", "in-progress")
    
    now_str = datetime.now().isoformat()
    
    with get_connection() as conn:
        conn.execute("""
            INSERT INTO sessions (
                id, patient_name, patient_id, ward, bed_number, allergies, 
                discharge_date, status, created_at, updated_at, home_meds, 
                discharge_meds, reconciliation_results, patient_education, whatsapp_summary
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            session_id,
            patient_name,
            patient_id,
            ward,
            bed_number,
            json.dumps(allergies),
            discharge_date,
            status,
            now_str,
            now_str,
            json.dumps(data.get("home_meds", [])),
            json.dumps(data.get("discharge_meds", [])),
            json.dumps(data.get("reconciliation_results", {})),
            data.get("patient_education", ""),
            data.get("whatsapp_summary", "")
        ))
        conn.commit()
        
    return get_session_by_id(session_id)

def update_session(session_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    session = get_session_by_id(session_id)
    if not session:
        return None
        
    now_str = datetime.now().isoformat()
    updates["updated_at"] = now_str
    
    # Construct update query dynamically
    fields = []
    values = []
    
    for key, val in updates.items():
        if key in ["patient_name", "patient_id", "ward", "bed_number", "discharge_date", "status", "patient_education", "whatsapp_summary", "updated_at"]:
            fields.append(f"{key} = ?")
            values.append(val)
        elif key in ["allergies", "home_meds", "discharge_meds", "reconciliation_results"]:
            fields.append(f"{key} = ?")
            values.append(json.dumps(val))
            
    if not fields:
        return session
        
    values.append(session_id)
    query = f"UPDATE sessions SET {', '.join(fields)} WHERE id = ?"
    
    with get_connection() as conn:
        conn.execute(query, tuple(values))
        conn.commit()
        
    return get_session_by_id(session_id)

def delete_session(session_id: str) -> bool:
    with get_connection() as conn:
        cursor = conn.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
        conn.commit()
        return cursor.rowcount > 0
