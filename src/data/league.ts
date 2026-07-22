// Bu dosyadaki veriler, Pozitif Lig'in Instagram hesabından alınan paylaşımlara
// dayanarak elle girilmiştir. Gerçek zamanlı / canlı veri kaynağı bağlandığında
// bu dosyanın yerini bir API entegrasyonu alabilir.

export type Champion = {
  team: string;
  teamId?: number;
  league: string;
  season: string;
  score: string;
  date: string;
};

export const champions: Champion[] = [
  {
    team: "Anka Sürücü Kursu",
    teamId: 1218957,
    league: "Kuzey Ligi",
    season: "2025/26",
    score: "2-0",
    date: "22 Temmuz 2026",
  },
  {
    team: "Balspor",
    league: "Güney Ligi",
    season: "2025/26",
    score: "2-0",
    date: "3 Temmuz 2026",
  },
  {
    team: "Zile Spor FK",
    league: "Kapanış Sezonu",
    season: "2025/26",
    score: "Penaltılarla",
    date: "11 Temmuz 2026",
  },
];

export type StatLeader = {
  name: string;
  team?: string;
  playerId?: number;
  value: number;
};

export const golKrallari: StatLeader[] = [
  { name: "Hilmi T. Ç.", value: 10 },
  { name: "Uğurcan Ünal", value: 9 },
  { name: "Kerem Karaca", value: 8 },
  { name: "Kerem B. Bıkıtaş", value: 8 },
  { name: "Bedirhan Birinci", value: 5 },
];

export const asistKrallari: StatLeader[] = [
  { name: "Erhan Demir", value: 7 },
  { name: "Halil Karasu", value: 5 },
  { name: "Bedirhan Birinci", value: 4 },
  { name: "Ümit Arslan", value: 3 },
  { name: "Samet Yıldız", value: 3 },
];

export type Match = {
  id: string;
  league: string;
  round: string;
  home: string;
  away: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time?: string;
  status: "played" | "upcoming";
};

export const matches: Match[] = [
  {
    id: "kuzey-final",
    league: "Kuzey Ligi",
    round: "Final",
    home: "Anka Sürücü Kursu",
    away: "Deprem City",
    homeTeamId: 1218957,
    awayTeamId: 1217423,
    homeScore: 2,
    awayScore: 0,
    date: "22 Temmuz 2026",
    status: "played",
  },
  {
    id: "kuzey-yari-final-1",
    league: "Kuzey Ligi",
    round: "Yarı Final",
    home: "Anka Sürücü Kursu",
    away: "Anka FK",
    homeTeamId: 1218957,
    awayTeamId: 1217933,
    homeScore: 3,
    awayScore: 0,
    date: "Temmuz 2026",
    status: "played",
  },
  {
    id: "kuzey-yari-final-2",
    league: "Kuzey Ligi",
    round: "Yarı Final",
    home: "Deprem City",
    away: "Ota Boca Jrs.",
    homeTeamId: 1217423,
    homeScore: 4,
    awayScore: 1,
    date: "Temmuz 2026",
    status: "played",
  },
  {
    id: "guney-1-hafta",
    league: "Güney Ligi",
    round: "1. Hafta",
    home: "Tuşhan",
    away: "Parkköy",
    awayTeamId: 1176468,
    homeScore: 7,
    awayScore: 1,
    date: "2026",
    status: "played",
  },
];

export type PlayoffMatch = {
  round: string;
  home: string;
  away: string;
  homeTeamId?: number;
  awayTeamId?: number;
  homeScore: number;
  awayScore: number;
};

export const kuzeyPlayoff: PlayoffMatch[] = [
  {
    round: "Yarı Final",
    home: "Anka Sürücü Kursu",
    away: "Anka FK",
    homeTeamId: 1218957,
    awayTeamId: 1217933,
    homeScore: 3,
    awayScore: 0,
  },
  {
    round: "Yarı Final",
    home: "Deprem City",
    away: "Ota Boca Jrs.",
    homeTeamId: 1217423,
    homeScore: 4,
    awayScore: 1,
  },
  {
    round: "Final",
    home: "Anka Sürücü Kursu",
    away: "Deprem City",
    homeTeamId: 1218957,
    awayTeamId: 1217423,
    homeScore: 2,
    awayScore: 0,
  },
];

export const teams: string[] = [
  "Anka Sürücü Kursu",
  "Anka FK",
  "Zile Spor FK",
  "Balspor",
  "Tuşhan",
  "Parkköy",
  "Deprem City",
  "Ota Boca Jrs.",
];

export const standingsWidgets = [
  {
    id: "sofa-standings-embed-176335-98003",
    title: "Pozitiflig Güney, Grup B 2026",
    src: "https://widgets.sofascore.com/tr/embed/tournament/176335/season/98003/standings/Pozitiflig%20G%C3%BCney%2C%20Group%20B%202026?widgetTitle=Pozitiflig%20G%C3%BCney%2C%20Group%20B%202026&showCompetitionLogo=true",
    sofascoreUrl:
      "https://www.sofascore.com/tr/football/tournament/turkey-amateur/pozitiflig-guney-group-b/27221#id:98003",
    height: 923,
  },
  {
    id: "sofa-standings-embed-181845-93435",
    title: "Pozitiflig Kuzey 2026",
    src: "https://widgets.sofascore.com/tr/embed/tournament/181845/season/93435/standings/Round%20robin%202026?widgetTitle=Round%20robin%202026&showCompetitionLogo=true",
    sofascoreUrl:
      "https://www.sofascore.com/tr/football/tournament/turkey-amateur/round-robin/34326#id:93435",
    height: 723,
  },
];
