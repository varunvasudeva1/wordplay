import {
  GameChoice,
  gameColors,
  sectionSeparator,
  subsectionSeparator,
} from "./constants";
const colors = require("ansi-colors");
const { Input } = require("enquirer");
require("dotenv").config();

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
  console.log("An on-demand, LM-powered collection of text-based games.\n");
  console.log(sectionSeparator, "\n");
}

export function welcomeTo(game: GameChoice) {
  console.log(`\n${subsectionSeparator}\n`);
  console.log("WELCOME TO", colors[gameColors[game]](game));
  console.log(`\n${subsectionSeparator}\n`);
}

export async function init() {
  try {
    const endpoint = process.env.ENDPOINT;
    if (!endpoint || endpoint == "") {
      const endpointQuestion = new Input({
        message: "Your Ollama (or other OpenAI-compatible) endpoint:",
        initial: "http://localhost:11434",
      });
      const endpointAnswer = await endpointQuestion.run();
      process.env.ENDPOINT = endpointAnswer;
    }

    const model = process.env.MODEL;
    if (!model || model == "") {
      const modelQuestion = new Input({
        message: "Your preferred model:",
        initial: "http://localhost:11434",
      });
      const modelAnswer = await modelQuestion.run();
      process.env.MODEL = modelAnswer;
    }
  } catch (e: any) {
    console.error(e);
  }
}

export async function getApiInfo() {
  const endpoint = process.env.ENDPOINT;
  const model = process.env.MODEL;
  if (!endpoint) {
    throw new Error("The ENDPOINT environment variable is not set");
  }
  if (!model) {
    throw new Error("The MODEL environment variable is not set");
  }
  await init();

  return { endpoint, model };
}
