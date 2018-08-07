const vscode = require("vscode");
const createStore = require("./state/createStore");
const createV1Api = require("./api");
const {
  getAccessToken,
  getTeamPrimaryWorkitems,
  getTeams
} = require("./state/domains/v1/selectors");
const { actionCreators } = require("./state/domains/v1/actions");

let store;
function activate(context) {
  store = createStore(context);

  if (!getAccessToken(store.getState())) {
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
          v1Api = createV1Api(getAccessToken(state));
          return v1Api
            .query({
              from: "Team",
              select: ["Name"],
              where: {
                "Workitems.Owners": "Member:1039"
              }
            })
            .then(response => response.data[0])
            .then(data => {
              store.dispatch(actionCreators.setTeams({ teams: data }));
              const state = store.getState();
              const teams = getTeams(state);
              const quickPickTeams = teams.map(team => ({
                label: team.name
              }));
              return vscode.window.showQuickPick(quickPickTeams, {
                canPickMany: false,
                placeHolder: "Please select your team room",
                onDidSelectItem: selectedTeam => {
                  const team = teams.find(t => t.name === selectedTeam.label);
                  store.dispatch(actionCreators.setCurrentTeam({ team }));
                }
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
    "extension.changeTeam",
    function() {
      const state = store.getState();
      const teams = getTeams(state);
      const quickPickTeams = teams.map(team => ({
        label: team.name
      }));
      return vscode.window.showQuickPick(quickPickTeams, {
        canPickMany: false,
        placeHolder: "Please select your team room",
        onDidSelectItem: selectedTeam => {
          const team = teams.find(t => t.name === selectedTeam.label);
          store.dispatch(actionCreators.setCurrentTeam({ team }));
        }
      });
    }
  );
  context.subscriptions.push(changeTeam);

  const startPrimaryWorkitemCommand = vscode.commands.registerCommand(
    "extension.startPrimaryWorkitem",
    function() {
      const state = store.getState();
      const pwis = getTeamPrimaryWorkitems(state);
      const quickPickItems = pwis.map(pwi => ({
        label: pwi.name,
        detail: pwi.description,
        description: pwi.number
      }));
      return vscode.window.showQuickPick(quickPickItems, {
        canPickMany: false,
        placeHolder: "Please select your team room",
        onDidSelectItem: selectedItem => {
          console.log(selectedItem, arguments, "here here");
        }
      });
    }
  );
  context.subscriptions.push(startPrimaryWorkitemCommand);
}
exports.activate = activate;

function deactivate() {}
exports.deactivate = deactivate;
