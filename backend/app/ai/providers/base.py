import abc

class BaseAIProvider(abc.ABC):
    """
    Abstract Base Class for AI Providers to implement a provider-independent intelligence layer.
    """
    
    @abc.abstractmethod
    async def generate(self, prompt: str, system_instruction: str = None, api_key: str = None) -> str:
        """
        Generates a string response from the underlying LLM.
        """
        pass
