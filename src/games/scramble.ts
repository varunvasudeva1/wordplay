import { GameChoice, Message } from "../types";
import {
  getLLMResponse,
  loadTextFile,
  nanosecondsToSeconds,
  showGameTitle,
  writeScorecard,
} from "../utils";
const List = require("enquirer/lib/prompts/List");
const colors = require("ansi-colors");
const dotenv = require("dotenv");
const lodash = require("lodash");
dotenv.config();

type WordAndPermutations = {
  word: string;
  permutations: string[];
};

const messages: Message[] = [
  {
    role: "system",
    content: `You are tasked with generating a word scramble game for the user. Pick a random word and write down ALL possible words that can be made using it (3 or more letters only), including the word itself. Only include permutations that can be made from the letters in one instance of the word - for example, "tin" cannot have "tint" as a permutation because "t" appears only once in the original word. Be very careful when generating permutations, ensuring you only generate permutations with the correct letters and words that actually exist. The word you pick will be scrambled and then shown to the user, who will try and guess as many words as they can. Respond with a JSON object containing the keys "word" (a string containing the word of your choice) and "permutations" (an array of strings containing the permutations). Keep your answers all lowercase for ease of processing.`,
  },
];

/**
 * Function to obtain a word and its permutations
 * @param messages Array of messages for LLM
 * @returns Object containing `word` and `permutations`
 */
async function getWordAndPermutations(
  messages: Message[]
): Promise<WordAndPermutations> {
  const data = {
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
    const parsedResponse = await getLLMResponse(data);
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
    throw new Error(`Error generating word/permutations: ${e.message}`);
  }
}

const wordSet = new Set(
  loadTextFile(".././assets/words.txt")
    .split("\n")
    .map((word: string) => word.trim().toLowerCase())
);

/**
 * Function to check the validity of a word using `words.txt`
 * @param word Word to be checked
 * @returns True if valid, false otherwise
 */
function isValidWord(word: string): boolean {
  return wordSet.has(word);
}

/**
 *
 * @param word Word to get character counts for
 * @returns Character counts for the word
 */
function getCharCount(word: string): Record<string, number> {
  const charCount: Record<string, number> = {};
  for (let i = 0; i < word.length; i++) {
    const char = word[i];
    if (charCount[char]) {
      charCount[char]++;
    } else {
      charCount[char] = 1;
    }
  }
  return charCount;
}

/**
 * Function to validate an array of answers
 * Checks if:
 * 1) the word exists and,
 * 2) has the same (or less) number of characters as the original word
 * @param answers The array of answers to be validated
 * @returns The array of all valid answers from the original array
 */
function validateAnswers(answers: string[], originalWord: string): string[] {
  const charCountOriginal = getCharCount(originalWord);
  // Filter out invalid words - words that are not in `words.txt` or have more letters than the original word
  const validWords = answers.filter(
    (word) => isValidWord(word) && word.length <= originalWord.length
  );

  const validAnswers = validWords.filter((word) => {
    const charCountWord = getCharCount(word);
    for (const [char, count] of Object.entries(charCountWord)) {
      if (!charCountOriginal[char] || count > charCountOriginal[char]) {
        return false;
      }
    }
    return true;
  });

  // Remove duplicates and return the validated answers
  return [...new Set(validAnswers)];
}

export async function scramble() {
  showGameTitle(GameChoice.Scramble);

  try {
    const data = await getWordAndPermutations(messages);
    if (!data) {
      console.error(
        "Something went wrong creating the game. Try running the program again."
      );
    }

    const scrambledWord = lodash.shuffle(data.word);
    console.log("letters: ", scrambledWord.join(" "));

    const question = new List({
      name: "words",
      message: "Type comma-separated answers",
    });
    const userAnswers: string[] = await question.run();
    const llmValidAnswers = validateAnswers(data.permutations, data.word);
    const userValidAnswers = validateAnswers(userAnswers, data.word);

    const commonAnswers = lodash.intersection(
      llmValidAnswers,
      userValidAnswers
    );
    const uniqueAnswers = lodash.difference(userValidAnswers, llmValidAnswers);
    const missedAnswers = lodash.difference(llmValidAnswers, userValidAnswers);

    console.log(`\n${colors["green"]("You got: ")}${commonAnswers.join(", ")}`);
    console.log(
      `${colors["magenta"]("You uniquely got: ")}${uniqueAnswers.join(", ")}`
    );
    {
      missedAnswers.length > 0
        ? console.log(
            `${colors["red"]("You missed: ")}${missedAnswers.join(", ")}`
          )
        : null;
    }

    const numerator = commonAnswers.length + uniqueAnswers.length;
    const denominator = llmValidAnswers.length;
    const score = parseInt(((numerator / denominator) * 100).toFixed(2));

    console.log(
      `\nScore: ${colors["green"](numerator)} out of ${denominator}!`
    );

    writeScorecard(GameChoice.Scramble, {
      word: data.word,
      correct: commonAnswers.length,
      unique: uniqueAnswers.length,
      missed: missedAnswers.length,
      score,
    });
  } catch (e: any) {
    console.error(e);
  }
}
