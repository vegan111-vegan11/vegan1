const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for the JSX return statement of IsolPost...");
let lineNum = 0;
for (let i = 14491; i < 18500; i++) {
  if (lines[i].includes("return (") && lines[i-1].includes("};") === false && lines[i-1].includes("const ") === false && lines[i-1].includes("let ") === false) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    for (let j = 1; j <= 20; j++) {
      console.log(`  +${j}: ${lines[i+j]}`);
    }
    break;
  }
}
