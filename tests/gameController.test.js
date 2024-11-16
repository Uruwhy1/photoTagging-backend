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
    it("returns 400 for missing username", async () => {
      const res = await request(app).post("/start").send({});
      expect(res.statusCode).toEqual(400);
    });

    it("returns 400 for a malformed username", async () => {
      const res = await request(app)
        .post("/start")
        .send({ username: " asdsa<>" });
      expect(res.statusCode).toEqual(400);
    });

    it("returns 400 for an empty username", async () => {
      const res = await request(app)
        .post("/start")
        .send({ username: "        " });
      expect(res.statusCode).toEqual(400);
    });
  });
});
