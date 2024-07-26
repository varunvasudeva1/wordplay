const fs = require("fs");
const path = require("path");

// Read the contents of the file into a string
const words = fs.readFileSync(
  path.resolve(__dirname, "./assets/words.txt"),
  "utf8"
);

// Split the string into an array of words and filter out any hyphenated words
const originalLength = words.split("\n").length;
const capitalizedWordRegex = `^[A-Z][^A-Z]*$`;
const filteredWords = words
  .split("\n")
  .filter(
    (word) =>
      !word.includes("-") &&
      !word.includes("'") &&
      !word.includes(".") &&
      word !== word.toUpperCase() &&
      !word.match(capitalizedWordRegex)
  );
const removedCount = originalLength - filteredWords.length;

// Write the filtered list of words back to the file
fs.writeFileSync(
  path.resolve(__dirname, "./assets/words.txt"),
  filteredWords.join("\n")
);

console.log(
  `Removed ${removedCount} entries from a total of ${originalLength}`
);
