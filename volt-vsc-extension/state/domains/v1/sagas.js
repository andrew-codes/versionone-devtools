const { call, put, select, takeEvery } = require("redux-saga/effects");
const createV1Api = require("../../../api");
const { actions, actionCreators } = require("./actions");
const {
  getAccessToken,
  getActiveWorkitem,
  getCurrentTeamRoom,
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
    )
];

function* startPrimaryWorkitem() {
  try {
    const teamRoom = yield select(getCurrentTeamRoom);
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

  const storyStatuses = yield call(api.query, {
    from: "Status",
    select: ["AssetType", "Description", "Name", "Order", "RollupState"],
    where: {
      ID: activePwi.status
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
