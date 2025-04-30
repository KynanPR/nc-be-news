const express = require("express");
const { getApiEndpoints } = require("./controllers/api.controller");
const { getAllTopics } = require("./controllers/topics.controller");
const {
  getArticleById,
  getAllArticles,
  getCommentsOfArticle,
  postCommentOnArticle,
  patchArticleById,
} = require("./controllers/articles.controller");
const { deleteCommentById } = require("./controllers/comments.controller");
const { getAllUsers } = require("./controllers/users.controller");
const server = express();

server.use(express.json());

server.get("/api", getApiEndpoints);

server.get("/api/topics", getAllTopics);

server.get("/api/articles/:article_id", getArticleById);

server.patch("/api/articles/:article_id", patchArticleById);

server.get("/api/articles", getAllArticles);

server.get("/api/articles/:article_id/comments", getCommentsOfArticle);

server.post("/api/articles/:article_id/comments", postCommentOnArticle);

server.delete("/api/comments/:comment_id", deleteCommentById);

server.get("/api/users", getAllUsers);

server.use((err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).json({ message: err.message });
  } else next(err);
});

server.use((err, req, res, next) => {
  // const dbErrorCodes = ["23502", "22P02"];

  // if (dbErrorCodes.includes(err.code)) {
  if (err.code) {
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
