const _ = require("underscore");
const { handleActions } = require("redux-actions");
const { actions } = require("./actions");
const { compose, indexBy, isDate, isObject, partial, uniq } = _;

const defaultState = {
  members: {},
  primaryWorkitems: {},
  teamRooms: {}
};

const reducer = handleActions(
  {
    [actions.reset]: () => defaultState,
    [actions.setAccessToken]: (state, { payload: { token } }) =>
      Object.assign({}, state, {
        accessToken: token
      }),
    [actions.setActiveWorkitem]: (state, { payload: { workitem } }) =>
      Object.assign({}, state, {
        activeWorkitem: workitem._oid,
        primaryWorkitems: Object.assign({}, state.primaryWorkitems, {
          [workitem._oid]: Object.assign(
            {},
            state.primaryWorkitems[workitem._oid],
            {
              owners: uniq(
                state.primaryWorkitems[workitem._oid].owners.concat([
                  state.myself
                ])
              ),
              status: "StoryStatus:1151474"
            }
          )
        })
      }),
    [actions.setCurrentTeamRoom]: (state, { payload: { teamRoom } }) =>
      Object.assign({}, state, {
        currentTeam: teamRoom._oid
      }),
    [actions.setMyDetails]: (state, { payload: { member } }) => {
      const myself = normalize(member);
      return Object.assign({}, state, {
        myself: myself._oid,
        members: Object.assign({}, state.members, indexBy([myself], "_oid"))
      });
    },
    [actions.setPrimaryWorkitems]: (state, { payload: { items } }) => {
      const pwis = normalize(items);
      const children = pwis.reduce(
        (prev, pwi) =>
          prev.concat(
            pwi.children.map((childOid, index) => ({
              _oid: childOid,
              assetType: pwi["children.AssetType"][index],
              description: pwi["children.Description"][index],
              name: pwi["children.Name"][index],
              number: pwi["children.Number"][index]
            }))
          ),
        []
      );
      return Object.assign({}, state, {
        tasks: indexBy(
          children.filter(child => child.assetType === "Task"),
          "_oid"
        ),
        tests: indexBy(
          children.filter(child => child.assetType === "Test"),
          "_oid"
        ),
        primaryWorkitems: indexBy(pwis, "_oid"),
        primaryWorkitemOrder: pwis.map(pwi => pwi._oid)
      });
    },
    [actions.setStatuses]: (state, { payload: { statuses } }) =>
      Object.assign({}, state, {
        statuses: indexBy(normalize(statuses), "_oid")
      }),
    [actions.setTeamRooms]: (state, { payload: { teamRooms } }) =>
      Object.assign({}, state, {
        teamRooms: indexBy(normalize(teamRooms), "_oid")
      }),
    [actions.markAssetDetailsWebviewPanelToBeVisible]: state =>
      Object.assign({}, state, {
        markReactViewPanelToBeVisible: true
      }),
    [actions.showReactWebviewPanel]: state =>
      Object.assign({}, state, {
        reactViewPanelIsVisible: true,
        markReactViewPanelToBeVisible: false
      }),
    [actions.hideReactWebviewPanel]: state =>
      Object.assign({}, state, {
        reactViewPanelIsVisible: false,
        markReactViewPanelToBeVisible: false
      })
  },
  defaultState
);

module.exports = { v1: reducer };

function normalize(value) {
  return compose(
    normalizeOidRelations,
    toLowerCaseProperties
  )(value);
}
function toLowerCaseProperties(value) {
  if (Array.isArray(value)) return value.map(toLowerCaseProperties);
  if (!isObject(value)) return value;
  if (isDate(value)) return value;

  return Object.keys(value).reduce(
    (prev, key) =>
      Object.assign({}, prev, {
        [`${key[0].toLowerCase()}${key.slice(1)}`]: toLowerCaseProperties(
          value[key]
        )
      }),
    {}
  );
}

function normalizeOidRelations(value, initialSet = false) {
  if (
    initialSet &&
    Array.isArray(value) &&
    value.filter(v => v).find(v => v._oid)
  )
    return value.map(v => v._oid);
  if (Array.isArray(value))
    return value.map(partial(normalizeOidRelations, _, true));
  if (!isObject(value)) return value;
  if (isDate(value)) return value;

  return Object.keys(value).reduce((prev, key) => {
    return Object.assign({}, prev, {
      [key]:
        initialSet && value[key] && value[key]._oid
          ? value[key]._oid
          : normalizeOidRelations(value[key], true)
    });
  }, {});
}
