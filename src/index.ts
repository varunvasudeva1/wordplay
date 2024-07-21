import { gameColors } from "./constants";
import { hunt } from "./hunt";
import { trivia } from "./trivia";
import { init, welcome } from "./utils";
const { Select } = require("enquirer");
const colors = require("ansi-colors");
require("dotenv").config();

async function main() {
  welcome();
  await init();

  const gameChoices = [
    {
      name: "TRIVIA",
      message: `${colors[gameColors["TRIVIA"]](
        "TRIVIA"
      )}: 10 timed questions. Score decreases with time. User's choice of subject and difficulty.`,
    },
    {
      name: "HUNT",
      message: `${colors[gameColors["HUNT"]](
        "HUNT"
      )}: Turn-by-turn choice-based gameplay. Find or die.`,
    },
    {
      name: "EXIT",
      message: `${colors[gameColors["EXIT"]]("EXIT")}: I'm done playing.`,
    },
  ];

  const gameChoiceQuestion = new Select({
    name: "gameChoice",
    message: "PICK YOUR POISON",
    choices: gameChoices,
  });

  try {
    const gameChoice = await gameChoiceQuestion.run();

    switch (gameChoice) {
      case "TRIVIA":
        trivia();
        break;
      case "HUNT":
        hunt();
        break;
      case "EXIT":
        break;
    }
  } catch (e) {
    console.error(e);
  }
}

main();
