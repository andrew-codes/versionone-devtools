const { call, put, select, takeEvery } = require("redux-saga/effects");
const createV1Api = require("../../../api");
const { actions, actionCreators } = require("./actions");
const {
  getAccessToken,
  getCurrentTeamRoom,
  getFutureStatus
} = require("./selectors");

module.exports = [
  () => takeEvery(actions.setCurrentTeamRoom, fetchPrimaryWorkitemsForTeamRoom),
  () => takeEvery(actions.setAccessToken, setMyMemberData)
];

function* fetchPrimaryWorkitemsForTeamRoom({ payload: { teamRoom } }) {
  try {
    const accessToken = yield select(getAccessToken);
    const api = createV1Api(accessToken);
    const statuses = yield call(api.query, {
      from: "Status",
      select: ["AssetType", "Description", "Name", "Order", "RollupState"],
      where: {
        "Team.Rooms": teamRoom._oid
      }
    });
    yield put(actionCreators.setStatuses({ statuses: statuses.data[0] }));
    const futureStatus = yield select(getFutureStatus);
    const pwis = yield call(api.query, {
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
        "Status.Name",
        "Children",
        "Children.Number",
        "Children.Name",
        "Children.Description",
        "Children.AssetType"
      ],
      where: {
        "Team.Rooms": teamRoom._oid,
        Status: futureStatus._oid,
        AssetState: "Active"
      }
    });
    yield put(actionCreators.setPrimaryWorkitems({ items: pwis.data[0] }));
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
