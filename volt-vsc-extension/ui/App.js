import React from "React";
import AssetDetails from "./AssetDetails";
import {
  getActiveAssetDetails,
  getTestReadyStatus,
  getTestDevelopingStatus,
  getTaskReadyStatus,
  getTaskDevelopingStatus
} from "./../state/domains/v1/selectors";

function App({ api, state }) {
  const currentAsset = getActiveAssetDetails(state);
  const testReadyStatus = getTestReadyStatus(state);
  const testDevelopingStatus = getTestDevelopingStatus(state);
  const taskReadyStatus = getTaskReadyStatus(state);
  const taskDevelopingStatus = getTaskDevelopingStatus(state);
  return (
    <div>
      <AssetDetails
        {...currentAsset}
        dispatch={api.postMessage}
        testReadyStatus={testReadyStatus}
        testDevelopingStatus={testDevelopingStatus}
        taskReadyStatus={taskReadyStatus}
        taskDevelopingStatus={taskDevelopingStatus}
      />
    </div>
  );
}
export default App;
