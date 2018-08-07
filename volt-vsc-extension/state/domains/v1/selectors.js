module.exports.getAccessToken = state => state.v1.accessToken;
module.exports.getCurrentTeamOidToken = state => state.v1.currentTeam;
module.exports.getTeams = state =>
  Object.keys(state.v1.teams).map(oid => state.v1.teams[oid]);
module.exports.getTeamPrimaryWorkitems = state =>
  state.v1.primaryWorkitemOrder.map(oid => state.v1.primaryWorkitems[oid]);
