const request = require("supertest");
const data = require("../db/data/test-data");
const { app } = require("../app.js");
const seed = require("../db/seeds/seed");
const db = require("../db/connection");
const expectedEndpoint = require("../endpoints.json");
require("jest-sorted");

beforeEach(() => seed(data));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  test("responds with status code 200", () => {
    return request(app).get("/api/topics").expect(200);
  });
  test("responds with an array of topic objects with a slug property and description property", () => {
    return request(app)
      .get("/api/topics")
      .then((response) => {
        const { topics } = response.body;
        expect(topics.every((topic) => topic.hasOwnProperty("slug"))).toBe(
          true
        );
        expect(
          topics.every((topic) => topic.hasOwnProperty("description"))
        ).toBe(true);
      });
  });
  test("responds with a correct array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .then((response) => {
        const { topics } = response.body;
        const expected = [
          { slug: "mitch", description: "The man, the Mitch, the legend" },
          { slug: "cats", description: "Not dogs" },
          { slug: "paper", description: "what books are made of" },
        ];
        expect(topics).toEqual(expected);
      });
  });
});

describe("GET /api", () => {
  test("responds with status code 200", () => {
    return request(app).get("/api").expect(200);
  });
  test("responds with an object", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        expect(typeof response).toBe("object");
      });
  });
  test("responds with an object containing a property for each request", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        const { endpoints } = response.body;
        expect(endpoints.hasOwnProperty("GET /api")).toBe(true);
        expect(endpoints.hasOwnProperty("GET /api/topics")).toBe(true);
        expect(endpoints.hasOwnProperty("GET /api/articles")).toBe(true);
      });
  });
  test("responds with a correct object containing the endpoint objects", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        const { endpoints } = response.body;
        expect(endpoints).toEqual(expectedEndpoint);
      });
  });
});

describe("GET /api/articles/:articleid", () => {
  test("responds with status code 200", () => {
    return request(app).get("/api/articles/6").expect(200);
  });
  test("responds with the correct article object", () => {
    return request(app)
      .get("/api/articles/7")
      .then(({ body }) => {
        expect(body.article.title).toBe("Z");
        expect(body.article.article_id).toBe(7);
        expect(body.article.body).toBe("I was hungry.");
        expect(body.article.topic).toBe("mitch");
        expect(body.article.created_at).toBe("2020-01-07T14:08:00.000Z");
        expect(body.article.votes).toBe(0);
        expect(body.article.article_img_url).toBe(
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700"
        );
      });
  });
  test("responds with a 404 code when passed an invalid article id", () => {
    return request(app).get("/api/articles/50").expect(404);
  });
  test("responds with appropriate error message when passed invalid article id", () => {
    return request(app)
      .get("/api/articles/50")
      .then(({ text }) => {
        expect(text).toBe("No article found for article_id: 50");
      });
  });
});

describe("GET /api/articles", () => {
  test("responds with status code 200", () => {
    return request(app).get("/api/articles").expect(200);
  });

  test("responds with an articles array", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(Array.isArray(body.articles)).toBe(true);
      });
  });
  test("responds with an articles array of objects containing the correct properties", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        const articlesArray = body.articles;
        expect(
          articlesArray.every((article) => article.hasOwnProperty("author"))
        ).toBe(true);
        expect(
          articlesArray.every((article) => article.hasOwnProperty("title"))
        ).toBe(true);
        expect(
          articlesArray.every((article) => article.hasOwnProperty("article_id"))
        ).toBe(true);
        expect(
          articlesArray.every((article) => article.hasOwnProperty("topic"))
        ).toBe(true);
        expect(
          articlesArray.every((article) => article.hasOwnProperty("created_at"))
        ).toBe(true);
        expect(
          articlesArray.every((article) => article.hasOwnProperty("votes"))
        ).toBe(true);
        expect(
          articlesArray.every((article) =>
            article.hasOwnProperty("article_img_url")
          )
        ).toBe(true);
        expect(
          articlesArray.every((article) =>
            article.hasOwnProperty("comment_count")
          )
        ).toBe(true);
        expect(
          articlesArray.every((article) => article.hasOwnProperty("body"))
        ).toBe(false);
      });
  });
  test("responds with an articles array of objects sorted by date created", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("comment count property correctly calculates number of comments for each article", () => {
    return request(app)
      .get("/api/articles")
      .then(({ body }) => {
        expect(body.articles[6].comment_count).toBe(11);
        expect(body.articles[0].comment_count).toBe(2);
      });
  });
});

