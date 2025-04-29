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

const partArticleShape = {
  article_id: expect.any(Number),
  title: expect.any(String),
  topic: expect.any(String),
  author: expect.any(String),
  created_at: expect.stringMatching(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/
  ),
  votes: expect.any(Number),
  article_img_url: expect.any(String),
};

const fullArticleShape = Object.assign(
  { body: expect.any(String) },
  partArticleShape
);

const commentShape = {
  comment_id: expect.toBeInteger(),
  article_id: expect.toBeInteger(),
  body: expect.toBeString(),
  votes: expect.toBeInteger(),
  author: expect.toBeString(),
  created_at: expect.toBeDateString(),
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

    expect(article).toMatchObject(fullArticleShape);
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

describe("PATCH /api/articles/:article_id", () => {
  test.each([
    [0, 100],
    [10, 110],
    [-25, 75],
  ])(
    "200: Responds with the entire updated article with correct updated vote count",
    async (voteIncAmount, expctedUpdatedVotes) => {
      const {
        body: { updatedArticle },
      } = await testReq(server)
        .patch("/api/articles/1")
        .send({ inc_votes: voteIncAmount })
        .expect(200);
      expect(updatedArticle).toMatchObject(fullArticleShape);
      expect(updatedArticle.votes).toBe(expctedUpdatedVotes);
    }
  );
  test("404: Responds with 'not found' error when specified article doesn't exist", async () => {
    const { body } = await testReq(server)
      .get("/api/articles/99999")
      .expect(404);
    expect(body.message).toBe("Can't find article with ID: 99999");
  });
});

describe("GET /api/articles", () => {
  test("200: Responds with array of all articles sorted by date without article body", async () => {
    const {
      body: { articles },
    } = await testReq(server).get("/api/articles").expect(200);

    expect(articles).toHaveLength(13);
    articles.forEach((article) => {
      expect(article).toMatchObject(partArticleShape);
      expect(typeof article.comment_count).toBe("number");
      expect(article).not.toHaveProperty("body");
    });
    const sorted = articles.toSorted((thisArticle, nextArticle) => {
      const article1Time = new Date(thisArticle.created_at);
      const article2Time = new Date(nextArticle.created_at);
      return article2Time - article1Time;
    });
    expect(sorted).toEqual(articles);
  });
  test("404: Resonds with a 'none found' error if there are no articles in database", async () => {
    await db.query("DELETE FROM articles");
    const { body } = await testReq(server).get("/api/articles").expect(404);

    expect(body.message).toBe("No articles found");
  });
});

describe("GET /api/articles/:article_id/comments", () => {
  test("200: Responds with array of comments on the specified article sorted decending by creation date", async () => {
    const {
      body: { comments },
    } = await testReq(server).get("/api/articles/1/comments").expect(200);

    expect(comments).toBeArrayOfSize(11);
    expect(comments.every((comment) => comment.article_id === 1)).toBeTrue();
    const sorted = comments.toSorted((thisComment, nextComment) => {
      const comment1Time = new Date(thisComment.created_at);
      const comment2Time = new Date(nextComment.created_at);
      return comment2Time - comment1Time;
    });
    expect(sorted).toEqual(comments);
  });
  test("404: Responds with 'none found' error if article has no comments", async () => {
    const { body } = await testReq(server)
      .get("/api/articles/2/comments")
      .expect(404);

    expect(body.message).toBe(`No comments found on article with ID: 2`);
  });
  test("404: Responds with a 'no such article' error if specified article doesn't exist", async () => {
    const { body } = await testReq(server)
      .get("/api/articles/99999/comments")
      .expect(404);

    expect(body.message).toBe(`Can't find article with ID: 99999`);
  });
});

describe("POST /api/articles/:article_id/comments", () => {
  test("201: Responds with posted comment", async () => {
    const {
      body: { postedComment },
    } = await testReq(server)
      .post("/api/articles/3/comments")
      .send({ username: "rogersop", body: "This is a comment" })
      .expect(201);
    expect(postedComment).toMatchObject(commentShape);
    expect(postedComment.author).toBe("rogersop");
    expect(postedComment.body).toBe("This is a comment");
  });
  test("404: Responds with a 'no such article' error if specifed article doesn't exist", async () => {
    const { body } = await testReq(server)
      .post("/api/articles/99999/comments")
      .send({
        username: "rogersop",
        body: "This is a comment that will never be added",
      })
      .expect(404);

    expect(body.message).toBe(`Can't find article with ID: 99999`);
  });
});

describe("DELETE /api/comments/:comment_id", () => {
  test("204: Returns nothing successful delete", async () => {
    const { body } = await testReq(server)
      .delete("/api/comments/1")
      .expect(204);
    expect(body).toBeEmptyObject();
    const { rows } = await db.query(
      `SELECT * FROM comments WHERE comment_id = 1`
    );
    expect(rows).toBeArrayOfSize(0);
  });
  test("404: Returns 'not found' error when there is no such comment", async () => {
    const { body } = await testReq(server)
      .delete("/api/comments/99999")
      .expect(404);
    expect(body.message).toBe(`Can't find comment with ID: 99999`);
  });
});
