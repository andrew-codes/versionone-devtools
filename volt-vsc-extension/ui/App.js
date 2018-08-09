import React from "React";
import { connect } from "react-redux";
import AssetDetails from "./AssetDetails";
import { getActiveAssetDetails } from "./../state/domains/v1/selectors";

function App(props) {
  return (
    <div>
      <AssetDetails {...props.currentAsset} />
    </div>
  );
}

function mapStateToProps(state) {
  return {
    currentAsset: getActiveAssetDetails(state)
  };
}

export default connect(mapStateToProps)(App);
