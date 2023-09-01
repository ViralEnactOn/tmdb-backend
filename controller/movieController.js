const sendResponse = require("../config/responseUtil");
const { movieModel } = require("../models/index");
const getAll = async (req, res) => {
  const response = await movieModel.getAll();

  sendResponse(res, {
    movies: response,
  });
};

const pagination = async (req, res) => {
  const { page } = req.query;
  const limit = 20;
  const response = await movieModel.pagination(page, limit);

  sendResponse(res, {
    movies: response,
  });
};

module.exports = {
  getAll,
  pagination,
};
