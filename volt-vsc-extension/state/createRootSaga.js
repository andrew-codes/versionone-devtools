const { all, fork } = require("redux-saga/effects");

module.exports = function createRootSaga(sagas) {
  return function* rootSaga() {
    yield all(sagas.map(saga => fork(saga)));
  };
};
