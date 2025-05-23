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

const userShape = {
  username: expect.toBeString(),
  name: expect.toBeString(),
  avatar_url: expect.toBeString(),
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
    expect(article.comment_count).toBeInteger();
    expect(article.comment_count).not.toBeNegative();
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
      comment_count: 11,
    });
  });
  test("200: Responds with article.comment_count : 0 when no comments", async () => {
    await db.query(`DELETE FROM comments WHERE article_id = 1`);
    const {
      body: { article },
    } = await testReq(server).get("/api/articles/1").expect(200);
    expect(article.comment_count).toBe(0);
  });
  test("404: Responds with 'not found' error", async () => {
    const { body } = await testReq(server)
      .get("/api/articles/99999")
      .expect(404);
    expect(body.message).toBe("Can't find article with ID: 99999");
  });
  test("400: Responds with generic 'bad request' error when the article_id is in someway invalid", async () => {
    const { body } = await testReq(server).get("/api/articles/no1").expect(400);
    expect(body.message).toBe("Bad Request");
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
  test("400: Responds with generic 'bad request' error when the article_id is in some way invalid", async () => {
    const { body } = await testReq(server)
      .patch("/api/articles/no10")
      .send({ inc_votes: 10 })
      .expect(400);
    expect(body.message).toBe("Bad Request");
  });
  test("400: Responds with generic 'bad request' error when the request body is in some way invalid", async () => {
    const { body: badKeyBody } = await testReq(server)
      .patch("/api/articles/1")
      .send({ voteInc: 10 })
      .expect(400);
    expect(badKeyBody.message).toBe("Bad Request");

    const { body: badValueBody } = await testReq(server)
      .patch("/api/articles/1")
      .send({ inc_votes: 5.5 })
      .expect(400);

    expect(badValueBody.message).toBe("Bad Request");

    const { body: noKeyBody } = await testReq(server)
      .patch("/api/articles/1")
      .send({})
      .expect(400);
    expect(noKeyBody.message).toBe("Bad Request");
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
      expect(article.comment_count).toBeInteger();
      expect(article.comment_count).not.toBeNegative();
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

  describe("sort_by sort query", () => {
    test.each([
      ["article_id"],
      ["title"],
      ["topic"],
      ["author"],
      ["created_at"],
      ["votes"],
      ["article_img_url"],
      ["comment_count"],
    ])(
      "200: Responds with array of all articles sorted by specified column: %s",
      async (sortByColumn) => {
        const {
          body: { articles },
        } = await testReq(server)
          .get(`/api/articles?sort_by=${sortByColumn}`)
          .expect(200);
        expect(articles).toBeArrayOfSize(13);

        expect(articles).toBeSortedBy(sortByColumn, {
          descending: true,
        });
      }
    );
    test.each(["notareal_column", "votes DESC ; DROP ALL TABLES;", ""])(
      "400: Responds with generic 'bad request' error message when the sort_by collumn is in some way invalid - %s",
      async (sortByColumn) => {
        const { body } = await testReq(server)
          .get(`/api/articles?sort_by=${sortByColumn}`)
          .expect(400);
        expect(body.message).toBe("Bad Request");
      }
    );
  });
  describe("order sort query", () => {
    test.each([["ASC"], ["DESC"]])(
      "200: Responds with array of all articles, ordered in specified direction: %s",
      async (orderDirection) => {
        const {
          body: { articles },
        } = await testReq(server)
          .get(`/api/articles?order=${orderDirection}`)
          .expect(200);
        expect(articles).toBeArrayOfSize(13);

        const sortOptions =
          orderDirection === "ASC" ? { ascending: true } : { descending: true };
        expect(articles).toBeSortedBy("created_at", sortOptions);
      }
    );
    test.each(["notan_order", "DESC ; DROP ALL TABLES;", ""])(
      "400: Responds with generic 'bad request' error message when the sort_by collumn is in some way invalid - %s",
      async (orderDirection) => {
        const { body } = await testReq(server)
          .get(`/api/articles?sort_by=${orderDirection}`)
          .expect(400);
        expect(body.message).toBe("Bad Request");
      }
    );
  });
  describe("sort_by & order sort queries", () => {
    test.each([
      "sort_by=comment_count&order=ASC",
      "order=ASC&sort_by=comment_count",
    ])(
      "200: Responds with array of all articles, sorted by specified colunm in specified order direction. Query order agnostic - %s",
      async () => {
        const {
          body: { articles },
        } = await testReq(server)
          .get(`/api/articles?sort_by=comment_count&order=ASC`)
          .expect(200);
        expect(articles).toBeArrayOfSize(13);

        expect(articles).toBeSortedBy("comment_count", { ascending: true });
      }
    );
  });
  describe("topic filter query", () => {
    test("200: Responds with array of articles filtered by specified topic", async () => {
      const {
        body: { articles },
      } = await testReq(server).get("/api/articles?topic=mitch").expect(200);

      expect(articles).toBeArrayOfSize(12);
      expect(articles).toSatisfyAll((article) => article.topic === "mitch");
    });
    test("404: Responds with a 'no such topic' error message when specifed topic doesn't exist", async () => {
      const { body } = await testReq(server)
        .get("/api/articles?topic=boringstuff")
        .expect(400);

      expect(body.message).toBe("No such topic: boringstuff");
    });
    test("404: Responds with a 'none found' error message when no articles with specified topic exist", async () => {
      const { body } = await testReq(server)
        .get("/api/articles?topic=paper")
        .expect(404);

      expect(body.message).toBe("No articles found with topic: paper");
    });
  });
});

describe("POST /api/articles", () => {
  describe("201: Responds with posted article", () => {
    test("Topic exists and img_url provided", async () => {
      const {
        body: { postedArticle },
      } = await testReq(server)
        .post("/api/articles")
        .send({
          author: "icellusedkars",
          title: "Best Cars to Buy Right Now",
          body: "They're all used",
          topic: "paper",
          article_img_url: "https://www.totally.real/trust.png",
        })
        .expect(201);
      expect(postedArticle).toMatchObject(fullArticleShape);
      expect(postedArticle).toMatchObject({
        author: "icellusedkars",
        title: "Best Cars to Buy Right Now",
        body: "They're all used",
        topic: "paper",
        votes: 0,
        article_img_url: "https://www.totally.real/trust.png",
      });
    });
    test("Topic doesn't already exist -> given topic is created", async () => {
      const {
        body: { postedArticle },
      } = await testReq(server)
        .post("/api/articles")
        .send({
          author: "icellusedkars",
          title: "Best Cars to Buy Right Now",
          body: "They're all used",
          topic: "Used Cars",
          article_img_url: "https://www.totally.real/trust.png",
        })
        .expect(201);
      expect(postedArticle).toMatchObject(fullArticleShape);
      expect(postedArticle.topic).toBe("Used Cars");

      const { rows } = await db.query(
        `SELECT * FROM topics WHERE slug = 'Used Cars';`
      );
      expect(rows.length).toBe(1);
    });
    test("Not given img_url -> defaults", async () => {
      const {
        body: { postedArticle },
      } = await testReq(server)
        .post("/api/articles")
        .send({
          author: "icellusedkars",
          title: "Best Cars to Buy Right Now",
          body: "They're all used",
          topic: "Used Cars",
        })
        .expect(201);
      expect(postedArticle).toMatchObject(fullArticleShape);
      expect(postedArticle.article_img_url).toBe(
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
      );
    });
  });
  test("400: Responds with generic 'bad request' error when the request body is in some way invalid", async () => {
    const { body: notAUserBody } = await testReq(server)
      .post("/api/articles")
      .send({
        author: "noone",
        title: "Best Cars to Buy Right Now",
        body: "They're all used",
        topic: "paper",
        article_img_url: "https://www.totally.real/trust.png",
      })
      .expect(400);
    expect(notAUserBody.message).toBe("Bad Request");

    const { body: wrongMissingKeysBody } = await testReq(server)
      .post("/api/articles/3/comments")
      .send({ nameofuser: "rogersop" })
      .expect(400);
    expect(wrongMissingKeysBody.message).toBe("Bad Request");
  });
  test("400: Responds with 'no empty articles' error when article body or title is empty", async () => {
    const { body: missingBody } = await testReq(server)
      .post("/api/articles")
      .send({
        author: "icellusedkars",
        title: "Best Cars to Buy Right Now",
        body: "",
        topic: "paper",
        article_img_url: "https://www.totally.real/trust.png",
      })
      .expect(400);
    expect(missingBody.message).toBe(
      "Article title and body must not be empty"
    );

    const { body: missingTitle } = await testReq(server)
      .post("/api/articles")
      .send({
        author: "icellusedkars",
        title: "",
        body: "Something here",
        topic: "paper",
        article_img_url: "https://www.totally.real/trust.png",
      })
      .expect(400);
    expect(missingTitle.message).toBe(
      "Article title and body must not be empty"
    );
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
  test("400: Responds with generic 'bad request' error when the article_id is in some way invaild", async () => {
    const { body } = await testReq(server)
      .get("/api/articles/notanumber/comments")
      .expect(400);

    expect(body.message).toBe(`Bad Request`);
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
  test("400: Responds with generic 'bad request' error when the article_id is in some way invalid", async () => {
    const { body } = await testReq(server)
      .post("/api/articles/notanumber/comments")
      .send({ username: "rogersop", body: "This is a comment" })
      .expect(400);
    expect(body.message).toBe("Bad Request");
  });
  test("400: Responds with generic 'bad request' error when the request body is in some way invalid", async () => {
    const { body: notAUserBody } = await testReq(server)
      .post("/api/articles/3/comments")
      .send({ username: "notyetauser", body: "This is a comment" })
      .expect(400);
    expect(notAUserBody.message).toBe("Bad Request");

    const { body: wrongMissingKeysBody } = await testReq(server)
      .post("/api/articles/3/comments")
      .send({ nameofuser: "rogersop" })
      .expect(400);
    expect(wrongMissingKeysBody.message).toBe("Bad Request");
  });
  test("400: Responds with 'no empty comments' error when comment body is empty", async () => {
    const { body } = await testReq(server)
      .post("/api/articles/3/comments")
      .send({ username: "rogersop", body: "" })
      .expect(400);
    expect(body.message).toBe("Comment must not be empty");
  });
});

describe("PATCH /api/comments/:comment_id", () => {
  test.each([
    [0, 16],
    [10, 26],
    [-25, -9],
  ])(
    "200: Responds with the entire updated comment with correct updated vote count",
    async (voteIncAmount, expctedUpdatedVotes) => {
      const {
        body: { updatedComment },
      } = await testReq(server)
        .patch("/api/comments/1")
        .send({ inc_votes: voteIncAmount })
        .expect(200);
      expect(updatedComment).toMatchObject(commentShape);

      expect(updatedComment.votes).toBe(expctedUpdatedVotes);
    }
  );
  test("404: Responds with 'not found' error when specified comment doesn't exist", async () => {
    const { body } = await testReq(server)
      .patch("/api/comments/99999")
      .send({ inc_votes: 5 })
      .expect(404);
    expect(body.message).toBe("Can't find comment with ID: 99999");
  });
  test("400: Responds with generic 'bad request' error when the comment_id is in some way invalid", async () => {
    const { body } = await testReq(server)
      .patch("/api/comments/no10")
      .send({ inc_votes: 10 })
      .expect(400);
    expect(body.message).toBe("Bad Request");
  });
  test("400: Responds with generic 'bad request' error when the request body is in some way invalid", async () => {
    const { body: badKeyBody } = await testReq(server)
      .patch("/api/comments/1")
      .send({ voteInc: 10 })
      .expect(400);
    expect(badKeyBody.message).toBe("Bad Request");

    const { body: badValueBody } = await testReq(server)
      .patch("/api/comments/1")
      .send({ inc_votes: 5.5 })
      .expect(400);

    expect(badValueBody.message).toBe("Bad Request");

    const { body: noKeyBody } = await testReq(server)
      .patch("/api/comments/1")
      .send({})
      .expect(400);
    expect(noKeyBody.message).toBe("Bad Request");
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
  test("400: Responds with generic 'bad request' error when the comment_id is in some way invalid", async () => {
    const { body } = await testReq(server)
      .delete("/api/comments/no1")
      .expect(400);
    expect(body.message).toBe("Bad Request");
  });
});

describe("GET /api/users", () => {
  test("200: Responds with array of all users", async () => {
    const {
      body: { users },
    } = await testReq(server).get("/api/users").expect(200);
    expect(users).toBeArrayOfSize(4);
    users.forEach((user) => {
      expect(user).toMatchObject(userShape);
    });
  });
  test("404: Responds with a 'none found' error when there are no users in database", async () => {
    await db.query(`DELETE FROM users;`);
    const { body } = await testReq(server).get("/api/users").expect(404);
    expect(body.message).toBe("No users found");
  });
});

describe("GET /api/users/:username", () => {
  test("200: Responds with specified user object", async () => {
    const {
      body: { user },
    } = await testReq(server).get("/api/users/lurker").expect(200);

    expect(user).toEqual({
      username: "lurker",
      name: "do_nothing",
      avatar_url:
        "https://www.golenbock.com/wp-content/uploads/2015/01/placeholder-user.png",
    });
  });
  test("404: Responds with 'not found' error when the specified user doesn't exist", async () => {
    const { body } = await testReq(server)
      .get("/api/users/Idontexist")
      .expect(404);

    expect(body.message).toBe("Can't find user with username: Idontexist");
  });
});
