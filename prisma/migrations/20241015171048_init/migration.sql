-- CreateTable
CREATE TABLE "FplEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "FplEntry_week_player_key" ON "FplEntry"("week", "player");
