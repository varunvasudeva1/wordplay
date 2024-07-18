import { gameColors } from "./constants";
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
      case "EXIT":
        // exit
        break;
    }
  } catch (e) {
    console.error(e);
  }
}

main();
