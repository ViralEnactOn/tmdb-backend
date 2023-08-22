const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const get_movie_list = async (req, res) => {
  try {
    const response = await db.from("movie");

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      movies: response,
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

const movie = async (req, res) => {
  try {
    const { page } = req.query;
    const limit = 20;
    const response = await db
      .from("movie")
      .offset(page === "1" ? 0 : (page - 1) * limit)
      .limit(limit);

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      movies: response,
    });
  } catch (error) {
    console.log("Catch error", error);
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

module.exports = {
  get_movie_list,
  movie,
};
