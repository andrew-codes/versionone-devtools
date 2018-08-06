const Cache = require("vscode-cache");
const { createStore } = require("redux");
const createReducer = require("./createReducer");
const reducer = require("./reducer");

module.exports = function(context) {
  const cache = new Cache(context, "volt");
  const defaultState = {};
  const initialState = cache.getAll().state;
  const startState = initialState || defaultState;

  const store = createStore(createReducer(startState, reducer));
  store.subscribe(() => cache.put("state", store.getState()));

  return store;
};
