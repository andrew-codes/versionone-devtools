import React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

function render(state) {
  ReactDOM.render(
    <App state={state} api={window.vscode} />,
    document.getElementById("root")
  );
}

render(window.__initialState__);

window.addEventListener("message", evt => {
  render(evt.data.state);
});
