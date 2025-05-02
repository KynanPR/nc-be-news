const db = require("../../db/connection");
const { updateTopicsCache } = require("../../db/utils");
const { ApiError } = require("../../utils");

exports.selectAllTopics = async () => {
  const { rows: topics } = await db.query(
    `SELECT slug, description FROM topics;`
  );

  if (!topics.length) {
    throw new ApiError(404, "No topics found");
  }

  return topics;
};

exports.insertNewTopic = async (topic) => {
  const { rows: insertedTopic } = await db.query(
    `
    INSERT INTO topics
    VALUES
      ($1, $2, $3)
    RETURNING *;
    `,
    [topic.slug, topic.description || topic.slug, topic.img_url || ""]
  );

  await updateTopicsCache();

  return insertedTopic;
};
