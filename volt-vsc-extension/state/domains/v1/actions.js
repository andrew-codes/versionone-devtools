const createActionNames = require("./../../createActionNames");
const { createAction } = require("redux-actions");

const actions = createActionNames("v1", [
  "reset",
  "setAccessToken",
  "setCurrentTeamRoom",
  "setMyDetails",
  "setPrimaryWorkitems",
  "setStatuses",
  "setTeamRooms",
  "setUsername"
]);

module.exports.actions = actions;
module.exports.actionCreators = {
  reset: createAction(actions.reset),
  setAccessToken: createAction(actions.setAccessToken),
  setCurrentTeamRoom: createAction(actions.setCurrentTeamRoom),
  setMyDetails: createAction(actions.setMyDetails),
  setPrimaryWorkitems: createAction(actions.setPrimaryWorkitems),
  setStatuses: createAction(actions.setStatuses),
  setTeamRooms: createAction(actions.setTeamRooms),
  setUsername: createAction(actions.setUsername)
};
