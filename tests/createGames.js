const prisma = require("../prismaClient");

async function createGames() {
  const games = [
    { username: "player1", startDate: new Date() },
    { username: "player2", startDate: new Date() },
    { username: "player3", startDate: new Date() },
  ];

  for (const game of games) {
    const randomDuration = Math.floor(Math.random() * (30 - 10)) + 10;
    const endDate = new Date(game.startDate.getTime() + randomDuration * 1000);

    await prisma.game.create({
      data: {
        username: game.username,
        startDate: game.startDate,
        endDate: endDate,
      },
    });
  }
}

createGames()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

module.exports = {
  createGames,
};
