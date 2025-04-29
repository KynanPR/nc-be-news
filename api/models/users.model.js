const db = require("../../db/connection");
const { ApiError } = require("../../utils");

exports.selectAllUsers = async () => {
  const { rows: users } = await db.query(`SELECT * FROM users;`);

  if (!users.length) {
    throw new ApiError(404, "No users found");
  }

  return users;
};
