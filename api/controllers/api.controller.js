const endpoints = require("../../endpoints.json");

exports.getApiEndpoints = (req, res, next) => {
  res.json({ endpoints });
};
