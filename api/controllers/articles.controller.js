const {
  selectArticleById,
  selectAllArticles,
  selectCommentsOfArticle,
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
