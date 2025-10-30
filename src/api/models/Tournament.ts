import { z } from 'zod';

// Tournament Schema
export const TournamentSchema = z.object({
  id: z.string(),
  title: z.string().optional(), // For backwards compatibility
  name: z.string().optional(), // Backend might use 'name'
  sport: z.string(),
  type: z.enum(['knockout', 'league', 'mixed']),
  status: z.enum(['registration', 'ongoing', 'completed', 'cancelled']).default('registration'),
  organizer: z.string().optional(), // For backwards compatibility
  organizerId: z.string().optional(), // Backend uses organizerId
  description: z.string().optional(),
  rules: z.string().optional(),
  prizePool: z.string().optional(),
  registrationWindow: z.object({
    start: z.string(),
    end: z.string(),
  }),
  startDate: z.string(),
  endDate: z.string().optional(),
  maxTeams: z.number().optional(),
  maxParticipants: z.number().optional(), // Alias for maxTeams
  minTeams: z.number().default(4),
  registeredTeams: z.array(z.string()).optional(), // For backwards compatibility
  teams: z.array(z.string()).optional(), // Backend uses 'teams'
  participants: z.array(z.string()).optional(), // Some screens expect 'participants'
  matches: z.array(z.string()).optional(),
  rounds: z.number().optional(),
  bracket: z.any().optional(),
  currentRound: z.number().optional(),
  winner: z.string().optional(),
  chatRoomId: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type Tournament = z.infer<typeof TournamentSchema>;

// Tournament Create Schema
export const TournamentCreateSchema = z.object({
  title: z.string().min(3).max(100),
  sport: z.string(),
  type: z.enum(['knockout', 'league', 'mixed']),
  description: z.string().max(1000).optional(),
  rules: z.string().optional(),
  prizePool: z.string().optional(),
  registrationWindow: z.object({
    start: z.string(),
    end: z.string(),
  }),
  startDate: z.string(),
  endDate: z.string().optional(),
  maxTeams: z.number().min(4).optional(),
  minTeams: z.number().min(2).default(4),
});

export type TournamentCreate = z.infer<typeof TournamentCreateSchema>;

// Tournament Update Schema
export const TournamentUpdateSchema = z.object({
  title: z.string().min(3).max(100).optional(),
  description: z.string().max(1000).optional(),
  rules: z.string().optional(),
  prizePool: z.string().optional(),
  registrationWindow: z
    .object({
      start: z.string(),
      end: z.string(),
    })
    .optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  maxTeams: z.number().min(4).optional(),
  status: z.enum(['registration', 'ongoing', 'completed', 'cancelled']).optional(),
  currentRound: z.number().optional(),
});

export type TournamentUpdate = z.infer<typeof TournamentUpdateSchema>;

// Tournament Register Schema
export const TournamentRegisterSchema = z.object({
  teamId: z.string(),
});

export type TournamentRegister = z.infer<typeof TournamentRegisterSchema>;

// Match Result Update Schema
export const MatchResultUpdateSchema = z.object({
  matchNumber: z.number(),
  result: z.object({
    teamAScore: z.number(),
    teamBScore: z.number(),
    winner: z.string().optional(),
  }),
});

export type MatchResultUpdate = z.infer<typeof MatchResultUpdateSchema>;

// Tournament Bracket Schemas
export const KnockoutMatchSchema = z.object({
  matchNumber: z.number(),
  round: z.number(),
  teamA: z.string().nullable().optional(), // For backwards compatibility
  teamB: z.string().nullable().optional(), // For backwards compatibility
  team1: z.string().nullable().optional(), // Backend uses team1
  team2: z.string().nullable().optional(), // Backend uses team2
  winner: z.string().nullable().optional(),
  score: z
    .union([
      z.object({
        teamA: z.number(),
        teamB: z.number(),
      }),
      z.object({
        team1: z.number(),
        team2: z.number(),
      }),
    ])
    .optional(),
  score1: z.number().optional(), // Some screens use score1/score2
  score2: z.number().optional(),
  scheduledAt: z.string().optional(),
  playedAt: z.string().optional(),
});

export const KnockoutRoundSchema = z.object({
  roundNumber: z.number(),
  name: z.string(),
  matches: z.array(KnockoutMatchSchema),
});

export const KnockoutBracketSchema = z.object({
  type: z.literal('knockout'),
  rounds: z.array(KnockoutRoundSchema),
});

export const LeagueMatchSchema = z.object({
  matchNumber: z.number(),
  round: z.number(),
  teamA: z.string(),
  teamB: z.string(),
  score: z
    .object({
      teamA: z.number(),
      teamB: z.number(),
    })
    .optional(),
  winner: z.string().nullable().optional(),
  scheduledAt: z.string().optional(),
  playedAt: z.string().optional(),
});

export const LeagueStandingSchema = z.object({
  teamId: z.string(),
  played: z.number(),
  won: z.number(),
  drawn: z.number(),
  lost: z.number(),
  goalsFor: z.number(),
  goalsAgainst: z.number(),
  goalDifference: z.number(),
  points: z.number(),
});

export const LeagueRoundSchema = z.object({
  roundNumber: z.number(),
  matches: z.array(LeagueMatchSchema),
});

export const LeagueBracketSchema = z.object({
  type: z.literal('league'),
  rounds: z.array(LeagueRoundSchema),
  standings: z.array(LeagueStandingSchema),
});

export const TournamentBracketSchema = z.union([KnockoutBracketSchema, LeagueBracketSchema]);

export type KnockoutMatch = z.infer<typeof KnockoutMatchSchema>;
export type KnockoutRound = z.infer<typeof KnockoutRoundSchema>;
export type KnockoutBracket = z.infer<typeof KnockoutBracketSchema>;
export type LeagueMatch = z.infer<typeof LeagueMatchSchema>;
export type LeagueStanding = z.infer<typeof LeagueStandingSchema>;
export type LeagueRound = z.infer<typeof LeagueRoundSchema>;
export type LeagueBracket = z.infer<typeof LeagueBracketSchema>;
export type TournamentBracket = z.infer<typeof TournamentBracketSchema>;
