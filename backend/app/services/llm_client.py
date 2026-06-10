import os
from openai import AsyncOpenAI

def load_env():
    """Manually load .env from the project root if it exists."""
    root_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", ".."))
    env_path = os.path.join(root_dir, ".env")
    if os.path.exists(env_path):
        with open(env_path, "r", encoding="utf-8") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#"):
                    if "=" in line:
                        key, val = line.split("=", 1)
                        os.environ[key.strip()] = val.strip()

# Load env variables right at import
load_env()

# Determine which API to use based on available keys
def get_llm_config():
    gemini_key = os.getenv("GEMINI_API_KEY")
    openai_key = os.getenv("OPENAI_API_KEY")
    
    # Check Gemini first
    if gemini_key:
        print("[LLM Client] Detected GEMINI_API_KEY. Using Gemini via OpenAI SDK compatibility.")
        return {
            "base_url": "https://generativelanguage.googleapis.com/v1beta/openai/",
            "api_key": gemini_key,
            "model": "gemini-3.5-flash",
            "provider": "gemini"
        }
    
    # Check OpenAI
    if openai_key:
        print("[LLM Client] Detected OPENAI_API_KEY. Using OpenAI.")
        return {
            "base_url": "https://api.openai.com/v1",
            "api_key": openai_key,
            "model": "gpt-4o-mini",
            "provider": "openai"
        }
    
    # Fallback to local model / LM Studio
    local_url = os.getenv("MEDSAFE_LLM_BASE_URL") or os.getenv("LLM_BASE_URL") or "http://127.0.0.1:1234/v1"
    local_key = os.getenv("MEDSAFE_LLM_API_KEY") or os.getenv("LLM_API_KEY") or "lm-studio"
    local_model = os.getenv("MEDSAFE_LLM_MODEL") or os.getenv("LLM_MODEL") or "qwen/qwen3.5-9b"
    
    print(f"[LLM Client] Using local model fallback at {local_url} (model: {local_model})")
    return {
        "base_url": local_url,
        "api_key": local_key,
        "model": local_model,
        "provider": "local"
    }

config = get_llm_config()

LLM_BASE_URL = config["base_url"]
LLM_API_KEY = config["api_key"]
LLM_MODEL = config["model"]

import asyncio
client = AsyncOpenAI(base_url=LLM_BASE_URL, api_key=LLM_API_KEY)

async def generate_chat_completion(max_retries=4, base_delay=2, **kwargs):
    """
    Wraps the chat.completions.create call with an exponential backoff 
    retry mechanism to handle 503 High Demand or 429 Too Many Requests errors.
    """
    for attempt in range(max_retries):
        try:
            response = await client.chat.completions.create(**kwargs)
            return response
        except Exception as e:
            if attempt == max_retries - 1:
                print(f"[LLM Client] Max retries reached. Final error: {e}")
                raise e
            
            error_msg = str(e).lower()
            if "503" in error_msg or "429" in error_msg or "high demand" in error_msg or "too many requests" in error_msg or "service unavailable" in error_msg:
                delay = base_delay * (2 ** attempt)
                print(f"[LLM Client] API overloaded ({e}). Retrying in {delay} seconds (Attempt {attempt + 1}/{max_retries})...")
                await asyncio.sleep(delay)
            else:
                raise e
