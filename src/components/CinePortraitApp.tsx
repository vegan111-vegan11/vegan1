import React, { useState, useEffect, useRef } from "react";
import { 
  Camera, Upload, Film, FileSpreadsheet, Layers, Play, 
  Sparkles, MessageSquare, User, Clock, Heart, 
  Save, RotateCcw, ArrowRight, Eye, ChevronRight, BookOpen, AlertCircle
} from "lucide-react";
import { 
  generateCinemaCueSheet, 
  saveCueSheetToFirestore, 
  fetchCueSheets, 
  MovieCueSheetSetup 
} from "../services/aiCinemaService";
import CharacterCueSheetBlueprint from "./CharacterCueSheetBlueprint";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import leeSeolImg from "../assets/images/daily_webtoon_lee_seol_1777187440015.png";

interface CinePortraitAppProps {
  user: any;
  isSimulatedMobileView?: boolean;
}

export default function CinePortraitApp({ user, isSimulatedMobileView = false }: CinePortraitAppProps) {
  const [activeTab, setActiveTab] = useState<"create" | "gallery">("create");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  
  // Custom analysis results
  const [cuesheetResult, setCuesheetResult] = useState<Omit<MovieCueSheetSetup, "id" | "createdAt"> | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [galleryItems, setGalleryItems] = useState<MovieCueSheetSetup[]>([]);
  const [galleryLoading, setGalleryLoading] = useState(false);
  const [selectedGalleryItem, setSelectedGalleryItem] = useState<MovieCueSheetSetup | null>(null);

  // Drag of drop states
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadingMessages = [
    "초해상도 카메라 피드 분석 중... (Scanning face coordinates...)",
    "조명 설계 역추적 및 미장센 감지 중... (Reconstructing scene key lights...)",
    "캐릭터 페르소나 및 정밀 드라마 배경 조립 중... (Synthesizing protagonist profile...)",
    "5단계 시네마틱 앵글 및 연기 연출선 매핑 중... (Drafting Hollywood camerawork...)",
    "결정적 감정이 깃든 런타임 명대사 제안 중... (Writing high-impact script dialog...)",
    "프로덕션 큐시트 조율 완료! (Finalizing production blueprint...)"
  ];

  useEffect(() => {
    if (activeTab === "gallery") {
      loadGallery();
    }
  }, [activeTab]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isGenerating) {
      setLoadingStep(0);
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev < loadingMessages.length - 1 ? prev + 1 : prev));
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isGenerating]);

  const loadGallery = async () => {
    setGalleryLoading(true);
    try {
      const items = await fetchCueSheets();
      setGalleryItems(items);
    } catch (err) {
      toast.error("갤러리 목록을 불러오지 못했습니다.");
    } finally {
      setGalleryLoading(false);
    }
  };

  const handleFileChange = (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 지원됩니다.");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    setImagePreview(null);
    setCuesheetResult(null);
    setSavedId(null);
  };

  const handleSelectPresetPpoing = () => {
    setImagePreview(leeSeolImg);
    setSelectedFile({ name: "이솔공방_뿌잉_cuesheet_result.png" } as any);
    
    // Auto populate the result preset
    const presetResult: Omit<MovieCueSheetSetup, "id" | "createdAt"> = {
      imageUrl: leeSeolImg,
      movieInfo: {
        title: "뿌잉의 아카이브: 첫 번째 프레임",
        genre: "로맨틱 고딕 판타지",
        logline: "수줍음 많은 훌쩍이 뿌잉이가 세상 밖으로 던진 반항적이고 힙한 우정의 대담한 시그널."
      },
      characterAnalysis: {
        visualAnalysis: "이솔공방의 상징인 웨이브 헤어와 러블리 러프 카라, 실버 액세서리와 큐트 유령 장식이 어우러진 MZ 세대 특유의 힙 고딕 스타일.",
        characterProfile: {
          name: "뿌잉",
          personality: "밝고 긍정적이며, 호기심이 많아요. 가끔 혼자 멍때리거나 엉뚱한 상상을 하기를 즐깁니다.",
          background: "훌쩍이 성격을 이기려 사슬과 타투로 무장했지만 사실은 여린 마음의 천사."
        }
      },
      characterInfo: {
        name: "뿌잉",
        englishName: "PPOING",
        age: "20살",
        personality: "밝고 긍정적이며, 호기심이 많아요. 가끔 혼자 멍때리거나 엉뚱한 상상을 하기를 즐깁니다.",
        traits: "흔히 훌쩍이 에너지가 있어 수줍어하지만, 할 때는 하는 반전 성격의 소유자.",
        likes: ["네컷 사진 찍기", "카페 투어", "인스타 감성 소품", "귀여운 액세서리"],
        dislikes: ["갑자기 일어나는 일", "시끄럽고 붐비는 곳", "차가운 음료", "어두운 밤길"],
        slogan: "훌쩍이인데 힙하고 볼드한 타투하고 싶어!"
      },
      colorPalette: [
        { colorName: "헤어 블랙", hex: "#1D1B22" },
        { colorName: "딥 네이비", hex: "#1E2235" },
        { colorName: "퍼플", hex: "#BFACD6" },
        { colorName: "라벤더", hex: "#E9E3F3" },
        { colorName: "화이트", hex: "#FFFFFF" },
        { colorName: "화이트 하이라이트", hex: "#F3F1F7" },
        { colorName: "실버", hex: "#D4D4D8" },
        { colorName: "메탈 그레이", hex: "#71717A" },
        { colorName: "차콜", hex: "#2E2E33" },
        { colorName: "민트 그레이", hex: "#E4ECE9" },
        { colorName: "미스티 퍼플", hex: "#8A7E9F" },
        { colorName: "오로라 그레이", hex: "#E4E4E7" }
      ],
      details: [
        { title: "헤어 & 액세서리", description: "웨이브 미디움 헤어, 메탈 헤어핀" },
        { title: "귀걸이 & 체인", description: "서브컬처 실버 체인 귀걸이 장식" },
        { title: "유령 인형 장식", description: "상의에 포인트를 주는 큐트 유령 메달" },
        { title: "시스루 자켓", description: "은은한 오로라 광택이 도는 시스루 외투" },
        { title: "셔츠 & 서스펜더", description: "레이스로 러블리 지수를 올린 블랙 칼라" },
        { title: "레그 스트랩 & 스타킹", description: "언밸런스 레그 밴드로 시선 매그넷" },
        { title: "웨딩 & 링 가터", description: "벨벳 느낌의 디테일을 가미한 가터링" },
        { title: "신발 & 구두", description: "두꺼운 청키 통굽 형태의 볼드 슈즈" }
      ],
      expressions: [
        { emotionName: "뿌잉 (기본/보통)", desc: "두 입술을 다물고 살짝 볼을 부풀린 귀여운 기본 표정" },
        { emotionName: "장난 (윙크)", desc: "한쪽 눈을 깜빡이며 입술을 살짝 튼 깜찍한 느낌" },
        { emotionName: "놀람 (호기심)", desc: "입을 살짝 벌리고 눈을 동그랗게 뜬 표정" },
        { emotionName: "부끄러움", desc: "볼이 발그레해지며 머쓱해하는 수줍은 느낌" }
      ],
      lightingAndBgTips: [
        "렘브란트 조명: 얼굴 측면에서 조사를 넓혀 풍부한 입체감 강조",
        "키라이트 & 보조광: 핑크 + 따뜻한 보조광 활용",
        "배경 디테일: 포스터, 메모, 네온사인, 소품 배치",
        "명암 대비: 캐릭터는 밝게, 배경은 어둡게 연출",
        "감성 요소: 새벽녘, 비 오는 날, 노을, 네온조명"
      ],
      bestComboGuides: [
        "MZ 감성 캐릭터 디자인",
        "렘브란트 조명",
        "배경 연출 최적화"
      ],
      cueSheet: [
        {
          sceneNo: "Scene #1",
          shotNo: "Shot #1",
          shotType: "CU",
          cameraAngleAndMovement: "아이레벨, 고정, 극단적 밀착 화각 구성",
          lightingAndColor: "렘브란트 측면 조명, 바이올렛 그림자 대비",
          emotionAndActingGuide: "차가운 눈빛 속에 훌쩍이는 눈망울 묘사",
          shotMeaning: "외롭고 힙한 고독 캐릭터의 첫 등장을 극적인 덴시티로 압축 제시"
        },
        {
          sceneNo: "Scene #2",
          shotNo: "Shot #2",
          shotType: "MCU",
          cameraAngleAndMovement: "로우 앵글, 슬로우 달리인 (Slow Dolly In)",
          lightingAndColor: "핑크 네온 보조광, 화려한 스펙트럼 광택",
          emotionAndActingGuide: "자신의 실버 체인을 만지며 윙크 입꼬리를 올림",
          shotMeaning: "반항적이면서도 소년미 있는 이중적 캐릭터성 강조"
        },
        {
          sceneNo: "Scene #3",
          shotNo: "Shot #3",
          shotType: "OTS",
          cameraAngleAndMovement: "오버 더 숄더, 피사계 심도 야트막히 설정",
          lightingAndColor: "탑 라이트 키, 실내 새벽빛 투과 효과",
          emotionAndActingGuide: "상대방의 그림자를 놀란 눈으로 조용히 쳐다봄",
          shotMeaning: "사건의 미스테리한 국면 돌입과 공간의 고립무원 무드 형성"
        },
        {
          sceneNo: "Scene #4",
          shotNo: "Shot #4",
          shotType: "POV",
          cameraAngleAndMovement: "주인공 시점 샷, 핸드헬드 (Handheld) 미세 흔들림",
          lightingAndColor: "스포트라이트 직접 대비, 미스티 퍼플 톤",
          emotionAndActingGuide: "카메라 렌즈를 향해 수줍은 듯 입술을 깨무는 묘사",
          shotMeaning: "관객에게 직접 말을 건네는 듯 시선 공유로 극적 몰입도 확대"
        },
        {
          sceneNo: "Scene #5",
          shotNo: "Shot #5",
          shotType: "MS",
          cameraAngleAndMovement: "익스트림 롱 샷 ∙ 트래킹 달리 아웃",
          lightingAndColor: "화려한 오로라 백라이트, 새벽 안개 레이어",
          emotionAndActingGuide: "뒤돌아 서서 사뿐한 발걸음으로 어둠 너머 전진",
          shotMeaning: "자신만의 미경과 모토를 향해 홀로 헌신하는 긴 여운의 피날레"
        }
      ],
      bonusDialogue: "훌쩍이인데... 힙하고 대담한 하트 타투, 드디어 새겨 넣을 수 있게 된 거야?"
    };

    setCuesheetResult(presetResult);
    toast.success("📸 이솔공방 대표 프리셋 큐시트 인화 성공!");
  };

  const handleStartGeneration = async () => {
    if (!imagePreview) {
      toast.error("분석할 사진을 업로드해 주세요.");
      return;
    }

    setIsGenerating(true);
    setSavedId(null);

    // Bypassing AI generation if representative Lee Seol image is loaded
    if (imagePreview === leeSeolImg || (typeof imagePreview === "string" && imagePreview.includes("daily_webtoon_lee_seol"))) {
      setTimeout(() => {
        const presetResult: Omit<MovieCueSheetSetup, "id" | "createdAt"> = {
          imageUrl: leeSeolImg,
          movieInfo: {
            title: "뿌잉의 아카이브: 첫 번째 프레임",
            genre: "로맨틱 고딕 판타지",
            logline: "수줍음 많은 훌쩍이 뿌잉이가 세상 밖으로 던진 반항적이고 힙한 우정의 대담한 시그널."
          },
          characterAnalysis: {
            visualAnalysis: "이솔공방의 상징인 웨이브 헤어와 러블리 러프 카라, 실버 액세서리와 큐트 유령 장식이 어우러진 MZ 세대 특유의 힙 고딕 스타일.",
            characterProfile: {
              name: "뿌잉",
              personality: "밝고 긍정적이며, 호기심이 많아요. 가끔 혼자 멍때리거나 엉뚱한 상상을 하기를 즐깁니다.",
              background: "훌쩍이 성격을 이기려 사슬과 타투로 무장했지만 사실은 여린 마음의 천사."
            }
          },
          characterInfo: {
            name: "뿌잉",
            englishName: "PPOING",
            age: "20살",
            personality: "밝고 긍정적이며, 호기심이 많아요. 가끔 혼자 멍때리거나 엉뚱한 상상을 하기를 즐깁니다.",
            traits: "흔히 훌쩍이 에너지가 있어 수줍어하지만, 할 때는 하는 반전 성격의 소유자.",
            likes: ["네컷 사진 찍기", "카페 투어", "인스타 감성 소품", "귀여운 액세서리"],
            dislikes: ["갑자기 일어나는 일", "시끄럽고 붐비는 곳", "차가운 음료", "어두운 밤길"],
            slogan: "훌쩍이인데 힙하고 볼드한 타투하고 싶어!"
          },
          colorPalette: [
            { colorName: "헤어 블랙", hex: "#1D1B22" },
            { colorName: "딥 네이비", hex: "#1E2235" },
            { colorName: "퍼플", hex: "#BFACD6" },
            { colorName: "라벤더", hex: "#E9E3F3" },
            { colorName: "화이트", hex: "#FFFFFF" },
            { colorName: "화이트 하이라이트", hex: "#F3F1F7" },
            { colorName: "실버", hex: "#D4D4D8" },
            { colorName: "메탈 그레이", hex: "#71717A" },
            { colorName: "차콜", hex: "#2E2E33" },
            { colorName: "민트 그레이", hex: "#E4ECE9" },
            { colorName: "미스티 퍼플", hex: "#8A7E9F" },
            { colorName: "오로라 그레이", hex: "#E4E4E7" }
          ],
          details: [
            { title: "헤어 & 액세서리", description: "웨이브 미디움 헤어, 메탈 헤어핀" },
            { title: "귀걸이 & 체인", description: "서브컬처 실버 체인 귀걸이 장식" },
            { title: "유령 인형 장식", description: "상의에 포인트를 주는 큐트 유령 메달" },
            { title: "시스루 자켓", description: "은은한 오로라 광택이 도는 시스루 외투" },
            { title: "셔츠 & 서스펜더", description: "레이스로 러블리 지수를 올린 블랙 칼라" },
            { title: "레그 스트랩 & 스타킹", description: "언밸런스 레그 밴드로 시선 매그넷" },
            { title: "웨딩 & 링 가터", description: "벨벳 느낌의 디테일을 가미한 가터링" },
            { title: "신발 & 구두", description: "두꺼운 청키 통굽 형태의 볼드 슈즈" }
          ],
          expressions: [
            { emotionName: "뿌잉 (기본/보통)", desc: "두 입술을 다물고 살짝 볼을 부풀린 귀여운 기본 표정" },
            { emotionName: "장난 (윙크)", desc: "한쪽 눈을 깜빡이며 입술을 살짝 튼 깜찍한 느낌" },
            { emotionName: "놀람 (호기심)", desc: "입을 살짝 벌리고 눈을 동그랗게 뜬 표정" },
            { emotionName: "부끄러움", desc: "볼이 발그레해지며 머쓱해하는 수줍은 느낌" }
          ],
          lightingAndBgTips: [
            "렘브란트 조명: 얼굴 측면에서 조사를 넓혀 풍부한 입체감 강조",
            "키라이트 & 보조광: 핑크 + 따뜻한 보조광 활용",
            "배경 디테일: 포스터, 메모, 네온사인, 소품 배치",
            "명암 대비: 캐릭터는 밝게, 배경은 어둡게 연출",
            "감성 요소: 새벽녘, 비 오는 날, 노을, 네온조명"
          ],
          bestComboGuides: [
            "MZ 감성 캐릭터 디자인",
            "렘브란트 조명",
            "배경 연출 최적화"
          ],
          cueSheet: [
            {
              sceneNo: "Scene #1",
              shotNo: "Shot #1",
              shotType: "CU",
              cameraAngleAndMovement: "아이레벨, 고정, 극단적 밀착 화각 구성",
              lightingAndColor: "렘브란트 측면 조명, 바이올렛 그림자 대비",
              emotionAndActingGuide: "차가운 눈빛 속에 훌쩍이는 눈망울 묘사",
              shotMeaning: "외롭고 힙한 고독 캐릭터의 첫 등장을 극적인 덴시티로 압축 제시"
            },
            {
              sceneNo: "Scene #2",
              shotNo: "Shot #2",
              shotType: "MCU",
              cameraAngleAndMovement: "로우 앵글, 슬로우 달리인 (Slow Dolly In)",
              lightingAndColor: "핑크 네온 보조광, 화려한 스펙트럼 광택",
              emotionAndActingGuide: "자신의 실버 체인을 만지며 윙크 입꼬리를 올림",
              shotMeaning: "반항적이면서도 소년미 있는 이중적 캐릭터성 강조"
            },
            {
              sceneNo: "Scene #3",
              shotNo: "Shot #3",
              shotType: "OTS",
              cameraAngleAndMovement: "오버 더 숄더, 피사계 심도 야트막히 설정",
              lightingAndColor: "탑 라이트 키, 실내 새벽빛 투과 효과",
              emotionAndActingGuide: "상대방의 그림자를 놀란 눈으로 조용히 쳐다봄",
              shotMeaning: "사건의 미스테리한 국면 돌입과 공간의 고립무원 무드 형성"
            },
            {
              sceneNo: "Scene #4",
              shotNo: "Shot #4",
              shotType: "POV",
              cameraAngleAndMovement: "주인공 시점 샷, 핸드헬드 (Handheld) 미세 흔들림",
              lightingAndColor: "스포트라이트 직접 대비, 미스티 퍼플 톤",
              emotionAndActingGuide: "카메라 렌즈를 향해 수줍은 듯 입술을 깨무는 묘사",
              shotMeaning: "관객에게 직접 말을 건네는 듯 시선 공유로 극적 몰입도 확대"
            },
            {
              sceneNo: "Scene #5",
              shotNo: "Shot #5",
              shotType: "MS",
              cameraAngleAndMovement: "익스트림 롱 샷 ∙ 트래킹 달리 아웃",
              lightingAndColor: "화려한 오로라 백라이트, 새벽 안개 레이어",
              emotionAndActingGuide: "뒤돌아 서서 사뿐한 발걸음으로 어둠 너머 전진",
              shotMeaning: "자신만의 미경과 모토를 향해 홀로 헌신하는 긴 여운의 피날레"
            }
          ],
          bonusDialogue: "훌쩍이인데... 힙하고 대담한 하트 타투, 드디어 새겨 넣을 수 있게 된 거야?"
        };
        setCuesheetResult(presetResult);
        setIsGenerating(false);
        toast.success("AI 시네마 큐시트 연출안이 완성되었습니다!");
      }, 1500);
      return;
    }

    try {
      // Extract clean base64 data and mime type
      const parts = imagePreview.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/jpeg";
      const base64 = parts[1];

      const result = await generateCinemaCueSheet(base64, mime, additionalPrompt);
      
      // Inject preview image to the result
      result.imageUrl = imagePreview;

      setCuesheetResult(result);
      toast.success("AI 시네마 큐시트 연출안이 완성되었습니다!");
    } catch (err: any) {
      console.error(err);
      toast.error("큐시트 생성에 실패했습니다. API 키나 이미지를 확인해 주세요.");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveToFirestore = async () => {
    if (!cuesheetResult) return;
    try {
      const email = user?.email || "비회원";
      const uid = user?.uid || "anonymous";
      const newId = await saveCueSheetToFirestore(cuesheetResult, uid, email);
      setSavedId(newId);
      toast.success("이솔나라 시네마 아카이브 보관함에 영구 저장되었습니다!");
    } catch (err) {
      toast.error("연동 저장 실패: Firebase Firestore 설정을 확인하세요.");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-zinc-950 rounded-3xl border border-zinc-200/80 dark:border-zinc-900 shadow-xl overflow-hidden font-sans">
      {/* App Branding Top Rail Header */}
      <div className="bg-gradient-to-r from-red-655 to-rose-700 p-6 text-white relative">
        <div className="absolute right-6 top-6 opacity-10 pointer-events-none select-none">
          <Film className="w-24 h-24 rotate-12" />
        </div>
        <span className="bg-white/15 backdrop-blur-md text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-widest inline-block mb-3.5 border border-white/10">
          이솔공방 AI 컬쳐 융합 스튜디오
        </span>
        <h2 className="text-2xl md:text-3xl font-black tracking-tight leading-none mb-1">
          🎬 시네포트레이트 (CinePortrait)
        </h2>
        <p className="text-[12px] md:text-xs text-rose-100 font-bold max-w-2xl leading-relaxed">
          업로드된 인물 사진 1장의 표정과 조명 구도를 정밀 탐지하여, 해당 캐릭터가 주인공으로 연기하는 전문적인 '영화 촬영 현장 큐시트'와 시네마틱 연출 가이드를 인공지능으로 빌드하는 현장 시각화 도구입니다.
        </p>
      </div>

      {/* App Tab Switcher */}
      <div className="flex border-b border-zinc-150 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/40 select-none">
        <button
          onClick={() => {
            setActiveTab("create");
            setSelectedGalleryItem(null);
          }}
          className={`flex-1 py-4 text-xs md:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "create" && !selectedGalleryItem
              ? "border-red-600 text-red-655 dark:text-red-400 bg-white dark:bg-zinc-950 font-black"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>신규 큐시트 제작</span>
        </button>
        <button
          onClick={() => {
            setActiveTab("gallery");
            setSelectedGalleryItem(null);
          }}
          className={`flex-1 py-4 text-xs md:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "gallery" || selectedGalleryItem
              ? "border-red-600 text-red-655 dark:text-red-400 bg-white dark:bg-zinc-950 font-black"
              : "border-transparent text-zinc-500 hover:text-zinc-800"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>시네마 아카이브 갤러리</span>
        </button>
      </div>

      {/* Main Container */}
      <div className="p-6 md:p-8">
        
        {/* TAB 1: CREATE VIEW */}
        {activeTab === "create" && (
          <AnimatePresence mode="wait">
            {/* Step 1: Loading view */}
            {isGenerating && (
              <motion.div 
                key="loading"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[400px]"
              >
                <div className="relative w-20 h-20 mb-8 flex items-center justify-center">
                  <div className="absolute inset-0 rounded-full border-4 border-rose-100 dark:border-zinc-800" />
                  <div className="absolute inset-0 rounded-full border-4 border-rose-600 border-t-transparent animate-spin" />
                  <Film className="w-8 h-8 text-rose-600 animate-pulse" />
                </div>
                
                <h3 className="text-lg font-black text-zinc-800 dark:text-zinc-200 mb-2">
                  AI 영화 연출팀 감독 작동 중...
                </h3>
                
                <div className="h-6 overflow-hidden max-w-md mx-auto">
                  <motion.div
                    key={loadingStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-xs md:text-sm text-rose-600 dark:text-rose-400 font-extrabold"
                  >
                    {loadingMessages[loadingStep]}
                  </motion.div>
                </div>

                <div className="w-full max-w-sm bg-zinc-100 dark:bg-zinc-850 rounded-full h-1.5 mt-6 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-600 to-rose-500 h-full transition-all duration-1000"
                    style={{ width: `${((loadingStep + 1) / loadingMessages.length) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-zinc-400 dark:text-zinc-500 mt-3 uppercase tracking-wider font-bold">
                  Gemini-3.5 Multimodal Analysis Engine
                </p>
              </motion.div>
            )}

            {/* Step 2: Form input view */}
            {!isGenerating && !cuesheetResult && (
              <motion.div 
                key="input-form"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-6"
              >
                {/* File Dropdown Uploader */}
                <div 
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-8 md:p-12 text-center cursor-pointer transition-all ${
                    isDragging 
                      ? "border-red-500 bg-red-50/20 dark:bg-rose-950/10" 
                      : "border-zinc-200 dark:border-zinc-800 hover:border-red-500 hover:bg-zinc-50/40 dark:hover:bg-zinc-900/10"
                  }`}
                >
                  <input 
                    type="file"
                    ref={fileInputRef}
                    onChange={(e) => e.target.files?.[0] && handleFileChange(e.target.files[0])}
                    className="hidden"
                    accept="image/*"
                  />

                  {imagePreview ? (
                    <div className="space-y-4 max-w-xs mx-auto" onClick={(e) => e.stopPropagation()}>
                      <div className="aspect-[3/4] rounded-xl overflow-hidden border border-zinc-200 bg-zinc-100 shadow-md relative group">
                        <img 
                          src={imagePreview} 
                          alt="Character avatar preview" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={removeSelectedFile}
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-black cursor-pointer rounded-xl"
                        >
                          <RotateCcw className="w-5 h-5 mr-1" />
                          이미지 변경
                        </button>
                      </div>
                      <p className="text-xs text-zinc-500 font-extrabold">
                        {selectedFile?.name || "업로드된 인물 사진"}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="w-14 h-14 bg-red-100 dark:bg-rose-950/50 text-red-655 dark:text-rose-400 rounded-full flex items-center justify-center mx-auto shadow-sm">
                        <Camera className="w-7 h-7" />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-md font-black text-zinc-900 dark:text-zinc-200">
                          분석할 주인공 사진 업로드
                        </h4>
                        <p className="text-xs text-zinc-500 max-w-md mx-auto leading-relaxed">
                          컴퓨터 및 모바일 기기 속 인물 사진 한 장을 끌어다 놓거나 이곳을 터치하여 업로드해 주세요. 캐릭터의 미궁, 감성을 도출하기 최적화된 고화질 정면 사진을 권장합니다.
                        </p>
                      </div>
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-white rounded-full text-xs font-black transition-all shadow-sm">
                        <Upload className="w-3.5 h-3.5" />
                        기기 브라우저 열기
                      </span>
                    </div>
                  )}
                </div>

                {/* 이솔공방 대표 프리셋 퀵스타트 */}
                {!imagePreview && (
                  <div className="space-y-3.5 text-left bg-zinc-50 dark:bg-zinc-900/30 p-4 rounded-2xl border border-zinc-150 dark:border-zinc-850">
                    <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-300 uppercase tracking-wider block">
                      ✨ 이솔공방 프리퀄 대표 프리셋 (즉시 인화)
                    </span>
                    <div className="grid grid-cols-1 gap-3">
                      <button
                        type="button"
                        onClick={() => handleSelectPresetPpoing()}
                        className="border border-[#dfd6ea] hover:border-[#8b31a8] hover:bg-[#faf8fc] dark:border-zinc-800 dark:hover:bg-[#1a0f2b] rounded-2xl p-3 flex items-center gap-3 bg-white dark:bg-zinc-950 transition-all text-left shadow-xs cursor-pointer group"
                      >
                        <div className="w-12 h-16 rounded-xl overflow-hidden bg-zinc-950 shrink-0 relative border border-[#dfd6ea] dark:border-zinc-800">
                          <img 
                            src={leeSeolImg} 
                            className="absolute max-w-none" 
                            style={{ width: '465%', height: '167%', left: '-16.3%', top: '-13.3%' }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black text-zinc-900 dark:text-zinc-100">
                              뿌잉 (PPOING)
                            </span>
                            <span className="bg-rose-500 text-white text-[7.5px] font-black px-1.5 py-0.2 rounded font-sans uppercase">
                              이솔공방 공식 캐릭터
                            </span>
                          </div>
                          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold leading-normal mt-0.5 max-w-md truncate">
                            이솔공방의 시그니처 시네마 큐시트 연출본이 이미 연동되어 있어, 1초 만에 첨부 이미지 형상으로 완벽히 인화됩니다.
                          </p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}

                {/* Additional parameters input */}
                <div className="space-y-2 text-left">
                  <label className="text-xs font-black text-zinc-700 dark:text-zinc-300 uppercase tracking-wider block">
                    🎬 감독 요구 사항 및 연출 지침 (선택 사항)
                  </label>
                  <textarea
                    rows={2}
                    value={additionalPrompt}
                    onChange={(e) => setAdditionalPrompt(e.target.value)}
                    onKeyDown={(e) => e.stopPropagation()}
                    onKeyUp={(e) => e.stopPropagation()}
                    onKeyPress={(e) => e.stopPropagation()}
                    placeholder="예: '세기말 디스토피아 사이버펑크 분위기를 짙게 풍겨줘', '전쟁 속 희망을 찾아 떠나는 슬픈 멜로드라마 배경으로 설정해줘' 등 특별 연출 방향성이 있는 경우 입력하세요."
                    className="w-full text-xs p-3.5 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 rounded-xl focus:border-red-500 outline-none transition-colors placeholder-zinc-400 dark:text-zinc-200"
                  />
                </div>

                {/* Submit button */}
                <button
                  onClick={handleStartGeneration}
                  disabled={!imagePreview}
                  className={`w-full py-4 rounded-xl text-sm font-black flex items-center justify-center gap-2 shadow-lg transition-all ${
                    imagePreview 
                      ? "bg-red-655 hover:bg-red-700 text-white cursor-pointer hover:-translate-y-0.5 active:translate-y-0" 
                      : "bg-zinc-100 dark:bg-zinc-900 text-zinc-400 cursor-not-allowed border border-zinc-200/50 dark:border-zinc-800"
                  }`}
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>시네포트레이트 AI 영화 큐시트 연출 제작 개시</span>
                </button>
              </motion.div>
            )}

            {/* Step 3: Cuesheet display result */}
            {!isGenerating && cuesheetResult && (
              <motion.div 
                key="result-cue"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-8 text-left"
              >
                {/* Result Control Toolbar */}
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-150 dark:border-zinc-850 pb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-zinc-500 font-extrabold">인공지능 프로덕션 설계 완료</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={removeSelectedFile}
                      className="px-3.5 py-2 hover:bg-zinc-150 dark:hover:bg-zinc-900 bg-zinc-100 dark:bg-zinc-850 rounded-lg text-xs font-black text-zinc-700 dark:text-zinc-300 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      새 포트레이트 로드
                    </button>
                    {!savedId ? (
                      <button
                        onClick={handleSaveToFirestore}
                        className="px-4 py-2 bg-red-655 hover:bg-red-700 text-white rounded-lg text-xs font-black shadow-md transition-all hover:-translate-y-0.5 flex items-center gap-1.5 cursor-pointer"
                      >
                        <Save className="w-3.5 h-3.5" />
                        시네마 아카이브에 영구 저장
                      </button>
                    ) : (
                      <span className="px-4 py-2 bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-lg text-xs font-black flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                        아카이브 클라우드 저장 완료
                      </span>
                    )}
                  </div>
                </div>

                {/* Dynamic Highly-Detailed Character CueSheet Blueprint Layout */}
                <CharacterCueSheetBlueprint data={cuesheetResult} />
              </motion.div>
            )}
          </AnimatePresence>
        )}

        {/* TAB 2: GALLERY VIEW */}
        {activeTab === "gallery" && (
          <div className="space-y-6">
            <AnimatePresence mode="wait">
              {galleryLoading && (
                <motion.div 
                  key="gallery-loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center justify-center py-24 text-center"
                >
                  <div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin mb-4" />
                  <p className="text-xs text-zinc-400 font-extrabold uppercase tracking-widest">
                    이솔나라 시네마 아카이브 로딩 중...
                  </p>
                </motion.div>
              )}

              {!galleryLoading && !selectedGalleryItem && (
                <motion.div 
                  key="gallery-list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-4"
                >
                  {galleryItems.length === 0 ? (
                    <div className="text-center py-16 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
                      <Film className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
                      <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-250 mb-1">
                        등록된 큐시트 기획안이 비어 있습니다
                      </h4>
                      <p className="text-xs text-zinc-500 max-w-sm mx-auto leading-relaxed mb-4">
                        상단의 '신규 큐시트 제작' 탭에서 나만의 독보적인 감성 이미지를 업로드해 시네포트레이트 연출본을 빌드하고 보관해 보세요!
                      </p>
                    </div>
                  ) : (
                    <div className={`grid ${isSimulatedMobileView ? "grid-cols-1" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"} gap-6`}>
                      {galleryItems.map((item) => (
                        <div 
                          key={item.id}
                          onClick={() => setSelectedGalleryItem(item)}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/85 rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden flex flex-col hover:-translate-y-1 align-stretch"
                        >
                          <div className="aspect-[4/3] bg-black bg-center relative overflow-hidden">
                            <img 
                              src={item.imageUrl} 
                              className="w-full h-full object-cover transition-transform duration-500 hover:scale-103" 
                              alt={item.movieInfo.title} 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-4 text-left">
                              <span className="text-[9px] bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider mb-1 px-2.5 inline-block w-fit">
                                {item.movieInfo.genre}
                              </span>
                              <h5 className="text-white text-md font-black tracking-tight leading-snug font-serif">
                                {item.movieInfo.title}
                              </h5>
                            </div>
                          </div>
                          
                          <div className="p-4 space-y-3 flex flex-col justify-between flex-1 text-left">
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed font-semibold">
                              {item.characterAnalysis.characterProfile.name} : "{item.movieInfo.logline}"
                            </p>
                            
                            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-zinc-800 text-[9.5px] text-zinc-400 font-extrabold tracking-wider uppercase">
                              <span className="flex items-center gap-1">
                                <User className="w-3.5 h-3.5 text-zinc-400" />
                                {item.userEmail ? item.userEmail.split("@")[0] : "anonymous"} 감독
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3.5 h-3.5" />
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Detail viewing from Gallery card */}
              {selectedGalleryItem && (
                <motion.div
                  key="gallery-detail"
                  initial={{ opacity: 0, scale: 0.99 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6 text-left"
                >
                  <button
                    onClick={() => setSelectedGalleryItem(null)}
                    className="inline-flex items-center gap-1 px-3.5 py-1.8 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-900 hover:dark:bg-zinc-800 rounded-lg text-xs font-black text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    ← 갤러리 목록으로 돌아가기
                  </button>

                  <CharacterCueSheetBlueprint data={selectedGalleryItem} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </div>
  );
}
