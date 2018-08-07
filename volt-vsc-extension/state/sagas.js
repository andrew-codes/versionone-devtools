const createRootSaga = require("./createRootSaga");
const v1Sagas = require("./domains/v1/sagas");

const sagas = [].concat(v1Sagas);

module.exports = createRootSaga(sagas);
