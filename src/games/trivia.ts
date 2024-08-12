import { Message } from "../types";
import { getLLMResponse, nanosecondsToSeconds, showGameTitle } from "../utils";
const { Input, Select, Quiz } = require("enquirer");
const colors = require("ansi-colors");
const dotenv = require("dotenv");
dotenv.config();

type GameParams = {
  topic: string;
  difficulty: "easy" | "medium" | "hard" | "hardcore";
};

type Question = {
  message: string;
  choices: string[];
  correctChoice: number;
};

function scoreGame() {}

/**
 * Function to create questions
 * @param params Object containing game parameters, `topic` and `difficulty`
 * @returns
 */
async function createQuestions(params: GameParams): Promise<Question[]> {
  const messages: Message[] = [
    {
      role: "system",
      content: `You are an AI assistant dedicated to generating trivia questions. The levels of difficulty are: easy, medium, hard, hardcore. Generate 10 questions on ${
        params.topic === "random" ? "a random topic" : params.topic
      } with a difficulty level of ${
        params.difficulty
      }. Ensure that the value for the correctChoice uses 0-based indexing and is correct.
    Here's an excerpt of an example response for a topic of "astronomy" and difficulty of "easy":  
    {"quiz": [{"message": "What's the distance of the Earth from the Sun (in miles)?", "choices": ['9 billion', '12 billion', '4.5 billion', '5 billion'], "correctChoice": 0}]}`,
    },
  ];

  const data = {
    messages,
    format: "json",
    stream: false,
  };

  try {
    console.log("Generating quiz...");
    const parsedResponse = await getLLMResponse(data);
    const { message, total_duration } = parsedResponse;
    console.log(
      `Generated quiz successfully (took ${nanosecondsToSeconds(
        total_duration
      )}s).\n`
    );
    const { quiz } = JSON.parse(message.content);
    return quiz as Question[];
  } catch (e: any) {
    console.error("Error creating questions:", e);
    throw e;
  }
}

/**
 * Function to create goodbye message based on score
 * @param score Game score out of 10
 * @returns Message to be associated with the score
 */
function goodbyeMessage(score: number): string {
  if (score < 2) {
    return "Better luck next time!";
  } else if (score < 5) {
    return "Not a bad try. There's some room for improvement.";
  } else if (score < 7) {
    return "Nice! Getting close to a full score.";
  } else {
    return "You're a pro!";
  }
}

export async function trivia() {
  let score = 0;
  showGameTitle("trivia");
  const difficultyQuestion = new Select({
    name: "difficulty",
    message: "DIFFICULTY",
    choices: ["easy", "medium", "hard", "hardcore"],
  });

  const topicQuestion = new Input({
    initial: "random",
    message: `TOPIC`,
  });

  try {
    const difficulty = await difficultyQuestion.run();
    const topic = await topicQuestion.run();
    const params: GameParams = { difficulty, topic };
    const quiz = await createQuestions(params);

    if (quiz) {
      console.log(`${colors["bgGreen"]("READY TO PLAY")}\n`);

      for (const question of quiz) {
        const { choices, correctChoice } = question;
        const correctAnswer = choices[correctChoice];
        const quizQuestion = new Quiz(question);
        const answer = await quizQuestion.run();
        if (answer.correct) {
          console.log(colors["green"]("Correct."));
          score += 1;
        } else {
          console.log(
            `${colors["red"]("Incorrect.")} Correct answer: ${colors["green"](
              correctAnswer
            )}`
          );
        }
      }

      console.log(
        `\nYour total score is ${colors["green"](score)}/10. ${goodbyeMessage(
          score
        )}`
      );
    }
  } catch (e) {
    console.error(e);
  }
}
