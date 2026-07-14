from typing import List, Dict, Any, Optional
import json

class RepositoryContextBuilder:
    """
    Compresses raw repository files, tree structure, languages, health metrics, 
    and readme into a token-efficient structured markdown block for the LLM.
    """
    
    @staticmethod
    def build_context(
        owner: str,
        repo: str,
        flat_tree: List[Dict[str, Any]],
        readme_content: Optional[str],
        languages: Dict[str, float] = None,
        health_metrics: Dict[str, Any] = None,
        dependencies: List[Dict[str, Any]] = None
    ) -> str:
        # 1. Basic Metadata
        metadata = [
            f"Repository: {owner}/{repo}",
            f"Languages: {', '.join(f'{k} ({v}%)' for k, v in (languages or {}).items())}",
            f"Primary Dependencies: {', '.join(d['name'] for d in (dependencies or [])[:15])}"
        ]
        
        # 2. Folder structure / File list (compressed)
        # Sort paths to keep them logical, limit to 120 key files to keep context token-friendly
        paths = sorted([node["path"] for node in flat_tree if node["type"] == "blob"])
        if len(paths) > 120:
            # Prioritize source/config/documentation files, exclude common binary or lock files
            filtered_paths = [
                p for p in paths 
                if not any(exclude in p.lower() for exclude in ["node_modules", ".git", "package-lock", "yarn.lock", "pnpm-lock", ".png", ".jpg", ".jpeg", ".gif", ".ico"])
            ]
            if len(filtered_paths) > 120:
                paths_summary = filtered_paths[:110] + [f"... and {len(filtered_paths) - 110} more files."]
            else:
                paths_summary = filtered_paths
        else:
            paths_summary = paths
            
        tree_section = "\n".join(f"- {p}" for p in paths_summary)
        
        # 3. Readme snippet (limit to first 4000 characters to protect context length)
        readme_snippet = readme_content or "No README.md content available."
        if len(readme_snippet) > 4000:
            readme_snippet = readme_snippet[:4000] + "\n\n[... README content truncated for token limits ...]"
            
        # 4. Formatted Context Block
        context_parts = [
            "### REPOSITORY METADATA",
            "\n".join(metadata),
            "",
            "### REPOSITORY FILE TREE (KEY FILES)",
            tree_section,
            "",
            "### REPOSITORY README CONTENT (TRUNCATED)",
            readme_snippet,
            ""
        ]
        
        if health_metrics:
            context_parts.extend([
                "### STATIC QUALITY METRICS",
                json.dumps(health_metrics, indent=2),
                ""
            ])
            
        return "\n".join(context_parts)
