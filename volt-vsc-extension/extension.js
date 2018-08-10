const Cache = require("vscode-cache");
const { commands, window } = require("vscode");
const createStore = require("./state/createStore");
const ReactPanel = require("./ReactWebViewPanel");
const { actionCreators } = require("./state/domains/v1/actions");
const {
  getAccessToken,
  getActiveWorkitem,
  getCandidatePrimaryWorkItems,
  getIfShouldShowTeamRoomSelector,
  getShouldShowReactViewPanel,
  getTeamRooms,
  getShouldShowPrimaryWorkitemSelector
} = require("./state/domains/v1/selectors");
const { initialize } = require("./terminal");

let store;
function activate(context) {
  const cache = new Cache(context, "volt");
  initialize({ context });

  store = createStore(cache.get("state"));
  store.subscribe(persistState({ cache, store }));
  store.subscribe(showingTeamRoomSelector(store));
  store.subscribe(showingPrimaryWorkitemSelector(store));
  store.subscribe(
    showingWebviewPanel({
      extensionPath: context.extensionPath,
      onDidDispose: () =>
        store.dispatch(actionCreators.hideReactWebviewPanel()),
      store
    })
  );

  const initialState = store.getState();
  console.log(initialState);

  if (!getAccessToken(initialState)) {
    window.showInformationMessage("Please setup the Volt extension.");
  }

  const setupCommand = commands.registerCommand("extension.setup", function() {
    return window
      .showInputBox({
        password: true,
        prompt: "Please enter your VersionOne access token",
        validateInput: value => (!value ? "Access token is required" : null)
      })
      .then(token => {
        if (!token) return;
        store.dispatch(actionCreators.setAccessToken({ token }));
      });
  });
  context.subscriptions.push(setupCommand);

  const resetCommand = commands.registerCommand("extension.reset", function() {
    store.dispatch(actionCreators.reset());
  });
  context.subscriptions.push(resetCommand);

  const changeTeam = commands.registerCommand(
    "extension.changeTeamRoom",
    function() {
      store.dispatch(actionCreators.changeTeamRoom());
    }
  );
  context.subscriptions.push(changeTeam);

  const startPrimaryWorkitemCommand = commands.registerCommand(
    "extension.startPrimaryWorkitem",
    function() {
      store.dispatch(actionCreators.startPrimaryWorkitem());
    }
  );
  context.subscriptions.push(startPrimaryWorkitemCommand);

  const showDetailsOfActivePrimaryWorkitem = commands.registerCommand(
    "extension.showDetailsOfActivePrimaryWorkitem",
    function() {
      store.dispatch(actionCreators.showDetailsOfActivePrimaryWorkitem());
    }
  );
  context.subscriptions.push(showDetailsOfActivePrimaryWorkitem);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;

function persistState({ cache, store }) {
  return () => {
    const state = store.getState();
    const stateToSave = {
      accessToken: state.v1.accessToken,
      currentTeam: state.v1.currentTeam,
      teamRooms: {
        [state.v1.currentTeam]:
          state.v1.teamRooms && state.v1.currentTeam
            ? state.v1.teamRooms[state.v1.currentTeam]
            : undefined
      },
      myself: state.v1.myself,
      members: {
        [state.v1.myself]:
          state.v1.members && state.v1.myself
            ? state.v1.members[state.v1.myself]
            : undefined
      },
      activeWorkitem: state.v1.activeWorkitem,
      primaryWorkitems: {
        [state.v1.activeWorkitem]:
          state.v1.primaryWorkitems && state.v1.activeWorkitem
            ? state.v1.primaryWorkitems[state.v1.activeWorkitem]
            : undefined
      }
    };
    cache.put("state", { v1: stateToSave });
  };
}

function showingTeamRoomSelector(store) {
  return () => {
    const state = store.getState();
    const shouldShowTeamRoomSelector = getIfShouldShowTeamRoomSelector(state);
    if (!shouldShowTeamRoomSelector) {
      return;
    }

    const teamRooms = getTeamRooms(state);
    const quickPickTeams = teamRooms.map(team => ({
      label: team.name
    }));
    return window
      .showQuickPick(quickPickTeams, {
        canPickMany: false,
        placeHolder: "Please select your team room"
      })
      .then(selectedItem => {
        if (!selectedItem) return;
        const teamRoom = teamRooms.find(t => t.name === selectedItem.label);
        store.dispatch(actionCreators.setCurrentTeamRoom({ teamRoom }));
      });
  };
}
function showingWebviewPanel({ store, extensionPath, onDidDispose }) {
  return () => {
    if (!getShouldShowReactViewPanel(store.getState())) {
      return;
    }

    ReactPanel.createOrShow(extensionPath, "dist", store, onDidDispose);
    store.dispatch(actionCreators.showReactWebviewPanel());
  };
}
function showingPrimaryWorkitemSelector(store) {
  return () => {
    const state = store.getState();
    if (!getShouldShowPrimaryWorkitemSelector(state)) {
      return;
    }

    const pwis = getCandidatePrimaryWorkItems(state);
    const quickPickItems = pwis.map(pwi => ({
      label: `${pwi.number}: ${pwi.name}`
    }));
    return window
      .showQuickPick(quickPickItems, {
        canPickMany: false,
        placeHolder: "Please select your team room"
      })
      .then(selectedItem => {
        if (!selectedItem) return;
        const number = selectedItem.label.split(":")[0];
        const selectedPwi = pwis.find(pwi => pwi.number === number);
        store.dispatch(
          actionCreators.setActiveWorkitem({ workitem: selectedPwi })
        );
      });
  };
}
