import React, { useState } from "react";
import { useRepository } from "./RepositoryContext";
import { InteractiveCodeTree } from "../InteractiveCodeTree";

export function CodeTreeTab() {
  const { activeResult } = useRepository();
  const [selectedFile, setSelectedFile] = useState<string>("");

  if (!activeResult) return null;

  return (
    <div role="tabpanel" id="tab-panel-files" aria-labelledby="tab-trigger-files">
      <InteractiveCodeTree
        folderStructure={activeResult.folderStructure}
        repoUrl={activeResult.repoUrl}
        repoName={activeResult.name}
        selectedFile={selectedFile}
        onSelectFile={setSelectedFile}
      />
    </div>
  );
}
export default CodeTreeTab;
