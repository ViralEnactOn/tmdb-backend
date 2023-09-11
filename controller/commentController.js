const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");

const { commentModel } = require("../models/index");

const insert = async (req, res) => {
  const { movie_id, comment, parent_comment_id } = req.body;

  await commentModel.insert(req.user.id, movie_id, comment, parent_comment_id);

  sendResponse(res, StatusCodes.OK, {
    commentId: "Comment inserted successfully",
  });
};

const fetch = async (req, res) => {
  const { movie_id } = req.body;

  const userComment = await commentModel.fetch(movie_id);

  sendResponse(res, StatusCodes.OK, {
    comment: userComment,
  });
};

module.exports = {
  insert,
  fetch,
};
