const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { reactionModal } = require("../models/index");

const insert = async (req, res) => {
  const { movie_id, type } = req.body;

  try {
    const user_reaction = await reactionModal.fetch(req.user.id, movie_id);
    if (user_reaction.length === 0) {
      await reactionModal.insert(req.user.id, movie_id, type);

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        reaction: "Reaction inserted successfully",
      });
    } else {
      await reactionModal.update(req.user.id, movie_id, type);
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        reaction: "Reaction updated successfully",
      });
    }
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const remove = async (req, res) => {
  const { movie_id } = req.body;
  try {
    const deletedReaction = await reactionModal.remove(req.user.id, movie_id);

    if (deletedReaction === 1) {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Reaction delete operation successful",
      });
    } else {
      sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Reaction entry not found",
      });
    }
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

module.exports = { insert, remove };
