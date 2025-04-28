const {
  selectArticleById,
  selectAllArticles,
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
