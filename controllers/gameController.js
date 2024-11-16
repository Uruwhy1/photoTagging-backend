const prisma = require("../prismaClient");

const startGame = async (req, res) => {
  const { username } = req.body;

  const validUsernameRegex = /^[A-Za-z0-9]+$/;
  if (!username || !validUsernameRegex.test(username)) {
    return res.status(400).json({ error: "Invalid username format." });
  }

  try {
    const newGame = await prisma.game.create({
      data: {
        username,
        startDate: new Date(),
      },
    });

    res.status(201).json({
      message: "Game started",
      gameId: newGame.id,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Failed to start the game" });
  }
};

const checkCharacter = (req, res) => {
  const { gameId } = req.params;
  res.send(`Character check for game ID: ${gameId}`);
};

const getHighScores = (req, res) => {
  res.send("High scores retrieved");
};

module.exports = {
  startGame,
  checkCharacter,
  getHighScores,
};
