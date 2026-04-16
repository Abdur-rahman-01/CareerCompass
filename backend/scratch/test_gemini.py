
import os
import asyncio
from litellm import completion
from dotenv import load_dotenv

load_dotenv()

async def test_gemini():
    api_key = os.environ.get("GEMINI_API_KEY")
    print(f"Testing with API Key: {api_key[:10]}...")
    
    prompt = "Return a JSON object with one key 'status' and value 'ok'. Return ONLY JSON."
    
    try:
        response = completion(
            model="gemini/gemini-2.0-flash",
            messages=[{"role": "user", "content": prompt}],
            api_key=api_key,
            response_format={ "type": "json_object" }
        )
        print("Response received:")
        print(response.choices[0].message.content)
    except Exception as e:
        print(f"Error during Gemini call: {e}")

if __name__ == "__main__":
    asyncio.run(test_gemini())
