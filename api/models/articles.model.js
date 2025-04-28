const db = require("../../db/connection");
const { ApiError } = require("../../utils");

exports.selectArticleById = async (articleId) => {
  const {
    rows: [article],
  } = await db.query(
    `
      SELECT *
      FROM articles
      WHERE
         article_id = $1
      `,
    [articleId]
  );

  if (!article) {
    throw new ApiError(404, `Can't find article with ID: ${articleId}`);
  }

  return article;
};
