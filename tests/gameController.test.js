const gameRouter = require("../routes/gameRouter");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.use("/", gameRouter);

describe("POST /setup", () => {
  describe("valid setup", () => {
    it("sets up the game successfully", async () => {
      const res = await request(app).post("/setup").send();

      expect(res.body).toHaveProperty("gameId");
      expect(res.body).toHaveProperty("characterIds");
      expect(Number.isInteger(res.body.gameId)).toBe(true);
    });
  });
});

describe("POST /:gameId/start", () => {
  describe("valid username is provided", () => {
    it("starts the game successfully", async () => {
      // set up
      const setupRes = await request(app).post("/setup").send();
      const gameId = setupRes.body.gameId;

      // test
      const res = await request(app)
        .post(`/${gameId}/start`)
        .send({ username: "facundo" });

      expect(res.statusCode).toEqual(201);
    });
  });

  describe("invalid username is provided", () => {
    it("missing username", async () => {
      // set up
      const setupRes = await request(app).post("/setup").send();
      const gameId = setupRes.body.gameId;

      // test
      const res = await request(app).post(`/${gameId}/start`).send({});
      expect(res.statusCode).toEqual(201);
    });

    it("malformed username", async () => {
      // set up
      const setupRes = await request(app).post("/setup").send();
      const gameId = setupRes.body.gameId;

      // test
      const res = await request(app)
        .post(`/${gameId}/start`)
        .send({ username: " asdsa<>asdsa" });

      expect(res.statusCode).toEqual(201);
    });

    it("empty username", async () => {
      // set up
      const setupRes = await request(app).post("/setup").send();
      const gameId = setupRes.body.gameId;

      // test
      const res = await request(app)
        .post(`/${gameId}/start`)
        .send({ username: "        " });

      expect(res.statusCode).toEqual(201);
    });
  });
});

describe("POST /:gameId/check", () => {
  describe("invalid gameId is provided", () => {
    it("nonexistent gameId", async () => {
      const res = await request(app).post("/-1/check").send();

      expect(res.statusCode).toEqual(404);
    });

    it("string gameId", async () => {
      const res = await request(app).post("/hello/check").send();

      expect(res.statusCode).toEqual(400);
    });
  });
});
