import React from "react";
import { useRepository } from "./RepositoryContext";
import { InteractiveHealth } from "../InteractiveHealth";

export function HealthTab() {
  const { activeResult, onNavigateToFile } = useRepository();

  if (!activeResult) return null;

  return (
    <div role="tabpanel" id="tab-panel-health" aria-labelledby="tab-trigger-health">
      <InteractiveHealth
        metrics={activeResult.healthMetrics}
        recommendations={activeResult.healthRecommendations}
        explanations={activeResult.healthExplanations}
        repoUrl={activeResult.repoUrl}
        repoName={activeResult.name}
        overallHealthScore={activeResult.healthScore}
        onNavigateToFile={onNavigateToFile}
      />
    </div>
  );
}
export default HealthTab;
