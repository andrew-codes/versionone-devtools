const axios = require("axios");
const sdk = require("v1sdk");

const connector = sdk.axiosConnector(axios)(sdk.default);
module.exports = connector(
  "www7.v1host.com",
  "V1Production",
  443,
  true
).withAccessToken;
