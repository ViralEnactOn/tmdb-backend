
function sendResponse(res, statusCode, message, data = null) {
  res.status(statusCode).json({
    status: statusCode,
    message: message,
    data: data,
  });
}

module.exports = sendResponse;
