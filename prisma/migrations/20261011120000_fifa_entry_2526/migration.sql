-- Archive table for the finished 2025/26 FIFA season, mirroring fifaEntry2024
CREATE TABLE "fifaEntry2526" (
    "id" SERIAL NOT NULL,
    "team" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "goalsScored" INTEGER NOT NULL,
    "goalsConceded" INTEGER NOT NULL,

    CONSTRAINT "fifaEntry2526_pkey" PRIMARY KEY ("id")
);
