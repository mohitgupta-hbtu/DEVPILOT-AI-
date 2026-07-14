import os
import re
import json
import asyncio
from typing import List, Dict, Any, Optional
from .providers import get_provider
from .context import RepositoryContextBuilder

# Local Cache dictionary
# Key: (url, provider, prompt_version)
# Value: parsed_json_data
AI_RESPONSE_CACHE = {}

def parse_json_from_response(text: str) -> Dict[str, Any]:
    """
    Robustly extracts and parses a JSON object from a text response, 
    even if it is wrapped in markdown code blocks or has extra text.
    """
    text = text.strip()
    
    # 1. Try matching inside ```json ... ``` blocks
    json_block_match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text, re.DOTALL)
    if json_block_match:
        try:
            return json.loads(json_block_match.group(1))
        except Exception:
            pass
            
    # 2. Try matching any substring starting with { and ending with }
    curly_match = re.search(r"(\{.*\})", text, re.DOTALL)
    if curly_match:
        try:
            return json.loads(curly_match.group(1))
        except Exception:
            pass
            
    # 3. Direct attempt
    try:
        return json.loads(text)
    except Exception:
        raise ValueError(f"Failed to parse structured JSON from LLM output: {text[:200]}...")

class RepositoryIntelligenceEngine:
    """
    Engine that coordinates generating summary, architecture, roadmap, contribution guide, 
    and health commentary using parallel AI queries and fallbacks.
    """
    
    def __init__(self):
        self.provider = get_provider()
        self.prompt_dir = os.path.join(os.path.dirname(__file__), "prompts")
        
    def _read_prompt_template(self, name: str) -> str:
        """Reads a versioned prompt from the markdown templates folder."""
        path = os.path.join(self.prompt_dir, f"{name}.md")
        try:
            with open(path, "r", encoding="utf-8") as f:
                return f.read()
        except Exception as e:
            raise FileNotFoundError(f"Required prompt template {name}.md not found in {self.prompt_dir}: {str(e)}")

    async def get_insight_async(self, engine_name: str, prompt_template: str, context: str, cache_key: tuple, replacements: dict = None, api_key: Optional[str] = None, openrouter_key: Optional[str] = None) -> Dict[str, Any]:
        """
        Executes a single AI engine inquiry with caching and robust error handling.
        """
        # Check cache
        if cache_key in AI_RESPONSE_CACHE:
            print(f"[AI Cache HIT] for {engine_name}")
            return AI_RESPONSE_CACHE[cache_key]
            
        # Construct prompt
        full_prompt = f"### REPOSITORY CONTEXT:\n{context}\n\n{prompt_template}"
        if replacements:
            for k, v in replacements.items():
                full_prompt = full_prompt.replace(f"{{{k}}}", str(v))
                
        system_instruction = "You are a professional Principal Software Architect. Always reply with clean valid JSON, strictly matching the requested schemas."
        
        # Instantiate provider dynamically per request
        if openrouter_key or os.environ.get("OPENROUTER_API_KEY") and not api_key:
            from app.ai.providers.openrouter import OpenRouterProvider
            provider = OpenRouterProvider()
            key_to_use = openrouter_key
        else:
            from app.ai.providers.gemini import GeminiProvider
            provider = GeminiProvider()
            key_to_use = api_key

        try:
            raw_response = await provider.generate(full_prompt, system_instruction, api_key=key_to_use)
            parsed_data = parse_json_from_response(raw_response)
            
            # Cache results
            AI_RESPONSE_CACHE[cache_key] = parsed_data
            return parsed_data
        except Exception as e:
            print(f"[AI Engine Error] {engine_name} failed: {str(e)}. Will return empty block for safe fallback.")
            return {"error": str(e), "confidence": "Low"}

    async def analyze_all(
        self,
        owner: str,
        repo: str,
        flat_tree: List[Dict[str, Any]],
        readme_content: Optional[str],
        languages: Dict[str, float],
        health_metrics: Dict[str, Any],
        dependencies: List[Dict[str, Any]],
        static_fallback_data: Dict[str, Any],
        api_key: Optional[str] = None,
        openrouter_key: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Orchestrates parallel AI calls for each domain with fallback logic if the provider fails or is not key-configured.
        """
        # Check if Gemini Key or OpenRouter Key is available. If not, bypass to safe fallback immediately.
        if not api_key and not os.environ.get("GEMINI_API_KEY") and not openrouter_key and not os.environ.get("OPENROUTER_API_KEY"):
            print("[AI Intelligence Layer] Neither GEMINI_API_KEY nor OPENROUTER_API_KEY is configured and no custom key provided. Falling back to rule-based static analyzer.")
            return static_fallback_data
            
        # 1. Build common compressed repository context
        context = RepositoryContextBuilder.build_context(
            owner=owner,
            repo=repo,
            flat_tree=flat_tree,
            readme_content=readme_content,
            languages=languages,
            health_metrics=health_metrics,
            dependencies=dependencies
        )
        
        # 2. Setup prompt versions
        prompt_version = "v1"
        provider_name = "openrouter" if (openrouter_key or os.environ.get("OPENROUTER_API_KEY")) and not api_key else "gemini"
        
        # 3. Read prompt files
        try:
            summary_prompt = self._read_prompt_template(f"summary_{prompt_version}")
            architecture_prompt = self._read_prompt_template(f"architecture_{prompt_version}")
            roadmap_prompt = self._read_prompt_template(f"roadmap_{prompt_version}")
            contribution_prompt = self._read_prompt_template(f"contribution_{prompt_version}")
            health_prompt = self._read_prompt_template(f"health_{prompt_version}")
        except Exception as e:
            print(f"[AI Intelligence Layer] Prompt load failed: {str(e)}. Falling back to deterministic analysis.")
            return static_fallback_data
            
        # 4. Create cache keys
        cache_base = (owner, repo, provider_name, prompt_version)
        summary_cache_key = (*cache_base, "summary")
        architecture_cache_key = (*cache_base, "architecture")
        roadmap_cache_key = (*cache_base, "roadmap")
        contribution_cache_key = (*cache_base, "contribution")
        health_cache_key = (*cache_base, "health")
        
        # 5. Build dynamic replacements for health explanation prompt
        health_replacements = {
            "doc_score": health_metrics.get("healthScore", 80),
            "quality_score": health_metrics.get("metrics", {}).get("codeQuality", 80),
            "maint_score": health_metrics.get("metrics", {}).get("maintainability", 80),
            "comp_score": health_metrics.get("metrics", {}).get("complexity", 80),
            "test_score": health_metrics.get("metrics", {}).get("testing", 80)
        }
        
        # 6. Dispatch parallel calls
        tasks = [
            self.get_insight_async("summary", summary_prompt, context, summary_cache_key, api_key=api_key, openrouter_key=openrouter_key),
            self.get_insight_async("architecture", architecture_prompt, context, architecture_cache_key, api_key=api_key, openrouter_key=openrouter_key),
            self.get_insight_async("roadmap", roadmap_prompt, context, roadmap_cache_key, api_key=api_key, openrouter_key=openrouter_key),
            self.get_insight_async("contribution", contribution_prompt, context, contribution_cache_key, api_key=api_key, openrouter_key=openrouter_key),
            self.get_insight_async("health", health_prompt, context, health_cache_key, health_replacements, api_key=api_key, openrouter_key=openrouter_key)
        ]
        
        # 7. Await concurrently
        results = await asyncio.gather(*tasks, return_exceptions=True)
        
        summary_res = results[0] if not isinstance(results[0], Exception) else {}
        arch_res = results[1] if not isinstance(results[1], Exception) else {}
        roadmap_res = results[2] if not isinstance(results[2], Exception) else {}
        contrib_res = results[3] if not isinstance(results[3], Exception) else {}
        health_res = results[4] if not isinstance(results[4], Exception) else {}
        
        # 8. Assemble combined payload, merging AI elements with fallback defaults if AI blocks failed
        final_tech_stack = summary_res.get("techStack", static_fallback_data["techStack"])
        final_entry_points = summary_res.get("entryPoints", static_fallback_data["entryPoints"])
        final_suggested_folders = summary_res.get("suggestedStartingFolders", static_fallback_data["suggestedStartingFolders"])
        
        # Roadmap mapping
        ai_roadmap = roadmap_res.get("roadmap", [])
        if ai_roadmap:
            final_roadmap = []
            for idx, r in enumerate(ai_roadmap):
                final_roadmap.append({
                    "id": r.get("id") or f"rm-phase-{idx+1}",
                    "phase": r.get("phase") or f"Phase {idx+1}",
                    "title": r.get("title") or "Onboarding Phase",
                    "description": r.get("description") or "Explore files and setup modules.",
                    "estimatedTime": r.get("estimatedTime") or "2 hours",
                    "difficulty": r.get("difficulty") or "Beginner",
                    "items": r.get("items") or []
                })
        else:
            final_roadmap = static_fallback_data["roadmap"]
            
        # Good First Issues mapping
        ai_gfi = contrib_res.get("goodFirstIssues", [])
        if ai_gfi:
            final_gfi = []
            for idx, g in enumerate(ai_gfi):
                final_gfi.append({
                    "id": g.get("id") or f"gfi-{idx+1}",
                    "title": g.get("title") or "Improve module configurations",
                    "number": g.get("number") or (101 + idx),
                    "labels": g.get("labels") or ["good first issue"],
                    "difficulty": g.get("difficulty") or "Easy"
                })
        else:
            final_gfi = static_fallback_data["goodFirstIssues"]
            
        # Dependencies mapping
        ai_deps = arch_res.get("dependencies", [])
        if ai_deps:
            final_deps = []
            for d in ai_deps:
                final_deps.append({
                    "name": d.get("name") or "unknown",
                    "version": d.get("version") or "latest",
                    "type": d.get("type") or "core"
                })
        else:
            final_deps = static_fallback_data["dependencies"]
            
        # Health score commentary enrichment
        # We preserve the rule-based quantitative scores but add qualitative explanations if available
        doc_expl = health_res.get("documentationExplanation", "Documentation score matches structure density.")
        cq_expl = health_res.get("codeQualityExplanation", "Linter patterns and tsconfig configurations are fully satisfied.")
        maint_expl = health_res.get("maintainabilityExplanation", "Folders split correctly according to scope standards.")
        comp_expl = health_res.get("complexityExplanation", "Cognitive complexity and directory nesting are balanced.")
        test_expl = health_res.get("testingExplanation", "Testing framework setup aligns with source tests configurations.")
        
        # We can enrich the descriptions or titles of health features
        return {
            "techStack": final_tech_stack,
            "entryPoints": final_entry_points,
            "suggestedStartingFolders": final_suggested_folders,
            "dependencies": final_deps,
            "health": {
                "healthScore": health_metrics.get("healthScore", 80),
                "metrics": health_metrics.get("metrics", {
                    "documentation": 80,
                    "codeQuality": 80,
                    "maintainability": 80,
                    "complexity": 80,
                    "testing": 80
                }),
                "recommendations": health_metrics.get("recommendations", []),
                "explanations": {
                    "documentation": doc_expl,
                    "codeQuality": cq_expl,
                    "maintainability": maint_expl,
                    "complexity": comp_expl,
                    "testing": test_expl
                }
            },
            "roadmap": final_roadmap,
            "goodFirstIssues": final_gfi
        }

# Singleton instance
ai_intelligence_engine = RepositoryIntelligenceEngine()
