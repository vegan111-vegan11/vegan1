const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for lucide-react imports near top of the file...");
for (let i = 0; i < 200; i++) {
  if (lines[i].includes("lucide-react")) {
    console.log(`Line ${i + 1}: ${lines[i]}`);
    // Show next few lines
    for (let j = 1; j < 10; j++) {
      console.log(`Line ${i + 1 + j}: ${lines[i + j]}`);
    }
  }
}
