const {
  getArticleById,
  getAllArticles,
  getCommentsOfArticle,
  postCommentOnArticle,
  patchArticleById,
} = require("../controllers/articles.controller");
const articlesRouter = require("express").Router();

articlesRouter.get("/", getAllArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsOfArticle)
  .post(postCommentOnArticle);

module.exports = articlesRouter;
