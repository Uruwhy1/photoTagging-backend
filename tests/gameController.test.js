const gameRouter = require("../routes/gameRouter");
const prisma = require("../prismaClient.js");

const request = require("supertest");
const express = require("express");
const app = express();

const { createGames } = require("./createGames");

app.use(express.json());
app.use("/", gameRouter);

afterEach(async () => {
  await prisma.$queryRaw`TRUNCATE TABLE "Game" RESTART IDENTITY CASCADE;`;
  await prisma.$queryRaw`TRUNCATE TABLE "GameCharacter" RESTART IDENTITY CASCADE;`;
  await prisma.$disconnect();
});

describe("POST /setup", () => {
  describe("valid setup", () => {
    it("sets up the game successfully", async () => {
      const res = await request(app).post("/setup").send();

      expect(res.body).toHaveProperty("gameId");
      expect(res.body).toHaveProperty("characterIds");
      expect(Number.isInteger(res.body.gameId)).toBe(true);

      expect(Array.isArray(res.body.characterIds)).toBe(true);
      expect(res.body.characterIds.length).toBeGreaterThan(0);
    });
  });
});

describe("POST /:gameId/start", () => {
  let gameId;

  beforeEach(async () => {
    const setupRes = await request(app).post("/setup").send();
    gameId = setupRes.body.gameId;
  });

  describe("valid username is provided", () => {
    it("starts the game successfully", async () => {
      const res = await request(app)
        .post(`/${gameId}/start`)
        .send({ username: "facundo" });

      expect(res.statusCode).toEqual(201);
    });
  });

  describe("invalid username is provided", () => {
    it("missing username", async () => {
      const res = await request(app).post(`/${gameId}/start`).send({});
      expect(res.statusCode).toEqual(201);
    });

    it("malformed username", async () => {
      const res = await request(app)
        .post(`/${gameId}/start`)
        .send({ username: " asdsa<>asdsa" });

      expect(res.statusCode).toEqual(201);
    });

    it("empty username", async () => {
      const res = await request(app)
        .post(`/${gameId}/start`)
        .send({ username: "        " });

      expect(res.statusCode).toEqual(201);
    });
  });
});

describe("POST /:gameId/check", () => {
  let gameId;
  let assignedCharacters;

  beforeEach(async () => {
    const setupRes = await request(app).post("/setup").send();
    gameId = setupRes.body.gameId;

    // get characters to check x and y stuff
    assignedCharacters = await prisma.gameCharacter.findMany({
      where: { gameId: gameId },
      include: {
        character: true,
      },
    });
  });

  describe("valid character check", () => {
    it("finds a character successfully", async () => {
      const { character } = assignedCharacters[0];
      const validCoordinates = {
        x: (character.minX + character.maxX) / 2,
        y: (character.minY + character.maxY) / 2,
      };

      const res = await request(app)
        .post(`/${gameId}/check`)
        .send({ coordinates: validCoordinates });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("message", "Character found!");
      expect(res.body).toHaveProperty("characterId");
      expect(res.body.characterId).toBe(character.id);
    });
  });

  describe("completes the game when all characters are found", () => {
    it("finds all characters and completes the game", async () => {
      const finalCharacter = assignedCharacters[assignedCharacters.length - 1];
      const firstCharacters = assignedCharacters.slice(0, 2);

      // first two characters request
      for (const { character } of firstCharacters) {
        const validCoordinates = {
          x: (character.minX + character.maxX) / 2,
          y: (character.minY + character.maxY) / 2,
        };

        const res = await request(app)
          .post(`/${gameId}/check`)
          .send({ coordinates: validCoordinates });

        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty("characterId");
      }

      // final check with game winning return
      const finalCoordinates = {
        x: (finalCharacter.character.minX + finalCharacter.character.maxX) / 2,
        y: (finalCharacter.character.minY + finalCharacter.character.maxY) / 2,
      };

      const finalRes = await request(app)
        .post(`/${gameId}/check`)
        .send({ coordinates: finalCoordinates });

      expect(finalRes.body).toHaveProperty("message", "Game complete!");
    });
  });

  describe("invalid character check", () => {
    it("does not find a character with wrong coordinates", async () => {
      const wrongCoordinates = { x: 9999, y: 9999 };

      const res = await request(app)
        .post(`/${gameId}/check`)
        .send({ coordinates: wrongCoordinates });

      expect(res.statusCode).toEqual(404);
      expect(res.body).toHaveProperty(
        "error",
        "Character not found in the provided coordinates."
      );
    });
  });

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

describe.only("GET /highscores", () => {
  it("returns high scores correctly", async () => {
    await createGames();

    const res = await request(app).get("/highscores");

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("highscores");

    res.body.highscores.forEach((score) => {
      expect(typeof score.duration).toBe("number");
      expect(isNaN(score.duration)).toBe(false); // Ensure it's not NaN
    });
  });
  it("handles empty highscores", async () => {
    const res = await request(app).get("/highscores");

    expect(res.statusCode).toEqual(404);
    expect(res.body).toHaveProperty("error");
  });
});
