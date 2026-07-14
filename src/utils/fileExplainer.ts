export interface FileExplanation {
  code: string;
  language: string;
  purpose: string;
  methods: string[];
  complexity: "Low" | "Medium" | "High";
  suggestions: string[];
}

export function getFileExplanation(filePath: string, repoName: string): FileExplanation {
  const safePath = filePath || "src/App.tsx";
  const safeRepo = repoName || "repository";
  const parts = safePath.split("/");
  const fileName = parts[parts.length - 1] || "App.tsx";
  const ext = fileName.split(".").pop()?.toLowerCase() || "";

  // 1. Check for well-known configuration files
  if (fileName === "package.json") {
    return {
      language: "json",
      code: `{
  "name": "${safeRepo.toLowerCase()}",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "framer-motion": "^10.16.4",
    "lucide-react": "^0.292.0"
  },
  "devDependencies": {
    "typescript": "^5.1.6",
    "vite": "^4.4.9"
  }
}`,
      purpose:
        "Defines runtime dependencies, scripts, and build pipeline targets for npm/yarn package environments.",
      complexity: "Low",
      methods: [
        "scripts: Standard lifecycle configurations.",
        "dependencies: Node package specifications.",
        "devDependencies: Static typing & build tool requirements.",
      ],
      suggestions: [
        "Verify all package major versions are synchronized to prevent package-resolution conflicts.",
        "Consider moving formatting or test dependencies into devDependencies to optimize build bundle targets.",
      ],
    };
  }

  if (fileName === "tsconfig.json") {
    return {
      language: "json",
      code: `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "noEmit": true,
    "jsx": "react-jsx"
  }
}`,
      purpose:
        "Configures compiler configurations, folder alias routing parameters, and type strictness guarantees for TypeScript compilation.",
      complexity: "Low",
      methods: [
        "compilerOptions: Declares TypeScript behavior rules.",
        "strict: Ensures strict type-checking checks.",
      ],
      suggestions: [
        "Ensure paths dictionary matches the vite alias configurations to avoid build-time errors.",
        "Consider enabling 'noUnusedLocals' and 'noUnusedParameters' to automatically flag dead variables.",
      ],
    };
  }

  if (fileName === "main.py" || fileName === "__init__.py") {
    return {
      language: "python",
      code: `from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routers import analyze, mentor
from app.database import init_db

app = FastAPI(title="${safeRepo} API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup():
    await init_db()

app.include_router(analyze.router, prefix="/api")
app.include_router(mentor.router, prefix="/api")
`,
      purpose:
        "Entrypoint script of the FastAPI server. Initializes core middlewares, attaches routers, and executes startup migrations.",
      complexity: "Medium",
      methods: [
        "startup(): Bootstraps connection with backing databases and instantiates local services.",
        "app.include_router(): Registers logical API controllers with corresponding sub-paths.",
      ],
      suggestions: [
        "Secure the CORS middleware setup by using a strictly defined ALLOW_ORIGINS list from environment parameters in production.",
        "Upgrade lifecycle event hooks from 'on_event' to FastAPI's modern 'lifespan' utility API.",
      ],
    };
  }

  if (fileName === "database.py" || fileName === "models.py") {
    return {
      language: "python",
      code: `from sqlmodel import SQLModel, Field, create_engine
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
import os

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./devpilot.db")
engine = create_async_engine(DATABASE_URL, echo=True)

async_session = sessionmaker(
    engine, class_=AsyncSession, expire_on_commit=False
)

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
`,
      purpose:
        "Defines the ORM model database schemas and provides database connectivity wrappers utilizing asynchronous SQLModel adapters.",
      complexity: "Medium",
      methods: [
        "init_db(): Programmatically boots the database and executes automatic table mappings.",
        "get_session(): Async generator yielding database context states.",
      ],
      suggestions: [
        "Ensure pool_size parameters are correctly tuned when deploying to serverless clouds (like Cloud Run) to minimize connection pooling exhaustion.",
        "Consider using migrations (Alembic or similar) rather than run_sync create_all inside production models.",
      ],
    };
  }

  // 2. Classify by common extensions
  if (ext === "ts" || ext === "tsx") {
    return {
      language: "typescript",
      code: `import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

interface ${fileName.split(".")[0]}Props {
  title: string;
  onAction?: () => void;
}

export const ${fileName.split(".")[0]}: React.FC<${fileName.split(".")[0]}Props> = ({ title, onAction }) => {
  const [active, setActive] = useState(false);

  return (
    <motion.div 
      className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors"
      whileHover={{ y: -2 }}
    >
      <h4 className="text-sm font-bold">{title}</h4>
      <button 
        onClick={() => {
          setActive(!active);
          if (onAction) onAction();
        }}
        className="mt-2.5 px-3 py-1 bg-primary text-xs font-semibold rounded"
      >
        Toggle Active State
      </button>
    </motion.div>
  );
};`,
      purpose: `Implements modular ${fileName.split(".")[0]} component utilizing React dynamic state and interactive Framer-Motion layers.`,
      complexity: "Medium",
      methods: [
        "Component Initialization: Generates reusable modular JSX templates.",
        "State Manipulation: Handles event feedback structures gracefully.",
      ],
      suggestions: [
        "Ensure all prop interfaces are clearly documented for correct team utilization.",
        "Verify that state updates are properly batch-updated to prevent redundant visual frames.",
      ],
    };
  }

  if (ext === "py") {
    return {
      language: "python",
      code: `import logging
from typing import List, Dict, Any

logger = logging.getLogger(__name__)

class ${fileName.split(".")[0]}Service:
    def __init__(self, db_session):
        self.session = db_session

    async def execute_task(self, payload: Dict[str, Any]) -> Dict[str, Any]:
        logger.info(f"Executing task with params: {payload}")
        try:
            # Simulated backend processing node
            result = {"status": "success", "processed": True}
            return result
        except Exception as e:
            logger.error(f"Failed to execute task: {e}")
            raise
`,
      purpose: `Implements the core backend service layer of the ${fileName.split(".")[0]} business logic, abstracting data transformations.`,
      complexity: "Medium",
      methods: [
        "execute_task(): Core function wrapping database lookups, transformations, and schema mapping.",
        "logger.info(): Reports diagnostic telemetry details.",
      ],
      suggestions: [
        "Ensure error cases are wrapped in custom HTTPExceptions so the client handles API statuses cleanly.",
        "Implement explicit type validation checks using pydantic schemas before executing internal queries.",
      ],
    };
  }

  if (ext === "css") {
    return {
      language: "css",
      code: `@import "tailwindcss";

@layer utilities {
  .glow-card {
    box-shadow: 0 0 40px -10px var(--color-primary-glow);
  }
}`,
      purpose:
        "Declares core typography style tokens, design modifiers, and global Tailwind overrides for visual cohesion.",
      complexity: "Low",
      methods: [
        "@theme overrides: Binds raw Tailwind identifiers to local CSS variables.",
        "Custom animations: Defines keyframe transformations.",
      ],
      suggestions: [
        "Adopt oklch format exclusively to retain natural wide-gamut colors across high-contrast monitors.",
        "Consolidate customized components to prevent stylesheet bloating.",
      ],
    };
  }

  if (ext === "md") {
    return {
      language: "markdown",
      code: `# ${fileName === "README.md" ? repoName : fileName.split(".")[0]}

A high-performance implementation of modern repository index structures.

## Quickstart

\`\`\`bash
# Install dependencies
npm install

# Launch development environment
npm run dev
\`\`\`

## Architecture

This project is organized as an offline-first modular fullstack workspace:
- \`/src\` contains the frontend React interactive pages.
- \`/backend\` maps Python routing processors.
`,
      purpose:
        "Provides user-facing architectural overviews, configuration steps, and operational guidelines for local execution.",
      complexity: "Low",
      methods: [
        "User Onboarding: Steps to establish local development workspaces.",
        "Architecture Map: Illustrates file structures.",
      ],
      suggestions: [
        "Ensure setup guidelines are verified against a fresh workstation install environment.",
        "Add visual badges or architectural flowcharts to make the overview highly scan-friendly.",
      ],
    };
  }

  // Fallback for random formats
  return {
    language: "javascript",
    code: `// ${fileName}
// Abstract system implementation node

export default function init() {
  console.log("Initializing ${fileName} configuration modules.");
}`,
    purpose: `Custom helper file mapping ${fileName} requirements to support core functional routines.`,
    complexity: "Low",
    methods: ["default init(): Prepares context configurations and schedules cleanups."],
    suggestions: [
      "Ensure clean documentation comments are attached above export parameters.",
      "Verify that resources are safely disposed when files are unmounted to prevent memory leaks.",
    ],
  };
}
