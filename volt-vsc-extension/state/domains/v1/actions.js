const createActionNames = require("./../../createActionNames");
const { createAction } = require("redux-actions");

const actions = createActionNames("v1", [
  "membersFetching",
  "membersFetchingDone",
  "changeTeamRoom",
  "showTeamRoomSelector",
  "startPrimaryWorkitem",
  "showPrimaryWorkitemSelector",
  "showReactWebviewPanel",
  "hideReactWebviewPanel",
  "reset",
  "setAccessToken",
  "setActiveWorkitem",
  "markAssetDetailsWebviewPanelToBeVisible",
  "setCurrentTeamRoom",
  "setMyDetails",
  "setPrimaryWorkitemChildren",
  "setPrimaryWorkitems",
  "setStatuses",
  "setTeamRooms",
  "setUsername",
  "showDetailsOfActivePrimaryWorkitem",
  "setTestStatus",
  "setTaskStatus"
]);

module.exports.actions = actions;
module.exports.actionCreators = {
  membersFetching: createAction(actions.membersFetching),
  membersFetchingDone: createAction(actions.membersFetchingDone),
  changeTeamRoom: createAction(actions.changeTeamRoom),
  showTeamRoomSelector: createAction(actions.showTeamRoomSelector),
  startPrimaryWorkitem: createAction(actions.startPrimaryWorkitem),
  showPrimaryWorkitemSelector: createAction(
    actions.showPrimaryWorkitemSelector
  ),
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
  setPrimaryWorkitemChildren: createAction(actions.setPrimaryWorkitemChildren),
  setPrimaryWorkitems: createAction(actions.setPrimaryWorkitems),
  setStatuses: createAction(actions.setStatuses),
  setTestStatus: createAction(actions.setTestStatus),
  setTaskStatus: createAction(actions.setTaskStatus),
  setTeamRooms: createAction(actions.setTeamRooms),
  setUsername: createAction(actions.setUsername),
  showDetailsOfActivePrimaryWorkitem: createAction(
    actions.showDetailsOfActivePrimaryWorkitem
  )
};
