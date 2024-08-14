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
