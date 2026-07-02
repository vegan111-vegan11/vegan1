import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../firebase";
import { collection, doc, setDoc, getDoc, getDocs, addDoc, query, where, orderBy } from "firebase/firestore";

// Initialize Gemini via GoogleGenAI SDK using target parameters
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

export interface CharacterProfile {
  name: string;
  personality: string;
  background: string;
}

export interface CharacterAnalysis {
  visualAnalysis: string;
  characterProfile: CharacterProfile;
}

export interface MovieInfo {
  title: string;
  genre: string;
  logline: string;
}

export interface CueSheetItem {
  sceneNo: string;
  shotNo: string;
  shotType: string; // e.g., CU, MCU, MS, MLS, OTS, POV, ELS
  cameraAngleAndMovement: string; // e.g., Low Angle, Slow Dolly In
  lightingAndColor: string; // Cinematic tone
  emotionAndActingGuide: string; // Actor directive
  shotMeaning: string; // Thematic purpose
}

export interface ColorPaletteItem {
  colorName: string;
  hex: string;
}

export interface DetailItem {
  title: string;
  description: string;
}

export interface ExpressionItem {
  emotionName: string;
  desc: string;
}

export interface AdvancedCharacterInfo {
  name: string;
  englishName: string;
  age: string;
  personality: string;
  traits: string;
  likes: string[];
  dislikes: string[];
  slogan: string;
}

export interface MovieCueSheetSetup {
  id: string;
  userId?: string;
  userEmail?: string;
  imageUrl: string;
  movieInfo: MovieInfo;
  characterAnalysis: CharacterAnalysis;
  cueSheet: CueSheetItem[];
  bonusDialogue: string;
  createdAt: string;
  // Advanced blueprint attributes modeled after character cue sheets
  characterInfo?: AdvancedCharacterInfo;
  colorPalette?: ColorPaletteItem[];
  details?: DetailItem[];
  expressions?: ExpressionItem[];
  lightingAndBgTips?: string[];
  bestComboGuides?: string[];
}

/**
 * Generates a complete cinema cue sheet from an uploaded picture base64 string.
 */
