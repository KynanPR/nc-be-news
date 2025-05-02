const {
  getArticleById,
  getAllArticles,
  getCommentsOfArticle,
  postCommentOnArticle,
  patchArticleById,
} = require("../controllers/articles.controller");
const articlesRouter = require("express").Router();

articlesRouter.get("/", getAllArticles);

articlesRouter.get("/:article_id", getArticleById);

articlesRouter.patch("/:article_id", patchArticleById);

articlesRouter.get("/:article_id/comments", getCommentsOfArticle);

articlesRouter.post("/:article_id/comments", postCommentOnArticle);

module.exports = articlesRouter;
