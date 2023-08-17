const db = require("../config/db");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { userSchema } = require("../models/userModel");
const nodemailer = require("nodemailer");
const { BASE_URL } = require("../config/config");
const sendEmail = require("../config/sendMail");
const { response } = require("express");
const crypto = import("crypto");

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
  const { name, email, password } = req.body;
  db.schema.hasTable("user").then(async (exists) => {
    if (!exists) {
      await userSchema.then(async (response) => {
        await user();
      });
    } else {
      await user();
    }
  });

  // Main Function
  const user = async () => {
    try {
      // Check user exists or not
      let userData = await db("user").where({ email: email });
      if (userData.length !== 0) {
        return res.send({
          status: StatusCodes.BAD_REQUEST,
          message: `User with given email already exist!`,
        });
      }

      // If not then insert user
      userData = await db("user")
        .insert({
          name: name,
          email: email,
          password: password,
          isVerified: false,
          token: (await crypto).randomBytes(32).toString("hex"),
        })
        .then(async (response) => {
          await db("user")
            .where({ email: email })
            .then(async (responseData) => {
              const data = responseData[0];
              const message = `${BASE_URL}/user/verify/${data.id}/${data.token}`;
              await sendEmail(data.email, "Verify Email", message);
              res.send({
                status: StatusCodes.OK,
                message: ReasonPhrases.OK,
                data: ` A verification email has been sent to ${data.email}`,
              });
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
};

const validate_user = async (req, res) => {
  const { id, token } = req.params;
  try {
    const user = await db("user")
      .where({
        id: id,
      })
      .where({
        token: token,
      });
    if (!user) {
      return res.send({
        status: StatusCodes.BAD_REQUEST,
        message: `Invalid link`,
      });
    }

    await db("user")
      .where({ id: id })
      .update({ isVerified: true })
      .then((response) => {
        res.send({
          status: StatusCodes.OK,
          message: ReasonPhrases.OK,
          data: `Email has been verified `,
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

module.exports = {
  get_movie_list,
  get_movie,
  register_user,
  validate_user,
};
