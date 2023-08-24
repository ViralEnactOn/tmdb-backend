const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");
const { watchlistSchema } = require("../schema/userWatchListModel");
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");

const insert_watch_list = async (req, res) => {
  const { name, isPublic } = req.body;
  const insertWatchList = async () => {
    try {
      await authenticationUserMiddleware(req, res, async () => {
        await db("user_watch_list").insert({
          name: name,
          user_id: req.user.id,
          isPublic: isPublic,
        });

        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "New watch list operation successful",
        });
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

  try {
    // Check if the watch list table exists
    const tableExists = await db.schema.hasTable("user_watch_list");
    if (!tableExists) {
      // If the table doesn't exist, create it
      await watchlistSchema.then(() => {
        insertWatchList();
      });
    } else {
      // If the table already exists, directly insert the watch list
      await insertWatchList();
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

const update_watch_list = async (req, res) => {
  const { id, name, isPublic } = req.body;

  try {
    await authenticationUserMiddleware(req, res, async () => {
      const updatedWatchList = await db("user_watch_list")
        .where({ user_id: req.user.id, id: id })
        .update({
          name: name,
          isPublic: isPublic,
          updated_at: db.fn.now(),
        });

      if (updatedWatchList === 1) {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "Watch list operation successful",
        });
      } else {
        sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
          message: "Watch list entry not found",
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

const delete_watch_list = async (req, res) => {
  const { id } = req.body;
  try {
    await authenticationUserMiddleware(req, res, async () => {
      const deletedWatchList = await db("user_watch_list")
        .where({ user_id: req.user.id, id: id })
        .update({
          isDeleted: true,
          updated_at: db.fn.now(),
        });

      if (deletedWatchList === 1) {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "Watch list delete operation successful",
        });
      } else {
        sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
          message: "Watch list entry not found",
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

const fetch_watch_list = async (req, res) => {
  try {
    await authenticationUserMiddleware(req, res, async () => {
      const watchListData = await db
        .select(
          "user_watch_list.id as user_watch_list_id",
          "user_watch_list.name as user_watch_list_name",
          "user.id as user_id",
          "user.name as user_name",
          "user.email as user_email"
        )
        .where({ user_id: req.user.id, isDeleted: false })
        .from("user_watch_list")
        .join("user", "user_watch_list.user_id", "user.id");

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        watch_list: watchListData,
      });
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

// Insert / Update movie in watch list
const insert_movie = async (req, res) => {
  const { movie_id, id } = req.body;

  try {
    await authenticationUserMiddleware(req, res, async () => {
      const updateResult = await db("user_watch_list")
        .where({ id: id })
        .where({ user_id: req.user.id })
        .update({
          movies: db.raw(
            `JSON_ARRAY_APPEND(COALESCE(movies, JSON_ARRAY()), '$', ?)`,
            [movie_id]
          ),
          updated_at: db.fn.now(),
        });

      if (updateResult === 0) {
        return sendResponse(
          res,
          StatusCodes.NOT_FOUND,
          ReasonPhrases.NOT_FOUND,
          {
            message: "Watch list entry not found",
          }
        );
      }

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Movie inserted successfully",
      });
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

const delete_movie = async (req, res) => {
  const { id, watch_list_id } = req.body;
  try {
    await authenticationUserMiddleware(req, res, async () => {
      const updateResult = await db("user_watch_list")
        .where("id", id)
        .where({ user_id: req.user.id })
        .update({
          movies: db.raw(
            `JSON_REMOVE(COALESCE(movies, '[]'), JSON_UNQUOTE(JSON_SEARCH(COALESCE(movies, '[]'), 'one', ?)))`,
            [watch_list_id]
          ),
          updated_at: db.fn.now(),
        });

      if (updateResult === 0) {
        return sendResponse(
          res,
          StatusCodes.NOT_FOUND,
          ReasonPhrases.NOT_FOUND,
          {
            message: "Watch list entry not found",
          }
        );
      }

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Movie deleted successfully",
      });
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

const fetch_movie = async (req, res) => {
  const { watch_list_id, isPublic, user_id } = req.params;
  let watch_list = [];

  try {
    const watchlist = await db("user_watch_list")
      .where({
        id: watch_list_id,
        user_id: user_id,
        isDeleted: false,
        isPublic: isPublic === "false" || false ? 0 : 1,
      })
      .first();

    if (watchlist && watchlist.movies) {
      watch_list.push(watchlist);

      const movieIds = JSON.parse(watchlist.movies);
      // Fetch movie details for the IDs in the movies array
      const movieDetails = await db("movie").whereIn("id", movieIds);

      if (movieDetails.length > 0) {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          watchlist: watch_list,
          movieDetails: movieDetails,
        });
      } else {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: "No movie details found for the given movie IDs.",
        });
      }
    } else {
      sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list not found or movies array is missing.",
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

module.exports = {
  insert_watch_list,
  update_watch_list,
  delete_watch_list,
  fetch_watch_list,
  insert_movie,
  delete_movie,
  fetch_movie,
};
