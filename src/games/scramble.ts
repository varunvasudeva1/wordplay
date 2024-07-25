import { getApiInfo, nanosecondsToSeconds, welcomeTo } from "../utils";
const { List } = require("enquirer");
const colors = require("ansi-colors");
const dotenv = require("dotenv");
dotenv.config();

type WordAndPermutations = {
  word: string;
  permutations: string[];
};

type Message = {
  role: "user" | "assistant" | "system";
  content: string;
};

const messages: Message[] = [
  {
    role: "system",
    content: `You are tasked with generating a word scramble game for the user. Pick a random word and write down ALL possible words that can be made using it (3 or more letters only), including the word itself. Only include permutations that can be made from the letters in one instance of the word - for example, "tin" cannot have "tint" as a permutation because "t" appears only once in the original word. Be very careful when generating permutations, ensuring you only generate permutations with the correct letters and words that actually exist. The word you pick will be scrambled and then shown to the user, who will try and guess as many words as they can. Respond with a JSON object containing the keys "word" (a string containing the word of your choice) and "permutations" (an array of strings containing the permutations). Keep your answers all lowercase for ease of processing.`,
  },
];

function scrambleWord(word: string): string {
  if (!word) {
    throw new Error("No word found to scramble.");
  }
  let wordArray = word.split("");
  let randomizedWordArray = [];
  while (wordArray.length > 0) {
    const randomIndex = Math.floor(Math.random() * wordArray.length);
    const chosenChar = wordArray[randomIndex];
    randomizedWordArray.push(chosenChar);
    // Remove from wordArray
    const chosenCharIndex = wordArray.indexOf(chosenChar);
    if (chosenCharIndex > -1) {
      wordArray = wordArray
        .slice(0, chosenCharIndex)
        .concat(wordArray.slice(chosenCharIndex + 1));
    }
  }
  const scrambledWord = randomizedWordArray.join("");
  return scrambledWord;
}

async function getWordAndPermutations(
  messages: Message[]
): Promise<WordAndPermutations> {
  const { endpoint, model } = await getApiInfo();

  const data = {
    model: model,
    messages,
    format: "json",
    stream: false,
    // temperature: 1.2,
  };

  try {
    const isFirstRun = messages.length === 1;
    if (isFirstRun) {
      console.log("Generating word and permutations...");
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
        `Generated word and permutations successfully (took ${nanosecondsToSeconds(
          total_duration
        )}s).\n`
      );
      console.log(`${colors["bgGreen"]("READY TO PLAY")}\n`);
    }
    const wordAndPermutations = JSON.parse(message.content);
    return wordAndPermutations as WordAndPermutations;
  } catch (e: any) {
    console.error("Error generating choices:", e);
    throw e;
  }
}

async function isValidWord(word: string): Promise<boolean> {
  try {
    const isWordValid = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`
    );
    const isWordValidParsed = await isWordValid.json();
    if (
      isWordValidParsed.title &&
      isWordValidParsed.title === "No Definitions Found"
    ) {
      return false;
    } else {
      return true;
    }
  } catch (e: any) {
    throw new Error(`Error checking validity of word: ${e.message}`);
  }
}

async function validateLLMAnswers(
  generatedAnswers: string[]
): Promise<string[]> {
  const validatedAnswers = generatedAnswers.map(isValidWord);
  const results = await Promise.all(validatedAnswers);
  const validAnswers: string[] = generatedAnswers.filter((_, i) => results[i]);
  const uniqueValidAnswers = [...new Set(validAnswers)];
  return uniqueValidAnswers;
}

async function checkAnswer(answer: string, correctAnswers: string[]) {
  try {
    const isAnswerInPermutations = correctAnswers.includes(answer);
    if (isAnswerInPermutations) {
      return true;
    } else {
      const isAnswerAValidWord = await isValidWord(answer);
      return isAnswerAValidWord;
    }
  } catch (e: any) {
    console.log("Something went wrong checking an answer. Try again.");
  }
}

export async function scramble() {
  welcomeTo("scramble");

  try {
    const data = await getWordAndPermutations(messages);
    if (!data) {
      console.error(
        "Something went wrong creating the game. Try running the program again."
      );
    }

    const scrambledWord = scrambleWord(data.word);
    console.log("letters: ", scrambledWord);

    const question = new List({
      name: "words",
      message: "Type comma-separated answers",
    });
    const userAnswers: string[] = await question.run();
    const validatedAnswers = await validateLLMAnswers(data.permutations);

    console.log("\nChecking answers...");
    const start = new Date().getTime();
    const answersCheck = userAnswers.map((a) =>
      checkAnswer(a, validatedAnswers)
    );
    const results = await Promise.all(answersCheck);
    const correctAnswers = [
      ...new Set(userAnswers.filter((_, i) => results[i])),
    ];
    const end = new Date().getTime();

    console.log(`Checked answers (took ${(end - start) / 1000}s).`);
    console.log(
      `You got ${colors["green"](correctAnswers.length)} out of ${
        validatedAnswers.length
      }!`
    );

    // Take a union of correct answers from user and LLM for a master list
    const allCorrectAnswers = [
      ...new Set([...correctAnswers, ...validatedAnswers]),
    ];

    // Compare the two lists
    console.log(
      `${colors["green"]("You answered: ")}${correctAnswers.join(", ")}`
    );
    const missedAnswers = allCorrectAnswers.filter(
      (answer) => !correctAnswers.includes(answer)
    );
    {
      missedAnswers.length > 0
        ? console.log(
            `${colors["red"]("You missed: ")}${missedAnswers.join(", ")}`
          )
        : null;
    }
  } catch (e: any) {
    console.error(e);
  }
}
