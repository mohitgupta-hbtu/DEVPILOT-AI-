import datetime
import asyncio
from fastapi import APIRouter, HTTPException
from app.api.schemas.analysis import AnalyzeRequest, AnalyzeResponse
from app.api.services.github.service import github_service
from app.api.services.analysis.engine import repository_analyzer

router = APIRouter()

# Simple in-memory cache to store analyzed repository data
# Key: repo_url.lower(), Value: (timestamp, analyzed_data_dict)
ANALYSIS_CACHE = {}
CACHE_LIFETIME_HOURS = 24

def get_cached_analysis(url: str):
    """
    Retrieves analysis from cache if it exists and is not expired.
    """
    key = url.strip().lower()
    if key in ANALYSIS_CACHE:
        timestamp, data = ANALYSIS_CACHE[key]
        age = datetime.datetime.now() - timestamp
        if age < datetime.timedelta(hours=CACHE_LIFETIME_HOURS):
            print(f"Cache HIT for URL: {url}")
            return data
        else:
            print(f"Cache EXPIRED for URL: {url}")
            del ANALYSIS_CACHE[key]
    return None

def set_cached_analysis(url: str, data: dict):
    """
    Stores analysis in cache.
    """
    key = url.strip().lower()
    ANALYSIS_CACHE[key] = (datetime.datetime.now(), data)

@router.post("/analyze", response_model=AnalyzeResponse)
async def analyze_repository(request: AnalyzeRequest):
    repo_url = request.repositoryUrl.strip()
    github_token = request.githubToken
    
    # 1. Parse and validate GitHub URL
    owner, repo = github_service.parse_github_url(repo_url)
    
    # 2. Check Cache
    cached_data = get_cached_analysis(repo_url)
    if cached_data:
        return cached_data

    # 3. Fetch Repository General Info, languages, and readme in parallel
    print(f"Starting fetch for {owner}/{repo} (metadata, languages, readme)")
    meta_task = github_service.fetch_repository_metadata(owner, repo, token=github_token)
    lang_task = github_service.fetch_languages(owner, repo, token=github_token)
    readme_task = github_service.fetch_readme(owner, repo, token=github_token)
    
    repo_info, languages, readme_text = await asyncio.gather(meta_task, lang_task, readme_task)
    default_branch = repo_info.get("default_branch", "main")
    
    # 4. Fetch flat tree
    flat_tree = await github_service.fetch_file_tree_flat(owner, repo, default_branch, token=github_token)

    # 5. Run static analysis
    analysis = await repository_analyzer.analyze_repo(
        owner=owner,
        repo=repo,
        default_branch=default_branch,
        flat_tree=flat_tree,
        readme_content=readme_text,
        api_key=request.geminiApiKey,
        openrouter_key=request.openrouterApiKey,
        github_token=github_token
    )

    # 6. Build hierarchical tree structure
    folder_structure = github_service.build_hierarchical_tree(flat_tree, repo)

    # 7. Construct final response mapping
    response_payload = {
        "summary": {
            "description": repo_info.get("description") or "No description available.",
            "stars": repo_info.get("stargazers_count", 0),
            "forks": repo_info.get("forks_count", 0),
            "techStack": analysis["techStack"],
            "techStackDetails": analysis.get("techStackDetails", []),
            "metadataAnalysis": analysis.get("metadataAnalysis", {}),
            "learningComplexity": analysis.get("learningComplexity", {}),
            "entryPoints": analysis["entryPoints"],
            "suggestedStartingFolders": analysis["suggestedStartingFolders"]
        },
        "repository": {
            "name": repo_info.get("name", repo),
            "description": repo_info.get("description") or "No description available.",
            "stars": repo_info.get("stargazers_count", 0),
            "forks": repo_info.get("forks_count", 0),
            "openIssues": repo_info.get("open_issues_count", 0),
            "watchers": repo_info.get("watchers_count", 0),
            "license": repo_info.get("license", {}).get("name") if repo_info.get("license") else "None",
            "createdDate": repo_info.get("created_at", ""),
            "updatedDate": repo_info.get("updated_at", ""),
            "defaultBranch": default_branch,
            "language": repo_info.get("language") or "None",
            "topics": repo_info.get("topics") or [],
            "owner": owner,
            "avatar": repo_info.get("owner", {}).get("avatar_url", ""),
            "homepage": repo_info.get("homepage") or ""
        },
        "languages": languages,
        "topics": repo_info.get("topics") or [],
        "readme": readme_text,
        "health": {
            "healthScore": analysis["health"]["healthScore"],
            "overallHealth": analysis["health"].get("overallHealth", {}),
            "metricsDetails": analysis["health"].get("metricsDetails", {}),
            "metrics": analysis["health"]["metrics"],
            "recommendations": analysis["health"].get("recommendations", []),
            "explanations": analysis["health"].get("explanations", {})
        },
        "roadmap": analysis["roadmap"],
        "journey": analysis.get("journey", {}),
        "developerTier": analysis.get("developerTier", {}),
        "terminalCommands": analysis.get("terminalCommands", []),
        "goodFirstIssues": analysis["goodFirstIssues"],
        "projectContributionGuide": analysis.get("projectContributionGuide", {}),
        "localSetup": analysis.get("localSetup", {}),
        "architecture": {
            "folderStructure": folder_structure,
            "entryPoints": analysis["entryPoints"],
            "suggestedStartingFolders": analysis["suggestedStartingFolders"],
            "dependencies": analysis["dependencies"],
            "architectureNotes": analysis.get("architectureNotes", [])
        }
    }

    # 8. Cache response payload
    set_cached_analysis(repo_url, response_payload)

    return response_payload
