exports.sendCaughtError = (err, req, res, next) => {
  if (err.status && err.message) {
    res.status(err.status).json({ message: err.message });
  } else next(err);
};

exports.badRequest = (err, req, res, next) => {
  // const dbErrorCodes = ["23502", "22P02"];

  // if (dbErrorCodes.includes(err.code)) {
  if (err.code) {
    res.status(400).json({ message: "Bad Request" });
  } else next(err);
};

exports.endpointNotFound = (req, res, next) => {
  res.status(404).json({
    message:
      "Endpoint/Method doesn't exist. Try GET /api to see info on all available endpoints",
  });
};
