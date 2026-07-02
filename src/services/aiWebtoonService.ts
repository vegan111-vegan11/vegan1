import { GoogleGenAI } from '@google/genai';
import { db } from '../firebase';
import { collection, doc, setDoc, updateDoc, getDocs, getDoc, query, where } from 'firebase/firestore';

// In AI Studio environment, the SDK initialization is:
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || '',
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build'
    }
  }
});

export interface AIScript {
  id: string;
  title: string;
  author: string;
  genre: string;
  description: string;
  artStyle: string;
  color: string;
  characterDescription: string; // One-sentence visual guide for the main character
  scripts: string[]; // Korean dialogue for each cut
  visualPrompts: string[]; // English visual prompts for AI generation
}

/**
 * Generates a new webtoon script based on latest trends.
 */
export async function generateDailyWebtoonScript(): Promise<AIScript> {
  const prompt = `
    Create a highly creative, trend-matching webtoon concept for 2026.
    Include a catchy title, a description (MZ/GenAlpha style), a unique genre mix (e.g., 'Gourmet Cyberpunk', 'Idol Fantasy Noir'), and a detailed art style description.
    Also, provide a 'characterDescription' which is a specific visual guide for the main character (e.g. 'A black-haired swordsman with a red mechanical eye wearing a black hanbok').
    Finally, generate exactly 12 scenes (cuts). 
    For each scene provide:
    1. 'scripts': The Korean dialogue/narrative.
    2. 'visualPrompts': A detailed English visual prompt describing the scene for an image AI, including the character and environment.
    
    Return the response in JSON format (IMPORTANT: NO MARKDOWN):
    {
      "title": "Title",
      "author": "AI Creative Engine",
      "genre": "Genre",
      "description": "Short catchy description",
      "artStyle": "Detailed visual style prompt",
      "characterDescription": "English visual descriptor for character consistency",
      "color": "Hex color code",
      "scripts": ["Korean text 1", ...],
      "visualPrompts": ["English visual prompt 1", ...]
    }
  `;

  // Correct SDK call: ai.models.generateContent
  const result = await ai.models.generateContent({
    model: 'gemini-3.5-flash',
    contents: prompt
  });
  
  const text = result.text || '';
  const cleanJson = text.replace(/```json|```/g, '').trim();
  const script = JSON.parse(cleanJson);
  
  return {
    ...script,
    id: `ai-${Date.now()}`
  };
}

/**
 * Saves the script to Firestore as a pending/approved webtoon.
 */
export async function saveScriptToDB(script: AIScript) {
  const webtoonRef = doc(db, 'webtoons', script.id);
  
  const webtoonData = {
    id: script.id,
    title: script.title,
    author: script.author,
    genre: script.genre,
    rating: 5.0,
    thumbnail: 'https://images.unsplash.com/photo-1620145694458-510978ce2196?auto=format&fit=crop&q=80&w=400&h=600', // Placeholder
    banner: 'https://images.unsplash.com/photo-1620145694458-510978ce2196?auto=format&fit=crop&q=80&w=1920&h=1080', // Placeholder
    description: script.description,
    isNew: true,
    isHot: Math.random() > 0.5,
    status: 'approved',
    readerCount: Math.floor(Math.random() * 50000),
    color: script.color,
    characterDescription: script.characterDescription,
    episodes: [{
      id: 'ep-1',
      number: 1,
      title: '제 1화: 운명의 시작',
      pages: [], // Will be filled with AI images
      scripts: script.scripts,
      visualPrompts: script.visualPrompts || [],
      artStyle: script.artStyle
    }]
  };

  await setDoc(webtoonRef, webtoonData);
  return script.id;
}

/**
 * Generates an image URL for a specific cut based on dialogue and style.
 * We include the dialogue content heavily in the prompt to ensure it matches the script.
 */
export async function generateCutImage(visualPrompt: string, artStyle: string, characterDescription: string, color: string): Promise<string> {
  // We use the English visual prompt with character profile for consistency
  const basePrompt = encodeURIComponent(`high quality manhwa style webtoon cut, ${characterDescription}, ${visualPrompt}, style of ${artStyle}, cinematic lighting, ${color} theme, highly detailed, no text in image`);
  const seed = Math.floor(Math.random() * 1000000);
  return `https://image.pollinations.ai/prompt/${basePrompt}?nologo=true&seed=${seed}&width=720&height=1280`;
}

