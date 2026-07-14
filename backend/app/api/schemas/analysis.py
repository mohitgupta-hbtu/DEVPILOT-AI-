from pydantic import BaseModel, HttpUrl
from typing import List, Dict, Any, Optional

class AnalyzeRequest(BaseModel):
    repositoryUrl: str
    geminiApiKey: Optional[str] = None
    openrouterApiKey: Optional[str] = None
    githubToken: Optional[str] = None

class LanguageItem(BaseModel):
    name: str
    percentage: float
    color: str
    bytes: Optional[int] = None

class HealthMetrics(BaseModel):
    documentation: int
    codeQuality: int
    maintainability: int
    complexity: int
    testing: int

class HealthResponse(BaseModel):
    healthScore: int
    metrics: HealthMetrics
    recommendations: Optional[List[Dict[str, Any]]] = None
    explanations: Optional[Dict[str, str]] = None

class RoadmapItem(BaseModel):
    id: str
    phase: str
    title: str
    description: str
    estimatedTime: str
    difficulty: str
    items: List[str]

class GoodFirstIssueItem(BaseModel):
    id: str
    title: str
    number: int
    labels: List[str]
    difficulty: str

class FolderNode(BaseModel):
    name: str
    type: str  # "file" or "directory"
    children: Optional[List["FolderNode"]] = None

FolderNode.model_rebuild()

class AnalyzeResponse(BaseModel):
    summary: Dict[str, Any]
    repository: Dict[str, Any]
    languages: List[LanguageItem]
    topics: List[str]
    readme: str
    health: HealthResponse
    roadmap: List[RoadmapItem]
    goodFirstIssues: List[GoodFirstIssueItem]
    architecture: Dict[str, Any]
