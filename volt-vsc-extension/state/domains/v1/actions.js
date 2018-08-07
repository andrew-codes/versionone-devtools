const createActionNames = require("./../../createActionNames");
const { createAction } = require("redux-actions");

const actions = createActionNames("v1", [
  "reset",
  "setAccessToken",
  "setCurrentTeam",
  "setMyDetails",
  "setPrimaryWorkitems",
  "setTeams",
  "setUsername"
]);

module.exports.actions = actions;
module.exports.actionCreators = {
  reset: createAction(actions.reset),
  setAccessToken: createAction(actions.setAccessToken),
  setCurrentTeam: createAction(actions.setCurrentTeam),
  setMyDetails: createAction(actions.setMyDetails),
  setPrimaryWorkitems: createAction(actions.setPrimaryWorkitems),
  setTeams: createAction(actions.setTeams),
  setUsername: createAction(actions.setUsername)
};
