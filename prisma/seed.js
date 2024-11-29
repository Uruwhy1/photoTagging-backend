const prisma = require("../prismaClient");

async function main() {
  // prettier-ignore
  const characters = [
    { name: "Red Dragon", minX: 0.408, maxX: 0.494, minY: 0.063, maxY: 0.099 },
    { name: "Yellow Fish", minX: 0.620, maxX: 0.645, minY: 0.970, maxY: 0.989 },
    { name: "Ship Guy", minX: 0.039, maxX: 0.063, minY: 0.413, maxY: 0.433 },
    { name: "Teacher", minX: 0.389, maxX: 0.426, minY: 0.201, maxY: 0.233 },
    { name: "Cats", minX: 0.672, maxX: 0.704, minY: 0.572, maxY: 0.586 },
    { name: "Dragon and Human", minX: 0.938, maxX: 0.987, minY: 0.511, maxY: 0.551 },
    { name: "Stupid Face", minX: 0.844, maxX: 0.981, minY: 0.837, maxY: 0.900 },
  ];

  for (const character of characters) {
    await prisma.character.create({
      data: {
        name: character.name,
        minX: character.minX,
        maxX: character.maxX,
        minY: character.minY,
        maxY: character.maxY,
      },
    });

    console.log("Character [" + character.name + "] added!");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
