const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { userSchema } = require("../schema/userSchema");
const {
  userFavoriteMovieSchema,
} = require("../schema/userFavoriteMovieSchema");
const bcrypt = require("bcryptjs");
const sendEmail = require("../config/sendMail");
const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const path = require("path");
const authenticationModel = require("../models/authenticationModel");

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
    const exists = await authenticationModel.favorite_exist();

    if (!exists) {
      await userFavoriteMovieSchema.then(() => {
        return authenticationModel.insert_favorite(userId);
      });
    } else {
      return authenticationModel.insert_favorite(userId);
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
      let userData = await authenticationModel.check_user(email);
      console.log(userData);
      if (userData.length !== 0) {
        return sendResponse(
          res,
          StatusCodes.BAD_REQUEST,
          ReasonPhrases.BAD_REQUEST,
          {
            message: `User with the given email already exists!`,
          }
        );
      }

      // Insert the user
      await authenticationModel.insert_user(name, email, hashedPassword, token);

      // Get the inserted user's data
      const responseData = await authenticationModel.check_user();
      await insertFavorite(responseData.id);

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
    const tableExists = await authenticationModel.user_exist();
    if (!tableExists) {
      // If the table doesn't exist, create it
      await userSchema.then(() => {
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
    const user = authenticationModel.verify_user(id, token);

    if (!user) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST,
        `Invalid link`
      );
    }

    await authenticationModel.verified_user(id);

    return sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      message: "User verified successfully",
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
    const user = await authenticationModel.login_user(email);
    const passwordMatches = await bcrypt.compare(password, user.password);
    if (!passwordMatches || user.length === 0) {
      sendResponse(res, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, {
        message: "Invalid email or password!",
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
    const updateResponse = req.user;
    if (!updateResponse) {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `This ${email} does not exist or is not verified`,
      });
    } else {
      const resetPasswordUrl = `${config.app.base_url}/user/reset_password/id=${updateResponse.id}/token=${updateResponse.token}`;

      await sendEmail.forgotEmail(
        updateResponse.email,
        "Forgot Password",
        resetPasswordUrl
      );

      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `A forgot password email has been sent to ${updateResponse.email}`,
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
    const hashedPassword = await encryptPassword(password);

    const updateResponse = await authenticationModel.reset_user_password(
      id,
      token,
      hashedPassword
    );

    if (updateResponse === 0) {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `The password for ${req.user.email} could not be changed.`,
      });
    } else {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `The password for ${req.user.email} has been successfully changed.`,
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
