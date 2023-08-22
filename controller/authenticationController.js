const db = require("../config/db");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { userSchema } = require("../models/userModel");
const bcrypt = require("bcryptjs");
const sendEmail = require("../config/sendMail");
const sendResponse = require("../config/responseUtil");
const { default: jwtDecode } = require("jwt-decode");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const path = require("path");

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

const insertFavorite = async (userId) => {
  try {
    const exists = await db.schema.hasTable("user_favorite_movie");

    if (!exists) {
      await userFavoriteMovieSchema.then(() => {
        return db("user_favorite_movie").insert({
          user_id: userId,
        });
      });
    } else {
      return db("user_favorite_movie").insert({
        user_id: userId,
      });
    }
  } catch (error) {
    throw error;
  }
};
const register_user = async (req, res) => {
  const { name, email, password } = req.body;
  let hashedPassword = await encryptPassword(password);
  const token = jwt.sign({ email: email, name: name }, config.jwt.secret_key);
  const insertUser = async () => {
    try {
      // Check if user with the given email exists
      let userData = await db("user").where({ email: email });
      if (userData.length !== 0) {
        return res.send({
          status: StatusCodes.BAD_REQUEST,
          message: `User with the given email already exists!`,
        });
      }

      // Insert the user
      await db("user").insert({
        name: name,
        email: email,
        password: hashedPassword,
        isVerified: false,
        token: token,
      });

      // Get the inserted user's data
      const responseData = await db("user").where({ email: email }).first();

      // Send verification email
      const message = `${config.app.base_url}/user/verify/${responseData.id}/${responseData.token}`;
      await sendEmail.sendEmail(responseData.email, "Verify Email", message);

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        authentication: `A verification email has been sent to ${responseData.email}`,
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
    // Check if the user table exists
    const tableExists = await db.schema.hasTable("user");
    if (!tableExists) {
      // If the table doesn't exist, create it
      await userSchema().then(() => {
        insertUser();
      });
    } else {
      // If the table already exists, directly insert the user
      await insertUser();
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

const validate_user = async (req, res) => {
  const { id, token } = req.params;

  try {
    const user = await db("user")
      .where({
        id: id,
        token: token,
        isVerified: false,
      })
      .first();

    if (!user) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST,
        `Invalid link`
      );
    }

    await db("user")
      .where({ id: id })
      .update({ isVerified: true, updated_at: db.fn.now() });

    await insertFavorite(id);

    return sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      message: "User verified and favorite inserted successfully",
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

const login_user = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await db("user")
      .where({ email })
      .where({ isVerified: true })
      .first();

    if (!user) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST,
        {
          message: "User not found or please verify your email!",
        }
      );
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      sendResponse(res, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, {
        message: "Invalid password!",
      });
    } else {
      const token = jwt.sign(
        { id: user.id, email: user.email, name: user.name },
        config.jwt.secret_key
      );

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        user: user,
        token: token,
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

const forgot_password = async (req, res) => {
  try {
    const { email } = req.body;

    // Update user's token in the database
    const updateResponse = await db("user").where({
      email: email,
      isVerified: true,
    });

    if (!updateResponse) {
      // Send a response indicating the email is not found
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `This ${email} does not exist or is not verified`,
      });
    } else {
      // Fetch the user data
      const responseData = await db("user")
        .where({ email: email })
        .where({ isVerified: true })
        .first();

      // Compose the reset password URL
      const resetPasswordUrl = `${config.app.base_url}/user/reset_password/id=${responseData.id}/token=${responseData.token}`;

      // Send the reset password email
      await sendEmail.forgotEmail(
        responseData.email,
        "Forgot Password",
        resetPasswordUrl
      );

      // Send a success response
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `A forgot password email has been sent to ${responseData.email}`,
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

const reset_password_template = (req, res) => {
  return res.sendFile(path.resolve("./public/reset-password.html"));
};

const reset_password = async (req, res) => {
  try {
    const { password, token, id } = req.body;
    const decode = jwtDecode(token);

    // Encrypt the new password
    const hashedPassword = await encryptPassword(password);

    // Update user's password and clear the token
    const updateResponse = await db("user")
      .where({ id: id, token: token })
      .update({ password: hashedPassword });

    if (updateResponse === 0) {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `The password for ${decode.email} could not be changed.`,
      });
    } else {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `The password for ${decode.email} has been successfully changed.`,
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
  register_user,
  validate_user,
  login_user,
  forgot_password,
  reset_password_template,
  reset_password,
};
