const { selectAllTopics } = require("../models/topics.model");

exports.getAllTopics = async (req, res, next) => {
  try {
    const topics = await selectAllTopics();
    const resBody = {
      message: "All Topics currently in database",
      topics,
    };
    res.json(resBody);
  } catch (error) {
    next(error);
  }
};
