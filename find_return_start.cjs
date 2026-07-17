const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Searching for return block inside App function...");
let appIndex = -1;
lines.forEach((line, idx) => {
  if (line.includes("function App()")) {
    appIndex = idx;
  }
});

if (appIndex !== -1) {
  console.log(`Found App() starting at line ${appIndex + 1}`);
  for (let i = appIndex; i < lines.length; i++) {
    if (lines[i].includes("return (") && lines[i].trim().startsWith("return (")) {
      console.log(`Found return ( at line ${i + 1}`);
      break;
    }
  }
} else {
  console.log("App() function not found");
}
