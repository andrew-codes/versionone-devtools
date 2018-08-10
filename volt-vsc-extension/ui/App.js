import React from "React";
import AssetDetails from "./AssetDetails";
import {
  getActiveAssetDetails,
  getTestReadyStatus,
  getTestDevelopingStatus
} from "./../state/domains/v1/selectors";

function App({ api, state }) {
  const currentAsset = getActiveAssetDetails(state);
  const testReadyStatus = getTestReadyStatus(state);
  const testDevelopingStatus = getTestDevelopingStatus(state);
  return (
    <div>
      <AssetDetails
        {...currentAsset}
        dispatch={api.postMessage}
        testReadyStatus={testReadyStatus}
        testDevelopingStatus={testDevelopingStatus}
      />
    </div>
  );
}
export default App;
