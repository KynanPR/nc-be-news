const server = require("./api/server");

const { PORT = 6363 } = process.env;

server.listen(PORT, () => {
  console.log(`NC News api server listening on port ${PORT}`);
});
