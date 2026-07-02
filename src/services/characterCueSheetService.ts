import { GoogleGenAI, Type } from "@google/genai";
import { db } from "../firebase";
import { collection, addDoc, getDocs, query, where, orderBy, Timestamp } from "firebase/firestore";

// Initialize Gemini SDK
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "",
  httpOptions: {
    headers: {
      "User-Agent": "aistudio-build"
    }
  }
});

export interface CharacterExpression {
  name: string;
  emotionEmoji: string;
  closeupDescription: string;
  actingPoint: string;
}

export interface CharacterEquipItem {
  name: string;
  type: string; // 무기, 의상, 악세서리, 상징물 등
  detailSpec: string;
  materialAndTexture: string;
}

export interface CharacterColor {
  colorName: string;
  hex: string;
  usage: string;
}

export interface CharacterDetailCut {
  title: string;
  desc: string;
}

export interface DesignKeyword {
  title: string;
  desc: string;
}

export interface CharacterTurnaroundCueSheet {
  id?: string;
  characterName: string;
  version: string;
  age: string;
  titleOrClass: string;
  worldviewAndGenre: string;
  logline: string;
  turnaround: {
    frontView: string;
    backView: string;
    sideView: string;
    threeQuarterView: string;
  };
  expressions: CharacterExpression[];
  equippedItems: CharacterEquipItem[];
  colorPalette: CharacterColor[];
  detailCuts: CharacterDetailCut[];
  characterInfo: {
    name: string;
    age: string;
    personality: string;
    traits: string;
    likes: string;
    dislikes: string;
    storyKeyword: string;
  };
  designKeywords: DesignKeyword[];
  directorDirectives: {
    keyFeature: string;
    lightingSetup: string;
    renderingStyle: string;
  };
  aiGenerativePrompt: {
    englishPrompt: string;
    koreanPrompt: string;
    negativePrompt: string;
  };
  originalImageUrl: string;
  generatedWideSheetUrl?: string;
  createdAt?: any;
}

/**
 * AI 기반 캐릭터 큐시트 및 턴어라운드 연출 분석 생성 함수
 * 사용자가 이름이나 세계관을 입력하지 않아도 이미지 비주얼을 스캔해 100% 자동 구축
 */
