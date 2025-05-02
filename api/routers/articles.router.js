const {
  getArticleById,
  getAllArticles,
  getCommentsOfArticle,
  postCommentOnArticle,
  patchArticleById,
  postNewArticle,
} = require("../controllers/articles.controller");
const articlesRouter = require("express").Router();

articlesRouter.route("/").get(getAllArticles).post(postNewArticle);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleById);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsOfArticle)
  .post(postCommentOnArticle);

module.exports = articlesRouter;
