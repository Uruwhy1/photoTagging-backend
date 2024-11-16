const prisma = require("../prismaClient");

const startGame = async (req, res) => {
  let { username } = req.body;

  const validUsernameRegex = /^[A-Za-z0-9]+$/;
  if (!username || !validUsernameRegex.test(username)) {
    username = "User";
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
    res.status(500).json({ error: "Failed to start the game." });
  }
};

const checkCharacter = async (req, res) => {
  const { gameId } = req.params;

  if (isNaN(+gameId)) {
    return res.status(400).json({ error: "Invalid game ID provided." });
  }

  try {
    // find game
    const game = await prisma.game.findUnique({
      where: {
        id: +gameId,
      },
    });

    if (!game) {
      return res.status(404).json({ error: "Game does not exist." });
    }
    // check character location
    // TODO: add the logic for character check.
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Failed to check character" });
  }
};

const getHighScores = (req, res) => {
  res.send("High scores retrieved");
};

module.exports = {
  startGame,
  checkCharacter,
  getHighScores,
};
