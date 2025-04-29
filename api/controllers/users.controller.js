const { selectAllUsers } = require("../models/users.model");

exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await selectAllUsers();
    const resBody = {
      users,
    };
    res.json(resBody);
  } catch (error) {
    next(error);
  }
};
