import os
import httpx
from fastapi import HTTPException
from .base import BaseAIProvider

class GeminiProvider(BaseAIProvider):
    """
    Implementation of BaseAIProvider using the Google Gemini API.
    Uses 'gemini-3.5-flash' for basic and structured text generation tasks.
    """
    
    def __init__(self):
        self.model = "gemini-2.0-flash"
        self.base_url = "https://generativelanguage.googleapis.com/v1beta"
        
    async def generate(self, prompt: str, system_instruction: str = None, api_key: str = None) -> str:
        # Load keys either from user input or server environment
        if api_key:
            keys_to_try = [api_key]
        else:
            env_keys_str = os.environ.get("GEMINI_API_KEY", "")
            # Support comma-separated keys for load balancing / rate limit bypass
            keys_to_try = [k.strip() for k in env_keys_str.split(",") if k.strip()]
            
        if not keys_to_try:
            raise HTTPException(
                status_code=400,
                detail="Gemini API Key is not set. Please set it in Settings > API Keys or set server GEMINI_API_KEY."
            )
            
        headers = {
            "Content-Type": "application/json",
            "User-Agent": "aistudio-build"
        }
        
        # Build contents
        contents = [
            {
                "parts": [
                    {"text": prompt}
                ]
            }
        ]
        
        # Add system instruction if provided
        generation_config = {
            "responseMimeType": "application/json",
            "temperature": 0.2
        }
        
        payload = {
            "contents": contents,
            "generationConfig": generation_config
        }
        
        if system_instruction:
            payload["systemInstruction"] = {
                "parts": [
                    {"text": system_instruction}
                ]
            }
            
        last_exception = None
            
        async with httpx.AsyncClient(timeout=30.0) as client:
            for attempt, current_key in enumerate(keys_to_try):
                url = f"{self.base_url}/models/{self.model}:generateContent?key={current_key}"
                try:
                    response = await client.post(url, headers=headers, json=payload)
                    
                    if response.status_code == 429 and attempt < len(keys_to_try) - 1:
                        # Rate limit hit, let's rotate to the next key in the loop
                        print(f"WARN: Rate limit hit on Key {attempt + 1}. Rotating to next API key...")
                        continue
                        
                    if response.status_code != 200:
                        error_detail = response.text
                        try:
                            error_json = response.json()
                            error_detail = error_json.get("error", {}).get("message", error_detail)
                        except Exception:
                            pass
                        raise HTTPException(
                            status_code=response.status_code,
                            detail=f"Gemini API request failed: {error_detail}"
                        )
                        
                    data = response.json()
                    
                    # Extract text
                    candidates = data.get("candidates", [])
                    if not candidates:
                        raise HTTPException(
                            status_code=500,
                            detail="Gemini API returned an empty response. Please verify the prompt context."
                        )
                        
                    text = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "")
                    return text
                    
                except httpx.RequestError as e:
                    last_exception = e
                    # if network error, try next key if available
                    continue
                    
        # If we exhausted all keys or network failed on all
        if last_exception:
            raise HTTPException(
                status_code=503,
                detail=f"Unable to reach Gemini API after trying all keys: {str(last_exception)}"
            )
        else:
            raise HTTPException(
                status_code=429,
                detail="RATE_LIMIT_EXHAUSTED: All free backend API slots are currently in use. Please generate a personal Gemini API Key at https://aistudio.google.com and save it in the Settings page to continue scanning unlimited repositories."
            )
