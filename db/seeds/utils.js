const db = require("../../db/connection");
const format = require("pg-format");

const convertTimestampToDate = ({ created_at, ...otherProperties }) => {
  if (!created_at) return { ...otherProperties };
  return { created_at: new Date(created_at), ...otherProperties };
};

const convertArticleTitleToId = ({ article_title, ...otherProperties }) => {
  if (!article_title) return { ...otherProperties };
  const formattedQuery = format(
    `
      SELECT article_id
      FROM articles
      WHERE
        title = %L;
    `,
    article_title
  );
  return db.query(formattedQuery).then(({ rows }) => {
    return { article_id: rows[0].article_id, ...otherProperties };
  });
};

module.exports = { convertTimestampToDate, convertArticleTitleToId };
