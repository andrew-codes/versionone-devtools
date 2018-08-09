const createActionNames = require("./../../createActionNames");
const { createAction } = require("redux-actions");

const actions = createActionNames("v1", [
  "showReactWebviewPanel",
  "hideReactWebviewPanel",
  "reset",
  "setAccessToken",
  "setActiveWorkitem",
  "markAssetDetailsWebviewPanelToBeVisible",
  "setCurrentTeamRoom",
  "setMyDetails",
  "setPrimaryWorkitems",
  "setStatuses",
  "setTeamRooms",
  "setUsername",
  "showDetailsOfActivePrimaryWorkitem"
]);

module.exports.actions = actions;
module.exports.actionCreators = {
  showReactWebviewPanel: createAction(actions.showReactWebviewPanel),
  hideReactWebviewPanel: createAction(actions.hideReactWebviewPanel),
  reset: createAction(actions.reset),
  setAccessToken: createAction(actions.setAccessToken),
  setActiveWorkitem: createAction(actions.setActiveWorkitem),
  markAssetDetailsWebviewPanelToBeVisible: createAction(
    actions.markAssetDetailsWebviewPanelToBeVisible
  ),
  setCurrentTeamRoom: createAction(actions.setCurrentTeamRoom),
  setMyDetails: createAction(actions.setMyDetails),
  setPrimaryWorkitems: createAction(actions.setPrimaryWorkitems),
  setStatuses: createAction(actions.setStatuses),
  setTeamRooms: createAction(actions.setTeamRooms),
  setUsername: createAction(actions.setUsername),
  showDetailsOfActivePrimaryWorkitem: createAction(
    actions.showDetailsOfActivePrimaryWorkitem
  )
};
