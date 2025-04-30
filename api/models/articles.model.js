const db = require("../../db/connection");
const format = require("pg-format");
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

exports.updateArticleById = async (articleId, voteIncAmount) => {
  const {
    rows: [updatedArticle],
  } = await db.query(
    `
    UPDATE articles
    SET
      votes = votes + $2
    WHERE
      article_id = $1
    RETURNING *;
    `,
    [articleId, voteIncAmount]
  );

  return updatedArticle;
};

exports.selectAllArticles = async (
  sortByColumn = "created_at",
  orderDirection = "DESC",
  topicFilter
) => {
  let whereClause = "";
  if (topicFilter) {
    const { rows } = await db.query(
      `SELECT * FROM articles WHERE topic = $1;`,
      [topicFilter]
    );
    const topicExists = rows.length !== 0;

    if (!topicExists) {
      throw new ApiError(
        404,
        `Can't find any articles with topic: ${topicFilter}`
      );
    }

    whereClause = format(`WHERE atcl.topic = %L`, topicFilter);
  }

  const tableName = sortByColumn === "comment_count" ? "" : "atcl.";
  const sql = format(
    `
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
    ${whereClause}
    GROUP BY
    atcl.article_id
    ORDER BY
    %s%I %s;
    `,
    tableName,
    sortByColumn,
    orderDirection
  );

  const { rows: articles } = await db.query(sql);

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
