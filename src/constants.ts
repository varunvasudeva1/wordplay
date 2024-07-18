export const sectionSeparator =
  "==========================================================================================";
export const subsectionSeparator = "#################################";
export const exitPhrase = "get me out";

export type GameChoice = "TRIVIA" | "EXIT";
export type GameColors = "red" | "blue" | "green" | "magenta";
export const gameColors: Record<GameChoice, GameColors> = {
  TRIVIA: "blue",
  EXIT: "red",
};
