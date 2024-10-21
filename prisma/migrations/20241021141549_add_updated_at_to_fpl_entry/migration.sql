/*
  Warnings:

  - Added the required column `updatedAt` to the `FplEntry` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_FplEntry" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_FplEntry" ("createdAt", "games", "id", "player", "points", "teamId", "week") SELECT "createdAt", "games", "id", "player", "points", "teamId", "week" FROM "FplEntry";
DROP TABLE "FplEntry";
ALTER TABLE "new_FplEntry" RENAME TO "FplEntry";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
