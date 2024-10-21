-- CreateTable
CREATE TABLE "BetsEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "p" REAL NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "BetsEntry_week_player_key" ON "BetsEntry"("week", "player");