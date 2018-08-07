const vscode = require("vscode");
const createStore = require("./state/createStore");
const createV1Api = require("./api");
const { getAccessToken } = require("./state/domains/v1/selectors");

let store;
function activate(context) {
  store = createStore(context);

  if (!getAccessToken(store.getState())) {
    vscode.window.showInformationMessage("Please setup the Volt extension.");
  }

  let disposable = vscode.commands.registerCommand(
    "extension.setup",
    function() {
      let v1Api;
      vscode.window
        .showInputBox({
          password: true,
          prompt: "Please enter your VersionOne access token",
          validateInput: value => (!value ? "Access token is required" : null)
        })
        .then(token => {
          store.dispatch({
            type: "v1/setAccessToken",
            payload: { token }
          });
        })
        // .then(() => {
        //   return vscode.window
        //     .showInputBox({
        //       prompt: "Please enter your VersionOne user name",
        //       validateInput: value => (!value ? "Username is required" : null)
        //     })
        //     .then(username => {
        //       store.dispatch({
        //         type: "v1/setUsername",
        //         payload: { username }
        //       });
        //     });
        // })
        .then(() => {
          const state = store.getState();
          v1Api = createV1Api(getAccessToken(state));
          return v1Api
            .query({
              from: "TeamRoom",
              select: ["Name"]
            })
            .then(response => response.data[0])
            .then(teams => {
              store.dispatch({
                type: "v1/setTeams",
                payload: { teams }
              });
              const quickPickTeams = teams.map(team => ({
                label: team.Name
              }));
              return vscode.window.showQuickPick(quickPickTeams, {
                canPickMany: false,
                placeHolder: "Please select your team room",
                onDidSelectItem: selectedTeam => {
                  store.dispatch({
                    type: "v1/setCurrentTeam",
                    payload: { teamName: selectedTeam.label }
                  });
                }
              });
            });
        });
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

function deactivate() {
  cache.put("state", store.getState());
}
exports.deactivate = deactivate;
