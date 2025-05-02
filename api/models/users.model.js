const db = require("../../db/connection");
const { ApiError } = require("../../utils");

exports.selectAllUsers = async () => {
  const { rows: users } = await db.query(`SELECT * FROM users;`);

  if (!users.length) {
    throw new ApiError(404, "No users found");
  }

  return users;
};

exports.selectUserByUsername = async (username) => {
  const {
    rows: [user],
  } = await db.query(`SELECT * FROM users WHERE username = $1;`, [username]);

  if (!user) {
    throw new ApiError(404, `Can't find user with username: ${username}`);
  }

  return user;
};
