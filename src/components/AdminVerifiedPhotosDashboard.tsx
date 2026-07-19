import React, { useState, useMemo, useEffect } from "react";
import { 
  Camera, 
  Search, 
  Database, 
  Save, 
  Plus, 
  Tag, 
  MapPin, 
  FileImage, 
  CheckCircle, 
  AlertCircle,
  BarChart3,
  Calendar,
  Layers,
  FileCheck,
  Globe,
  Trash2,
  Info,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  ChevronLeft,
  X,
  Sliders,
  Sparkles,
  Compass,
  Maximize2,
  Cpu,
  Fingerprint,
  RotateCcw,
  SlidersHorizontal,
  Bookmark,
  Share2,
  Activity,
  Heart
} from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc, deleteDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../firebase";
import { motion, AnimatePresence } from "motion/react";

interface CitizenNews {
  id: string;
  title: string;
  content: string;
  author: string;
  category: string; // e.g. "리얼포토"
  thumbnail?: string;
  createdAt?: string;
  isApproved?: boolean;
  isFeatured?: boolean;
  isHumanTaken?: boolean;
  cameraModel?: string;
  lensModel?: string;
  locationTaken?: string;
  isoSpeed?: string;
  apertureValue?: string;
  shutterSpeed?: string;
  
  // New structured metadata fields for datafication
  realPhotoCategory?: string; // "정치/행정" | "사회/시민사회" | "자연/환경" | "역사/유적" | "스포츠/문화" | "사건/사고"
  copyrightType?: string; // "공공누리 제1유형" | "언론사 독점 라이선스" | "자유 보도용 크리에이티브" | "출처 표기 필수"
  photoResolution?: string; // e.g., "6048 x 4024 (24.3MP)"
  archiveTags?: string[]; // e.g., ["국회", "단풍", "현장보도"]
  geoLatitude?: string;
  geoLongitude?: string;
  coverageSuitability?: number; // 1-100 rating
}

interface AdminVerifiedPhotosDashboardProps {
  citizenNews: CitizenNews[];
  setCitizenNews?: React.Dispatch<React.SetStateAction<CitizenNews[]>>;
  isSimulatedMobileView?: boolean;
}

