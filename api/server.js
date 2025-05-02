const express = require("express");

const apiRouter = require("./routers/api.router");
const topicsRouter = require("./routers/topics.router");
const articlesRouter = require("./routers/articles.router");
const commentsRouter = require("./routers/comments.router");
const usersRouter = require("./routers/users.router");
const {
  sendCaughtError,
  badRequest,
  endpointNotFound,
} = require("./controllers/errors.controller");

const server = express();

server.use(express.json());

server.use("/api", apiRouter);
server.use("/api/topics", topicsRouter);
server.use("/api/articles", articlesRouter);
server.use("/api/comments", commentsRouter);
server.use("/api/users", usersRouter);

server.use(sendCaughtError);
server.use(badRequest);
server.all("/*splat", endpointNotFound);

module.exports = server;
