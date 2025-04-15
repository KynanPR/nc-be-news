const db = require("../connection");
const format = require("pg-format");
const { convertTimestampToDate, convertArticleTitleToId } = require("./utils");

const insertTopicData = async (topicData) => {
  const topicInsertSQL = format(
    `
      INSERT INTO topics
        (description, slug, img_url)
      VALUES
        %L;
    `,
    topicData.map((topic) => Object.values(topic))
  );

  return db.query(topicInsertSQL);
};

const insertUserData = async (userData) => {
  const userInsertSQL = format(
    `
         INSERT INTO users
           (username, name, avatar_url)
         VALUES
           %L;
       `,
    userData.map((user) => Object.values(user))
  );
  return db.query(userInsertSQL);
};

const insertArticleData = async (articleData) => {
  const articleInsertSQL = format(
    `
    INSERT INTO articles
    (created_at, title, topic, author, body, votes, article_img_url)
    VALUES
    %L;
    `,
    articleData.map((article) => {
      const converted = convertTimestampToDate(article);

      return Object.values(converted);
    })
  );

  return db.query(articleInsertSQL);
};

const insertCommentData = async (commentData) => {
  const commentDataWithTitleId = await Promise.all(
    commentData.map((comment) => {
      return convertArticleTitleToId(comment);
    })
  );

  const commentInsertSQL = format(
    `
      INSERT INTO comments
        (created_at, article_id, body, votes, author)
      VALUES
        %L;
    `,
    commentDataWithTitleId.map((comment) => {
      const timestampConverted = convertTimestampToDate(comment);
      return Object.values(timestampConverted);
    })
  );

  return db.query(commentInsertSQL);
};

module.exports = {
  insertTopicData,
  insertUserData,
  insertArticleData,
  insertCommentData,
};
