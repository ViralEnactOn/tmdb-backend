const db = require("../config/db");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { userSchema } = require("../models/userModel");
const { BASE_URL, secretKey } = require("../config/config");
const sendEmail = require("../config/sendMail");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");
const { default: jwtDecode } = require("jwt-decode");
const { watchlistSchema } = require("../models/userWatchListModel");
const { likeMovieSchema } = require("../models/likeMovieModel");
const { commentMovieSchema } = require("../models/commentMovieModel");
const { userFavoriteMovieSchema } = require("../models/userFavoriteMovieModel");
const get_movie_list = async (req, reply) => {
  try {
    await db
      .from("movie")
      .then((response) => {
        reply.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        reply.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error,
        });
      });
  } catch (error) {
    console.log("Catch error", error);
  }
};

const get_movie = async (req, reply) => {
  try {
    const { page } = req.query;
    const limit = 20;
    await db
      .from("movie")
      .offset(page === 1 ? 0 : page * limit)
      .limit(limit)
      .then((response) => {
        reply.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        reply.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error,
        });
      });
  } catch (error) {
    console.log("Catch error", error);
  }
};

const register_user = async (req, reply) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await encryptPassword(password);
    const token = jwt.sign({ email: email }, secretKey);

    // Check if the "user" table exists in the database
    const exists = await db.schema.hasTable("user");

    if (!exists) {
      // If the "user" table doesn't exist, create it
      await userSchema;
    }

    // Check if a user with the given email already exists
    const userData = await db("user").where({ email: email });

    if (userData.length !== 0) {
      return reply.send({
        status: StatusCodes.BAD_REQUEST,
        message: `User with the given email already exists!`,
      });
    }

    // Insert the user data into the "user" table
    const insertedUserIds = await db("user").insert({
      name: name,
      email: email,
      password: hashedPassword,
      isVerified: false,
      token: token,
    });

    const insertedUserId = insertedUserIds[0]; // Assuming user IDs are auto-incremented

    const verificationLink = `${BASE_URL}/user/verify/${insertedUserId}/${token}`;

    // Send a verification email
    await sendEmail.sendEmail(email, "Verify Email", verificationLink);

    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: `A verification email has been sent to ${email}`,
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};

// Not working
const validate_user = async (req, reply) => {
  const { id, token } = req.params;
  try {
    const user = await db("user")
      .where({
        id: id,
      })
      .where({
        token: token,
      });
    if (user.length === 0) {
      return reply.send({
        status: StatusCodes.BAD_REQUEST,
        message: `Invalid link`,
      });
    }

    await db("user")
      .where({ id: id })
      .update({ isVerified: true, token: "" })
      .then((response) => {
        db.schema.hasTable("user_favorite_movie").then(async (exists) => {
          if (!exists) {
            await userFavoriteMovieSchema.then(async (response) => {
              await insertFavorite();
            });
          } else {
            await insertFavorite();
          }
        });
      });

    const insertFavorite = async () => {
      try {
        await db("user_favorite_movie")
          .insert({
            user_id: id,
          })
          .then((responseData) => {
            reply
              .send({
                status: StatusCodes.OK,
                message: ReasonPhrases.OK,
                data: `Email has been verified `,
              })
              .catch((error) => {
                reply.send({
                  status: StatusCodes.INTERNAL_SERVER_ERROR,
                  message: ReasonPhrases.INTERNAL_SERVER_ERROR,
                  error: error,
                });
              });
          });
      } catch (error) {
        reply.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error,
        });
      }
    };
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};

const login_user = async (req, reply) => {
  const { email, password } = req.body;
  try {
    const user = await db("user")
      .where({ email })
      .where({ isVerified: true })
      .first();
    if (user === undefined) {
      return reply.send({
        status: StatusCodes.BAD_REQUEST,
        message: `User not found or please verify your email!`,
      });
    }
    const passwordMatches = await bcrypt.compare(password, user.password);

    if (passwordMatches) {
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        secretKey,
        {
          expiresIn: "2h",
        }
      );
      return reply.send({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        data: { user: user, token: token },
      });
    } else {
      return reply.send({
        status: StatusCodes.BAD_REQUEST,
        message: `Invalid password!`,
      });
    }
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};

