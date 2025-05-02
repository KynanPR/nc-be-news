const db = require("../../db/connection");
const { ApiError } = require("../../utils");

exports.selectCommentById = async (commentId) => {
  const {
    rows: [comment],
  } = await db.query(`SELECT * FROM comments WHERE comment_id = $1`, [
    commentId,
  ]);

  if (!comment) {
    throw new ApiError(404, `Can't find comment with ID: ${commentId}`);
  }

  return comment;
};

exports.updateCommentById = async (commentId, voteIncAmount) => {
  const {
    rows: [updatedComment],
  } = await db.query(
    `
    UPDATE comments
    SET
      votes = votes + $2
    WHERE
      comment_id = $1
    RETURNING *;
    `,
    [commentId, voteIncAmount]
  );

  return updatedComment;
};

exports.deleteCommentById = async (commentId) => {
  await db.query(`DELETE FROM comments WHERE comment_id = $1`, [commentId]);

  return;
};
