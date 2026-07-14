import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

class Settings:
    GITHUB_TOKEN: str = os.getenv("GITHUB_TOKEN", "")
    CACHE_LIFETIME_DAYS: int = int(os.getenv("CACHE_LIFETIME_DAYS", "1"))
    PROJECT_NAME: str = "DevPilot AI GitHub Intelligence Engine"

settings = Settings()
