const { selectAllTopics } = require("../models/topics.model");

exports.getAllTopics = async (req, res, next) => {
  try {
    const topics = await selectAllTopics();
    const resBody = {
      topics,
    };
    res.json(resBody);
  } catch (error) {
    next(error);
  }
};
