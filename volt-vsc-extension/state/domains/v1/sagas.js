const { call, put, select, takeEvery } = require("redux-saga/effects");
const createV1Api = require("../../../api");
const { actions, actionCreators } = require("./actions");
const { getAccessToken, getCurrentTeamOidToken } = require("./selectors");

module.exports = [
  () => takeEvery(actions.setCurrentTeam, setCurrentTeam),
  () => takeEvery(actions.setAccessToken, setMyMemberData)
];

function* setCurrentTeam({ payload: { teamName } }) {
  try {
    const accessToken = yield select(getAccessToken);
    const api = createV1Api(accessToken);
    const currentTeamOidToken = yield select(getCurrentTeamOidToken);

    // const { data } = yield call(api.query, {
    //   from: "Members",
    //   select: ["Avatar", "Name"],
    //   where: {
    //     Username: username
    //   }
    // });

    // yield put(actions.setMembersDetails({ members: data }));
  } catch (e) {
    console.error(e);
  }
}
function* setMyMemberData({ payload: { token } }) {
  try {
    console.log("wtf", token);
    const api = createV1Api(token);

    const { data } = yield call(api.query, {
      from: "Member",
      select: ["Avatar", "Name"],
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
