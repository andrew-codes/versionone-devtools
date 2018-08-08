const vscode = require("vscode");
const createStore = require("./state/createStore");
const createV1Api = require("./api");
const {
  getAccessToken,
  getFuturePrimaryWorkItems,
  getMyself,
  getTeamRooms
} = require("./state/domains/v1/selectors");
const { actionCreators } = require("./state/domains/v1/actions");

let store;
function activate(context) {
  store = createStore(context);
  const initialState = store.getState();

  console.log("initial state", initialState);

  if (!getAccessToken(initialState)) {
    vscode.window.showInformationMessage("Please setup the Volt extension.");
  }

  const setupCommand = vscode.commands.registerCommand(
    "extension.setup",
    function() {
      let v1Api;
      return vscode.window
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
              return vscode.window
                .showQuickPick(quickPickTeams, {
                  canPickMany: false,
                  placeHolder: "Please select your team room"
                })
                .then(selectedItem => {
                  if (!selectedItem) return;
                  const teamRoom = teamRooms.find(
                    t => t.name === selectedItem.label
                  );
                  store.dispatch(
                    actionCreators.setCurrentTeamRoom({ teamRoom })
                  );
                });
            });
        });
    }
  );
  context.subscriptions.push(setupCommand);

  const resetCommand = vscode.commands.registerCommand(
    "extension.reset",
    function() {
      store.dispatch(actionCreators.reset());
    }
  );
  context.subscriptions.push(setupCommand);

  const changeTeam = vscode.commands.registerCommand(
    "extension.changeTeamRoom",
    function() {
      const state = store.getState();
      const teamRooms = getTeamRooms(state);
      const quickPickTeams = teamRooms.map(team => ({
        label: team.name
      }));
      return vscode.window
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

  const startPrimaryWorkitemCommand = vscode.commands.registerCommand(
    "extension.startPrimaryWorkitem",
    function() {
      const state = store.getState();
      const pwis = getFuturePrimaryWorkItems(state);
      const quickPickItems = pwis.map(pwi => ({
        label: `${pwi.number}: ${pwi.name}`
      }));
      return vscode.window
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
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
