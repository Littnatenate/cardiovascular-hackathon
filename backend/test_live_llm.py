import asyncio
import sys

# Fix Windows console encoding for emojis
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.llm_client import client, LLM_MODEL, generate_chat_completion

async def test_llm():
    print(f"Testing LLM connection with model: {LLM_MODEL}")
    print(f"Base URL: {client.base_url}")
    
    try:
        response = await generate_chat_completion(
            model=LLM_MODEL,
            messages=[{"role": "user", "content": "Hello! Please reply with exactly: 'MedSafe LLM Integration Successful!'"}]
        )
        print("\nResponse from LLM:")
        print("-" * 40)
        print(response.choices[0].message.content)
        print("-" * 40)
        print("\nTEST PASSED ✅")
    except Exception as e:
        print(f"\nTEST FAILED ❌\nError: {e}")

if __name__ == "__main__":
    asyncio.run(test_llm())
