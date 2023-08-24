const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");
const { commentMovieSchema } = require("../schema/commentMovieModel");
const { likeMovieSchema } = require("../schema/likeMovieModel");
const {
  verifyUserMiddleware,
} = require("../middleware/authenticationMiddleware");
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
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

const genres_rating = async (req, res) => {
  const { genres_id } = req.body;

  try {
    const response = await db("movie")
      .select("*")
      .whereRaw("genre_ids LIKE ?", `%${genres_id}%`)
      .orderBy("vote_average", "desc");

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

const movie_rating = async (req, res) => {
  const { movie_id, type, rating } = req.body;

  try {
    await verifyUserMiddleware(req, res, async () => {
      const movie_like = async () => {
        try {
          await db("user_rating").insert({
            user_id: req.user.id,
            movie_id: movie_id,
            type: type,
            rating: rating,
          });

          sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
            message: "Movie rating inserted successfully",
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
      const exists = await db.schema.hasTable("user_rating");
      if (!exists) {
        await likeMovieSchema.then(async (response) => {
          await movie_like();
        });
      } else {
        await movie_like();
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

const comment_movie = async (req, res) => {
  const { movie_id, comment } = req.body;

  try {
    await verifyUserMiddleware(req, res, async () => {
      const movie_comment = async () => {
        try {
          await db("user_comment").insert({
            movie_id: movie_id,
            user_id: req.user.id,
            text: comment,
          });

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
      const exists = await db.schema.hasTable("user_comment");
      if (!exists) {
        await commentMovieSchema.then(async (response) => {
          await movie_comment();
        });
      } else {
        await movie_comment();
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

const nested_comment = async (req, res) => {
  const { movie_id, comment, parent_comment_id } = req.body;
  try {
    await verifyUserMiddleware(req, res, async () => {
      await db("user_comment").insert({
        movie_id: movie_id,
        user_id: req.user.id,
        text: comment,
        parent_comment_id: parent_comment_id,
      });

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "Nested comment inserted successfully",
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

const movie_chart = async (req, res) => {
  const { genres_id } = req.body;
  const currentDate = new Date();
  const threeYearsAgo = new Date(
    currentDate.getFullYear() - 3,
    currentDate.getMonth(),
    currentDate.getDate()
  );
  try {
    const releaseCounts = await db("movie")
      .select(
        db.raw(
          "YEAR(release_date) as year, WEEK(release_date) as week, COUNT(*) as movie_count"
        )
      )
      // .whereRaw(`FIND_IN_SET(${genres_id}, genre_ids)`)
      // .whereIn(
      //   db.raw('JSON_UNQUOTE(JSON_EXTRACT(genre_ids, "$[*]"))'),
      //   genres_id
      // )
      .where("release_date", ">=", threeYearsAgo)
      .groupBy(db.raw("YEAR(release_date), WEEK(release_date)"))
      .orderBy(db.raw("YEAR(release_date), WEEK(release_date)"));

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      movie: releaseCounts,
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

const movie_profit_loss = (req, res) => {
  try {
    db("movie")
      .select(
        "id",
        "title",
        "budget",
        "revenue",
        db.raw("(revenue - budget) as profit_loss"),
        db.raw(
          'CASE WHEN revenue > budget THEN "Profit" ELSE "Loss" END as result'
        )
      )
      .then((profitLossSummary) => {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          revenue: profitLossSummary,
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

const movie_country_revenue = async (req, res) => {
  try {
    const { country } = req.body;
    db("movie")
      .sum("revenue as total_revenue")
      .whereRaw(`JSON_CONTAINS(production_countries, ?)`, [`["${country}"]`])
      .then((movies) => {
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          county_revenue: movies,
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

module.exports = {
  get_movie_list,
  movie,
  genres_rating,
  movie_rating,
  comment_movie,
  nested_comment,
  movie_chart,
  movie_profit_loss,
  movie_country_revenue,
};
