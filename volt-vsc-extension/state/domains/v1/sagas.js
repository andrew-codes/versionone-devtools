const { call, put, select, takeEvery } = require("redux-saga/effects");
const createV1Api = require("../../../api");
const { actions, actionCreators } = require("./actions");
const { getAccessToken } = require("./selectors");

module.exports = [
  () => takeEvery(actions.setCurrentTeam, fetchPrimaryWorkitemsForTeam),
  () => takeEvery(actions.setAccessToken, setMyMemberData)
];

function* fetchPrimaryWorkitemsForTeam({ payload: { team } }) {
  try {
    const accessToken = yield select(getAccessToken);
    const api = createV1Api(accessToken);
    const { data } = yield call(api.query, {
      from: "PrimaryWorkitem",
      select: [
        "AssetType",
        "Description",
        "Name",
        "Number",
        "Owners",
        "Priority",
        "Scope",
        "Status",
        "Children",
        "Children.Number",
        "Children.Name",
        "Children.Description",
        "Children.AssetType"
      ],
      where: {
        Team: team._oid
      }
    });
    yield put(actionCreators.setPrimaryWorkitems({ items: data[0] }));
  } catch (e) {
    console.error(e);
  }
}
function* setMyMemberData({ payload: { token } }) {
  try {
    const api = createV1Api(token);

    const { data } = yield call(api.query, {
      from: "Member",
      select: ["AssetType", "Avatar", "Name"],
      where: {
        "OwnedGrants.Token": token
      }
    });
    const member = data[0][0];
    yield put(actionCreators.setMyDetails({ member }));
  } catch (e) {
    console.error(e);
  }
}
