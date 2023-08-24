const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const {
  verifyUserMiddleware,
} = require("../middleware/authenticationMiddleware");
const { reactionSchema } = require("../schema/reactionSchema");
const {
  find_record,
  insert_record,
  update_record,
  delete_record,
  user_reaction_exist,
} = require("../models/reactionModel");

const insert_reaction = async (req, res) => {
  const { movie_id, type } = req.body;

  try {
    await verifyUserMiddleware(req, res, async () => {
      const movie_reaction = async () => {
        try {
          const user_reaction = await find_record(req.user.id, movie_id);
          if (user_reaction.length === 0) {
            await insert_record(req.user.id, movie_id, type);

            sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
              reaction: "Reaction inserted successfully",
            });
          } else {
            await update_record(req.user.id, movie_id, type);
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
      const exists = await user_reaction_exist();
      if (!exists) {
        await reactionSchema.then(async (response) => {
          await movie_reaction();
        });
      } else {
        await movie_reaction();
      }
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

const delete_reaction = async (req, res) => {
  const { movie_id } = req.body;
  try {
    await verifyUserMiddleware(req, res, async () => {
      const deletedReaction = await delete_record(req.user.id, movie_id);

      if (deletedReaction === 1) {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "Reaction delete operation successful",
        });
      } else {
        sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
          message: "Reaction entry not found",
        });
      }
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

module.exports = { insert_reaction, delete_reaction };
