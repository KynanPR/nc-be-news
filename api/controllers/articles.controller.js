const {
  selectArticleById,
  selectAllArticles,
  selectCommentsOfArticle,
  insertCommentOnArticle,
  updateArticleById,
} = require("../models/articles.model");

const { ApiError } = require("../../utils");

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;

  try {
    const article = await selectArticleById(article_id);
    const resBody = {
      article,
    };

    res.json(resBody);
  } catch (error) {
    next(error);
  }
};

exports.patchArticleById = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const { inc_votes } = req.body;

    await selectArticleById(article_id);

    const updatedArticle = await updateArticleById(article_id, inc_votes);

    const resBody = {
      updatedArticle,
    };
    res.json(resBody);
  } catch (error) {
    next(error);
  }
};

exports.getAllArticles = async (req, res, next) => {
  try {
    const { sort_by, order } = req.query;

    const articles = await selectAllArticles(sort_by, order);
    const resBody = {
      articles,
    };

    res.json(resBody);
  } catch (error) {
    next(error);
  }
};

exports.getCommentsOfArticle = async (req, res, next) => {
  try {
    const { article_id } = req.params;

    await selectArticleById(article_id);

    const comments = await selectCommentsOfArticle(article_id);
    const resBody = {
      comments,
    };
    res.json(resBody);
  } catch (error) {
    next(error);
  }
};

exports.postCommentOnArticle = async (req, res, next) => {
  try {
    const { article_id } = req.params;
    const comment = req.body;

    if (comment.body === "") {
      throw new ApiError(400, "Comment must not be empty");
    }

    await selectArticleById(article_id);

    const postedComment = await insertCommentOnArticle(article_id, comment);

    const resBody = {
      postedComment,
    };
    res.status(201).json(resBody);
  } catch (error) {
    next(error);
  }
};
