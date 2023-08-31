const sendResponse = require("../config/responseUtil");
const { ReasonPhrases, StatusCodes } = require("http-status-codes");
const { movieModel } = require("../models/index");
const getAll = async (req, res) => {
  try {
    const response = await movieModel.getAll();

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      movies: response,
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

const pagination = async (req, res) => {
  try {
    const { page } = req.query;
    const limit = 20;
    const response = await movieModel.pagination(page, limit);

    sendResponse(res, StatusCodes.OK, ReasonPhrases.OK, {
      movies: response,
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
  getAll,
  pagination,
};
