const endpointsJson = require("../endpoints.json");
const server = require("../api/server");
const testData = require("../db/data/test-data/index");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const testReq = require("supertest");

beforeEach(() => seed(testData));

afterAll(() => db.end());

const topicShape = {
  slug: expect.any(String),
  description: expect.any(String),
};

describe("Bad Endpoint", () => {
  test("404: Responds with not found message", async () => {
    const { body } = await testReq(server)
      .get("/api/thisDoesntExist")
      .expect(404);
    expect(body.message).toBe(
      "Endpoint/Method doesn't exist. Try GET /api to see info on all available endpoints"
    );
  });
});

describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", async () => {
    const {
      body: { endpoints },
    } = await testReq(server).get("/api").expect(200);

    expect(endpoints).toEqual(endpointsJson);
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with array of all topic objects", async () => {
    const { body } = await testReq(server).get("/api/topics").expect(200);

    expect(body.topics).toHaveLength(3);
    body.topics.forEach((topic) => {
      expect(topic).toMatchObject(topicShape);
    });
  });
  test("404: Responds with error when there are no topics in database", async () => {
    await db.query("DELETE FROM topics");
    const { body } = await testReq(server).get("/api/topics").expect(404);
    expect(body.message).toBe("No topics found");
  });
});
