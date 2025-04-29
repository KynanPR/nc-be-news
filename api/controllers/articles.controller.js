const {
  selectArticleById,
  selectAllArticles,
  selectCommentsOfArticle,
  insertCommentOnArticle,
  updateArticleById,
} = require("../models/articles.model");

exports.getArticleById = async (req, res, next) => {
  const { article_id } = req.params;

  try {
    const article = await selectArticleById(article_id);
    const resBody = {
      message: `Data for article ${article_id}`,
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
      message: `Updated votes on article with ID: ${article_id}`,
      updatedArticle,
    };
    res.json(resBody);
  } catch (error) {
    next(error);
  }
};

exports.getAllArticles = async (req, res, next) => {
  try {
    const articles = await selectAllArticles();
    const resBody = {
      message: "All articles",
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
      message: `All comments on article of ID: ${article_id}`,
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

    await selectArticleById(article_id);

    const postedComment = await insertCommentOnArticle(article_id, comment);

    const resBody = {
      message: `Added comment to article with ID: ${article_id}`,
      postedComment,
    };
    res.status(201).json(resBody);
  } catch (error) {
    next(error);
  }
};
