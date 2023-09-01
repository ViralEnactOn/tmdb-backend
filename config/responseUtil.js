function sendResponse(res, StatusCodes, data = null) {
  res.status(StatusCodes).send(data);
}

module.exports = sendResponse;
