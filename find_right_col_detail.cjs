const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for the second column (col-span-3) or remaining blocks of IsolPost...");
for (let i = 15300; i < 16400; i++) {
  if (lines[i].includes("col-span-3") || lines[i].includes("lg:col-span-3")) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
    for (let j = 1; j <= 20; j++) {
      console.log(`  +${j}: ${lines[i+j]}`);
    }
  }
}