export async function generateCharacterCueSheet(
  imageBase64: string,
  mimeType: string,
  charName?: string,
  worldview?: string
): Promise<CharacterTurnaroundCueSheet> {
  const modelName = "gemini-3.5-flash";

  let customContext = "";
  if (charName) {
    customContext += `\n- 사용자가 희망하는 캐릭터 공식 이름: "${charName}" (반드시 이 이름을 기반으로 캐릭터 데이터를 매칭해 설계하고 반환 항목의 공식 캐릭터명에 반영할 것)`;
  }
  if (worldview) {
    customContext += `\n- 사용자가 희망하는 세계관 및 작품 장르: "${worldview}" (반드시 이 세계관과 분위기에 부합하도록 캐릭터의 운명, 로그라인, 프롬프트를 창작할 것)`;
  }

  const promptText = `
너는 웹툰 IP, 서브컬처 애니메이션, 일러스트, 실사 코스프레 등의 수석 캐릭터 비주얼 디렉터다.
사용자가 업로드한 원본 캐릭터 이미지를 첨단 비전 기술로 극도로 정밀하게 스캔하여, 해당 캐릭터의 헤어 스타일/색상, 눈동자 색상, 이목구비, 메이크업 특징뿐만 아니라 입고 있는 의상(옷의 레이어, 아우터, 이너, 핏, 옷감), 신발, 양말, 가터벨트, 장신구(목걸이, 체인, 귀걸이, 초커, 헤어핀 등)를 100% 식별하고 묘사해라.
${customContext}

[가장 중요 - 원본 화풍(Style)의 철저한 판독 및 보존]
1. 원본 이미지가 '실사 사진(Photorealistic / Real Cosplay / Cinematic Movie Photo)'인지, '2D 아니메/웹툰 일러스트(2D Anime/Illustration/Manga)'인지, '3D 게임/CGI 그래픽(3D Render/CGI Game Art)'인지 100% 판독해라.
2. 판독한 원본 화풍을 aiGenerativePrompt.englishPrompt의 가장 앞부분에 강력한 고정 키워드로 선언해야 한다:
   - 실사인 경우: "a photorealistic masterpiece photo, cinematic award-winning cosplay photography, captured on 35mm lens, realistic human skin textures and high-fidelity fabric details"
   - 2D 일러스트인 경우: "highly detailed 2D anime illustration, elegant webtoon digital art key visual, clean lineart, vibrant flat anime colors"
   - 3D 게임인 경우: "AAA game character 3D concept model, rendered in unreal engine 5, octane render, stylized CGI art"

[3면도 턴어라운드 구도 통제 핵심 규칙 (앞/옆/뒤 전신 칼정렬)]
1. AI 이미지 생성기가 머리만 자르거나(cropped head), 발을 자르는(cropped feet) 현상을 원천 방지하기 위해 'full body standing pose, head-to-toe complete view, no cropping'을 명시할 것.
2. 3면도가 완벽히 정렬된 한 장의 wide 이미지로 뽑히도록 아래 구도 선언문을 englishPrompt에 앵커링할 것:
   "Official character model sheet, complete full-body turnaround view, three views of the EXACT same character: a front view, a side view, and a back view standing side-by-side in one single horizontal wide frame. Symmetrical alignment, nicely spaced, well-proportioned full body standing upright from head to toe, no cropped head, no cropped feet, clean flat solid white background."
3. 앞면(Front), 옆면(Side), 뒷면(Back)의 인물이 완전히 동일한 얼굴(identical face)과 동일한 의복(identical clothing)을 완벽하게 일관성 있게 유지하도록 지시할 것.

[aiGenerativePrompt.englishPrompt 필수 포맷 템플릿]
반드시 다음 구조를 엄격히 준수하여 englishPrompt를 완성하라:
"{STYLE_DECLARATION}, Official character model sheet, complete full-body turnaround view, three views of the EXACT same character: a front view, a side view, and a back view standing side-by-side in one single horizontal wide frame. Symmetrical alignment, nicely spaced, well-proportioned full body standing upright from head to toe, no cropped head, no cropped feet, clean flat solid white background. The character has {HAIR_EYES_FACE_DETAILS_IN_ENGLISH}. Wearing {EXPLICIT_CLOTHING_AND_ACCESSORIES_DETAILS_IN_ENGLISH}. Studio lighting, masterpiece, ultra-detailed."

[반환 항목 정의]
1. 공식 캐릭터명(characterName): 예: "뽀잉 (PPOING)", "아리엘 (Ariel)", "루카스" 등 이미지 비주얼에 가장 어울리는 센스 있고 입체적인 이름
2. 버전(version): 예: "훈령 ver.", "정규 기사단 ver.", "사이버 스트리트 ver." 등 업로드된 캐릭터의 복장/스타일에 입각한 버전명
3. 나이(age): 이미지 속 외형 나이 (예: "20살", "18세", "불명(외관상 22세)")
4. 한 줄 클래스/타이틀(titleOrClass): 예: "은빛 호위기사", "도심 속 퇴마사", "사이버펑크 라이더"
5. 세계관 및 작품 장르(worldviewAndGenre): 이미지 분석 결과 어울리는 장르 예: "어반 판타지 학원물", "사이버펑크 2099 / 다크 스릴러", "로맨스 판타지"
6. 핵심 로그라인(logline): 캐릭터의 운명이나 서사, 한 줄 매력을 담은 요약
7. 턴어라운드 정밀 묘사(turnaround): 업로드된 캐릭터가 입은 의상 레이어와 장신구 그대로 일관성을 유지할 수 있도록 앞(Front), 옆(Side), 뒤(Back) 구도 복장 디테일 묘사
8. 핵심 표정 4종(expressions): 기쁨, 장난/의기양양, 놀람/분노, 부끄러움/슬픔 등 4가지 감정별 눈빛과 연기 포인트
9. 의상 및 악세서리 디테일 8컷 가이드(detailCuts): 반드시 정확히 8개의 파트 세부 특징 요약으로 구성할 것. (예: 헤어 & 액세서리, 귀걸이 & 체인, 의복 참 장식, 자켓 디테일, 체인 & 스트랩, 레그 스트랩 & 스타킹, 양말 & 레그워머, 신발 & 아웃솔)
10. 시그니처 컬러 팔레트 8종(colorPalette): 메인 및 포인트 색상 8개의 한글 이름과 HEX 코드, 사용처
11. 캐릭터 상세 정보북(characterInfo): 이름, 나이, 성격, 특징, 좋아하는 것, 싫어하는 것, 핵심 대사/스토리 키워드
12. 디자인 키워드 가이드 바 4종(designKeywords): 예: 가독성 높은 실루엣, 감성+귀여움, 디테일 포인트 등
13. 연출 지시안(directorDirectives): 조명 연출 팁 및 화풍 추천
14. AI 이미지 생성기 전용 wide 3면도 프롬프트(aiGenerativePrompt):
    - englishPrompt 작성 시 위 규칙과 필수 포맷 템플릿을 철저히 엄수해야 하며, 원본 캐릭터가 2D면 2D 일러스트 키워드로, 실사면 철저한 photorealistic 키워드로 제작하여 화풍을 일관성있게 복원할 것.
    - koreanPrompt 및 negativePrompt 작성: negativePrompt에는 반드시 "close-up, cropped, zoom, headshot, blurry, overlapping, multiple panels, split panels, different outfits, messy background, text, logo, signature, watermark, amateur drawing, distorted anatomy"를 포함해 한 인물 안에 다른 인물이 섞이거나 잘린 머리가 나오지 않도록 할 것.

반드시 아래 JSON 스키마에 일치하는 완벽한 JSON 데이터만 반환해라:
`;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: [
        {
          role: "user",
          parts: [
            { text: promptText },
            {
              inlineData: {
                data: imageBase64,
                mimeType: mimeType
              }
            }
          ]
        }
      ],
      config: {
        temperature: 0.75,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            characterName: { type: Type.STRING },
            version: { type: Type.STRING },
            age: { type: Type.STRING },
            titleOrClass: { type: Type.STRING },
            worldviewAndGenre: { type: Type.STRING },
            logline: { type: Type.STRING },
            turnaround: {
              type: Type.OBJECT,
              properties: {
                frontView: { type: Type.STRING },
                backView: { type: Type.STRING },
                sideView: { type: Type.STRING },
                threeQuarterView: { type: Type.STRING }
              },
              required: ["frontView", "backView", "sideView", "threeQuarterView"]
            },
            expressions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  emotionEmoji: { type: Type.STRING },
                  closeupDescription: { type: Type.STRING },
                  actingPoint: { type: Type.STRING }
                },
                required: ["name", "emotionEmoji", "closeupDescription", "actingPoint"]
              }
            },
            equippedItems: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  type: { type: Type.STRING },
                  detailSpec: { type: Type.STRING },
                  materialAndTexture: { type: Type.STRING }
                },
                required: ["name", "type", "detailSpec", "materialAndTexture"]
              }
            },
            colorPalette: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  colorName: { type: Type.STRING },
                  hex: { type: Type.STRING },
                  usage: { type: Type.STRING }
                },
                required: ["colorName", "hex", "usage"]
              }
            },
            detailCuts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["title", "desc"]
              }
            },
            characterInfo: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                age: { type: Type.STRING },
                personality: { type: Type.STRING },
                traits: { type: Type.STRING },
                likes: { type: Type.STRING },
                dislikes: { type: Type.STRING },
                storyKeyword: { type: Type.STRING }
              },
              required: ["name", "age", "personality", "traits", "likes", "dislikes", "storyKeyword"]
            },
            designKeywords: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  desc: { type: Type.STRING }
                },
                required: ["title", "desc"]
              }
            },
            directorDirectives: {
              type: Type.OBJECT,
              properties: {
                keyFeature: { type: Type.STRING },
                lightingSetup: { type: Type.STRING },
                renderingStyle: { type: Type.STRING }
              },
              required: ["keyFeature", "lightingSetup", "renderingStyle"]
            },
            aiGenerativePrompt: {
              type: Type.OBJECT,
              properties: {
                englishPrompt: { type: Type.STRING },
                koreanPrompt: { type: Type.STRING },
                negativePrompt: { type: Type.STRING }
              },
              required: ["englishPrompt", "koreanPrompt", "negativePrompt"]
            }
          },
          required: [
            "characterName",
            "version",
            "age",
            "titleOrClass",
            "worldviewAndGenre",
            "logline",
            "turnaround",
            "expressions",
            "equippedItems",
            "colorPalette",
            "detailCuts",
            "characterInfo",
            "designKeywords",
            "directorDirectives",
            "aiGenerativePrompt"
          ]
        }
      }
    });

    const parsed = JSON.parse(response.text || "{}");
    return {
      ...parsed,
      originalImageUrl: "" // 컴포넌트 측에서 마운트
    };
  } catch (error) {
    console.warn("Gemini API 에러 발생, 마스터 규격 Fallback 제공:", error);
    return {
      characterName: "뽀잉 (PPOING)",
      version: "훈령 고딕 ver.",
      age: "20살",
      titleOrClass: "스트리트 고딕 인플루언서",
      worldviewAndGenre: "MZ 서브컬처 일상 웹툰 / 판타지 드라마",
      logline: "어두운 밤거리의 네온사인 속에서 귀여운 유령 키링을 달고 자신만의 힙한 훈령 감성을 발산하는 20살 소녀.",
      turnaround: {
        frontView: "시스루 체크 로브를 걸치고 레이스 초커와 유령 펜던트를 착용. 하의는 비대칭 플리츠 스커트와 레그 가터 묘사.",
        backView: "뒷머리에 묶은 리본 스트랩과 펜던트 장식, 시스루 로브 등판의 은은한 별자리 무늬 및 플랫폼 청키 힐 뒷모습.",
        sideView: "자연스럽게 흘러내리는 롱 웨이브 헤어 옆선, 시스루 소매의 투명감과 측면 스트랩 체인 액센트.",
        threeQuarterView: "고개를 살짝 갸웃하며 묘한 눈빛을 보내는 입체적 구도."
      },
      expressions: [
        { name: "기쁨 (Joy)", emotionEmoji: "✨", closeupDescription: "자연스러운 미소와 눈빛에 생기가 도는 아이돌 느낌", actingPoint: "눈매가 반달 모양으로 부드럽게 접히며 볼이 살짝 발그레해짐" },
        { name: "장난 (Playful)", emotionEmoji: "✌️", closeupDescription: "한쪽 눈을 윙크하며 손가락 브이(V)를 포즈 취하는 발랄한 컷", actingPoint: "입꼬리가 한쪽만 개구쟁이처럼 올라감" },
        { name: "놀람 (Surprised)", emotionEmoji: "‼️", closeupDescription: "입이 살짝 벌어지고 동그랗게 눈을 크게 뜬 동화 같은 표정", actingPoint: "동공이 살짝 작아지며 주변에 깜짝 이펙트 발생" },
        { name: "부끄러움 (Shy)", emotionEmoji: "😳", closeupDescription: "볼을 붉히며 시선을 살짝 아래로 피하는 수줍은 무드", actingPoint: "두 손으로 초커 만지작거리는 미세 연출" }
      ],
      equippedItems: [
        { name: "훈령 유령 펜던트", type: "상징 장신구", detailSpec: "화이트 홀로그램 아크릴 키링", materialAndTexture: "빛을 받으면 라벤더 핑크빛으로 반사되는 반투명 아크릴" },
        { name: "시스루 오버핏 로브", type: "아우터 의복", detailSpec: "퍼플 격자 무늬의 시스루 가디건", materialAndTexture: "가볍고 하늘하늘한 폴리에스터 시스루 실크" },
        { name: "체인 레그 가터", type: "스타일링 악세서리", detailSpec: "허벅지를 감싸는 실버 체인 가터", materialAndTexture: "매트 블랙 가죽 스트랩과 은제 체인" },
        { name: "청키 통굽 스니커즈", type: "슈즈", detailSpec: "굽 7cm의 퍼플 & 블랙 조합 플랫폼 스니커즈", materialAndTexture: "에나멜 가죽 포인트와 두툼한 러버 아웃솔" }
      ],
      colorPalette: [
        { colorName: "먹색 (Charcoal)", hex: "#1E1E24", usage: "메인 의상 베이스 및 스커트 톤" },
        { colorName: "딥 네이비 (Deep Navy)", hex: "#2B2D42", usage: "이너 상의 음영부" },
        { colorName: "퍼플 (Purple)", hex: "#7209B7", usage: "체인 및 헤어 하이라이트" },
        { colorName: "라벤더 (Lavender)", hex: "#B5A6E5", usage: "시스루 자켓 메인 톤" },
        { colorName: "화이트 (White)", hex: "#F8F9FA", usage: "유령 펜던트 피부 하이라이트" },
        { colorName: "라이트 그레이 (Light Gray)", hex: "#CED4DA", usage: "스타킹 및 부속품 양영" },
        { colorName: "실버 (Silver)", hex: "#ADB5BD", usage: "금속 버클 체인 장식" },
        { colorName: "페일 핑크 (Pale Pink)", hex: "#F7D6E0", usage: "볼 touch 및 포인트 컬러" }
      ],
      detailCuts: [
        { title: "헤어 & 액세서리", desc: "양갈래 땋음 끈 장식과 초커" },
        { title: "귀걸이 & 체인", desc: "실버 드롭 이어링과 은제 스트랩" },
        { title: "훈령 참 장식", desc: "가슴 중앙의 유령 펜던트 클로즈업" },
        { title: "시스루 자켓", desc: "어깨선 시스루 재질과 격자 패턴" },
        { title: "체인 & 스트랩", desc: "허리단 플리츠와 벨트 고리" },
        { title: "레그 스트랩 & 스타킹", desc: "허벅지 라인의 가죽 가터벨트 스트랩" },
        { title: "양말 & 레그워머", desc: "무릎까지 오는 루즈 스타일 블랙 니삭스" },
        { title: "신발 & 양말", desc: "청키 플랫폼 힐과 루즈 소켓" }
      ],
      characterInfo: {
        name: "뽀잉 (PPOING)",
        age: "20살",
        personality: "밝고 긍정적이며 호기심이 아주 많음. 인스타 감성 카페 투어 매니아.",
        traits: "사람들과 어울리길 좋아하며 어디서든 사진 남기는 걸 즐김.",
        likes: "네컷 사진 찍기, 예쁜 카페 투어, 귀여운 유령 굿즈, 달콤한 밀크티",
        dislikes: "어둡고 습한 곳, 무서운 이야기, 쓴 블랙커피",
        storyKeyword: "훈령인데 인간처럼 살고 싶어!"
      },
      designKeywords: [
        { title: "가독성 높은 실루엣", desc: "한눈에 캐릭터 외형 파악 가능" },
        { title: "감성 + 귀여움", desc: "MZ세대 취향 저격 무드" },
        { title: "디테일 포인트", desc: "액세서리 + 체인 + 펜던트 찰떡 조합" },
        { title: "색감 통일감", desc: "퍼플 톤으로 전체적인 일관성 유지" }
      ],
      directorDirectives: {
        keyFeature: "네컷 만화 및 웹툰 콘티 연출 시 복장 디테일이 뭉개지지 않도록 앞/옆/뒷모습 일관성을 유지할 것.",
        lightingSetup: "한쪽 광원으로 입체감을 강조하는 램브란트 조명 + 따뜻한 보조광",
        renderingStyle: "서브컬처 일러스트레이션 화풍 및 넷플릭스 애니메이션 렌더링 스타일"
      },
      aiGenerativePrompt: {
        englishPrompt: "Official character model sheet of cute gothic anime girl named PPOING, 20 years old, turnaround view, front view, side view, back view, wearing see-through purple grid robe and black pleated skirt, little ghost keychain, expressive face closeups, color palette, detailed anime art style, white background, ultra detailed",
        koreanPrompt: "뽀잉 캐릭터 정식 마스터 턴어라운드 모델 시트, 20살 고딕 미소녀, 앞면 측면 뒷면 전신 턴어라운드, 보라색 시스루 가디건과 플리츠 스커트, 유령 펜던트 장식, 표정 클로즈업 4종",
        negativePrompt: "bad anatomy, bad hands, blurry, lowres"
      },
      originalImageUrl: ""
    };
  }
}