describe("GET /api/articles/:articleid/comments", () => {
  test("responds with status code 200", () => {
    return request(app).get("/api/articles/9/comments").expect(200);
  });
  test("responds with an array", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .then(({ body }) => {
        expect(Array.isArray(body.comments)).toBe(true);
      });
  });
  test("responds with an array of comment objects containing the correct properties", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .then(({ body }) => {
        const commentsArray = body.comments;
        expect(
          commentsArray.every((comment) => comment.hasOwnProperty("author"))
        ).toBe(true);
        expect(
          commentsArray.every((comment) => comment.hasOwnProperty("comment_id"))
        ).toBe(true);
        expect(
          commentsArray.every((comment) => comment.hasOwnProperty("body"))
        ).toBe(true);
        expect(
          commentsArray.every((comment) => comment.hasOwnProperty("created_at"))
        ).toBe(true);
        expect(
          commentsArray.every((comment) => comment.hasOwnProperty("votes"))
        ).toBe(true);
        expect(
          commentsArray.every((comment) => comment.hasOwnProperty("article_id"))
        ).toBe(true);
      });
  });
  test("responds with an comments array of objects sorted by date created", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .then(({ body }) => {
        expect(body.comments).toBeSortedBy("created_at", { descending: true });
      });
  });
  test("responds with the correct array of comment objects for a given article", () => {
    return request(app)
      .get("/api/articles/5/comments")
      .then(({ body }) => {
        expect(body.comments).toEqual([
          {
            comment_id: 15,
            body: "I am 100% sure that we're not completely sure.",
            votes: 1,
            author: "butter_bridge",
            article_id: 5,
            created_at: "2020-11-24T00:08:00.000Z",
          },
          {
            comment_id: 14,
            body: "What do you see? I have no idea where this will lead us. This place I speak of, is known as the Black Lodge.",
            votes: 16,
            author: "icellusedkars",
            article_id: 5,
            created_at: "2020-06-09T05:00:00.000Z",
          },
        ]);
      });
  });
  test("responds with a 404 code and appropriate error message when passed an article id that is not in the database", () => {
    return request(app)
      .get("/api/articles/50/comments")
      .then(({ text }) => {
        expect(404);
        expect(text).toBe("No article found for article_id 50");
      });
  });
  test("responds with a 400 code and appropriate error message when passed an invalid article id", () => {
    return request(app)
      .get("/api/articles/invalidid/comments")
      .then(({ text }) => {
        expect(400);
        expect(text).toBe("Bad Request, id must be an integer");
      });
  });
  test("responds with an empty array when passed a valid article id with no comments", () => {
    return request(app)
      .get("/api/articles/8/comments")
      .then(({ body }) => {
        expect(body.comments).toEqual([]);
      });
  });
});

describe("POST /api/articles/:articleid/comments", () => {
  const newComment = {
    username: "butter_bridge",
    body: "this article completely changed the way I think about the content of the article",
  };
  test("responds with status code 201 and comment that was added", () => {
    return request(app)
      .post("/api/articles/4/comments")
      .send(newComment)
      .then(({ body }) => {
        expect(201);
        expect(body.comment.comment_id).toBe(19);
        expect(body.comment.body).toBe(
          "this article completely changed the way I think about the content of the article"
        );
        expect(body.comment.article_id).toBe(4);
        expect(body.comment.author).toBe("butter_bridge");
        expect(body.comment.votes).toBe(0);
        expect(body.comment.hasOwnProperty("created_at")).toBe(true);
      });
  });
  test("responds with a 404 code and appropriate error message when passed an article id that is not in the database", () => {
    return request(app)
      .post("/api/articles/50/comments")
      .send(newComment)
      .then(({ text }) => {
        expect(404);
        expect(text).toBe(
          'Key (article_id)=(50) is not present in table "articles".'
        );
      });
  });
  test("responds with a 400 code and appropriate error message when passed an invalid article id", () => {
    return request(app)
      .post("/api/articles/banana/comments")
      .send(newComment)
      .then(({ text }) => {
        expect(400);
        expect(text).toBe("Bad Request, id must be an integer");
      });
  });
  test("responds with a 404 code and appropriate error message when username does not exist", () => {
    const invalidUserComment = {
      username: "invaliduser16",
      body: "I'm not a registered user so my comment is invalid",
    };
    return request(app)
      .post("/api/articles/4/comments")
      .send(invalidUserComment)
      .then(({ text }) => {
        expect(400);
        expect(text).toBe(
          'Key (author)=(invaliduser16) is not present in table "users".'
        );
      });
  });
  test("responds with a 400 code and appropriate error message request formatted incorrectly", () => {
    const invalidProperties = {
      user: "someone",
      bod: "the body is missing a y!",
    };
    return request(app)
      .post("/api/articles/10/comments")
      .send(invalidProperties)
      .then(({ text }) => {
        expect(400);
        expect(text).toBe("Bad request");
      });
  });
  test("ignores extra properties on the request body, responds with 201 status code and created comment", () => {
    const extraProperties = {
      username: "butter_bridge",
      body: "I have added more things to the request body to try to bring down the system!",
      extraProp: "this property is irrelevant",
      anotherProp: "this one too",
    };
    return request(app)
      .post("/api/articles/7/comments")
      .send(extraProperties)
      .then(({ body }) => {
        expect(201);
        expect(body.comment.comment_id).toBe(19);
        expect(body.comment.body).toBe(
          "I have added more things to the request body to try to bring down the system!"
        );
        expect(body.comment.article_id).toBe(7);
        expect(body.comment.author).toBe("butter_bridge");
        expect(body.comment.votes).toBe(0);
        expect(body.comment.hasOwnProperty("created_at")).toBe(true);
      });
  });
});
