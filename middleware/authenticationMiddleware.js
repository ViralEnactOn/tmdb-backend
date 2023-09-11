const config = require("../config/config");
const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
// const { default: jwtDecode } = require("jwt-decode");
const jwt = require("jsonwebtoken");

const authenticationUserMiddleware = async (req, res, next) => {
  const { token } = req.body;

  if (!token) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, {
      message: "Token is missing!",
    });
  }

  const decode = jwt.decode(token, {
    complete: true,
    ignoreExpiration: true,
  });

  if (!decode || !decode.payload) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, {
      message: "Invalid token!",
    });
  }

  const { exp, email } = decode.payload;

  if (!exp || exp < Date.now() / 1000) {
    return sendResponse(res, StatusCodes.UNAUTHORIZED, {
      message: "Token has expired!",
    });
  }

  const user = await db("user").where({ email }).first();

  if (!user) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, {
      message: "User not found!",
    });
  }

  req.user = user;
  next();
};

module.exports = { authenticationUserMiddleware };
