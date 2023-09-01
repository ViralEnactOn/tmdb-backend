function sendResponse(res, statusCode, message, data = null) {
  res.status(statusCode).send(data);
}

module.exports = sendResponse;
