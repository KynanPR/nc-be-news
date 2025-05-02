const { readTopicsCache } = require("../db/utils");

exports.topicExists = async (topicSlug) => {
  const topics = await readTopicsCache();
  const slugs = topics.map((topic) => topic.slug);

  return slugs.includes(topicSlug);
};
