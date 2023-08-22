const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");
const { watchlistSchema } = require("../models/userWatchListModel");

// Insert and Update
const insert_watch_list = async (req, res) => {
  try {
    const { token, name, isPublic, id, isDeleted } = req.body;
    const decode = jwtDecode(token);
    const insertOrUpdateOrDeleteWatchList = async () => {
      if (!id && !isDeleted) {
        await db("user_watch_list").insert({
          name: name,
          user_id: decode.id,
          isPublic: isPublic,
        });
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "New watch list operation successful",
        });
      } else if (!isDeleted) {
        const existingWatchList = await db("user_watch_list")
          .where({ user_id: decode.id, id: id })
          .first();

        if (existingWatchList) {
          // Update existing watch list
          await db("user_watch_list")
            .where({ id: existingWatchList.id })
            .update({
              name: name,
              isPublic: isPublic,
            });
          sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
            message: "Watch list operation successful",
          });
        } else {
          sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
            message: "Watch list entry not found",
          });
        }
      } else {
        const deleteWatchList = await db("user_watch_list")
          .where({ user_id: decode.id, id: id })
          .first();

        if (deleteWatchList) {
          // Update existing watch list
          await db("user_watch_list").where({ id: deleteWatchList.id }).update({
            isDeleted: true,
          });
          sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
            message: "Watch list delete operation successful",
          });
        } else {
          sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
            message: "Watch list entry not found",
          });
        }
      }
    };
    const exists = await db.schema.hasTable("user_watch_list");
    if (!exists) {
      await watchlistSchema.then(async (response) => {
        await insertOrUpdateOrDeleteWatchList();
      });
    } else {
      await insertOrUpdateOrDeleteWatchList();
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
const fetch_watch_list = async (req, res) => {
  const { token } = req.body;
  const decode = jwtDecode(token);

  try {
    const watchListData = await db
      .select(
        "user_watch_list.id as user_watch_list_id",
        "user_watch_list.name as user_watch_list_name",
        "user.id as user_id",
        "user.name as user_name",
        "user.email as user_email"
      )
      .where({ user_id: decode.id, isDeleted: false })
      .from("user_watch_list")
      .join("user", "user_watch_list.user_id", "user.id");

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      watch_list: watchListData,
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
  insert_watch_list,
  fetch_watch_list,
};
