const sendResponse = require("../config/responseUtil");
const { StatusCodes } = require("http-status-codes");
const { movieModel } = require("../models/index");
const getAll = async (req, res) => {
  const response = await movieModel.getAll();

  sendResponse(res, StatusCodes.OK, {
    movies: response,
  });
};

const pagination = async (req, res) => {
  const { page } = req.query;
  const limit = 20;
  const response = await movieModel.pagination(page, limit);

  sendResponse(res, StatusCodes.OK, {
    movies: response,
  });
};

module.exports = {
  getAll,
  pagination,
};
