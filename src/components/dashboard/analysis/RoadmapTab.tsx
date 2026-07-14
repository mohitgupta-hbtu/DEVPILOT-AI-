import React from "react";
import { useRepository } from "./RepositoryContext";
import { InteractiveRoadmap } from "../InteractiveRoadmap";

export function RoadmapTab() {
  const { activeResult, onNavigateToFile } = useRepository();

  if (!activeResult) return null;

  return (
    <div role="tabpanel" id="tab-panel-roadmap" aria-labelledby="tab-trigger-roadmap">
      <InteractiveRoadmap
        roadmap={activeResult.roadmap}
        repoUrl={activeResult.repoUrl}
        repoName={activeResult.name}
        onNavigateToFile={onNavigateToFile}
      />
    </div>
  );
}
export default RoadmapTab;
