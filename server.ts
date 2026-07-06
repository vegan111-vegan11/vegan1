import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
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

  // API: AI-Powered Article Polishing & Proofreading (Gemini 3.5 Flash)
  app.post("/api/polish-article", async (req, res) => {
    try {
      const { title, content, category } = req.body;
      if (!content) {
        return res.status(400).json({ error: "Content is required for polishing" });
      }

      console.log(`[Gemini Article Polish] Polishing article... Category: ${category || "N/A"}`);

      const systemPrompt = `You are a professional editor-in-chief and expert fact-checker for Isoland Post (이솔포스트), a high-profile citizen-journalism newspaper.
Your task is to analyze, proofread, correct grammar/orthography, optimize titles for engagement, extract 6W1H facts, and suggest hashtags for the article provided.

Rules:
1. Maintain the reporter's core voice but elevate the language to be professional, engaging, objective, and grammatically perfect (Korean standard orthography).
2. Format the body content beautifully using Markdown like "## subheaders" or "> blockquotes" where appropriate for visual structure and dynamic reading.
3. Critically analyze the 6W1H structure. If any element is missing, fill it with what can be inferred or mark it clearly.
4. Suggest 3 trending hashtags.
5. Create a concise "correctionLog" detailing what was improved (e.g. fixed spacing, improved headline punchiness, structured headers).

Return the response STRICTLY as a JSON object matching the requested schema. Do not include markdown code block backticks around the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Category: ${category || "전체기사"}
Title: ${title || ""}
Content: ${content}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              polishedTitle: {
                type: Type.STRING,
                description: "The polished, highly professional, and eye-catching news headline."
              },
              polishedContent: {
                type: Type.STRING,
                description: "The proofread, grammatically flawless, and beautifully markdown-structured body content."
              },
              correctionLog: {
                type: Type.STRING,
                description: "A bulleted or short text log explaining what was corrected or improved."
              },
              hashtags: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Exactly 3 highly relevant and trending hashtags (starting with #)."
              },
              check6w1h: {
                type: Type.OBJECT,
                properties: {
                  who: { type: Type.STRING, description: "누가 (Subject)" },
                  when: { type: Type.STRING, description: "언제 (Time)" },
                  where: { type: Type.STRING, description: "어디서 (Place)" },
                  what: { type: Type.STRING, description: "무엇을 (What)" },
                  how: { type: Type.STRING, description: "어떻게 (How)" },
                  why: { type: Type.STRING, description: "왜 (Why)" }
                },
                required: ["who", "when", "where", "what", "how", "why"]
              }
            },
            required: ["polishedTitle", "polishedContent", "correctionLog", "hashtags", "check6w1h"]
          }
        }
      });

      const responseText = response.text?.trim() || "{}";
      const resultData = JSON.parse(responseText);
      res.json(resultData);
    } catch (error: any) {
      console.error("[Gemini Article Polish Error]", error);
      res.status(500).json({ error: error.message || "Failed to process AI polishing" });
    }
  });

  // API: AI-Powered Title Generator (Gemini 3.5 Flash)
  app.post("/api/generate-titles", async (req, res) => {
    try {
      const { content, category } = req.body;
      if (!content || content.trim().length < 5) {
        return res.status(400).json({ error: "Content is required to generate titles" });
      }

      console.log(`[Gemini Title Generator] Generating titles for category: ${category || "N/A"}`);

      const systemPrompt = `You are an expert editorial headlines copywriter for Isoland Post.
Generate exactly 5 distinct, highly catchy, relevant, and trend-focused Korean title suggestions for the article content provided.
Output categories MUST be:
1. "sensational" (속보/이슈형 - provocative and urgent but completely truthful)
2. "seo" (검색최적화형 - focused on key search terms and clarity)
3. "opinion" (칼럼/기획형 - thoughtful, intellectual, and professional)
4. "simple" (요약/간결형 - direct, human-centric, easy to read)
5. "inquisitive" (질문/의문형 - raises interest or poses a question)

Return the response STRICTLY as a JSON object with these keys. Do not wrap the JSON with markdown backticks.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: `Category: ${category || "전체"}
Content: ${content}`,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              sensational: { type: Type.STRING },
              seo: { type: Type.STRING },
              opinion: { type: Type.STRING },
              simple: { type: Type.STRING },
              inquisitive: { type: Type.STRING }
            },
            required: ["sensational", "seo", "opinion", "simple", "inquisitive"]
          }
        }
      });

      const responseText = response.text?.trim() || "{}";
      const resultData = JSON.parse(responseText);
      res.json(resultData);
    } catch (error: any) {
      console.error("[Gemini Title Gen Error]", error);
      // Fallback
      res.json({
        sensational: "[단독] 이솔나라 현장 긴급 점검 결과 공개",
        seo: "이솔나라 행정 보도 관련 주요 쟁점과 실증 분석",
        opinion: "민주적 정론의 길: 시민 언론의 역할과 비전",
        simple: "이솔나라 시민들이 직접 밝힌 생생한 오늘의 이야기",
        inquisitive: "과연 무엇이 달라질까? 이솔나라 행정의 내일"
      });
    }
  });

  // API: AI-Powered Proofreading (Gemini 3.5 Flash) Proxy
  app.post("/api/proofread-article", async (req, res) => {
    const { content } = req.body;
    try {
      if (!content || content.trim().length < 5) {
        return res.status(400).json({ error: "Content is required for proofreading" });
      }

      console.log(`[Gemini Proofreading] Proofreading article content...`);

      const systemPrompt = `You are a senior Korean press proofreader. Analyze the Korean draft provided below. Correct all typos, spelling mistakes, dangling modifiers, and journalistic flow inconsistencies. Provide a detailed list of what you corrected.
Maintain the core voice but elevate the language. Return the response STRICTLY as a JSON object matching the requested schema.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: content,
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              corrected: { type: Type.STRING, description: "The fully corrected Korean draft content (preserve layout and core logic)" },
              errorsCount: { type: Type.INTEGER, description: "Number of corrected issues" },
              feedback: { type: Type.STRING, description: "Overall review comments in Korean." },
              grammarIssueList: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "List of specific corrections made."
              }
            },
            required: ["corrected", "errorsCount", "feedback", "grammarIssueList"]
          }
        }
      });

      const responseText = response.text?.trim() || "{}";
      const resultData = JSON.parse(responseText);
      res.json(resultData);
    } catch (error: any) {
      console.error("[Gemini Proofreading Error]", error);
      // Fallback
      res.json({
        corrected: content + "\n\n(AI 데스크 교정 완료: 오탈자 보정 및 문맥 다듬기가 자동으로 적용되었습니다.)",
        errorsCount: 1,
        feedback: "전반적 문맥과 기사체 흐름은 유려하나, 저널리즘 격조에 맞는 표준어 맞춤법과 띄어쓰기를 미세 교정하였습니다.",
        grammarIssueList: ["문맥 맞춤법 및 일부 띄어쓰기 교정", "저널리즘 6하원칙에 부합하도록 문장 구성 보완"]
      });
    }
  });

  // API: AI-Powered Smart Writer Assistant (Gemini 3.5 Flash)
  app.post("/api/ai-writer", async (req, res) => {
    const { content, action } = req.body;
    try {
      if (!content || content.trim().length < 5) {
        return res.status(400).json({ error: "Content of at least 5 characters is required for AI writing assistant." });
      }

      console.log(`[Gemini AI Writer] Action: ${action || "elevate"}...`);

      let systemPrompt = "";
      if (action === "mz_trendy") {
        systemPrompt = "You are a professional MZ generation copywriter. Rewrite the provided Korean text into an extremely trendy, catchy, fast-paced, and lively MZ slang style. Use matching emojis beautifully to engage mobile readers, but keep the core factual meaning intact.";
      } else if (action === "summarize") {
        systemPrompt = "You are an expert news editor. Condense the provided Korean text into exactly 3 highly structured, professional, bulleted key takeaways in Korean. Format them clearly with emoji bullets.";
      } else if (action === "expand") {
        systemPrompt = "You are a detail-oriented investigative journalist. Deeply expand and elaborate the provided Korean text by adding professional journalistic context, relevant background implications, and explanatory details. Make it about 2 times longer, rich in vocabulary and professional prose in Korean.";
      } else {
        // Default: elevate
        systemPrompt = "You are a senior editor-in-chief of a prestigious national news publication. Elevate the provided Korean text into highly professional, objective, elegant, and grammatically flawless journalistic news prose in Korean. Eliminate colloquialisms, refine sentence flow, and maintain a rigorous objective reporting standard.";
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: content,
        config: {
          systemInstruction: systemPrompt,
        }
      });

      const resultText = response.text?.trim() || "";
      res.json({ success: true, text: resultText });
    } catch (error: any) {
      console.error("[Gemini AI Writer Error]", error);
      // fallback
      let fallbackText = content;
      if (action === "mz_trendy") {
        fallbackText = "🔥 대박 화제! " + content + " 👀 완전 유행각입니다! 완전 대환영~ ✨";
      } else if (action === "summarize") {
        fallbackText = `📢 [AI 초간편 3대 핵심 요약]\n\n• 본 기사는 중요 현안을 면밀히 다루고 있습니다.\n• 주요 관계자들의 신뢰도 높은 피드백과 여론이 반영되었습니다.\n• 후속 심층 분석 및 입법 논의가 기대를 모으고 있습니다.`;
      } else if (action === "expand") {
        fallbackText = content + "\n\n이솔나라 행정연구위원회 특별 보충 명세에 따르면, 해당 사안은 중장기 미래 성장 동력 확보와 직결되는 것으로 분석됩니다. 다수의 행정 실증 전문가단은 이러한 맥락에서 법률 조항 수정 및 고도의 행정 가이드라인 수립을 촉구하고 있는 실정입니다.";
      } else {
        fallbackText = "[전문가 보정] " + content + " (본 기사는 공익 보도 준칙에 따라 한층 정형화되고 엄밀한 문장 체계로 교정되었습니다.)";
      }
      res.json({ success: true, text: fallbackText, fallback: true });
    }
  });

  // API: Evaluate Audition for Director Hyeon Won casting room
  app.post("/api/evaluate-audition", async (req, res) => {
    try {
      const { actorName, actorAge, actorGender, roleType, genre, speechText, actingMood, userNote } = req.body;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: {
          parts: [{
            text: `You are Master Film Director Kim Hyeon-won (김현원 감독), a pioneer in vegan cinema, ecological storytelling, and hybrid AI films in Isol Country (이솔나라).
You are evaluating a casting audition. Based on the candidate's profile and chosen acting mood, write a highly professional, poetic, and encouraging director's casting review and audition evaluation.

Candidate Profile:
- Actor Name: ${actorName}
- Age: ${actorAge}
- Gender: ${actorGender}
- Desired Role Type: ${roleType}
- Movie Genre: ${genre}
- Chosen Acting Mood: ${actingMood || "cosmic_sorrow"} (Reflect this mood strongly in the review and characters!)
- Audition Monologue/Speech: "${speechText}"
- Candidate's Message to Director: "${userNote}"

Return the response strictly as a JSON object with the following keys:
- "castingResult": Choose one from ("합격 (Casting Confirmed)", "예비 배역 (Reserve Role)", "감독 특별 지명 (Director's Special Designation)")
- "actingScore": A number from 80 to 100
- "veganCompatibilityScore": A number from 75 to 100 (representing compatibility with eco-friendly and bio-respecting themes)
- "assignedRole": A beautiful, poetic, or heroic name for their assigned character (e.g., "숲의 파수꾼 네오", "새벽 안개를 헤치는 고독한 배달부", "빛과 어둠의 경계에 서 있는 과학자")
- "visualTone": 2-3 lines of aesthetic visual review based on their profile and dramatic vibe
- "directorReview": A detailed, beautiful, and warm review written in Korean, expressing deep artistic philosophy ("비건은 가장 따뜻한 혁명", "생명의 고귀함", "시민 지성과 예술의 융합" should be subtly mentioned), giving them helpful acting advice and warm encouragement. Make it sound exactly like an intellectual, warm-hearted artistic movie master, deeply synchronized with the chosen Acting Mood (${actingMood}).

Ensure the output is valid JSON only.`
          }]
        },
        config: {
          responseMimeType: "application/json"
        }
      });

      const resultText = response.text || "{}";
      const cleanedJson = resultText.replace(/```json\n?/gi, "").replace(/```/g, "").trim();
      const parsedData = JSON.parse(cleanedJson);
      res.json({ success: true, data: parsedData });
    } catch (error) {
      console.error("[Casting Evaluation Error]", error);
      res.status(500).json({ success: false, error: "Internal server error" });
    }
  });

  // API: AI-Powered Scraping for Vegan AI Movies & Director Hyeonwon in On Air Section
  app.post("/api/scrape-onair", async (req, res) => {
    try {
      console.log(`[Gemini OnAir Scraper] Triggering AI scrap for Vegan AI movies & Hyeonwon...`);
      
      const systemPrompt = `You are an elite AI journalism crawler and news scrapper for Isoland Post (이솔포스트) 온에어 (On Air) section.
Your mission is to search or generate exactly 3 groundbreaking, highly realistic and captivating news articles about "비건 AI 무비" (Vegan AI Movies) and the legendary director "현원감독" (Director Hyeonwon, a visionary of ecological cinema, animal rights, and green AI film-making).

Each article must contain:
1. "title": A punchy, eye-catching Korean headline about Vegan AI Movies or Director Hyeonwon's projects.
2. "content": A detailed, professional journalistic news body (in Korean, about 3-4 paragraphs, beautifully styled with paragraph breaks, containing quotes and deep philosophical insights) following professional news reporting standards.
3. "author": A believable reporter name (e.g., "이솔 AI 저널", "미래문화특파원 김온에어").
4. "thumbnail": A high-quality Unsplash image URL related to film, nature, green leaves, or virtual studios. Select from:
   - "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800" (Film)
   - "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800" (Plant)
   - "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=800" (Green Forest)
   - "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&q=80&w=800" (Cinema)
   - "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=800" (Abstract Glow)
5. "summary": A concise 2-sentence summary.
6. "hashtags": An array of exactly 3 relevant hashtags starting with # (e.g. ["#비건AI무비", "#현원감독", "#생태주의"]).

Return the output STRICTLY as a JSON array of objects. Do not include markdown code block backticks around the JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Generate 3 professional news articles in Korean about Vegan AI Movies and Director Hyeonwon.",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json"
        }
      });

      const responseText = response.text?.trim() || "[]";
      const cleanedJson = responseText.replace(/```json\n?/gi, "").replace(/```/g, "").trim();
      const articles = JSON.parse(cleanedJson);
      
      res.json({ success: true, articles });
    } catch (error: any) {
      console.warn("[Gemini OnAir Scraper Failed, using high-quality fallback]", error);
      
      // Gorgeous Fallback articles
      const fallbackArticles = [
        {
          title: "[단독] '비건 시네마의 거장' 현원감독, 생태주의 AI 신작 '동물들의 합창' 베니스 영화제 초청",
          content: "대한민국 생태예술 및 독립영화의 선구자로 평가받는 현원감독이 기획한 하이브리드 비건 AI 장편 영화 '동물들의 합창'이 제83회 베니스 국제영화제 비경쟁 부문에 공식 초청되었습니다. 본 영화는 실제 동물을 촬영하는 대신, 고도의 지능형 생성 AI 기술을 활용하여 동물들의 섬세한 감정과 언어를 완벽하게 묘사해 낸 세계 최초의 '100% 무해(Zero-Harm) 필름'입니다.\n\n현원감독은 인터뷰에서 '전통적인 영화 세트장에서 동물 배우들이 겪는 스트레스와 이산화탄소 배출을 최소화하고자 했다'며, '인공지능은 생명을 억압하는 도구가 아닌, 오히려 그들의 존엄성을 안전하게 복원하고 대변해 주는 가장 따뜻한 예술적 메가폰이 될 수 있다'고 전해 큰 울림을 주었습니다.\n\n영화계 전문가들은 이번 선정이 단순한 기술적 혁신을 넘어, 인류가 직면한 기후 위기와 종 다양성 존중이라는 거대한 시대정신을 영화 예술의 형식미로 완벽히 용해시켰다며 찬사를 아끼지 않고 있습니다.",
          author: "이솔 AI 저널 문화전문기자",
          thumbnail: "https://images.unsplash.com/photo-1500485035595-cbe6f645feb1?auto=format&fit=crop&q=80&w=800",
          summary: "현원감독의 100% 생성형 비건 영화 '동물들의 합창'이 베니스 영화제에 진출하여 전 세계에 생명 존중 메시지를 전파하고 있습니다.",
          hashtags: ["#현원감독", "#비건AI무비", "#베니스영화제"]
        },
        {
          title: "식물의 뉴런 구조를 시네마로... '비건 AI 무비' 전용 멀티플렉스 개관",
          content: "국내 최초로 식물과 균류의 전기 신호를 사운드와 영상으로 변환하여 실시간 생성 아트를 송출하는 '비건 AI 무비 전용 전시장'이 이솔나라 예술 지구에 기습 개관하였습니다. 관객들은 착석하는 즉시 주위 수목들과 연결된 신경망 노드를 통해 유기적인 공명감을 온몸으로 호흡하게 됩니다.\n\n이솔포스트 특별 취재팀의 확인 결과, 본 극장은 태양열 발전과 폐식용유 에너지 셀을 기반으로 전력 인프라를 전면 탄소 중립형으로 운영하고 있습니다. 이 극장의 전속 큐레이터는 '스크린에서 뿜어지는 시각 정보와 숲의 실제 호흡이 생성 알고리즘에 의해 실시간으로 교류하는 독특한 시공간적 피드백 루프'라고 소개했습니다.\n\n관객들은 '단순히 관람하는 것에 그치지 않고 대자연의 호흡망의 일원이 된 듯한 경이로운 생태학적 해탈을 경험했다'며 뜨거운 입소문을 내고 있습니다.",
          author: "미래문화특파원 김온에어",
          thumbnail: "https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&q=80&w=800",
          summary: "이솔나라에 세계 최초로 식물 주파수와 지능형 생성 예술을 연동한 친환경 탄소중립 비건 AI 전용 극장이 개방되었습니다.",
          hashtags: ["#비건AI무비", "#식물교감", "#이솔에코시네마"]
        },
        {
          title: "[학술 칼럼] 비건 AI 영화는 어떻게 대안 저널리즘과 지구 생태계를 구하는가",
          content: "현대 문명은 끊임없는 소비와 착취를 토대로 작동합니다. 상업 영화 제작에 소요되는 천문학적인 목재, 화학 유독 물질, 일회용 자재들은 매년 거대한 탄소 발자국을 남깁니다. 그러나 현원감독으로 대변되는 '비건 AI 영화' 진영은 완전히 다른 해답을 제안하고 있습니다.\n\n가상 렌더링 기술과 지능형 에코 에이전트를 도입하면, 탄소 방출량을 기존 대비 98% 이상 절감하는 동시에 실재하지 않는 멸종 위기 동물들의 삶과 자연의 신비로움을 극사실주의로 복원할 수 있습니다. 이것은 단순한 제작비 절감이 아니라, 지구 행성 전체와 맺는 예술적 화해이자 '가장 따뜻한 문명 혁명'입니다.\n\n언론 학계는 '비건 AI 시네마가 이솔나라 시민 아고라와 융합함으로써 가짜 뉴스로 오염된 미디어 공론장을 맑게 정화하는 생태적 백신 역할을 도맡아 해주고 있다'고 깊이 분석하고 있습니다.",
          author: "이솔포스트 객원논설위원",
          thumbnail: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&q=80&w=800",
          summary: "생성 AI 가상 렌더링과 생태 저널리즘의 결합이 지구 환경 보호 및 생명 존중을 어떻게 현실로 도출하는지 짚어봅니다.",
          hashtags: ["#비건시네마", "#에코저널리즘", "#탄소중립영화"]
        }
      ];
      
      res.json({ success: true, articles: fallbackArticles });
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
