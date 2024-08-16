#!/usr/bin/env node
import { gameColors } from "./constants";
import { hunt } from "./games/hunt";
import { scramble } from "./games/scramble";
import { trivia } from "./games/trivia";
import { APIProvider, GameChoice } from "./types";
import { setEnvironmentVariable, welcome, getTopScores } from "./utils";
const colors = require("ansi-colors");
const { program } = require("commander");
const { table } = require("table");
require("dotenv").config();

program.addHelpText("before", welcome());

program
  .command("play <game>")
  .description("play a game")
  .action((game: GameChoice) => {
    switch (game) {
      case GameChoice.Trivia:
        trivia();
        break;
      case GameChoice.Hunt:
        hunt();
        break;
      case GameChoice.Scramble:
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
  .description(
    "set configuration options, e.g. API base URL, provider, model, etc."
  )
  .option("-b, --base_url <base_url>", "Set the API base URL")
  .option("-p, --provider <provider>", "Set the API provider")
  .option("-m, --model <model>", "Set the language model")
  .action(
    (options: {
      base_url?: string;
      provider?: APIProvider;
      model?: string;
    }) => {
      if (options.base_url) {
        setEnvironmentVariable(
          "BASE_URL",
          options.base_url.toLowerCase().trim()
        );
      }
      if (options.provider) {
        enum APIProvider {
          openai = "openai",
          ollama = "ollama",
        }

        if (options.provider && !(options.provider in APIProvider)) {
          throw new Error(
            `Unrecognized provider: ${
              options.provider
            }. Must be one of [${Object.values(APIProvider).join(", ")}].`
          );
        }
        setEnvironmentVariable(
          "PROVIDER",
          options.provider.toLowerCase().trim()
        );
      }
      if (options.model) {
        setEnvironmentVariable("MODEL", options.model.toLowerCase().trim());
      }
    }
  );

program
  .command("list")
  .description("list available games")
  .action(() => {
    console.log("Available Games:");
    console.log(colors[gameColors[GameChoice.Trivia]]("trivia"));
    console.log(colors[gameColors[GameChoice.Hunt]]("hunt"));
    console.log(colors[gameColors[GameChoice.Scramble]]("scramble"));
  });

program
  .command("score <game>")
  .description("show top scores for a game")
  .option(
    "-n, --num <number>",
    "Specify number of top scores to show. Default is 5"
  )
  .action(
    (
      game: GameChoice,
      options: {
        num: number;
      }
    ) => {
      const n = options.num ?? 5;
      const topScores = getTopScores(game, n);
      if (!topScores) {
        console.log(
          `There are no scorecards for ${game}. Play it and come back to view scores!`
        );
      } else {
        console.log(
          `Showing top ${n} scores for ${colors[gameColors[game]](game)}`
        );
        switch (game) {
          case GameChoice.Trivia:
            const triviaScores = topScores.map(
              (scorecard: any, index: number) => [
                String(index + 1),
                scorecard.topic,
                scorecard.difficulty,
                scorecard.score,
              ]
            );
            triviaScores.unshift([
              "INDEX",
              colors["magenta"]("TOPIC"),
              colors["red"]("DIFFICULTY"),
              colors["yellow"]("SCORE"),
            ]);
            console.log(table(triviaScores));
            break;

          case GameChoice.Hunt:
            const huntScores = topScores.map(
              (scorecard: any, index: number) => [
                String(index + 1),
                colors[scorecard.outcome === "died" ? "red" : "green"](
                  scorecard.outcome
                ),
                scorecard.summary,
              ]
            );
            huntScores.unshift([
              "INDEX",
              colors["magenta"]("OUTCOME"),
              colors["yellow"]("SUMMARY"),
            ]);
            console.log(
              table(huntScores, {
                columns: { 2: { wrapWord: true, width: 60 } },
              })
            );
            break;

          case GameChoice.Scramble:
            const scrambleScores = topScores.map(
              (scorecard: any, index: number) => [
                String(index + 1),
                scorecard.word,
                scorecard.correct,
                scorecard.unique,
                scorecard.missed,
                scorecard.score,
              ]
            );
            scrambleScores.unshift([
              "INDEX",
              "WORD",
              colors["green"]("CORRECT"),
              colors["magenta"]("UNIQUE"),
              colors["red"]("MISSED"),
              colors["yellow"]("SCORE"),
            ]);
            console.log(table(scrambleScores));
            break;

          default:
            console.log(
              `Please select a valid game to see scores for. Valid options: ${Object.values(
                GameChoice
              ).join(", ")}`
            );
            break;
        }
      }
    }
  );

program.parse();
