const {
  selectAllUsers,
  selectUserByUsername,
} = require("../models/users.model");

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

exports.getUserByUsername = async (req, res, next) => {
  try {
    const { username } = req.params;
    const user = await selectUserByUsername(username);
    const resBody = {
      user,
    };
    res.json(resBody);
  } catch (error) {
    next(error);
  }
};
