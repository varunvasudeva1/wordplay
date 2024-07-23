import {
  GameChoice,
  gameColors,
  sectionSeparator,
  subsectionSeparator,
} from "./constants";
const colors = require("ansi-colors");
const dotenv = require("dotenv");
const fs = require("fs");
dotenv.config();

export function welcome(): void {
  console.log(sectionSeparator);
  console.log(`
          _______  _______  ______   _______  _        _______          
|\\     /|(  ___  )(  ____ )(  __  \\ (  ____ )( \\      (  ___  )|\\     /|
| )   ( || (   ) || (    )|| (  \\  )| (    )|| (      | (   ) |( \\   / )
| | _ | || |   | || (____)|| |   ) || (____)|| |      | (___) | \\ (_) / 
| |( )| || |   | ||     __)| |   | ||  _____)| |      |  ___  |  \\   /  
| || || || |   | || (\\ (   | |   ) || (      | |      | (   ) |   ) (   
| () () || (___) || ) \\ \\__| (__/  )| )      | (____/\\| )   ( |   | |   
(_______)(_______)|/   \\__/(______/ |/       (_______/|/     \\|   \\_/
    `);
  console.log("An on-demand, LM-powered collection of text-based games.");
  console.log(colors["magenta"]("Developed by Varun Vasudeva.\n"));
  console.log(sectionSeparator, "\n");
}

export function welcomeTo(game: GameChoice) {
  console.log(`\n${subsectionSeparator}\n`);
  console.log("WELCOME TO", colors[gameColors[game]](game.toUpperCase()));
  console.log(`\n${subsectionSeparator}\n`);
}

export function setEnvironmentVariable(variableName: string, value: string) {
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
  return seconds / 10e8;
}
