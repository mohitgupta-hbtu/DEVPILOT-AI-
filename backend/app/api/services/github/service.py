import re
import base64
import httpx
from fastapi import HTTPException
from typing import Dict, Any, List, Tuple, Optional
from app.api.config.config import settings

class GitHubService:
    def __init__(self):
        # Cache for languages colors
        self.language_colors = {
            "TypeScript": "#3178c6",
            "JavaScript": "#f1e05a",
            "Python": "#3572A5",
            "Rust": "#dea584",
            "C++": "#f34b7d",
            "C": "#555555",
            "Go": "#00ADD8",
            "Ruby": "#701516",
            "Java": "#b07219",
            "C#": "#178600",
            "CSS": "#563d7c",
            "HTML": "#e34c26",
            "Shell": "#89e051",
            "Vue": "#41b883",
            "PHP": "#4F5D95",
            "Kotlin": "#A97BFF",
            "Swift": "#F05138"
        }

    def parse_github_url(self, url: str) -> Tuple[str, str]:
        """
        Validates GitHub URL and extracts (owner, repo).
        Rejects non-github, invalid or malformed urls.
        """
        url = url.strip()
        if not url:
            raise HTTPException(status_code=400, detail="Repository URL cannot be empty.")

        # Clean URL (remove trailing slashes, .git extensions etc.)
        url_clean = re.sub(r"\.git$", "", url)
        url_clean = url_clean.rstrip("/")

        # Check for other platforms
        if "gitlab.com" in url_clean.lower():
            raise HTTPException(status_code=400, detail="GitLab repositories are not supported.")
        if "bitbucket.org" in url_clean.lower():
            raise HTTPException(status_code=400, detail="BitBucket repositories are not supported.")
        if "github.com" not in url_clean.lower() and not re.match(r"^[a-zA-Z0-9_\-\.]+/[a-zA-Z0-9_\-\.]+$", url_clean):
            raise HTTPException(status_code=400, detail="Please provide a valid public GitHub URL.")

        # Extract owner and repo
        # Match standard patterns like:
        # https://github.com/owner/repo
        # http://github.com/owner/repo
        # github.com/owner/repo
        # owner/repo
        match = re.search(r"(?:github\.com/|^)([a-zA-Z0-9_\-\.]+)/([a-zA-Z0-9_\-\.]+)", url_clean, re.IGNORECASE)
        if not match:
            raise HTTPException(status_code=400, detail="Could not parse owner and repository name from the provided URL.")

        owner, repo = match.groups()
        return owner, repo

    def _get_headers(self, custom_token: Optional[str] = None) -> Dict[str, str]:
        headers = {
            "Accept": "application/vnd.github.v3+json",
            "User-Agent": "DevPilot-AI-Engine"
        }
        token = custom_token or settings.GITHUB_TOKEN
        if token:
            headers["Authorization"] = f"token {token}"
        return headers

    async def fetch_repository_metadata(self, owner: str, repo: str, token: Optional[str] = None) -> Dict[str, Any]:
        """
        Fetches repository information directly from the GitHub API.
        """
        url = f"https://api.github.com/repos/{owner}/{repo}"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(token))
                if response.status_code == 404:
                    raise HTTPException(status_code=404, detail=f"GitHub repository '{owner}/{repo}' not found. Make sure it is public.")
                elif response.status_code in [403, 429]:
                    # Rate limit or access issue
                    rate_limit_reset = response.headers.get("X-RateLimit-Reset", "unknown")
                    raise HTTPException(
                        status_code=403, 
                        detail=f"Access forbidden or GitHub API rate limit exceeded. Reset at {rate_limit_reset}. Consider adding GITHUB_TOKEN."
                    )
                elif response.status_code != 200:
                    raise HTTPException(status_code=response.status_code, detail=f"GitHub API returned error: {response.text}")
                
                return response.json()
            except httpx.RequestError as exc:
                raise HTTPException(status_code=502, detail=f"Network error while connecting to GitHub: {str(exc)}")

    async def fetch_languages(self, owner: str, repo: str, token: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Fetches the repository's programming languages and builds percentages.
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/languages"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(token))
                if response.status_code != 200:
                    return []
                
                lang_data = response.json()
                total_bytes = sum(lang_data.values())
                
                if total_bytes == 0:
                    return []

                languages_list = []
                for name, num_bytes in lang_data.items():
                    percentage = round((num_bytes / total_bytes) * 100, 1)
                    color = self.language_colors.get(name, "#858585")
                    languages_list.append({
                        "name": name,
                        "bytes": num_bytes,
                        "percentage": percentage,
                        "color": color
                    })
                
                # Sort by percentage descending
                languages_list.sort(key=lambda x: x["percentage"], reverse=True)
                return languages_list
            except Exception:
                return []

    async def fetch_readme(self, owner: str, repo: str, token: Optional[str] = None) -> str:
        """
        Fetches the README file from the repository, decoding it from Base64.
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/readme"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(token))
                if response.status_code == 404:
                    return "# README.md\nNo README available for this repository."
                if response.status_code != 200:
                    return "# README.md\nFailed to fetch README."

                data = response.json()
                content_b64 = data.get("content", "")
                encoding = data.get("encoding", "")

                if encoding == "base64" and content_b64:
                    # Clean newlines from base64 string before decoding
                    cleaned_b64 = content_b64.replace("\n", "").replace("\r", "")
                    decoded_bytes = base64.b64decode(cleaned_b64)
                    return decoded_bytes.decode("utf-8", errors="ignore")
                
                return "# README.md\nFailed to parse README content."
            except Exception as e:
                return f"# README.md\nError downloading README: {str(e)}"

    async def fetch_file_tree_flat(self, owner: str, repo: str, default_branch: str, token: Optional[str] = None, max_items: int = 5000) -> List[Dict[str, Any]]:
        """
        Fetches flat list of all files/directories recursively using git trees API.
        Results are capped at max_items to prevent payload bloat for large monorepos.
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/git/trees/{default_branch}?recursive=1"
        async with httpx.AsyncClient(timeout=15.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(token))
                if response.status_code != 200:
                    # Non-recursive fallback if recursive is blocked or failed
                    fallback_url = f"https://api.github.com/repos/{owner}/{repo}/contents"
                    fallback_res = await client.get(fallback_url, headers=self._get_headers(token))
                    if fallback_res.status_code == 200:
                        contents = fallback_res.json()
                        return [{"path": item["path"], "type": "blob" if item["type"] == "file" else "tree"} for item in contents][:max_items]
                    return []
                
                data = response.json()
                tree_nodes = data.get("tree", [])
                if len(tree_nodes) > max_items:
                    print(f"[Performance] Tree for {owner}/{repo} has {len(tree_nodes)} nodes — capping at {max_items}")
                return tree_nodes[:max_items]
            except Exception:
                return []

    def build_hierarchical_tree(self, flat_tree: List[Dict[str, Any]], repo_name: str, max_depth: int = 4, max_nodes: int = 150) -> Dict[str, Any]:
        """
        Builds a structured nested folder tree from flat GitHub path list.
        """
        root = {"name": repo_name, "type": "directory", "children": []}
        
        # Sort paths to process directories before nested files
        sorted_nodes = sorted(flat_tree, key=lambda x: x["path"])
        
        # Keep track of paths to quickly find existing parents
        paths_map = {"": root}
        
        node_count = 0
        for node in sorted_nodes:
            if node_count >= max_nodes:
                break
                
            path = node["path"]
            type_str = "directory" if node["type"] == "tree" else "file"
            
            # Check depth by counting slashes
            depth = path.count("/")
            if depth >= max_depth:
                continue
                
            parts = path.split("/")
            parent_path = "/".join(parts[:-1])
            name = parts[-1]
            
            # Skip hidden files or folders (like .git, .github/workflows is okay, but .next, .cache etc.)
            if name.startswith(".") and name not in [".gitignore", ".env", ".devpilot", ".prettierrc", ".github"]:
                continue

            new_node = {"name": name, "type": type_str}
            if type_str == "directory":
                new_node["children"] = []
                
            if parent_path in paths_map:
                parent = paths_map[parent_path]
                if "children" not in parent:
                    parent["children"] = []
                parent["children"].append(new_node)
                node_count += 1
                
                if type_str == "directory":
                    paths_map[path] = new_node
                    
        return root

    async def fetch_raw_file(self, owner: str, repo: str, path: str, ref: str, token: Optional[str] = None) -> Optional[str]:
        """
        Fetches the raw content of a specific file from the repository.
        """
        url = f"https://api.github.com/repos/{owner}/{repo}/contents/{path}?ref={ref}"
        async with httpx.AsyncClient(timeout=10.0) as client:
            try:
                response = await client.get(url, headers=self._get_headers(token))
                if response.status_code == 200:
                    data = response.json()
                    content_b64 = data.get("content", "")
                    encoding = data.get("encoding", "")
                    if encoding == "base64" and content_b64:
                        cleaned_b64 = content_b64.replace("\n", "").replace("\r", "")
                        return base64.b64decode(cleaned_b64).decode("utf-8", errors="ignore")
                return None
            except Exception:
                return None

github_service = GitHubService()
