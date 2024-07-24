#!/usr/bin/env node
import { gameColors } from "./constants";
import { hunt } from "./games/hunt";
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
    welcome();
    switch (game) {
      case "trivia":
        trivia();
        break;
      case "hunt":
        hunt();
        break;
      default:
        console.error('Invalid game type. Use "play trivia" or "play hunt".');
    }
  });

program
  .command("config")
  .description("set configuration options, e.g. API endpoint, model, etc.")
  .option("-e, --endpoint <apiEndpoint>", "Set the API endpoint URL")
  .option("-m, --model <modelName>", "Set the language model")
  .action((options: { model?: string; endpoint?: string }) => {
    if (options.endpoint) {
      console.log(`Setting endpoint to: ${options.endpoint}`);
      setEnvironmentVariable("ENDPOINT", options.endpoint);
    }
    if (options.model) {
      console.log(`Setting model to: ${options.model}`);
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
  });

program.parse();
