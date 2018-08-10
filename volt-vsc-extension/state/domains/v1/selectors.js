const { contains } = require("underscore");
const { createSelector } = require("reselect");

const getRoot = state => state.v1;
module.exports.getAccessToken = createSelector(
  [getRoot],
  root => root.accessToken
);
const getCurrentTeamRoomOid = createSelector(
  [getRoot],
  root => root.currentTeam
);
const getTeamRoomMap = createSelector([getRoot], root => root.teamRooms);
module.exports.getTeamRooms = createSelector([getTeamRoomMap], teamMap =>
  Object.keys(teamMap).map(oid => teamMap[oid])
);
module.exports.getCurrentTeamRoom = createSelector(
  [getCurrentTeamRoomOid, getTeamRoomMap],
  (currentTeamRoomOid, teamRoomMap) => teamRoomMap[currentTeamRoomOid]
);
const getPrimaryWorkItemMap = createSelector(
  [getRoot],
  root => root.primaryWorkitems
);
const getPrimaryWorkitemOrder = createSelector(
  [getRoot],
  root => root.primaryWorkitemOrder
);
const getTeamPrimaryWorkitems = createSelector(
  [getPrimaryWorkitemOrder, getPrimaryWorkItemMap],
  (pwiOrder, pwiMap) => pwiOrder.map(oid => pwiMap[oid])
);
const getStatusMap = createSelector([getRoot], root => root.statuses);
const getFutureStatus = createSelector(
  [getStatusMap],
  statusMap =>
    statusMap[
      Object.keys(statusMap).find(
        oid => statusMap[oid].rollupState === "Future"
      )
    ]
);
module.exports.getFutureStatus = getFutureStatus;
const getFuturePrimaryWorkItems = createSelector(
  [getTeamPrimaryWorkitems, getFutureStatus],
  (pwis, futureStatus) => pwis.filter(pwi => pwi.status === futureStatus._oid)
);

const getMemberMap = createSelector([getRoot], root => root.members);
const getMyselfOid = createSelector([getRoot], root => root.myself);
const getMyself = createSelector(
  [getMyselfOid, getMemberMap],
  (myselfOid, memberMap) => memberMap[myselfOid]
);
const getInDevelopingStatus = createSelector(
  [getStatusMap],
  statusMap => statusMap["StoryStatus:1151474"]
);
const getMyInProgressPrimaryWorkitems = createSelector(
  [getPrimaryWorkItemMap, getInDevelopingStatus, getMyself],
  (primaryWorkItemMap, inDevelopingStatus, myself) =>
    Object.keys(primaryWorkItemMap)
      .map(oid => primaryWorkItemMap[oid])
      .filter(
        pwi =>
          pwi.status === inDevelopingStatus._oid &&
          contains(pwi.owners, myself._oid)
      )
);
const getCandidatePrimaryWorkitems = createSelector(
  [getFuturePrimaryWorkItems, getMyInProgressPrimaryWorkitems],
  (futurePrimaryWorkItems, myInProgressPrimaryWorkitems) =>
    myInProgressPrimaryWorkitems.concat(futurePrimaryWorkItems)
);
const getActiveWorkitemOid = createSelector(
  [getRoot],
  root => root.activeWorkitem
);
const getActiveWorkitem = createSelector(
  [getPrimaryWorkItemMap, getActiveWorkitemOid],
  (pwiMap, currentPwi) => pwiMap[currentPwi]
);
const getTestReadyStatus = createSelector(
  [getStatusMap],
  statusMap => statusMap["TestStatus:103240"]
);
const getTaskReadyStatus = createSelector(
  [getStatusMap],
  statusMap => statusMap["TaskStatus:1025"]
);
const getTestMap = createSelector([getRoot], root => root.tests);
const getTaskMap = createSelector([getRoot], root => root.tasks);
const getActiveAssetDetails = createSelector(
  [
    getActiveWorkitem,
    getTestMap,
    getTaskMap,
    getTestReadyStatus,
    getTaskReadyStatus
  ],
  (activeWorkitem, testMap, taskMap, testReadyStatus, taskReadyStatus) => {
    const hydratedChildren = activeWorkitem.children.map(oid => {
      if (testMap[oid]) {
        return Object.assign({}, testMap[oid], {
          isReady: testMap[oid].status === testReadyStatus._oid
        });
      }
      return Object.assign({}, taskMap[oid], {
        isReady: taskMap[oid].status === taskReadyStatus._oid
      });
    });
    return Object.assign({}, activeWorkitem, {
      tasks: hydratedChildren.filter(child => child.assetType === "Task"),
      tests: hydratedChildren.filter(child => child.assetType === "Test")
    });
  }
);
const getShouldShowReactViewPanel = createSelector(
  [getRoot],
  root => !root.reactViewPanelIsVisible && !!root.markReactViewPanelToBeVisible
);
const getIfMembersAreBeingFetched = createSelector(
  [getRoot],
  root => root.membersFetching
);
const getIfShouldShowTeamRoomSelector = createSelector(
  [getRoot, getIfMembersAreBeingFetched],
  (root, areMembersBeingFetched) =>
    !areMembersBeingFetched && root.showTeamRoomSelector
);
const getShouldShowPrimaryWorkitemSelector = createSelector(
  [getRoot, getShouldShowReactViewPanel],
  (root, shouldShowReactViewPanel) =>
    !shouldShowReactViewPanel && root.showPrimaryWorkitemSelector
);

module.exports.getMyself = getMyself;
module.exports.getInDevelopingStatus = getInDevelopingStatus;
module.exports.getCandidatePrimaryWorkItems = getCandidatePrimaryWorkitems;
module.exports.getActiveWorkitem = getActiveWorkitem;
module.exports.getActiveAssetDetails = getActiveAssetDetails;
module.exports.getShouldShowReactViewPanel = getShouldShowReactViewPanel;
module.exports.getIfShouldShowTeamRoomSelector = getIfShouldShowTeamRoomSelector;
module.exports.getShouldShowPrimaryWorkitemSelector = getShouldShowPrimaryWorkitemSelector;
