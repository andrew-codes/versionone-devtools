import React from "react";
import * as ReactDOM from "react-dom";
import App from "./App";

function render(state) {
  ReactDOM.render(<App state={state} />, document.getElementById("root"));
}

render(window.__initialState__);

window.addEventListener("message", evt => {
  console.log(" state updated", evt.data.state);
  render(evt.data.state);
});
