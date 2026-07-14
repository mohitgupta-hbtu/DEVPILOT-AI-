import { RepositoryAnalysis } from "@/types";

export const PRESET_EXAMPLES = [
  { label: "facebook/react", url: "https://github.com/facebook/react" },
  { label: "shadcn-ui/ui", url: "https://github.com/shadcn-ui/ui" },
  { label: "tanstack/router", url: "https://github.com/tanstack/router" },
];

export const PARSER_DEPTHS = [
  { value: "deep", label: "Deep AST Scanning (Recommended)" },
  { value: "shallow", label: "Shallow Dependency Mapping" },
  { value: "files", label: "File Tree Discovery Only" },
];

export const BRANCH_OPTIONS = [
  { value: "main", label: "main" },
  { value: "master", label: "master" },
  { value: "dev", label: "dev" },
  { value: "next", label: "next" },
];

export const DEFAULT_SETTINGS = {
  theme: "dark" as const,
  animationSpeed: 250,
  cacheLifetime: 7,
  isGitHubConnected: false,
  defaultWorkspaceId: "",
  layoutStyle: "standard" as const,
};

export const MOCK_REPOSITORIES: RepositoryAnalysis[] = [
  {
    id: "1",
    repoUrl: "https://github.com/facebook/react",
    owner: "facebook",
    name: "react",
    description:
      "The library for web and native user interfaces. Build once, render anywhere. Declarative, component-based, and highly extensible framework powering major platforms worldwide.",
    stars: 224100,
    forks: 46200,
    languages: [
      { name: "JavaScript", percentage: 89.2, color: "#f1e05a" },
      { name: "TypeScript", percentage: 8.5, color: "#3178c6" },
      { name: "HTML", percentage: 1.3, color: "#e34c26" },
      { name: "Other", percentage: 1.0, color: "#858585" },
    ],
    techStack: ["React", "TypeScript", "Flow", "Rollup", "Jest", "Babel", "ESLint"],
    healthScore: 94,
    healthMetrics: {
      documentation: 96,
      codeQuality: 92,
      maintainability: 95,
      complexity: 88,
      testing: 98,
    },
    entryPoints: [
      "packages/react/index.js",
      "packages/react-reconciler/src/ReactFiberReconciler.js",
    ],
    suggestedStartingFolders: ["packages/react", "packages/react-dom", "packages/shared"],
    roadmap: [
      {
        id: "rm-1",
        phase: "Phase 1",
        title: "Understanding React Core Elements",
        description:
          "Explore how React elements, components, and virtual DOM are defined in the workspace core.",
        estimatedTime: "2-4 hours",
        difficulty: "Beginner",
        items: [
          "Study packages/react/src/ReactElement.js - the core element factory",
          "Understand how React.createElement parses props and children",
          "Inspect how ReactSharedStateKeeper handles context propagation",
        ],
      },
      {
        id: "rm-2",
        phase: "Phase 2",
        title: "The Reconciler & Fiber Architecture",
        description: "Understand the core scheduling, rendering phase, and commit phase engines.",
        estimatedTime: "5-8 hours",
        difficulty: "Advanced",
        items: [
          "Read packages/react-reconciler/src/ReactFiber.new.js to understand the node structure",
          "Analyze the main render loop: performUnitOfWork and workLoopSync",
          "Identify the difference between concurrent render paths and standard updates",
        ],
      },
      {
        id: "rm-3",
        phase: "Phase 3",
        title: "Hook Implementation details",
        description:
          "Investigate how state hook queues and effects are mounted, updated, and dispatched.",
        estimatedTime: "3-5 hours",
        difficulty: "Intermediate",
        items: [
          "Understand ReactFiberHooks.new.js hooks dispatchers",
          "Observe how useState and useReducer coordinate update linked lists",
          "Analyze effect dependencies array checking in updateEffect",
        ],
      },
      {
        id: "rm-4",
        phase: "Phase 4",
        title: "DOM Renderer & Event Delegation",
        description: "Observe how reconciler mutations are committed to the DOM node tree.",
        estimatedTime: "2-3 hours",
        difficulty: "Intermediate",
        items: [
          "Study packages/react-dom/src/client/ReactDOMRoot.js to trace createRoot",
          "Trace how synthetic events are created and delegated to the root container",
        ],
      },
    ],
    goodFirstIssues: [
      {
        id: "fi-1",
        title: "Fix typo in useDeferredValue documentation comments",
        number: 28419,
        labels: ["good first issue", "documentation"],
        difficulty: "Easy",
      },
      {
        id: "fi-2",
        title: "Add unit tests for nested Suspense boundary fallbacks",
        number: 28310,
        labels: ["good first issue", "test coverage"],
        difficulty: "Medium",
      },
      {
        id: "fi-3",
        title: "Warning message improvement for invalid component exports",
        number: 27954,
        labels: ["good first issue", "developer-experience"],
        difficulty: "Easy",
      },
    ],
    dependencies: [
      { name: "object-assign", version: "^4.1.1", type: "core" },
      { name: "prop-types", version: "^15.8.1", type: "core" },
      { name: "scheduler", version: "^0.23.0", type: "core" },
      { name: "jest", version: "^29.5.0", type: "dev" },
      { name: "rollup", version: "^3.21.0", type: "dev" },
      { name: "prettier", version: "^2.8.8", type: "dev" },
    ],
    folderStructure: {
      name: "react",
      type: "directory",
      children: [
        {
          name: "packages",
          type: "directory",
          children: [
            {
              name: "react",
              type: "directory",
              children: [
                {
                  name: "src",
                  type: "directory",
                  children: [
                    { name: "React.js", type: "file" },
                    { name: "ReactElement.js", type: "file" },
                  ],
                },
                { name: "package.json", type: "file" },
              ],
            },
            {
              name: "react-dom",
              type: "directory",
              children: [
                {
                  name: "src",
                  type: "directory",
                  children: [{ name: "ReactDOM.js", type: "file" }],
                },
                { name: "package.json", type: "file" },
              ],
            },
            {
              name: "react-reconciler",
              type: "directory",
              children: [
                {
                  name: "src",
                  type: "directory",
                  children: [
                    { name: "ReactFiber.js", type: "file" },
                    { name: "ReactFiberWorkLoop.js", type: "file" },
                  ],
                },
              ],
            },
          ],
        },
        { name: "fixtures", type: "directory" },
        { name: "scripts", type: "directory" },
        { name: "package.json", type: "file" },
        { name: "README.md", type: "file" },
      ],
    },
    scannedAt: "2026-07-09T01:30:00Z",
  },
  {
    id: "2",
    repoUrl: "https://github.com/shadcn-ui/ui",
    owner: "shadcn-ui",
    name: "ui",
    description:
      "Beautifully designed components built with Radix UI and Tailwind CSS. accessible, customizable, and open-source. Not a component library, but a code-generation utility.",
    stars: 71200,
    forks: 5800,
    languages: [
      { name: "TypeScript", percentage: 95.8, color: "#3178c6" },
      { name: "CSS", percentage: 3.2, color: "#563d7c" },
      { name: "Other", percentage: 1.0, color: "#858585" },
    ],
    techStack: [
      "Next.js",
      "React",
      "Radix UI",
      "Tailwind CSS",
      "Zod",
      "TypeScript",
      "Commander.js",
    ],
    healthScore: 98,
    healthMetrics: {
      documentation: 99,
      codeQuality: 98,
      maintainability: 97,
      complexity: 96,
      testing: 88,
    },
    entryPoints: ["packages/cli/src/index.ts", "apps/www/components/main-nav.tsx"],
    suggestedStartingFolders: ["packages/cli", "apps/www/registry", "apps/www/ui"],
    roadmap: [
      {
        id: "shad-1",
        phase: "Phase 1",
        title: "CLI Command Orchestration",
        description:
          "Analyze the entry commands for shadcn initialization and component generation.",
        estimatedTime: "2-3 hours",
        difficulty: "Beginner",
        items: [
          "Understand packages/cli/src/commands/init.ts command registry",
          "Observe how user options are mapped using commander",
          "Inspect how tsconfig.json paths are verified",
        ],
      },
      {
        id: "shad-2",
        phase: "Phase 2",
        title: "Theme Registry & CSS Variable parsing",
        description:
          "Investigate how component JSON config maps template strings into the local styles sheet.",
        estimatedTime: "3-4 hours",
        difficulty: "Intermediate",
        items: [
          "Study apps/www/registry/themes.ts data object",
          "Read tailwind config transformer utility functions",
          "Understand how components are dynamically resolved on shadcn-ui servers",
        ],
      },
      {
        id: "shad-3",
        phase: "Phase 3",
        title: "Component Templates & Radix Primitives",
        description: "Study Radix primitives styling wrappers using tailwind-merge and clsx.",
        estimatedTime: "2-3 hours",
        difficulty: "Beginner",
        items: [
          "Analyze use of cn() utility across components",
          "Understand keyboard navigation hook integrations in sheet/dialog primitives",
        ],
      },
    ],
    goodFirstIssues: [
      {
        id: "sfi-1",
        title: "Add toast variant alignment options inside config schema",
        number: 4521,
        labels: ["good first issue", "enhancement"],
        difficulty: "Medium",
      },
      {
        id: "sfi-2",
        title: "Fix responsive padding issue in alert-dialog component layout",
        number: 4498,
        labels: ["good first issue", "bug"],
        difficulty: "Easy",
      },
    ],
    dependencies: [
      { name: "radix-ui", version: "^1.0.0", type: "core" },
      { name: "tailwind-merge", version: "^2.0.0", type: "core" },
      { name: "lucide-react", version: "^0.300.0", type: "core" },
      { name: "commander", version: "^11.0.0", type: "core" },
      { name: "tsx", version: "^4.0.0", type: "dev" },
      { name: "vitest", version: "^1.0.0", type: "dev" },
    ],
    folderStructure: {
      name: "ui",
      type: "directory",
      children: [
        {
          name: "apps",
          type: "directory",
          children: [
            {
              name: "www",
              type: "directory",
              children: [
                { name: "components", type: "directory" },
                { name: "registry", type: "directory" },
                { name: "package.json", type: "file" },
              ],
            },
          ],
        },
        {
          name: "packages",
          type: "directory",
          children: [
            {
              name: "cli",
              type: "directory",
              children: [
                {
                  name: "src",
                  type: "directory",
                  children: [
                    { name: "index.ts", type: "file" },
                    { name: "commands", type: "directory" },
                  ],
                },
                { name: "package.json", type: "file" },
              ],
            },
          ],
        },
        { name: "package.json", type: "file" },
        { name: "README.md", type: "file" },
      ],
    },
    scannedAt: "2026-07-08T18:45:00Z",
  },
];
