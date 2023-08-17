const db = require("../config/db");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { userSchema } = require("../models/userModel");
const { BASE_URL, secretKey } = require("../config/config");
const sendEmail = require("../config/sendMail");
const bcrypt = require("bcryptjs");
const crypto = import("crypto");
const jwt = require("jsonwebtoken");
const path = require("path");
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
  const { name, email, password } = req.body;
  let hashedPassword = await encryptPassword(password);
  db.schema.hasTable("user").then(async (exists) => {
    if (!exists) {
      await userSchema.then(async (response) => {
        await user();
      });
    } else {
      await user();
    }
  });
  const token = jwt.sign(
    { email: email },
    secretKey
    // {
    //   expiresIn: "2h",
    // }
  );

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
          password: hashedPassword,
          isVerified: false,
          // token: (await crypto).randomBytes(32).toString("hex"),
          token: token,
        })
        .then(async (response) => {
          await db("user")
            .where({ email: email })
            .then(async (responseData) => {
              const data = responseData[0];
              const message = `${BASE_URL}/user/verify/${data.id}/${data.token}`;
              await sendEmail.sendEmail(data.email, "Verify Email", message);
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
    if (user.length === 0) {
      return res.send({
        status: StatusCodes.BAD_REQUEST,
        message: `Invalid link`,
      });
    }

    await db("user")
      .where({ id: id })
      .update({ isVerified: true, token: "" })
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

const login_user = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await db("user")
      .where({ email })
      .where({ isVerified: true })
      .first();
    if (user === undefined) {
      return res.send({
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
      return res.send({
        status: StatusCodes.OK,
        message: ReasonPhrases.OK,
        data: { user: user, token: token },
      });
    } else {
      return res.send({
        status: StatusCodes.BAD_REQUEST,
        message: `Invalid password!`,
      });
    }
  } catch (error) {
    res.send({
      status: StatusCodes.INTERNAL_SERVER_ERROR,
      message: ReasonPhrases.INTERNAL_SERVER_ERROR,
      error: error,
    });
  }
};

const forgot_password = async (req, res) => {
  try {
    const { email } = req.body;
    const token = jwt.sign({ email: email }, secretKey);
    await db("user")
      .where({ email: email })
      .where({ isVerified: true })
      .update({ token: token })
      .then(async (response) => {
        await db("user")
          .where({ email: email })
          .where({ isVerified: true })
          .then(async (responseData) => {
            const data = responseData[0];
            const message = `${BASE_URL}/user/reset_password/id=${data.id}/token=${data.token}`;
            await sendEmail.forgotEmail(data.email, "Forgot Password", message);
            res.send({
              status: StatusCodes.OK,
              message: ReasonPhrases.OK,
              data: ` A forgot password email has been sent to ${data.email}`,
            });
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

const render_reset_password_template = (req, res) => {
  return res.sendFile(path.resolve("./public/reset-password.html"));
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

const reset_password = async (req, res) => {
  try {
    const { password, token, id } = req.body;
    console.log(req.body);

    // Encrypt the password before proceeding
    let hashedPassword = await encryptPassword(password);

    console.log({ hashedPassword });
    await db("user")
      .where({ id: id })
      .where({ token: token })
      .update({ password: hashedPassword, token: "" })
      .then(async (response) => {
        console.log({ response });
        await db("user")
          .where({ id: id })
          .where({ token: token })
          .then((responseData) => {
            let data = responseData[0];
            res.send({
              status: StatusCodes.OK,
              message: ReasonPhrases.OK,
              data: `The password for this ${data.email} has been successfully changed.`,
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

module.exports = {
  get_movie_list,
  get_movie,
  register_user,
  validate_user,
  login_user,
  render_reset_password_template,
  forgot_password,
  reset_password,
};
