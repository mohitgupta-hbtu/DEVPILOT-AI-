import os
from .base import BaseAIProvider
from .gemini import GeminiProvider

def get_provider() -> BaseAIProvider:
    """
    Factory function to retrieve the configured AI provider.
    Defaults to GeminiProvider, but designed to easily swap in other providers.
    """
    # Read environment variable to determine provider (default to gemini)
    provider_name = os.environ.get("AI_PROVIDER", "gemini").lower()
    
    if provider_name == "gemini":
        return GeminiProvider()
    else:
        # Fallback to gemini if unknown
        return GeminiProvider()