const forgot_password = async (req, reply) => {
  try {
    const { email } = req.body;
    const token = jwt.sign({ email: email }, secretKey);
    await db("user")
      .where({ email: email })
      .where({ isVerified: true })
      .update({ token: token })
      .then(async (response) => {
        console.log(response);
        if (response === 1) {
          await db("user")
            .where({ email: email })
            .where({ isVerified: true })
            .first()
            .then(async (responseData) => {
              const message = `${BASE_URL}/user/reset_password/id=${responseData.id}/token=${responseData.token}`;
              await sendEmail.forgotEmail(
                responseData.email,
                "Forgot Password",
                message
              );
              reply.send({
                status: StatusCodes.OK,
                message: ReasonPhrases.OK,
                data: ` A forgot password email has been sent to ${responseData.email}`,
              });
            });
        } else {
          reply.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: `This ${email} is not exists`,
          });
        }
      });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};

// Not Working
const render_reset_password_template = (req, reply) => {
  return reply.sendFile(path.resolve("./public/reset-password.html"));
};

const encryptPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(password, salt);
    return hash;
  } catch (error) {
    console.log("Cannot encrypt");
    throw error;
  }
};

const reset_password = async (req, reply) => {
  try {
    const { password, token, id } = req.body;
    let decode = jwtDecode(token);

    // Encrypt the password before proceeding
    let hashedPassword = await encryptPassword(password);

    await db("user")
      .where({ id: id })
      .where({ token: token })
      .update({ password: hashedPassword, token: "" })
      .then(async (response) => {
        if (response !== 0) {
          reply.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: `The password for this ${decode.email} has been successfully changed.`,
          });
        } else {
          reply.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: `The password for this ${decode.email} has can not been changed.`,
          });
        }
      })
      .catch((error) => {
        reply.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};
// Perfect
const insert_watch_list = async (req, reply) => {
  try {
    const { token, name, isPublic } = req.body;
    const decode = jwtDecode(token);

    const user = await db("user")
      .where({ id: decode.id, email: decode.email, isVerified: true })
      .first();

    if (!user) {
      return reply.send({
        status: StatusCodes.BAD_REQUEST,
        message: `Invalid user or user not verified`,
      });
    }

    const exists = await db.schema.hasTable("user_watch_list");
    if (!exists) {
      await watchlistSchema;
    }

    const watchListId = await db("user_watch_list")
      .insert({
        name: name,
        user_id: decode.id,
        isPublic: isPublic,
      })
      .returning("id");

    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: { watchListId: watchListId[0] },
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const fetch_watch_list = async (req, reply) => {
  const { token } = req.body;
  const decode = jwtDecode(token);

  try {
    const watchLists = await db
      .select(
        "user_watch_list.id as user_watch_list_id",
        "user_watch_list.name as user_watch_list_name",
        "user.id as user_id",
        "user.name as user_name",
        "user.email as user_email"
      )
      .from("user_watch_list")
      .join("user", "user_watch_list.user_id", "user.id")
      .where("user_watch_list.user_id", decode.id);

    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: watchLists,
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const update_watch_list = async (req, reply) => {
  const { token, id, name, isPublic } = req.body;
  let decode = jwtDecode(token);
  try {
    await db("user_watch_list")
      .where({ id: id })
      .where({ user_id: decode.id })
      .update({ name: name, isPublic: isPublic, updated_at: db.fn.now() })
      .then((response) => {
        reply.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        reply.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const delete_watch_list = async (req, reply) => {
  const { token, id } = req.body;
  let decode = jwtDecode(token);
  try {
    await db("user_watch_list")
      .where({ id: id })
      .where({ user_id: decode.id })
      .del()
      .then((response) => {
        reply.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: response,
        });
      })
      .catch((error) => {
        reply.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const insert_movie_watch_list = async (req, reply) => {
  const { token, movie_id, id } = req.body;
  const decode = jwtDecode(token);

  try {
    const response = await db("user_watch_list")
      .where({ id: id, user_id: decode.id })
      .first();

    if (!response) {
      return reply.send({
        status: StatusCodes.NOT_FOUND,
        message: "Watchlist not found.",
      });
    }

    let existingMovies =
      response.movies !== null ? JSON.parse(response.movies) : [];
    existingMovies.push(movie_id);

    const updateResult = await db("user_watch_list")
      .where({ id: id })
      .where({ user_id: decode.id })
      .update({
        movies: JSON.stringify(existingMovies),
        updated_at: db.fn.now(),
      });

    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: updateResult,
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
// For public and private
const fetch_movie_watch_list = async (req, reply) => {
  const { watch_list_id, isPublic, user_id } = req.params;
  let watch_list = [];
  try {
    const watchlist = await db
      .select("*")
      .from("user_watch_list")
      .where({ id: watch_list_id })
      .where({ user_id: user_id })
      .where({ isPublic: isPublic === "false" || isPublic === false ? 0 : 1 })
      .first();

    if (watchlist && watchlist.movies && watchlist !== undefined) {
      watch_list.push(watchlist);
      const movieIds = JSON.parse(watchlist.movies);

      // Fetch movie details for the IDs in the movies array
      const movieDetails = await db
        .select("*")
        .from("movie")
        .whereIn("id", movieIds);

      if (movieDetails.length > 0) {
        reply.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: { watchlist: watch_list, movieDetails: movieDetails },
        });
      } else {
        reply.send({
          status: StatusCodes.OK,
          message: "No movie details found for the given movie IDs.",
        });
      }
    } else {
      reply.send({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        data: "No watchlist found.",
      });
    }
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const delete_movie_watch_list = async (req, reply) => {
  const { token, id, watch_list_id } = req.body;
  const decode = jwtDecode(token);

  try {
    const watchlist = await db
      .select("*")
      .from("user_watch_list")
      .where("id", id)
      .where({ user_id: decode.id })
      .first();

    if (watchlist && watchlist.movies) {
      const existingMovies = JSON.parse(watchlist.movies);

      // Remove the desired movie ID from the array
      const updatedMovies = existingMovies.filter(
        (movieId) => movieId !== watch_list_id
      );

      // Update the movies JSON array back in the database
      const updateResult = await db("user_watch_list")
        .where("id", id)
        .where({ user_id: decode.id })
        .update({ movies: JSON.stringify(updatedMovies) });

      reply.send({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        data: updateResult,
      });
    } else {
      reply.send({
        status: StatusCodes.NOT_FOUND,
        message: "Watchlist not found or movies array is missing.",
      });
    }
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const fetch_movie_genres_rating = async (req, reply) => {
  const { genres_id } = req.body;

  try {
    const movies = await db
      .select("*")
      .from("movie")
      .whereRaw("genre_ids LIKE ?", `%${genres_id}%`)
      .orderBy("vote_average", "desc");

    if (movies.length > 0) {
      reply.send({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        data: movies,
      });
    } else {
      reply.send({
        status: StatusCodes.NOT_FOUND,
        message: "No movies found for the given genre IDs.",
      });
    }
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

// Perfect
const like_movie = async (req, reply) => {
  const { token, movie_id, type, rating } = req.body;
  let decode = jwtDecode(token);

  try {
    const exists = await db.schema.hasTable("user_rating");
    if (!exists) {
      await likeMovieSchema;
    }

    await db("user_rating").insert({
      user_id: decode.id,
      movie_id: movie_id,
      type: type,
      rating: rating,
    });

    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: "Rating added successfully.",
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const insert_favorite = async (req, reply) => {
  const { token, type, items } = req.body;
  let decode = jwtDecode(token);
  try {
    const userFavorite = await db("user_favorite_movie")
      .where({ user_id: decode.id })
      .first();

    let existingItems =
      userFavorite && userFavorite.items ? JSON.parse(userFavorite.items) : [];
    existingItems.push(items);

    const updateResult = await db("user_favorite_movie")
      .where({ user_id: decode.id })
      .update({
        type: type,
        items: JSON.stringify(existingItems),
        updated_at: db.fn.now(),
      });

    if (updateResult === 1) {
      reply.send({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        data: "Movie has been stored in favorites",
      });
    } else {
      reply.send({
        status: StatusCodes.INTERNAL_SERVER_ERROR,
        message: "Failed to store movie in favorites",
      });
    }
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const fetch_favorite_list = async (req, reply) => {
  const { token } = req.body;
  let decode = jwtDecode(token);
  let favorite_list = [];
  try {
    const userFavorite = await db
      .select("*")
      .from("user_favorite_movie")
      .where({ user_id: decode.id })
      .first();

    if (userFavorite && userFavorite.items) {
      favorite_list.push(userFavorite);
      const movieIds = JSON.parse(userFavorite.items);

      // Fetch movie details for the IDs in the items array
      const movieDetails = await db
        .select("*")
        .from("movie")
        .whereIn("id", movieIds);

      if (movieDetails.length > 0) {
        reply.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: { favorite_list: favorite_list, movieDetails: movieDetails },
        });
      } else {
        reply.send({
          status: StatusCodes.OK,
          message: "No movie details found for the given movie IDs.",
        });
      }
    } else {
      reply.send({
        status: StatusCodes.OK,
        message: "No favorite movie list found for the user.",
      });
    }
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const delete_favorite_list = async (req, reply) => {
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
          reply.send({
            status: StatusCodes.OK,
            message: ReasonPhrases.OK,
            data: updateResult,
          });
        }
      })
      .catch((error) => {
        reply.send({
          status: StatusCodes.INTERNAL_SERVER_ERROR,
          message: ReasonPhrases.INTERNAL_SERVER_ERROR,
          error: error.message,
        });
      });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};
const comment_movie = async (req, reply) => {
  const { token, movie_id, comment } = req.body;
  let decode = jwtDecode(token);

  try {
    const exists = await db.schema.hasTable("user_comment");
    if (!exists) {
      await commentMovieSchema;
    }

    const commentIds = await db("user_comment").insert({
      movie_id: movie_id,
      user_id: decode.id,
      text: comment,
    });

    const parentCommentId = commentIds[0]; // Assuming commentIds is an array with the inserted comment ID
    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: parentCommentId,
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const nested_comment = async (req, reply) => {
  const { token, movie_id, comment, parent_comment_id } = req.body;
  let decode = jwtDecode(token);

  try {
    const commentIds = await db("user_comment").insert({
      movie_id: movie_id,
      user_id: decode.id,
      text: comment,
      parent_comment_id: parent_comment_id,
    });

    const nestedCommentId = commentIds[0]; // Assuming commentIds is an array with the inserted comment ID
    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: nestedCommentId,
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const movie_chart = async (req, reply) => {
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

    reply.send({
      status: StatusCodes.OK,
      message: ReasonPhrases.OK,
      data: releaseCounts,
    });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

const movie_profit_loss = (req, reply) => {
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
        reply.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: profitLossSummary,
        });
      });
  } catch (error) {
    reply.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error.message,
    });
  }
};

module.exports = {
  get_movie_list,
  get_movie,
  register_user,
  validate_user,
  login_user,
  render_reset_password_template,
  forgot_password,
  reset_password,
  insert_watch_list,
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
};
