import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // Initialize GoogleGenAI SDK
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  async function translateAndOptimizePrompt(rawPrompt: string, aiInstance: GoogleGenAI): Promise<string> {
    try {
      console.log(`[Gemini Text Translator] Translating and optimizing prompt...`);
      const response = await aiInstance.models.generateContent({
        model: "gemini-2.5-flash",
        contents: {
          parts: [{
            text: `You are an expert anime character designer, concept artist, and prompt engineer for text-to-image models (Stable Diffusion, Midjourney, Flux, Gemini).
Your task is to translate and optimize the following raw Korean/English character cue sheet description into an extremely detailed, high-fidelity, professional English text-to-image prompt.

Rules:
1. Translate any Korean terms to highly accurate subculture/anime/fashion English terms (e.g., "시스루 자켓" -> "translucent sheer jacket", "혼령 참 장식" -> "ghost charm ornaments", "체인 & 스트랩" -> "silver chains and leather straps").
2. Describe specific features in detail (e.g. hairstyle, hair color, eye style, eye color, specific outfits, accessories, and shoes).
3. Append rich styling, rendering, and lighting keywords to guarantee supreme quality (e.g., "masterpiece, masterpiece 2D anime digital art, highly detailed anime illustration, gorgeous key visual, vibrant colors, clean lineart, soft realistic cinematic lighting, dramatic shading, 8k resolution").
4. Keep the output as a single-line English prompt. Do NOT include any intro, outro, explanations, markdown code blocks, or other text. Just the final prompt itself.

Raw Input: ${rawPrompt}`
          }]
        }
      });
      
      let enhanced = response.text?.trim() || rawPrompt;
      enhanced = enhanced.replace(/```[a-z]*\n?/gi, "").replace(/```/g, "").trim();
      return enhanced;
    } catch (err) {
      console.warn("Prompt enhancement via Gemini text model failed, using raw prompt:", err);
      return rawPrompt;
    }
  }

  // 1. API: Generate image with Gemini Models (gemini-2.5-flash-image or gemini-3.1-flash-image)
  app.post("/api/generate-image", async (req, res) => {
    let optimizedPrompt = req.body.prompt || "";
    try {
      const { prompt, aspectRatio, model } = req.body;
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }

      // Automatically translate & optimize via Gemini 2.5 Flash Text API first!
      optimizedPrompt = await translateAndOptimizePrompt(prompt, ai);
      console.log(`[Gemini Image Gen] Optimized Prompt: ${optimizedPrompt}`);

      const selectedModel = model || "gemini-2.5-flash-image";
      const selectedAspectRatio = aspectRatio || "1:1";

      console.log(`[Gemini Image Gen] Generating with model=${selectedModel}, aspectRatio=${selectedAspectRatio}`);

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents: {
          parts: [{ text: optimizedPrompt }]
        },
        config: {
          imageConfig: {
            aspectRatio: selectedAspectRatio,
          }
        }
      });

      let base64Data = "";
      const candidates = response.candidates;
      if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData && part.inlineData.data) {
            base64Data = part.inlineData.data;
            break;
          }
        }
      }

      if (!base64Data) {
        console.error("[Gemini Image Gen] No inlineData found in response parts.");
        throw new Error("Failed to extract image data from Gemini response");
      }

      const dataUrl = `data:image/png;base64,${base64Data}`;
      res.json({ imageUrl: dataUrl, optimizedPrompt });
    } catch (error: any) {
      console.warn(`[Gemini Image Gen Info] Gemini API quota hit or restricted. Silently falling back to Pollinations AI alternative high-quality generator.`);
      
      const { aspectRatio } = req.body;
      let width = 600;
      let height = 600;
      if (aspectRatio === "3:4") {
        width = 600;
        height = 800;
      } else if (aspectRatio === "4:3") {
        width = 800;
        height = 600;
      }
      
      // Clean and safe prompt encoding with random seed to guarantee fresh generation
      const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(optimizedPrompt || "character design")}?width=${width}&height=${height}&nologo=true&enhance=true&seed=${Math.floor(Math.random() * 1000000)}`;
      
      console.info(`[Fallback Success] Generated Pollinations AI fallback URL: ${pollinationsUrl}`);
      res.json({ 
        imageUrl: pollinationsUrl, 
        fallback: true,
        optimizedPrompt,
        error: error.message || error.toString() 
      });
    }
  });

  // 2. API: Proxy text or other requests if needed in the future
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", geminiKeyConfigured: !!process.env.GEMINI_API_KEY });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
});
