const { combineReducers } = require("redux");
const v1 = require("./domains/v1/reducer");

module.exports = combineReducers(Object.assign({}, v1));
