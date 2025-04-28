class ApiError extends Error {
  constructor(statusCode, message, options) {
    super(message, options);
    this.status = statusCode;
  }
}

module.exports = { ApiError };
