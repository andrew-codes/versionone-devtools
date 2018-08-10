import React from "React";
import AssetDetails from "./AssetDetails";
import { getActiveAssetDetails } from "./../state/domains/v1/selectors";

function App(props) {
  const currentAsset = getActiveAssetDetails(props.state);
  return (
    <div>
      <AssetDetails {...currentAsset} />
    </div>
  );
}
export default App;
