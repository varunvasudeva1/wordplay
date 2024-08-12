import { gameColors, sectionSeparator } from "./constants";
import { APIProvider, GameChoice, Message } from "./types";
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
 *
 * @param data Object containing specs for API call, e.g. `model`, `messages`, `temperature`, etc.
 * @param descriptor Type of response being generated, e.g. "hunt" or "quiz"
 * @returns Message content depending on API provider
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
