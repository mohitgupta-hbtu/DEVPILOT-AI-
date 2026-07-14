from __future__ import annotations

import os
import asyncio
from typing import Dict, Any, List, Optional

from .context import RepositoryContextBuilder
from .providers import get_provider
from .engines import parse_json_from_response
from ..api.services.github.service import github_service
from ..api.services.analysis.engine import repository_analyzer


async def _noop() -> None:
    return None


class MentorContext:
    """Cached repository context + lightweight summary for the Mentor chat.

    Built once per repo so the large tree/README is never resent on every chat
    request. The chat endpoint only carries the question + short history.
    """

    def __init__(self, context: str, summary: Dict[str, Any]):
        self.context = context
        self.summary = summary


class RepositoryMentor:
    """Answers natural-language questions about a repository using its context.

    Extension points (prepared, not implemented): a vector/embeddings store can
    replace the flat `context` string for retrieval-augmented answers, and
    per-user conversation transcripts can be persisted via the reserved
    `ai_sessions` table. The chat endpoint already forwards history for that.
    """

    def __init__(self):
        self.provider = get_provider()
        self.prompt_dir = os.path.join(os.path.dirname(__file__), "prompts")
        self._cache: Dict[str, MentorContext] = {}

    def _read_prompt_template(self, name: str) -> str:
        with open(os.path.join(self.prompt_dir, f"{name}.md"), "r", encoding="utf-8") as f:
            return f.read()

    async def load_context(self, owner: str, repo: str) -> MentorContext:
        key = f"{owner.lower()}/{repo.lower()}"
        if key in self._cache:
            return self._cache[key]

        repo_info = await github_service.fetch_repository_metadata(owner, repo)
        default_branch = repo_info.get("default_branch", "main")
        languages, readme_text, flat_tree = await asyncio.gather(
            github_service.fetch_languages(owner, repo),
            github_service.fetch_readme(owner, repo),
            github_service.fetch_file_tree_flat(owner, repo, default_branch),
        )

        # Static insights only (no AI) — keeps context loading fast and resilient.
        pkg_json = requirements = None
        has_pkg = any(n["path"] == "package.json" for n in flat_tree)
        has_req = any(n["path"] == "requirements.txt" for n in flat_tree)
        pkg_json, requirements = await asyncio.gather(
            github_service.fetch_raw_file(owner, repo, "package.json", default_branch) if has_pkg else _noop(),
            github_service.fetch_raw_file(owner, repo, "requirements.txt", default_branch) if has_req else _noop(),
        )

        tech_stack = repository_analyzer.detect_tech_stack(flat_tree, pkg_json, requirements)
        entry_points = repository_analyzer.detect_entry_points(flat_tree)
        suggested = repository_analyzer.detect_suggested_folders(flat_tree)
        dependencies = repository_analyzer.parse_dependencies(pkg_json, requirements)
        health = repository_analyzer.calculate_health(flat_tree, readme_text)

        context = RepositoryContextBuilder.build_context(
            owner=owner, repo=repo, flat_tree=flat_tree, readme_content=readme_text,
            languages={l["name"]: l["percentage"] for l in languages},
            health_metrics=health,
            dependencies=dependencies,
        )

        summary = {
            "name": repo_info.get("name", repo),
            "owner": owner,
            "description": repo_info.get("description") or "No description available.",
            "stars": repo_info.get("stargazers_count", 0),
            "forks": repo_info.get("forks_count", 0),
            "language": repo_info.get("language") or "None",
            "topics": repo_info.get("topics") or [],
            "defaultBranch": default_branch,
            "languages": languages,
            "techStack": tech_stack,
            "entryPoints": entry_points,
            "suggestedStartingFolders": suggested,
            "dependencies": dependencies,
            "healthScore": health.get("healthScore"),
            "readmeSnippet": (readme_text or "")[:600],
            "fileCount": sum(1 for n in flat_tree if n["type"] == "blob"),
            "topFolders": sorted({
                p.split("/")[0] for p in (n["path"] for n in flat_tree if n["type"] == "tree")
            })[:12],
        }

        mc = MentorContext(context, summary)
        self._cache[key] = mc
        return mc

    async def ask(
        self,
        owner: str,
        repo: str,
        question: str,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> Dict[str, Any]:
        mc = await self.load_context(owner, repo)
        template = self._read_prompt_template("mentor_v1")

        turns = "\n".join(
            f"{'User' if m['role'] == 'user' else 'Mentor'}: {m['content']}"
            for m in (history or [])
            if m.get("role") in ("user", "assistant") and m.get("content")
        )
        conversation = f"### PRIOR CONVERSATION (most recent last)\n{turns}\n\n" if turns else ""
        full_prompt = (
            f"### REPOSITORY CONTEXT:\n{mc.context}\n\n"
            f"{conversation}"
            f"### CURRENT QUESTION:\n{question}\n\n"
            f"{template}"
        )
        system_instruction = (
            "You are DevPilot AI's Repository Mentor, a senior engineer guiding a developer "
            "through an unfamiliar codebase. Answer only from the repository context. Reply "
            "with a single valid JSON object matching the requested schema."
        )

        raw = await self.provider.generate(full_prompt, system_instruction)
        try:
            return parse_json_from_response(raw)
        except ValueError:
            return {
                "summary": "I couldn't structure that response.",
                "explanation": raw[:1500],
                "evidence": [],
                "nextSteps": [],
                "relatedFiles": [],
                "followUpQuestions": [],
            }


mentor = RepositoryMentor()
