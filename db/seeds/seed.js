const { dropTables, createTables } = require("./manageTables");
const {
  insertTopicData,
  insertUserData,
  insertArticleData,
  insertCommentData,
} = require("./insertData");
const { updateTopicsCache } = require("../utils");

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

  await updateTopicsCache();

  return;
};

module.exports = seed;
