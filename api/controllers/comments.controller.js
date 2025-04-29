const {
  deleteCommentById,
  selectCommentById,
} = require("../models/comments.model");

exports.deleteCommentById = async (req, res, next) => {
  try {
    const { comment_id } = req.params;

    await selectCommentById(comment_id);

    await deleteCommentById(comment_id);
    res.status(204).json();
  } catch (error) {
    next(error);
  }
};
