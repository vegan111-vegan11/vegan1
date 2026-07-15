const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for return in Navbar...");
let found = -1;
for (let i = 13121; i < 14428; i++) {
  if (lines[i].includes("return (") && lines[i].search(/\S/) <= 4) {
    found = i;
    break;
  }
}
if (found !== -1) {
  console.log(`Found Navbar return on line ${found + 1}`);
  for (let i = found; i < found + 150; i++) {
    console.log(`${i + 1}: ${lines[i]}`);
  }
} else {
  console.log("Navbar return not found or has higher indentation");
}
