const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const commentModel = require("../models/commentModel");

const insert = async (req, res) => {
  const { movie_id, comment, parent_comment_id } = req.body;
  console.log(req.body.parent_comment_id);

  try {
    await commentModel.insert(
      req.user.id,
      movie_id,
      comment,
      parent_comment_id
    );

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      commentId: "Comment inserted successfully",
    });
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};


module.exports = {
  insert,
};
