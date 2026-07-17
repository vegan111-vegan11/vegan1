const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for return inside IsolPost...");
let inIsolPost = false;
lines.forEach((line, idx) => {
  if (line.includes("const IsolPost =")) {
    inIsolPost = true;
  }
  if (inIsolPost && line.includes("return (") && idx < 15500) {
    console.log(`Line ${idx + 1}: ${line}`);
    for (let i = 1; i <= 60; i++) {
      console.log(`  +${i}: ${lines[idx + i]}`);
    }
    inIsolPost = false; // Just print first return inside IsolPost
  }
});
