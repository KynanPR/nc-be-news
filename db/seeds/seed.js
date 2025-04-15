const { dropTables, createTables } = require("./manageTables");
const {
  insertTopicData,
  insertUserData,
  insertArticleData,
  insertCommentData,
} = require("./insertData");

const seed = async ({ topicData, userData, articleData, commentData }) => {
  await dropTables();
  await createTables();

  const nonDependantInsertQueries = [
    insertTopicData(topicData),
    insertUserData(userData),
  ];

  await Promise.all(nonDependantInsertQueries);
  await insertArticleData(articleData);
  await insertCommentData(commentData);

  return;
};

module.exports = seed;
