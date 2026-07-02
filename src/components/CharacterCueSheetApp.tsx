import React, { useState, useEffect, useRef } from "react";
import { 
  Sparkles, Upload, Image as ImageIcon, Loader2, RefreshCw, Layers, 
  Eye, Download, Palette, Shield, Sword, Smile, Zap, Film, Copy, Check,
  BookOpen, Heart, Share2, AlertCircle, Wand2, History, ArrowRight
} from "lucide-react";
import { 
  generateCharacterCueSheet, 
  saveCharacterCueSheetToDb, 
  fetchUserCharacterCueSheets, 
  CharacterTurnaroundCueSheet 
} from "../services/characterCueSheetService";
import { toast } from "sonner";
import { motion, AnimatePresence } from "motion/react";

interface CharacterCueSheetAppProps {
  user: any;
}

export default function CharacterCueSheetApp({ user }: CharacterCueSheetAppProps) {
  const [activeTab, setActiveTab] = useState<"create" | "gallery">("create");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [mimeType, setMimeType] = useState<string>("image/jpeg");
  const [charName, setCharName] = useState("");
  const [worldview, setWorldview] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultSheet, setResultSheet] = useState<CharacterTurnaroundCueSheet | null>(null);
  const [gallery, setGallery] = useState<CharacterTurnaroundCueSheet[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(false);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (activeTab === "gallery" && user?.email) {
      loadGallery();
    }
  }, [activeTab, user]);

  const loadGallery = async () => {
    if (!user?.email) return;
    setIsLoadingGallery(true);
    try {
      const list = await fetchUserCharacterCueSheets(user.email);
      setGallery(list);
    } catch (err) {
      console.error(err);
      toast.error("갤러리를 불러오는 데 실패했습니다.");
    } finally {
      setIsLoadingGallery(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      toast.success("캐릭터 사진이 성공적으로 마운트되었습니다!");
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드할 수 있습니다.");
      return;
    }

    setMimeType(file.type);
    const reader = new FileReader();
    reader.onload = () => {
      setSelectedImage(reader.result as string);
      toast.success("캐릭터 사진이 성공적으로 마운트되었습니다!");
    };
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!selectedImage) {
      toast.error("먼저 분석할 캐릭터 사진을 업로드해 주세요!");
      return;
    }

    setIsGenerating(true);
    toast.info("첨단 비전 AI가 캐릭터의 영혼과 디테일을 정밀 스캔 중입니다...");

    try {
      const base64Data = selectedImage.split(",")[1];
      const sheet = await generateCharacterCueSheet(base64Data, mimeType, charName, worldview);
      
      // 생성된 AI 프롬프트를 바탕으로 프로덕션 턴어라운드 일러스트 URL 배정
      const enhancePrompt = `${sheet.aiGenerativePrompt.englishPrompt}, official character sheet, turnaround view, white background, high contrast`;
      const aiGeneratedImgUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(enhancePrompt)}?width=1280&height=720&nologo=true&enhance=true&seed=${Math.floor(Math.random()*10000)}`;

      const finalSheet: CharacterTurnaroundCueSheet = {
        ...sheet,
        originalImageUrl: selectedImage
      };

      setResultSheet(finalSheet);
      toast.success("✨ 사람들이 감탄사를 연발할 마스터 캐릭터 큐시트가 탄생했습니다!");

      if (user?.email) {
        saveCharacterCueSheetToDb(finalSheet, user.email, user.email).catch(console.error);
      }
    } catch (err) {
      console.error(err);
      toast.error("큐시트 생성 중 오류가 발생했습니다. 다시 시도해 주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    toast.success(`${label} 복사 완료!`);
    setTimeout(() => setCopiedText(null), 2000);
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      {/* App Hero Header */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-violet-950 via-purple-900 to-indigo-950 p-8 md:p-12 text-white shadow-2xl border border-purple-500/30">
        <div className="absolute -right-10 -bottom-10 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-4 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/30 border border-purple-400/40 backdrop-blur-md text-xs font-black tracking-widest uppercase text-purple-200">
            <Wand2 className="w-3.5 h-3.5 text-amber-300" />
            <span>AI TRIPLE-A IP GENERATOR</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
            캐릭터 턴어라운드 <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-pink-300 to-cyan-300">AI 큐시트 스튜디오</span>
          </h1>
          <p className="text-sm sm:text-base text-purple-200 font-medium leading-relaxed">
            캐릭터 사진 단 한 장만 업로드하세요. 지브리·픽사 수석 디렉터의 관점으로 앞·뒤·옆 전신 실루엣, 4종 핵심 표정 클로즈업, 무기/의복 아이템 정밀 스펙과 팔레트 청사진을 완벽하게 설계해 드립니다.
          </p>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              onClick={() => setActiveTab("create")}
              className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer shadow-lg ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-amber-400 to-orange-500 text-zinc-950 shadow-orange-500/30 scale-105"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>새 큐시트 AI 제작실</span>
            </button>
            <button
              onClick={() => setActiveTab("gallery")}
              className={`px-6 py-3 rounded-2xl font-black text-sm flex items-center gap-2 transition-all cursor-pointer ${
                activeTab === "gallery"
                  ? "bg-gradient-to-r from-purple-500 to-indigo-500 text-white shadow-purple-500/30 scale-105"
                  : "bg-white/10 hover:bg-white/20 text-white"
              }`}
            >
              <History className="w-4 h-4" />
              <span>내 마스터피스 갤러리</span>
            </button>
          </div>
        </div>
      </div>

      {/* TAB 1: CREATE STUDIO */}
      {activeTab === "create" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Controls Panel */}
          <div className="lg:col-span-5 space-y-6 bg-white dark:bg-zinc-900 p-6 md:p-8 rounded-3xl border border-neutral-200 dark:border-zinc-800 shadow-xl">
            <h2 className="text-xl font-black text-zinc-900 dark:text-white flex items-center gap-2 border-b border-neutral-100 dark:border-zinc-800 pb-4">
              <Upload className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              <span>1. 캐릭터 원본 마운트</span>
            </h2>

            {/* Drag Drop Box */}
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
                    <span>클릭 혹은 드래그하여 다른 사진 교체</span>
                  </p>
                </div>
              ) : (
                <div className="space-y-4 py-6">
                  <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-900/50 flex items-center justify-center mx-auto text-purple-600 dark:text-purple-300 group-hover:scale-110 transition-transform shadow-inner">
                    <ImageIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-base font-black text-zinc-800 dark:text-zinc-200">
                      캐릭터 사진 드래그 & 드롭
                    </p>
                    <p className="text-xs text-zinc-500 mt-1">
                      또는 여기를 클릭해서 스마트폰/PC 파일 선택
                    </p>
                  </div>
                  <div className="inline-block px-3 py-1 bg-purple-200/60 dark:bg-purple-900/40 rounded-full text-[11px] font-bold text-purple-800 dark:text-purple-300">
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
                  placeholder="예: 엘리시온의 은빛 호위기사 아리엘"
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
                  placeholder="예: 사이버펑크 2099 / 하이 판타지 신화"
                  value={worldview}
                  onChange={(e) => setWorldview(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-sm font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedImage}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white font-black text-base shadow-xl shadow-purple-500/25 flex items-center justify-center gap-2.5 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                  <span>수석 디렉터 AI 정밀 청사진 생성 중...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 text-amber-300 animate-pulse" />
                  <span>마스터 큐시트 AI 분석 시작하기</span>
                </>
              )}
            </button>
          </div>

          {/* Right Results Panel */}
          <div className="lg:col-span-7 space-y-6">
            {isGenerating ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-zinc-800 shadow-xl min-h-[520px] flex flex-col items-center justify-center space-y-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin" />
                  <Sparkles className="w-8 h-8 text-amber-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-bounce" />
                </div>
                <div className="space-y-2 max-w-md">
                  <h3 className="text-xl font-black text-zinc-900 dark:text-white">
                    블리자드·픽사급 캐릭터 큐시트 연출 중
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    앞·뒤·옆 360도 턴어라운드 외형 묘사, 미세 감정선 클로즈업 포인트, 장착 아이템 재질 분석 및 프롬프트 최적화를 수행하고 있습니다. 잠시만 대기해 주세요.
                  </p>
                </div>
              </div>
            ) : resultSheet ? (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-6 md:p-8 border border-neutral-200 dark:border-zinc-800 shadow-2xl space-y-8">
                {/* Result Top Banner */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-neutral-200 dark:border-zinc-800 pb-6">
                  <div>
                    <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black">
                      IP OFFICIAL BLUEPRINT APPROVED
                    </span>
                    <h2 className="text-2xl font-black text-zinc-900 dark:text-white mt-1.5">
                      {resultSheet.characterName}
                    </h2>
                    <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                      {resultSheet.titleOrClass} • [{resultSheet.worldviewAndGenre}]
                    </p>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={() => copyToClipboard(JSON.stringify(resultSheet, null, 2), "설계도 JSON")}
                      className="px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 text-xs font-black flex items-center gap-1.5 transition-colors"
                    >
                      {copiedText === "설계도 JSON" ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>데이터 복사</span>
                    </button>
                  </div>
                </div>

                {/* Logline Box */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/60">
                  <p className="text-xs font-black text-purple-800 dark:text-purple-300 uppercase mb-1">📖 핵심 로그라인 (Logline)</p>
                  <p className="text-sm sm:text-base font-extrabold text-zinc-900 dark:text-zinc-100 leading-relaxed italic">
                    "{resultSheet.logline}"
                  </p>
                </div>

                {/* Section ① Turnaround Views */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 border-l-4 border-purple-600 pl-3">
                    <Layers className="w-5 h-5 text-purple-500" />
                    <span>① 턴어라운드 4면도 외형 가이드</span>
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: "정면 실루엣 (Front View)", text: resultSheet.turnaround.frontView },
                      { label: "후면 실루엣 (Back View)", text: resultSheet.turnaround.backView },
                      { label: "측면 구도 (Side View)", text: resultSheet.turnaround.sideView },
                      { label: "쿼터 45도 (Three-Quarter)", text: resultSheet.turnaround.threeQuarterView }
                    ].map((item, i) => (
                      <div key={i} className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/80 space-y-1.5">
                        <span className="text-xs font-black text-purple-700 dark:text-purple-300 block">{item.label}</span>
                        <p className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 leading-normal">{item.text}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section ② Expressions */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 border-l-4 border-pink-500 pl-3">
                    <Smile className="w-5 h-5 text-pink-500" />
                    <span>② 클로즈업 핵심 표정 연기안 (4종)</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {resultSheet.expressions.map((exp, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-pink-50/50 dark:bg-pink-950/20 border border-pink-200 dark:border-pink-900/40 flex gap-3.5 items-start">
                        <span className="text-3xl p-2 rounded-xl bg-white dark:bg-zinc-800 shadow-sm shrink-0">{exp.emotionEmoji || "✨"}</span>
                        <div className="space-y-1">
                          <h4 className="text-sm font-black text-zinc-900 dark:text-white">{exp.name}</h4>
                          <p className="text-xs text-pink-700 dark:text-pink-300 font-bold">{exp.closeupDescription}</p>
                          <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">🎬 연기 지도: {exp.actingPoint}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section ③ Equipped Items */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 border-l-4 border-blue-500 pl-3">
                    <Sword className="w-5 h-5 text-blue-500" />
                    <span>③ 캐릭터 착용 아이템 정밀 스펙</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {resultSheet.equippedItems.map((item, idx) => (
                      <div key={idx} className="p-4 rounded-2xl bg-blue-50/40 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-900/40 space-y-1.5">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-black text-zinc-900 dark:text-white">{item.name}</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">{item.type}</span>
                        </div>
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">{item.detailSpec}</p>
                        <p className="text-[11px] text-zinc-500 dark:text-zinc-400">🔬 재질/텍스처: {item.materialAndTexture}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section ④ Color Palette */}
                <div className="space-y-4">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white flex items-center gap-2 border-l-4 border-amber-500 pl-3">
                    <Palette className="w-5 h-5 text-amber-500" />
                    <span>④ 시그니처 배색 컬러 팔레트</span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                    {resultSheet.colorPalette.map((col, idx) => (
                      <div 
                        key={idx}
                        onClick={() => copyToClipboard(col.hex, col.colorName)}
                        className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 cursor-pointer transition-all flex flex-col justify-between group h-24"
                      >
                        <div className="flex items-center gap-2.5">
                          <div className="w-6 h-6 rounded-lg shadow-md border border-black/10 shrink-0" style={{ backgroundColor: col.hex }} />
                          <div className="min-w-0">
                            <span className="text-xs font-black text-zinc-900 dark:text-white block truncate">{col.colorName}</span>
                            <span className="text-[10px] font-mono font-bold text-zinc-500">{col.hex}</span>
                          </div>
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 mt-2">{col.usage}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Section ⑤ AI Generator Prompt */}
                <div className="p-6 rounded-3xl bg-zinc-950 text-white space-y-4 border border-zinc-800 shadow-xl">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <Zap className="w-4 h-4" />
                      <span>AI 이미지 생성기 전용 최적화 프롬프트 (Midjourney / SD)</span>
                    </span>
                    <button
                      onClick={() => copyToClipboard(resultSheet.aiGenerativePrompt.englishPrompt, "영문 프롬프트")}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 font-black text-xs rounded-xl flex items-center gap-1 transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                      <span>프롬프트 복사</span>
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm font-mono text-zinc-300 bg-zinc-900 p-4 rounded-2xl leading-relaxed select-all">
                    {resultSheet.aiGenerativePrompt.englishPrompt}
                  </p>
                  <p className="text-xs text-zinc-400">
                    💡 <strong className="text-white">한글 해석:</strong> {resultSheet.aiGenerativePrompt.koreanPrompt}
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 rounded-3xl p-12 text-center border border-neutral-200 dark:border-zinc-800 shadow-xl min-h-[520px] flex flex-col items-center justify-center space-y-4 text-zinc-400">
                <Film className="w-16 h-16 stroke-1 text-zinc-300 dark:text-zinc-700" />
                <h3 className="text-lg font-bold text-zinc-600 dark:text-zinc-300">
                  좌측에서 사진을 업로드하고 분석을 시작해 보세요!
                </h3>
                <p className="text-xs text-zinc-400 max-w-sm">
                  인공지능이 캐릭터 외형과 복장, 컬러 팔레트, 연출 프롬프트를 완벽히 분해해 청사진 시트를 출력해 드립니다.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GALLERY */}
      {activeTab === "gallery" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-black text-zinc-900 dark:text-white flex items-center gap-2">
              <History className="w-6 h-6 text-purple-600" />
              <span>내 마스터피스 큐시트 보관함</span>
            </h2>
            <button
              onClick={loadGallery}
              className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 text-xs font-black flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingGallery ? "animate-spin" : ""}`} />
              <span>동기화</span>
            </button>
          </div>

          {isLoadingGallery ? (
            <div className="py-24 text-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto" />
              <p className="text-sm font-bold text-zinc-500">클라우드 공방 기록을 불러오고 있습니다...</p>
            </div>
          ) : gallery.length === 0 ? (
            <div className="bg-white dark:bg-zinc-900 p-16 rounded-3xl text-center border border-neutral-200 dark:border-zinc-800 space-y-4">
              <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto" />
              <p className="text-base font-bold text-zinc-600 dark:text-zinc-400">보관된 캐릭터 큐시트가 없습니다.</p>
              <p className="text-xs text-zinc-400">'새 큐시트 AI 제작실' 탭에서 나만의 캐릭터 IP를 첫 번째로 등록해 보세요!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {gallery.map((item, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    setResultSheet(item);
                    setActiveTab("create");
                  }}
                  className="bg-white dark:bg-zinc-900 p-6 rounded-3xl border border-neutral-200 dark:border-zinc-800 hover:border-purple-500 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group flex flex-col justify-between h-80"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/60 text-purple-800 dark:text-purple-200 text-[10px] font-black uppercase">
                        {item.worldviewAndGenre || "CHARACTER IP"}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {item.createdAt ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : ""}
                      </span>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-1">
                      {item.characterName}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 font-medium">
                      {item.logline}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-neutral-100 dark:border-zinc-800 flex justify-between items-center">
                    <div className="flex gap-1.5 overflow-hidden">
                      {item.colorPalette?.slice(0,4).map((c, ci) => (
                        <div key={ci} className="w-4 h-4 rounded-full border border-black/10" style={{ backgroundColor: c.hex }} />
                      ))}
                    </div>
                    <span className="text-xs font-black text-purple-600 dark:text-purple-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>청사진 열람</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
