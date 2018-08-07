const axios = require("axios");
const sdk = require("v1sdk");

const connector = sdk.axiosConnector(axios)(sdk.default);
module.exports = connector(
  "localhost",
  "VersionOne.Web",
  80,
  false
).withAccessToken;
