import asyncio
import os
from openai import AsyncOpenAI

async def test_lm_studio():
    print("[TEST] Testing connection to LM Studio...")
    
    # Defaults from our new config
    base_url = "http://127.0.0.1:1234/v1"
    model = "qwen/qwen3.5-9b" 
    
    client = AsyncOpenAI(base_url=base_url, api_key="lm-studio")
    
    try:
        print(f"[API] Sending test prompt to '{model}' at {base_url}...")
        response = await client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You are a helpful medical assistant."},
                {"role": "user", "content": "Say 'Hello, MedSafe system is ready!' in a friendly way."}
            ],
            timeout=120.0
        )
        import re
        content = response.choices[0].message.content
        # Strip thinking blocks
        content = re.sub(r'<think>.*?</think>', '', content, flags=re.DOTALL)
        content = re.sub(r'(?i)Thinking Process:.*?(?=\n\n|\n#|$)', '', content, flags=re.DOTALL)
        
        # Handle Windows terminal emoji crashing
        safe_response = content.encode('cp1252', errors='replace').decode('cp1252')
        print(safe_response)
        print(f"---\n")
        print("Your Local AI bridge is perfectly configured.")
        
    except Exception as e:
        print(f"\n[ERROR] CONNECTION ERROR: {e}")
        print("\nChecklist:")
        print("1. Is LM Studio open?")
        print("2. Is the 'Local Server' started (port 1234)?")
        print("3. Check the logs in LM Studio to see if it received the request.")

if __name__ == "__main__":
    asyncio.run(test_lm_studio())
