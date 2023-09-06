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
  const {
    page,
    sort_by,
    release_date_gte,
    release_date_lte,
    vote_average_gte,
    vote_average_lte,
    runtime_gte,
    runtime_lte,
    vote_count_gte,
    vote_count_lte,
    genre_ids,
  } = req.query;
  const newSortBy = sort_by.split(".");
  const limit = 20;
  const response = await movieModel.pagination(
    page,
    limit,
    newSortBy,
    release_date_gte,
    release_date_lte,
    vote_average_gte,
    vote_average_lte,
    runtime_gte,
    runtime_lte,
    vote_count_gte,
    vote_count_lte,
    genre_ids
  );

  sendResponse(res, StatusCodes.OK, {
    movies: response,
  });
};

module.exports = {
  getAll,
  pagination,
};