export async function generateCinemaCueSheet(
  base64Data: string,
  mimeType: string,
  userPromptAddition?: string
): Promise<Omit<MovieCueSheetSetup, "id" | "createdAt">> {
  // Construct the professional cinematography system guidelines
  const prompt = `
    You are an expert Hollywood film director, character concept designer, and visual storyteller.
    Analyze the uploaded portrait image of the character and build an extremely detailed character draft sheet and production cue sheet (blueprint) inspired by the layout shown in character concept cue sheets.

    [ANALYSIS & CREATION INSTRUCTIONS]
    1. Visual Character Analysis: Analyze the face, clothing, gaze, emotional tone, background, and lighting in the portrait deeply to establish character traits.
    2. Character Profiling (characterInfo): Design an elegant biography:
       - name: Appropriate Korean name (e.g. 뿡잉, 은솔, 수연 등)
       - englishName: English name in uppercase (e.g., PPOING, EUNSOL, etc.)
       - age: Suggest an appropriate age (e.g., "20살", "19살" 등)
       - personality: 1 paragraph describing personality
       - traits: 1-2 sentence core characteristics
       - likes: 3-4 things this character likes (e.g., 네컷 사진 찍기, 밤하늘 감상, 악세사리 모으기 등)
       - dislikes: 3-4 things this character dislikes (e.g. 시끄러운 곳, 어두운 골목 등)
       - slogan: A cute, touchy tagline/quote representing the character's motivation (e.g., "훌쩍이인데 힙한 타투하고 싶어!")
    3. Production Movie Info: Deduce an appropriate cinematic title, genre (e.g., 로맨틱 판타지, 사이버펑크 디스토피아, 고딕 스릴러 등) and a captivating 1-line logline.
    4. Screenplay Cue Sheet: Generate 5 sequential, coherent cinematic shots keeping deep visual continuity.
    5. Golden Line: Suggest exactly 1 complementary, high-impact dialogue line for the climax scene.
    6. Color Palette (colorPalette): Extract 8 main aesthetic coloring tones as Hex colors, giving each a short unique name (e.g., "라벤더 퍼플", "딥 메탈릭" 등) and HEX values (e.g. "#4E2161").
    7. Accent Details (details): Identify 4 distinct visual details/accessories from the character's clothing, hair, jewelry or expression (e.g., "포니테일 & 브릿지", "실버 서클 이어링" 등) and describe them with short explanations.
    8. Expression Guide (expressions): Frame 4 key emotional styles ("기본/기쁨", "장난/윙크", "놀람/호기심", "부끄러움") and write a direct visual/acting guideline for each (e.g. "입술을 지그시 다물고 미소를 머금은 귀여운 표정" 등).
    9. Lighting & Background Tips (lightingAndBgTips): Provide 4-5 specific production tips for scene setups (e.g. "렘브란트 조명을 사용해 얼굴 선과 입체적 음영 극대화" 등).
    10. Best Combo Tags (bestComboGuides): Provide exactly 3 short highlighted keywords (e.g., "MZ 감성 캐릭터 디자인", "렘브란트 입체 조명", "배경 연출 최적화").

    Your terminology should be highly professional, utilizing industry jargon (e.g., Rembrandt lighting, keylight, ambient lighting, accent points, silhouette, etc.).
    All outputs must be written in Korean language.
  `;

  const imagePart = {
    inlineData: {
      data: base64Data,
      mimeType: mimeType
    }
  };

  const response = await ai.models.generateContent({
    model: "gemini-3.5-flash",
    contents: [imagePart, { text: prompt }],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          movieInfo: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "영화 제목" },
              genre: { type: Type.STRING, description: "영화 장르" },
              logline: { type: Type.STRING, description: "영화 로그라인 1줄" }
            },
            required: ["title", "genre", "logline"]
          },
          characterAnalysis: {
            type: Type.OBJECT,
            properties: {
              visualAnalysis: { type: Type.STRING, description: "인물 사진 정밀 분석" },
              characterProfile: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING, description: "주인공 이름" },
                  personality: { type: Type.STRING, description: "성격 특징 (1-2줄)" },
                  background: { type: Type.STRING, description: "캐릭터 배경 서사 (1-2줄)" }
                },
                required: ["name", "personality", "background"]
              }
            },
            required: ["visualAnalysis", "characterProfile"]
          },
          cueSheet: {
            type: Type.ARRAY,
            description: "5개로 구성된 씬 큐시트 연출 일람",
            items: {
              type: Type.OBJECT,
              properties: {
                sceneNo: { type: Type.STRING, description: "씬 번호 (예: Scene #1)" },
                shotNo: { type: Type.STRING, description: "샷 번호 (예: Shot #1)" },
                shotType: { type: Type.STRING, description: "샷 규격 (예: CU, MCU, MS, MLS, OTS, POV, WS etc)" },
                cameraAngleAndMovement: { type: Type.STRING, description: "카메라 앵글, 화각 및 무브먼트 안내" },
                lightingAndColor: { type: Type.STRING, description: "조명 배정 및 시네마틱 색채 톤설정" },
                emotionAndActingGuide: { type: Type.STRING, description: "배우 실전 감정 상태 지침 및 연기 가이드" },
                shotMeaning: { type: Type.STRING, description: "해당 프레임이 스토리에 미치는 상징적 의미" }
              },
              required: ["sceneNo", "shotNo", "shotType", "cameraAngleAndMovement", "lightingAndColor", "emotionAndActingGuide", "shotMeaning"]
            }
          },
          bonusDialogue: { type: Type.STRING, description: "이 장면을 보완할 수 있는 주인공의 명대사 1줄" },
          
          // Enhanced fields
          characterInfo: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: "한국형 이름" },
              englishName: { type: Type.STRING, description: "대문자 영어 이름" },
              age: { type: Type.STRING, description: "나이 (예: 20살)" },
              personality: { type: Type.STRING, description: "성격 요약 블록" },
              traits: { type: Type.STRING, description: "어록 한 줄 성향 특징" },
              likes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "좋아하는 것 리스트 3-4개"
              },
              dislikes: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "싫어하는 것 리스트 3-4개"
              },
              slogan: { type: Type.STRING, description: "핵심 개성 모토/슬로건" }
            },
            required: ["name", "englishName", "age", "personality", "traits", "likes", "dislikes", "slogan"]
          },
          colorPalette: {
            type: Type.ARRAY,
            description: "인물 디자인 핵심 컬러 팔레트 8가지 블록",
            items: {
              type: Type.OBJECT,
              properties: {
                colorName: { type: Type.STRING, description: "색상 기칭 (예: 딥 네이비, 머드, 라벤더 퍼플 등)" },
                hex: { type: Type.STRING, description: "헥스 코드 (예: #1E2235)" }
              },
              required: ["colorName", "hex"]
            }
          },
          details: {
            type: Type.ARRAY,
            description: "인물 장식 및 악세사리 디테일 분석 4가지 블록",
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: "구획명 (예: 헤어 & 악세사리, 귀걸이 & 피어싱, 시스루 자켓, 타투 등)" },
                description: { type: Type.STRING, description: "해당 디테일의 특징 분석 가이드" }
              },
              required: ["title", "description"]
            }
          },
          expressions: {
            type: Type.ARRAY,
            description: "얼굴 연출에 따른 4가지 감정 상태 미장센 팁",
            items: {
              type: Type.OBJECT,
              properties: {
                emotionName: { type: Type.STRING, description: "표정명 (예: 기본/일반, 장난/윙크, 놀람/호기심, 부끄러움)" },
                desc: { type: Type.STRING, description: "해당 표정 연기를 표현하는 가이드 및 묘사" }
              },
              required: ["emotionName", "desc"]
            }
          },
          lightingAndBgTips: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "네컷 만화 및 영화 스펙에 들어갈 완벽한 조명 & 배경 연출 팁 4가지"
          },
          bestComboGuides: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "최적 조합 가이드 상단에 들어갈 태그 3가지"
          }
        },
        required: ["movieInfo", "characterAnalysis", "cueSheet", "bonusDialogue", "characterInfo", "colorPalette", "details", "expressions", "lightingAndBgTips", "bestComboGuides"]
      }
    }
  });

  const text = response.text || "";
  const cleanJson = text.replace(/```json|```/g, "").trim();
  const data = JSON.parse(cleanJson);

  return {
    movieInfo: data.movieInfo,
    characterAnalysis: data.characterAnalysis,
    cueSheet: data.cueSheet,
    bonusDialogue: data.bonusDialogue,
    imageUrl: "", // Will be set with the uploaded file url or base64 data preview
    characterInfo: data.characterInfo,
    colorPalette: data.colorPalette,
    details: data.details,
    expressions: data.expressions,
    lightingAndBgTips: data.lightingAndBgTips,
    bestComboGuides: data.bestComboGuides
  };
}

/**
 * Saves generated cue sheet to Firestore for sharing.
 */
export async function saveCueSheetToFirestore(
  cueSheetData: Omit<MovieCueSheetSetup, "id" | "createdAt">,
  userId?: string,
  userEmail?: string
): Promise<string> {
  const id = `cuesheet-${Date.now()}`;
  const docRef = doc(db, "movie_cue_sheets", id);
  const payload: MovieCueSheetSetup = {
    ...cueSheetData,
    id,
    userId: userId || "anonymous",
    userEmail: userEmail || "비회원",
    createdAt: new Date().toISOString()
  };

  await setDoc(docRef, payload);
  return id;
}

/**
 * Retrieves cue sheets from Firestore for gallery display.
 */
export async function fetchCueSheets(): Promise<MovieCueSheetSetup[]> {
  try {
    const q = query(collection(db, "movie_cue_sheets"), orderBy("createdAt", "desc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => doc.data() as MovieCueSheetSetup);
  } catch (err) {
    console.warn("Firestore cuesheets fetch failed or empty:", err);
    return [];
  }
}
