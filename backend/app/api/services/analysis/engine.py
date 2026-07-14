import json
import re
import asyncio
from typing import List, Dict, Any, Optional
from app.api.services.github.service import github_service
from app.ai.engines import ai_intelligence_engine

class RepositoryAnalyzer:
    async def analyze_repo(self, owner: str, repo: str, default_branch: str, flat_tree: List[Dict[str, Any]], readme_content: str, api_key: Optional[str] = None, openrouter_key: Optional[str] = None, github_token: Optional[str] = None) -> Dict[str, Any]:
        """
        Coordinates full static analysis of a repo tree and metadata.
        """
        # 1. Download manifest files for deeper inspection
        package_json_content = None
        requirements_txt_content = None
        
        # Check if they exist in flat tree
        has_package_json = any(n["path"] == "package.json" for n in flat_tree)
        has_requirements_txt = any(n["path"] == "requirements.txt" for n in flat_tree)
        
        # Fetch manifest files in parallel using asyncio.gather to optimize speed
        fetch_tasks = []
        if has_package_json:
            fetch_tasks.append(github_service.fetch_raw_file(owner, repo, "package.json", default_branch, token=github_token))
        else:
            fetch_tasks.append(asyncio.sleep(0, result=None))
            
        if has_requirements_txt:
            fetch_tasks.append(github_service.fetch_raw_file(owner, repo, "requirements.txt", default_branch, token=github_token))
        else:
            fetch_tasks.append(asyncio.sleep(0, result=None))
            
        results = await asyncio.gather(*fetch_tasks)
        package_json_content = results[0]
        requirements_txt_content = results[1]
 
        # 2. Detect Tech Stack
        tech_stack = self.detect_tech_stack(flat_tree, package_json_content, requirements_txt_content)
        
        # 3. Detect Entry Points & Suggested Folders
        entry_points = self.detect_entry_points(flat_tree)
        suggested_folders = self.detect_suggested_folders(flat_tree)
        
        # 4. Parse Dependencies
        dependencies = self.parse_dependencies(package_json_content, requirements_txt_content)
        
        # 5. Calculate Health metrics
        health = self.calculate_health(flat_tree, readme_content)
        
        # 6. Generate Roadmap
        roadmap = self.generate_roadmap(repo, tech_stack, entry_points)
        
        # 7. Generate Good First Issues
        good_first_issues = self.generate_good_first_issues(flat_tree, repo)
 
        static_fallback_data = {
            "techStack": tech_stack,
            "entryPoints": entry_points,
            "suggestedStartingFolders": suggested_folders,
            "dependencies": dependencies,
            "health": health,
            "roadmap": roadmap,
            "goodFirstIssues": good_first_issues
        }
 
        # 8. Enrich with AI Repository Intelligence Layer
        try:
            languages_dict = {}
            for tech in tech_stack:
                languages_dict[tech] = 100.0 / len(tech_stack) if tech_stack else 100.0
 
            enriched_data = await ai_intelligence_engine.analyze_all(
                owner=owner,
                repo=repo,
                flat_tree=flat_tree,
                readme_content=readme_content,
                languages=languages_dict,
                health_metrics=health,
                dependencies=dependencies,
                static_fallback_data=static_fallback_data,
                api_key=api_key,
                openrouter_key=openrouter_key
            )
            return enriched_data
        except Exception as e:
            print(f"[AI Intelligence Engine Error] analyze_all crashed: {str(e)}. Returning rule-based static fallback.")
            return static_fallback_data


    def detect_tech_stack(self, flat_tree: List[Dict[str, Any]], package_json_content: Optional[str], requirements_txt_content: Optional[str]) -> List[str]:
        stack = set()
        
        # File path searches
        paths = [node["path"] for node in flat_tree]
        
        # 1. Base Languages from file extensions
        if any(p.endswith((".ts", ".tsx")) for p in paths) or "tsconfig.json" in paths:
            stack.add("TypeScript")
        if any(p.endswith((".js", ".jsx")) for p in paths):
            stack.add("JavaScript")
        if any(p.endswith(".py") for p in paths):
            stack.add("Python")
        if any(p.endswith(".rs") for p in paths) or "Cargo.toml" in paths:
            stack.add("Rust")
        if any(p.endswith(".go") for p in paths) or "go.mod" in paths:
            stack.add("Go")
        if any(p.endswith(".java") for p in paths):
            stack.add("Java")
        if any(p.endswith(".cpp") or p.endswith(".cc") for p in paths):
            stack.add("C++")

        # 2. Package manager and frameworks in package.json
        if package_json_content:
            stack.add("Node.js")
            try:
                pkg = json.loads(package_json_content)
                deps = {**pkg.get("dependencies", {}), **pkg.get("devDependencies", {})}
                
                if "react" in deps:
                    stack.add("React")
                if "next" in deps:
                    stack.add("Next.js")
                if "vue" in deps:
                    stack.add("Vue.js")
                if "svelte" in deps:
                    stack.add("Svelte")
                if "vite" in deps or "vite" in pkg.get("devDependencies", {}):
                    stack.add("Vite")
                if "tailwindcss" in deps or "@tailwindcss/vite" in deps:
                    stack.add("Tailwind CSS")
                if "typescript" in deps:
                    stack.add("TypeScript")
                if "jest" in deps or "jest" in pkg.get("scripts", {}).values():
                    stack.add("Jest")
                if "vitest" in deps:
                    stack.add("Vitest")
                if "eslint" in deps:
                    stack.add("ESLint")
                if "prettier" in deps:
                    stack.add("Prettier")
                if "express" in deps:
                    stack.add("Express")
            except Exception:
                pass

        # 3. Python frameworks
        if requirements_txt_content:
            stack.add("Python")
            if "fastapi" in requirements_txt_content.lower():
                stack.add("FastAPI")
            if "django" in requirements_txt_content.lower():
                stack.add("Django")
            if "flask" in requirements_txt_content.lower():
                stack.add("Flask")

        # 4. Other configuration indicators
        if "Dockerfile" in paths or "docker-compose.yml" in paths or "docker-compose.yaml" in paths:
            stack.add("Docker")
        if any(p.startswith(".github/workflows") for p in paths):
            stack.add("GitHub Actions CI")
        if "tailwind.config.js" in paths or "tailwind.config.ts" in paths:
            stack.add("Tailwind CSS")
        if ".eslintrc" in paths or "eslint.config.js" in paths:
            stack.add("ESLint")
        if ".prettierrc" in paths or ".prettierrc.json" in paths:
            stack.add("Prettier")

        # Set default fallback if empty
        if not stack:
            stack.add("Markdown")
            
        # Return sorted list
        return sorted(list(stack))

    def parse_dependencies(self, package_json_content: Optional[str], requirements_txt_content: Optional[str]) -> List[Dict[str, Any]]:
        dependencies = []
        
        # Parse package.json
        if package_json_content:
            try:
                pkg = json.loads(package_json_content)
                for name, version in pkg.get("dependencies", {}).items():
                    dependencies.append({
                        "name": name,
                        "version": version,
                        "type": "core"
                    })
                for name, version in pkg.get("devDependencies", {}).items():
                    dependencies.append({
                        "name": name,
                        "version": version,
                        "type": "dev"
                    })
            except Exception:
                pass

        # Parse requirements.txt
        if requirements_txt_content:
            for line in requirements_txt_content.splitlines():
                line = line.strip()
                if not line or line.startswith("#"):
                    continue
                # Match name==version or name>=version
                match = re.match(r"^([a-zA-Z0-9_\-\[\]]+)(?:==|>=|<=|>|<|~=)?(.*)$", line)
                if match:
                    name, version = match.groups()
                    dependencies.append({
                        "name": name.strip(),
                        "version": version.strip() or "latest",
                        "type": "core"
                    })
                    
        # Add basic defaults if no configurations found
        if not dependencies:
            dependencies = [
                {"name": "git", "version": "latest", "type": "core"},
                {"name": "markdown-docs", "version": "1.0.0", "type": "core"}
            ]
            
        return dependencies[:30]  # Limit to 30 items for clean rendering

    def detect_entry_points(self, flat_tree: List[Dict[str, Any]]) -> List[str]:
        paths = [node["path"] for node in flat_tree]
        entry_points = []
        
        candidates = [
            "src/main.tsx", "src/index.tsx", "src/main.ts", "src/index.ts",
            "src/App.tsx", "src/index.js", "src/main.js", "main.py", "app/main.py",
            "server.ts", "server.js", "index.js", "src/server.ts",
            "app.py", "src/main.py", "src/lib.rs", "src/main.rs", "main.go"
        ]
        
        for cand in candidates:
            if cand in paths:
                entry_points.append(cand)
                
        # Fallback to any top level ts/tsx/js/py file
        if not entry_points:
            for p in paths:
                if p.count("/") == 0 and p.endswith((".ts", ".tsx", ".js", ".py", ".go", ".rs")):
                    entry_points.append(p)
                    break
                    
        if not entry_points:
            entry_points = ["README.md"]
            
        return entry_points[:3]

    def detect_suggested_folders(self, flat_tree: List[Dict[str, Any]]) -> List[str]:
        paths = [node["path"] for node in flat_tree if node["type"] == "tree"]
        suggested = []
        
        candidates = [
            "src/components", "src/hooks", "src/lib", "src/utils", "src/services",
            "src/routes", "src/pages", "src/store", "backend/app", "app/api",
            "tests", "test", "src", "app", "lib"
        ]
        
        for cand in candidates:
            if cand in paths:
                suggested.append(cand)
                
        if not suggested:
            # Take any top level folders
            for p in paths:
                if "/" not in p:
                    suggested.append(p)
                    
        if not suggested:
            suggested = ["/"]
            
        return suggested[:4]

    def calculate_health(self, flat_tree: List[Dict[str, Any]], readme_content: str) -> Dict[str, Any]:
        paths = [node["path"] for node in flat_tree]
        
        # 1. Documentation Score (Base 100)
        doc_score = 100
        if not readme_content or len(readme_content) < 100:
            doc_score -= 30
        elif len(readme_content) < 500:
            doc_score -= 15
            
        # Check for other documentation
        has_contributing = any(re.match(r"^contributing", p.lower()) for p in paths)
        has_conduct = any(re.match(r"^code_of_conduct", p.lower()) for p in paths)
        has_license = any(re.match(r"^license", p.lower()) for p in paths)
        
        if not has_contributing:
            doc_score -= 10
        if not has_conduct:
            doc_score -= 5
        if not has_license:
            doc_score -= 10
            
        doc_score = max(doc_score, 40)

        # 2. Code Quality (Base 85)
        quality_score = 85
        has_eslint = any(p in [".eslintrc", "eslint.config.js", ".eslintrc.json", "eslint.config.mjs"] for p in paths)
        has_prettier = any(p in [".prettierrc", ".prettierrc.json"] for p in paths)
        has_tsconfig = "tsconfig.json" in paths
        
        if has_eslint:
            quality_score += 5
        if has_prettier:
            quality_score += 5
        if has_tsconfig:
            quality_score += 5
            
        # Subtract if files are extremely flat or messy
        if len(paths) > 200 and not any("/" in p for p in paths):
            quality_score -= 20
            
        quality_score = min(max(quality_score, 50), 100)

        # 3. Maintainability (Base 88)
        maint_score = 88
        # Check folder structure
        folders_count = sum(1 for node in flat_tree if node["type"] == "tree")
        if folders_count == 0:
            maint_score -= 15
        elif folders_count > 30:
            maint_score -= 5  # Over-complex folder nesting
            
        maint_score = min(max(maint_score, 60), 98)

        # 4. Cognitive Complexity (Base 85)
        comp_score = 85
        # Deep folders nested indicator
        deep_folders = sum(1 for p in paths if p.count("/") >= 4)
        if deep_folders > 20:
            comp_score -= 15
        elif deep_folders > 5:
            comp_score -= 5
            
        comp_score = min(max(comp_score, 55), 98)

        # 5. Testing Score (Base 50)
        test_score = 50
        has_tests_folder = any("test" in p.lower() for p in paths)
        has_jest_config = any("jest.config" in p for p in paths)
        has_pytest = "pytest.ini" in paths or any("conftest.py" in p for p in paths)
        
        if has_tests_folder:
            test_score += 30
        if has_jest_config or has_pytest:
            test_score += 15
            
        test_score = min(max(test_score, 20), 100)

        # Total Health Score is an average of these domains
        health_score = int((doc_score + quality_score + maint_score + comp_score + test_score) / 5)

        # Generate Actionable Dynamic Recommendations
        recommendations = []
        is_js_ts = any(p.endswith((".ts", ".tsx", ".js", ".jsx")) for p in paths)
        is_python = any(p.endswith(".py") for p in paths)

        # A. gitignore Check
        if ".gitignore" not in paths:
            recommendations.append({
                "id": "rec-gitignore",
                "category": "quality",
                "title": "Create a .gitignore Configuration",
                "description": "Missing `.gitignore` can lead to accidentally committing vendor modules (node_modules, venv), dynamic system logs, database binaries, or secret keys to version control.",
                "severity": "high",
                "suggestion": "node_modules/\n.env\n*.log\nvenv/\n__pycache__/\n*.db"
            })

        # B. tsconfig / Compiler Check
        if is_js_ts and any(p.endswith((".ts", ".tsx")) for p in paths) and "tsconfig.json" not in paths:
            recommendations.append({
                "id": "rec-tsconfig",
                "category": "quality",
                "title": "Configure a tsconfig.json File",
                "description": "TypeScript files found and cataloged, but compiler configurations are missing. Introduce a tsconfig.json file to manage compiler target mappings, import paths, and strict checks.",
                "severity": "high",
                "suggestion": "npx tsc --init"
            })

        # C. Linter / Formatter Checks
        if is_js_ts and not has_eslint:
            recommendations.append({
                "id": "rec-eslint",
                "category": "quality",
                "title": "Set up ESLint Rules checking",
                "description": "Missing static lint mapping. Introduce ESLint configurations to proactively enforce syntax standard validations and avoid runtime compilation problems.",
                "severity": "medium",
                "suggestion": "npm init @eslint/config"
            })

        if is_js_ts and not has_prettier:
            recommendations.append({
                "id": "rec-prettier",
                "category": "quality",
                "title": "Integrate Prettier Formatting",
                "description": "Prettier standard config files missing. Unify user indentation styles, bracket parameters, and quote formats across code changes by configuring a `.prettierrc` template.",
                "severity": "low",
                "suggestion": "{\n  \"semi\": true,\n  \"tabWidth\": 2,\n  \"singleQuote\": true\n}"
            })

        # D. env file templates
        has_env_example = any(p in [".env.example", ".env.template"] for p in paths)
        has_env = any(p in [".env"] for p in paths)
        if not has_env_example and (has_env or is_js_ts or is_python):
            recommendations.append({
                "id": "rec-envexample",
                "category": "documentation",
                "title": "Publish a .env.example Template",
                "description": "Every project requiring local API tokens, databases, or ports should publish an example configuration template. This shields database endpoints from leaking while enabling swift setup.",
                "severity": "medium",
                "suggestion": "# Local server setup\nPORT=8000\nDATABASE_URL=sqlite:///app.db\nAPI_KEY=YOUR_KEY_HERE"
            })

        # E. Readme Checklist
        if not readme_content or len(readme_content) < 300:
            recommendations.append({
                "id": "rec-readme",
                "category": "documentation",
                "title": "Expand Repository Onboarding Guide",
                "description": "The readme file is extremely short or placeholder. Expand files information to outline step-by-step dependency installation instructions, local testing setup, and endpoint routing layout.",
                "severity": "high",
                "suggestion": "# Getting Started\n1. Run `npm install` to load core dependencies\n2. Boot server: `npm run dev`"
            })

        if not has_license:
            recommendations.append({
                "id": "rec-license",
                "category": "documentation",
                "title": "Configure Open Source License",
                "description": "No license files found within this workspace. State software terms (e.g. MIT, Apache, or GPL) to grant explicit code reuse permissions for outer collaborators.",
                "severity": "low",
                "suggestion": "MIT License\n\nCopyright (c) 2026..."
            })

        # F. Code smell hotfiles
        large_files = []
        for node in flat_tree:
            if node.get("type") == "blob":
                size = node.get("size", 0)
                path = node.get("path", "")
                # Ignore dependencies or lockfiles
                if "node_modules" in path or "package-lock.json" in path or "yarn.lock" in path or "pnpm-lock.yaml" in path or "venv" in path:
                    continue
                if size > 65000 and path.endswith((".ts", ".tsx", ".js", ".jsx", ".py", ".go", ".rs")):
                    large_files.append((path, size))

        if large_files:
            # Sort by size descending, warn about top 2 largest
            large_files.sort(key=lambda x: x[1], reverse=True)
            for path, size in large_files[:2]:
                kb = round(size / 1024, 1)
                recommendations.append({
                    "id": f"rec-bloat-{path.replace('/', '-')}",
                    "category": "complexity",
                    "title": f"Refactor Bloated Source File: {path.split('/')[-1]}",
                    "description": f"File `{path}` is exceptionally large ({kb} KB). Over-bloated files violate single-responsibility design guidelines, raising code complexity and slowing linter processing speeds.",
                    "severity": "high",
                    "suggestion": f"# Refactoring Tip: Break down '{path.split('/')[-1]}'\n- Split React visual elements into smaller sub-components\n- Delegate data fetch loaders into custom hook modules"
                })

        # G. Testing config check
        if test_score <= 50:
            recommendations.append({
                "id": "rec-testing",
                "category": "testing",
                "title": "Establish Automated Testing Config",
                "description": "No testing modules or configs (Jest, Vitest, pytest) were detected. Integrating automated test frameworks protects core business routines against functional regression.",
                "severity": "medium",
                "suggestion": "npm install -D vitest\n# Or for Python: pip install pytest; pytest --init"
            })

        # H. Project layout structure
        if folders_count == 0:
            recommendations.append({
                "id": "rec-flatlayout",
                "category": "maintainability",
                "title": "Organize Files Into Subfolders",
                "description": " Flat layouts (all files dumped directly in root) lead to naming collision and poor structural maintainability. Partition files into logical layers.",
                "severity": "medium",
                "suggestion": "mkdir src/components src/utils src/routes"
            })
        elif deep_folders > 10:
            recommendations.append({
                "id": "rec-nestedlayout",
                "category": "maintainability",
                "title": "Simplify Deeply Nested Directories",
                "description": f"Highly nested folders ({deep_folders} paths exceeding 4+ levels) make file import paths difficult to resolve. Reorganize folders under a flatter modules schema.",
                "severity": "low",
                "suggestion": "Move deeply nested folder hierarchies to parent level directory hooks."
            })

        # Limit to relevant priority recommendations for display efficiency
        recommendations = recommendations[:6]

        # Standard qualitative default explanations
        explanations = {
            "documentation": f"Documentation score is {doc_score}/100. Readme is {'present but might need detail' if len(readme_content) > 300 else 'bare or missing'} and license is {'provided' if has_license else 'missing'}.",
            "codeQuality": f"Code quality is {quality_score}/100 based on standard configurations check. ESLint is {'configured' if has_eslint else 'not configured'} and Prettier compiler styling checks are {'ready' if has_prettier else 'missing'}.",
            "maintainability": f"Modular maintainability is {maint_score}/100. Folders distribution tracks {folders_count} subdirectories.",
            "complexity": f"Cognitive complexity rates {comp_score}/100 based on path nesting. The repository has {deep_folders} deep subdirectory nodes.",
            "testing": f"Testing score is {test_score}/100. Testing suite indicator is {'configured' if test_score > 50 else 'inactive or missing from directories'}."
        }

        return {
            "healthScore": health_score,
            "metrics": {
                "documentation": doc_score,
                "codeQuality": quality_score,
                "maintainability": maint_score,
                "complexity": comp_score,
                "testing": test_score
            },
            "recommendations": recommendations,
            "explanations": explanations
        }

    def generate_roadmap(self, repo_name: str, tech_stack: List[str], entry_points: List[str]) -> List[Dict[str, Any]]:
        # Structured deterministic roadmap based on detected technologies
        primary_entry = entry_points[0] if entry_points else "README.md"
        
        roadmap = [
            {
                "id": "rm-phase-1",
                "phase": "Phase 1",
                "title": "Onboarding & Environment Setup",
                "description": f"Initialize local developer environment for {repo_name} and understand top level entry files.",
                "estimatedTime": "1-2 hours",
                "difficulty": "Beginner",
                "items": [
                    "Clone the repository locally and run repository dependency installs",
                    f"Open and read {primary_entry} to identify project entry parameters",
                    "Verify development runtime environment versions (Node/Python/Go etc.)"
                ]
            }
        ]

        if "React" in tech_stack or "TypeScript" in tech_stack:
            roadmap.append({
                "id": "rm-phase-2",
                "phase": "Phase 2",
                "title": "Frontend Layouts & Components",
                "description": "Trace structural React UI modules and map states to interface elements.",
                "estimatedTime": "3-4 hours",
                "difficulty": "Intermediate",
                "items": [
                    "Inspect the main React entry point to study components rendering hierarchy",
                    "Explore key component files inside 'src/components' or 'components' folders",
                    "Analyze styling frameworks (Tailwind/CSS modules) used in layout trees"
                ]
            })
        elif "Python" in tech_stack or "FastAPI" in tech_stack:
            roadmap.append({
                "id": "rm-phase-2",
                "phase": "Phase 2",
                "title": "Backend Routes & Controller Handlers",
                "description": "Understand backend routing architecture, query endpoints, and server settings.",
                "estimatedTime": "3-4 hours",
                "difficulty": "Intermediate",
                "items": [
                    f"Examine '{primary_entry}' to locate root route handlers and database hooks",
                    "Review validation schemas, request models, and service middleware filters",
                    "Run localized test suites and query server endpoints with mock requests"
                ]
            })
        else:
            roadmap.append({
                "id": "rm-phase-2",
                "phase": "Phase 2",
                "title": "Codebase Walkthrough",
                "description": "Navigate folder tree structures, modules orchestration, and standard helper files.",
                "estimatedTime": "3-5 hours",
                "difficulty": "Intermediate",
                "items": [
                    "Onboard to major subfolders inside the workspace folder tree",
                    "Trace functions execution pathways from primary entry nodes",
                    "Map out business schemas and internal database configuration models"
                ]
            })

        # Phase 3: Tests & Contributions
        roadmap.append({
            "id": "rm-phase-3",
            "phase": "Phase 3",
            "title": "Integration Testing & Validation",
            "description": "Perform coverage validations, study linter rules, and run tests.",
            "estimatedTime": "2-3 hours",
            "difficulty": "Advanced",
            "items": [
                "Locate test folders and identify configuration testing modules",
                "Execute local linter checking sequences to verify code patterns",
                "Draft a minor pull request addressing starting tasks or documentation updates"
            ]
        })

        return roadmap

    def generate_good_first_issues(self, flat_tree: List[Dict[str, Any]], repo_name: str) -> List[Dict[str, Any]]:
        paths = [node["path"] for node in flat_tree]
        issues = []
        
        # Look for missing documentation configs
        has_contributing = any(re.match(r"^contributing", p.lower()) for p in paths)
        has_conduct = any(re.match(r"^code_of_conduct", p.lower()) for p in paths)
        has_prettier = any(p in [".prettierrc", ".prettierrc.json"] for p in paths)
        
        idx = 1
        if not has_contributing:
            issues.append({
                "id": f"fi-{repo_name}-{idx}",
                "title": "Add CONTRIBUTING.md guide with onboarding instructions for new devs",
                "number": 101,
                "labels": ["good first issue", "documentation"],
                "difficulty": "Easy"
            })
            idx += 1
            
        if not has_prettier:
            issues.append({
                "id": f"fi-{repo_name}-{idx}",
                "title": "Setup basic Prettier configuration file for formatting compliance",
                "number": 102,
                "labels": ["good first issue", "developer-experience"],
                "difficulty": "Easy"
            })
            idx += 1
            
        # Generic issues if the repo has these files
        issues.append({
            "id": f"fi-{repo_name}-{idx}",
            "title": "Improve unit test coverage thresholds for primary utility modules",
            "number": 103,
            "labels": ["good first issue", "testing"],
            "difficulty": "Medium"
        })
        idx += 1
        
        issues.append({
            "id": f"fi-{repo_name}-{idx}",
            "title": "Audit import/export lines to resolve obsolete module dependencies",
            "number": 104,
            "labels": ["good first issue", "type-safety"],
            "difficulty": "Medium"
        })
        
        return issues[:3]

repository_analyzer = RepositoryAnalyzer()
