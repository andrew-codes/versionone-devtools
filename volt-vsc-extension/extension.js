const Cache = require("vscode-cache");
const { commands, window, ViewColumn } = require("vscode");
const createStore = require("./state/createStore");
const createV1Api = require("./api");
const ReactPanel = require("./ReactWebViewPanel");
const { actionCreators } = require("./state/domains/v1/actions");
const {
  getAccessToken,
  getActiveWorkitem,
  getCandidatePrimaryWorkItems,
  getShouldShowReactViewPanel,
  getMyself,
  getTeamRooms,
  getActiveAssetDetails
} = require("./state/domains/v1/selectors");
const { initialize } = require("./terminal");

let store;
function activate(context) {
  const cache = new Cache(context, "volt");
  store = createStore(cache.get("state"));
  store.subscribe(() => cache.put("state", store.getState()));
  store.dispatch(actionCreators.hideReactWebviewPanel());
  const onDidDisposeOfViewPanel = () =>
    store.dispatch(actionCreators.hideReactWebviewPanel());
  store.subscribe(() => {
    if (getShouldShowReactViewPanel(store.getState())) {
      console.log(getActiveAssetDetails(store.getState()));
      ReactPanel.createOrShow(
        context.extensionPath,
        "dist",
        store,
        onDidDisposeOfViewPanel
      );
      store.dispatch(actionCreators.showReactWebviewPanel());
    }
  });

  initialize({ context });
  const initialState = store.getState();

  if (!getAccessToken(initialState)) {
    window.showInformationMessage("Please setup the Volt extension.");
  }

  const setupCommand = commands.registerCommand("extension.setup", function() {
    let v1Api;
    return window
      .showInputBox({
        password: true,
        prompt: "Please enter your VersionOne access token",
        validateInput: value => (!value ? "Access token is required" : null)
      })
      .then(token => {
        store.dispatch(actionCreators.setAccessToken({ token }));
      })
      .then(() => {
        const state = store.getState();
        const myself = getMyself(state);
        v1Api = createV1Api(getAccessToken(state));
        return v1Api
          .query({
            from: "TeamRoom",
            select: ["Name"],
            where: {
              Participants: myself._oid
            }
          })
          .then(response => response.data[0])
          .then(data => {
            store.dispatch(actionCreators.setTeamRooms({ teamRooms: data }));
            const state = store.getState();
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
                const teamRoom = teamRooms.find(
                  t => t.name === selectedItem.label
                );
                store.dispatch(actionCreators.setCurrentTeamRoom({ teamRoom }));
              });
          });
      });
  });
  context.subscriptions.push(setupCommand);

  const resetCommand = commands.registerCommand("extension.reset", function() {
    store.dispatch(actionCreators.reset());
  });
  context.subscriptions.push(setupCommand);

  const changeTeam = commands.registerCommand(
    "extension.changeTeamRoom",
    function() {
      const state = store.getState();
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
    }
  );
  context.subscriptions.push(changeTeam);

  const startPrimaryWorkitemCommand = commands.registerCommand(
    "extension.startPrimaryWorkitem",
    function() {
      const state = store.getState();
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
    }
  );
  context.subscriptions.push(startPrimaryWorkitemCommand);

  const showDetailsOfActivePrimaryWorkitem = commands.registerCommand(
    "extension.showDetailsOfActivePrimaryWorkitem",
    function() {
      const item = getActiveWorkitem(store.getState());
      store.dispatch(
        actionCreators.showDetailsOfActivePrimaryWorkitem({
          item
        })
      );
    }
  );
  context.subscriptions.push(showDetailsOfActivePrimaryWorkitem);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
