import { gameColors, sectionSeparator } from "./constants";
import { APIProvider, GameChoice, GameScorecard, Message } from "./types";
const colors = require("ansi-colors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

/**
 * Function to load text file assets
 * @param pathName Path to file
 * @returns String containing the text in the file
 */
export function loadTextFile(pathName: string) {
  const text = fs.readFileSync(path.resolve(__dirname, pathName), "utf8");
  return text;
}

export function welcome(): void {
  const title = loadTextFile("../assets/title.txt");
  console.log(title, "\n");
  console.log("An on-demand, LM-powered collection of text-based games.");
  console.log(colors["magenta"]("Developed by Varun Vasudeva.\n"));
  console.log(sectionSeparator, "\n");
}

/**
 * Function to show the game title
 * @param game Game title to show, of type `GameChoice`
 */
export function showGameTitle(game: GameChoice) {
  const title = loadTextFile(`../assets/${game}.txt`);
  console.log(`\n${colors[gameColors[game]](title)}\n`);
}

/**
 *
 * @param variableName Name of variable to initialize/change
 * @param value Value of variable to initialize/change
 * @returns Void
 */
export function setEnvironmentVariable(
  variableName: string,
  value: string
): void {
  // Check if .env exists
  if (!fs.existsSync(".env")) {
    console.log("Creating .env file...");
    fs.writeFileSync(".env", `${variableName}=${value}`);
    console.log(
      `Environment variable ${variableName} set to ${colors["green"](value)}`
    );
    return; // Exit after creating the file
  }

  try {
    const result = dotenv.config({ path: ".env" });

    if (result.error) {
      console.error("Error loading .env file:", result.error);
      return;
    }

    // Convert environment variables to an object
    const envVars = result.parsed || {};
    envVars[variableName] = value;

    // Stringify the object manually
    let envStr = "";
    for (const [key, val] of Object.entries(envVars)) {
      envStr += `${key}=${val}\n`;
    }

    // Write updated environment variables back to .env
    fs.writeFileSync(".env", envStr);
    console.log(
      `Environment variable ${variableName} set to ${colors["green"](value)}`
    );
  } catch (err) {
    console.error("Error writing to .env file:", err);
  }
}

/**
 * Function to get API information
 * @returns Object containing `base_url`, `provider`, and `model` keys
 */
export async function getApiInfo() {
  const base_url = process.env.BASE_URL;
  const provider: APIProvider = process.env.PROVIDER as APIProvider;
  const model = process.env.MODEL;
  if (!base_url) {
    throw new Error(
      "The BASE_URL environment variable is not set. Please run `wordplay config --base_url <base_url>`."
    );
  }
  if (!provider) {
    throw new Error(
      "The PROVIDER environment variable is not set. Please run `wordplay config --provider <provider>`."
    );
  }
  if (!model) {
    throw new Error(
      "The MODEL environment variable is not set. Please run `wordplay config --model <model>`."
    );
  }

  return { base_url, provider, model };
}

/**
 * Function to convert nanoseconds to seconds. Used to process Ollama response duration.
 * @param seconds Value in nanoseconds
 * @returns Value in seconds, clamped to 2 decimal places
 */
export function nanosecondsToSeconds(ns: number): number {
  return parseFloat((ns / 10e8).toFixed(2));
}

/**
 * Function to get a response from an LLM - this is used to generate games/game turns.
 * @description This function standardizes API calls across the application and automatically manages calls based on API providers.
 * @param data Object containing specs for API call, e.g. `model`, `messages`, `temperature`, etc.
 * @returns Object containing `message` and `total_duration` keys
 */
export async function getLLMResponse(
  data: any
): Promise<{ message: Message; total_duration: number }> {
  const {
    base_url,
    provider,
    model,
  }: {
    base_url: string;
    provider: APIProvider;
    model: string;
  } = await getApiInfo();
  const startTime = Date.now();
  const endpoint = provider === "ollama" ? "api/chat" : "v1/chat/completions";
  const fetchResponse = await fetch(`${base_url}/${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ...data, model: model }),
  });
  if (!fetchResponse.ok) {
    throw new Error(`Fetch request failed with status ${fetchResponse.status}`);
  }
  const parsedResponse = await fetchResponse.json();

  if (provider === "ollama") {
    return parsedResponse;
  } else {
    const { choices, created } = parsedResponse;
    const total_duration = (startTime - created) / 1000;
    return {
      message: choices[0].message,
      total_duration,
    };
  }
}

/**
 * Loads scorecards from a JSON file.
 * @returns A dictionary mapping games to their corresponding scores
 */
export function loadScoresheet(): any {
  try {
    const scorecardsString = fs.readFileSync("././scores.json", "utf8");
    if (!scorecardsString) {
      return {};
    }
    return JSON.parse(scorecardsString);
  } catch (error: any) {
    // Check for specific error codes here and log more specific messages
    if (error.code === "ENOENT") {
      console.log(`The scores file does not exist at the expected location.`);
    } else if (error.code === "EACCES") {
      console.log("Permission denied while reading the scores file.");
    } else {
      console.log("Something went wrong while loading scores:", error.message);
    }
  }
}

/**
 * Loads game scorecards from a specific game.
 * @param game Game to load scorecards for
 * @returns A list of scorecards for the given game
 */
export function loadScorecards(game: GameChoice): GameScorecard<typeof game>[] {
  const scorecards = loadScoresheet();
  const gameScorecards = scorecards[game];
  return gameScorecards as GameScorecard<typeof game>[];
}

/**
 * Writes a new scorecard to the scores.json file.
 * @param game Game to write a scorecard for
 * @param scorecard Scorecard to save
 */
export function writeScorecard(
  game: GameChoice,
  scorecard: GameScorecard<typeof game>
): void {
  const scorecards = loadScoresheet();

  if (!scorecards[game]) {
    scorecards[game] = [scorecard];
  } else {
    scorecards[game].push(scorecard);
  }

  fs.writeFileSync("././scores.json", JSON.stringify(scorecards));
}

/**
 * Function to return a comparator for scorecards.
 * @param game Game type (for different logic for each game)
 * @returns Function comparing a pair of scorecards. Returns 1 if a > b, -1 if a < b, and 0 if a == b.
 */
export function getScorecardComparator(
  game: GameChoice
): (a: any, b: any) => number {
  switch (game) {
    case GameChoice.Trivia:
      return (
        a: GameScorecard<GameChoice.Trivia>,
        b: GameScorecard<GameChoice.Trivia>
      ) => {
        return Math.sign(b.score - a.score);
      };
    case GameChoice.Hunt:
      return (a, b) => {
        if (a.outcome === "won" && b.outcome !== "won") return -1;
        else if (a.outcome !== "won" && b.outcome === "won") return 1;
        else return 0;
      };
    case GameChoice.Scramble:
      return (
        a: GameScorecard<GameChoice.Scramble>,
        b: GameScorecard<GameChoice.Scramble>
      ) => {
        return Math.sign(b.score - a.score);
      };
    default:
      throw new Error(`No comparator for game ${game}`);
  }
}

/**
 * Function to get an array of top scorecards for the specified game.
 * @param game Game to get scores for
 * @param n Number of scores to get
 * @returns Array of `n` scorecards for the specified game if conditions are met, `null` otherwise
 */
export function getTopScores(
  game: GameChoice,
  n: number
): GameScorecard<typeof game>[] | null {
  const scorecards = loadScorecards(game);
  if (!scorecards) {
    return null;
  }
  const comparator = getScorecardComparator(game);
  const sortedScorecards = scorecards.sort(comparator);
  return sortedScorecards.slice(0, n);
}
