const createActionNames = require("./../../createActionNames");
const { createAction } = require("redux-actions");

const actions = createActionNames("v1", [
  "setAccessToken",
  "setCurrentTeam",
  "setTeams",
  "setUsername"
]);

module.exports.actions = actions;
module.exports.actionCreators = {
  setAccessToken: createAction(actions.setAccessToken),
  setCurrentTeam: createAction(actions.setCurrentTeam),
  setTeams: createAction(actions.setTeams),
  setUsername: createAction(actions.setUsername)
};
