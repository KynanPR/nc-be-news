const { selectArticleById } = require("../models/articles.model");

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
