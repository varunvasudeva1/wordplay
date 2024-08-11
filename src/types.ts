export type GameChoice = "trivia" | "hunt" | "scramble";
export type GameColors = "red" | "blue" | "green" | "magenta";
export type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};
