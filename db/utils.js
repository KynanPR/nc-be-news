const { resolve } = require("path");
const fs = require("fs/promises");
const db = require("./connection");

exports.readTopicsCache = async () => {
  try {
    const topicsCachePath = resolve("./db/cache/topics.json");
    const topicsCache = await fs.readFile(topicsCachePath, "utf-8");
    return JSON.parse(topicsCache);
  } catch (error) {
    throw new Error("Failed to read topic cache");
  }
};

exports.updateTopicsCache = async () => {
  try {
    const { rows: topics } = await db.query(`SELECT * FROM topics;`);

    const asString = JSON.stringify(topics);

    const topicsCachePath = resolve("./db/cache/topics.json");

    fs.writeFile(topicsCachePath, asString, "utf-8");
  } catch (error) {
    throw new Error("Failed to update topics cache");
  }
};
