const jwt = require("jsonwebtoken");
const { default: jwtDecode } = require("jwt-decode");
const config = require("../config/config");
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

// Perfect
const register_user = async (req, res) => {
  const { name, email, password } = req.body;
  let hashedPassword = await encryptPassword(password);
  try {
    let userData = await authenticationModel.get_user(email);
    if (userData !== undefined) {
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
    await authenticationModel.insert_user(name, email, hashedPassword); //TODO: Remove token from here

    // Get the inserted user's data
    const responseData = await authenticationModel.get_user(email); //TODO: Rename check_user to get_user

    const token = jwt.sign(
      {
        email: responseData.email,
        name: responseData.name,
        id: responseData.id,
      },
      config.jwt.secret_key,
      {
        expiresIn: "2h",
      }
    );

    // Send verification email
    const message = `${config.app.base_url}/user/verify/${token}`; //TODO: Pass only token. in token store id and email
    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      authentication: `A verification email has been sent to ${responseData.email}`,
    });
    await sendEmail.sendEmail(responseData.email, "Verify Email", message);
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

// Perfect
const validate_user = async (req, res) => {
  const { token } = req.params;
  const decode = jwtDecode(token);
  try {
    const user = authenticationModel.verify_user(decode);

    if (!user) {
      return sendResponse(
        res,
        StatusCodes.BAD_REQUEST,
        ReasonPhrases.BAD_REQUEST,
        `Invalid link`
      );
    } else {
      return sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: "User verified successfully",
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

// Perfect
const login_user = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await authenticationModel.login_user(email);

    if (!user || user.length === 0) {
      sendResponse(res, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, {
        message: "Invalid email!",
      });
      return;
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      sendResponse(res, StatusCodes.BAD_REQUEST, ReasonPhrases.BAD_REQUEST, {
        message: "Invalid password!",
      });
      return;
    }

    const token = jwt.sign(
      {
        email: user.email,
        name: user.name,
        id: user.id,
      },
      config.jwt.secret_key,
      {
        expiresIn: "2h",
      }
    );

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      user: user,
      token: token,
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

// Perfect
const forgot_password = async (req, res) => {
  try {
    const { email } = req.body;
    const updateResponse = await authenticationModel.get_user(email);
    console.log({ updateResponse });
    if (!updateResponse) {
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `This ${email} does not exist or is not verified`,
      });
    } else {
      const token = jwt.sign(
        {
          email: updateResponse.email,
          name: updateResponse.name,
          id: updateResponse.id,
        },
        config.jwt.secret_key,
        {
          expiresIn: "2h",
        }
      );
      const resetPasswordUrl = `${config.app.base_url}/user/reset_password/token=${token}`;
      sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
        message: `A forgot password email has been sent to ${updateResponse.email}`,
      });
      await sendEmail.forgotEmail(
        updateResponse.email,
        "Forgot Password",
        resetPasswordUrl
      );
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
    const { token, password } = req.body;
    const decode = jwtDecode(token);
    console.log({ decode });
    const hashedPassword = await encryptPassword(password);

    const updateResponse = await authenticationModel.reset_user_password(
      decode.id,
      decode.email,
      decode.name,
      hashedPassword
    );

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
