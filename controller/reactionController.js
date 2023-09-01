const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
const { reactionModal } = require("../models/index");

const insert = async (req, res) => {
  const { movie_id, type } = req.body;

  const user_reaction = await reactionModal.fetch(req.user.id, movie_id);
  if (user_reaction.length === 0) {
    await reactionModal.insert(req.user.id, movie_id, type);

    sendResponse(res, StatusCodes.OK, {
      reaction: "Reaction inserted successfully",
    });
  } else {
    await reactionModal.update(req.user.id, movie_id, type);
    sendResponse(res, StatusCodes.OK, {
      reaction: "Reaction updated successfully",
    });
  }
};

const remove = async (req, res) => {
  const { movie_id } = req.body;

  const deletedReaction = await reactionModal.remove(req.user.id, movie_id);

  if (deletedReaction === 1) {
    sendResponse(res, StatusCodes.OK, {
      message: "Reaction delete operation successful",
    });
  } else {
    sendResponse(res, StatusCodes.NOT_FOUND, {
      message: "Reaction entry not found",
    });
  }
};

module.exports = { insert, remove };
