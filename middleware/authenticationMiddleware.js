const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");

const authenticationUserMiddleware = async (req, res, next) => {
  const { token } = req.body;
  let decode;
  if (token) {
    decode = jwtDecode(token);
  }

  const user = await db("user").where({ email: decode.email }).first();

  if (!user) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, {
      message: "User not found!",
    });
  }

  req.user = user;
  next();
};

module.exports = { authenticationUserMiddleware };