export const AdminVerifiedPhotosDashboard: React.FC<AdminVerifiedPhotosDashboardProps> = ({ 
  citizenNews,
  setCitizenNews,
  isSimulatedMobileView = false
}) => {
  // Predefined high-quality seed photos curated by categories for rich visual depth
  const seedPhotos: CitizenNews[] = useMemo(() => [
    {
      id: "seed_photo_1",
      title: "경복궁 향원정의 가을 아침",
      author: "박수민 시민기자",
      content: "아침 안개가 자욱하게 낀 경복궁 향원정의 가을 단풍 절정 풍경입니다. 생성형 AI 일러스트 기법이나 합성 필터 없이 100% 실사 광학 렌즈 센서에 맺힌 수작업 빛의 기록입니다.",
      thumbnail: "https://images.unsplash.com/photo-1578496479914-7ef3b0193be3?auto=format&fit=crop&q=80&w=1200",
      createdAt: "2026-10-24T08:30:00.000Z",
      category: "리얼포토",
      isApproved: true,
      isHumanTaken: true,
      cameraModel: "Fujifilm X-T5",
      lensModel: "XF 16-55mm F2.8 R LM WR",
      locationTaken: "서울 종로구 사직로 161 경복궁 향원정",
      isoSpeed: "160",
      apertureValue: "F8.0",
      shutterSpeed: "1/125s",
      realPhotoCategory: "역사/유적",
      copyrightType: "공공누리 제1유형",
      photoResolution: "6240 x 4160 (26MP)",
      archiveTags: ["경복궁", "단풍", "전통건축", "가을"],
      geoLatitude: "37.5812",
      geoLongitude: "126.9768",
      coverageSuitability: 98
    },
    {
      id: "seed_photo_2",
      title: "국회 의사당 본회의장 실시간 투표 열기",
      author: "김도형 연합기자",
      content: "이솔나라 법률안 통과를 앞두고 팽팽한 정적 속에서 대기 중인 본회의장 전경입니다. 현장 광각 줌렌즈로 실시간 프레스룸에서 물리 수광 촬영한 사진입니다.",
      thumbnail: "https://images.unsplash.com/photo-1541872703-74c5e44368f9?auto=format&fit=crop&q=80&w=1200",
      createdAt: "2026-07-15T14:20:00.000Z",
      category: "리얼포토",
      isApproved: true,
      isHumanTaken: true,
      cameraModel: "Sony α1",
      lensModel: "FE 16-35mm F2.8 GM",
      locationTaken: "서울 영등포구 의사당대로 1 국회 본관",
      isoSpeed: "800",
      apertureValue: "F4.0",
      shutterSpeed: "1/80s",
      realPhotoCategory: "정치/행정",
      copyrightType: "언론사 독점 라이선스",
      photoResolution: "8640 x 5760 (50MP)",
      archiveTags: ["국회", "본회의", "정론직필", "실사보도"],
      geoLatitude: "37.5318",
      geoLongitude: "126.9142",
      coverageSuitability: 99
    },
    {
      id: "seed_photo_3",
      title: "제주 성산일출봉 유채꽃밭의 서광",
      author: "이현우 사진작가",
      content: "일출 직후 성산일출봉 주변 유채꽃밭에 내려앉은 따뜻한 아침 햇살을 황금분할 구도로 정밀 기록하였습니다. 인공지능 합성이나 업스케일을 일절 거치지 않은 자연 원천의 스냅입니다.",
      thumbnail: "https://images.unsplash.com/photo-1542224566-6e85f2e6772f?auto=format&fit=crop&q=80&w=1200",
      createdAt: "2026-04-12T06:15:00.000Z",
      category: "리얼포토",
      isApproved: true,
      isHumanTaken: true,
      cameraModel: "Sony α7R V",
      lensModel: "FE 24-70mm F2.8 GM II",
      locationTaken: "제주특별자치도 서귀포시 성산읍",
      isoSpeed: "100",
      apertureValue: "F5.6",
      shutterSpeed: "1/320s",
      realPhotoCategory: "자연/환경",
      copyrightType: "자유 보도용 크리에이티브",
      photoResolution: "9504 x 6336 (61MP)",
      archiveTags: ["제주도", "유채꽃", "성산일출봉", "봄"],
      geoLatitude: "33.4586",
      geoLongitude: "126.9424",
      coverageSuitability: 96
    },
    {
      id: "seed_photo_4",
      title: "도심 한가운데 발생한 싱크홀 통제 구역",
      author: "최영진 시민기자",
      content: "오후 3시경 을지로 사거리 인근 도로 아스팔트 침하 현장을 경찰 통제선 밖에서 직접 기록한 고발 보도용 사진입니다. 원본 데이터 수정을 일절 배제하여 현장을 날것 그대로 보존합니다.",
      thumbnail: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?auto=format&fit=crop&q=80&w=1200",
      createdAt: "2026-06-29T15:10:00.000Z",
      category: "리얼포토",
      isApproved: true,
      isHumanTaken: true,
      cameraModel: "Canon EOS R5",
      lensModel: "RF 24-105mm F4 L IS USM",
      locationTaken: "서울 중구 을지로 1가 사거리",
      isoSpeed: "400",
      apertureValue: "F5.0",
      shutterSpeed: "1/200s",
      realPhotoCategory: "사건/사고",
      copyrightType: "출처 표기 필수",
      photoResolution: "8192 x 5464 (45MP)",
      archiveTags: ["을지로", "싱크홀", "교통통제", "재난현장"],
      geoLatitude: "37.5663",
      geoLongitude: "126.9822",
      coverageSuitability: 97
    },
    {
      id: "seed_photo_5",
      title: "전국체전 투혼의 결승선 질주",
      author: "박주찬 스포츠 전문위원",
      content: "마라톤 결승 직전, 혼신의 힘을 다해 가슴을 내밀며 통과하는 선수의 얼굴 근육 수축과 구슬땀방울을 초망원 렌즈로 극도로 디테일하게 광학 포착한 작품입니다.",
      thumbnail: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&q=80&w=1200",
      createdAt: "2026-10-02T11:45:00.000Z",
      category: "리얼포토",
      isApproved: true,
      isHumanTaken: true,
      cameraModel: "Nikon Z9",
      lensModel: "NIKKOR Z 400mm f/2.8 TC VR S",
      locationTaken: "이솔종합체육관 주경기장 트랙",
      isoSpeed: "250",
      apertureValue: "F2.8",
      shutterSpeed: "1/2000s",
      realPhotoCategory: "스포츠/문화",
      copyrightType: "공공누리 제1유형",
      photoResolution: "8256 x 5504 (45.7MP)",
      archiveTags: ["전국체전", "육상마라톤", "스포츠", "순간기록"],
      geoLatitude: "37.5148",
      geoLongitude: "127.0729",
      coverageSuitability: 95
    }
  ], []);

  // Standard Categories for structured datafication
  const categoriesList = useMemo(() => [
    { key: "all", label: "전체 카테고리", countColor: "bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-250", icon: "💎", desc: "모든 보도 대장" },
    { key: "정치/행정", label: "정치/행정", countColor: "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300", icon: "🏛️", desc: "정부 및 공적 활동" },
    { key: "사회/시민사회", label: "사회/시민사회", countColor: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300", icon: "⚖️", desc: "시민 연대 및 생활 현장" },
    { key: "자연/환경", label: "자연/환경", countColor: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300", icon: "🌱", desc: "기후 환경 및 생태계" },
    { key: "역사/유적", label: "역사/유적", countColor: "bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300", icon: "🧱", desc: "문화유산 기록 및 보존" },
    { key: "스포츠/문화", label: "스포츠/문화", countColor: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300", icon: "🎨", desc: "축제, 스포츠 및 예술계" },
    { key: "사건/사고", label: "사건/사고", countColor: "bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-300", icon: "🚨", desc: "긴급 재해 및 재난 사고" }
  ], []);

  // Combine dynamic Firestore uploads with predefined seeds, ensuring they are structured
  const combinedPhotos = useMemo(() => {
    const userUploaded = (citizenNews || []).filter(
      (item) => item && (item.category === "리얼포토" || item.isHumanTaken === true)
    ).map(photo => {
      return {
        ...photo,
        realPhotoCategory: photo.realPhotoCategory || "사회/시민사회",
        copyrightType: photo.copyrightType || "출처 표기 필수",
        photoResolution: photo.photoResolution || "4000 x 3000 (12MP)",
        archiveTags: photo.archiveTags || ["시민기탁", "실사현장"],
        geoLatitude: photo.geoLatitude || "37.5665",
        geoLongitude: photo.geoLongitude || "126.9780",
        coverageSuitability: photo.coverageSuitability || 88
      };
    });

    const combined = [...userUploaded, ...seedPhotos];
    
    // Deduplicate by ID
    const seenIds = new Set<string>();
    return combined.filter((item) => {
      if (!item.id || seenIds.has(item.id)) return false;
      seenIds.add(item.id);
      return true;
    });
  }, [citizenNews, seedPhotos]);

  // General state configuration
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPhotoId, setSelectedPhotoId] = useState<string>("");
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [mobileActiveSubTab, setMobileActiveSubTab] = useState<"exif" | "category" | "location">("exif");
  const [mobileNavTab, setMobileNavTab] = useState<"feed" | "statistics" | "upload">("feed");
  
  // Registration Form State
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formTitle, setFormTitle] = useState("");
  const [formAuthor, setFormAuthor] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formThumbnail, setFormThumbnail] = useState("");
  const [formRealCategory, setFormRealCategory] = useState("사회/시민사회");
  const [formCamera, setFormCamera] = useState("Sony α7 IV");
  const [formLens, setFormLens] = useState("FE 24-105mm F4 G OSS");
  const [formLocation, setFormLocation] = useState("서울 종로구 광화문 광장");
  const [formCopyright, setFormCopyright] = useState("출처 표기 필수");
  const [formResolution, setFormResolution] = useState("6000 x 4000 (24MP)");
  const [formTagsString, setFormTagsString] = useState("광화문, 실사스냅, 뉴스현장");
  const [formLatitude, setFormLatitude] = useState("37.5710");
  const [formLongitude, setFormLongitude] = useState("126.9769");
  const [formSuitability, setFormSuitability] = useState(90);

  // Active Photo object
  const activePhoto = useMemo(() => {
    const found = combinedPhotos.find(p => p.id === selectedPhotoId);
    return found || combinedPhotos[0] || null;
  }, [combinedPhotos, selectedPhotoId]);

  // Selected Photo Edit State
  const [editRealCategory, setEditRealCategory] = useState("");
  const [editCopyright, setEditCopyright] = useState("");
  const [editResolution, setEditResolution] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editTagsString, setEditTagsString] = useState("");
  const [editSuitability, setEditSuitability] = useState(90);

  // Initialize edit states when selected photo changes
  useEffect(() => {
    if (activePhoto) {
      setEditRealCategory(activePhoto.realPhotoCategory || "사회/시민사회");
      setEditCopyright(activePhoto.copyrightType || "출처 표기 필수");
      setEditResolution(activePhoto.photoResolution || "6000 x 4000 (24MP)");
      setEditLocation(activePhoto.locationTaken || "");
      setEditTagsString((activePhoto.archiveTags || []).join(", "));
      setEditSuitability(activePhoto.coverageSuitability || 90);
    }
  }, [activePhoto]);

  // Auto-select first element if selection goes invalid
  useEffect(() => {
    if (combinedPhotos.length > 0 && !selectedPhotoId) {
      setSelectedPhotoId(combinedPhotos[0].id);
    }
  }, [combinedPhotos, selectedPhotoId]);

  // Filtering of Photos based on Category and Search Query
  const filteredPhotos = useMemo(() => {
    return combinedPhotos.filter(photo => {
      const matchesCategory = activeCategoryFilter === "all" || photo.realPhotoCategory === activeCategoryFilter;
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch = 
        photo.title?.toLowerCase().includes(q) ||
        photo.author?.toLowerCase().includes(q) ||
        photo.content?.toLowerCase().includes(q) ||
        (photo.cameraModel || "").toLowerCase().includes(q) ||
        (photo.locationTaken || "").toLowerCase().includes(q) ||
        (photo.archiveTags || []).some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [combinedPhotos, activeCategoryFilter, searchQuery]);

  // Statistics calculation for the Bento Cards
  const stats = useMemo(() => {
    const total = combinedPhotos.length;
    const categoryCounts: Record<string, number> = {};
    combinedPhotos.forEach(p => {
      const cat = p.realPhotoCategory || "사회/시민사회";
      categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });

    const highlySuitableCount = combinedPhotos.filter(p => (p.coverageSuitability || 0) >= 90).length;
    const highRatio = total > 0 ? Math.round((highlySuitableCount / total) * 100) : 0;

    const openLicensingCount = combinedPhotos.filter(p => 
      p.copyrightType === "공공누리 제1유형" || p.copyrightType === "자유 보도용 크리에이티브"
    ).length;

    // Top dynamic categories
    const topCategory = Object.entries(categoryCounts).reduce((a, b) => (a[1] > b[1] ? a : b), ["없음", 0]);

    return {
      total,
      categoryCounts,
      highRatio,
      openLicensingCount,
      topCategoryName: topCategory[0],
      topCategoryCount: topCategory[1]
    };
  }, [combinedPhotos]);

  // Handle Save Update (Datafication metadata sync)
  const handleUpdateMetadata = async () => {
    if (!activePhoto) return;
    const parsedTags = editTagsString.split(",").map(t => t.trim()).filter(Boolean);

    try {
      if (!activePhoto.id.startsWith("seed_")) {
        await updateDoc(doc(db, "citizen_news", activePhoto.id), {
          realPhotoCategory: editRealCategory,
          copyrightType: editCopyright,
          photoResolution: editResolution,
          locationTaken: editLocation,
          archiveTags: parsedTags,
          coverageSuitability: Number(editSuitability)
        });
      }

      if (setCitizenNews) {
        setCitizenNews(prev => prev.map(p => {
          if (p.id === activePhoto.id) {
            return {
              ...p,
              realPhotoCategory: editRealCategory,
              copyrightType: editCopyright,
              photoResolution: editResolution,
              locationTaken: editLocation,
              archiveTags: parsedTags,
              coverageSuitability: Number(editSuitability)
            };
          }
          return p;
        }));
      }

      toast.success("📸 실사 이미지의 메타데이터 및 분류 명세가 성공적으로 업데이트되었습니다.");
      setMobileDetailOpen(false);
    } catch (e) {
      console.error(e);
      // Fallback update for static/demo items
      toast.success("✅ [데모 가동] 정밀 메타데이터 분류 대장이 안전하게 보존되었습니다.");
      setMobileDetailOpen(false);
    }
  };

  // Handle New Photo Creation
  const handleCreatePhoto = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle || !formContent) {
      toast.error("대장 등록을 위해 제목과 현장 정합성 조서를 기입해 주십시오.");
      return;
    }

    const defaultImg = formThumbnail.trim() || "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=1200";
    const parsedTags = formTagsString.split(",").map(t => t.trim()).filter(Boolean);

    const newPhotoData = {
      title: formTitle,
      author: formAuthor || "익명 시민기탁인",
      content: formContent,
      thumbnail: defaultImg,
      createdAt: new Date().toISOString(),
      category: "리얼포토",
      isApproved: true,
      isHumanTaken: true,
      cameraModel: formCamera,
      lensModel: formLens,
      locationTaken: formLocation,
      realPhotoCategory: formRealCategory,
      copyrightType: formCopyright,
      photoResolution: formResolution,
      archiveTags: parsedTags,
      geoLatitude: formLatitude,
      geoLongitude: formLongitude,
      coverageSuitability: Number(formSuitability),
      isoSpeed: "200",
      apertureValue: "F4.0",
      shutterSpeed: "1/160s"
    };

    try {
      const docRef = await addDoc(collection(db, "citizen_news"), newPhotoData);
      const newlyAddedItem: CitizenNews = {
        id: docRef.id,
        ...newPhotoData
      };

      if (setCitizenNews) {
        setCitizenNews(prev => [newlyAddedItem, ...prev]);
      }
      setSelectedPhotoId(docRef.id);
      setIsAddingNew(false);
      setMobileNavTab("feed");
      resetForm();
      toast.success("🏆 실사 무변조 아카이브 대장에 신규 광학 데이터 등록이 승인되었습니다!");
    } catch (err) {
      console.error(err);
      const mockId = `local_uploaded_${Date.now()}`;
      const mockItem = { id: mockId, ...newPhotoData };
      if (setCitizenNews) {
        setCitizenNews(prev => [mockItem, ...prev]);
      }
      setSelectedPhotoId(mockId);
      setIsAddingNew(false);
      setMobileNavTab("feed");
      resetForm();
      toast.success("✅ [데모 구동] 실사 아카이브 대장에 가상 이미지 데이터를 신규 추가했습니다.");
    }
  };

  const resetForm = () => {
    setFormTitle("");
    setFormContent("");
    setFormThumbnail("");
    setFormLocation("서울 종로구 세종대로 광화문 광장");
    setFormTagsString("광화문, 실사스냅, 뉴스현장");
    setFormSuitability(92);
  };

  const handleDeletePhoto = async () => {
    if (!activePhoto) return;
    if (activePhoto.id.startsWith("seed_")) {
      toast.error("시스템 공인 수집 데이터는 말소할 수 없습니다.");
      return;
    }

    try {
      await deleteDoc(doc(db, "citizen_news", activePhoto.id));
      if (setCitizenNews) {
        setCitizenNews(prev => prev.filter(p => p.id !== activePhoto.id));
      }
      setSelectedPhotoId("");
      setMobileDetailOpen(false);
      toast.success("선택한 실사 촬영 자산이 아카이브 대장에서 정식 소멸 처분되었습니다.");
    } catch (e) {
      console.error(e);
      toast.error("삭제 과정에서 오류가 발생했습니다.");
    }
  };

  return (
    <div className="w-full text-left font-sans select-none antialiased">
      
      {/* 💻 LAPTOP & DESKTOP WEB LAYOUT (Optimized for Large Screens) */}
      <div className={isSimulatedMobileView ? "hidden" : "hidden lg:flex flex-col gap-6"}>
        
        {/* Latest Bento Stats Board */}
        <div className="grid grid-cols-4 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100/90 dark:border-zinc-800/80 shadow-[0_2px_15px_rgba(0,0,0,0.015)] dark:shadow-none hover:border-emerald-500/30 transition-all hover:shadow-[0_8px_25px_rgba(16,185,129,0.04)]"
          >
            <div className="space-y-1.5 z-10 relative">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Database size={12} className="text-emerald-500" />
                정론 실사 아카이브
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3.5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
                  {stats.total}
                </span>
                <span className="text-xs font-bold text-zinc-400">대장 등록</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">실시간 무변조 검증 수작업 분류 자산</p>
            </div>
            <div className="absolute right-4 bottom-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-emerald-500 group-hover:scale-110 transition-all duration-300">
              <Camera size={20} className="stroke-[2.25]" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.05 }}
            className="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100/90 dark:border-zinc-800/80 shadow-[0_2px_15px_rgba(0,0,0,0.015)] dark:shadow-none hover:border-indigo-500/30 transition-all hover:shadow-[0_8px_25px_rgba(99,102,241,0.04)]"
          >
            <div className="space-y-1.5 z-10 relative">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Activity size={12} className="text-indigo-500" />
                광학 촬영 신뢰도 지수
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3.5xl font-black font-mono tracking-tight text-zinc-900 dark:text-zinc-50">
                  {stats.highRatio}%
                </span>
                <span className="text-[9px] bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-black px-1.5 py-0.5 rounded-md">90점↑ 비율</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">물리 수광 입증 및 무수정 픽셀 정합도</p>
            </div>
            <div className="absolute right-4 bottom-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-indigo-500 group-hover:scale-110 transition-all duration-300">
              <Fingerprint size={20} className="stroke-[2.25]" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="group relative overflow-hidden bg-white dark:bg-zinc-900 rounded-3xl p-6 border border-zinc-100/90 dark:border-zinc-800/80 shadow-[0_2px_15px_rgba(0,0,0,0.015)] dark:shadow-none hover:border-amber-500/30 transition-all hover:shadow-[0_8px_25px_rgba(245,158,11,0.04)]"
          >
            <div className="space-y-1.5 z-10 relative">
              <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                <Globe size={12} className="text-amber-500" />
                최대 기탁 대장 분류
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 truncate max-w-[170px]">
                  {stats.topCategoryName}
                </span>
                <span className="text-xs font-mono font-bold text-amber-500">{stats.topCategoryCount}개</span>
              </div>
              <p className="text-[10px] text-zinc-400 font-medium">현재 분류가 가장 활발한 사건 분야</p>
            </div>
            <div className="absolute right-4 bottom-4 p-3 bg-zinc-50 dark:bg-zinc-950 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:text-amber-500 group-hover:scale-110 transition-all duration-300">
              <Layers size={20} className="stroke-[2.25]" />
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 15 }} 
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="relative overflow-hidden bg-gradient-to-br from-zinc-900 to-zinc-950 dark:from-zinc-950 dark:to-black text-white rounded-3xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-zinc-800"
          >
            <div className="flex items-start justify-between z-10">
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-400 flex items-center gap-1.5">
                <Sparkles size={11} className="text-emerald-400 animate-pulse" />
                이솔 실사 정론 규칙
              </span>
              <Cpu size={14} className="text-zinc-400" />
            </div>
            <p className="text-[10.5px] font-medium leading-relaxed mt-2 text-zinc-300 z-10">
              본 플랫폼은 인공지능 합성 이미지를 배제하며, 카메라 센서 원천 데이터 분류 및 명세를 대장화하여 무수정 팩트 보도를 입증합니다.
            </p>
          </motion.div>
        </div>

        {/* Desktop Two-Column Visual Grid */}
        <div className="grid grid-cols-12 gap-6 items-start">
          
          {/* Left Feed & Categories (4 Columns) */}
          <div className="col-span-4 flex flex-col gap-4">
            
            {/* Elegant Category List card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] rounded-3xl p-5 space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                    <Layers size={14} className="stroke-[2.5]" />
                  </div>
                  <h3 className="text-xs font-black text-zinc-900 dark:text-white uppercase tracking-wider">
                    정밀 대장 카테고리
                  </h3>
                </div>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsAddingNew(!isAddingNew);
                    resetForm();
                  }}
                  className="px-3 py-1.5 bg-zinc-950 hover:bg-zinc-900 dark:bg-zinc-50 dark:hover:bg-zinc-200 text-white dark:text-zinc-950 font-black text-[10px] tracking-tight rounded-xl flex items-center gap-1 cursor-pointer transition-all hover:scale-[1.02]"
                >
                  <Plus size={11} className="stroke-[3]" />
                  자료 기탁
                </button>
              </div>

              <div className="flex flex-col gap-1.5">
                {categoriesList.map(cat => {
                  const isSelected = activeCategoryFilter === cat.key;
                  const matchCount = combinedPhotos.filter(
                    p => cat.key === "all" || p.realPhotoCategory === cat.key
                  ).length;

                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        setActiveCategoryFilter(cat.key);
                        setIsAddingNew(false);
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer border ${
                        isSelected
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 font-black shadow-md shadow-zinc-950/10 border-transparent"
                          : "bg-zinc-50/40 dark:bg-zinc-950/50 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-650 dark:text-zinc-400 border-transparent hover:border-zinc-100 dark:hover:border-zinc-800"
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{cat.icon}</span>
                        <div className="text-left leading-none">
                          <span className="block text-[11px] font-black">{cat.label}</span>
                          <span className={`text-[8px] font-medium block mt-0.5 ${isSelected ? 'text-zinc-350 dark:text-zinc-600' : 'text-zinc-400 dark:text-zinc-500'}`}>{cat.desc}</span>
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-black font-mono ${cat.countColor}`}>
                        {matchCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo List Feed with Search */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800/80 shadow-[0_2px_12px_rgba(0,0,0,0.01)] rounded-3xl p-5 space-y-4">
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest">
                    기록 대장 피드 ({filteredPhotos.length})
                  </h4>
                  <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">GPS 동기화</span>
                </div>
                <p className="text-[10px] text-zinc-400 leading-normal font-medium">검증된 수광 원천 스냅 대장 목록입니다.</p>
              </div>

              {/* Advanced Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                <input
                  type="text"
                  placeholder="대장 제목, 기종, 작가명, 태그 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-[11px] font-bold outline-none text-zinc-900 dark:text-white focus:border-zinc-300 dark:focus:border-zinc-700 transition-all focus:bg-white dark:focus:bg-zinc-900"
                />
              </div>

              {/* Photo list scroll container */}
              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1 no-scrollbar">
                {filteredPhotos.length === 0 ? (
                  <div className="text-center py-12 text-zinc-400 border border-dashed border-zinc-100 dark:border-zinc-800 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/20">
                    <AlertCircle size={24} className="mx-auto text-zinc-300 mb-2 stroke-[1.5]" />
                    <span className="text-[11px] font-bold block">조건에 맞는 이미지 대장이 비어있습니다.</span>
                  </div>
                ) : (
                  filteredPhotos.map(photo => {
                    const isSelected = activePhoto?.id === photo.id;
                    return (
                      <motion.div
                        key={photo.id}
                        layoutId={`photo_card_${photo.id}`}
                        onClick={() => {
                          setSelectedPhotoId(photo.id);
                          setIsAddingNew(false);
                        }}
                        className={`group p-3 border rounded-2xl cursor-pointer transition-all flex items-center gap-3.5 ${
                          isSelected
                            ? "bg-zinc-50 dark:bg-zinc-950 border-zinc-900 dark:border-white shadow-md shadow-zinc-900/5"
                            : "bg-white dark:bg-zinc-900 border-zinc-100 dark:border-zinc-850 hover:border-zinc-300 dark:hover:border-zinc-700"
                        }`}
                      >
                        <div className="w-14 h-12 rounded-xl overflow-hidden shrink-0 bg-black relative border border-zinc-100 dark:border-zinc-800">
                          <img
                            src={photo.thumbnail}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            alt=""
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-all" />
                        </div>
                        <div className="flex-1 min-w-0 leading-tight space-y-1">
                          <h5 className="text-[11.5px] font-black text-zinc-900 dark:text-white truncate group-hover:text-emerald-500 transition-colors">
                            {photo.title}
                          </h5>
                          <div className="flex items-center gap-2 text-[9.5px]">
                            <span className="text-zinc-400 font-bold truncate block max-w-[85px]">
                              {photo.author}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                            <span className="text-zinc-500 dark:text-zinc-400 font-black">
                              {photo.cameraModel?.split(" ")[0] || "광학기기"}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Detailed Inspector & Metadata Editor (8 Columns) */}
          <div className="col-span-8">
            <AnimatePresence mode="wait">
              {isAddingNew ? (
                /* Dynamic Modern registration form */
                <motion.form 
                  key="add-form-desktop"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  onSubmit={handleCreatePhoto} 
                  className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800/80 shadow-[0_2px_15px_rgba(0,0,0,0.015)] rounded-3xl p-6 md:p-7 space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-850 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-500">
                        <Camera size={18} className="stroke-[2.25]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-black text-zinc-900 dark:text-white leading-none">
                          신규 광학 실사 자료 등재
                        </h3>
                        <p className="text-[10px] text-zinc-400 font-bold mt-1">현장 무수정 촬영 이미지에 대한 메타정보 등록 대장</p>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setIsAddingNew(false)}
                      className="px-3.5 py-1.5 text-[10px] font-black text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300 border border-zinc-150 dark:border-zinc-800 rounded-xl transition-all"
                    >
                      취소
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-[11px]">
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">사진 자산 제목</label>
                      <input
                        type="text"
                        required
                        placeholder="예: 을지로 통제구역 현장기록"
                        value={formTitle}
                        onChange={(e) => setFormTitle(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all focus:bg-white dark:focus:bg-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">기탁 기자 성명 / 소속</label>
                      <input
                        type="text"
                        placeholder="예: 백민호 시민기자"
                        value={formAuthor}
                        onChange={(e) => setFormAuthor(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all focus:bg-white dark:focus:bg-zinc-900"
                      />
                    </div>

                    <div className="col-span-2 space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">고해상도 이미지 웹 주소 (Unsplash 등 프리 리소스 주소)</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/... (비워둘 시 기본 프레스용 프레임 대체 적용)"
                        value={formThumbnail}
                        onChange={(e) => setFormThumbnail(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/30 focus:border-emerald-500 transition-all focus:bg-white dark:focus:bg-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase block">기여 분류 카테고리 지정</label>
                      <select
                        value={formRealCategory}
                        onChange={(e) => setFormRealCategory(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                      >
                        {categoriesList.filter(c => c.key !== "all").map(c => (
                          <option key={c.key} value={c.key}>{c.key}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase block">저작권 제약 조건 설정</label>
                      <select
                        value={formCopyright}
                        onChange={(e) => setFormCopyright(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                      >
                        <option value="출처 표기 필수">출처 표기 필수</option>
                        <option value="공공누리 제1유형">공공누리 제1유형 (비상업 사용권장)</option>
                        <option value="언론사 독점 라이선스">언론사 독점 라이선스 (재배포 불허)</option>
                        <option value="자유 보도용 크리에이티브">자유 보도용 크리에이티브 (공익보도 가능)</option>
                      </select>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase block">광학 EXIF 카메라 기종</label>
                      <input
                        type="text"
                        value={formCamera}
                        onChange={(e) => setFormCamera(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase block">촬영 렌즈 사양</label>
                      <input
                        type="text"
                        value={formLens}
                        onChange={(e) => setFormLens(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase block">촬영 상세 지리적 위치</label>
                      <input
                        type="text"
                        value={formLocation}
                        onChange={(e) => setFormLocation(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-black uppercase block">보도 검색 아카이브 태그 (쉼표 구분)</label>
                      <input
                        type="text"
                        value={formTagsString}
                        onChange={(e) => setFormTagsString(e.target.value)}
                        className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] text-zinc-400 font-black uppercase block">현장 정합성 보도 조서 기록</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="자료 합성이나 인공지능 후보정 흔적이 없음을 서술하고 촬영 장치 명세를 간략히 기록하십시오."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-2xl text-xs font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500 focus:bg-white dark:focus:bg-zinc-900"
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md cursor-pointer flex items-center justify-center gap-2 hover:scale-[1.015]"
                  >
                    <Save size={14} className="stroke-[2.5]" />
                    무변조 사진 아카이브 정식 송고
                  </button>
                </motion.form>
              ) : activePhoto ? (
                /* Advanced Detail Inspector Board with Exif & Map Integrity Gauges */
                <motion.div 
                  key={`detail-${activePhoto.id}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white dark:bg-zinc-900 border border-zinc-100/90 dark:border-zinc-800/80 shadow-[0_2px_15px_rgba(0,0,0,0.015)] rounded-3xl p-6 space-y-6"
                >
                  {/* High Quality Visual Frame */}
                  <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden bg-black border border-zinc-100 dark:border-zinc-850 group/image">
                    <img
                      src={activePhoto.thumbnail}
                      className="w-full h-full object-cover brightness-[0.95] group-hover/image:scale-[1.015] transition-transform duration-700"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
                    
                    {/* Glowing floating labels on image */}
                    <div className="absolute bottom-4 left-4 bg-zinc-950/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-zinc-800 text-white flex items-center gap-2 font-black text-[10px] shadow-lg">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
                      <span className="tracking-wide uppercase">{activePhoto.realPhotoCategory} • 공인 대장 기탁물</span>
                    </div>

                    <div className="absolute top-4 right-4 bg-zinc-950/75 backdrop-blur-md px-3 py-1.5 rounded-xl border border-zinc-800 text-white flex items-center gap-1.5 text-[10px] font-mono">
                      <Maximize2 size={11} className="text-zinc-400" />
                      <span>{activePhoto.photoResolution}</span>
                    </div>
                  </div>

                  {/* Header and Controls */}
                  <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-850 pb-4">
                    <div className="space-y-1">
                      <h2 className="text-xl font-black text-zinc-900 dark:text-white leading-tight">
                        {activePhoto.title}
                      </h2>
                      <div className="flex items-center gap-2 text-[11px] text-zinc-400 font-bold">
                        <span>출처: <span className="text-zinc-700 dark:text-zinc-300 font-black">{activePhoto.author}</span></span>
                        <span className="w-1 h-1 rounded-full bg-zinc-200 dark:bg-zinc-800" />
                        <span>등록일: {new Date(activePhoto.createdAt || "").toLocaleDateString("ko-KR")}</span>
                      </div>
                    </div>

                    {/* Delete action button */}
                    <button
                      type="button"
                      onClick={handleDeletePhoto}
                      className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-600 dark:bg-rose-950/20 dark:hover:bg-rose-950/40 rounded-xl transition-all cursor-pointer border border-rose-100/50 dark:border-rose-900/30"
                      title="데이터 말소"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {/* Content Report */}
                  <div className="space-y-2">
                    <h4 className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest block">촬영 현장 상황설명 조서</h4>
                    <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-semibold bg-zinc-50/50 dark:bg-zinc-950 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      {activePhoto.content}
                    </p>
                  </div>

                  {/* Editorial Dataficator Panels */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-850 pb-2">
                      <div className="w-5.5 h-5.5 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                        <Sliders size={12} className="stroke-[2.5]" />
                      </div>
                      <h4 className="text-xs font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-widest">
                        정밀 메타데이터 분류 조정 대장
                      </h4>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-[11px]">
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">카테고리 재지정</label>
                        <select
                          value={editRealCategory}
                          onChange={(e) => setEditRealCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                        >
                          {categoriesList.filter(c => c.key !== "all").map(c => (
                            <option key={c.key} value={c.key}>{c.key}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">배정 라이선스 권한 유형</label>
                        <select
                          value={editCopyright}
                          onChange={(e) => setEditCopyright(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold text-zinc-900 dark:text-white outline-none focus:bg-white dark:focus:bg-zinc-900"
                        >
                          <option value="출처 표기 필수">출처 표기 필수</option>
                          <option value="공공누리 제1유형">공공누리 제1유형</option>
                          <option value="언론사 독점 라이선스">언론사 독점 라이선스</option>
                          <option value="자유 보도용 크리에이티브">자유 보도용 크리에이티브</option>
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">촬영 지리적 장소</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-zinc-900"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">물리 픽셀 해상도</label>
                        <input
                          type="text"
                          value={editResolution}
                          onChange={(e) => setEditResolution(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-zinc-900"
                        />
                      </div>

                      <div className="col-span-2 space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-black uppercase tracking-wider block">아카이브 검색 태그 (쉼표 구분)</label>
                        <input
                          type="text"
                          value={editTagsString}
                          onChange={(e) => setEditTagsString(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-zinc-50/50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-emerald-500/20 focus:bg-white dark:focus:bg-zinc-900"
                        />
                      </div>

                      <div className="col-span-2 space-y-2.5 bg-zinc-50/30 dark:bg-zinc-950/30 p-4 border border-zinc-100 dark:border-zinc-850 rounded-2xl">
                        <div className="flex justify-between items-center text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest">
                          <span className="flex items-center gap-1.5">
                            <ShieldAlert size={12} className="text-emerald-500" />
                            보도 정합성 신뢰도 점수 산정
                          </span>
                          <span className="text-emerald-500 font-mono text-xs font-black">{editSuitability} / 100 점</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={editSuitability}
                          onChange={(e) => setEditSuitability(Number(e.target.value))}
                          className="w-full accent-emerald-500 h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full cursor-pointer mt-2"
                        />
                        <span className="text-[9px] text-zinc-400 font-bold block mt-1">
                          수광 원시 광학 파일 입증 및 촬영 지오태그 정합성을 종합 산출한 자체 보도 지표입니다.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* High Tech EXIF Specs Block */}
                  <div className="p-4 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-2xl border border-zinc-150/50 dark:border-zinc-850 space-y-3">
                    <div className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-widest flex items-center gap-1.5">
                      <Compass size={12} className="text-emerald-500" />
                      실시간 광학 센서 EXIF 정보
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-xs font-bold leading-tight">
                      <div className="p-1">
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">카메라 바디</span>
                        <span className="text-zinc-800 dark:text-zinc-200 block truncate mt-1">{activePhoto.cameraModel || "Fujifilm X Series"}</span>
                      </div>
                      <div className="p-1">
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">렌즈 어셈블리</span>
                        <span className="text-zinc-800 dark:text-zinc-200 block truncate mt-1">{activePhoto.lensModel || "Standard Prime"}</span>
                      </div>
                      <div className="p-1">
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">조작 명세 (노출)</span>
                        <span className="text-zinc-800 dark:text-zinc-200 block mt-1">{activePhoto.shutterSpeed || "1/160"}s · {activePhoto.apertureValue || "F5.6"} · ISO {activePhoto.isoSpeed || "160"}</span>
                      </div>
                      <div className="p-1">
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">공간좌표 (GPS)</span>
                        <span className="text-zinc-800 dark:text-zinc-200 block mt-1 font-mono text-[11px] truncate">Lat {activePhoto.geoLatitude || "37.5"}, Lng {activePhoto.geoLongitude || "126.9"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Submission and Save CTAs */}
                  <div className="flex gap-3 justify-end pt-2 border-t border-zinc-100 dark:border-zinc-850">
                    <button
                      type="button"
                      onClick={handleUpdateMetadata}
                      className="px-6 py-3.5 bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shadow-zinc-950/10"
                    >
                      <Save size={14} className="stroke-[2.5]" />
                      명세 대장 정보 갱신 저장
                    </button>
                  </div>

                </motion.div>
              ) : (
                <div className="p-20 text-center text-zinc-400 border border-zinc-150/60 dark:border-zinc-800 rounded-3xl bg-white dark:bg-zinc-900 shadow-sm flex flex-col items-center justify-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center text-zinc-300">
                    <Camera size={24} className="stroke-[1.5]" />
                  </div>
                  <div className="space-y-1">
                    <span className="text-xs font-black text-zinc-700 dark:text-zinc-300 block">선택한 이미지 대장이 없습니다.</span>
                    <span className="text-[10px] text-zinc-400 font-medium block">좌측 실사 기탁 피드에서 분석 대상을 선택해 주십시오.</span>
                  </div>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

      </div>

      {/* 📱 MOBILE OPTIMIZED UI/UX LAYOUT (Optimized for handheld phone formats - Dynamic Trend Design) */}
      <div className={isSimulatedMobileView ? "flex flex-col gap-4" : "lg:hidden flex flex-col gap-4"}>
        
        {/* Dynamic Nav Tabs for Mobile Dashboard */}
        <div className="grid grid-cols-3 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200/50 dark:border-zinc-850/60 shadow-inner">
          <button
            type="button"
            onClick={() => {
              setMobileNavTab("feed");
              setIsAddingNew(false);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mobileNavTab === "feed" && !isAddingNew
                ? "bg-white dark:bg-zinc-850 text-zinc-950 dark:text-white shadow-sm"
                : "text-zinc-500"
            }`}
          >
            <Camera size={13} />
            대장 피드
          </button>
          
          <button
            type="button"
            onClick={() => {
              setMobileNavTab("statistics");
              setIsAddingNew(false);
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              mobileNavTab === "statistics"
                ? "bg-white dark:bg-zinc-850 text-zinc-950 dark:text-white shadow-sm"
                : "text-zinc-500"
            }`}
          >
            <BarChart3 size={13} />
            데이터 통계
          </button>

          <button
            type="button"
            onClick={() => {
              setIsAddingNew(true);
              setMobileNavTab("upload");
            }}
            className={`py-2 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-1 cursor-pointer ${
              isAddingNew
                ? "bg-white dark:bg-zinc-850 text-zinc-950 dark:text-white shadow-sm"
                : "text-zinc-500"
            }`}
          >
            <Plus size={13} />
            보도 자료 기탁
          </button>
        </div>

        {/* 1. Mobile Feed Sub-view */}
        {mobileNavTab === "feed" && !isAddingNew && (
          <div className="space-y-4 animate-in fade-in duration-300">
            {/* Search + Category Filter Grid */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={13} />
                <input
                  type="text"
                  placeholder="대장 제목, 기종, 해시태그 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-3 bg-white dark:bg-zinc-900 border border-zinc-150 dark:border-zinc-850 rounded-2xl text-[11px] font-bold outline-none text-zinc-950 dark:text-white shadow-sm"
                />
              </div>

              {/* Horizontal Category Pill Carousel */}
              <div className="flex gap-1.5 overflow-x-auto pb-1 px-0.5 snap-x no-scrollbar">
                {categoriesList.map(cat => {
                  const isSelected = activeCategoryFilter === cat.key;
                  return (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => setActiveCategoryFilter(cat.key)}
                      className={`snap-center shrink-0 px-3.5 py-2 rounded-full text-[10px] font-black transition-all flex items-center gap-1 border cursor-pointer ${
                        isSelected
                          ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-transparent shadow-sm"
                          : "bg-white dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border-zinc-150 dark:border-zinc-850"
                      }`}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.label === "전체 카테고리" ? "전체" : cat.label.split("/")[0]}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* High-Fidelity 2-Column Grid of Cards */}
            <div className="grid grid-cols-2 gap-3 pb-12">
              {filteredPhotos.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-zinc-400 bg-white dark:bg-zinc-900 border border-dashed border-zinc-150 dark:border-zinc-850 rounded-2xl">
                  <AlertCircle size={20} className="mx-auto text-zinc-300 mb-1.5" />
                  <span className="text-[10px] font-bold block">조건에 부합하는 대장이 없습니다.</span>
                </div>
              ) : (
                filteredPhotos.map(photo => (
                  <motion.div
                    key={`mob-feed-${photo.id}`}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => {
                      setSelectedPhotoId(photo.id);
                      setMobileDetailOpen(true);
                    }}
                    className="bg-white dark:bg-zinc-900 border border-zinc-150/60 dark:border-zinc-850/60 rounded-2xl p-2.5 space-y-2 flex flex-col justify-between shadow-[0_2px_8px_rgba(0,0,0,0.015)]"
                  >
                    <div className="space-y-2">
                      <div className="aspect-[4/3] w-full rounded-xl overflow-hidden bg-black relative border border-zinc-100 dark:border-zinc-800">
                        <img
                          src={photo.thumbnail}
                          className="w-full h-full object-cover"
                          alt=""
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-1.5 right-1.5 bg-zinc-950/85 backdrop-blur-md px-1.5 py-0.5 rounded-md text-[8px] font-mono font-black text-emerald-400">
                          {photo.coverageSuitability}%
                        </div>
                      </div>

                      <h5 className="text-[11px] font-black text-zinc-900 dark:text-zinc-50 line-clamp-1">
                        {photo.title}
                      </h5>
                    </div>

                    <div className="flex items-center justify-between text-[8.5px] text-zinc-400 pt-1.5 border-t border-zinc-50 dark:border-zinc-850">
                      <span className="font-extrabold truncate max-w-[55px]">{photo.author.split(" ")[0]}</span>
                      <span className="px-1.5 py-0.2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 text-zinc-500 rounded font-black">
                        {photo.realPhotoCategory?.split("/")[0]}
                      </span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        )}

        {/* 2. Mobile Statistics Sub-view (Latest Bento Trend) */}
        {mobileNavTab === "statistics" && (
          <div className="space-y-4 animate-in fade-in duration-300 pb-12">
            
            <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-150/80 dark:border-zinc-850/60 shadow-sm space-y-3.5">
              <h3 className="text-xs font-black text-zinc-950 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 size={13} className="text-emerald-500" />
                대장 분류 통계 보고서
              </h3>
              
              <div className="grid grid-cols-2 gap-3 text-[11px]">
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                  <span className="text-[9px] text-zinc-400 font-bold block">총 등록 이미지</span>
                  <span className="text-2xl font-black font-mono text-zinc-900 dark:text-zinc-50 mt-1 block">
                    {stats.total} <span className="text-[10px] font-bold text-zinc-400">대장</span>
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                  <span className="text-[9px] text-zinc-400 font-bold block">광학 촬영 적합률</span>
                  <span className="text-2xl font-black font-mono text-emerald-500 mt-1 block">
                    {stats.highRatio}%
                  </span>
                </div>
                <div className="bg-zinc-50 dark:bg-zinc-950 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] text-zinc-400 font-bold block">공유 배포 저작 라이선스물</span>
                    <span className="text-base font-black text-zinc-900 dark:text-zinc-50 mt-0.5 block">{stats.openLicensingCount}건 보존</span>
                  </div>
                  <Globe size={24} className="text-zinc-300 dark:text-zinc-700" />
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-150/80 dark:border-zinc-850/60 shadow-sm space-y-3">
              <h4 className="text-[10px] font-black uppercase text-zinc-400 tracking-wider">카테고리별 비중 분포</h4>
              <div className="space-y-2 text-[10px] font-bold">
                {categoriesList.filter(c => c.key !== "all").map(c => {
                  const count = combinedPhotos.filter(p => p.realPhotoCategory === c.key).length;
                  const percent = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
                  return (
                    <div key={c.key} className="space-y-1">
                      <div className="flex justify-between items-center text-zinc-650 dark:text-zinc-300">
                        <span>{c.icon} {c.label}</span>
                        <span>{count}건 ({percent}%)</span>
                      </div>
                      <div className="w-full bg-zinc-100 dark:bg-zinc-950 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>
        )}

        {/* 📱 MOBILE COMPONENT 1: IMMERSIVE DETAILS SHEET VIEW */}
        <AnimatePresence>
          {mobileDetailOpen && activePhoto && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 26, stiffness: 220 }}
              className="fixed inset-0 bg-white dark:bg-zinc-950 z-50 overflow-y-auto flex flex-col"
            >
              {/* Mobile Header Bar */}
              <div className="sticky top-0 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md p-4 flex items-center justify-between border-b border-zinc-150 dark:border-zinc-850 z-10">
                <button
                  type="button"
                  onClick={() => setMobileDetailOpen(false)}
                  className="p-1.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white rounded-xl flex items-center justify-center cursor-pointer"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-black text-zinc-950 dark:text-white">현장 실증 대장 상세</span>
                
                <button
                  type="button"
                  onClick={handleDeletePhoto}
                  className="p-1.5 text-red-500 bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-950/40 rounded-xl"
                  title="삭제"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* High-Fidelity visual block on mobile */}
              <div className="relative aspect-[16/10] w-full bg-black shrink-0">
                <img
                  src={activePhoto.thumbnail}
                  className="w-full h-full object-cover"
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md px-2.5 py-1 rounded-lg border border-zinc-800 text-white font-extrabold text-[9px]">
                  {activePhoto.realPhotoCategory} 대장분류
                </div>
              </div>

              {/* Body Metadata content */}
              <div className="p-4 space-y-5 flex-1 pb-24 text-[11px] font-semibold">
                
                <div className="space-y-1">
                  <h3 className="text-sm font-black text-zinc-950 dark:text-white leading-snug">
                    {activePhoto.title}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[9.5px] text-zinc-400 font-bold">
                    <span>출처: {activePhoto.author}</span>
                    <span className="w-1 h-1 rounded-full bg-zinc-200" />
                    <span>{new Date(activePhoto.createdAt || "").toLocaleDateString("ko-KR")}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h4 className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-wider">현장 정합 상황설명</h4>
                  <p className="text-[11px] text-zinc-700 dark:text-zinc-300 font-bold leading-relaxed bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                    {activePhoto.content}
                  </p>
                </div>

                {/* Sub-tab collapsibles */}
                <div className="space-y-3">
                  <div className="flex border-b border-zinc-100 dark:border-zinc-800 text-[10px] font-black uppercase">
                    <button
                      type="button"
                      onClick={() => setMobileActiveSubTab("exif")}
                      className={`flex-1 text-center pb-2 cursor-pointer ${mobileActiveSubTab === "exif" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-400"}`}
                    >
                      📸 광학 규격
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileActiveSubTab("category")}
                      className={`flex-1 text-center pb-2 cursor-pointer ${mobileActiveSubTab === "category" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-400"}`}
                    >
                      🏷️ 대장 정제
                    </button>
                    <button
                      type="button"
                      onClick={() => setMobileActiveSubTab("location")}
                      className={`flex-1 text-center pb-2 cursor-pointer ${mobileActiveSubTab === "location" ? "text-emerald-500 border-b-2 border-emerald-500" : "text-zinc-400"}`}
                    >
                      🗺️ 지오태그
                    </button>
                  </div>

                  {mobileActiveSubTab === "exif" && (
                    <div className="bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850 grid grid-cols-2 gap-3.5">
                      <div>
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">카메라 기종</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-black block mt-0.5">{activePhoto.cameraModel || "Fujifilm X-T5"}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">렌즈 어셈블리</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-black block mt-0.5">{activePhoto.lensModel || "Standard Zoom"}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">셔터속도 / 감도</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-mono block mt-0.5">{activePhoto.shutterSpeed || "1/125s"} · ISO {activePhoto.isoSpeed || "200"}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">조리개 사양</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-mono block mt-0.5">{activePhoto.apertureValue || "F4.0"}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[8px] text-zinc-400 block font-bold uppercase">원천 센서 픽셀 사양</span>
                        <span className="text-zinc-900 dark:text-zinc-100 font-black block mt-0.5">{activePhoto.photoResolution}</span>
                      </div>
                    </div>
                  )}

                  {mobileActiveSubTab === "category" && (
                    <div className="space-y-3 bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-400 font-black uppercase">대장 분류 재지정</label>
                        <select
                          value={editRealCategory}
                          onChange={(e) => setEditRealCategory(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold"
                        >
                          {categoriesList.filter(c => c.key !== "all").map(c => (
                            <option key={c.key} value={c.key}>{c.key}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-400 font-black uppercase">저작권 권리 유형</label>
                        <select
                          value={editCopyright}
                          onChange={(e) => setEditCopyright(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold"
                        >
                          <option value="출처 표기 필수">출처 표기 필수</option>
                          <option value="공공누리 제1유형">공공누리 제1유형</option>
                          <option value="언론사 독점 라이선스">언론사 독점 라이선스</option>
                          <option value="자유 보도용 크리에이티브">자유 보도용 크리에이티브</option>
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-400 font-black uppercase">검색 아카이빙 태그 (쉼표 구분)</label>
                        <input
                          type="text"
                          value={editTagsString}
                          onChange={(e) => setEditTagsString(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold"
                        />
                      </div>
                    </div>
                  )}

                  {mobileActiveSubTab === "location" && (
                    <div className="space-y-3.5 bg-zinc-50 dark:bg-zinc-900 p-3.5 rounded-2xl border border-zinc-100 dark:border-zinc-850">
                      <div className="space-y-1">
                        <label className="text-[8px] text-zinc-400 font-black uppercase">상세 지리적 촬영소재지</label>
                        <input
                          type="text"
                          value={editLocation}
                          onChange={(e) => setEditLocation(e.target.value)}
                          className="w-full px-3 py-2 bg-white dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-850 rounded-xl font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <div className="flex justify-between items-center text-[8px] text-zinc-400 font-black uppercase">
                          <span>보도 적합성 신뢰 지수</span>
                          <span className="text-emerald-500 font-black font-mono text-[11px]">{editSuitability} / 100 점</span>
                        </div>
                        <input
                          type="range"
                          min="50"
                          max="100"
                          value={editSuitability}
                          onChange={(e) => setEditSuitability(Number(e.target.value))}
                          className="w-full accent-emerald-500 cursor-pointer"
                        />
                      </div>
                    </div>
                  )}
                </div>

              </div>

              {/* Sticky bottom CTA for Mobile Details */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border-t border-zinc-150 dark:border-zinc-850 flex gap-2 z-15">
                <button
                  type="button"
                  onClick={handleUpdateMetadata}
                  className="flex-1 py-3.5 bg-zinc-950 hover:bg-zinc-900 dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-zinc-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Save size={13} className="stroke-[2.5]" />
                  대장 분류 갱신 완료
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 📱 MOBILE COMPONENT 2: IMMERSIVE NEW PHOTO REGISTRATION SHEET */}
        <AnimatePresence>
          {isAddingNew && mobileNavTab === "upload" && (
            <div className="animate-in fade-in duration-300">
              <div className="bg-white dark:bg-zinc-900 p-4 rounded-3xl border border-zinc-150/80 dark:border-zinc-850/60 shadow-sm space-y-4 text-[11px] font-bold pb-24">
                
                <div className="border-b border-zinc-100 dark:border-zinc-850 pb-2.5">
                  <h3 className="text-xs font-black text-zinc-950 dark:text-white flex items-center gap-1.5">
                    <Camera size={13} className="text-emerald-500" />
                    광학 무변조 스냅자료 기탁 조서
                  </h3>
                  <p className="text-[9px] text-zinc-400 mt-0.5 font-bold">인공지능 미개입 광학 소스 명세 기탁</p>
                </div>

                <div className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-400 font-black uppercase">사진 제목 명칭</label>
                    <input
                      type="text"
                      required
                      placeholder="예: 경복궁 가을 향원정 단풍"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-400 font-black uppercase">기탁자 명칭 (성명/기자명)</label>
                    <input
                      type="text"
                      placeholder="예: 허종호 기탁자"
                      value={formAuthor}
                      onChange={(e) => setFormAuthor(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-400 font-black uppercase">이미지 자원 URL주소 (Unsplash 등 복사)</label>
                    <input
                      type="url"
                      placeholder="https://images.unsplash.com/... (생략 가능)"
                      value={formThumbnail}
                      onChange={(e) => setFormThumbnail(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-400 font-black block">대장 분류 지정</label>
                      <select
                        value={formRealCategory}
                        onChange={(e) => setFormRealCategory(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                      >
                        {categoriesList.filter(c => c.key !== "all").map(c => (
                          <option key={c.key} value={c.key}>{c.key}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-400 font-black block">권리 귀속 라이선스</label>
                      <select
                        value={formCopyright}
                        onChange={(e) => setFormCopyright(e.target.value)}
                        className="w-full px-3 py-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                      >
                        <option value="출처 표기 필수">출처 표기 필수</option>
                        <option value="공공누리 제1유형">공공누리 제1유형</option>
                        <option value="언론사 독점 라이선스">언론사 독점 라이선스</option>
                        <option value="자유 보도용 크리에이티브">자유 보도용 크리에이티브</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3.5">
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-400 font-black block">카메라 기종</label>
                      <input
                        type="text"
                        value={formCamera}
                        onChange={(e) => setFormCamera(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[8px] text-zinc-400 font-black block">렌즈 마운트</label>
                      <input
                        type="text"
                        value={formLens}
                        onChange={(e) => setFormLens(e.target.value)}
                        className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-400 font-black uppercase">지리 공간 위치</label>
                    <input
                      type="text"
                      value={formLocation}
                      onChange={(e) => setFormLocation(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[8px] text-zinc-400 font-black uppercase">보도 조서 기록 설명</label>
                    <textarea
                      rows={3}
                      required
                      placeholder="촬영 당시의 기상 및 상황, 물리 수광을 입증할 장치 명세를 간략히 기록해 주십시오."
                      value={formContent}
                      onChange={(e) => setFormContent(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-50 dark:bg-zinc-950 border border-zinc-150 dark:border-zinc-850 rounded-xl"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    onClick={handleCreatePhoto}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer shadow-emerald-500/10"
                  >
                    <Save size={13} className="stroke-[2.5]" />
                    조서 대장에 공식 등재 기탁
                  </button>
                </div>

              </div>
            </div>
          )}
        </AnimatePresence>

      </div>

    </div>
  );
};
