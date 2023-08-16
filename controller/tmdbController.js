const db = require("../config/db");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { API_URL, Header, options } = require("../config/config");
const { userSchema } = require("../models/userModel");
const { response } = require("express");

const get_movie_list = async (req, res) => {
  try {
    await db
      .from("movie")
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
    console.log("Catch error", error);
  }
};

const get_movie = async (req, res) => {
  try {
    const { page } = req.query;
    const limit = 20;
    await db
      .from("movie")
      .offset(page === 1 ? 0 : page * limit)
      .limit(limit)
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
    console.log("Catch error", error);
  }
};

const register_user = async (req, res) => {
  db.schema.hasTable("user").then(async (exists) => {
    if (!exists) {
      await userSchema.then((response) => {});
    } else {
    }
    console.log(exists);
  });
  console.log("Register User");
};

module.exports = {
  get_movie_list,
  get_movie,
  register_user,
};
