/*
  Warnings:

  - Added the required column `wins` to the `BetsEntry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_BetsEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_BetsEntry" ("createdAt", "games", "id", "player", "points", "week") SELECT "createdAt", "games", "id", "player", "points", "week" FROM "BetsEntry";
DROP TABLE "BetsEntry";
ALTER TABLE "new_BetsEntry" RENAME TO "BetsEntry";
CREATE UNIQUE INDEX "BetsEntry_week_player_key" ON "BetsEntry"("week", "player");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
