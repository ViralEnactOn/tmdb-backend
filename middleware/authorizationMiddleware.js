const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
const { default: jwtDecode } = require("jwt-decode");

const authorizationMiddleware = async (req, res, next) => {
  const { token } = req.body;
  let decode;
  if (token) {
    decode = jwtDecode(token);
  }
  const user = await db("user")
    .where({ email: decode.email })
    .where({ isVerified: true })
    .first();

  if (!user) {
    return sendResponse(res, StatusCodes.BAD_REQUEST, {
      message: "User not found or please verify your email!",
    });
  }

  req.user = user;
  next();
};
module.exports = { authorizationMiddleware };
