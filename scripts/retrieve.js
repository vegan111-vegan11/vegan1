import fs from 'fs';
import path from 'path';

const logFile = '/.gemini/antigravity/brain/d285ac74-1b98-41cc-8124-3492e8226475/.system_generated/logs/transcript.jsonl';

try {
  if (fs.existsSync(logFile)) {
    console.log('Log file exists! Reading...');
    const content = fs.readFileSync(logFile, 'utf8');
    const lines = content.split('\n');
    console.log(`Read ${lines.length} lines from log.`);
    
    // Let's search back and find occurrences of code blocks related to NewsDetailModal or App.tsx contents.
    // Or write a script that dumps some context.
    let found = [];
    for (let i = lines.length - 1; i >= 0; i--) {
      if (lines[i].includes('NewsDetailModal = ({')) {
        found.push(i);
      }
    }
    console.log('Found matches at lines:', found);
    
    if (found.length > 0) {
      // Print context of the last match
      const line = lines[found[0]];
      const parsed = JSON.parse(line);
      console.log('Keys in matched log line:', Object.keys(parsed));
      // Dump text or parts of it to a recovery file
      fs.writeFileSync('/scripts/recovered_match.json', JSON.stringify(parsed, null, 2));
      console.log('Dumped matched JSON to /scripts/recovered_match.json');
    }
  } else {
    console.log('Log file does not exist at path:', logFile);
  }
} catch (error) {
  console.error('Error reading logs:', error);
}
