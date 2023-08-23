const db = require("../config/db");
const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const verifyUserMiddleware = async (req, res, next) => {
  const { email } = req.body;

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

    req.user = user;
    next();
  } catch (error) {
    sendResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      ReasonPhrases.INTERNAL_SERVER_ERROR,
      error.message
    );
  }
};

module.exports = { verifyUserMiddleware };
