-- CreateTable
CREATE TABLE "PokerEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "bearo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "PokerEntry_week_bearo_key" ON "PokerEntry"("week", "bearo");
