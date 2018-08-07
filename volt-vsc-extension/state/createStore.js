const Cache = require("vscode-cache");
const createSagaMiddleware = require("redux-saga");
const { applyMiddleware, createStore } = require("redux");
const { createLogger } = require("redux-logger");
const reducer = require("./reducer");
const sagas = require("./sagas");

const sagaMiddleware = createSagaMiddleware.default();
const logger = createLogger();

module.exports = function(context) {
  const cache = new Cache(context, "volt");
  const defaultState = {};
  const initialState = cache.getAll().state;
  const startState = initialState || defaultState;

  const store = createStore(
    reducer,
    startState,
    applyMiddleware(sagaMiddleware, logger)
  );
  sagaMiddleware.run(sagas);

  store.subscribe(() => cache.put("state", store.getState()));
  store.subscribe(() => console.log("Updated State", store.getState()));

  return store;
};
