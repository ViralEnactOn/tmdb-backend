const jwt = require("jsonwebtoken");
const { default: jwtDecode } = require("jwt-decode");
const config = require("../config/config");
const bcrypt = require("bcryptjs");
const sendEmail = require("../config/sendMail");
const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");

const path = require("path");
const { authenticationModel } = require("../models/index");

const encryptPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  return hash;
};

// Perfect
const register = async (req, res) => {
  const { name, email, password } = req.body;
  let hashedPassword = await encryptPassword(password);

  let userData = await authenticationModel.get_user(email);
  if (userData !== undefined) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, {
      message: `User with the given email already exists!`,
    });
  }

  // Insert the user
  await authenticationModel.insert(name, email, hashedPassword); //TODO: Remove token from here

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
  sendResponse(res, StatusCodes.OK, {
    authentication: `A verification email has been sent to ${responseData.email}`,
  });
  await sendEmail.sendEmail(responseData.email, "Verify Email", message);
};

// Perfect
const verify = async (req, res) => {
  const { token } = req.params;
  const decode = jwtDecode(token);
  const user = authenticationModel.verify(decode);

  if (!user) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, `Invalid link`);
  } else {
    return sendResponse(res, StatusCodes.OK, {
      message: "User verified successfully",
    });
  }
};

// Perfect
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await authenticationModel.login(email);

  if (!user || user.length === 0) {
    sendResponse(res, StatusCodes.BAD_REQUEST, {
      message: "Invalid email!",
    });
    return;
  }

  const passwordMatches = await bcrypt.compare(password, user.password);

  if (!passwordMatches) {
    sendResponse(res, StatusCodes.BAD_REQUEST, {
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

  sendResponse(res, StatusCodes.OK, {
    user: user,
    token: token,
  });
};

// Perfect
const forgotPassword = async (req, res) => {
  const { email } = req.body;
  const updateResponse = await authenticationModel.get_user(email);
  if (!updateResponse) {
    sendResponse(res, StatusCodes.OK, {
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
    sendResponse(res, StatusCodes.OK, {
      message: `A forgot password email has been sent to ${updateResponse.email}`,
    });
    await sendEmail.forgotEmail(
      updateResponse.email,
      "Forgot Password",
      resetPasswordUrl
    );
  }
};

const resetPasswordTemplate = (req, res) => {
  return res.sendFile(path.resolve("./public/reset-password.html"));
};

const resetPassword = async (req, res) => {
  const { token, password } = req.body;
  const decode = jwtDecode(token);
  const hashedPassword = await encryptPassword(password);

  const updateResponse = await authenticationModel.resetPassword(
    decode.id,
    decode.email,
    decode.name,
    hashedPassword
  );

  if (updateResponse === 0) {
    sendResponse(res, StatusCodes.OK, {
      message: `The password for ${decode.email} could not be changed.`,
    });
  } else {
    sendResponse(res, StatusCodes.OK, {
      message: `The password for ${decode.email} has been successfully changed.`,
    });
  }
};

module.exports = {
  register,
  verify,
  login,
  forgotPassword,
  resetPasswordTemplate,
  resetPassword,
};
