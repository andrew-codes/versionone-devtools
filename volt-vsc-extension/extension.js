const vscode = require("vscode");
const Cache = require("vscode-cache");

function activate(context) {
  const v1Cache = new Cache(context, "versionOne");
  if (!v1Cache.has("accessToken")) {
    vscode.window.showInformationMessage(
      "Please set your VersionOne access token."
    );
  }
  let disposable = vscode.commands.registerCommand(
    "extension.setAccessToken",
    function() {
      vscode.window
        .showInputBox({
          password: true,
          prompt: "Please enter your VersionOne access token"
        })
        .then(token => {
          v1Cache.put("accessToken", token);
        });
    }
  );

  context.subscriptions.push(disposable);
}
exports.activate = activate;

// this method is called when your extension is deactivated
function deactivate() {}
exports.deactivate = deactivate;
