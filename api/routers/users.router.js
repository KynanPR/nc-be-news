const { getAllUsers } = require("../controllers/users.controller");
const usersRouter = require("express").Router();

usersRouter.get("/", getAllUsers);

module.exports = usersRouter;
