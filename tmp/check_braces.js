const fs = require("fs");
const code = fs.readFileSync("src/App.tsx", "utf8");

let inSingleComment = false;
let inMultiComment = false;
let inString = null; // null or '"' or "'" or "`"
let stack = [];
let lines = code.split("\n");

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  inSingleComment = false;
  for (let j = 0; j < line.length; j++) {
    const char = line[j];
    const nextChar = line[j+1];

    if (inMultiComment) {
      if (char === "*" && nextChar === "/") {
        inMultiComment = false;
        j++;
      }
      continue;
    }
    if (inSingleComment) {
      continue;
    }
    if (inString) {
      if (char === "\\" && (nextChar === inString || nextChar === "\\")) {
        j++;
      } else if (char === inString) {
        inString = null;
      }
      continue;
    }

    if (char === "/" && nextChar === "/") {
      inSingleComment = true;
      j++;
      continue;
    }
    if (char === "/" && nextChar === "*") {
      inMultiComment = true;
      j++;
      continue;
    }

    if (char === '"' || char === "'" || char === '`') {
      inString = char;
      continue;
    }

    if (char === "{" || char === "(" || char === "[") {
      stack.push({ char, line: i + 1, col: j + 1 });
    } else if (char === "}" || char === ")" || char === "]") {
      const last = stack[stack.length - 1];
      if (!last) {
        console.log(`Extra closing ${char} found at line ${i + 1}:${j + 1}`);
        continue;
      }
      const match = (last.char === "{" && char === "}") ||
                    (last.char === "(" && char === ")") ||
                    (last.char === "[" && char === "]");
      if (match) {
        stack.pop();
      } else {
        console.log(`Mismatched closing ${char} at line ${i + 1}:${j + 1}, expected match for ${last.char} from line ${last.line}:${last.col}`);
        stack.pop();
      }
    }
  }
}
if (stack.length > 0) {
  console.log(`Unclosed items at end of file: ${stack.length}`);
  stack.slice(-30).forEach(item => {
    console.log(`  Unclosed ${item.char} from line ${item.line}:${item.col}`);
  });
} else {
  console.log("No unclosed items found by basic parser.");
}
