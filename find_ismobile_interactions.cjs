const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");
const lines = code.split("\n");

console.log("Analyzing isMobile and isSimulatedMobileView interactions...");
lines.forEach((line, idx) => {
  if (line.includes("isMobile") || line.includes("setIsMobile")) {
    if (idx > 13000 && idx < 14800) {
      console.log(`Line ${idx + 1}: ${line.trim()}`);
    }
  }
});
