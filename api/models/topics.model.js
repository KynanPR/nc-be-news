const db = require("../../db/connection");
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