/**
 * Batch updates a webtoon's episode pages with AI generated images.
 * This runs cut by cut, using the script to generate matching visuals.
 */
export async function generateAndSyncImages(webtoonId: string) {
  const webtoonRef = doc(db, 'webtoons', webtoonId);
  const snap = await getDoc(webtoonRef);
  
  if (!snap.exists()) return;
  
  const webtoon = snap.data();
  const episodes = [...(webtoon.episodes || [])];
  
  if (episodes.length === 0) return;
  
  const episode = episodes[0];
  const visualPrompts = episode.visualPrompts || episode.scripts || [];
  const artStyle = episode.artStyle || webtoon.genre;
  const characterDescription = webtoon.characterDescription || 'a main character';
  const themeColor = webtoon.color || '#ff0055';
  
  const newPages: string[] = [];
  
  // Cut-by-cut generation based on English visual prompts
  for (const vPrompt of visualPrompts) {
    const img = await generateCutImage(vPrompt, artStyle, characterDescription, themeColor);
    newPages.push(img);
  }
  
  // If no scripts, generate at least 10 placeholder matching style
  if (newPages.length === 0) {
    for (let i = 0; i < 10; i++) {
      const img = await generateCutImage(`${webtoon.title} story scene ${i}`, artStyle, characterDescription, themeColor);
      newPages.push(img);
    }
  }
  
  // Update the entire episode object in the array
  const updatedEpisodes = episodes.map((ep, idx) => {
    if (idx === 0) {
      return { ...ep, pages: newPages };
    }
    return ep;
  });
  
  await updateDoc(webtoonRef, {
    episodes: updatedEpisodes,
    thumbnail: newPages[0] || webtoon.thumbnail,
    banner: newPages[0] || webtoon.banner,
    status: 'completed'
  });
}

/**
 * Updates specific cut data (script or visual prompt) in Firestore.
 */
export async function updateCutData(webtoonId: string, episodeIndex: number, cutIndex: number, field: 'scripts' | 'visualPrompts', newValue: string) {
  const webtoonRef = doc(db, 'webtoons', webtoonId);
  const snap = await getDoc(webtoonRef);
  if (!snap.exists()) return;

  const webtoon = snap.data();
  const episodes = [...(webtoon.episodes || [])];
  if (!episodes[episodeIndex]) return;

  const episode = episodes[episodeIndex];
  const list = [...(episode[field] || [])];
  list[cutIndex] = newValue;
  
  episodes[episodeIndex] = { ...episode, [field]: list };
  await updateDoc(webtoonRef, { episodes });
}

/**
 * Regenerates images for specific cut indices.
 */
export async function regenerateCuts(webtoonId: string, episodeIndex: number, cutIndices: number[]) {
  const webtoonRef = doc(db, 'webtoons', webtoonId);
  const snap = await getDoc(webtoonRef);
  if (!snap.exists()) return;

  const webtoon = snap.data();
  const episodes = [...(webtoon.episodes || [])];
  if (!episodes[episodeIndex]) return;

  const episode = episodes[episodeIndex];
  const visualPrompts = episode.visualPrompts || [];
  const characterDescription = webtoon.characterDescription || '';
  const artStyle = episode.artStyle || webtoon.genre;
  const themeColor = webtoon.color || '#ff0055';
  const pages = [...(episode.pages || [])];
  const pagesHistory = { ...(episode.pagesHistory || {}) }; // Map of index -> array of URLs

  for (const idx of cutIndices) {
    const prompt = visualPrompts[idx] || (episode.scripts && episode.scripts[idx]) || `${webtoon.title} scene ${idx}`;
    const newImg = await generateCutImage(prompt, artStyle, characterDescription, themeColor);
    
    // Save current to history before updating
    if (pages[idx]) {
      if (!pagesHistory[idx]) pagesHistory[idx] = [];
      if (!pagesHistory[idx].includes(pages[idx])) {
        pagesHistory[idx].push(pages[idx]);
      }
    }
    
    pages[idx] = newImg;
  }

  episodes[episodeIndex] = { ...episode, pages, pagesHistory };
  await updateDoc(webtoonRef, { 
    episodes,
    thumbnail: pages[0] || webtoon.thumbnail,
    banner: pages[0] || webtoon.banner
  });
}
