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

exports.selectAllArticles = async () => {
  const { rows: articles } = await db.query(`
      SELECT
         atcl.article_id,
         atcl.title,
         atcl.topic,
         atcl.author,
         atcl.created_at,
         atcl.votes,
         atcl.article_img_url,
         COUNT(comments.comment_id)::INT AS comment_count
      FROM articles AS atcl
      LEFT JOIN comments
         ON atcl.article_id = comments.article_id
      GROUP BY
         atcl.article_id
      ORDER BY
         atcl.created_at DESC;
      `);

  if (!articles.length) {
    throw new ApiError(404, "No articles found");
  }

  return articles;
};

exports.selectCommentsOfArticle = async (articleId) => {
  const { rows: comments } = await db.query(
    `
      SELECT *
      FROM comments
      WHERE
         article_id = $1
      ORDER BY
         created_at DESC;
      `,
    [articleId]
  );

  if (!comments.length) {
    throw new ApiError(
      404,
      `No comments found on article with ID: ${articleId}`
    );
  }

  return comments;
};

exports.insertCommentOnArticle = async (articleId, commentToInsert) => {
  const {
    rows: [insertedComment],
  } = await db.query(
    `
    INSERT INTO comments
      (article_id, body, author)
    VALUES
      ($1, $2, $3)
    RETURNING *;
    `,
    [articleId, commentToInsert.body, commentToInsert.username]
  );
  return insertedComment;
};
