import { GameChoice, GameColors } from "./types";

export const sectionSeparator =
  "==========================================================================================";
export const subsectionSeparator = "#################################";
export const exitPhrase = "get me out";
export const gameColors: Record<GameChoice, GameColors> = {
  trivia: "blue",
  hunt: "magenta",
  scramble: "green",
};
