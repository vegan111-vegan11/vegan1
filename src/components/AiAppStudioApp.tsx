import React, { useState, useRef } from "react";
import { 
  Sparkles, Upload, Image as ImageIcon, Loader2, RefreshCw, Layers, 
  Eye, Download, Palette, Shield, Sword, Smile, Zap, Film, Copy, Check,
  Wand2, History, ArrowRight, Smartphone, Video, Play, Flame, Share2, Compass,
  X, Trash2
} from "lucide-react";
import { 
  generateCharacterCueSheet, 
  saveCharacterCueSheetToDb, 
  CharacterTurnaroundCueSheet 
} from "../services/characterCueSheetService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";
import CharacterCueSheetBlueprint from "./CharacterCueSheetBlueprint";

interface AiAppStudioAppProps {
  user: any;
  isSimulatedMobileView?: boolean;
}

export default function AiAppStudioApp({ user, isSimulatedMobileView = false }: AiAppStudioAppProps) {
  const [activeSubApp, setActiveSubApp] = useState<"turnaround" | "shorts">("turnaround");

  // --- APP 1: Character Single-Image Turnaround Cue Sheet ---
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [charName, setCharName] = useState("");
  const [worldview, setWorldview] = useState("");
  const [isGeneratingSheet, setIsGeneratingSheet] = useState(false);
  const [resultSheet, setResultSheet] = useState<{
    sheet: CharacterTurnaroundCueSheet;
    wideUrl: string;
    originalUrl: string;
  } | null>(null);
  const [copiedLabel, setCopiedLabel] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- APP 2: AI Shorts/Reels Webtoon Storyboard Generator ---
  const [shortsTopic, setShortsTopic] = useState("");
  const [shortsGenre, setShortsGenre] = useState("코믹/사이다 반전");
  const [isGeneratingShorts, setIsGeneratingShorts] = useState(false);
  const [shortsResult, setShortsResult] = useState<any | null>(null);

  const handleFiles = (files: FileList) => {
    const file = files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error(`${file.name}은(는) 이미지 파일이 아닙니다.`);
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      toast.success("캐릭터 원본 사진이 마운트되었습니다!");
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleGenerateSheet = async () => {
    if (!selectedImage) {
      toast.error("먼저 분석할 캐릭터 사진을 업로드해 주세요!");
      return;
    }

    setIsGeneratingSheet(true);
    toast.info("캐릭터 비주얼 스캔 및 도면 합성 중...");

    try {
      const base64Data = selectedImage.split(",")[1];
      const sheet = await generateCharacterCueSheet(base64Data, mimeType, charName, worldview);
      
      // We reinforce the pollination prompt so it perfectly aligns FRONT, SIDE, BACK standing side-by-side!
      // Here we append standard turnaround view enhancers, preserving style (realistic cosplay vs anime)
      const isRealisticStyle = sheet.directorDirectives?.renderingStyle?.toLowerCase().includes("photo") || 
                              sheet.directorDirectives?.renderingStyle?.toLowerCase().includes("real") ||
                              sheet.aiGenerativePrompt?.englishPrompt?.toLowerCase().includes("photorealistic") ||
                              sheet.aiGenerativePrompt?.englishPrompt?.toLowerCase().includes("cosplay") ||
                              sheet.aiGenerativePrompt?.englishPrompt?.toLowerCase().includes("35mm");
      
      const styleHeader = isRealisticStyle 
        ? "a photorealistic masterpiece photo, cinematic award-winning cosplay photography, captured on 35mm lens, realistic human skin textures and high-fidelity fabric details"
        : "highly detailed 2D anime illustration, elegant webtoon digital art key visual, clean lineart, vibrant flat anime colors";

      const widePrompt = `${styleHeader}, Official character model sheet, complete full-body turnaround view, three views of the EXACT same character: front view, side view, and back view standing side-by-side in one single horizontal wide frame. Symmetrical alignment, nicely spaced, well-proportioned full body standing upright from head to toe, no cropped head, no cropped feet, clean flat solid white background. ${sheet.aiGenerativePrompt.englishPrompt}, masterpiece, ultra-detailed`;

      const aiWideImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(widePrompt)}?width=1536&height=768&nologo=true&enhance=true&seed=${Math.floor(Math.random()*10000)}`;

      const finalSheet: CharacterTurnaroundCueSheet = {
        ...sheet,
        originalImageUrl: selectedImage
      };

      if (user?.email) {
        await saveCharacterCueSheetToDb(finalSheet, user.email, user.email).catch(console.error);
      }

      setResultSheet({
        sheet: finalSheet,
        wideUrl: aiWideImgUrl,
        originalUrl: selectedImage
      });

      toast.success(`"${sheet.characterName}" 큐시트 연출 완료!`);
    } catch (err) {
      console.error(err);
      toast.error("큐시트 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsGeneratingSheet(false);
    }
  };

  const copyText = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLabel(label);
    toast.success(`${label} 복사가 완료되었습니다!`);
    setTimeout(() => setCopiedLabel(null), 2000);
  };

  // --- APP 2 GENERATOR LOGIC ---
  const handleGenerateShorts = () => {
    if (!shortsTopic.trim()) {
      toast.error("생성할 쇼츠/릴스의 스토리 주제를 한 줄 입력해 주세요!");
      return;
    }
    setIsGeneratingShorts(true);
    toast.info("트렌디한 숏폼 알고리즘에 맞추어 기-승-전-결 5컷 콘티 연출 중...");

    setTimeout(() => {
      const cuts = [
        { cut: "1컷 (0~3초) [도입 훅]", action: `주인공이 놀란 눈으로 화면을 정면 응시하며 충격적인 결말을 예고함.`, line: `"당신이 매일 먹는 이것, 사실 엄청난 반전이 있습니다!"`, imgPrompt: `${shortsTopic}, dramatic close up anime style, shocked expression, high contrast` },
        { cut: "2컷 (3~6초) [문제 제기]", action: `배경이 어두워지며 사람들이 평소 실수하는 행동을 빠른 모션으로 연출.`, line: `"다들 아무 생각 없이 이렇게 행동하시죠? 하지만..."`, imgPrompt: `${shortsTopic}, dark suspenseful atmosphere, webtoon style, mystery` },
        { cut: "3컷 (6~9초) [핵심 전환]", action: `손에 들고 있던 아이템이 빛나며 진짜 비밀이 드러나는 클로즈업 컷.`, line: `"알고 보니 이 안에 감춰진 진짜 정체는 바로...!""`, imgPrompt: `${shortsTopic}, glowing magical artifact, ultra detailed cinematic illustration` },
        { cut: "4컷 (9~12초) [절정 사이다]", action: `화려한 이펙트와 함께 주인공이 자신감 넘치는 미소를 지으며 해결책 제시.`, line: `"단 5초만 투자하면 완전히 인생이 달라집니다!"`, imgPrompt: `${shortsTopic}, confident smile hero victory pose, dynamic particle effects` },
        { cut: "5컷 (12~15초) [여운 & 구독 훅]", action: `화면 중앙에 '저장 및 공유' 화살표 아이콘이 떠오르며 윙크하는 컷.`, line: `"나만 알기 아까운 팁, 친구에게 공유하고 구독하세요!"`, imgPrompt: `${shortsTopic}, cute wink character pointing at subscribe button, vibrant colors` }
      ];

      setShortsResult({
        title: `🔥 [숏폼 웹툰 대본] ${shortsTopic}`,
        genre: shortsGenre,
        bgm: "경쾌하고 비트감 있는 일렉트로닉 트랩 (128 BPM)",
        cuts
      });
      setIsGeneratingShorts(false);
      toast.success("🎬 15초 바이럴 각이 살아있는 숏폼 스토리보드 대본이 완성되었습니다!");
    }, 1800);
  };

  const mapTurnaroundToBlueprintData = (sheet: CharacterTurnaroundCueSheet, wideUrl: string) => {
    let englishName = sheet.characterName.replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, "").replace(/[\(\)]/g, "").trim();
    if (!englishName) {
      englishName = (sheet.characterInfo?.name || "CHARACTER").replace(/[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/g, "").replace(/[\(\)]/g, "").trim();
    }

    const likesArray = typeof sheet.characterInfo?.likes === "string" 
      ? (sheet.characterInfo.likes as string).split(",").map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(sheet.characterInfo?.likes) ? sheet.characterInfo.likes : ["네컷 사진 찍기", "카페 투어"];

    const dislikesArray = typeof sheet.characterInfo?.dislikes === "string" 
      ? (sheet.characterInfo.dislikes as string).split(",").map((s: string) => s.trim()).filter(Boolean)
      : Array.isArray(sheet.characterInfo?.dislikes) ? sheet.characterInfo.dislikes : ["어두운 곳", "무서운 이야기"];

    return {
      imageUrl: wideUrl,
      characterInfo: {
        name: sheet.characterInfo?.name || sheet.characterName,
        englishName: englishName.toUpperCase() || "CHARACTER",
        age: sheet.characterInfo?.age || sheet.age || "20살",
        personality: sheet.characterInfo?.personality || sheet.logline || "",
        traits: `${sheet.titleOrClass || "스페셜 에디션"} • ${sheet.version || "오리지널 ver."}`,
        likes: likesArray,
        dislikes: dislikesArray,
        slogan: sheet.characterInfo?.storyKeyword || sheet.logline || "이솔공방 명작 탄생!"
      },
      colorPalette: (sheet.colorPalette || []).map((c: any) => ({
        colorName: c.colorName,
        hex: c.hex
      })),
      details: (sheet.detailCuts || []).map((d: any) => ({
        title: d.title,
        description: d.desc
      })),
      expressions: (sheet.expressions || []).map((e: any) => ({
        emotionName: e.name,
        desc: e.closeupDescription,
        detailDesc: e.actingPoint
      })),
      lightingAndBgTips: [
        `핵심 지침: ${sheet.directorDirectives?.keyFeature || "정밀 원화 가이드라인에 최적화된 라인 드로잉 제공"}`,
        `조명 연출: ${sheet.directorDirectives?.lightingSetup || "부드러운 주조명과 반사광을 이용한 입체적인 실루엣 강화"}`,
        `렌더링 화풍: ${sheet.directorDirectives?.renderingStyle || "세련된 2D 셀채색 방식을 활용한 일관된 서브컬쳐 웹툰 연출"}`
      ],
      bestComboGuides: (sheet.designKeywords || []).map((k: any) => k.title)
    };
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* Category Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-purple-950 to-indigo-950 p-8 md:p-12 text-white shadow-2xl border border-purple-500/30">
        <div className="absolute -right-10 -bottom-10 w-96 h-96 bg-gradient-to-br from-amber-500/20 via-pink-500/20 to-cyan-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/20 border border-amber-400/40 backdrop-blur-md text-xs font-black tracking-widest uppercase text-amber-300">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ISOL AI CREATIVE APP STUDIO</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            이솔공방 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-rose-300 to-cyan-300">AI 앱 스튜디오</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 font-medium leading-relaxed">
            최신 크리에이티브 트렌드를 반영하여 제작된 이솔공방 전용 인공지능 앱 모음입니다. 상단의 앱 메뉴를 클릭하여 영상 제작용 통합 캐릭터 큐시트 및 숏폼 대본 자동 연출기를 자유롭게 이용해 보세요!
          </p>

          {/* Sub App Switcher Tabs */}
          <div className="flex flex-wrap gap-3 pt-4">
            <button
              onClick={() => setActiveSubApp("turnaround")}
              className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                activeSubApp === "turnaround"
                  ? "bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 text-zinc-950 shadow-orange-500/30 scale-[1.03]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Layers className="w-4 h-4 text-purple-900" />
              <span>① 캐릭터 단일 통합 큐시트 생성기</span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-red-600 text-white animate-pulse">영상용 1장설계</span>
            </button>

            <button
              onClick={() => setActiveSubApp("shorts")}
              className={`px-6 py-3.5 rounded-2xl font-black text-sm flex items-center gap-2.5 transition-all cursor-pointer shadow-xl ${
                activeSubApp === "shorts"
                  ? "bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-zinc-950 shadow-cyan-500/30 scale-[1.03]"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Smartphone className="w-4 h-4 text-blue-950" />
              <span>② AI 쇼츠·릴스 웹툰 콘티 연출기</span>
              <span className="ml-1 px-1.5 py-0.5 rounded text-[10px] bg-emerald-600 text-white">15초 바이럴</span>
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* APP 1: CHARACTER SINGLE-IMAGE TURNAROUND CUE SHEET GENERATOR            */}
      {/* ========================================================================= */}
      {activeSubApp === "turnaround" && (
        <div className={`grid ${isSimulatedMobileView ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"} gap-8 items-start animate-in fade-in duration-300`}>
          {/* Left Inputs Box */}
          <div className={`${isSimulatedMobileView ? "col-span-1" : "lg:col-span-5"} space-y-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-xl`}>
            <div className="space-y-1">
              <span className="text-[11px] font-black tracking-wider text-purple-600 dark:text-purple-400 uppercase">STEP 1. CHARACTER MOUNT</span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-purple-600" />
                <span>캐릭터 원본 사진 마운트</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-semibold leading-relaxed">
                업로드한 캐릭터의 의상과 얼굴을 AI 비전으로 정밀 분석해 <strong className="text-purple-600 dark:text-purple-400">앞·옆·뒤 3면도 통합 마스터 큐시트</strong>로 자동 설계합니다.
              </p>
            </div>

            {/* Upload Drag Box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-purple-300 dark:border-purple-700/60 hover:border-purple-500 rounded-3xl p-8 text-center bg-purple-50/40 dark:bg-purple-950/20 cursor-pointer transition-all hover:scale-[1.01] group"
            >
              <input 
                ref={fileInputRef} 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />
              {selectedImage ? (
                <div className="space-y-4">
                  <div className="relative aspect-square w-full max-w-[240px] mx-auto rounded-2xl overflow-hidden shadow-lg border-2 border-purple-500">
                    <img src={selectedImage} alt="Uploaded Char" className="w-full h-full object-cover" />
                  </div>
                  <p className="text-xs font-bold text-purple-700 dark:text-purple-300 flex items-center justify-center gap-1">
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>클릭 혹은 드래그하여 다른 사진으로 교체</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-3">
                  <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform shadow-inner">
                    <ImageIcon className="w-7 h-7" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                      캐릭터 사진 추가하기 (드래그 & 드롭)
                    </p>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      여기를 클릭해서 캐릭터 이미지 파일 선택
                    </p>
                  </div>
                  <div className="inline-block px-3 py-1 bg-purple-200/60 dark:bg-purple-900/40 rounded-full text-[10px] font-bold text-purple-800 dark:text-purple-300">
                    JPG, PNG, WEBP 지원 (고화질 권장)
                  </div>
                </div>
              )}
            </div>

            {/* Custom Inputs */}
            <div className="space-y-4 pt-2">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  캐릭터 공식 이름 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 뽀잉 (PPOING)"
                  value={charName}
                  onChange={(e) => setCharName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  세계관 및 작품 장르 (선택)
                </label>
                <input
                  type="text"
                  placeholder="예: 판타지 모험물 / 일상 힐링 웹툰"
                  value={worldview}
                  onChange={(e) => setWorldview(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            <button
              onClick={handleGenerateSheet}
              disabled={isGeneratingSheet || !selectedImage}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isGeneratingSheet ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span>통합 큐시트 자동 분석 및 3면도 합성 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>[앞·옆·뒤] 단일 통합 큐시트 생성하기</span>
                </>
              )}
            </button>
          </div>

          {/* Right Output Blueprints Box */}
          <div className={`${isSimulatedMobileView ? "col-span-1" : "lg:col-span-7"} space-y-8`}>
            {isGeneratingSheet ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-zinc-800 shadow-xl min-h-[580px] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <Sparkles className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                    영상 제작용 통합 마스터 큐시트 연출 중
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    업로드된 캐릭터 사진의 화풍(실사/2D)과 의상을 정교하게 판독하고 있습니다. 한 장의 wide 프레임 안에 <strong className="text-purple-500">앞면 전신, 옆면 구도, 뒷면 실루엣</strong>을 완벽하게 수평 정렬하여 Runway/Luma 등 영상 생성 AI 최적화 도면을 완성합니다.
                  </p>
                </div>
              </div>
            ) : resultSheet ? (
              <div className="space-y-4 animate-in fade-in duration-500">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-purple-50 dark:bg-zinc-800/40 p-4 rounded-2xl border border-purple-200 dark:border-purple-800 gap-3">
                  <div>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 uppercase tracking-widest block">MASTER SHEET RESULT</span>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white mt-0.5">
                      🎬 캐릭터: {resultSheet.sheet.characterName} 큐시트 도면
                    </h3>
                  </div>
                  <div className="flex items-center gap-2.5 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-purple-100 dark:border-zinc-800 shadow-sm shrink-0">
                    <span className="text-xs text-zinc-500 font-bold">스캔 원본:</span>
                    <img src={resultSheet.originalUrl} alt="Original source" className="w-8 h-8 rounded-lg object-cover border border-purple-300 dark:border-purple-700" />
                  </div>
                </div>
                <CharacterCueSheetBlueprint data={mapTurnaroundToBlueprintData(resultSheet.sheet, resultSheet.wideUrl) as any} />
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-zinc-800 shadow-xl min-h-[580px] flex flex-col items-center justify-center space-y-4 text-zinc-400">
                <Compass className="w-16 h-16 stroke-1 text-purple-300 dark:text-purple-800 animate-spin-slow" />
                <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-300">
                  좌측에서 사진을 업로드하여 [앞·옆·뒤 통합 1장] 큐시트를 출력하세요!
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
                  캐릭터 이름을 정하고, 입고 있는 옷과 액세서리를 그대로 보존하여 화풍 일치형 삼면도를 정밀 제작해 드립니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* APP 2: AI SHORTS / REELS WEBTOON STORYBOARD GENERATOR                   */}
      {/* ========================================================================= */}
      {activeSubApp === "shorts" && (
        <div className={`grid ${isSimulatedMobileView ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-12"} gap-8 items-start animate-in fade-in duration-300`}>
          {/* Left Inputs */}
          <div className={`${isSimulatedMobileView ? "col-span-1" : "lg:col-span-5"} space-y-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-xl`}>
            <div className="space-y-1">
              <span className="text-[11px] font-black tracking-wider text-cyan-600 dark:text-cyan-400 uppercase">STEP 1. VIRAL SCRIPT SETUP</span>
              <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
                <Flame className="w-5 h-5 text-red-500" />
                <span>AI 쇼츠·릴스 웹툰 콘티 연출기</span>
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                주제만 던지면 숏폼 플랫폼 최적의 기승전결 5컷 알고리즘 스토리라인과 대본, 그리고 정밀 비주얼 이미지 생성 프롬프트를 원클릭 연출합니다.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  쇼츠/릴스 스토리 핵심 주제 (필수)
                </label>
                <input
                  type="text"
                  placeholder="예: 맛집에서 혼자 밥 먹다 첫사랑을 다시 마주친 순간"
                  value={shortsTopic}
                  onChange={(e) => setShortsTopic(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                  바이럴 유도 알고리즘 장르
                </label>
                <select
                  value={shortsGenre}
                  onChange={(e) => setShortsGenre(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500 cursor-pointer"
                >
                  <option value="코믹/사이다 반전">🤪 코믹/사이다 반전 (추천)</option>
                  <option value="도파민 폭발 자극">🔥 도파민 폭발 자극</option>
                  <option value="로맨틱 설렘 폭발">💖 로맨틱 설렘 폭발</option>
                  <option value="감동/눈물샘 자극">😭 감동/눈물샘 자극</option>
                  <option value="미스터리/서스펜스">👁️ 미스터리/서스펜스</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleGenerateShorts}
              disabled={isGeneratingShorts || !shortsTopic.trim()}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-zinc-950 font-black text-base shadow-xl shadow-cyan-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isGeneratingShorts ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-zinc-950" />
                  <span>15초 바이럴 콘티 연출하는 중...</span>
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 text-zinc-950" />
                  <span>15초 쇼츠 대본 자동 기획하기</span>
                </>
              )}
            </button>
          </div>

          {/* Right Outputs */}
          <div className={`${isSimulatedMobileView ? "col-span-1" : "lg:col-span-7"} space-y-6`}>
            {isGeneratingShorts ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-zinc-800 shadow-xl min-h-[540px] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-cyan-500/20 border-t-cyan-500 animate-spin" />
                  <Flame className="w-8 h-8 text-orange-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                    스마트 숏폼 알고리즘 탑재 대본 연출 중
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    틱톡, 인스타 릴스, 유튜브 쇼츠의 바이럴 공식을 역설계 중입니다. 시청 이탈 방지 훅 설계와 영상화에 적합한 씬 이미지 가이드를 작성 중입니다.
                  </p>
                </div>
              </div>
            ) : shortsResult ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-zinc-800 shadow-2xl space-y-6 animate-in fade-in duration-500">
                <div className="border-b border-zinc-100 dark:border-zinc-800 pb-4">
                  <span className="px-3 py-1 rounded-full bg-cyan-100 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 text-xs font-black">
                    VIRAL SHORTS STORYBOARD
                  </span>
                  <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1.5">
                    {shortsResult.title}
                  </h2>
                  <p className="text-xs font-extrabold text-zinc-400 mt-1">
                    장르: {shortsResult.genre} • 권장 배경음(BGM): {shortsResult.bgm}
                  </p>
                </div>

                {/* Cuts List */}
                <div className="space-y-4">
                  {shortsResult.cuts.map((cut: any, idx: number) => {
                    const aiCutImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cut.imgPrompt)}?width=800&height=450&nologo=true&enhance=true&seed=${Math.floor(Math.random()*10000)}`;

                    return (
                      <div key={idx} className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-150 dark:border-zinc-800/80 space-y-3">
                        <div className="flex justify-between items-center bg-cyan-500/10 px-3 py-1.5 rounded-xl border border-cyan-500/20">
                          <span className="text-xs font-black text-cyan-600 dark:text-cyan-400 uppercase">
                            {cut.cut}
                          </span>
                          <span className="text-[10px] text-zinc-400 font-extrabold">바이럴 연출 씬</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-start">
                          <div className="md:col-span-8 space-y-2">
                            <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">
                              🎬 화면 액션/지시: <span className="font-semibold text-zinc-650 dark:text-zinc-400">{cut.action}</span>
                            </p>
                            <p className="text-sm font-black text-cyan-700 dark:text-cyan-400">
                              🗣️ 독백/자막 라인: <span className="font-extrabold text-zinc-950 dark:text-zinc-100">"{cut.line}"</span>
                            </p>
                          </div>

                          <div className="md:col-span-4">
                            <div className="aspect-[16/9] w-full rounded-xl overflow-hidden bg-zinc-900 border border-zinc-200 dark:border-zinc-700 relative group shadow-md">
                              <img src={aiCutImgUrl} alt={`Scene ${idx+1}`} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <span className="text-[10px] font-black text-white bg-black/60 px-2 py-1 rounded-md">AI 실시간 연출 컷</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-zinc-800 shadow-xl min-h-[540px] flex flex-col items-center justify-center space-y-4 text-zinc-400">
                <Video className="w-16 h-16 stroke-1 text-cyan-300 dark:text-cyan-800 animate-pulse" />
                <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-300">
                  좌측에서 주제를 입력하여 15초 바이럴 스토리보드를 기획하세요!
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  도파민 자극형 반전 연출법부터 기승전결 컷씬의 비주얼 매칭 프롬프트까지 알고리즘에 맞게 자동 빌드됩니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
