-- CreateTable
CREATE TABLE "GameCharacter" (
    "id" SERIAL NOT NULL,
    "gameId" INTEGER NOT NULL,
    "characterId" INTEGER NOT NULL,
    "found" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "GameCharacter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "GameCharacter_gameId_characterId_key" ON "GameCharacter"("gameId", "characterId");

-- AddForeignKey
ALTER TABLE "GameCharacter" ADD CONSTRAINT "GameCharacter_gameId_fkey" FOREIGN KEY ("gameId") REFERENCES "Game"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameCharacter" ADD CONSTRAINT "GameCharacter_characterId_fkey" FOREIGN KEY ("characterId") REFERENCES "Character"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
