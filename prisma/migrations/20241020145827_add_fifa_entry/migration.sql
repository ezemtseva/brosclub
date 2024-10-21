-- CreateTable
CREATE TABLE "FifaEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "team" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "goalsScored" INTEGER NOT NULL,
    "goalsConceded" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "FifaEntry_team_key" ON "FifaEntry"("team");
