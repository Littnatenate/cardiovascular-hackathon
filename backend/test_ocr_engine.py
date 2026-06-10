import asyncio
import sys

# Fix Windows console encoding
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from app.services.ocr_engine import simulate_ocr

async def test_ocr():
    print("Testing OCR with Gemini Vision API...")
    try:
        results = await simulate_ocr("dummy-blob-or-url")
        print("\nExtracted Data:")
        print("-" * 40)
        print(results)
        print("-" * 40)
        print("\nTEST PASSED ✅")
    except Exception as e:
        print(f"\nTEST FAILED ❌\nError: {e}")

if __name__ == "__main__":
    asyncio.run(test_ocr())
