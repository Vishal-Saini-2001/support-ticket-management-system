const commentService = require('../services/commentService');
const asyncHandler = require('../utils/asyncHandler');

const getComments = asyncHandler(async (req, res) => {
  const comments = await commentService.getCommentsByTicket(req.params.id, req.user);
  res.status(200).json({ data: comments });
});

const createComment = asyncHandler(async (req, res) => {
  const comment = await commentService.addComment(req.params.id, req.body.message, req.user);
  res.status(201).json({ data: comment });
});

module.exports = {
  getComments,
  createComment,
};

