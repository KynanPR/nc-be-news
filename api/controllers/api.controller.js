const endpoints = require("../../endpoints.json");

exports.getApiEndpoints = (req, res, next) => {
  res.json({ message: "Infomation on all endpoints of this api", endpoints });
};
