import { getApiInfo, nanosecondsToSeconds, welcomeTo } from "./utils";
const { Select } = require("enquirer");
const colors = require("ansi-colors");
const dotenv = require("dotenv");
dotenv.config();

type GameTurn = {
  plot: string;
  choices: string[];
  outcome: "won" | "died" | "undecided";
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const messages: Message[] = [
  {
    role: "system",
    content: `You are tasked with generating an adventure game with the objective of finding a treasure chest. Your game will be played as a choice-based game by a user, who will go turn by turn until they find the chest or die a painful death. You must generate the story and, then, take the user through it turn by turn. First generate the story's outline, which will be shown to the user. Then provide the first turn's choices. Following that, the user will choose, and you will present the next turn's choices. This process will repeat until either the user picks a choice that ends in their demise or the treasure is found. Respond with a JSON object containing three keys: “plot”, “choices”, and "outcome". “plot” should simply be a string that progresses the story, "choices” should be an array of strings containing the choices the user can make, and "outcome" should be either "won", "died", or "undecided". If there is no further choice to be made because the story has reached a conclusion, "plot" should be the conclusion, “choices” should be an empty array, and "outcome" should be "won" or "died" - otherwise, it should be "undecided". Be sure to label the choices with lettering so the user can choose easily without typing the entire choice in.`,
  },
];

async function getChoices(messages: Message[]): Promise<GameTurn> {
  const { endpoint, model } = await getApiInfo();

  const data = {
    model: model,
    messages,
    format: "json",
    stream: false,
    temperature: 0.7,
  };

  try {
    const isFirstRun = messages.length === 1;
    if (isFirstRun) {
      console.log("Generating your hunt...");
    }

    const fetchResponse = await fetch(`${endpoint}/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (!fetchResponse.ok) {
      throw new Error(
        `Fetch request failed with status ${fetchResponse.status}`
      );
    }

    const parsedResponse = await fetchResponse.json();
    const {
      message,
      total_duration,
    }: {
      message: Message;
      total_duration: number;
    } = parsedResponse;
    if (isFirstRun) {
      console.log(
        `Generated hunt successfully (took ${nanosecondsToSeconds(
          total_duration
        )}s).\n`
      );
      console.log(`${colors["bgGreen"]("READY TO PLAY")}\n`);
    }
    const gameTurn = JSON.parse(message.content);
    return gameTurn as GameTurn;
  } catch (e: any) {
    console.error("Error generating choices:", e);
    throw e;
  }
}

export async function hunt() {
  welcomeTo("HUNT");

  let gameOver = false;

  while (!gameOver) {
    try {
      const data = await getChoices(messages);
      if (!data) {
        console.error(
          "Something went wrong creating the game. Try running the program again."
        );
      }
      if (data.outcome !== "undecided") {
        gameOver = true;
        // Show last plot point in red if "died" or green if "won"
        console.log(
          colors[data.outcome === "died" ? "red" : "green"](data.plot)
        );
        break;
      }
      // Add assistant response to messages
      messages.push({
        role: "assistant",
        content: JSON.stringify(data),
      });

      console.log(data.plot);
      const question = new Select({
        message: "Make your choice.",
        choices: data.choices,
      });
      const userChoice = await question.run();
      // Add user response to messages
      messages.push({
        role: "user",
        content: userChoice,
      });
      console.log("");
    } catch (e: any) {
      console.error(e);
    }
  }
}
