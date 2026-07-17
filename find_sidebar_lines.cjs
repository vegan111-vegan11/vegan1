const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for the matching col-span-3 or sidebar in IsolPost...");
for (let i = 15300; i < 15900; i++) {
  if (lines[i].includes("col-span-3") || lines[i].includes("lg:col-span-3") || lines[i].includes("lg:block") || lines[i].includes("Sidebar") || lines[i].includes("aside")) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
