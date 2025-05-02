const { getApiEndpoints } = require("../controllers/api.controller");
const apiRouter = require("express").Router();

apiRouter.get("/", getApiEndpoints);

module.exports = apiRouter;
