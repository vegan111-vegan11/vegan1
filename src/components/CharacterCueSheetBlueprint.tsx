import React, { useState, useEffect } from "react";
import { 
  Eye, Download, ZoomIn, ZoomOut, Sparkles, Image, RefreshCw, Layers,
  Smartphone, Monitor, Check, Paintbrush, ChevronRight, Info, Lightbulb,
  Heart, AlertCircle
} from "lucide-react";
import { MovieCueSheetSetup } from "../services/aiCinemaService";
import { toast } from "sonner";
import { motion } from "motion/react";
import { db } from "../firebase";
import { doc, updateDoc } from "firebase/firestore";

interface CharacterCueSheetBlueprintProps {
  data: MovieCueSheetSetup | Omit<MovieCueSheetSetup, "id" | "createdAt">;
}

export default function CharacterCueSheetBlueprint({ data }: CharacterCueSheetBlueprintProps) {
  const imageUrl = data.imageUrl || "";

  const charInfo = data.characterInfo || {
    name: data.characterAnalysis?.characterProfile?.name || "뿌잉",
    englishName: "PPOING",
    age: "20살",
    personality: "밝고 긍정적, 호기심 많음",
    traits: "혼령 / 사람들과 어울리기 좋아함",
    likes: ["네컷 사진 찍기", "카페 투어", "인스타 감성 소품", "귀여운 익세서리"],
    dislikes: ["무서운 이야기", "어두운 곳"],
    slogan: "혼령인데 인간처럼 살고 싶어!"
  };

  const palette = data.colorPalette || [
    { colorName: "먹색", hex: "#1D1B22" },
    { colorName: "딥 네이비", hex: "#1E2235" },
    { colorName: "퍼플", hex: "#3B1E54" },
    { colorName: "라벤더", hex: "#BFACD6" },
    { colorName: "화이트", hex: "#FFFFFF" },
    { colorName: "라이트 그레이", hex: "#F3F1F7" },
    { colorName: "실버", hex: "#D4D4D8" },
    { colorName: "페일 핑크", hex: "#FCE7F3" },
    { colorName: "차콜", hex: "#2E2E33" },
    { colorName: "민트 그레이 (포인트)", hex: "#E4ECE9" },
    { colorName: "퍼플 그레이", hex: "#71717A" },
    { colorName: "홀로그램 (포인트)", hex: "gradient" }
  ];

  const details = data.details || [
    { title: "헤어 & 액세서리", description: "웨이브 미디움 헤어, 메탈 헤어핀" },
    { title: "귀걸이 & 체인", description: "서브컬처 실버 체인 귀걸이 장식" },
    { title: "혼령 참 장식", description: "상의에 포인트를 주는 큐트 유령 메달" },
    { title: "시스루 자켓", description: "은은한 오로라 광택이 도는 시스루 외투" },
    { title: "체인 & 스트랩", description: "레이스로 러블리 지수를 올린 블랙 칼라" },
    { title: "레그 스트랩 & 스타킹", description: "언밸런스 레그 밴드로 시선 매그넷" },
    { title: "양말 & 레그워머", description: "벨벳 느낌의 디테일을 가미한 가터링" },
    { title: "신발 & 양말", description: "두꺼운 굽 형태의 볼드 슈즈" }
  ];

  const expressions = data.expressions || [
    { emotionName: "기쁨", desc: "자연스러운 미소", detailDesc: "눈빛에 생기" },
    { emotionName: "장난", desc: "윙크 + 브이", detailDesc: "발랄한 느낌" },
    { emotionName: "놀람", desc: "입 살짝 벌림", detailDesc: "눈 크게 뜬 표정" },
    { emotionName: "부끄러움", desc: "볼 살짝 붉힘", detailDesc: "수줍은 느낌" }
  ];

  const lightingTips = data.lightingAndBgTips || [
    "렘브란트 조명: 한쪽 광원으로 입체감 강조",
    "키라이트 & 보조광: 퍼플 톤 키라이트 + 따뜻한 보조광",
    "배경 디테일: 포스터, 메모, 네온사인, 소품 활용",
    "명암 대비: 캐릭터는 밝게, 배경은 어둡게 연출",
    "감성 요소: 새벽, 비 오는 날, 노을, 네온"
  ];

  const comboGuides = data.bestComboGuides || [
    "MZ 감성 캐릭터 디자인",
    "렘브란트 조명",
    "배경 연출 최적화"
  ];

  const getCombinedPrompt = (viewType: "front" | "side" | "back" | "expression" | "detail", index?: number) => {
    const isRealisticMode = data.lightingAndBgTips?.some((tip: string) => 
      tip.toLowerCase().includes("실사") || 
      tip.toLowerCase().includes("photo") || 
      tip.toLowerCase().includes("cosplay") || 
      tip.toLowerCase().includes("cinematic")
    ) || data.characterAnalysis?.visualAnalysis?.toLowerCase().includes("photo") || false;

    const stylePrefixText = isRealisticMode 
      ? "high quality masterpiece photo, cinematic award-winning cosplay photography, realistic human skin textures, high-fidelity fabric details, 35mm portrait"
      : "highly detailed 2D anime illustration, elegant digital art key visual, clean lineart, vibrant flat anime colors, beautiful anime style";

    const nameKo = charInfo.name || "뿌잉";
    const englishName = charInfo.englishName || "PPOING";
    const age = charInfo.age || "20살";
    const personality = charInfo.personality || "";
    const traits = charInfo.traits || "";
    
    const baseInfo = `Name: ${nameKo} (${englishName}), Age: ${age}, Traits: ${traits}, Personality: ${personality}`;
    const outfitDetails = details.map((d: any) => `${d.title}(${d.description})`).join(", ");
    const colorTheme = palette.map((p: any) => p.colorName).join(", ");

    if (viewType === "front") {
      return `[CHARACTER DESIGN CUE SHEET] FRONT-VIEW Full Body turnaround sheet. Symmetrical, front portrait of character. 1girl, identical face. ${stylePrefixText}. ${baseInfo}. Outfit: ${outfitDetails}. Colors: ${colorTheme}. Standing, looking directly at viewer, perfect feet/shoes visible. Clean flat solid white background, centered`;
    }
    if (viewType === "side") {
      return `[CHARACTER DESIGN CUE SHEET] SIDE-VIEW Full Body turnaround sheet. Profile angle, side portrait of character. 1girl, identical face. ${stylePrefixText}. ${baseInfo}. Outfit: ${outfitDetails}. Colors: ${colorTheme}. Standing, looking to the side, perfect feet/shoes visible. Clean flat solid white background, centered`;
    }
    if (viewType === "back") {
      return `[CHARACTER DESIGN CUE SHEET] BACK-VIEW Full Body turnaround sheet. Rear view, back portrait of character. 1girl, identical face. ${stylePrefixText}. ${baseInfo}. Outfit: ${outfitDetails}. Colors: ${colorTheme}. Standing, looking away from viewer. Clean flat solid white background, centered`;
    }
    if (viewType === "expression" && typeof index === "number") {
      const emotion = expressions[index] as any;
      return `[CHARACTER DESIGN CUE SHEET] EXPRESSION CLOSE-UP. Face headshot portrait of character. 1girl, identical face. ${stylePrefixText}. Character profile: ${baseInfo}. Wearing Outfit details: ${outfitDetails}. Colors: ${colorTheme}. Facial Expression: ${emotion.emotionName} - ${emotion.desc} (${emotion.detailDesc || ""}). Looking at viewer, highly expressive detailed face. Clean flat solid white background`;
    }
    if (viewType === "detail" && typeof index === "number") {
      const d = details[index];
      return `[CHARACTER DESIGN CUE SHEET] ACCESSORY DETAIL MACRO. Extreme close-up shot of individual item. ${stylePrefixText}. Character: ${nameKo} (${englishName}). Item: ${d.title} - ${d.description}. Color Theme: ${colorTheme}. High-fidelity macro details, isolated focus, flat solid white background`;
    }
    return "character design turnaround";
  };

  const [viewMode, setViewMode] = useState<"web" | "mobile">("web");
  const [zoom, setZoom] = useState<number>(100);
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  // 0. Render mode states to prevent messy hardcoded crops
  const [renderMode, setRenderMode] = useState<"ai" | "crop">("ai");
  const [calibrationEnabled, setCalibrationEnabled] = useState<boolean>(false);

  // Gemini state and generation controllers
  const [imageEngine, setImageEngine] = useState<"gemini" | "pollinations">("gemini");
  const [pollinationsModel, setPollinationsModel] = useState<"flux-anime" | "flux" | "turbo">("flux-anime");
  const [pollinationsSeeds, setPollinationsSeeds] = useState<Record<string, number>>({});
  const [generatingTarget, setGeneratingTarget] = useState<string | null>(null);

  const getPollinationsSeed = (targetKey: string) => {
    if (!pollinationsSeeds[targetKey]) {
      const hash = targetKey.split("").reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const initialSeed = Math.abs((hash * 9301 + 49297) % 233280);
      // We mutate safely or just return and schedule set, but wait: updating state during render in React can trigger warnings.
      // Better way: use a simple lazy initializer in state or just return a default hash seed directly if not set!
      return initialSeed;
    }
    return pollinationsSeeds[targetKey];
  };

  const randomizePollinationsSeed = (targetKey: string) => {
    const newSeed = Math.floor(Math.random() * 1000000);
    setPollinationsSeeds(prev => ({ ...prev, [targetKey]: newSeed }));
    toast.success("🎲 새로운 도면 스타일/렌더링 시드(Seed)를 무작위 할당했습니다!");
  };

  // Cache/storage for Gemini-generated images, loaded from document save-state if available
  const [geminiImages, setGeminiImages] = useState<{
    front?: string;
    side?: string;
    back?: string;
    expressions: string[];
    details: string[];
  }>(() => {
    const raw = (data as any).geminiImages;
    return {
      front: raw?.front || undefined,
      side: raw?.side || undefined,
      back: raw?.back || undefined,
      expressions: raw?.expressions || [],
      details: raw?.details || []
    };
  });

  // Track failed target generations to prevent infinite retries on transient errors
  const [failedTargets, setFailedTargets] = useState<string[]>([]);

  // Sync state when parent data document changes
  useEffect(() => {
    const raw = (data as any).geminiImages;
    setGeminiImages({
      front: raw?.front || undefined,
      side: raw?.side || undefined,
      back: raw?.back || undefined,
      expressions: raw?.expressions || [],
      details: raw?.details || []
    });
    setFailedTargets([]);
  }, [data]);

  // Hands-free background relay renderer: automatically creates high-fidelity character turnaround drafts
  useEffect(() => {
    if (imageEngine !== "gemini") return;
    if (generatingTarget) return; // Prevent double trigger
    if (renderMode !== "ai") return; // Only run in AI individual mode

    const targets: ("front" | "side" | "back" | { type: "expression"; index: number } | { type: "detail"; index: number })[] = [];

    // 1. Core Tri-view draft check
    if (!geminiImages.front && !failedTargets.includes("front")) targets.push("front");
    else if (!geminiImages.side && !failedTargets.includes("side")) targets.push("side");
    else if (!geminiImages.back && !failedTargets.includes("back")) targets.push("back");

    // 2. Emotional expressions check (max 4 matching the grid length)
    if (targets.length === 0) {
      const maxExpr = expressions ? expressions.length : 4;
      for (let i = 0; i < maxExpr; i++) {
        const key = `expression-${i}`;
        if (!geminiImages.expressions[i] && !failedTargets.includes(key)) {
          targets.push({ type: "expression", index: i });
          break;
        }
      }
    }

    // 3. Zoomed macro design elements check (max 4 for preview layout optimization)
    if (targets.length === 0) {
      const maxDet = details ? Math.min(details.length, 4) : 4;
      for (let i = 0; i < maxDet; i++) {
        const key = `detail-${i}`;
        if (!geminiImages.details[i] && !failedTargets.includes(key)) {
          targets.push({ type: "detail", index: i });
          break;
        }
      }
    }

    if (targets.length > 0) {
      const nextTarget = targets[0];
      const timer = setTimeout(() => {
        generateWithGemini(nextTarget);
      }, 700); // 700ms clean debounced delay
      return () => clearTimeout(timer);
    }
  }, [imageEngine, geminiImages, generatingTarget, failedTargets, renderMode]);

  // Manual fine-tune calibration offsets for the 1-sheet crop fallback
  const [frontOffset, setFrontOffset] = useState({ x: -16.3, y: -13.3, scale: 465 });
  const [sideOffset, setSideOffset] = useState({ x: -121.5, y: -13.3, scale: 500 });
  const [backOffset, setBackOffset] = useState({ x: -227.5, y: -13.3, scale: 510 });

  const [expressionOffsets, setExpressionOffsets] = useState([
    { x: -351.4, y: -79.1, scale: 513 },
    { x: -351.4, y: -184.9, scale: 513 },
    { x: -351.4, y: -290.7, scale: 513 },
    { x: -351.4, y: -396.5, scale: 513 },
  ]);

  const [detailOffsets, setDetailOffsets] = useState([
    { x: -21.7, y: -812.7, scale: 1205 },
    { x: -127.7, y: -812.7, scale: 1205 },
    { x: -233.8, y: -812.7, scale: 1205 },
    { x: -339.8, y: -812.7, scale: 1205 },
    { x: -21.7, y: -929.5, scale: 1205 },
    { x: -127.7, y: -929.5, scale: 1205 },
    { x: -233.8, y: -929.5, scale: 1205 },
    { x: -339.8, y: -929.5, scale: 1205 },
  ]);

  // Sync to firestore so they persist on refresh!
  const saveGeminiImagesToFirestore = async (newImages: typeof geminiImages) => {
    const docId = (data as any).id;
    if (!docId) return;
    try {
      const docRef = doc(db, "movie_cue_sheets", docId);
      await updateDoc(docRef, {
        geminiImages: newImages
      });
      console.log("Saved Gemini images to Firestore for doc:", docId);
    } catch (err) {
      console.warn("Could not save Gemini images to Firestore:", err);
    }
  };

  // Dedicated generator utilizing gemini-2.5-flash-image
  const generateWithGemini = async (
    target: "front" | "side" | "back" | { type: "expression"; index: number } | { type: "detail"; index: number }
  ) => {
    const targetKey = typeof target === "string" ? target : `${target.type}-${target.index}`;
    if (generatingTarget) return;

    setGeneratingTarget(targetKey);
    const toastId = toast.loading("제미나이 AI가 고화질 원화를 렌더링 중입니다. 잠시만 기다려주세요...");

    try {
      let prompt = "";
      let aspectRatio = "1:1";

      if (target === "front") {
        prompt = getCombinedPrompt("front");
        aspectRatio = "3:4";
      } else if (target === "side") {
        prompt = getCombinedPrompt("side");
        aspectRatio = "3:4";
      } else if (target === "back") {
        prompt = getCombinedPrompt("back");
        aspectRatio = "3:4";
      } else if (typeof target === "object" && target.type === "expression") {
        prompt = getCombinedPrompt("expression", target.index);
        aspectRatio = "1:1";
      } else if (typeof target === "object" && target.type === "detail") {
        prompt = getCombinedPrompt("detail", target.index);
        aspectRatio = "1:1";
      }

      const response = await fetch("/api/generate-image", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          prompt,
          aspectRatio,
          model: "gemini-2.5-flash-image"
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Generation API failed");
      }

      const resData = await response.json();
      const newImageUrl = resData.imageUrl;

      setGeminiImages((prev) => {
        const updated = { ...prev };
        if (target === "front") updated.front = newImageUrl;
        else if (target === "side") updated.side = newImageUrl;
        else if (target === "back") updated.back = newImageUrl;
        else if (typeof target === "object" && target.type === "expression") {
          const arr = [...updated.expressions];
          arr[target.index] = newImageUrl;
          updated.expressions = arr;
        } else if (typeof target === "object" && target.type === "detail") {
          const arr = [...updated.details];
          arr[target.index] = newImageUrl;
          updated.details = arr;
        }

        saveGeminiImagesToFirestore(updated);
        return updated;
      });

      if (resData.fallback) {
        toast.success("구글 Gemini 이미지 API 한도 초과(무료 키 제한)로 고화질 대안 엔진(Pollinations AI)을 통해 이미지를 실시간 우회 생성했습니다!", { id: toastId, duration: 4000 });
      } else {
        toast.success("제미나이 고품질 이미지 생성 완료!", { id: toastId });
      }
    } catch (error: any) {
      console.error(error);
      toast.error(`이미지 생성 실패: ${error.message || "서버 응답 오류"}`, { id: toastId });
      setFailedTargets((prev) => [...prev, targetKey]);
    } finally {
      setGeneratingTarget(null);
    }
  };

  // Sequential batch generation
  const batchGenerateAllGeminiImages = async () => {
    if (generatingTarget) return;
    const targets: ("front" | "side" | "back" | { type: "expression"; index: number } | { type: "detail"; index: number })[] = [
      "front",
      "side",
      "back"
    ];
    expressions.forEach((_, idx) => targets.push({ type: "expression", index: idx }));
    details.slice(0, 4).forEach((_, idx) => targets.push({ type: "detail", index: idx }));

    const confirmGen = window.confirm("삼면도 3장, 표정 4장, 주요 디테일 4장을 순차적으로 제미나이 AI로 생성하시겠습니까? (서버 환경에 따라 총 1-2분이 소요될 수 있습니다.)");
    if (!confirmGen) return;

    toast.info("🚀 제미나이 일괄 렌더링 시작!");
    for (const tgt of targets) {
      await generateWithGemini(tgt);
    }
    toast.success("✨ 선택한 전체 도면 항목 제미나이 생성 완료!");
  };

  const renderGeminiPlaceholder = (
    target: "front" | "side" | "back" | { type: "expression"; index: number } | { type: "detail"; index: number },
    isCompact = false,
    containerClass = ""
  ) => {
    const targetKey = typeof target === "string" ? target : `${target.type}-${target.index}`;
    const isGenerating = generatingTarget === targetKey;

    let titleText = "";
    if (target === "front") titleText = "앞모습 (FRONT)";
    else if (target === "side") titleText = "옆모습 (SIDE)";
    else if (target === "back") titleText = "뒷모습 (BACK)";
    else if (typeof target === "object" && target.type === "expression") titleText = `${expressions[target.index].emotionName.split(" (")[0]}`;
    else if (typeof target === "object" && target.type === "detail") titleText = `${details[target.index].title}`;

    const finalContainerClass = containerClass || (isCompact
      ? "absolute inset-0 flex flex-col items-center justify-center p-1.5 text-center bg-zinc-950/95 border border-zinc-800/80 rounded-2xl overflow-hidden"
      : "absolute inset-0 flex flex-col items-center justify-center p-3.5 sm:p-4 text-center bg-zinc-950 border border-zinc-800 rounded-2xl");

    if (isCompact) {
      return (
        <div className={finalContainerClass}>
          <div className="absolute inset-0 bg-radial-gradient from-purple-950/40 to-zinc-950 opacity-90 pointer-events-none" />
          <div className="relative z-10 flex flex-col items-center w-full max-w-[95%]">
            <Sparkles className={`w-4 h-4 text-purple-400 mb-1 shrink-0 ${isGenerating ? "animate-spin text-amber-400" : ""}`} />
            
            <span className="text-[9px] font-extrabold text-zinc-400 block leading-none mb-1.5 truncate max-w-full">
              {isGenerating ? "렌더링 중..." : `${titleText.split(" (")[0]}`}
            </span>
            
            <button
              onClick={(e) => {
                e.stopPropagation();
                generateWithGemini(target);
              }}
              disabled={!!generatingTarget}
              className="px-2 py-0.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-[8px] rounded-md shadow-md cursor-pointer transition-all active:scale-95 flex items-center gap-0.5 whitespace-nowrap leading-none select-none shrink-0"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-2.5 h-2.5 animate-spin" />
                  <span>생성 중</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-2.5 h-2.5" />
                  <span>AI 생성</span>
                </>
              )}
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className={finalContainerClass}>
        <div className="absolute inset-0 bg-radial-gradient from-purple-900/20 to-zinc-950 opacity-60 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center">
          <Sparkles className={`w-6 h-6 text-purple-400 mb-1.5 sm:mb-2 shrink-0 ${isGenerating ? "animate-spin text-amber-400" : ""}`} />
          <span className="text-[11px] sm:text-xs font-bold text-zinc-400 block mb-2 sm:mb-2.5 whitespace-nowrap">
            {isGenerating ? "제미나이 렌더링 중..." : `${titleText} 미생성`}
          </span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              generateWithGemini(target);
            }}
            disabled={!!generatingTarget}
            className="px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50 text-white font-black text-[10px] sm:text-xs rounded-xl shadow-lg cursor-pointer transition-all active:scale-95 flex items-center gap-1 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>생성 중...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3" />
                <span>제미나이 생성</span>
              </>
            )}
          </button>
        </div>
      </div>
    );
  };

  const renderGeminiRegenButton = (
    target: "front" | "side" | "back" | { type: "expression"; index: number } | { type: "detail"; index: number }
  ) => {
    const targetKey = typeof target === "string" ? target : `${target.type}-${target.index}`;

    if (imageEngine === "pollinations") {
      return (
        <button
          onClick={(e) => {
            e.stopPropagation();
            randomizePollinationsSeed(targetKey);
          }}
          title="대안 엔진(Pollinations AI) 스타일/시드 랜덤 재생성"
          className="absolute top-2 right-2 px-2 py-1 bg-black/85 hover:bg-black/95 border border-emerald-500/50 text-white rounded-lg shadow-lg z-30 transition-all active:scale-90 cursor-pointer flex items-center gap-1"
        >
          <RefreshCw className="w-3 h-3 text-emerald-400" />
          <span className="text-[9px] font-black tracking-tight text-emerald-300">시드 교체</span>
        </button>
      );
    }

    if (imageEngine !== "gemini") return null;
    const isGenerating = generatingTarget === targetKey;

    let exists = false;
    if (target === "front") exists = !!geminiImages.front;
    else if (target === "side") exists = !!geminiImages.side;
    else if (target === "back") exists = !!geminiImages.back;
    else if (typeof target === "object" && target.type === "expression") exists = !!geminiImages.expressions[target.index];
    else if (typeof target === "object" && target.type === "detail") exists = !!geminiImages.details[target.index];

    if (!exists) return null;

    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          generateWithGemini(target);
        }}
        disabled={!!generatingTarget}
        title="제미나이로 다시 생성하기"
        className="absolute top-2 right-2 p-1.5 bg-black/75 hover:bg-black/90 border border-zinc-700 text-white rounded-lg shadow-lg z-30 transition-all active:scale-90 cursor-pointer"
      >
        <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? "animate-spin text-amber-400" : "text-zinc-300"}`} />
      </button>
    );
  };

  const setExpressionOffsetAt = (idx: number, newOffset: any) => {
    setExpressionOffsets(prev => {
      const next = [...prev];
      const val = typeof newOffset === "function" ? newOffset(prev[idx]) : newOffset;
      next[idx] = val;
      return next;
    });
  };

  const setDetailOffsetAt = (idx: number, newOffset: any) => {
    setDetailOffsets(prev => {
      const next = [...prev];
      const val = typeof newOffset === "function" ? newOffset(prev[idx]) : newOffset;
      next[idx] = val;
      return next;
    });
  };

  // 2. Auto-detect screen size on mount and resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setViewMode("mobile");
      } else {
        setViewMode("web");
      }
    };
    handleResize(); // run once on init
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleCopyHex = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    toast.success(`색상 코드 ${hex}가 복사되었습니다!`);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  const handleOpenOriginal = () => {
    if (imageUrl) {
      window.open(imageUrl, "_blank");
      toast.success("🌌 초고화질 원본 이미지가 새 탭에서 열렸습니다!");
    } else {
      toast.error("이미지 주소가 복원 진행 중이거나 유효하지 않습니다.");
    }
  };

  const handleDownload = async () => {
    if (!imageUrl) return;
    toast.info("💾 이미지 다운로드를 준비 중입니다...");
    try {
      const response = await fetch(imageUrl, { referrerPolicy: "no-referrer" });
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${charInfo.englishName}_Character_CueSheet.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("🎨 캐릭터 큐시트 이미지가 저장되었습니다!");
    } catch (e) {
      window.open(imageUrl, "_blank");
      toast.success("CORS 보안 정책으로 인해 새 창에서 열렸습니다. 마우스 우클릭 혹은 길게 눌러 '이미지를 저장'해 주세요!");
    }
  };

  // 헬퍼: 한글(가-힣, ㄱ-ㅎ, ㅏ-ㅣ)을 안전하게 거르고 영문, 숫자, 콤마, 공백만 남기는 함수 (오픈소스 이미지 서버 인코딩 오류 방지)
  const cleanToEnglish = (text: string) => {
    if (!text) return "";
    return text
      .replace(/[ㄱ-ㅎㅏ-ㅣ가-힣]/g, "")
      .replace(/[^a-zA-Z0-9\s,\-\(\)\.\_]/g, "")
      .replace(/\s+/g, " ")
      .trim();
  };

  // Setup individual image URL helpers for renderMode === "ai"
  const isRealistic = data.lightingAndBgTips?.some((tip: string) => 
    tip.toLowerCase().includes("실사") || 
    tip.toLowerCase().includes("photo") || 
    tip.toLowerCase().includes("cosplay") || 
    tip.toLowerCase().includes("cinematic")
  ) || data.characterAnalysis?.visualAnalysis?.toLowerCase().includes("photo") || false;

  const getFrontImageUrl = () => {
    if (renderMode === "crop") return imageUrl;
    if (imageEngine === "gemini") {
      return geminiImages.front || "";
    }
    const prompt = getCombinedPrompt("front");
    const seed = getPollinationsSeed("front");
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=800&nologo=true&enhance=true&seed=${seed}&model=${pollinationsModel}`;
  };

  const getSideImageUrl = () => {
    if (renderMode === "crop") return imageUrl;
    if (imageEngine === "gemini") {
      return geminiImages.side || "";
    }
    const prompt = getCombinedPrompt("side");
    const seed = getPollinationsSeed("side");
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=800&nologo=true&enhance=true&seed=${seed}&model=${pollinationsModel}`;
  };

  const getBackImageUrl = () => {
    if (renderMode === "crop") return imageUrl;
    if (imageEngine === "gemini") {
      return geminiImages.back || "";
    }
    const prompt = getCombinedPrompt("back");
    const seed = getPollinationsSeed("back");
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=600&height=800&nologo=true&enhance=true&seed=${seed}&model=${pollinationsModel}`;
  };

  const getExpressionImageUrl = (idx: number) => {
    if (renderMode === "crop") return imageUrl;
    if (imageEngine === "gemini") {
      return geminiImages.expressions[idx] || "";
    }
    const prompt = getCombinedPrompt("expression", idx);
    const seed = getPollinationsSeed(`expression-${idx}`);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&enhance=true&seed=${seed}&model=${pollinationsModel}`;
  };

  const getDetailImageUrl = (idx: number) => {
    if (renderMode === "crop") return imageUrl;
    if (imageEngine === "gemini") {
      return geminiImages.details[idx] || "";
    }
    const prompt = getCombinedPrompt("detail", idx);
    const seed = getPollinationsSeed(`detail-${idx}`);
    return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=512&height=512&nologo=true&enhance=true&seed=${seed}&model=${pollinationsModel}`;
  };

  // Crop-style helper implementations dynamically adapting to states
  const getDetailCropStyle = (idx: number) => {
    if (renderMode === "ai") {
      return { width: "100%", height: "100%", left: "0%", top: "0%", position: "relative" as any };
    }
    const offset = detailOffsets[idx];
    return {
      width: `${offset.scale}%`,
      height: `${(offset.scale * 1124) / 1205}%`,
      left: `${offset.x}%`,
      top: `${offset.y}%`,
      position: "absolute" as any,
    };
  };

  const getExpressionCropStyle = (idx: number) => {
    if (renderMode === "ai") {
      return { width: "100%", height: "100%", left: "0%", top: "0%", position: "relative" as any };
    }
    const offset = expressionOffsets[idx];
    return {
      width: `${offset.scale}%`,
      height: `${(offset.scale * 833) / 513}%`,
      left: `${offset.x}%`,
      top: `${offset.y}%`,
      position: "absolute" as any,
    };
  };

  const getFrontCropStyle = () => {
    if (renderMode === "ai") {
      return { width: "100%", height: "100%", left: "0%", top: "0%", position: "relative" as any };
    }
    return {
      width: `${frontOffset.scale}%`,
      height: `${(frontOffset.scale * 167) / 465}%`,
      left: `${frontOffset.x}%`,
      top: `${frontOffset.y}%`,
      position: "absolute" as any,
    };
  };

  const getSideCropStyle = () => {
    if (renderMode === "ai") {
      return { width: "100%", height: "100%", left: "0%", top: "0%", position: "relative" as any };
    }
    return {
      width: `${sideOffset.scale}%`,
      height: `${(sideOffset.scale * 167) / 500}%`,
      left: `${sideOffset.x}%`,
      top: `${sideOffset.y}%`,
      position: "absolute" as any,
    };
  };

  const getBackCropStyle = () => {
    if (renderMode === "ai") {
      return { width: "100%", height: "100%", left: "0%", top: "0%", position: "relative" as any };
    }
    return {
      width: `${backOffset.scale}%`,
      height: `${(backOffset.scale * 167) / 510}%`,
      left: `${backOffset.x}%`,
      top: `${backOffset.y}%`,
      position: "absolute" as any,
    };
  };

  const renderCalibrationControls = (
    offset: { x: number; y: number; scale: number },
    setOffset: (val: any) => void,
    stepSize = 1.5
  ) => {
    if (!calibrationEnabled || renderMode !== "crop") return null;
    return (
      <div 
        className="absolute bottom-1 left-1 right-1 flex items-center justify-between bg-black/85 border border-zinc-700/85 p-1 rounded-xl text-white scale-90 z-30 select-none shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex gap-0.5">
          <button
            onClick={() => setOffset((prev: any) => ({ ...prev, x: prev.x - stepSize }))}
            className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-xs font-bold transition-colors cursor-pointer"
            title="왼쪽 이동"
          >
            ←
          </button>
          <div className="flex flex-col gap-0.5">
            <button
              onClick={() => setOffset((prev: any) => ({ ...prev, y: prev.y - stepSize }))}
              className="w-6 h-3 flex items-center justify-center hover:bg-zinc-800 rounded-t text-[8px] font-black transition-colors cursor-pointer"
              title="위 이동"
            >
              ▲
            </button>
            <button
              onClick={() => setOffset((prev: any) => ({ ...prev, y: prev.y + stepSize }))}
              className="w-6 h-3 flex items-center justify-center hover:bg-zinc-800 rounded-b text-[8px] font-black transition-colors cursor-pointer"
              title="아래 이동"
            >
              ▼
            </button>
          </div>
          <button
            onClick={() => setOffset((prev: any) => ({ ...prev, x: prev.x + stepSize }))}
            className="w-6 h-6 flex items-center justify-center hover:bg-zinc-800 rounded text-xs font-bold transition-colors cursor-pointer"
            title="오른쪽 이동"
          >
            →
          </button>
        </div>
        <div className="w-px h-5 bg-zinc-700 mx-1" />
        <div className="flex gap-0.5 items-center">
          <button
            onClick={() => setOffset((prev: any) => ({ ...prev, scale: Math.max(50, prev.scale - 10) }))}
            className="w-5 h-5 flex items-center justify-center hover:bg-zinc-800 rounded text-xs font-black transition-colors cursor-pointer"
            title="축소"
          >
            -
          </button>
          <span className="text-[8px] font-mono w-7 text-center">{offset.scale}%</span>
          <button
            onClick={() => setOffset((prev: any) => ({ ...prev, scale: Math.min(2500, prev.scale + 10) }))}
            className="w-5 h-5 flex items-center justify-center hover:bg-zinc-800 rounded text-xs font-black transition-colors cursor-pointer"
            title="확대"
          >
            +
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP DUAL VIEWMODE SWITCHER (어르신 맞춤형/웹 맞춤형 수동 전환 탭) */}
      <div className="w-full bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-xl flex flex-col md:flex-row gap-4 items-center justify-between text-white">
        <div className="text-center md:text-left">
          <span className="text-[10px] sm:text-xs font-black tracking-widest text-[#ef4255] uppercase block">
            Adaptive View Engine
          </span>
          <h3 className="text-base sm:text-lg font-black text-white flex items-center justify-center md:justify-start gap-2 mt-0.5">
            <Sparkles className="w-5 h-5 text-amber-400 shrink-0" />
            <span>화면 모드 연출 기법</span>
          </h3>
          <p className="text-zinc-400 text-xs mt-1 font-semibold">
            글씨가 너무 작다면 <span className="text-amber-300 font-black">"📱 핸드폰 큰글씨 가독 모드"</span>를 선택해 보세요!
          </p>
        </div>

        {/* Big Switch Buttons - perfect touch capability (Touch target minimum 48px) */}
        <div className="flex bg-zinc-950 p-1.5 rounded-2xl border border-zinc-800">
          <button
            onClick={() => {
              setViewMode("mobile");
              toast.info("📱 스마트폰 전용 초고가독 대활자 모드가 활성화되었습니다!");
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer min-h-[48px] ${
              viewMode === "mobile" 
                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/20 font-black" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Smartphone className="w-4.5 h-4.5" />
            <span>스마트폰 큰글씨 모드</span>
          </button>
          
          <button
            onClick={() => {
              setViewMode("web");
              toast.info("💻 웹 오리지널 고해상도 디자인 보드가 활성화되었습니다!");
            }}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl font-extrabold text-xs sm:text-sm transition-all cursor-pointer min-h-[48px] ${
              viewMode === "web" 
                ? "bg-gradient-to-r from-rose-600 to-pink-600 text-white shadow-lg shadow-rose-500/20 font-black" 
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Monitor className="w-4.5 h-4.5" />
            <span>웹 디자인 보드</span>
          </button>
        </div>
      </div>

      {/* 1.1 RENDER ENGINE MODE SWITCHER (AI Individual HD vs. Crop) */}
      <div className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-4 sm:p-5 rounded-3xl shadow-lg space-y-4">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="text-left">
            <span className="text-[10px] font-black tracking-widest text-purple-600 uppercase block">
              Visualization Engine Mode
            </span>
            <h4 className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-white flex items-center gap-1.5 mt-0.5">
              <Sparkles className="w-4 h-4 text-purple-600 shrink-0" />
              <span>캐릭터 도면 렌더링 방식 설정</span>
            </h4>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1 font-semibold leading-relaxed">
              {renderMode === "ai" 
                ? "✨ [추천] AI 개별 고해상도 생성 카드 모드: 캐릭터 특징이 유지된 완벽한 대칭 초상화와 선명한 고품질 디테일을 확인하세요."
                : "✂️ 1장 도면 자동 크롭 모드: 하나의 넓은 턴어라운드 전신 캔버스에서 개별 구역을 자동 크롭하여 도면 형태로 분석합니다."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0 self-end lg:self-center">
            <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <button
                onClick={() => {
                  setRenderMode("ai");
                  toast.success("✨ 고화질 개별 AI 초상화 카드로 렌더링되었습니다. 캐릭터가 항상 완벽하게 화면 중앙에 위치합니다!");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  renderMode === "ai" 
                    ? "bg-purple-600 text-white shadow-md font-black" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>✨ AI 개별 고화질 카드</span>
              </button>
              
              <button
                onClick={() => {
                  setRenderMode("crop");
                  toast.success("✂️ 1장 도면 자동 크롭 모드가 활성화되었습니다. 좌표가 맞지 않을 경우 수동 미세 조정을 이용하세요!");
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  renderMode === "crop" 
                    ? "bg-indigo-600 text-white shadow-md font-black" 
                    : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>✂️ 자동 도면 크롭</span>
              </button>
            </div>

            {renderMode === "crop" && (
              <button
                onClick={() => {
                  setCalibrationEnabled(!calibrationEnabled);
                  if (!calibrationEnabled) {
                    toast.info("🔧 수동 정밀 크롭 캘리브레이션 활성화! 각 사진 위의 화살표 버튼으로 얼굴/의상을 완벽히 센터링하세요.");
                  } else {
                    toast.success("캘리브레이션 설정이 정상 저장되었습니다!");
                  }
                }}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs transition-all cursor-pointer border ${
                  calibrationEnabled 
                    ? "bg-amber-500 border-amber-600 text-white font-black" 
                    : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <Paintbrush className="w-3.5 h-3.5" />
                <span>🔧 수동 미세 조정 {calibrationEnabled ? "ON" : "OFF"}</span>
              </button>
            )}
          </div>
        </div>

        {/* New Image Engine Selection Section when in AI mode */}
        {renderMode === "ai" && (
          <div className="pt-4 border-t border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-4">
            <div className="text-left max-w-2xl">
              <span className="text-[10px] font-black tracking-widest text-emerald-500 uppercase block">
                Image Generation Engine Options
              </span>
              <h5 className="text-xs sm:text-sm font-black text-zinc-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                <Image className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>AI 이미지 생성 모델 엔진 설정 (구글 API 한도초과 해결책)</span>
              </h5>
              <p className="text-zinc-500 dark:text-zinc-400 text-[11px] mt-1 font-semibold leading-relaxed">
                {imageEngine === "gemini"
                  ? "✨ [공식 추천] 구글 제미나이 2.5 (Google Gemini 2.5) 이미지 엔진을 사용합니다. 캐릭터 외형의 일관성과 디테일이 대폭 향상되나, 구글 서버 할당량/한도 제한이 존재할 수 있습니다."
                  : `⚡ [무제한 무료 대안] 폴리네이션스 AI (Pollinations AI) 엔진의 [${pollinationsModel === "flux-anime" ? "Flux 애니 작화" : pollinationsModel === "flux" ? "Flux 고화질" : "초고속 Turbo"}] 모델을 사용하여 하루 제한 없이 무제한 실시간 원화를 생성합니다.`}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 self-end xl:self-center">
              {/* Main Engine Select */}
              <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <button
                  onClick={() => {
                    setImageEngine("gemini");
                    toast.success("✨ 구글 제미나이 2.5 이미지 렌더링 엔진이 적용되었습니다!");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                    imageEngine === "gemini"
                      ? "bg-amber-500 text-white shadow-md font-black"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>✨ Google Gemini 2.5</span>
                </button>

                <button
                  onClick={() => {
                    setImageEngine("pollinations");
                    toast.warning("⚡ 실시간 Pollinations AI (무제한 대안 엔진)으로 전환되었습니다! 한도 걱정 없이 무제한으로 사용하세요.");
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-black text-xs transition-all cursor-pointer ${
                    imageEngine === "pollinations"
                      ? "bg-zinc-700 text-white shadow-md font-black"
                      : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-900"
                  }`}
                >
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>⚡ Pollinations (무제한)</span>
                </button>
              </div>

              {/* Pollinations Sub-model Select */}
              {imageEngine === "pollinations" && (
                <div className="flex bg-zinc-100 dark:bg-zinc-900 p-1 rounded-2xl border border-emerald-500/30 gap-1">
                  <button
                    onClick={() => {
                      setPollinationsModel("flux-anime");
                      toast.success("🎨 플럭스 애니메이션 모델이 선택되었습니다! (귀여운 캐릭터 작화 최적화)");
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-black text-[10px] transition-all cursor-pointer ${
                      pollinationsModel === "flux-anime"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    🎨 Flux Anime
                  </button>
                  <button
                    onClick={() => {
                      setPollinationsModel("flux");
                      toast.success("🌟 플럭스 고화질 표준 모델이 선택되었습니다! (실사/초고해상도 디테일)");
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-black text-[10px] transition-all cursor-pointer ${
                      pollinationsModel === "flux"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    🌟 Flux Std
                  </button>
                  <button
                    onClick={() => {
                      setPollinationsModel("turbo");
                      toast.success("⚡ Turbo 초고속 생성 모델이 선택되었습니다! (극도로 신속한 렌더링)");
                    }}
                    className={`px-2.5 py-1.5 rounded-lg font-black text-[10px] transition-all cursor-pointer ${
                      pollinationsModel === "turbo"
                        ? "bg-emerald-500 text-white shadow-sm"
                        : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    ⚡ Turbo Fast
                  </button>
                </div>
              )}

              {imageEngine === "gemini" && (
                <button
                  onClick={batchGenerateAllGeminiImages}
                  disabled={!!generatingTarget}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white text-xs font-black rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 animate-pulse" />
                  <span>🚀 제미나이 이미지 일괄 생성</span>
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* */}

      {/* 
        ========================================================================
        CASE A: 📱 SMARTPHONE MODE (초고가독 대활자, 굵은 테두리, 세로 스태킹, 44px+ 터치)
        ========================================================================
      */}
      {viewMode === "mobile" && (
        <div className="bg-white text-[#0a0a0a] rounded-3xl p-5 border-4 border-purple-200 shadow-2xl space-y-8 select-text">
          {/* Branded Sticker Banner */}
          <div className="bg-[#fff9da] border-2 border-[#e6b100] text-[#7c5f00] p-4 rounded-2xl flex items-start gap-2.5">
            <AlertCircle className="w-6 h-6 text-[#d29b00] shrink-0 mt-0.5" />
            <div className="text-left">
              <strong className="block text-base font-black">핸드폰 화면 돋보기 안내</strong>
              <span className="text-sm font-semibold leading-relaxed">
                글씨 크기를 <strong>약 1.5배 크게 조절</strong>하고 눈이 피로하지 않도록 <strong>고대비 고정밀 백색 판형</strong>으로 제작했습니다. 아래로 천천히 내려서 한눈에 살펴보세요!
              </span>
            </div>
          </div>

          {/* MAIN HEADER PROFILES */}
          <div className="text-left border-b-4 border-purple-500 pb-4">
            <span className="bg-purple-600 text-white font-black text-xs px-3 py-1.2 rounded-full tracking-widest uppercase">
              모바일 원화 분석 시트
            </span>
            <h1 className="text-3xl font-black text-[#1D1B22] tracking-tight mt-2 flex items-baseline gap-2">
              {charInfo.name}
              <span className="text-xl font-bold text-neutral-500">({charInfo.englishName})</span>
            </h1>
            <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 mt-1 text-sm sm:text-base font-bold text-neutral-600">
              <span className="text-purple-700 font-extrabold">훈령 ver.</span>
              <span className="text-neutral-300">•</span>
              <span>나이: <strong className="text-black font-black text-lg">{charInfo.age}</strong></span>
            </div>
          </div>

          {/* 1. FRONT, SIDE, BACK THREE-VIEWS ORTHO SECTIONS (큼직하게 캐러셀 형태 혹은 넓은 세로 정독카드) */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black border-l-4 border-purple-600 pl-3 leading-none flex items-center gap-1.5">
              <span>① 앞/옆/뒤 인물 삼면도</span>
              <span className="text-sm font-bold text-purple-700">(터치해서 크게 확대 가능)</span>
            </h2>

            {/* THREE-VIEWS VERTICAL HIGHLIGHT STALKS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* FRONT VIEW */}
              <div className="bg-[#fcf8ff] rounded-2xl p-3.5 border-2 border-purple-100 flex flex-col items-center relative">
                <span className="block text-base font-black text-[#60428d] mb-2 bg-[#ebdff3] px-4 py-1.5 rounded-xl border border-[#d3ccde]">
                  앞모습 (FRONT)
                </span>
                <div className="aspect-[3/4] w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 relative">
                  {imageEngine === "gemini" && !geminiImages.front ? (
                    renderGeminiPlaceholder("front")
                  ) : (
                    <>
                      <div className="absolute inset-0 overflow-hidden">
                        <img 
                          src={getFrontImageUrl()} 
                          className="absolute max-w-none" 
                          style={getFrontCropStyle()}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {renderCalibrationControls(frontOffset, setFrontOffset)}
                      {renderGeminiRegenButton("front")}
                    </>
                  )}
                </div>
              </div>

              {/* SIDE VIEW */}
              <div className="bg-[#fcf8ff] rounded-2xl p-3.5 border-2 border-purple-100 flex flex-col items-center relative">
                <span className="block text-base font-black text-[#60428d] mb-2 bg-[#ebdff3] px-4 py-1.5 rounded-xl border border-[#d3ccde]">
                  옆모습 (SIDE)
                </span>
                <div className="aspect-[3/4] w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 relative">
                  {imageEngine === "gemini" && !geminiImages.side ? (
                    renderGeminiPlaceholder("side")
                  ) : (
                    <>
                      <div className="absolute inset-0 overflow-hidden">
                        <img 
                          src={getSideImageUrl()} 
                          className="absolute max-w-none" 
                          style={getSideCropStyle()}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {renderCalibrationControls(sideOffset, setSideOffset)}
                      {renderGeminiRegenButton("side")}
                    </>
                  )}
                </div>
              </div>

              {/* BACK VIEW */}
              <div className="bg-[#fcf8ff] rounded-2xl p-3.5 border-2 border-purple-100 flex flex-col items-center relative">
                <span className="block text-base font-black text-[#60428d] mb-2 bg-[#ebdff3] px-4 py-1.5 rounded-xl border border-[#d3ccde]">
                  뒷모습 (BACK)
                </span>
                <div className="aspect-[3/4] w-full bg-zinc-950 rounded-2xl overflow-hidden border border-zinc-200 relative">
                  {imageEngine === "gemini" && !geminiImages.back ? (
                    renderGeminiPlaceholder("back")
                  ) : (
                    <>
                      <div className="absolute inset-0 overflow-hidden">
                        <img 
                          src={getBackImageUrl()} 
                          className="absolute max-w-none" 
                          style={getBackCropStyle()}
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      {renderCalibrationControls(backOffset, setBackOffset)}
                      {renderGeminiRegenButton("back")}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 2. EMOTION FACE EXPRESSIONS (표정 4선 대활자 카드화) */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black border-l-4 border-purple-600 pl-3 leading-none">
              ② 주요 표정 가이드 (EXPRESSIONS)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {expressions.map((emotion, idx) => {
                const bubbleDecor = ["기본 보통 표정", "발랄하고 통통 튀는 느낌", "동그랗게 호기심 가득 뜬 표정", "볼이 붉어지는 수줍은 느낌"];
                return (
                  <div 
                    key={idx}
                    className="bg-white border-2 border-neutral-200 hover:border-purple-300 rounded-2xl p-4 flex items-center gap-4.5 shadow-sm min-h-[96px] relative"
                  >
                    {/* Circle Zoomed port */}
                    <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-purple-300 bg-zinc-950 shrink-0 relative">
                      {imageEngine === "gemini" && !geminiImages.expressions[idx] ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            generateWithGemini({ type: "expression", index: idx });
                          }}
                          disabled={!!generatingTarget}
                          className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-purple-400 hover:text-purple-300 cursor-pointer active:scale-95 transition-all"
                          title="제미나이로 표정 생성"
                        >
                          {generatingTarget === `expression-${idx}` ? (
                            <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                          ) : (
                            <>
                              <Sparkles className="w-4 h-4" />
                              <span className="text-[7px] font-bold text-zinc-500 mt-1 scale-90">생성</span>
                            </>
                          )}
                        </button>
                      ) : (
                        <>
                          <div className="absolute inset-0 overflow-hidden">
                            <img 
                              src={getExpressionImageUrl(idx)} 
                              className="absolute max-w-none"
                              style={getExpressionCropStyle(idx)}
                              alt="Face Expression Preview"
                              referrerPolicy="no-referrer"
                            />
                          </div>
                          {renderCalibrationControls(expressionOffsets[idx], (val) => setExpressionOffsetAt(idx, val))}
                          {renderGeminiRegenButton({ type: "expression", index: idx })}
                        </>
                      )}
                    </div>

                    {/* Desc container - BIG SIZE TEXT */}
                    <div className="text-left flex-1 min-w-0">
                      <h4 className="text-base font-black text-black leading-tight mb-1.5">
                        {emotion.emotionName.split(" (")[0]}
                      </h4>
                      <p className="text-sm font-bold text-purple-800 leading-tight">
                        • {emotion.desc}
                      </p>
                      <p className="text-xs font-semibold text-neutral-500 mt-1">
                        • {(emotion as any).detailDesc || bubbleDecor[idx]}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. CORE DETAILS & ACCESSORIES GRID (착용한 악세사리 - 1~2열 엄청 크게 보기) */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black border-l-4 border-purple-600 pl-3 leading-none">
              ③ 상세 악세사리 및 복장 포인트
            </h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {details.map((detail, idx) => (
                <div 
                  key={idx}
                  className="bg-white border-2 border-purple-100/80 hover:border-purple-300 rounded-3xl p-4 flex flex-col justify-between shadow-sm relative"
                >
                  {/* Highly detailed crop frame */}
                  <div className="aspect-video w-full rounded-2xl overflow-hidden bg-zinc-950 border border-neutral-200 mb-3.5 relative">
                    {imageEngine === "gemini" && !geminiImages.details[idx] ? (
                      renderGeminiPlaceholder({ type: "detail", index: idx }, true)
                    ) : (
                      <>
                        <div className="absolute inset-0 overflow-hidden">
                          <img 
                            src={getDetailImageUrl(idx)} 
                            className="absolute max-w-none"
                            style={getDetailCropStyle(idx)}
                            alt={`Visual micro design crop point 0${idx+1}`}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {renderCalibrationControls(detailOffsets[idx], (val) => setDetailOffsetAt(idx, val))}
                        {renderGeminiRegenButton({ type: "detail", index: idx })}
                      </>
                    )}
                    <div className="absolute top-2 left-2 bg-purple-700 text-white text-xs font-black px-2.5 py-1 rounded-xl z-20">
                      구역 {idx + 1}
                    </div>
                  </div>

                  {/* Large High Contrast descriptions */}
                  <div className="text-center space-y-1 bg-purple-50/50 p-2 rounded-2xl">
                    <span className="block text-base font-black text-purple-950">
                      {detail.title}
                    </span>
                    <span className="block text-[13px] font-extrabold text-neutral-600">
                      {detail.description}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. TACTILE COLOR PALETTE (컬러 팔레트 - 어르신들이 손으로 터치하고 글씨가 매우 큼) */}
          <div className="space-y-4">
            <h2 className="text-xl font-black text-black border-l-4 border-purple-600 pl-3 leading-none">
              ④ 인물 배색 컬러 팔레트 (터치하면 복사)
            </h2>
            
            <div className="bg-purple-50/40 rounded-3xl p-5 border-2 border-purple-100">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {palette.map((color, idx) => {
                  const isSelected = copiedHex === color.hex;
                  return (
                    <div 
                      key={idx}
                      onClick={() => handleCopyHex(color.hex)}
                      className="flex items-center gap-3 bg-white p-3.5 rounded-2xl border border-purple-100 shadow-sm cursor-pointer active:scale-95 transition-all min-h-[56px] select-none"
                    >
                      {/* Round well color sphere - minimum touch space compliant */}
                      <div 
                        className={`w-12 h-12 rounded-full border border-neutral-300 relative shrink-0 flex items-center justify-center shadow-lg ${
                          color.hex === "gradient" 
                            ? "bg-gradient-to-tr from-[#FFD3E8] via-[#BFADD6] to-[#A2E2F2] animate-pulse" 
                            : ""
                        }`}
                        style={color.hex !== "gradient" ? { backgroundColor: color.hex } : undefined}
                      >
                        {isSelected && (
                          <Check className="w-6 h-6 text-emerald-600 drop-shadow-md bg-white rounded-full p-0.5" />
                        )}
                      </div>
                      
                      {/* Name with large contrast text */}
                      <div className="text-left min-w-0">
                        <strong className="block text-[14px] font-black text-neutral-900 truncate">
                          {color.colorName}
                        </strong>
                        <span className="block text-xs font-mono font-bold text-neutral-400 uppercase">
                          {color.hex}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* 5. GHOST INFO STICKER & STORY PROFILE (캐릭터 정보 돋보기) */}
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border-3 border-orange-200 rounded-3xl p-6 relative overflow-hidden text-left">
            {/* Ghost Sticker representation */}
            <div className="absolute right-4 bottom-4 w-18 h-18 opacity-10 pointer-events-none select-none">
              <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <path d="M50 15C33 15 22 26 22 43V75C22 79 26 81 29 79C32 76 35 73 39 76L50 83L61 76C65 73 68 76 71 79C74 81 78 79 78 75V43C78 26 67 15 50 15Z" fill="#1d1d1d" />
              </svg>
            </div>

            <h3 className="text-xl font-black text-[#1d1d1d] uppercase border-b-2 border-orange-200 pb-2 mb-4">
              ⑤ 인물 캐릭터 사전 (INFO)
            </h3>

            <div className="space-y-3 text-base font-extrabold text-[#2d2d2d] leading-relaxed">
              <div>
                <span className="text-amber-700 font-black mr-2">• 캐릭터 이름:</span> 
                <span className="text-black font-black text-lg bg-[#fff8e6] px-2.5 py-1 rounded-xl">{charInfo.name}</span>
              </div>
              <div>
                <span className="text-amber-700 font-black mr-2">• 나이:</span> 
                <span className="text-black font-black">{charInfo.age}</span>
              </div>
              <div>
                <span className="text-amber-700 font-black mr-2">• 성격:</span> 
                <span>{charInfo.personality}</span>
              </div>
              <div>
                <span className="text-amber-700 font-black mr-2">• 매력 특징:</span> 
                <span>{charInfo.traits}</span>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-orange-100 space-y-1">
                <div>
                  <span className="text-[#ef4255] font-black mr-2">🎁 좋아하는 것:</span> 
                  <span className="text-neutral-800 font-bold">{charInfo.likes.join(", ")}</span>
                </div>
                <div>
                  <span className="text-neutral-500 font-black mr-2">❌ 싫어하는 것:</span> 
                  <span className="text-neutral-800 font-bold">{charInfo.dislikes.join(", ")}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-dashed border-orange-200 mt-2">
                <span className="text-orange-800 font-black block text-sm bg-orange-100/50 p-3 rounded-2xl italic leading-relaxed">
                  📢 슬로건 키워드: "{charInfo.slogan}"
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 
        ========================================================================
        CASE B: 💻 WEB BLUEBOARD DESIGN MODE (원래의 완벽한 복각 그리드 원판)
        ========================================================================
      */}
      {viewMode === "web" && (
        <div className="w-full bg-[#f1f0f6] text-[#2c1d3f] border-2 border-[#d3ccde] rounded-3xl p-5 md:p-6 shadow-xl relative overflow-hidden font-sans select-text">
          {/* Fine background grid overlay imitating blueprint paper grids */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#e1daeb_1px,transparent_1px),linear-gradient(to_bottom,#e1daeb_1px,transparent_1px)] bg-[size:16px_16px] opacity-35 pointer-events-none" />

          {/* TOP LINE METADATA BAR */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between pb-5 mb-5 border-b border-[#cfc4da] gap-4">
            <div className="flex flex-wrap items-center gap-4">
              {/* CHARACTER CUESHEET BRANDED LABEL BOX */}
              <div className="bg-white border border-[#beb0cc] text-[#2c1d3f] px-5 py-2.5 rounded-2xl shadow-sm tracking-widest font-black text-base uppercase shrink-0">
                캐릭터 큐시트
              </div>

              {/* MAIN CHARACTER HEADER PROFILES */}
              <div className="flex flex-wrap items-center gap-2 text-sm text-[#2c1d3f] font-semibold">
                <span className="text-xl md:text-2xl font-black text-black">
                  {charInfo.name}
                </span>
                <span className="text-[#554675] font-black tracking-tight text-xl md:text-2xl">
                  ({charInfo.englishName})
                </span>
                <span className="text-[#a899c0] text-lg font-light">•</span>
                <span className="text-md font-bold text-[#554675]">
                  훈령 ver.
                </span>
                <span className="text-[#a899c0] text-lg font-light">•</span>
                <span className="text-lg font-black text-[#554675]">
                  {charInfo.age}
                </span>
              </div>
            </div>

            {/* BEST COMBINATION GUIDE CHIP (BLACK BANNER) */}
            <div className="bg-[#1A1A22] text-white rounded-xl py-2 px-4 shadow-md max-w-[320px] ml-auto md:ml-0 font-sans border border-[#32323e]">
              <span className="block text-right text-[10px] font-black text-[#f8fafc] tracking-widest leading-none mb-1.5 uppercase">
                네컷 만화 기준 BEST 조합 가이드
              </span>
              <div className="flex justify-end gap-1.5 flex-wrap">
                {comboGuides.map((guide, i) => (
                  <span 
                    key={i} 
                    className="inline-block text-[#ef4255] text-[9.5px] font-black tracking-tight"
                  >
                    * {guide} {i !== comboGuides.length - 1 ? " " : ""}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* PRIMARY SPLIT GRID LAYOUT */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
            
            {/* LEFT AREA (2/3 width) - Three-Views, Details, Color Palette */}
            <div className="lg:col-span-8 flex flex-col justify-between space-y-5">
              
              {/* 1. THREE-VIEWS ORTHOGRAPHIC SUB-PANEL */}
              <div className="bg-white/45 border border-[#e4dbe9] rounded-2xl p-4 shadow-sm relative overflow-hidden backdrop-blur-xs flex flex-col justify-between">
                {/* Grid Background */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ebdff3_1px,transparent_1px)] bg-[size:16px_100%] opacity-20 pointer-events-none" />
                
                <div className="grid grid-cols-3 text-center text-xs font-black text-[#4d3a66] tracking-widest mb-3.5 relative z-10">
                  <div>앞 (FRONT)</div>
                  <div>옆 (SIDE)</div>
                  <div>뒤 (BACK)</div>
                </div>

                {/* Responsive 3 frames alignment */}
                <div className="grid grid-cols-3 gap-3 relative z-10">
                  {/* FRONT FRAME */}
                  <div className="aspect-[3/4] bg-[#221035] rounded-2xl overflow-hidden border-2 border-white shadow-md relative group">
                    {imageEngine === "gemini" && !geminiImages.front ? (
                      renderGeminiPlaceholder("front", true)
                    ) : (
                      <>
                        <div className="absolute inset-0 overflow-hidden">
                          <img 
                            src={getFrontImageUrl()} 
                            className="absolute max-w-none" 
                            style={getFrontCropStyle()}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {renderCalibrationControls(frontOffset, setFrontOffset)}
                        {renderGeminiRegenButton("front")}
                      </>
                    )}
                  </div>

                  {/* SIDE FRAME */}
                  <div className="aspect-[3/4] bg-[#221035] rounded-2xl overflow-hidden border-2 border-white shadow-md relative group">
                    {imageEngine === "gemini" && !geminiImages.side ? (
                      renderGeminiPlaceholder("side", true)
                    ) : (
                      <>
                        <div className="absolute inset-0 overflow-hidden">
                          <img 
                            src={getSideImageUrl()} 
                            className="absolute max-w-none" 
                            style={getSideCropStyle()}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {renderCalibrationControls(sideOffset, setSideOffset)}
                        {renderGeminiRegenButton("side")}
                      </>
                    )}
                  </div>

                  {/* BACK FRAME */}
                  <div className="aspect-[3/4] bg-[#3B1E54]/90 rounded-2xl overflow-hidden border-2 border-white shadow-md relative group">
                    {imageEngine === "gemini" && !geminiImages.back ? (
                      renderGeminiPlaceholder("back", true)
                    ) : (
                      <>
                        <div className="absolute inset-0 overflow-hidden">
                          <img 
                            src={getBackImageUrl()} 
                            className="absolute max-w-none" 
                            style={getBackCropStyle()}
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        {renderCalibrationControls(backOffset, setBackOffset)}
                        {renderGeminiRegenButton("back")}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. 8-GRID DETAILED CORNER (디테일 DETAIL) */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest pl-1 border-l-3 border-[#ef4255]">
                  디테일 (DETAIL)
                </h4>
                
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {details.map((detail, idx) => (
                    <div 
                      key={idx}
                      className="bg-white border border-[#d6cade] rounded-2xl p-2.5 flex flex-col justify-between hover:shadow-md transition-all group relative"
                    >
                      {/* Closeup Image Frame */}
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-zinc-900 border border-[#e4daea] mb-2 relative">
                        {imageEngine === "gemini" && !geminiImages.details[idx] ? (
                          renderGeminiPlaceholder({ type: "detail", index: idx }, true)
                        ) : (
                          <>
                            <div className="absolute inset-0 overflow-hidden">
                              <img 
                                src={getDetailImageUrl(idx)} 
                                className="absolute max-w-none"
                                style={getDetailCropStyle(idx)}
                                alt={`Visual micro design crop point 0${idx+1}`}
                                referrerPolicy="no-referrer"
                              />
                            </div>
                            {renderCalibrationControls(detailOffsets[idx], (val) => setDetailOffsetAt(idx, val))}
                            {renderGeminiRegenButton({ type: "detail", index: idx })}
                          </>
                        )}
                        <div className="absolute inset-0 border border-white/20 rounded-xl pointer-events-none" />
                        <div className="absolute top-1 left-1 bg-[#2c1d3f]/90 text-white text-[8px] font-black px-1.2 py-0.2 rounded font-mono scale-90 z-20">
                          {idx + 1}
                        </div>
                      </div>

                      {/* TEXT WRAPPERS */}
                      <div className="text-center space-y-0.5">
                        <span className="block text-[9.5px] font-black text-[#60428d] truncate bg-[#e9e3f3] py-0.5 px-1.5 rounded-lg border border-[#dfd4ea]">
                          {detail.title}
                        </span>
                        <span className="block text-[8px] font-bold text-[#81729b] leading-tight line-clamp-1 mt-1">
                          {detail.description}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 3. 12-WELL BEAUTY COLOR PALETTE */}
              <div className="bg-white border border-[#cfc4da] rounded-2xl p-4.5 shadow-xs">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest mb-3 border-b border-[#eeeaf4] pb-1.5">
                  컬러 팔레트 (COLOR PALETTE)
                </h4>
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2.5">
                  {palette.map((color, idx) => {
                    const isSelected = copiedHex === color.hex;
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleCopyHex(color.hex)}
                        className="flex flex-col items-center cursor-pointer group"
                        title="클릭하여 복사"
                      >
                        {/* Round well color bubble */}
                        <div 
                          className={`w-9 h-9 rounded-full border border-white shadow-md relative group-hover:scale-110 active:scale-95 transition-all flex items-center justify-center ${
                            color.hex === "gradient" 
                              ? "bg-gradient-to-tr from-[#FFD3E8] via-[#BFADD6] to-[#A2E2F2] animate-pulse" 
                              : ""
                          }`}
                          style={color.hex !== "gradient" ? { backgroundColor: color.hex } : undefined}
                        >
                          <div className="absolute inset-0 rounded-full border border-black/5" />
                          {isSelected ? (
                            <Check className="w-4 h-4 text-emerald-500 drop-shadow-md bg-white rounded-full p-0.5" />
                          ) : (
                            <span className="text-[7px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 rounded px-1 absolute -top-5 z-20 pointer-events-none">
                              {idx + 1}
                            </span>
                          )}
                        </div>
                        <span className="block text-[9px] font-black text-zinc-800 text-center truncate w-full mt-1.5">
                          {color.colorName}
                        </span>
                        <span className="block text-[7.5px] text-zinc-400 font-mono font-bold uppercase">
                          ({color.hex})
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* RIGHT AREA (1/3 width) - Facial Expressions, Lighting Frame, Character Info Panel */}
            <div className="lg:col-span-4 flex flex-col justify-between space-y-4.5">

              {/* 1. EMOTION FACE EXPRESSIONS TILES */}
              <div className="space-y-2">
                <h4 className="text-xs font-black text-zinc-900 uppercase tracking-widest pl-1 border-l-3 border-[#ef4255] flex items-center justify-between">
                  <span>표정 (EXPRESSIONS)</span>
                  <span className="text-[10px] text-zinc-400 font-mono">EMOTIONS</span>
                </h4>

                <div className="space-y-2.5">
                  {expressions.map((emotion, idx) => {
                    const bubbleDecor = ["기본 보통 표정", "발랄한 세련성", "동그랗게 호기심 표현", "부끄러워 소망 가득"];
                    
                    return (
                      <div 
                        key={idx}
                        className="bg-white border border-[#cfc4da] rounded-2xl p-2.5 flex items-center gap-3.5 hover:shadow-md transition-all shadow-xs"
                      >
                        {/* Cropped emotional zoom portrait sphere */}
                        <div className="w-13 h-13 rounded-xl overflow-hidden border border-[#d6cade] bg-zinc-950 shrink-0 relative shadow-inner">
                          {imageEngine === "gemini" && !geminiImages.expressions[idx] ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                generateWithGemini({ type: "expression", index: idx });
                              }}
                              disabled={!!generatingTarget}
                              className="absolute inset-0 bg-zinc-900 flex flex-col items-center justify-center text-purple-400 hover:text-purple-300 cursor-pointer active:scale-95 transition-all"
                              title="제미나이로 표정 생성"
                            >
                              {generatingTarget === `expression-${idx}` ? (
                                <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
                              ) : (
                                <>
                                  <Sparkles className="w-3.5 h-3.5" />
                                  <span className="text-[6px] font-bold text-zinc-500 mt-0.5 scale-90">생성</span>
                                </>
                              )}
                            </button>
                          ) : (
                            <>
                              <img 
                                src={getExpressionImageUrl(idx)} 
                                className="absolute max-w-none"
                                style={getExpressionCropStyle(idx)}
                                alt="Face Expression Preview"
                                referrerPolicy="no-referrer"
                              />
                              {renderGeminiRegenButton({ type: "expression", index: idx })}
                            </>
                          )}
                        </div>

                        {/* Right hand description layout */}
                        <div className="text-left flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="text-[11px] font-black text-[#221035] truncate leading-none">
                              {emotion.emotionName.split(" (")[0]}
                            </span>
                          </div>
                          {/* Bullet indicators exactly matching attached style */}
                          <div className="space-y-0.5 text-left">
                            <span className="block text-[8.5px] font-bold text-zinc-400 leading-tight">
                              • {emotion.desc}
                            </span>
                            <span className="block text-[8.5px] font-black text-[#8b31a8] leading-none">
                              • {(emotion as any).detailDesc || bubbleDecor[idx]}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 2. LIGHTING & BACKGROUND GUIDE SCENE FRAME */}
              <div className="bg-white border border-[#cfc4da] rounded-2xl p-3.5 shadow-xs space-y-2.5">
                <h4 className="text-[10px] font-black text-zinc-900 uppercase tracking-widest border-b border-[#eeeaf4] pb-1">
                  조명 & 배경 연출 팁 (네컷 만화 최적화)
                </h4>
                
                <div className="flex gap-3 items-stretch">
                  <div className="w-20 rounded-xl overflow-hidden bg-[#1A1A22] border border-[#d3ccde] relative shrink-0">
                    <img 
                      src={imageUrl} 
                      className="absolute max-w-none"
                      style={{
                        width: "518%",
                        height: "1000%",
                        left: "-354.8%",
                        top: "-633.0%",
                      }}
                      alt="Dark stage reference preview"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-[7.5px] font-black text-[#bfacd6] uppercase tracking-widest font-mono scale-90">
                        STUDIO
                      </span>
                    </div>
                  </div>

                  {/* Bullets lists */}
                  <ul className="space-y-1 text-left flex-1 min-w-0 self-center">
                    {lightingTips.slice(0, 5).map((tip, idx) => {
                      const separator = tip.includes(":") ? ":" : " ";
                      const parts = tip.split(separator);
                      const label = parts[0];
                      const desc = parts.slice(1).join(separator);
                      return (
                        <li key={idx} className="text-[9.5px] leading-tight text-neutral-600 font-bold flex items-start gap-1">
                          <span className="text-[#ef4255] shrink-0 font-bold">•</span>
                          <span className="truncate">
                            <strong className="text-[#321c49] font-black">{label}</strong>
                            {desc && `${separator}${desc}`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* 3. CHARACTER PERSONALITY INFORMATION BOX (INFO) - GHOST STICKER INCLUDED */}
              <div className="bg-white border-2 border-[#bfaecf] rounded-2xl p-4.5 shadow-md relative overflow-hidden bg-gradient-to-br from-white to-[#f7f5fa]">
                {/* WHITE CUTE GHOST STICKER AT BOTTOM RIGHT */}
                <div className="absolute right-2 bottom-2 w-16 h-16 pointer-events-none select-none z-0">
                  <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full filter drop-shadow-sm">
                    <path 
                      d="M50 15C33 15 22 26 22 43V75C22 79 26 81 29 79C32 76 35 73 39 76C43 79 46 83 50 83C54 83 57 79 61 76C65 73 68 76 71 79C74 81 78 79 78 75V43C78 26 67 15 50 15Z" 
                      fill="#FFFFFF" 
                      stroke="#beb0cc"
                      strokeWidth="3.5"
                      strokeLinejoin="round"
                    />
                    <circle cx="41" cy="45" r="4.5" fill="#2c1d3f"/>
                    <circle cx="59" cy="45" r="4.5" fill="#2c1d3f"/>
                    <ellipse cx="50" cy="55" rx="3.5" ry="5.5" fill="#2c1d3f"/>
                    <circle cx="34" cy="50" r="4" fill="#fcb3cc" opacity="0.85" />
                    <circle cx="66" cy="50" r="4" fill="#fcb3cc" opacity="0.85" />
                  </svg>
                </div>

                <h5 className="text-[11px] font-black text-black uppercase mb-3 border-b border-[#dfd6ea] pb-1 relative z-10">
                  캐릭터 정보 (INFO)
                </h5>

                <div className="space-y-1.2 text-left text-[9px] font-bold text-zinc-650 relative z-10 pr-10 leading-relaxed">
                  <div>
                    <span className="text-zinc-400 font-extrabold mr-1">• 이름:</span> 
                    <strong className="text-black font-black">{charInfo.name} ({charInfo.englishName})</strong>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-extrabold mr-1">• 나이:</span> 
                    <span className="text-[#8b31a8] font-black">{charInfo.age}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-extrabold mr-1">• 성격:</span> 
                    <span>{charInfo.personality}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-extrabold mr-1">• 특징:</span> 
                    <span>{charInfo.traits}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-extrabold mr-1">• 좋아하는 것:</span> 
                    <span className="text-[#ef4255] font-black">{charInfo.likes.join(", ")}</span>
                  </div>
                  <div>
                    <span className="text-zinc-400 font-extrabold mr-1">• 싫어하는 것:</span> 
                    <span>{charInfo.dislikes.join(", ")}</span>
                  </div>
                  <div className="pt-2 border-t border-dashed border-[#dfd4ea] mt-1.5">
                    <span className="text-[#ef4255] font-black block text-[9.5px]">
                      * 슬로건 키워드: "{charInfo.slogan}"
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* BOTTOM METADATA BAR KEYWORDS */}
          <div className="relative z-10 flex flex-col sm:flex-row gap-3 mt-6 pt-3 border-t border-dashed border-[#cfc4da] items-center">
            <div className="bg-[#e9e3f3] border border-[#cfc4da] text-[#ef4255] text-[10px] font-black px-4 py-2.5 rounded-2xl flex items-center justify-center shrink-0 tracking-widest uppercase shadow-sm">
               네컷 만화 최적화 디자인 키워드
            </div>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-2 w-full">
              {[
                { icon: "가독성 높은 실루엣", desc: "한눈에 캐릭터 파악 가능" },
                { icon: "감성 + 귀여움", desc: "MZ 세대 취향 저격" },
                { icon: "디테일 포인트", desc: "액세서리 + 체인 + 혼령 참" },
                { icon: "색감 통일감", desc: "퍼플 톤으로 분위기 유지" },
                { icon: "표정 연출 다양성", desc: "무표정, 웃음, 놀람, 부끄러움 등" },
                { icon: "배경 활용 용이", desc: "카페, 방, 거리 등 모든 씬 어울림" }
              ].map((keyword, i) => (
                <div 
                  key={i} 
                  className="bg-white border border-[#beb0cc]/40 rounded-xl p-1.5 flex flex-col justify-center text-center shadow-xs"
                >
                  <span className="block text-[8.5px] font-black text-black">
                    {keyword.icon}
                  </span>
                  <span className="block text-[7px] text-zinc-400 font-bold leading-none mt-0.5">
                    {keyword.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 2. MASTER ORIGINAL PICTURE VIEWPORT FRAME (인쇄용 완자 액자 항상 제공) */}
      <div className="space-y-4 pt-4">
        <h3 className="text-sm font-black text-zinc-800 dark:text-zinc-200 uppercase tracking-widest border-l-4 border-zinc-900 pl-3.5 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <Layers className="w-4 h-4 text-purple-600" />
            <span>초고화질 원본 인화지 마스터 파일 (300DPI)</span>
          </span>
          <span className="text-xs text-neutral-400 font-mono hidden sm:inline">ORIGINAL PRINT READY</span>
        </h3>

        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900 border border-zinc-800 p-4 rounded-3xl shadow-lg text-white">
          <div className="text-left">
            <h4 className="text-sm font-black text-white flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-500" />
              <span>굿즈 제작 및 원고용 전체 1장 파일</span>
            </h4>
          </div>
          
          {/* Quick Utility controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-zinc-800 rounded-xl px-3 py-1.5 border border-zinc-700 text-xs font-bold gap-2">
              <button
                onClick={() => setZoom(prev => Math.max(50, prev - 10))}
                className="p-1 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors min-w-[28px] min-h-[28px]"
                title="축소"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="w-10 text-center font-mono text-zinc-300">{zoom}%</span>
              <button
                onClick={() => setZoom(prev => Math.min(150, prev + 10))}
                className="p-1 hover:bg-zinc-700 rounded-lg cursor-pointer transition-colors min-w-[28px] min-h-[28px]"
                title="확대"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={handleOpenOriginal}
              className="cursor-pointer bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 min-h-[40px]"
            >
              <Eye className="w-4 h-4 text-sky-400" />
              <span>새탭 크게보기</span>
            </button>

            <button
              onClick={handleDownload}
              className="cursor-pointer bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-5 py-2.5 rounded-xl text-xs sm:text-sm font-black transition-all flex items-center gap-1.5 shadow-md shadow-purple-500/10 min-h-[40px]"
            >
              <Download className="w-4 h-4 text-white" />
              <span>이미지 다운로드</span>
            </button>
          </div>
        </div>

        {/* Framing Box */}
        <div className="flex justify-center items-center w-full bg-zinc-100 dark:bg-zinc-950 p-4 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-900 shadow-inner overflow-auto min-h-[350px]">
          <motion.div 
            className="relative max-w-full rounded-2xl shadow-2xl border-4 border-white bg-white overflow-hidden transition-all duration-300"
            style={{ width: `${zoom}%` }}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={`${charInfo.name} 캐릭터 큐시트 종합본`}
                className="w-full h-auto object-contain block select-all"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="p-20 text-center flex flex-col items-center justify-center space-y-4">
                <Image className="w-12 h-12 text-zinc-300 animate-pulse" />
                <p className="text-zinc-500 text-sm font-semibold">고화질 출력용 큐시트 이미지를 불러오고 있습니다...</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Accessibilities Guidelines */}
      <div className="bg-zinc-50 dark:bg-zinc-900/40 p-5 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl text-left space-y-2.5">
        <h5 className="text-sm font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Info className="w-4 h-4 text-purple-600" />
          <span>보관 및 저장 편의 안내</span>
        </h5>
        <ul className="text-xs sm:text-sm text-zinc-650 dark:text-zinc-400 space-y-1.5 pl-4 list-disc leading-relaxed font-semibold">
          <li><strong>저장은 더 쉽게!</strong> 모바일이나 태블릿에서 이미지를 길게 누르면 바로 사진첩에 간편 다운로드가 가능합니다.</li>
          <li><strong>글씨가 작아 출력이 걱정되신다면?</strong> 스마트폰 큰글씨 모드로 원화의 디테일 설명과 색상 코드를 1.5배 더 또렷하게 확인하신 뒤, 원본 인화지를 다운로드하여 인쇄소나 포토카드 굿즈 제작 시 300DPI 규격으로 인화할 수 있습니다.</li>
        </ul>
      </div>
    </div>
  );
}



