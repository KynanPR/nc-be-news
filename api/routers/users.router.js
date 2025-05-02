const {
  getAllUsers,
  getUserByUsername,
} = require("../controllers/users.controller");
const usersRouter = require("express").Router();

usersRouter.get("/", getAllUsers);

usersRouter.get("/:username", getUserByUsername);

module.exports = usersRouter;
