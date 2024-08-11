#!/usr/bin/env node
import { gameColors } from "./constants";
import { hunt } from "./games/hunt";
import { scramble } from "./games/scramble";
import { trivia } from "./games/trivia";
import { GameChoice } from "./types";
import { setEnvironmentVariable, welcome } from "./utils";
const colors = require("ansi-colors");
const { program } = require("commander");
require("dotenv").config();

program
  .command("play <game>")
  .description("play a game")
  .action((game: GameChoice) => {
    switch (game) {
      case "trivia":
        trivia();
        break;
      case "hunt":
        hunt();
        break;
      case "scramble":
        scramble();
        break;
      default:
        console.error(
          "Invalid game type. Run `wordplay list` to see available games."
        );
    }
  });

program
  .command("config")
  .description("set configuration options, e.g. API base URL, model, etc.")
  .option("-b, --base_url <base_url>", "Set the API base URL")
  .option("-m, --model <model>", "Set the language model")
  .action((options: { base_url?: string; model?: string }) => {
    if (options.base_url) {
      setEnvironmentVariable("BASE_URL", options.base_url);
    }
    if (options.model) {
      setEnvironmentVariable("MODEL", options.model);
    }
  });

program
  .command("list")
  .description("list available games")
  .action(() => {
    console.log("Available Games:");
    console.log(colors[gameColors["trivia"]]("trivia"));
    console.log(colors[gameColors["hunt"]]("hunt"));
    console.log(colors[gameColors["scramble"]]("scramble"));
  });

program.parse();
