const db = require("../config/db");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { userSchema } = require("../models/userModel");
const config = require("../config/config");
const sendEmail = require("../config/sendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { default: jwtDecode } = require("jwt-decode");
const { watchlistSchema } = require("../models/userWatchListModel");
const { likeMovieSchema } = require("../models/likeMovieModel");
const { commentMovieSchema } = require("../models/commentMovieModel");
const { userFavoriteMovieSchema } = require("../models/userFavoriteMovieModel");

// Review stopped
const fetch_watch_list = async (req, res) => {
  const { token } = req.body;
  let decode = jwtDecode(token);
  try {
    db.select(
      "user_watch_list.id as user_watch_list_id",
      "user_watch_list.name as user_watch_list_name",
      "user.id as user_id",
      "user.name as user_name",
      "user.email as user_email"
    )
      .where({ user_id: decode.id })
      .from("user_watch_list")
      .join("user", "user_watch_list.user_id", "user.id")
      .then((response) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};

// Perfect
const update_watch_list = async (req, res) => {
  const { token, id, name, isPublic } = req.body;
  let decode = jwtDecode(token);
  try {
    await db("user_watch_list")
      .where({ id: id })
      .where({ user_id: decode.id })
      .update({ name: name, isPublic: isPublic, updated_at: db.fn.now() })
      .then((response) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const delete_watch_list = async (req, res) => {
  const { token, id } = req.body;
  let decode = jwtDecode(token);
  try {
    await db("user_watch_list")
      .where({ id: id })
      .where({ user_id: decode.id })
      .del()
      .then((response) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const insert_movie_watch_list = async (req, res) => {
  const { token, movie_id, id } = req.body;
  let decode = jwtDecode(token);
  try {
    db("user_watch_list")
      .where({ id, id })
      .where({ user_id: decode.id })
      .first()
      .then((response) => {
        let existingMovies =
          response.movies !== null ? JSON.parse(response.movies) : [];
        existingMovies.push(movie_id);
        // Update the movies JSON array back in the database
        return db("user_watch_list")
          .where({ id: id })
          .where({ user_id: decode.id })
          .update({
            movies: JSON.stringify(existingMovies),
            updated_at: db.fn.now(),
          });
      })
      .then((updateResult) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: updateResult,
        });
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
// For public and private
const fetch_movie_watch_list = async (req, res) => {
  const { watch_list_id, isPublic, user_id } = req.params;
  let watch_list = [];
  try {
    db.select("*")
      .from("user_watch_list")
      .where({ id: watch_list_id })
      .where({ user_id: user_id })
      .where({ isPublic: isPublic === "false" || false ? 0 : 1 })
      .first()
      .then((watchlist) => {
        if (watchlist && watchlist.movies && watchlist !== undefined) {
          watch_list.push(watchlist);
          const movieIds = JSON.parse(watchlist.movies);

          // Fetch movie details for the IDs in the movies array
          return db.select("*").from("movie").whereIn("id", movieIds);
        }
      })
      .then((movieDetails) => {
        if (movieDetails.length > 0) {
          res.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: { watchlist: watch_list, movieDetails: movieDetails },
          });
        } else {
          res.send({
            status: StatusCodes.OK,
            message: "No movie details found for the given movie IDs.",
          });
        }
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const delete_movie_watch_list = async (req, res) => {
  const { token, id, watch_list_id } = req.body;
  let decode = jwtDecode(token);
  try {
    await db
      .select("*")
      .from("user_watch_list")
      .where("id", id)
      .where({ user_id: decode.id })
      .first()
      .then((watchlist) => {
        if (watchlist && watchlist.movies) {
          const existingMovies = JSON.parse(watchlist.movies);

          // Remove the desired movie ID from the array
          const updatedMovies = existingMovies.filter(
            (movieId) => movieId !== watch_list_id
          );

          // Update the movies JSON array back in the database
          return db("user_watch_list")
            .where("id", id)
            .where({ user_id: decode.id })
            .update({ movies: JSON.stringify(updatedMovies) });
        } else {
          console.log("Watchlist not found or movies array is missing.");
          return null;
        }
      })
      .then((updateResult) => {
        if (updateResult !== null) {
          res.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: updateResult,
          });
        }
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const fetch_movie_genres_rating = async (req, res) => {
  const { genres_id } = req.body;
  try {
    db.select("*")
      .from("movie")
      .whereRaw("genre_ids LIKE ?", `%${genres_id}%`)
      .orderBy("vote_average", "desc")
      .then((response) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const like_movie = async (req, res) => {
  const { token, movie_id, type, rating } = req.body;
  let decode = jwtDecode(token);
  try {
    db.schema.hasTable("user_rating").then(async (exists) => {
      if (!exists) {
        await likeMovieSchema.then(async (response) => {
          await movie_like();
        });
      } else {
        await movie_like();
      }
    });
    const movie_like = async () => {
      await db("user_rating")
        .insert({
          user_id: decode.id,
          movie_id: movie_id,
          type: type,
          rating: rating,
        })
        .then(async (response) => {
          res.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: response,
          });
        })
        .catch((error) => {
          res.send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: error.message,
          });
        });
    };
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const insert_favorite = async (req, res) => {
  const { token, type, items } = req.body;
  let decode = jwtDecode(token);
  try {
    db("user_favorite_movie")
      .where({ user_id: decode.id })
      .first()
      .then((response) => {
        let existingMovies =
          response.items !== null ? JSON.parse(response.items) : [];
        existingMovies.push(items);
        return db("user_favorite_movie")
          .where({ user_id: decode.id })
          .update({
            type: type,
            items: JSON.stringify(existingMovies),
            updated_at: db.fn.now(),
          })
          .then((updateResult) => {
            res.send({
              status: StatusCodes.OK,
              message: ReasonPhrases.OK,
              data: updateResult,
            });
          })
          .catch((error) => {
            res.send({
              status: StatusCodes.INTERNAL_SERVER_ERROR,
              message: ReasonPhrases.INTERNAL_SERVER_ERROR,
              error: error.message,
            });
          });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const fetch_favorite_list = async (req, res) => {
  const { token } = req.body;
  let decode = jwtDecode(token);
  let watch_list = [];
  try {
    db.select("*")
      .from("user_favorite_movie")
      .where({ user_id: decode.id })
      .first()
      .then((watchlist) => {
        if (watchlist && watchlist.items && watchlist !== undefined) {
          watch_list.push(watchlist);
          const movieIds = JSON.parse(watchlist.items);

          // Fetch movie details for the IDs in the movies array
          return db.select("*").from("movie").whereIn("id", movieIds);
        }
      })
      .then((movieDetails) => {
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
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const delete_favorite_list = async (req, res) => {
  const { token, favorite_list_id } = req.body;
  let decode = jwtDecode(token);
  try {
    await db
      .select("*")
      .from("user_favorite_movie")
      .where("user_id", decode.id)
      .first()
      .then((watchlist) => {
        if (watchlist && watchlist.items) {
          const existingMovies = JSON.parse(watchlist.items);
          // Remove the desired movie ID from the array
          const updatedMovies = existingMovies.filter(
            (movieId) => movieId !== favorite_list_id
          );
          // Update the movies JSON array back in the database
          return db("user_favorite_movie")
            .where("user_id", decode.id)
            .update({ items: JSON.stringify(updatedMovies) });
        } else {
          console.log("favorite not found or movies array is missing.");
          return null;
        }
      })
      .then((updateResult) => {
        if (updateResult !== null) {
          res.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: updateResult,
          });
        }
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};
const comment_movie = async (req, res) => {
  const { token, movie_id, comment } = req.body;
  let decode = jwtDecode(token);
  try {
    db.schema.hasTable("user_comment").then(async (exists) => {
      if (!exists) {
        await commentMovieSchema.then(async (response) => {
          await movie_comment();
        });
      } else {
        await movie_comment();
      }
    });
    const movie_comment = async () => {
      await db("user_comment")
        .insert({
          movie_id: movie_id,
          user_id: decode.id,
          text: comment,
        })
        .then((commentIds) => {
          const parentCommentId = commentIds[0]; // Assuming commentIds is an array with the inserted comment ID
          res.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: parentCommentId,
          });
        })
        .catch((error) => {
          res.send({
            status: StatusCodes.INTERNAL_SERVER_ERROR,
            message: ReasonPhrases.INTERNAL_SERVER_ERROR,
            error: error.message,
          });
        });
    };
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const nested_comment = async (req, res) => {
  const { token, movie_id, comment, parent_comment_id } = req.body;
  let decode = jwtDecode(token);
  try {
    await db("user_comment")
      .insert({
        movie_id: movie_id,
        user_id: decode.id,
        text: comment,
        parent_comment_id: parent_comment_id,
      })
      .then((commentIds) => {
        const nestedCommentId = commentIds[0]; // Assuming commentIds is an array with the inserted comment ID
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: nestedCommentId,
        });
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
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
    db("movie")
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
      .orderBy(db.raw("YEAR(release_date), WEEK(release_date)"))
      .then((releaseCounts) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: releaseCounts,
        });
      })
      .catch((error) => {
        res.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
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
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: profitLossSummary,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const country_revenue = async (req, res) => {
  try {
    const { country } = req.body;
    db("movie")
      .sum("revenue as total_revenue")
      .whereRaw(`JSON_CONTAINS(production_countries, ?)`, [`["${country}"]`])
      .then((movies) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: movies,
        });
      });
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// i want to pass country in req.body

module.exports = {
  fetch_watch_list,
  update_watch_list,
  delete_watch_list,
  insert_movie_watch_list,
  fetch_movie_watch_list,
  delete_movie_watch_list,
  fetch_movie_genres_rating,
  like_movie,
  comment_movie,
  insert_favorite,
  fetch_favorite_list,
  delete_favorite_list,
  nested_comment,
  movie_chart,
  movie_profit_loss,
  country_revenue,
};
