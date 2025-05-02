const {
  deleteCommentById,
  selectCommentById,
  updateCommentById,
} = require("../models/comments.model");

exports.patchCommentById = async (req, res, next) => {
  try {
    const { comment_id } = req.params;
    const { inc_votes } = req.body;

    await selectCommentById(comment_id);

    const updatedComment = await updateCommentById(comment_id, inc_votes);

    const resBody = {
      updatedComment,
    };
    res.send(resBody);
  } catch (error) {
    next(error);
  }
};

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
