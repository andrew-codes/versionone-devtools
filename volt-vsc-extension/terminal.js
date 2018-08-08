const { window, workspace } = require("vscode");

const extensionTerminalName = "volt-terminal";
let disposable;
let terminal;
let terminalCwd;

function initializeTerminal({ context }) {
  if (terminal === undefined) {
    terminal = window.createTerminal(extensionTerminalName);
    disposable = window.onDidCloseTerminal(evt => {
      if (evt.name === extensionTerminalName) {
        terminal = undefined;
        if (disposable) disposable.dispose();
        disposable = undefined;
      }
    });

    context.subscriptions.push(disposable);
    terminalCwd = undefined;
  }
}

function getTerminal(cwd) {
  if (!terminal)
    throw new Error("Must call `initialize` before using the terminal.");

  if (!terminalCwd) {
    terminal.sendText(`cd "${cwd}"`, true);
    terminalCwd = cwd;
  }

  return terminal;
}

function sendTerminalCommand(command, cwd = workspace.rootPath) {
  const terminal = getTerminal(cwd);
  terminal.show(false);
  terminal.sendText(`${command}`, true);
}

module.exports.initialize = initializeTerminal;
module.exports.getTerminal = getTerminal;
module.exports.sendCommand = sendTerminalCommand;
