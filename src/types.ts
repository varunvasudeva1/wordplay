import { Outcome } from "./games/hunt";

export enum GameChoice {
  Trivia = "trivia",
  Hunt = "hunt",
  Scramble = "scramble",
}
export enum GameColors {
  Red = "red",
  Blue = "blue",
  Green = "green",
  Magenta = "magenta",
}
export enum GameDifficulty {
  Easy = "easy",
  Medium = "medium",
  Hard = "hard",
  Hardcore = "hardcore",
}
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};
export type APIProvider = "ollama" | "openai";

export type LLMRequestData = {
  messages: Message[];
  format?: string;
  stream?: boolean;
  temperature?: number;
};
export type LLMResponse = {
  message: Message;
  total_duration: number;
};

// Scorecard types
export type TriviaScorecard = {
  difficulty: GameDifficulty;
  topic: string;
  correctQuestions: number;
  totalQuestions: number;
  score: number;
};
export type HuntScorecard = {
  outcome: Outcome;
  summary: string;
};
export type ScrambleScorecard = {
  word: string;
  correct: number;
  unique: number;
  missed: number;
  score: number;
};
export type GameScorecard<T extends GameChoice> = T extends GameChoice.Scramble
  ? ScrambleScorecard
  : T extends GameChoice.Trivia
  ? TriviaScorecard
  : T extends GameChoice.Hunt
  ? HuntScorecard
  : never;
