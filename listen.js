const server = require("./api/server");

const port = 6363;

server.listen(port, () => {
  console.log(`NC News api server listening on port ${port}`);
});
