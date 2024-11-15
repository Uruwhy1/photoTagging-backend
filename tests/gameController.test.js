const gameRouter = require("../routes/gameRouter");

const request = require("supertest");
const express = require("express");
const app = express();

app.use(express.json());
app.use("/", gameRouter);

describe("start", () => {
  it("returns status code 201 when username is passed", async () => {
    const res = await request(app)
      .post("/start")
      .send({ username: "facundo-21451259" });

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty("username", "facundo-21451259");
  });

  it("returns status code 400 when username is not passed", async () => {
    const res = await request(app).post("/start").send({});

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty("error", "Username was not received.");
  });
});
