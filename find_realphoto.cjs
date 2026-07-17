const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for 리얼포토 in the entire file...");
lines.forEach((line, idx) => {
  if (line.includes("리얼포토")) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
