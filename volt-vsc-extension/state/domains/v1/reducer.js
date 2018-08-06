const { indexBy, isDate, isObject } = require("underscore");
const { handleActions } = require("redux-actions");
const { actions } = require("./actions");
const reducer = handleActions(
  {
    [actions.setAccessToken]: (state, { payload: { token } }) =>
      Object.assign({}, state, {
        accessToken: token
      }),
    [actions.setCurrentTeam]: (state, { payload: { teamName } }) =>
      Object.assign({}, state, {
        currentTeam: Object.keys(state.teams).find(
          oidToken => state.teams[oidToken].name === teamName
        )
      }),
    [actions.setTeams]: (state, { payload: { teams } }) =>
      Object.assign({}, state, {
        teams: Object.assign(
          {},
          state.teams,
          indexBy(normalize(teams), "oidToken")
        )
      })
  },
  {}
);

module.exports = { v1: reducer };

function normalize(items) {
  return items
    .map(item => toLowerCaseProperties(item))
    .map(item => Object.assign(item, { oidToken: item._oid }));
}
function toLowerCaseProperties(item) {
  if (!isObject(item)) return item;
  if (isDate(item)) return item;

  return Object.keys(item).reduce(
    (prev, key) =>
      Object.assign({}, prev, {
        [`${key[0].toLowerCase()}${key.slice(1)}`]: toLowerCaseProperties(
          item[key]
        )
      }),
    {}
  );
}
