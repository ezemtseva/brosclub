"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import DataTable from "./DataTable"
import VideoCarousel from "./VideoCarousel"
import AddMatchDialog from "./AddMatchDialog"
import FifaSeasonConfig from "./FifaSeasonConfig"
import FifaMatchResults from "./FifaMatchResults"
import FifaAdvancedAnalytics from "./FifaAdvancedAnalytics"
import { PLAYER_COLORS } from "../lib/teamColors"

// Define the seasons array with all the required seasons
const seasons = [
  "2025/26",
  "2024/25",
  "2023/24",
  "2022/23",
  "2021/22",
  "2020/21",
  "2019/20",
  "2017/18",
  "2016/17",
  "2015/16",
  "All Time",
] as const
type Season = (typeof seasons)[number]

// Define types for season data
type TeamStanding = {
  team: string
  logo: string
  games: number
  wins: number
  draws: number
  losses: number
  goalsScored: number
  goalsConceded: number
  goalDifference: number
  points: number
  color: string
}

type SeasonData = {
  standings: TeamStanding[]
  highlights?: string[]
  description?: string
}

type PastSeasonsData = {
  [K in Exclude<Season, "2025/26" | "2024/25" | "All Time">]: SeasonData
}

// Static data for past seasons (2023/24 and earlier)
const pastSeasonsData: PastSeasonsData = {
  "2023/24": {
    standings: [
      {
        team: "Newcastle",
        logo: "/imgs/fifa/new.png",
        games: 28,
        wins: 25,
        draws: 1,
        losses: 2,
        goalsScored: 110,
        goalsConceded: 41,
        goalDifference: 69,
        points: 76,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Marseille",
        logo: "/imgs/fifa/mar.png",
        games: 28,
        wins: 25,
        draws: 0,
        losses: 3,
        goalsScored: 101,
        goalsConceded: 40,
        goalDifference: 61,
        points: 75,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 28,
        wins: 23,
        draws: 4,
        losses: 1,
        goalsScored: 120,
        goalsConceded: 30,
        goalDifference: 90,
        points: 73,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 28,
        wins: 21,
        draws: 6,
        losses: 1,
        goalsScored: 100,
        goalsConceded: 38,
        goalDifference: 62,
        points: 69,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Real Sociedad",
        logo: "/imgs/fifa/rs.png",
        games: 28,
        wins: 22,
        draws: 3,
        losses: 3,
        goalsScored: 98,
        goalsConceded: 40,
        goalDifference: 58,
        points: 69,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Benfica",
        logo: "/imgs/fifa/ben.png",
        games: 28,
        wins: 21,
        draws: 3,
        losses: 4,
        goalsScored: 107,
        goalsConceded: 59,
        goalDifference: 48,
        points: 66,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Fiorentina",
        logo: "/imgs/fifa/fio.png",
        games: 28,
        wins: 20,
        draws: 6,
        losses: 2,
        goalsScored: 95,
        goalsConceded: 50,
        goalDifference: 45,
        points: 66,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Bayer Leverkusen",
        logo: "/imgs/fifa/lev.png",
        games: 28,
        wins: 20,
        draws: 3,
        losses: 5,
        goalsScored: 107,
        goalsConceded: 64,
        goalDifference: 43,
        points: 63,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 28,
        wins: 20,
        draws: 2,
        losses: 6,
        goalsScored: 95,
        goalsConceded: 43,
        goalDifference: 52,
        points: 62,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 28,
        wins: 19,
        draws: 5,
        losses: 4,
        goalsScored: 104,
        goalsConceded: 57,
        goalDifference: 47,
        points: 62,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "RB Leipzig",
        logo: "/imgs/fifa/rbl.png",
        games: 28,
        wins: 19,
        draws: 4,
        losses: 5,
        goalsScored: 97,
        goalsConceded: 47,
        goalDifference: 50,
        points: 61,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 28,
        wins: 17,
        draws: 7,
        losses: 4,
        goalsScored: 82,
        goalsConceded: 45,
        goalDifference: 37,
        points: 58,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Feyenoord",
        logo: "/imgs/fifa/fey.png",
        games: 28,
        wins: 16,
        draws: 4,
        losses: 8,
        goalsScored: 84,
        goalsConceded: 66,
        goalDifference: 18,
        points: 52,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "AS Monaco",
        logo: "/imgs/fifa/mon.png",
        games: 28,
        wins: 15,
        draws: 2,
        losses: 11,
        goalsScored: 89,
        goalsConceded: 72,
        goalDifference: 17,
        points: 47,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 25,
        wins: 14,
        draws: 3,
        losses: 8,
        goalsScored: 84,
        goalsConceded: 49,
        goalDifference: 35,
        points: 45,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Boca Juniors",
        logo: "/imgs/fifa/bj.png",
        games: 28,
        wins: 10,
        draws: 10,
        losses: 8,
        goalsScored: 63,
        goalsConceded: 57,
        goalDifference: 6,
        points: 40,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 24,
        wins: 12,
        draws: 4,
        losses: 8,
        goalsScored: 69,
        goalsConceded: 62,
        goalDifference: 7,
        points: 40,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "AS Roma",
        logo: "/imgs/fifa/rom.png",
        games: 25,
        wins: 12,
        draws: 3,
        losses: 10,
        goalsScored: 83,
        goalsConceded: 64,
        goalDifference: 19,
        points: 39,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 25,
        wins: 11,
        draws: 5,
        losses: 9,
        goalsScored: 82,
        goalsConceded: 73,
        goalDifference: 9,
        points: 38,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Brentford",
        logo: "/imgs/fifa/bre.png",
        games: 25,
        wins: 11,
        draws: 3,
        losses: 11,
        goalsScored: 59,
        goalsConceded: 72,
        goalDifference: -13,
        points: 36,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 25,
        wins: 11,
        draws: 2,
        losses: 12,
        goalsScored: 68,
        goalsConceded: 68,
        goalDifference: 0,
        points: 35,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Al Nassr",
        logo: "/imgs/fifa/aln.png",
        games: 25,
        wins: 10,
        draws: 4,
        losses: 11,
        goalsScored: 87,
        goalsConceded: 78,
        goalDifference: 9,
        points: 34,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "SS Lazio",
        logo: "/imgs/fifa/laz.png",
        games: 23,
        wins: 9,
        draws: 7,
        losses: 7,
        goalsScored: 62,
        goalsConceded: 55,
        goalDifference: 7,
        points: 34,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Athletic Bilbao",
        logo: "/imgs/fifa/atb.png",
        games: 25,
        wins: 8,
        draws: 3,
        losses: 14,
        goalsScored: 60,
        goalsConceded: 78,
        goalDifference: -18,
        points: 27,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "River Plate",
        logo: "/imgs/fifa/rp.png",
        games: 26,
        wins: 8,
        draws: 3,
        losses: 15,
        goalsScored: 62,
        goalsConceded: 83,
        goalDifference: -21,
        points: 27,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 25,
        wins: 7,
        draws: 5,
        losses: 13,
        goalsScored: 48,
        goalsConceded: 74,
        goalDifference: -26,
        points: 26,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Brighton",
        logo: "/imgs/fifa/bri.png",
        games: 26,
        wins: 7,
        draws: 4,
        losses: 15,
        goalsScored: 56,
        goalsConceded: 87,
        goalDifference: -31,
        points: 25,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Milan",
        logo: "/imgs/fifa/mil.png",
        games: 27,
        wins: 6,
        draws: 6,
        losses: 15,
        goalsScored: 58,
        goalsConceded: 101,
        goalDifference: -43,
        points: 24,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Porto",
        logo: "/imgs/fifa/por.png",
        games: 26,
        wins: 6,
        draws: 4,
        losses: 16,
        goalsScored: 60,
        goalsConceded: 81,
        goalDifference: -21,
        points: 22,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 27,
        wins: 6,
        draws: 4,
        losses: 17,
        goalsScored: 70,
        goalsConceded: 96,
        goalDifference: -26,
        points: 22,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Aston Villa",
        logo: "/imgs/fifa/ast.png",
        games: 24,
        wins: 5,
        draws: 4,
        losses: 15,
        goalsScored: 49,
        goalsConceded: 82,
        goalDifference: -33,
        points: 19,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Tottenham",
        logo: "/imgs/fifa/tot.png",
        games: 25,
        wins: 5,
        draws: 2,
        losses: 18,
        goalsScored: 48,
        goalsConceded: 95,
        goalDifference: -47,
        points: 17,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Al Ahli",
        logo: "/imgs/fifa/ala.png",
        games: 25,
        wins: 5,
        draws: 2,
        losses: 18,
        goalsScored: 29,
        goalsConceded: 81,
        goalDifference: -52,
        points: 17,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 23,
        wins: 3,
        draws: 7,
        losses: 13,
        goalsScored: 52,
        goalsConceded: 88,
        goalDifference: -36,
        points: 16,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "West Ham",
        logo: "/imgs/fifa/wh.png",
        games: 24,
        wins: 3,
        draws: 6,
        losses: 15,
        goalsScored: 56,
        goalsConceded: 83,
        goalDifference: -27,
        points: 15,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 27,
        wins: 3,
        draws: 4,
        losses: 20,
        goalsScored: 60,
        goalsConceded: 105,
        goalDifference: -45,
        points: 13,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 26,
        wins: 2,
        draws: 7,
        losses: 17,
        goalsScored: 43,
        goalsConceded: 88,
        goalDifference: -45,
        points: 13,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Al Hilal",
        logo: "/imgs/fifa/alh.png",
        games: 25,
        wins: 3,
        draws: 1,
        losses: 21,
        goalsScored: 30,
        goalsConceded: 92,
        goalDifference: -62,
        points: 10,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Real Betis",
        logo: "/imgs/fifa/rb.png",
        games: 26,
        wins: 3,
        draws: 1,
        losses: 22,
        goalsScored: 41,
        goalsConceded: 107,
        goalDifference: -66,
        points: 10,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Galatasaray",
        logo: "/imgs/fifa/gal.png",
        games: 24,
        wins: 2,
        draws: 3,
        losses: 19,
        goalsScored: 31,
        goalsConceded: 90,
        goalDifference: -59,
        points: 9,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Atalanta",
        logo: "/imgs/fifa/ata.png",
        games: 24,
        wins: 2,
        draws: 1,
        losses: 21,
        goalsScored: 32,
        goalsConceded: 96,
        goalDifference: -64,
        points: 7,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Sevilla",
        logo: "/imgs/fifa/sev.png",
        games: 24,
        wins: 0,
        draws: 4,
        losses: 20,
        goalsScored: 30,
        goalsConceded: 84,
        goalDifference: -54,
        points: 4,
        color: PLAYER_COLORS.Panda,
      },
    ],
    highlights: [
      "Vanilla holds the highest win rate for a team in a season (Newcastle, Marseille) – 89.29%",
      "Vanilla holds the longest unbeaten streak for a team (Barcelona) – 26 matches",
      "The smallest gap between 1st and 2nd place",
    ],
  },
  "2022/23": {
    standings: [
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 44,
        wins: 34,
        draws: 3,
        losses: 7,
        goalsScored: 164,
        goalsConceded: 57,
        goalDifference: 107,
        points: 105,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 44,
        wins: 31,
        draws: 7,
        losses: 6,
        goalsScored: 129,
        goalsConceded: 60,
        goalDifference: 69,
        points: 100,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Bayer Leverkusen",
        logo: "/imgs/fifa/lev.png",
        games: 44,
        wins: 31,
        draws: 7,
        losses: 6,
        goalsScored: 129,
        goalsConceded: 66,
        goalDifference: 63,
        points: 100,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 44,
        wins: 30,
        draws: 8,
        losses: 6,
        goalsScored: 133,
        goalsConceded: 70,
        goalDifference: 63,
        points: 98,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "AFC Richmond",
        logo: "/imgs/fifa/ric.png",
        games: 44,
        wins: 31,
        draws: 5,
        losses: 8,
        goalsScored: 127,
        goalsConceded: 81,
        goalDifference: 46,
        points: 98,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 44,
        wins: 30,
        draws: 7,
        losses: 7,
        goalsScored: 134,
        goalsConceded: 77,
        goalDifference: 57,
        points: 97,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 44,
        wins: 30,
        draws: 4,
        losses: 10,
        goalsScored: 129,
        goalsConceded: 77,
        goalDifference: 52,
        points: 94,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 44,
        wins: 29,
        draws: 7,
        losses: 8,
        goalsScored: 116,
        goalsConceded: 68,
        goalDifference: 48,
        points: 94,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 44,
        wins: 28,
        draws: 8,
        losses: 8,
        goalsScored: 131,
        goalsConceded: 67,
        goalDifference: 64,
        points: 92,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "AS Roma",
        logo: "/imgs/fifa/rom.png",
        games: 44,
        wins: 26,
        draws: 8,
        losses: 10,
        goalsScored: 111,
        goalsConceded: 86,
        goalDifference: 25,
        points: 86,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Tottenham",
        logo: "/imgs/fifa/tot.png",
        games: 44,
        wins: 24,
        draws: 8,
        losses: 12,
        goalsScored: 130,
        goalsConceded: 91,
        goalDifference: 39,
        points: 80,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Eintracht Frankfurt",
        logo: "/imgs/fifa/fra.png",
        games: 44,
        wins: 24,
        draws: 7,
        losses: 13,
        goalsScored: 123,
        goalsConceded: 98,
        goalDifference: 25,
        points: 79,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "RB Leipzig",
        logo: "/imgs/fifa/rbl.png",
        games: 44,
        wins: 22,
        draws: 10,
        losses: 12,
        goalsScored: 136,
        goalsConceded: 104,
        goalDifference: 32,
        points: 76,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 44,
        wins: 23,
        draws: 5,
        losses: 16,
        goalsScored: 116,
        goalsConceded: 94,
        goalDifference: 22,
        points: 74,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Newcastle",
        logo: "/imgs/fifa/new.png",
        games: 44,
        wins: 19,
        draws: 5,
        losses: 20,
        goalsScored: 95,
        goalsConceded: 90,
        goalDifference: 5,
        points: 62,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "PSV",
        logo: "/imgs/fifa/psv.png",
        games: 44,
        wins: 15,
        draws: 10,
        losses: 19,
        goalsScored: 126,
        goalsConceded: 115,
        goalDifference: 11,
        points: 55,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Porto",
        logo: "/imgs/fifa/por.png",
        games: 28,
        wins: 15,
        draws: 8,
        losses: 5,
        goalsScored: 75,
        goalsConceded: 53,
        goalDifference: 22,
        points: 53,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Villarreal",
        logo: "/imgs/fifa/vil.png",
        games: 28,
        wins: 16,
        draws: 4,
        losses: 8,
        goalsScored: 85,
        goalsConceded: 63,
        goalDifference: 22,
        points: 52,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Atalanta",
        logo: "/imgs/fifa/ata.png",
        games: 28,
        wins: 16,
        draws: 2,
        losses: 10,
        goalsScored: 85,
        goalsConceded: 65,
        goalDifference: 20,
        points: 50,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Dinamo Zagreb",
        logo: "/imgs/fifa/zag.png",
        games: 28,
        wins: 15,
        draws: 3,
        losses: 10,
        goalsScored: 79,
        goalsConceded: 58,
        goalDifference: 21,
        points: 48,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Rangers",
        logo: "/imgs/fifa/ran.png",
        games: 28,
        wins: 14,
        draws: 5,
        losses: 9,
        goalsScored: 70,
        goalsConceded: 63,
        goalDifference: 7,
        points: 47,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Ajax",
        logo: "/imgs/fifa/aja.png",
        games: 28,
        wins: 13,
        draws: 6,
        losses: 9,
        goalsScored: 64,
        goalsConceded: 49,
        goalDifference: 15,
        points: 45,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 44,
        wins: 13,
        draws: 4,
        losses: 27,
        goalsScored: 96,
        goalsConceded: 139,
        goalDifference: -43,
        points: 43,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 44,
        wins: 11,
        draws: 9,
        losses: 24,
        goalsScored: 104,
        goalsConceded: 128,
        goalDifference: -24,
        points: 42,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "West Ham",
        logo: "/imgs/fifa/wh.png",
        games: 28,
        wins: 12,
        draws: 4,
        losses: 12,
        goalsScored: 78,
        goalsConceded: 66,
        goalDifference: 12,
        points: 40,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "AS Monaco",
        logo: "/imgs/fifa/mon.png",
        games: 28,
        wins: 11,
        draws: 6,
        losses: 11,
        goalsScored: 76,
        goalsConceded: 67,
        goalDifference: 9,
        points: 39,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Sporting CP",
        logo: "/imgs/fifa/spo.png",
        games: 28,
        wins: 12,
        draws: 3,
        losses: 13,
        goalsScored: 65,
        goalsConceded: 59,
        goalDifference: 6,
        points: 39,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Milan",
        logo: "/imgs/fifa/mil.png",
        games: 44,
        wins: 8,
        draws: 11,
        losses: 25,
        goalsScored: 91,
        goalsConceded: 117,
        goalDifference: -26,
        points: 35,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Lille",
        logo: "/imgs/fifa/lil.png",
        games: 28,
        wins: 10,
        draws: 4,
        losses: 14,
        goalsScored: 61,
        goalsConceded: 78,
        goalDifference: -17,
        points: 34,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Benfica",
        logo: "/imgs/fifa/ben.png",
        games: 44,
        wins: 9,
        draws: 7,
        losses: 28,
        goalsScored: 69,
        goalsConceded: 137,
        goalDifference: -68,
        points: 34,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 44,
        wins: 9,
        draws: 5,
        losses: 30,
        goalsScored: 83,
        goalsConceded: 154,
        goalDifference: -71,
        points: 32,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "RB Salzburg",
        logo: "/imgs/fifa/rbs.png",
        games: 28,
        wins: 8,
        draws: 5,
        losses: 15,
        goalsScored: 77,
        goalsConceded: 81,
        goalDifference: -4,
        points: 29,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 44,
        wins: 8,
        draws: 5,
        losses: 31,
        goalsScored: 63,
        goalsConceded: 133,
        goalDifference: -70,
        points: 29,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Adana Demirspor",
        logo: "/imgs/fifa/ada.png",
        games: 28,
        wins: 6,
        draws: 8,
        losses: 14,
        goalsScored: 68,
        goalsConceded: 86,
        goalDifference: -18,
        points: 26,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 44,
        wins: 6,
        draws: 8,
        losses: 30,
        goalsScored: 88,
        goalsConceded: 151,
        goalDifference: -63,
        points: 26,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 44,
        wins: 5,
        draws: 9,
        losses: 30,
        goalsScored: 73,
        goalsConceded: 139,
        goalDifference: -66,
        points: 24,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Wolverhampton",
        logo: "/imgs/fifa/wol.png",
        games: 28,
        wins: 5,
        draws: 2,
        losses: 21,
        goalsScored: 52,
        goalsConceded: 107,
        goalDifference: -55,
        points: 17,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "SS Lazio",
        logo: "/imgs/fifa/laz.png",
        games: 28,
        wins: 4,
        draws: 1,
        losses: 23,
        goalsScored: 23,
        goalsConceded: 91,
        goalDifference: -68,
        points: 13,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Leicester City",
        logo: "/imgs/fifa/lei.png",
        games: 28,
        wins: 3,
        draws: 3,
        losses: 22,
        goalsScored: 54,
        goalsConceded: 114,
        goalDifference: -60,
        points: 12,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Athletic Bilbao",
        logo: "/imgs/fifa/atb.png",
        games: 28,
        wins: 3,
        draws: 2,
        losses: 23,
        goalsScored: 32,
        goalsConceded: 103,
        goalDifference: -71,
        points: 11,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Sevilla",
        logo: "/imgs/fifa/sev.png",
        games: 28,
        wins: 1,
        draws: 3,
        losses: 24,
        goalsScored: 29,
        goalsConceded: 95,
        goalDifference: -66,
        points: 6,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Nottingham Forest",
        logo: "/imgs/fifa/nf.png",
        games: 28,
        wins: 1,
        draws: 2,
        losses: 25,
        goalsScored: 34,
        goalsConceded: 106,
        goalDifference: -72,
        points: 5,
        color: PLAYER_COLORS.Panda,
      },
    ],
  },
  "2021/22": {
    description: "Some data was lost. The standings table will be updated as soon as it's restored.",
    standings: [
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 27,
        wins: 23,
        draws: 2,
        losses: 2,
        goalsScored: 85,
        goalsConceded: 37,
        goalDifference: 48,
        points: 71,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Tottenham",
        logo: "/imgs/fifa/tot.png",
        games: 27,
        wins: 21,
        draws: 2,
        losses: 4,
        goalsScored: 113,
        goalsConceded: 45,
        goalDifference: 68,
        points: 65,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 27,
        wins: 16,
        draws: 7,
        losses: 4,
        goalsScored: 94,
        goalsConceded: 70,
        goalDifference: 24,
        points: 55,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 27,
        wins: 17,
        draws: 4,
        losses: 6,
        goalsScored: 87,
        goalsConceded: 57,
        goalDifference: 30,
        points: 55,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "RB Leipzig",
        logo: "/imgs/fifa/rbl.png",
        games: 15,
        wins: 7,
        draws: 6,
        losses: 2,
        goalsScored: 32,
        goalsConceded: 19,
        goalDifference: 13,
        points: 27,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Sevilla",
        logo: "/imgs/fifa/sev.png",
        games: 15,
        wins: 8,
        draws: 5,
        losses: 2,
        goalsScored: 35,
        goalsConceded: 26,
        goalDifference: 9,
        points: 29,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Everton",
        logo: "/imgs/fifa/eve.png",
        games: 15,
        wins: 8,
        draws: 1,
        losses: 6,
        goalsScored: 37,
        goalsConceded: 35,
        goalDifference: 2,
        points: 25,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 15,
        wins: 7,
        draws: 4,
        losses: 4,
        goalsScored: 44,
        goalsConceded: 33,
        goalDifference: 11,
        points: 25,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 15,
        wins: 7,
        draws: 3,
        losses: 5,
        goalsScored: 32,
        goalsConceded: 27,
        goalDifference: 5,
        points: 24,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 15,
        wins: 5,
        draws: 5,
        losses: 5,
        goalsScored: 35,
        goalsConceded: 35,
        goalDifference: 0,
        points: 20,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "AS Monaco",
        logo: "/imgs/fifa/mon.png",
        games: 15,
        wins: 7,
        draws: 3,
        losses: 5,
        goalsScored: 41,
        goalsConceded: 44,
        goalDifference: -3,
        points: 24,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 15,
        wins: 6,
        draws: 4,
        losses: 5,
        goalsScored: 34,
        goalsConceded: 33,
        goalDifference: 1,
        points: 22,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Lille",
        logo: "/imgs/fifa/lil.png",
        games: 15,
        wins: 5,
        draws: 4,
        losses: 6,
        goalsScored: 32,
        goalsConceded: 36,
        goalDifference: -4,
        points: 19,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 15,
        wins: 7,
        draws: 2,
        losses: 6,
        goalsScored: 39,
        goalsConceded: 44,
        goalDifference: -5,
        points: 23,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 15,
        wins: 6,
        draws: 3,
        losses: 6,
        goalsScored: 38,
        goalsConceded: 42,
        goalDifference: -4,
        points: 21,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 15,
        wins: 5,
        draws: 3,
        losses: 7,
        goalsScored: 35,
        goalsConceded: 45,
        goalDifference: -10,
        points: 18,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 15,
        wins: 4,
        draws: 3,
        losses: 8,
        goalsScored: 31,
        goalsConceded: 37,
        goalDifference: -6,
        points: 15,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Atalanta",
        logo: "/imgs/fifa/ata.png",
        games: 15,
        wins: 4,
        draws: 3,
        losses: 8,
        goalsScored: 30,
        goalsConceded: 44,
        goalDifference: -14,
        points: 15,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 15,
        wins: 3,
        draws: 3,
        losses: 9,
        goalsScored: 29,
        goalsConceded: 58,
        goalDifference: -29,
        points: 12,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 15,
        wins: 3,
        draws: 2,
        losses: 10,
        goalsScored: 31,
        goalsConceded: 46,
        goalDifference: -15,
        points: 11,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Leicester City",
        logo: "/imgs/fifa/lei.png",
        games: 15,
        wins: 2,
        draws: 3,
        losses: 10,
        goalsScored: 28,
        goalsConceded: 52,
        goalDifference: -24,
        points: 9,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Real Sociedad",
        logo: "/imgs/fifa/rs.png",
        games: 15,
        wins: 2,
        draws: 1,
        losses: 12,
        goalsScored: 27,
        goalsConceded: 50,
        goalDifference: -23,
        points: 7,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Milan",
        logo: "/imgs/fifa/mil.png",
        games: 15,
        wins: 1,
        draws: 2,
        losses: 12,
        goalsScored: 25,
        goalsConceded: 48,
        goalDifference: -23,
        points: 5,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 15,
        wins: 1,
        draws: 1,
        losses: 13,
        goalsScored: 20,
        goalsConceded: 52,
        goalDifference: -32,
        points: 4,
        color: PLAYER_COLORS.Panda,
      },
    ],
  },
  "2020/21": {
    standings: [
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 40,
        wins: 32,
        draws: 6,
        losses: 2,
        goalsScored: 161,
        goalsConceded: 50,
        goalDifference: 111,
        points: 102,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 40,
        wins: 29,
        draws: 5,
        losses: 6,
        goalsScored: 146,
        goalsConceded: 76,
        goalDifference: 70,
        points: 92,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "RB Leipzig",
        logo: "/imgs/fifa/rbl.png",
        games: 40,
        wins: 28,
        draws: 5,
        losses: 7,
        goalsScored: 138,
        goalsConceded: 77,
        goalDifference: 61,
        points: 89,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "SS Lazio",
        logo: "/imgs/fifa/laz.png",
        games: 40,
        wins: 28,
        draws: 4,
        losses: 8,
        goalsScored: 143,
        goalsConceded: 88,
        goalDifference: 55,
        points: 88,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 40,
        wins: 26,
        draws: 9,
        losses: 5,
        goalsScored: 142,
        goalsConceded: 85,
        goalDifference: 57,
        points: 87,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 40,
        wins: 26,
        draws: 4,
        losses: 10,
        goalsScored: 146,
        goalsConceded: 87,
        goalDifference: 59,
        points: 82,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 40,
        wins: 25,
        draws: 6,
        losses: 9,
        goalsScored: 145,
        goalsConceded: 88,
        goalDifference: 57,
        points: 81,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Tottenham",
        logo: "/imgs/fifa/tot.png",
        games: 40,
        wins: 23,
        draws: 8,
        losses: 9,
        goalsScored: 137,
        goalsConceded: 92,
        goalDifference: 45,
        points: 77,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Sevilla",
        logo: "/imgs/fifa/sev.png",
        games: 40,
        wins: 24,
        draws: 3,
        losses: 13,
        goalsScored: 116,
        goalsConceded: 87,
        goalDifference: 29,
        points: 75,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Milan",
        logo: "/imgs/fifa/mil.png",
        games: 40,
        wins: 23,
        draws: 5,
        losses: 12,
        goalsScored: 141,
        goalsConceded: 97,
        goalDifference: 44,
        points: 74,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 40,
        wins: 22,
        draws: 7,
        losses: 11,
        goalsScored: 157,
        goalsConceded: 93,
        goalDifference: 64,
        points: 73,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Olympique Lyon",
        logo: "/imgs/fifa/lyo.png",
        games: 40,
        wins: 23,
        draws: 4,
        losses: 13,
        goalsScored: 128,
        goalsConceded: 92,
        goalDifference: 36,
        points: 73,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Atalanta",
        logo: "/imgs/fifa/ata.png",
        games: 40,
        wins: 21,
        draws: 10,
        losses: 9,
        goalsScored: 135,
        goalsConceded: 101,
        goalDifference: 34,
        points: 73,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 40,
        wins: 21,
        draws: 6,
        losses: 13,
        goalsScored: 147,
        goalsConceded: 100,
        goalDifference: 47,
        points: 69,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Everton",
        logo: "/imgs/fifa/eve.png",
        games: 40,
        wins: 18,
        draws: 7,
        losses: 15,
        goalsScored: 131,
        goalsConceded: 120,
        goalDifference: 11,
        points: 61,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Real Sociedad",
        logo: "/imgs/fifa/rs.png",
        games: 40,
        wins: 16,
        draws: 11,
        losses: 13,
        goalsScored: 138,
        goalsConceded: 122,
        goalDifference: 16,
        points: 59,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 40,
        wins: 18,
        draws: 5,
        losses: 17,
        goalsScored: 112,
        goalsConceded: 106,
        goalDifference: 6,
        points: 59,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Wolverhampton",
        logo: "/imgs/fifa/wol.png",
        games: 40,
        wins: 15,
        draws: 7,
        losses: 18,
        goalsScored: 123,
        goalsConceded: 135,
        goalDifference: -12,
        points: 52,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 40,
        wins: 16,
        draws: 3,
        losses: 21,
        goalsScored: 126,
        goalsConceded: 130,
        goalDifference: -4,
        points: 51,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 40,
        wins: 15,
        draws: 3,
        losses: 22,
        goalsScored: 97,
        goalsConceded: 140,
        goalDifference: -43,
        points: 48,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Leicester City",
        logo: "/imgs/fifa/lei.png",
        games: 40,
        wins: 14,
        draws: 3,
        losses: 23,
        goalsScored: 119,
        goalsConceded: 118,
        goalDifference: 1,
        points: 45,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 40,
        wins: 12,
        draws: 4,
        losses: 24,
        goalsScored: 103,
        goalsConceded: 145,
        goalDifference: -42,
        points: 40,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 40,
        wins: 8,
        draws: 8,
        losses: 24,
        goalsScored: 106,
        goalsConceded: 155,
        goalDifference: -49,
        points: 32,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 40,
        wins: 9,
        draws: 5,
        losses: 26,
        goalsScored: 106,
        goalsConceded: 182,
        goalDifference: -76,
        points: 32,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Athletic Bilbao",
        logo: "/imgs/fifa/atb.png",
        games: 40,
        wins: 5,
        draws: 9,
        losses: 26,
        goalsScored: 76,
        goalsConceded: 145,
        goalDifference: -69,
        points: 24,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Porto",
        logo: "/imgs/fifa/por.png",
        games: 40,
        wins: 7,
        draws: 3,
        losses: 30,
        goalsScored: 74,
        goalsConceded: 162,
        goalDifference: -88,
        points: 24,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 40,
        wins: 6,
        draws: 4,
        losses: 30,
        goalsScored: 80,
        goalsConceded: 179,
        goalDifference: -99,
        points: 22,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Benfica",
        logo: "/imgs/fifa/ben.png",
        games: 40,
        wins: 3,
        draws: 5,
        losses: 32,
        goalsScored: 69,
        goalsConceded: 177,
        goalDifference: -108,
        points: 14,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Ajax",
        logo: "/imgs/fifa/aja.png",
        games: 40,
        wins: 3,
        draws: 2,
        losses: 35,
        goalsScored: 57,
        goalsConceded: 168,
        goalDifference: -111,
        points: 11,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Bayer Leverkusen",
        logo: "/imgs/fifa/lev.png",
        games: 40,
        wins: 1,
        draws: 5,
        losses: 34,
        goalsScored: 63,
        goalsConceded: 165,
        goalDifference: -102,
        points: 8,
        color: PLAYER_COLORS.Panda,
      },
    ],
    highlights: [
      "Vanilla holds the highest win rate for a season – 70.7%",
      "Choco was the fastest to score 100 goals in a tournament – 23 rounds (Chelsea)",
      "The largest gap between 1st and 2nd place",
    ],
  },
  "2019/20": {
    standings: [
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 32,
        wins: 27,
        draws: 3,
        losses: 2,
        goalsScored: 136,
        goalsConceded: 50,
        goalDifference: 86,
        points: 84,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Ajax",
        logo: "/imgs/fifa/aja.png",
        games: 32,
        wins: 24,
        draws: 5,
        losses: 3,
        goalsScored: 122,
        goalsConceded: 56,
        goalDifference: 66,
        points: 77,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 32,
        wins: 24,
        draws: 3,
        losses: 5,
        goalsScored: 132,
        goalsConceded: 46,
        goalDifference: 86,
        points: 75,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 32,
        wins: 22,
        draws: 6,
        losses: 4,
        goalsScored: 126,
        goalsConceded: 69,
        goalDifference: 57,
        points: 72,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 32,
        wins: 21,
        draws: 6,
        losses: 5,
        goalsScored: 108,
        goalsConceded: 58,
        goalDifference: 50,
        points: 69,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 32,
        wins: 22,
        draws: 3,
        losses: 7,
        goalsScored: 118,
        goalsConceded: 72,
        goalDifference: 46,
        points: 69,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 32,
        wins: 21,
        draws: 5,
        losses: 6,
        goalsScored: 124,
        goalsConceded: 77,
        goalDifference: 47,
        points: 68,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Olympique Lyon",
        logo: "/imgs/fifa/lyo.png",
        games: 32,
        wins: 20,
        draws: 6,
        losses: 6,
        goalsScored: 112,
        goalsConceded: 69,
        goalDifference: 43,
        points: 66,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Porto",
        logo: "/imgs/fifa/por.png",
        games: 32,
        wins: 19,
        draws: 5,
        losses: 8,
        goalsScored: 118,
        goalsConceded: 78,
        goalDifference: 40,
        points: 62,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "RB Leipzig",
        logo: "/imgs/fifa/rbl.png",
        games: 32,
        wins: 18,
        draws: 7,
        losses: 7,
        goalsScored: 114,
        goalsConceded: 70,
        goalDifference: 44,
        points: 61,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Tottenham",
        logo: "/imgs/fifa/tot.png",
        games: 32,
        wins: 18,
        draws: 5,
        losses: 9,
        goalsScored: 125,
        goalsConceded: 75,
        goalDifference: 50,
        points: 59,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 32,
        wins: 19,
        draws: 2,
        losses: 11,
        goalsScored: 111,
        goalsConceded: 75,
        goalDifference: 36,
        points: 59,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Valencia",
        logo: "/imgs/fifa/val.png",
        games: 32,
        wins: 17,
        draws: 5,
        losses: 10,
        goalsScored: 107,
        goalsConceded: 79,
        goalDifference: 28,
        points: 56,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "AS Monaco",
        logo: "/imgs/fifa/mon.png",
        games: 32,
        wins: 18,
        draws: 1,
        losses: 13,
        goalsScored: 108,
        goalsConceded: 74,
        goalDifference: 34,
        points: 55,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 32,
        wins: 16,
        draws: 4,
        losses: 12,
        goalsScored: 102,
        goalsConceded: 79,
        goalDifference: 23,
        points: 52,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Leicester City",
        logo: "/imgs/fifa/lei.png",
        games: 32,
        wins: 12,
        draws: 6,
        losses: 14,
        goalsScored: 80,
        goalsConceded: 85,
        goalDifference: -5,
        points: 42,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 32,
        wins: 7,
        draws: 1,
        losses: 24,
        goalsScored: 55,
        goalsConceded: 125,
        goalDifference: -70,
        points: 22,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 32,
        wins: 2,
        draws: 6,
        losses: 24,
        goalsScored: 57,
        goalsConceded: 140,
        goalDifference: -83,
        points: 12,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 32,
        wins: 2,
        draws: 5,
        losses: 25,
        goalsScored: 56,
        goalsConceded: 144,
        goalDifference: -88,
        points: 11,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 32,
        wins: 1,
        draws: 5,
        losses: 26,
        goalsScored: 49,
        goalsConceded: 143,
        goalDifference: -94,
        points: 8,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Bayer Leverkusen",
        logo: "/imgs/fifa/lev.png",
        games: 32,
        wins: 2,
        draws: 2,
        losses: 28,
        goalsScored: 57,
        goalsConceded: 153,
        goalDifference: -96,
        points: 8,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 32,
        wins: 2,
        draws: 2,
        losses: 28,
        goalsScored: 51,
        goalsConceded: 154,
        goalDifference: -103,
        points: 8,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Everton",
        logo: "/imgs/fifa/eve.png",
        games: 32,
        wins: 1,
        draws: 2,
        losses: 29,
        goalsScored: 43,
        goalsConceded: 138,
        goalDifference: -95,
        points: 5,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 32,
        wins: 1,
        draws: 2,
        losses: 29,
        goalsScored: 44,
        goalsConceded: 146,
        goalDifference: -102,
        points: 5,
        color: PLAYER_COLORS.Panda,
      },
    ],
    highlights: ["Vanilla was the first to score an Olympic goal (directly from a corner) against an opponent (Lille)"],
  },
  "2017/18": {
    description: "This season was not completed due to a suspension. No winner was determined.",
    standings: [
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 44,
        wins: 24,
        draws: 8,
        losses: 12,
        goalsScored: 116,
        goalsConceded: 89,
        goalDifference: 27,
        points: 80,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 39,
        wins: 23,
        draws: 8,
        losses: 8,
        goalsScored: 113,
        goalsConceded: 71,
        goalDifference: 42,
        points: 77,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 47,
        wins: 22,
        draws: 10,
        losses: 15,
        goalsScored: 110,
        goalsConceded: 92,
        goalDifference: 18,
        points: 76,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 37,
        wins: 23,
        draws: 6,
        losses: 8,
        goalsScored: 115,
        goalsConceded: 80,
        goalDifference: 35,
        points: 75,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "AS Monaco",
        logo: "/imgs/fifa/mon.png",
        games: 44,
        wins: 23,
        draws: 5,
        losses: 16,
        goalsScored: 107,
        goalsConceded: 89,
        goalDifference: 18,
        points: 74,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Everton",
        logo: "/imgs/fifa/eve.png",
        games: 45,
        wins: 20,
        draws: 11,
        losses: 14,
        goalsScored: 105,
        goalsConceded: 84,
        goalDifference: 21,
        points: 71,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 35,
        wins: 21,
        draws: 7,
        losses: 7,
        goalsScored: 105,
        goalsConceded: 80,
        goalDifference: 25,
        points: 70,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 48,
        wins: 20,
        draws: 9,
        losses: 19,
        goalsScored: 126,
        goalsConceded: 117,
        goalDifference: 9,
        points: 69,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "AS Roma",
        logo: "/imgs/fifa/rom.png",
        games: 44,
        wins: 19,
        draws: 8,
        losses: 17,
        goalsScored: 95,
        goalsConceded: 97,
        goalDifference: -2,
        points: 65,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 42,
        wins: 18,
        draws: 10,
        losses: 14,
        goalsScored: 101,
        goalsConceded: 82,
        goalDifference: 19,
        points: 64,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Tottenham",
        logo: "/imgs/fifa/tot.png",
        games: 43,
        wins: 17,
        draws: 13,
        losses: 13,
        goalsScored: 107,
        goalsConceded: 80,
        goalDifference: 27,
        points: 64,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 39,
        wins: 18,
        draws: 8,
        losses: 13,
        goalsScored: 97,
        goalsConceded: 75,
        goalDifference: 22,
        points: 62,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 39,
        wins: 16,
        draws: 13,
        losses: 10,
        goalsScored: 94,
        goalsConceded: 78,
        goalDifference: 16,
        points: 61,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Milan",
        logo: "/imgs/fifa/mil.png",
        games: 39,
        wins: 16,
        draws: 13,
        losses: 10,
        goalsScored: 95,
        goalsConceded: 89,
        goalDifference: 6,
        points: 61,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 44,
        wins: 18,
        draws: 6,
        losses: 20,
        goalsScored: 92,
        goalsConceded: 99,
        goalDifference: -7,
        points: 60,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "SS Lazio",
        logo: "/imgs/fifa/laz.png",
        games: 39,
        wins: 17,
        draws: 8,
        losses: 14,
        goalsScored: 99,
        goalsConceded: 90,
        goalDifference: 9,
        points: 59,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Zenit",
        logo: "/imgs/fifa/zen.png",
        games: 39,
        wins: 17,
        draws: 8,
        losses: 14,
        goalsScored: 104,
        goalsConceded: 101,
        goalDifference: 3,
        points: 59,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Spartak Moscow",
        logo: "/imgs/fifa/spa.png",
        games: 39,
        wins: 15,
        draws: 11,
        losses: 13,
        goalsScored: 84,
        goalsConceded: 87,
        goalDifference: -3,
        points: 56,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 40,
        wins: 16,
        draws: 8,
        losses: 16,
        goalsScored: 90,
        goalsConceded: 89,
        goalDifference: 1,
        points: 56,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Stoke City",
        logo: "/imgs/fifa/sto.png",
        games: 43,
        wins: 13,
        draws: 17,
        losses: 13,
        goalsScored: 97,
        goalsConceded: 107,
        goalDifference: -10,
        points: 56,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Benfica",
        logo: "/imgs/fifa/ben.png",
        games: 40,
        wins: 14,
        draws: 13,
        losses: 13,
        goalsScored: 92,
        goalsConceded: 87,
        goalDifference: 5,
        points: 55,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 40,
        wins: 14,
        draws: 13,
        losses: 13,
        goalsScored: 87,
        goalsConceded: 97,
        goalDifference: -10,
        points: 55,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Borussia Mönchengladbach",
        logo: "/imgs/fifa/bmo.png",
        games: 40,
        wins: 16,
        draws: 5,
        losses: 19,
        goalsScored: 84,
        goalsConceded: 98,
        goalDifference: -14,
        points: 53,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Valencia",
        logo: "/imgs/fifa/val.png",
        games: 41,
        wins: 15,
        draws: 8,
        losses: 18,
        goalsScored: 95,
        goalsConceded: 98,
        goalDifference: -3,
        points: 53,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Leicester City",
        logo: "/imgs/fifa/lei.png",
        games: 43,
        wins: 14,
        draws: 11,
        losses: 18,
        goalsScored: 101,
        goalsConceded: 113,
        goalDifference: -12,
        points: 53,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 42,
        wins: 14,
        draws: 10,
        losses: 18,
        goalsScored: 91,
        goalsConceded: 88,
        goalDifference: 3,
        points: 52,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Bayer Leverkusen",
        logo: "/imgs/fifa/lev.png",
        games: 44,
        wins: 13,
        draws: 12,
        losses: 19,
        goalsScored: 108,
        goalsConceded: 125,
        goalDifference: -17,
        points: 51,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Olympique Lyon",
        logo: "/imgs/fifa/lyo.png",
        games: 41,
        wins: 14,
        draws: 8,
        losses: 19,
        goalsScored: 92,
        goalsConceded: 97,
        goalDifference: -5,
        points: 50,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Ajax",
        logo: "/imgs/fifa/aja.png",
        games: 40,
        wins: 12,
        draws: 10,
        losses: 18,
        goalsScored: 74,
        goalsConceded: 105,
        goalDifference: -31,
        points: 46,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Crystal Palace",
        logo: "/imgs/fifa/cry.png",
        games: 40,
        wins: 12,
        draws: 9,
        losses: 19,
        goalsScored: 75,
        goalsConceded: 92,
        goalDifference: -17,
        points: 45,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "PSV",
        logo: "/imgs/fifa/psv.png",
        games: 41,
        wins: 11,
        draws: 9,
        losses: 21,
        goalsScored: 71,
        goalsConceded: 93,
        goalDifference: -22,
        points: 42,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Athletic Bilbao",
        logo: "/imgs/fifa/atb.png",
        games: 40,
        wins: 11,
        draws: 8,
        losses: 21,
        goalsScored: 74,
        goalsConceded: 111,
        goalDifference: -37,
        points: 41,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 40,
        wins: 10,
        draws: 11,
        losses: 19,
        goalsScored: 87,
        goalsConceded: 102,
        goalDifference: -15,
        points: 41,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "OGC Nice",
        logo: "/imgs/fifa/nic.png",
        games: 40,
        wins: 10,
        draws: 5,
        losses: 25,
        goalsScored: 74,
        goalsConceded: 115,
        goalDifference: -41,
        points: 35,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Marseille",
        logo: "/imgs/fifa/mar.png",
        games: 40,
        wins: 7,
        draws: 12,
        losses: 21,
        goalsScored: 62,
        goalsConceded: 89,
        goalDifference: -27,
        points: 33,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Sevilla",
        logo: "/imgs/fifa/sev.png",
        games: 39,
        wins: 6,
        draws: 13,
        losses: 20,
        goalsScored: 74,
        goalsConceded: 107,
        goalDifference: -33,
        points: 31,
        color: PLAYER_COLORS.Panda,
      },
    ],
    highlights: [
      "The longest FIFA Night (22 matches) lasted 8 hours and 18 minutes",
      "Choco was the first to score a goal with a goalkeeper (Atletico Madrid)",
      "Vanilla was the first to score a goal (into an empty net) from its own half (Napoli)",
    ],
  },
  "2016/17": {
    standings: [
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 40,
        wins: 26,
        draws: 4,
        losses: 10,
        goalsScored: 100,
        goalsConceded: 61,
        goalDifference: 39,
        points: 82,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 40,
        wins: 23,
        draws: 7,
        losses: 10,
        goalsScored: 104,
        goalsConceded: 67,
        goalDifference: 37,
        points: 76,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 40,
        wins: 23,
        draws: 6,
        losses: 11,
        goalsScored: 102,
        goalsConceded: 73,
        goalDifference: 29,
        points: 75,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 40,
        wins: 22,
        draws: 8,
        losses: 10,
        goalsScored: 121,
        goalsConceded: 92,
        goalDifference: 29,
        points: 74,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 40,
        wins: 19,
        draws: 14,
        losses: 7,
        goalsScored: 105,
        goalsConceded: 67,
        goalDifference: 38,
        points: 71,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 40,
        wins: 19,
        draws: 8,
        losses: 13,
        goalsScored: 106,
        goalsConceded: 83,
        goalDifference: 23,
        points: 65,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "SS Lazio",
        logo: "/imgs/fifa/laz.png",
        games: 40,
        wins: 19,
        draws: 8,
        losses: 13,
        goalsScored: 88,
        goalsConceded: 93,
        goalDifference: -5,
        points: 65,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 40,
        wins: 17,
        draws: 13,
        losses: 10,
        goalsScored: 98,
        goalsConceded: 84,
        goalDifference: 14,
        points: 64,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Milan",
        logo: "/imgs/fifa/mil.png",
        games: 40,
        wins: 18,
        draws: 6,
        losses: 16,
        goalsScored: 93,
        goalsConceded: 86,
        goalDifference: 7,
        points: 60,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Bayer Leverkusen",
        logo: "/imgs/fifa/lev.png",
        games: 40,
        wins: 18,
        draws: 6,
        losses: 16,
        goalsScored: 98,
        goalsConceded: 98,
        goalDifference: 0,
        points: 60,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 40,
        wins: 16,
        draws: 12,
        losses: 12,
        goalsScored: 92,
        goalsConceded: 80,
        goalDifference: 12,
        points: 60,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 40,
        wins: 16,
        draws: 11,
        losses: 13,
        goalsScored: 95,
        goalsConceded: 90,
        goalDifference: 5,
        points: 59,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Tottenham",
        logo: "/imgs/fifa/tot.png",
        games: 40,
        wins: 16,
        draws: 8,
        losses: 16,
        goalsScored: 91,
        goalsConceded: 84,
        goalDifference: 7,
        points: 56,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Everton",
        logo: "/imgs/fifa/eve.png",
        games: 40,
        wins: 16,
        draws: 7,
        losses: 17,
        goalsScored: 88,
        goalsConceded: 102,
        goalDifference: -14,
        points: 55,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Zenit",
        logo: "/imgs/fifa/zen.png",
        games: 40,
        wins: 16,
        draws: 7,
        losses: 17,
        goalsScored: 81,
        goalsConceded: 96,
        goalDifference: -15,
        points: 55,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Benfica",
        logo: "/imgs/fifa/ben.png",
        games: 40,
        wins: 15,
        draws: 10,
        losses: 15,
        goalsScored: 92,
        goalsConceded: 89,
        goalDifference: 3,
        points: 55,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "AS Roma",
        logo: "/imgs/fifa/rom.png",
        games: 40,
        wins: 16,
        draws: 6,
        losses: 18,
        goalsScored: 94,
        goalsConceded: 96,
        goalDifference: -2,
        points: 54,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Athletic Bilbao",
        logo: "/imgs/fifa/atb.png",
        games: 40,
        wins: 14,
        draws: 11,
        losses: 15,
        goalsScored: 94,
        goalsConceded: 84,
        goalDifference: 10,
        points: 53,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Fenerbahçe",
        logo: "/imgs/fifa/fen.png",
        games: 40,
        wins: 15,
        draws: 5,
        losses: 20,
        goalsScored: 80,
        goalsConceded: 90,
        goalDifference: -10,
        points: 50,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "CSKA",
        logo: "/imgs/fifa/csk.png",
        games: 40,
        wins: 14,
        draws: 8,
        losses: 18,
        goalsScored: 93,
        goalsConceded: 103,
        goalDifference: -10,
        points: 50,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 40,
        wins: 14,
        draws: 8,
        losses: 18,
        goalsScored: 57,
        goalsConceded: 95,
        goalDifference: -38,
        points: 50,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 40,
        wins: 13,
        draws: 11,
        losses: 16,
        goalsScored: 83,
        goalsConceded: 77,
        goalDifference: 6,
        points: 50,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Porto",
        logo: "/imgs/fifa/por.png",
        games: 40,
        wins: 14,
        draws: 7,
        losses: 19,
        goalsScored: 78,
        goalsConceded: 90,
        goalDifference: -12,
        points: 49,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 40,
        wins: 14,
        draws: 6,
        losses: 20,
        goalsScored: 99,
        goalsConceded: 98,
        goalDifference: 1,
        points: 48,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 40,
        wins: 12,
        draws: 11,
        losses: 17,
        goalsScored: 93,
        goalsConceded: 93,
        goalDifference: 0,
        points: 47,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Valencia",
        logo: "/imgs/fifa/val.png",
        games: 40,
        wins: 13,
        draws: 6,
        losses: 21,
        goalsScored: 83,
        goalsConceded: 102,
        goalDifference: -19,
        points: 45,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Galatasaray",
        logo: "/imgs/fifa/gal.png",
        games: 40,
        wins: 11,
        draws: 9,
        losses: 20,
        goalsScored: 86,
        goalsConceded: 113,
        goalDifference: -27,
        points: 42,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 40,
        wins: 12,
        draws: 5,
        losses: 23,
        goalsScored: 82,
        goalsConceded: 103,
        goalDifference: -21,
        points: 41,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Sevilla",
        logo: "/imgs/fifa/sev.png",
        games: 40,
        wins: 9,
        draws: 10,
        losses: 21,
        goalsScored: 63,
        goalsConceded: 105,
        goalDifference: -42,
        points: 37,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Shakhtar",
        logo: "/imgs/fifa/sha.png",
        games: 40,
        wins: 9,
        draws: 8,
        losses: 23,
        goalsScored: 71,
        goalsConceded: 116,
        goalDifference: -45,
        points: 35,
        color: PLAYER_COLORS.Choco,
      },
    ],
  },
  "2015/16": {
    standings: [
      {
        team: "PSG",
        logo: "/imgs/fifa/psg.png",
        games: 32,
        wins: 18,
        draws: 5,
        losses: 9,
        goalsScored: 88,
        goalsConceded: 70,
        goalDifference: 18,
        points: 59,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Manchester City",
        logo: "/imgs/fifa/mci.png",
        games: 32,
        wins: 18,
        draws: 4,
        losses: 10,
        goalsScored: 94,
        goalsConceded: 81,
        goalDifference: 13,
        points: 58,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Liverpool",
        logo: "/imgs/fifa/liv.png",
        games: 32,
        wins: 16,
        draws: 8,
        losses: 8,
        goalsScored: 87,
        goalsConceded: 67,
        goalDifference: 20,
        points: 56,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Juventus",
        logo: "/imgs/fifa/juv.png",
        games: 32,
        wins: 17,
        draws: 5,
        losses: 10,
        goalsScored: 79,
        goalsConceded: 68,
        goalDifference: 11,
        points: 56,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Shakhtar",
        logo: "/imgs/fifa/sha.png",
        games: 32,
        wins: 14,
        draws: 11,
        losses: 7,
        goalsScored: 85,
        goalsConceded: 81,
        goalDifference: 4,
        points: 53,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Napoli",
        logo: "/imgs/fifa/nap.png",
        games: 32,
        wins: 16,
        draws: 5,
        losses: 11,
        goalsScored: 66,
        goalsConceded: 61,
        goalDifference: 5,
        points: 53,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Inter",
        logo: "/imgs/fifa/int.png",
        games: 32,
        wins: 15,
        draws: 7,
        losses: 10,
        goalsScored: 74,
        goalsConceded: 54,
        goalDifference: 20,
        points: 52,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Bayern Munich",
        logo: "/imgs/fifa/bay.png",
        games: 32,
        wins: 15,
        draws: 7,
        losses: 10,
        goalsScored: 57,
        goalsConceded: 37,
        goalDifference: 20,
        points: 52,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Atletico Madrid",
        logo: "/imgs/fifa/atm.png",
        games: 32,
        wins: 16,
        draws: 4,
        losses: 12,
        goalsScored: 76,
        goalsConceded: 72,
        goalDifference: 4,
        points: 52,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Everton",
        logo: "/imgs/fifa/eve.png",
        games: 32,
        wins: 14,
        draws: 9,
        losses: 9,
        goalsScored: 68,
        goalsConceded: 69,
        goalDifference: -1,
        points: 51,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Porto",
        logo: "/imgs/fifa/por.png",
        games: 32,
        wins: 12,
        draws: 9,
        losses: 11,
        goalsScored: 82,
        goalsConceded: 77,
        goalDifference: 5,
        points: 45,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Borussia Dortmund",
        logo: "/imgs/fifa/bor.png",
        games: 32,
        wins: 11,
        draws: 11,
        losses: 10,
        goalsScored: 75,
        goalsConceded: 61,
        goalDifference: 14,
        points: 44,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "AS Roma",
        logo: "/imgs/fifa/rom.png",
        games: 32,
        wins: 10,
        draws: 11,
        losses: 11,
        goalsScored: 65,
        goalsConceded: 64,
        goalDifference: 1,
        points: 41,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Barcelona",
        logo: "/imgs/fifa/bar.png",
        games: 32,
        wins: 11,
        draws: 8,
        losses: 13,
        goalsScored: 91,
        goalsConceded: 101,
        goalDifference: -10,
        points: 41,
        color: PLAYER_COLORS.Panda,
      },
      {
        team: "Manchester United",
        logo: "/imgs/fifa/mu.png",
        games: 32,
        wins: 10,
        draws: 9,
        losses: 13,
        goalsScored: 80,
        goalsConceded: 73,
        goalDifference: 7,
        points: 39,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "CSKA",
        logo: "/imgs/fifa/csk.png",
        games: 32,
        wins: 9,
        draws: 12,
        losses: 11,
        goalsScored: 66,
        goalsConceded: 73,
        goalDifference: -7,
        points: 39,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Valencia",
        logo: "/imgs/fifa/val.png",
        games: 32,
        wins: 12,
        draws: 3,
        losses: 17,
        goalsScored: 63,
        goalsConceded: 73,
        goalDifference: -10,
        points: 39,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Real Madrid",
        logo: "/imgs/fifa/rm.png",
        games: 32,
        wins: 9,
        draws: 11,
        losses: 12,
        goalsScored: 79,
        goalsConceded: 81,
        goalDifference: -2,
        points: 38,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Arsenal",
        logo: "/imgs/fifa/ars.png",
        games: 32,
        wins: 10,
        draws: 8,
        losses: 14,
        goalsScored: 70,
        goalsConceded: 77,
        goalDifference: -7,
        points: 38,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Wolfsburg",
        logo: "/imgs/fifa/wfs.png",
        games: 32,
        wins: 8,
        draws: 12,
        losses: 12,
        goalsScored: 53,
        goalsConceded: 61,
        goalDifference: -8,
        points: 36,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Milan",
        logo: "/imgs/fifa/mil.png",
        games: 32,
        wins: 9,
        draws: 9,
        losses: 14,
        goalsScored: 67,
        goalsConceded: 90,
        goalDifference: -23,
        points: 36,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Zenit",
        logo: "/imgs/fifa/zen.png",
        games: 32,
        wins: 9,
        draws: 7,
        losses: 16,
        goalsScored: 62,
        goalsConceded: 83,
        goalDifference: -21,
        points: 34,
        color: PLAYER_COLORS.Vanilla,
      },
      {
        team: "Chelsea",
        logo: "/imgs/fifa/che.png",
        games: 32,
        wins: 9,
        draws: 6,
        losses: 17,
        goalsScored: 57,
        goalsConceded: 69,
        goalDifference: -12,
        points: 33,
        color: PLAYER_COLORS.Choco,
      },
      {
        team: "Schalke 04",
        logo: "/imgs/fifa/sch.png",
        games: 32,
        wins: 3,
        draws: 9,
        losses: 20,
        goalsScored: 44,
        goalsConceded: 85,
        goalDifference: -41,
        points: 18,
        color: PLAYER_COLORS.Vanilla,
      },
    ],
    highlights: ["The smallest gap between 1st and 2nd place"],
  },
}

