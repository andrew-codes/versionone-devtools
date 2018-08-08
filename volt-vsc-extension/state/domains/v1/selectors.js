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
module.exports.getFuturePrimaryWorkItems = createSelector(
  [getTeamPrimaryWorkitems, getFutureStatus],
  (pwis, futureStatus) => pwis.filter(pwi => pwi.status === futureStatus._oid)
);
const getMemberMap = createSelector([getRoot], root => root.members);
const getMyselfOid = createSelector([getRoot], root => root.myself);
module.exports.getMyself = createSelector(
  [getMyselfOid, getMemberMap],
  (myselfOid, memberMap) => memberMap[myselfOid]
);
const getInDevelopingStatus = createSelector(
  [getStatusMap],
  statusMap => statusMap["StoryStatus:1151474"]
);
module.exports.getInDevelopingStatus = getInDevelopingStatus;
