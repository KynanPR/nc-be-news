const express = require("express");
const { getApiEndpoints } = require("./controllers/api.controller");
const server = express();

server.use(express.json());

server.get("/api", getApiEndpoints);

module.exports = server;
