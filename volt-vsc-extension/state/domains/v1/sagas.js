const { call, put, select, takeEvery } = require("redux-saga/effects");
const createV1Api = require("../../../api");
const { actions, actionCreators } = require("./actions");
const {
  getAccessToken,
  getActiveWorkitem,
  getCurrentTeamRoom,
  getDevCompleteStatus,
  getInDevelopingStatus,
  getMyself
} = require("./selectors");
const { sendCommand } = require("../../../terminal");

module.exports = [
  () => takeEvery(actions.setAccessToken, fetchMyMemberDetails),
  () => takeEvery(actions.changeTeamRoom, fetchTeamRooms),
  () => takeEvery(actions.setActiveWorkitem, persistActiveWorkitem),
  () => takeEvery(actions.setActiveWorkitem, checkoutWorkitemBranch),
  () => takeEvery(actions.startPrimaryWorkitem, startPrimaryWorkitem),
  () =>
    takeEvery(
      actions.showDetailsOfActivePrimaryWorkitem,
      showDetailsOfActivePrimaryWorkitem
    ),
  () => takeEvery(actions.setTestStatus, persistUpdatedTestStatus),
  () => takeEvery(actions.setTaskStatus, persistUpdatedTaskStatus),
  () => takeEvery(actions.markAsDevComplete, persistMarkAsDevComplete),
  () => takeEvery(actions.setCurrentTeamRoom, getTeamRoomStatuses)
];

function* getTeamRoomStatuses({ payload: { teamRoom } }) {
  const accessToken = yield select(getAccessToken);
  const api = createV1Api(accessToken);

  const storyStatuses = yield call(api.query, {
    from: "StoryStatus",
    select: ["AssetType", "Name", "RollupState"],
    filter: ["Team=$Team;AssetState!='Closed'"],
    with: {
      $Team: teamRoom.team
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
}
function* startPrimaryWorkitem() {
  try {
    const teamRoom = yield select(getCurrentTeamRoom);
    const accessToken = yield select(getAccessToken);
    const api = createV1Api(accessToken);

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
      filter: ["Team=$Team;Scope=$Scope;AssetState!='Closed'"],
      with: {
        $Team: teamRoom.team,
        $Scope: teamRoom.scope !== "NULL" ? teamRoom.scope : undefined
      }
    });
    yield put(
      actionCreators.setPrimaryWorkitems({
        items: pwis.data[0]
      })
    );
    console.log(pwis.data[0]);
    yield put(actionCreators.showPrimaryWorkitemSelector());
  } catch (e) {
    console.error(e);
  }
}
function* fetchMyMemberDetails({ payload: { token } }) {
  try {
    const api = createV1Api(token);
    yield put(actionCreators.membersFetching());
    const myselfQueryResponse = yield call(api.query, {
      from: "Member",
      select: ["AssetType", "Avatar", "Name"],
      where: {
        "OwnedGrants.Token": token
      }
    });
    const member = myselfQueryResponse.data[0][0];
    yield put(actionCreators.setMyDetails({ member }));
    yield put(actionCreators.membersFetchingDone());
  } catch (e) {
    console.error(e);
  }
}
function* fetchTeamRooms() {
  try {
    const accessToken = yield select(getAccessToken);
    const api = createV1Api(accessToken);
    const myself = yield select(getMyself);

    const teamRoomsQueryResponse = yield call(api.query, {
      from: "TeamRoom",
      select: ["Team", "Name", "Scope", "Schedule", "Schedule.Timeboxes"],
      where: {
        Participants: myself._oid
      }
    });
    const teamRooms = teamRoomsQueryResponse.data[0];
    yield put(actionCreators.setTeamRooms({ teamRooms }));

    yield put(actionCreators.showTeamRoomSelector());
  } catch (error) {
    console.error(error);
  }
}
function* persistAssetUpdate(oid, asset) {
  const accessToken = yield select(getAccessToken);
  const api = createV1Api(accessToken);
  return yield call(api.update, oid, asset);
}
function* persistActiveWorkitem({ payload: { workitem } }) {
  try {
    const status = yield select(getInDevelopingStatus);
    const myself = yield select(getMyself);
    yield persistAssetUpdate(
      workitem._oid,
      Object.assign(
        {},
        {
          Owners: [myself._oid],
          Status: status._oid
        }
      )
    );
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
function* showDetailsOfActivePrimaryWorkitem() {
  const accessToken = yield select(getAccessToken);
  const api = createV1Api(accessToken);

  const activePwi = yield select(getActiveWorkitem);
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
      ID: activePwi._oid
    }
  });
  yield put(
    actionCreators.setPrimaryWorkitems({
      items: pwis.data[0]
    })
  );

  const pwiTests = yield call(api.query, {
    from: "Test",
    select: ["Name", "Description", "Status", "AssetType", "Number"],
    filter: ["AssetState!='Closed'", `ParentAndMe='${activePwi._oid}'`]
  });
  const pwiTasks = yield call(api.query, {
    from: "Task",
    select: ["Name", "Description", "Status", "AssetType", "Number"],
    filter: ["AssetState!='Closed'", `ParentAndMe='${activePwi._oid}'`]
  });
  yield put(
    actionCreators.setPrimaryWorkitemChildren({
      tasks: pwiTasks.data[0],
      tests: pwiTests.data[0]
    })
  );
  yield put(actionCreators.markAssetDetailsWebviewPanelToBeVisible());
}

function* persistUpdatedTestStatus({ payload: { test, status } }) {
  try {
    yield persistAssetUpdate(
      test._oid,
      Object.assign({}, { Status: status._oid })
    );
  } catch (e) {
    console.error(e);
  }
}

function* persistUpdatedTaskStatus({ payload: { task, status } }) {
  try {
    yield persistAssetUpdate(
      task._oid,
      Object.assign({}, { Status: status._oid })
    );
  } catch (e) {
    console.error(e);
  }
}
function* persistMarkAsDevComplete({ payload }) {
  try {
    const devCompleteStatus = yield select(getDevCompleteStatus);
    yield persistAssetUpdate(
      payload._oid,
      Object.assign({}, { Status: devCompleteStatus._oid })
    );
  } catch (e) {
    console.error(e);
  }
}
