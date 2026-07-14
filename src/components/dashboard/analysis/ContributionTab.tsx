import React from "react";
import { useRepository } from "./RepositoryContext";
import { InteractiveContribution } from "../InteractiveContribution";

export function ContributionTab() {
  const { activeResult, onNavigateToFile } = useRepository();

  if (!activeResult) return null;

  return (
    <div role="tabpanel" id="tab-panel-contribution" aria-labelledby="tab-trigger-contribution">
      <InteractiveContribution
        issues={activeResult.goodFirstIssues}
        repoUrl={activeResult.repoUrl}
        repoName={activeResult.name}
        onNavigateToFile={onNavigateToFile}
        repoLanguages={activeResult.languages}
      />
    </div>
  );
}
export default ContributionTab;
