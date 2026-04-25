import { GoogleGenAI } from '@google/genai';
import { db } from '../App';
import { collection, doc, setDoc, updateDoc, getDocs, query, where } from 'firebase/firestore';

// In AI Studio environment, the SDK initialization is:
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface AIScript {
    id: string;
    title: string;
    author: string;
    genre: string;
    description: string;
    artStyle: string;
    color: string;
    scripts: string[]; // Dialogue for each cut (approx 10-15 cuts)
}

/**
 * Generates a new webtoon script based on latest trends.
 */
export async function generateDailyWebtoonScript(): Promise<AIScript> {
    const prompt = `
    Create a highly creative, trend-matching webtoon concept for 2026.
    Include a catchy title, a description (MZ/GenAlpha style), a unique genre mix (e.g., 'Gourmet Cyberpunk', 'Idol Fantasy Noir'), and a detailed art style description.
    Also, generate exactly 12 scenes (cuts) with dialogue or narrative text for each.
    
    Return the response in JSON format (IMPORTANT: NO MARKDOWN):
    {
      "title": "Title",
      "author": "AI Creative Engine",
      "genre": "Genre",
      "description": "Short catchy description",
      "artStyle": "Detailed visual style prompt (e.g. 'Highly detailed watercolor with neon highlights, cinematic lighting')",
      "color": "Hex color code representing the theme",
      "scripts": ["Line 1", "Line 2", ... "Line 12"]
    }
  `;

    // Correct SDK call: ai.models.generateContent
    const result = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
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
        status: 'approved',
        readerCount: 0,
        color: script.color,
        episodes: [{
            id: 'ep-1',
            number: 1,
            title: '제 1화: 운명의 시작',
            pages: [], // Will be filled with AI images
            scripts: script.scripts,
            artStyle: script.artStyle
        }]
    };

    await setDoc(webtoonRef, webtoonData);
    return script.id;
}

/**
 * Generates an image URL for a specific cut based on dialogue and style.
 */
export async function generateCutImage(dialogue: string, artStyle: string, color: string): Promise<string> {
    const basePrompt = encodeURIComponent(`${artStyle}, ${dialogue}, high quality, cinematic webtoon cut, ${color} theme, masterpiece, detailed`);
    const seed = Math.floor(Math.random() * 1000000);
    return `https://image.pollinations.ai/prompt/${basePrompt}?nologo=true&seed=${seed}&width=800&height=1200`;
}

/**
 * Batch updates a webtoon's episode pages with AI generated images.
 */
export async function generateAndSyncImages(webtoonId: string) {
    const q = query(collection(db, 'webtoons'), where('id', '==', webtoonId));
    const snap = await getDocs(q);

    if (snap.empty) return;

    const webtoonDoc = snap.docs[0];
    const webtoonRef = doc(db, 'webtoons', webtoonDoc.id);
    const webtoon = webtoonDoc.data();
    const episode = webtoon.episodes[0];
    const scripts = episode.scripts || [];
    const artStyle = episode.artStyle || webtoon.genre;

    const newPages: string[] = [];
    for (const scriptLine of scripts) {
        const img = await generateCutImage(scriptLine, artStyle, webtoon.color || '#ffffff');
        newPages.push(img);
    }

    await updateDoc(webtoonRef, {
        'episodes.0.pages': newPages,
        'thumbnail': newPages[0],
        'banner': newPages[0]
    });
}
