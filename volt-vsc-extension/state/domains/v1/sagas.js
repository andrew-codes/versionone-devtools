const { call, put, select, takeEvery } = require("redux-saga/effects");
const { uniq } = require("underscore");
const createV1Api = require("../../../api");
const { actions, actionCreators } = require("./actions");
const {
  getAccessToken,
  getInDevelopingStatus,
  getFutureStatus,
  getMyself
} = require("./selectors");
const { sendCommand } = require("../../../terminal");

module.exports = [
  () => takeEvery(actions.setAccessToken, setMyMemberData),
  () => takeEvery(actions.setActiveWorkitem, persistActiveWorkitem),
  () => takeEvery(actions.setActiveWorkitem, checkoutWorkitemBranch),
  () => takeEvery(actions.setCurrentTeamRoom, fetchAssetsForTeamRoom),
  () =>
    takeEvery(
      actions.showDetailsOfActivePrimaryWorkitem,
      showDetailsOfActivePrimaryWorkitem
    )
];

function* fetchAssetsForTeamRoom({ payload: { teamRoom } }) {
  try {
    const accessToken = yield select(getAccessToken);
    const api = createV1Api(accessToken);
    const storyStatuses = yield call(api.query, {
      from: "Status",
      select: ["AssetType", "Description", "Name", "Order", "RollupState"],
      where: {
        "Team.Rooms": teamRoom._oid
      }
    });
    const testStatuses = yield call(api.query, {
      from: "TestStatus",
      select: ["AssetType", "Description", "Name", "Order"],
      filter: ["AssetState!='Closed'"]
    });
    const taskStatues = yield call(api.query, {
      from: "TaskStatus",
      select: ["AssetType", "Description", "Name", "Order"],
      filter: ["AssetState!='Closed'"]
    });
    const statuses = storyStatuses.data[0]
      .concat(testStatuses.data[0])
      .concat(taskStatues.data[0]);
    yield put(actionCreators.setStatuses({ statuses }));

    const futureStatus = yield select(getFutureStatus);
    const myself = yield select(getMyself);
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
        "Children"
      ],
      where: {
        "Team.Rooms": teamRoom._oid,
        Status: futureStatus._oid,
        AssetState: "Active"
      }
    });
    const mypwis = yield call(api.query, {
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
        "Children"
      ],
      where: {
        "Team.Rooms": teamRoom._oid,
        Owners: myself._oid,
        AssetState: "Active"
      }
    });
    yield put(
      actionCreators.setPrimaryWorkitems({
        items: uniq(pwis.data[0].concat(mypwis.data[0]))
      })
    );
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
function* persistActiveWorkitem({ payload: { workitem } }) {
  try {
    const accessToken = yield select(getAccessToken);
    const api = createV1Api(accessToken);
    const status = yield select(getInDevelopingStatus);
    const myself = yield select(getMyself);
    yield call(api.update, workitem._oid, {
      Owners: [myself._oid],
      Status: status._oid
    });
  } catch (e) {
    console.error(e);
  }
}
function* checkoutWorkitemBranch({ payload: { workitem } }) {
  try {
    const branchName = `${workitem.number}_${workitem.name.replace(/ /g, "-")}`;
    sendCommand("git stash");
    sendCommand(`git checkout -b ${branchName}`);
    sendCommand(`git checkout ${branchName}`);
    sendCommand("git stash pop");
  } catch (e) {
    console.error(e);
  }
}
function* showDetailsOfActivePrimaryWorkitem({ payload: { item } }) {
  const accessToken = yield select(getAccessToken);
  const api = createV1Api(accessToken);
  const pwiTests = yield call(api.query, {
    from: "Test",
    select: ["Name", "Description", "Status", "AssetType", "Number"],
    filter: ["AssetState!='Closed'", `ParentAndMe='${item._oid}'`]
  });
  const pwiTasks = yield call(api.query, {
    from: "Task",
    select: ["Name", "Description", "Status", "AssetType", "Number"],
    filter: ["AssetState!='Closed'", `ParentAndMe='${item._oid}'`]
  });
  yield put(
    actionCreators.setPrimaryWorkitemChildren({
      tasks: pwiTasks.data[0],
      tests: pwiTests.data[0]
    })
  );
  yield put(actionCreators.markAssetDetailsWebviewPanelToBeVisible());
}
