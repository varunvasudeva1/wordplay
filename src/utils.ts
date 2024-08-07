import { gameColors, sectionSeparator } from "./constants";
import { GameChoice } from "./types";
const colors = require("ansi-colors");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
dotenv.config();

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

export function showGameTitle(game: GameChoice) {
  const title = loadTextFile(`../assets/${game}.txt`);
  console.log(`\n${colors[gameColors[game]](title)}\n`);
}

export function setEnvironmentVariable(variableName: string, value: string) {
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

export async function getApiInfo() {
  const endpoint = process.env.ENDPOINT;
  const model = process.env.MODEL;
  if (!endpoint) {
    throw new Error(
      "The ENDPOINT environment variable is not set. Please run `wordplay config --endpoint <endpointURL>`."
    );
  }
  if (!model) {
    throw new Error(
      "The MODEL environment variable is not set. Please run `wordplay config --model <modelName>`."
    );
  }

  return { endpoint, model };
}

export function nanosecondsToSeconds(seconds: number): number {
  return parseFloat((seconds / 10e8).toFixed(2));
}
