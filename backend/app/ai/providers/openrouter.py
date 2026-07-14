import os
import httpx
from fastapi import HTTPException
from .base import BaseAIProvider

class OpenRouterProvider(BaseAIProvider):
    """
    AI Provider implementation using OpenRouter supporting free models like google/gemini-2.0-flash-exp:free.
    """
    
    def __init__(self):
        self.model = "google/gemini-2.0-flash-exp:free"
        self.base_url = "https://openrouter.ai/api/v1"
        
    async def generate(self, prompt: str, system_instruction: str = None, api_key: str = None) -> str:
        resolved_key = api_key or os.environ.get("OPENROUTER_API_KEY")
        if not resolved_key:
            raise HTTPException(
                status_code=400,
                detail="OpenRouter API Key is not set. Please set it in Settings > Secrets panel."
            )
            
        url = f"{self.base_url}/chat/completions"
        
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {resolved_key}",
            "HTTP-Referer": "https://github.com/DevPilot-AI",
            "X-Title": "DevPilot-AI"
        }
        
        messages = []
        if system_instruction:
            messages.append({
                "role": "system",
                "content": system_instruction
            })
            
        messages.append({
            "role": "user",
            "content": prompt
        })
        
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": 0.2
        }
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.post(url, headers=headers, json=payload)
                if response.status_code != 200:
                    error_detail = response.text
                    try:
                        error_json = response.json()
                        error_detail = error_json.get("error", {}).get("message", error_detail)
                    except Exception:
                        pass
                    raise HTTPException(
                        status_code=response.status_code,
                        detail=f"OpenRouter API request failed: {error_detail}"
                    )
                    
                data = response.json()
                choices = data.get("choices", [])
                if not choices:
                    raise HTTPException(
                        status_code=500,
                        detail="OpenRouter API returned an empty response. Please verify the prompt context."
                    )
                    
                text = choices[0].get("message", {}).get("content", "")
                return text
                
            except httpx.RequestError as e:
                raise HTTPException(
                    status_code=503,
                    detail=f"Unable to reach OpenRouter API: {str(e)}"
                )
