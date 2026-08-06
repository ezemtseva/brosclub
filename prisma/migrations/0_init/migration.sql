-- CreateTable
CREATE TABLE "FplEntry" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FplEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fplEntry2526" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "teamId" TEXT NOT NULL DEFAULT '',

    CONSTRAINT "fplEntry2526_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fplEntry2024" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "points" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,

    CONSTRAINT "fplEntry2024_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GgEntry" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "fiveK" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GgEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ggEntry2024" (
    "id" SERIAL NOT NULL,
    "player" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "fiveK" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "ggEntry2024_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BetsEntry" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BetsEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "betsEntry2526" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "betsEntry2526_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "betsEntry2024" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "betsEntry2024_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PokerEntry" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "bearo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PokerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pokerEntry2024" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "bearo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,

    CONSTRAINT "pokerEntry2024_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SevenOkerEntry" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "bearo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gamepoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "SevenOkerEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sevenOkerEntry2526" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "bearo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gamepoints" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sevenOkerEntry2526_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sevenOkerEntry2024" (
    "id" SERIAL NOT NULL,
    "week" INTEGER NOT NULL,
    "bearo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "points" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "gamepoints" INTEGER,

    CONSTRAINT "sevenOkerEntry2024_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FifaEntry" (
    "id" SERIAL NOT NULL,
    "team" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "goalsScored" INTEGER NOT NULL,
    "goalsConceded" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FifaEntry_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fifaEntry2024" (
    "id" SERIAL NOT NULL,
    "team" TEXT NOT NULL,
    "logo" TEXT NOT NULL,
    "games" INTEGER NOT NULL,
    "wins" INTEGER NOT NULL,
    "draws" INTEGER NOT NULL,
    "losses" INTEGER NOT NULL,
    "goalsScored" INTEGER NOT NULL,
    "goalsConceded" INTEGER NOT NULL,

    CONSTRAINT "fifaEntry2024_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FifaPlayerTeam" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "player" TEXT NOT NULL,
    "team" TEXT NOT NULL,
    "round2" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "FifaPlayerTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FifaMatch" (
    "id" SERIAL NOT NULL,
    "season" TEXT NOT NULL,
    "teamA" TEXT NOT NULL,
    "scoreA" INTEGER NOT NULL,
    "teamB" TEXT NOT NULL,
    "scoreB" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "prediction" TEXT,

    CONSTRAINT "FifaMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlMatch" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "season" TEXT NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "homeTeam" TEXT NOT NULL,
    "awayTeam" TEXT NOT NULL,
    "kickoff" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "scoreHome" INTEGER,
    "scoreAway" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "awayCrest" TEXT,
    "homeCrest" TEXT,

    CONSTRAINT "PlMatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlBet" (
    "id" SERIAL NOT NULL,
    "matchId" INTEGER NOT NULL,
    "player" TEXT NOT NULL,
    "scoreHome" INTEGER NOT NULL,
    "scoreAway" INTEGER NOT NULL,
    "points" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PlBet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlGwReminder" (
    "id" SERIAL NOT NULL,
    "gameweek" INTEGER NOT NULL,
    "sentAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PlGwReminder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FplEntry_week_player_key" ON "FplEntry"("week", "player");

-- CreateIndex
CREATE UNIQUE INDEX "fplEntry2526_week_player_key" ON "fplEntry2526"("week", "player");

-- CreateIndex
CREATE UNIQUE INDEX "GgEntry_week_player_key" ON "GgEntry"("week", "player");

-- CreateIndex
CREATE UNIQUE INDEX "BetsEntry_week_player_key" ON "BetsEntry"("week", "player");

-- CreateIndex
CREATE UNIQUE INDEX "betsEntry2526_week_player_key" ON "betsEntry2526"("week", "player");

-- CreateIndex
CREATE UNIQUE INDEX "PokerEntry_week_bearo_key" ON "PokerEntry"("week", "bearo");

-- CreateIndex
CREATE UNIQUE INDEX "SevenOkerEntry_week_bearo_key" ON "SevenOkerEntry"("week", "bearo");

-- CreateIndex
CREATE UNIQUE INDEX "sevenOkerEntry2526_week_bearo_key" ON "sevenOkerEntry2526"("week", "bearo");

-- CreateIndex
CREATE UNIQUE INDEX "FifaEntry_team_key" ON "FifaEntry"("team");

-- CreateIndex
CREATE UNIQUE INDEX "FifaPlayerTeam_season_team_key" ON "FifaPlayerTeam"("season", "team");

-- CreateIndex
CREATE UNIQUE INDEX "PlMatch_matchId_key" ON "PlMatch"("matchId");

-- CreateIndex
CREATE UNIQUE INDEX "PlBet_matchId_player_key" ON "PlBet"("matchId", "player");

-- CreateIndex
CREATE UNIQUE INDEX "PlGwReminder_gameweek_key" ON "PlGwReminder"("gameweek");

-- AddForeignKey
ALTER TABLE "PlBet" ADD CONSTRAINT "PlBet_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "PlMatch"("matchId") ON DELETE RESTRICT ON UPDATE CASCADE;

