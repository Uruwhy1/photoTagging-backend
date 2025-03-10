const prisma = require("../prismaClient");

const setUpGame = async (req, res) => {
  try {
    // select random characters
    const selectedCharacters = await prisma.$queryRaw`
      SELECT id
      FROM "Character"
      ORDER BY RANDOM()
      LIMIT 3;
    `;

    // create placeholder game
    const newGame = await prisma.game.create({
      data: {
        username: "placeholder",
        startDate: new Date(),
      },
    });

    // link characters and game
    const gameCharacterLinks = selectedCharacters.map((character) => ({
      gameId: newGame.id,
      characterId: character.id,
      found: false,
    }));

    await prisma.gameCharacter.createMany({
      data: gameCharacterLinks,
    });

    return res.status(200).json({
      gameId: newGame.id,
      characterIds: selectedCharacters.map((character) => character.id),
    });
  } catch (error) {
    console.error("Error setting up the game:", error);
    return res.status(500).json({ error: "Failed to set up the game" });
  }
};

const startGame = async (req, res) => {
  const { gameId } = req.params;
  let { username } = req.body;

  const validUsernameRegex = /^[A-Za-z0-9]+$/;
  if (!username || !validUsernameRegex.test(username)) {
    username = "default";
  }

  if (!gameId || isNaN(+gameId)) {
    return res.status(400).json({ error: "Game ID is required" });
  }

  // update start date and username
  try {
    const updatedGame = await prisma.game.update({
      where: { id: +gameId },
      data: {
        username,
        startDate: new Date(),
      },
    });

    res.status(201).json({
      message: "Game started",
    });
  } catch (error) {
    console.error("Error starting the game:", error);
    res.status(500).json({ error: "Failed to start the game" });
  }
};

const checkCharacter = async (req, res) => {
  const { gameId } = req.params;
  const { coordinates, characterId } = req.body;

  if (isNaN(+gameId) || !characterId) {
    return res.status(400).json({ error: "Invalid game ID or character ID." });
  }

  try {
    const game = await prisma.game.findUnique({
      where: { id: +gameId },
    });

    if (!game) {
      return res.status(404).json({ error: "Game does not exist." });
    }

    const gameCharacter = await prisma.gameCharacter.findFirst({
      where: {
        gameId: +gameId,
        characterId: +characterId,
        found: false,
      },
      include: {
        character: true,
      },
    });

    if (!gameCharacter) {
      return res.status(404).json({ error: "Character not found." });
    }

    const foundCharacterId = await checkCoordinates(gameCharacter, coordinates);

    if (foundCharacterId) {
      const isGameComplete = await checkGameStatus(+gameId);

      if (isGameComplete) {
        await prisma.game.update({
          where: { id: +gameId },
          data: {
            endDate: new Date(),
          },
        });

        return res.status(200).json({ message: "Game complete!", characterId });
      } else {
        return res
          .status(200)
          .json({ message: "Character found!", characterId });
      }
    } else {
      return res
        .status(404)
        .json({ error: "Character not found in the provided coordinates." });
    }
  } catch (err) {
    console.error("Error checking character:", err);
    res.status(500).json({ error: "Failed to check character" });
  }
};

const checkCoordinates = async (gameCharacter, coordinates) => {
  const { character } = gameCharacter;

  if (
    coordinates.x >= character.minX &&
    coordinates.x <= character.maxX &&
    coordinates.y >= character.minY &&
    coordinates.y <= character.maxY
  ) {
    await prisma.gameCharacter.update({
      where: {
        id: gameCharacter.id,
      },
      data: {
        found: true,
      },
    });

    return character.id;
  }

  return false;
};

const checkGameStatus = async (gameId) => {
  const remainingCharacters = await prisma.gameCharacter.count({
    where: {
      gameId,
      found: false,
    },
  });

  return remainingCharacters === 0;
};

const getHighScores = async (req, res) => {
  try {
    const highscores = await prisma.$queryRaw`
      SELECT username, EXTRACT(EPOCH FROM "endDate" - "startDate") AS duration
      FROM "Game"      
      WHERE "endDate" IS NOT NULL
      ORDER BY duration ASC
      LIMIT 5
    `;

    if (highscores.length === 0) {
      return res.status(404).json({ error: "There are no finished games." });
    }

    const formattedScores = highscores.map((score) => ({
      username: score.username,
      duration: parseFloat(score.duration),
    }));

    res.json({ highscores: formattedScores });
  } catch (error) {
    console.error("Error fetching high scores:", error);
    res.status(500).json({ error: "Failed to fetch high scores" });
  }
};

module.exports = {
  setUpGame,
  startGame,
  checkCharacter,
  getHighScores,
};
