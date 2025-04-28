const express = require("express");
const { getApiEndpoints } = require("./controllers/api.controller");
const { getAllTopics } = require("./controllers/topics.controller");
const { getArticleById } = require("./controllers/articles.controller");
const server = express();

server.use(express.json());

server.get("/api", getApiEndpoints);

server.get("/api/topics", getAllTopics);

server.get("/api/articles/:article_id", getArticleById);

server.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).json({ message: err.message });
  } else next(err);
});

server.use((err, req, res, next) => {
  if (err.code === "22P02") {
    res.status(400).json({ message: "Bad Request" });
  } else next(err);
});

server.all("/*splat", (req, res, next) => {
  res.status(404).json({
    message:
      "Endpoint/Method doesn't exist. Try GET /api to see info on all available endpoints",
  });
});

module.exports = server;