// Helper function to get team color (as fallback)
const getTeamColor = (team: string) => {
  const teamColors = {
    red: [
      "Liverpool",
      "Bayern Munich",
      "Inter",
      "Bayer Leverkusen",
      "Newcastle",
      "AS Roma",
      "Galatasaray",
      "Sporting CP",
      "SS Lazio",
      "AS Monaco",
    ],
    blue: [
      "Chelsea",
      "Manchester City",
      "Barcelona",
      "Tottenham",
      "Milan",
      "Aston Villa",
      "Athletic Bilbao",
      "Manchester United",
      "Benfica",
      "Olympique Lyonnais",
    ],
    green: [
      "Juventus",
      "Real Madrid",
      "Arsenal",
      "Borussia Dortmund",
      "PSG",
      "Atletico Madrid",
      "Napoli",
      "RB Leipzig",
      "Fenerbahçe",
      "Al Hilal",
    ],
  }

  if (teamColors.red.includes(team)) return PLAYER_COLORS.Vanilla
  if (teamColors.blue.includes(team)) return PLAYER_COLORS.Choco
  if (teamColors.green.includes(team)) return PLAYER_COLORS.Panda
  return "transparent"
}

interface PlayerTeams {
  Vanilla: string[]
  Choco: string[]
  Panda: string[]
}

