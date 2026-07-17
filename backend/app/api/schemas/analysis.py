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
    overallHealth: Optional[Dict[str, Any]] = None
    metricsDetails: Optional[Dict[str, Any]] = None
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
    reason: Optional[str] = None
    relatedFiles: Optional[List[str]] = None
    implementationGuide: Optional[Dict[str, Any]] = None

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
    journey: Optional[Dict[str, Any]] = None
    developerTier: Optional[Dict[str, Any]] = None
    terminalCommands: Optional[List[Dict[str, Any]]] = None
    goodFirstIssues: List[GoodFirstIssueItem]
    projectContributionGuide: Optional[Dict[str, Any]] = None
    localSetup: Optional[Dict[str, Any]] = None
    architecture: Dict[str, Any]
