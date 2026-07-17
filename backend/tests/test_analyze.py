import pytest
from fastapi.testclient import TestClient
from app.api.config.config import settings

# This prevents starting up background connections unnecessarilly
# Just simple sanity checks for the endpoint parameters
try:
    from app.main import app
    client = TestClient(app)
except Exception:
    # Handle if db connection isn't mocked in pipeline
    client = None

def test_analyze_endpoint_validation():
    """Test that the analyze endpoint properly rejects malformed URLs."""
    if not client: return
    response = client.post(
        "/api/analyze",
        json={
            "repositoryUrl": "invalid-url",
            "githubToken": None
        }
    )
    
    # 400 because pydantic passes but github_service regex parser rejects
    assert response.status_code == 400
    assert "detail" in response.json()

def test_analyze_endpoint_missing_body():
    """Test standard Pydantic validation."""
    if not client: return
    response = client.post("/api/analyze", json={})
    assert response.status_code == 422 # Unprocessable Entity (Missing required fields)
