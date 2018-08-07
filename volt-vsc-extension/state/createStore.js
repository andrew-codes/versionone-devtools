const Cache = require("vscode-cache");
const createSagaMiddleware = require("redux-saga");
const { applyMiddleware, createStore } = require("redux");
const reducer = require("./reducer");
const sagas = require("./sagas");

const sagaMiddleware = createSagaMiddleware.default();

module.exports = function(context) {
  const cache = new Cache(context, "volt");
  const defaultState = {};
  const initialState = cache.getAll().state;
  const startState = initialState || defaultState;

  const store = createStore(
    reducer,
    startState,
    applyMiddleware(sagaMiddleware)
  );
  sagaMiddleware.run(sagas);

  store.subscribe(() => console.log(store.getState()));

  return store;
};
