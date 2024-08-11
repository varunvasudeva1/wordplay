import { gameColors, sectionSeparator } from "./constants";
import { GameChoice } from "./types";
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
 * Function to get API info
 * @returns Object containing `base_url` and `model` keys
 */
export async function getApiInfo() {
  const base_url = process.env.BASE_URL;
  const model = process.env.MODEL;
  if (!base_url) {
    throw new Error(
      "The BASE_URL environment variable is not set. Please run `wordplay config --base_url <base_url>`."
    );
  }
  if (!model) {
    throw new Error(
      "The MODEL environment variable is not set. Please run `wordplay config --model <model>`."
    );
  }

  return { base_url, model };
}

/**
 * Function to convert nanoseconds to seconds. Used to process Ollama response duration.
 * @param seconds Value in nanoseconds
 * @returns Value in seconds, clamped to 2 decimal places
 */
export function nanosecondsToSeconds(ns: number): number {
  return parseFloat((ns / 10e8).toFixed(2));
}
