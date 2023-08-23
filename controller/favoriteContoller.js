const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");

const insert_favorite = async (req, res) => {
  const { token, type, items } = req.body;
  let decode = jwtDecode(token);
  try {
    const updateResult = await db("user_favorite_movie")
      .where({ user_id: decode.id })
      .update({
        type: type,
        items: db.raw(
          `JSON_ARRAY_APPEND(COALESCE(items, JSON_ARRAY()), '$', ?)`,
          [items]
        ),
        updated_at: db.fn.now(),
      });
    if (updateResult === 0) {
      return sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Favorite list entry not found",
      });
    }
    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      message: "Favorite list inserted successfully",
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

const fetch_favorite = async (req, res) => {
  const { token } = req.body;
  const decode = jwtDecode(token);
  let watch_list = [];

  try {
    const watchlist = await db("user_favorite_movie")
      .where({ user_id: decode.id })
      .first();

    if (watchlist && watchlist.items) {
      watch_list.push(watchlist);

      const movieIds = JSON.parse(watchlist.items);

      // Fetch movie details for the IDs in the items array
      const movieDetails = await db("movie").whereIn("id", movieIds);

      if (movieDetails.length > 0) {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: { favorite_list: watch_list, movieDetails: movieDetails },
        });
      } else {
        res.send({
          status: StatusCodes.OK,
          message: "No movie details found for the given movie IDs.",
        });
      }
    } else {
      res.send({
        status: StatusCodes.NOT_FOUND,
        message: "Watch list not found or items array is missing.",
      });
    }
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const delete_favorite = async (req, res) => {
  const { token, favorite_list_id } = req.body;
  let decode = jwtDecode(token);
  try {
    const updateResult = await db("user_favorite_movie")
      .where({ user_id: decode.id })
      .update({
        items: db.raw(
          `JSON_REMOVE(COALESCE(items, '[]'), JSON_UNQUOTE(JSON_SEARCH(COALESCE(items, '[]'), 'one', ?)))`,
          [favorite_list_id]
        ),
        updated_at: db.fn.now(),
      });

    if (updateResult === 0) {
      return sendResponse(res, StatusCodes.NOT_FOUND, ReasonPhrases.NOT_FOUND, {
        message: "Watch list entry not found",
      });
    }

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      message: "Movie deleted successfully",
    });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};
module.exports = { insert_favorite, fetch_favorite, delete_favorite };
