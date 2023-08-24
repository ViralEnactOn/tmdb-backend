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
const {
  authenticationUserMiddleware,
} = require("../middleware/authenticationMiddleware");
const {
  favorite_exist,
  insert_favorite,
  user_exist,
  check_user,
  insert_user,
  verify_user,
  verified_user,
  reset_user_password,
} = require("../models/authenticationModel");

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
    const exists = await favorite_exist();

    if (!exists) {
      await userFavoriteMovieSchema.then(() => {
        return insert_favorite(userId);
      });
    } else {
      return insert_favorite(userId);
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
      let userData = await check_user(email);
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
      await insert_user(name, email, hashedPassword, token);

      // Get the inserted user's data
      const responseData = await check_user();
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
    const tableExists = await user_exist();
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
    const user = verify_user(id, token);

    if (!user) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST,
        `Invalid link`
      );
    }

    await verified_user(id);

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
  const { password } = req.body;

  try {
    await authenticationUserMiddleware(req, res, async () => {
      const passwordMatches = await bcrypt.compare(password, req.user.password);
      if (!passwordMatches) {
        sendResponse(res, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, {
          message: "Invalid password!",
        });
      } else {
        const token = jwt.sign(
          { id: req.user.id, email: req.user.email, name: req.user.name },
          config.jwt.secret_key
        );

        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          user: req.user,
          token: token,
        });
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

const forgot_password = async (req, res) => {
  try {
    const { email } = req.body;

    await authenticationUserMiddleware(req, res, async () => {
      const updateResponse = req.user;
      if (!updateResponse) {
        // Send a response indicating the email is not found
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: `This ${email} does not exist or is not verified`,
        });
      } else {
        // Compose the reset password URL
        const resetPasswordUrl = `${config.app.base_url}/user/reset_password/id=${updateResponse.id}/token=${updateResponse.token}`;

        // Send the reset password email
        await sendEmail.forgotEmail(
          updateResponse.email,
          "Forgot Password",
          resetPasswordUrl
        );

        // Send a success response
        sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
          message: `A forgot password email has been sent to ${updateResponse.email}`,
        });
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

const reset_password_template = (req, res) => {
  return res.sendFile(path.resolve("./public/reset-password.html"));
};

const reset_password = async (req, res) => {
  try {
    const { password, token, id } = req.body;
    await authenticationUserMiddleware(req, res, async () => {
      // Encrypt the new password
      const hashedPassword = await encryptPassword(password);

      const updateResponse = await reset_user_password(
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
  register_user,
  validate_user,
  login_user,
  forgot_password,
  reset_password_template,
  reset_password,
};
