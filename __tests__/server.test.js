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

const articleShape = {
  article_id: expect.any(Number),
  title: expect.any(String),
  topic: expect.any(String),
  author: expect.any(String),
  body: expect.any(String),
  created_at: expect.stringMatching(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
  ),
  votes: expect.any(Number),
  article_img_url: expect.any(String),
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

describe("GET /api/articles/:article_id", () => {
  test("200: Responds with article object", async () => {
    const {
      body: { article },
    } = await testReq(server).get("/api/articles/1").expect(200);
    console.log(article);

    expect(article).toMatchObject(articleShape);
    expect(article).toEqual({
      article_id: 1,
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      created_at: "2020-07-09T20:11:00.000Z",
      votes: 100,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    });
  });
  test("404: Responds with 'not found' error", async () => {
    const { body } = await testReq(server)
      .get("/api/articles/99999")
      .expect(404);
    expect(body.message).toBe("Can't find article with ID: 99999");
  });
});
