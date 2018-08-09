const createSagaMiddleware = require("redux-saga");
const { applyMiddleware, createStore } = require("redux");
const { createLogger } = require("redux-logger");
const reducer = require("./reducer");
const sagas = require("./sagas");

const sagaMiddleware = createSagaMiddleware.default();
const logger = createLogger();

module.exports = function(initialState) {
  const defaultState = {};
  const startState = initialState || defaultState;

  const store = createStore(
    reducer,
    startState,
    applyMiddleware(sagaMiddleware, logger)
  );
  sagaMiddleware.run(sagas);

  store.subscribe(() => console.log(store.getState()));

  return store;
};
