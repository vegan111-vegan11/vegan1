import fs from 'fs';
import path from 'path';

const outDir = path.join(process.cwd(), 'public', 'demo-cuts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

async function run() {
  console.log('Downloading 10 demo images...');
  for (let i = 1; i <= 10; i++) {
    const prompt = `anime style webtoon panel cyberpunk neon city character close up highly detailed cinematic lighting scene ${i}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=1200&nologo=true&seed=${i}`;
    console.log(`Downloading ${i}: ${url}`);
    
    try {
      const res = await fetch(url);
      const buffer = await res.arrayBuffer();
      fs.writeFileSync(path.join(outDir, `cut${i}.jpg`), Buffer.from(buffer));
      console.log(`Saved cut${i}.jpg`);
    } catch (e) {
      console.error(`Failed ${i}`, e);
    }
  }
}
run();
