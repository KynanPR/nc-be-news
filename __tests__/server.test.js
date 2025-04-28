const endpointsJson = require("../endpoints.json");
const server = require("../api/server");
const testData = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testReq = require("supertest");

beforeEach(() => seed(testData));

afterAll(() => db.end());

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return testReq(server)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
});
