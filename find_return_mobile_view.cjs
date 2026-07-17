const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for return block containing isSimulatedMobileView...");
lines.forEach((line, idx) => {
  if (line.includes("isSimulatedMobileView") && (line.includes("return") || line.includes("?"))) {
    console.log(`Line ${idx + 1}: ${line.trim()}`);
  }
});
