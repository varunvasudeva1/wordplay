export const sectionSeparator =
  "==========================================================================================";
export const subsectionSeparator = "#################################";
export const exitPhrase = "get me out";

export type GameChoice = "trivia" | "hunt";
export type GameColors = "red" | "blue" | "green" | "magenta";
export const gameColors: Record<GameChoice, GameColors> = {
  trivia: "blue",
  hunt: "magenta",
};