interface MatchRecord {
  id: number
  teamA: string
  scoreA: number
  teamB: string
  scoreB: number
  prediction?: string | null
  createdAt: string
}

type FifaSeasonTabsProps = {
  currentSeasonData: any[]
  currentSeasonHighlights: any[]
  historicalSeasonData: any[]
  historicalSeasonHighlights: any[]
  columns: any[]
  teamNames: string[]
  playerTeams: PlayerTeams
  historicalPlayerTeams: PlayerTeams
  matches: MatchRecord[]
  teamLogos: Record<string, string>
  currentRawEntries: any[]
  historicalRawEntries: any[]
}

export default function FifaSeasonTabs({
  currentSeasonData,
  currentSeasonHighlights,
  historicalSeasonData,
  historicalSeasonHighlights,
  columns,
  teamNames,
  playerTeams: initialPlayerTeams,
  historicalPlayerTeams,
  matches: initialMatches,
  teamLogos,
  currentRawEntries,
  historicalRawEntries,
}: FifaSeasonTabsProps) {
  const [activeSeason, setActiveSeason]   = useState<Season>(seasons[0])
  const [dialogOpen, setDialogOpen]       = useState(false)
  const [configOpen, setConfigOpen]       = useState(false)
  const [showToast, setShowToast]         = useState(false)
  const [playerTeams, setPlayerTeams]     = useState<PlayerTeams>(initialPlayerTeams)
  const [matches, setMatches]             = useState<MatchRecord[]>(initialMatches)
  const [resultsSearch, setResultsSearch] = useState("")
  const [analyticsOpen, setAnalyticsOpen] = useState(true)
  const router = useRouter()

  const handleMatchSuccess = async () => {
    // Refresh matches from server
    const res = await fetch("/api/fifa-matches?season=2025/26")
    if (res.ok) setMatches(await res.json())
    router.refresh()
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleConfigSaved = async () => {
    const res = await fetch("/api/fifa-season-config?season=2025/26")
    if (res.ok) setPlayerTeams(await res.json())
    router.refresh()
  }

  // All Time columns
  const allTimeColumns = [
    { header: "#", accessor: "position" },
    { header: "Team", accessor: "team" },
    { header: "G", accessor: "games" },
    { header: "W", accessor: "wins" },
    { header: "D", accessor: "draws" },
    { header: "L", accessor: "losses" },
    { header: "GS", accessor: "goalsScored" },
    { header: "GC", accessor: "goalsConceded" },
    { header: "GD", accessor: "goalDifference" },
    { header: "P", accessor: "points" },
    { header: "W%", accessor: "winPercentage" },
  ]

  const allTimePlayerColumns = [
    { header: "#", accessor: "position" },
    { header: "Player", accessor: "player" },
    { header: "G", accessor: "games" },
    { header: "W", accessor: "wins" },
    { header: "D", accessor: "draws" },
    { header: "L", accessor: "losses" },
    { header: "GS", accessor: "goalsScored" },
    { header: "GC", accessor: "goalsConceded" },
    { header: "GD", accessor: "goalDifference" },
    { header: "P", accessor: "points" },
    { header: "W%", accessor: "winPercentage" },
  ]

  // Compute All Time standings by player
  const computeAllTimePlayerStandings = () => {
    const totals: Record<string, { games: number; wins: number; draws: number; losses: number; goalsScored: number; goalsConceded: number; hoverColor: string }> = {}

    const ensurePlayer = (name: string) => {
      if (!totals[name]) {
        totals[name] = { games: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, hoverColor: PLAYER_COLORS[name] ?? "#cccccc" }
      }
    }

    // 2025/26 — use playerTeams state
    for (const [playerName, teams] of Object.entries(playerTeams)) {
      ensurePlayer(playerName)
      for (const entry of currentRawEntries) {
        if ((teams as string[]).includes(entry.team)) {
          totals[playerName].games += entry.games ?? 0
          totals[playerName].wins += entry.wins ?? 0
          totals[playerName].draws += entry.draws ?? 0
          totals[playerName].losses += entry.losses ?? 0
          totals[playerName].goalsScored += entry.goalsScored ?? 0
          totals[playerName].goalsConceded += entry.goalsConceded ?? 0
        }
      }
    }

    // 2024/25 — use historicalPlayerTeams prop
    for (const [playerName, teams] of Object.entries(historicalPlayerTeams)) {
      ensurePlayer(playerName)
      for (const entry of historicalRawEntries) {
        if ((teams as string[]).includes(entry.team)) {
          totals[playerName].games += entry.games ?? 0
          totals[playerName].wins += entry.wins ?? 0
          totals[playerName].draws += entry.draws ?? 0
          totals[playerName].losses += entry.losses ?? 0
          totals[playerName].goalsScored += entry.goalsScored ?? 0
          totals[playerName].goalsConceded += entry.goalsConceded ?? 0
        }
      }
    }

    // Past seasons — reverse-map team color → player name
    for (const seasonKey of Object.keys(pastSeasonsData)) {
      const sd = pastSeasonsData[seasonKey as keyof typeof pastSeasonsData]
      if (!sd) continue
      for (const entry of sd.standings) {
        const playerName = Object.entries(PLAYER_COLORS).find(([, c]) => c === entry.color)?.[0]
        if (!playerName) continue
        ensurePlayer(playerName)
        totals[playerName].games += entry.games
        totals[playerName].wins += entry.wins
        totals[playerName].draws += entry.draws
        totals[playerName].losses += entry.losses
        totals[playerName].goalsScored += entry.goalsScored
        totals[playerName].goalsConceded += entry.goalsConceded
      }
    }

    const sorted = Object.entries(totals)
      .map(([name, data]) => ({
        name,
        ...data,
        points: data.wins * 3 + data.draws,
        goalDifference: data.goalsScored - data.goalsConceded,
      }))
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)

    return sorted.map((entry, index) => ({
      position: index + 1,
      player: (
        <span className="relative">
          {entry.name}
          <span className="absolute bottom-[-4px] left-0 w-[0.85em] h-[2px]" style={{ backgroundColor: entry.hoverColor }} />
        </span>
      ),
      games: entry.games,
      wins: entry.wins,
      draws: entry.draws,
      losses: entry.losses,
      goalsScored: entry.goalsScored,
      goalsConceded: entry.goalsConceded,
      goalDifference: entry.goalDifference,
      points: entry.points,
      winPercentage: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : "0%",
      hoverColor: entry.hoverColor,
    }))
  }

  // Normalize team names to canonical form (fixes DB typos vs static data mismatches)
  const normalizeTeamName = (name: string): string => {
    const map: Record<string, string> = {
      "Nottingham Forrest": "Nottingham Forest",
      "Olympique Lyonnais": "Olympique Lyon",
      "SL Benfica": "Benfica",
      "S.L. Benfica": "Benfica",
      "S.S. Lazio": "SS Lazio",
      "Lazio": "SS Lazio",
      "A.S. Roma": "AS Roma",
      "Roma": "AS Roma",
      "AC Milan": "Milan",
      "Monaco": "AS Monaco",
      "Atlectic Bilbao": "Athletic Bilbao",
      "Atletic Bilbao": "Athletic Bilbao",
      "Sevillia": "Sevilla",
      "Lille OSC": "Lille",
      "Leicester": "Leicester City",
      "Real Sosiedad": "Real Sociedad",
      "Borussia Monhengladbah": "Borussia Mönchengladbach",
      "Feyenord": "Feyenoord",
      "River PLate": "River Plate",
    }
    return map[name] ?? name
  }

  // Helper: aggregate all-time totals from a given set of current-season entries
  const computeAllTimeTotals = (overrideCurrentEntries: any[]) => {
    const totals: Record<string, { games: number; wins: number; draws: number; losses: number; goalsScored: number; goalsConceded: number; logo: string; color: string }> = {}

    const ensureTeam = (team: string, logo: string, color: string) => {
      if (!totals[team]) {
        totals[team] = { games: 0, wins: 0, draws: 0, losses: 0, goalsScored: 0, goalsConceded: 0, logo, color }
      }
    }

    for (const entry of overrideCurrentEntries) {
      const team = normalizeTeamName(entry.team)
      ensureTeam(team, entry.logo || "/placeholder.svg", getTeamColor(team))
      totals[team].games += entry.games ?? 0
      totals[team].wins += entry.wins ?? 0
      totals[team].draws += entry.draws ?? 0
      totals[team].losses += entry.losses ?? 0
      totals[team].goalsScored += entry.goalsScored ?? 0
      totals[team].goalsConceded += entry.goalsConceded ?? 0
    }

    for (const entry of historicalRawEntries) {
      const team = normalizeTeamName(entry.team)
      ensureTeam(team, entry.logo || "/placeholder.svg", getTeamColor(team))
      totals[team].games += entry.games ?? 0
      totals[team].wins += entry.wins ?? 0
      totals[team].draws += entry.draws ?? 0
      totals[team].losses += entry.losses ?? 0
      totals[team].goalsScored += entry.goalsScored ?? 0
      totals[team].goalsConceded += entry.goalsConceded ?? 0
    }

    for (const seasonKey of Object.keys(pastSeasonsData)) {
      const sd = pastSeasonsData[seasonKey as keyof typeof pastSeasonsData]
      if (!sd) continue
      for (const entry of sd.standings) {
        const team = normalizeTeamName(entry.team)
        ensureTeam(team, entry.logo, entry.color || getTeamColor(team))
        totals[team].games += entry.games
        totals[team].wins += entry.wins
        totals[team].draws += entry.draws
        totals[team].losses += entry.losses
        totals[team].goalsScored += entry.goalsScored
        totals[team].goalsConceded += entry.goalsConceded
      }
    }

    return Object.entries(totals)
      .map(([teamName, data]) => ({
        teamName,
        ...data,
        points: data.wins * 3 + data.draws,
        goalDifference: data.goalsScored - data.goalsConceded,
      }))
      .sort((a, b) => b.points - a.points || b.goalDifference - a.goalDifference)
  }

  // Compute All Time standings aggregated across all seasons
  const computeAllTimeStandings = () => {
    const currentSorted = computeAllTimeTotals(currentRawEntries)

    // Compute previous ranking by undoing the last match from currentRawEntries
    let prevRanks: Record<string, number> = {}
    if (matches.length > 0) {
      const lastMatch = matches[0]
      const prevCurrentEntries = currentRawEntries.map((e: any) => {
        if (e.team !== lastMatch.teamA && e.team !== lastMatch.teamB) return e
        const isA = e.team === lastMatch.teamA
        const scored = isA ? lastMatch.scoreA : lastMatch.scoreB
        const conceded = isA ? lastMatch.scoreB : lastMatch.scoreA
        return {
          ...e,
          games: (e.games ?? 0) - 1,
          wins: (e.wins ?? 0) - (scored > conceded ? 1 : 0),
          draws: (e.draws ?? 0) - (scored === conceded ? 1 : 0),
          losses: (e.losses ?? 0) - (scored < conceded ? 1 : 0),
          goalsScored: (e.goalsScored ?? 0) - scored,
          goalsConceded: (e.goalsConceded ?? 0) - conceded,
        }
      })
      const prevSorted = computeAllTimeTotals(prevCurrentEntries)
      prevRanks = prevSorted.reduce((acc, e, i) => { acc[e.teamName] = i + 1; return acc }, {} as Record<string, number>)
    }

    return currentSorted.map((entry, index) => {
      const currentRank = index + 1
      const prevRank = prevRanks[entry.teamName] ?? currentRank
      const mv = prevRank - currentRank
      return {
        position: mv > 0
          ? <span className="flex items-center gap-1">{currentRank}<span className="text-green-500 text-xs leading-none">↑</span></span>
          : mv < 0
          ? <span className="flex items-center gap-1">{currentRank}<span className="text-red-400 text-xs leading-none">↓</span></span>
          : currentRank,
        team: (
          <div className="flex items-center space-x-2">
            <Image
              src={entry.logo || "/placeholder.svg"}
              alt={entry.teamName}
              width={24}
              height={24}
              className="rounded-full"
            />
            <span>{entry.teamName}</span>
          </div>
        ),
        games: entry.games,
        wins: entry.wins,
        draws: entry.draws,
        losses: entry.losses,
        goalsScored: entry.goalsScored,
        goalsConceded: entry.goalsConceded,
        goalDifference: entry.goalDifference,
        points: entry.points,
        winPercentage: entry.games > 0 ? `${((entry.wins / entry.games) * 100).toFixed(1)}%` : "0%",
        hoverColor: "#e5e7eb",
      }
    })
  }

  // Process past season data for display
  const getPastSeasonTableData = (season: Season) => {
    if (!pastSeasonsData[season as keyof typeof pastSeasonsData]) {
      return []
    }

    return pastSeasonsData[season as keyof typeof pastSeasonsData].standings.map((entry, index) => {
      const teamName = normalizeTeamName(entry.team)
      return {
      position: index + 1,
      team: (
        <div className="flex items-center space-x-2">
          <Image
            src={entry.logo || "/imgs/fifa/new.png"}
            alt={teamName}
            width={24}
            height={24}
            className="rounded-full"
          />
          <span className="relative">
            {teamName}
            <span
              className="absolute bottom-0 left-0 w-[0.85em] h-[2px]"
              style={{ backgroundColor: entry.color || getTeamColor(entry.team) }}
            />
          </span>
        </div>
      ),
      games: entry.games,
      wins: entry.wins,
      draws: entry.draws,
      losses: entry.losses,
      goalsScored: entry.goalsScored,
      goalsConceded: entry.goalsConceded,
      goalDifference: entry.goalDifference,
      points: entry.points,
      hoverColor: entry.color || getTeamColor(entry.team),
      className: index === 0 ? "bg-amber-50" : undefined,
    }})
  }

  // Render content based on active tab
  const renderContent = () => {
    if (activeSeason === "2025/26") {
      // For the current season (2025/26), use the live data from fifaEntry
      return (
        <>
          <div className="flex flex-col lg:flex-row justify-between gap-6">
            {/* Standings column */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4 h-9">
                <h2 className="text-title font-bold leading-none m-0">Standings</h2>
                {/* Desktop: gear icon */}
                <button
                  onClick={() => setConfigOpen(true)}
                  className="hidden md:block text-gray-500 hover:text-gray-700 transition-colors leading-none"
                  style={{ fontSize: "1.75rem" }}
                  title="Configure player teams"
                >
                  ⚙
                </button>
                {/* Mobile: Add Game button */}
                <button
                  onClick={() => setDialogOpen(true)}
                  className="flex md:hidden items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors border border-transparent whitespace-nowrap"
                >
                  <span className="text-base leading-none">+</span> Add Game
                </button>
              </div>
              <div className="fifa-standings-table">
                <DataTable columns={columns} data={currentSeasonData} />
              </div>
            </div>

            {/* Results column */}
            <div className="w-full lg:shrink-0 lg:w-[480px]">
              <div className="flex items-center justify-between mb-4 h-9">
                <h2 className="text-title font-bold leading-none m-0">Results</h2>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Search by team"
                    value={resultsSearch}
                    onChange={(e) => setResultsSearch(e.target.value)}
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-300 placeholder:italic"
                  />
                  <button
                    onClick={() => setDialogOpen(true)}
                    className="hidden md:flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors border border-transparent whitespace-nowrap"
                  >
                    <span className="text-base leading-none">+</span> Add Game
                  </button>
                </div>
              </div>
              <div className="fifa-standings-table">
                <FifaMatchResults
                  matches={resultsSearch ? matches.filter(m => m.teamA.toLowerCase().includes(resultsSearch.toLowerCase()) || m.teamB.toLowerCase().includes(resultsSearch.toLowerCase())) : matches}
                  playerTeams={playerTeams}
                  teamLogos={teamLogos}
                />
              </div>
            </div>
          </div>

          <section className="mt-12">
            <button
              onClick={() => setAnalyticsOpen((v) => !v)}
              className="flex items-center gap-2 w-full text-left mb-6"
            >
              <h2 className="text-title font-bold">Insights</h2>
              <span className="text-gray-400 text-sm">{analyticsOpen ? "▲" : "▼"}</span>
            </button>
            {analyticsOpen && <FifaAdvancedAnalytics matches={matches} playerTeams={playerTeams} teamLogos={teamLogos} />}
          </section>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="">
              <VideoCarousel videos={currentSeasonHighlights} />
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "2024/25") {
      // For the 2024/25 season, use the historical data from fifaEntry2024
      const columnsWithoutForm = columns.filter((c: any) => c.accessor !== "form")
      return (
        <>
          <div className="fifa-standings-table">
            <DataTable columns={columnsWithoutForm} data={historicalSeasonData} />
          </div>

          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">Highlights</h2>
            <div className="">
              <VideoCarousel videos={historicalSeasonHighlights} />
            </div>
          </section>
        </>
      )
    } else if (activeSeason === "All Time") {
      const allTimeData = computeAllTimeStandings()
      const allTimePlayerData = computeAllTimePlayerStandings()
      return (
        <>
          <h2 className="text-title font-bold mb-6">All Time Standings</h2>
          <div className="fifa-standings-table">
            <DataTable columns={allTimeColumns} data={allTimeData} sortable />
          </div>
          <section className="mt-12">
            <h2 className="text-title font-bold mb-6">All Time by Player</h2>
            <div className="fifa-standings-table">
              <DataTable columns={allTimePlayerColumns} data={allTimePlayerData} />
            </div>
          </section>
        </>
      )
    } else {
      // For past seasons (2023/24 and earlier), use static data
      const pastSeasonData = getPastSeasonTableData(activeSeason)
      const seasonData = pastSeasonsData[activeSeason as keyof typeof pastSeasonsData]
      const seasonDescription = seasonData && "description" in seasonData ? seasonData.description : undefined
      const seasonHighlights = seasonData && "highlights" in seasonData ? seasonData.highlights : undefined
      const columnsWithoutForm = columns.filter((c: any) => c.accessor !== "form")

      return (
        <>
          {seasonDescription && <p className="text-basic text-gray-600 mb-8">{seasonDescription}</p>}

          <div className="fifa-standings-table">
            {pastSeasonData.length > 0 ? (
              <DataTable columns={columnsWithoutForm} data={pastSeasonData} />
            ) : (
              <p className="text-gray-500 italic py-4">No data available for {activeSeason} season.</p>
            )}
          </div>

          {seasonHighlights && seasonHighlights.length > 0 && (
            <section className="mt-12">
              <h2 className="text-title font-bold mb-6">Highlights</h2>
              <div className="flex flex-wrap gap-3">
                {seasonHighlights.map((highlight, index) => (
                  <div
                    key={index}
                    className="inline-block bg-amber-50 text-amber-800 px-4 py-2 rounded-full text-sm font-medium border border-amber-100"
                  >
                    {highlight}
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )
    }
  }

  return (
    <>
      {/* Season tabs */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {seasons.map((season) => (
              <button
                key={season}
                onClick={() => setActiveSeason(season)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeSeason === season
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {season}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {activeSeason !== "2025/26" && activeSeason !== "All Time" && (
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-title font-bold">Standings</h2>
        </div>
      )}

      {dialogOpen && (
        <AddMatchDialog
          teams={teamNames}
          playerTeams={playerTeams}
          playedMatches={matches}
          onSuccess={handleMatchSuccess}
          onClose={() => setDialogOpen(false)}
        />
      )}

      {configOpen && (
        <FifaSeasonConfig
          season="2025/26"
          initialPlayerTeams={playerTeams}
          allTeams={teamNames}
          onClose={() => setConfigOpen(false)}
          onSaved={handleConfigSaved}
        />
      )}

      {showToast && (
        <div className="fixed top-16 right-4 z-50 bg-green-600 text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg">
          Match added ✓
        </div>
      )}

      {/* Render content based on active tab */}
      {renderContent()}
    </>
  )
}