/**
 * 생성된 캐릭터 큐시트를 Firestore에 저장하는 함수
 */
export async function saveCharacterCueSheetToDb(
  sheet: CharacterTurnaroundCueSheet,
  userId: string,
  userEmail: string
): Promise<string> {
  const colRef = collection(db, "character_cuesheets");
  
  let safeImageUrl = sheet.originalImageUrl || "";
  if (safeImageUrl.length > 400000) {
    safeImageUrl = "";
  }

  const docRef = await addDoc(colRef, {
    ...sheet,
    originalImageUrl: safeImageUrl,
    userId,
    userEmail,
    createdAt: Timestamp.now()
  });
  return docRef.id;
}

/**
 * 유저의 캐릭터 큐시트 갤러리 불러오기
 */
export async function fetchUserCharacterCueSheets(userId: string): Promise<CharacterTurnaroundCueSheet[]> {
  try {
    const colRef = collection(db, "character_cuesheets");
    const q = query(colRef, where("userId", "==", userId));
    const snap = await getDocs(q);
    const list: CharacterTurnaroundCueSheet[] = [];
    snap.forEach((d) => {
      list.push({ id: d.id, ...d.data() } as CharacterTurnaroundCueSheet);
    });
    return list;
  } catch (err) {
    console.error("큐시트 갤러리 로딩 에러:", err);
    return [];
  }
}

