const gameRouter = require("../routes/gameRouter");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.use("/", gameRouter);

describe("POST /start", () => {
  describe("valid username is provided", () => {
    it("creates a new game successfully", async () => {
      const res = await request(app)
        .post("/start")
        .send({ username: "facundo" });

      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("gameId");
    });
  });

  describe("invalid username is provided", () => {
    it("missing username", async () => {
      const res = await request(app).post("/start").send({});
      expect(res.statusCode).toEqual(201);
    });

    it("malformed username", async () => {
      const res = await request(app)
        .post("/start")
        .send({ username: " asdsa<>asdsa" });

      expect(res.statusCode).toEqual(201);
    });

    it("empty username", async () => {
      const res = await request(app)
        .post("/start")
        .send({ username: "        " });

      expect(res.statusCode).toEqual(201);
    });
  });
});

describe("POST /:gameId/check", () => {
  describe("invalid gameId is provided", () => {
    it("nonexistant gameId", async () => {
      const res = await request(app).post("/-1/check").send();

      expect(res.statusCode).toEqual(404);
    });
    it("string gameId", async () => {
      const res = await request(app).post("/hello/check").send();

      expect(res.statusCode).toEqual(400);
    });
  });
});
