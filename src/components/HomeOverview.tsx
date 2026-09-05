import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Sparkles,
  Clock,
  Activity,
  Scale,
  Newspaper,
  Tv,
  Users,
  Award,
  ArrowUpRight,
  ChevronRight,
  TrendingUp,
  Heart,
  Share2,
  ThumbsUp,
  MessageSquare,
  Calendar,
  Flame,
  Zap,
  UserCheck,
  Volume2,
  Smartphone,
  Laptop,
  Search,
  X,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface HomeOverviewProps {
  news?: any[];
  citizenNews?: any[];
  reporters?: any[];
  webtoons?: any[];
  user?: any;
  onPageChange?: (page: string, category?: string) => void;
  isSimulatedMobileView?: boolean;
  onToggleSimulatedMobileView?: () => void;
  selectedCharacterId?: string;
  playHapticClick?: (frequency?: number, duration?: number, type?: string) => void;
  deviceTime?: string;
  onProfessionalRegClick?: () => void;
  onSelectNews?: (news: any) => void;
}

export const HomeOverview: React.FC<HomeOverviewProps> = ({
  news = [],
  citizenNews = [],
  reporters = [],
  webtoons = [],
  user = null,
  onPageChange = () => {},
  isSimulatedMobileView = false,
  onToggleSimulatedMobileView = () => {},
  selectedCharacterId = "isol_bee",
  playHapticClick,
  deviceTime = "08:06",
  onProfessionalRegClick = () => {},
  onSelectNews = () => {}
}) => {
  // 🗳️ Stateful Poll System
  const [votedOption, setVotedOption] = useState<string | null>(() => {
    return localStorage.getItem("isol_home_poll_voted_v1") || null;
  });
  const [pollVotes, setPollVotes] = useState<Record<string, number>>(() => {
    const saved = localStorage.getItem("isol_home_poll_votes_v1");
    return saved ? JSON.parse(saved) : { A: 312, B: 145, C: 211 };
  });

  const handleVote = (option: string) => {
    if (votedOption) return;
    if (typeof playHapticClick === "function") {
      playHapticClick(850, 0.08, "triangle");
    }
    const newVotes = { ...pollVotes, [option]: pollVotes[option] + 1 };
    setPollVotes(newVotes);
    setVotedOption(option);
    localStorage.setItem("isol_home_poll_voted_v1", option);
    localStorage.setItem("isol_home_poll_votes_v1", JSON.stringify(newVotes));
    toast.success(`🗳️ 배심원단 투표 완료! (선택 ${option})`);
  };

  const totalVotes = Object.values(pollVotes).reduce((a, b) => a + b, 0);

  // Active Category & Local Search Filtering
  const [selectedCategory, setSelectedCategory] = useState<string>("전체");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const categories = ["전체", "사회/정치", "경제/문화", "복지/미래비전", "만평", "에세이", "리얼포토"];

  // Real data integration
  const combinedNews = useMemo(() => {
    const combined = [...news, ...citizenNews];
    return combined.sort((a, b) => {
      const dateA = new Date(a.date || "").getTime();
      const dateB = new Date(b.date || "").getTime();
      return dateB - dateA;
    });
  }, [news, citizenNews]);

  const filteredNews = useMemo(() => {
    let result = combinedNews;
    if (selectedCategory !== "전체") {
      result = result.filter((item) => item.category === selectedCategory);
    }
    if (searchQuery.trim() !== "") {
      const q = searchQuery.toLowerCase();
      result = result.filter((item) => 
        (item.title && item.title.toLowerCase().includes(q)) ||
        (item.content && item.content.toLowerCase().includes(q)) ||
        (item.authorName && item.authorName.toLowerCase().includes(q))
      );
    }
    return result;
  }, [combinedNews, selectedCategory, searchQuery]);

  const trendingNews = useMemo(() => {
    return [...combinedNews]
      .sort((a, b) => (b.likes || 0) - (a.likes || 0))
      .slice(0, 5);
  }, [combinedNews]);

  const featuredStory = useMemo(() => {
    return combinedNews.find(item => item.thumbnail) || combinedNews[0];
  }, [combinedNews]);

  // Story reels data for mobile
  const storyReels = useMemo(() => {
    return [
      { id: "s1", name: "속보 릴스", avatar: "🚨", active: true, label: "실시간 특보" },
      { id: "s2", name: "시민기자", avatar: "🎙️", active: true, label: "오늘의 이슈" },
      { id: "s3", name: "AI 만평", avatar: "🎨", active: false, label: "풍자 툰" },
      { id: "s4", name: "리얼포토", avatar: "📷", active: false, label: "EXIF 실사" },
      { id: "s5", name: "소통아고라", avatar: "⚖️", active: false, label: "배심원 투표" }
    ];
  }, []);

  // Mascot interaction
  const [mascotChatBubble, setMascotChatBubble] = useState("이솔뉴스에 오신 것을 환영합니다! 기사 작성이나 전문 언론사 등록을 도와드릴까요?");
  const [mascotClickCount, setMascotClickCount] = useState(0);

  const handleMascotClick = () => {
    if (typeof playHapticClick === "function") {
      playHapticClick(600, 0.05, "sine");
    }
    const nextIdx = mascotClickCount + 1;
    setMascotClickCount(nextIdx);

    const dialogues = [
      "전문언론사로 가입하면, 정밀 AI 교정 혜택을 100% 무상으로 지원받을 수 있어요!",
      "오늘의 여론조사에 한 표를 던져서 이솔나라 정론직필 배심원단의 무결성을 지탱해주세요!",
      "모바일 화면에서는 하단 스티키 메뉴를 통해 실시간 기사 작성이 간편합니다.",
      "EXIF 카메라 무결성 인증이 탑재된 '리얼포토' 탭도 둘러보셨나요? 신선한 충격을 드립니다!"
    ];
    setMascotChatBubble(dialogues[nextIdx % dialogues.length]);
  };

  // -------------------------------------------------------------
  // -------------------------------------------------------------
  // RESPONSIVE HOME OVERVIEW:
  // - Mobile screens (lg:hidden): clean touch-friendly mobile layout
  // - Desktop/Laptop screens (hidden lg:block): full bento media dashboard
  // -------------------------------------------------------------
  return (
    <>
      {/* 📱 MOBILE VIEW (Visible on mobile/tablet screens only) */}
      <div className="block lg:hidden min-h-screen bg-white dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 pb-20 font-sans select-none animate-in fade-in duration-300 relative">
        {/* Mobile Header Hero with Sleek Glassmorphism */}
        <div className="relative overflow-hidden px-5 pt-5 pb-5 bg-gradient-to-b from-red-50/40 via-zinc-50/10 to-transparent dark:from-red-950/20 dark:via-zinc-900/10 dark:to-[#09090b] border-b border-zinc-100 dark:border-zinc-900/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/10 rounded-full blur-3xl pointer-events-none -mr-4 -mt-4" />
          
          <div className="relative z-10 flex flex-col items-start gap-1.5">
            <div className="flex items-center gap-2">
              <span className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 text-[8px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                PORTAL LIVE
              </span>
              <span className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 text-[8px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                📱 최신 트렌드 모바일 UX
              </span>
            </div>
            <h2 className="text-2xl font-black tracking-tight leading-none text-zinc-900 dark:text-white mt-1">
              이솔뉴스 <span className="text-red-500 font-extrabold">모바일 포털</span>
            </h2>
            <p className="text-zinc-500 dark:text-zinc-400 text-[10px] font-semibold leading-relaxed max-w-xs">
              검증 완료 국영 통신 • 오감 감응형 소설 • 무결성 보도
            </p>
          </div>

          {/* Mobile Instant Live Search Bar */}
          <div className="mt-4 relative z-10">
            <div className="relative flex items-center">
              <Search size={14} className="absolute left-3.5 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <input
                type="text"
                placeholder="모바일 기사 빠른 필터 검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl pl-9 pr-8 py-2.5 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-red-500 transition-all shadow-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                >
                  <X size={13} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Story Reels (Instagram / TikTok Style) */}
        <div className="mt-4 px-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono flex items-center gap-1">
              <Sparkles size={11} className="text-red-500 animate-pulse" /> TODAY'S REELS & ISSUES
            </span>
            <span className="text-[8px] text-zinc-400 font-mono">SWIPE ▶</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none">
            {storyReels.map((reel) => (
              <button
                key={reel.id}
                onClick={() => {
                  if (typeof playHapticClick === "function") playHapticClick(650, 0.04);
                  toast.info(`📱 '${reel.name}' 스토리를 탐색합니다.`);
                  if (reel.id === "s2") onPageChange("soul-center");
                  else if (reel.id === "s3") onPageChange("webtoon");
                  else if (reel.id === "s5") onPageChange("community");
                }}
                className="flex flex-col items-center gap-1 shrink-0 cursor-pointer group active:scale-95 transition-transform"
              >
                <div className={`w-14 h-14 rounded-full p-0.5 bg-gradient-to-tr ${reel.active ? "from-red-500 via-rose-500 to-amber-500 animate-pulse" : "from-zinc-300 to-zinc-400 dark:from-zinc-800 dark:to-zinc-700"}`}>
                  <div className="w-full h-full rounded-full bg-white dark:bg-zinc-950 flex items-center justify-center text-xl shadow-inner group-hover:scale-105 transition-transform">
                    {reel.avatar}
                  </div>
                </div>
                <span className="text-[9px] font-black text-zinc-700 dark:text-zinc-300 max-w-[56px] truncate">{reel.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Onboarding Banner for Professional News Registration */}
        <div className="px-4 mt-3">
          <div className="bg-gradient-to-br from-red-50/60 to-zinc-50/80 dark:from-red-950/40 dark:to-zinc-900/60 border border-red-500/15 dark:border-red-500/25 rounded-2xl p-4 relative overflow-hidden shadow-sm dark:shadow-md">
            <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="bg-red-600 text-white text-[8px] font-black px-2 py-0.5 rounded-md tracking-wider">얼라이언스 모집</span>
                <h4 className="text-xs font-black text-zinc-900 dark:text-white">이솔 전문 언론사 공식 뉴스룸 등록</h4>
              </div>
              <p className="text-[10.5px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-semibold">
                정론직필의 가치를 전하는 전문 언론사 파트너를 모집합니다. 기사 무제한 배포 및 AI 교정 혜택을 즉시 활용하세요.
              </p>
              <button
                onClick={() => {
                  if (typeof playHapticClick === "function") playHapticClick(800, 0.08);
                  onProfessionalRegClick();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white text-[11px] font-black py-2.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-1 cursor-pointer active:scale-[0.98]"
              >
                <span>전문언론사 공식 신청하기</span>
                <ArrowUpRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Quick Menu shortcuts */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-4 gap-2 bg-zinc-50/80 dark:bg-zinc-900/30 border border-zinc-150 dark:border-zinc-900 rounded-2xl p-3 shadow-sm dark:shadow-lg">
            {[
              { label: "국영 뉴스", id: "isol-post", emoji: "📰" },
              { label: "웹툰 광장", id: "webtoon", emoji: "🧸" },
              { label: "시민 기자", id: "soul-center", emoji: "🎙️" },
              { label: "소통 아고라", id: "community", emoji: "⚖️" }
            ].map(shortcut => (
              <button
                key={shortcut.id}
                onClick={() => {
                  if (typeof playHapticClick === "function") playHapticClick(600, 0.03);
                  onPageChange(shortcut.id);
                }}
                className="flex flex-col items-center gap-1 cursor-pointer active:scale-95 group transition-all"
              >
                <div className="w-11 h-11 rounded-xl bg-white dark:bg-zinc-950/85 border border-zinc-200/60 dark:border-zinc-900 flex items-center justify-center text-base shadow-sm dark:shadow-inner group-hover:scale-105 transition-transform">
                  {shortcut.emoji}
                </div>
                <span className="text-[9px] font-black text-zinc-500 dark:text-zinc-400 group-hover:text-red-500 dark:group-hover:text-white transition-colors">{shortcut.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Featured Hot Story */}
        {featuredStory && (
          <div className="px-4 mt-6">
            <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest flex items-center gap-1 mb-2.5 font-mono">
              <Flame size={12} className="text-red-500 animate-pulse" /> TODAY'S HOT ARTICLE
            </h3>
            <div 
              onClick={() => onSelectNews(featuredStory)}
              className="bg-zinc-50/50 dark:bg-zinc-900/20 border border-zinc-200/60 dark:border-zinc-900 rounded-[1.75rem] overflow-hidden shadow-md dark:shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
            >
              <div className="relative h-44 bg-zinc-100 dark:bg-zinc-950">
                <img 
                  src={featuredStory.thumbnail} 
                  alt="" 
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3">
                  <span className="bg-red-600/90 text-white text-[8px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider shadow-md">
                    {featuredStory.category}
                  </span>
                </div>
              </div>
              <div className="p-4.5 space-y-2">
                <h4 className="text-sm font-black text-zinc-900 dark:text-white line-clamp-2 leading-snug group-hover:text-red-500 transition-colors">
                  {featuredStory.title}
                </h4>
                <div className="flex items-center justify-between text-[10px] text-zinc-450 dark:text-zinc-500 font-bold pt-1 border-t border-zinc-100 dark:border-zinc-900/50">
                  <span>{featuredStory.authorName || featuredStory.author || "시민필진"}</span>
                  <span>{featuredStory.date}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Category Horizontal Filter Chips */}
        <div className="mt-6">
          <div className="px-4 flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 uppercase tracking-widest font-mono">NEWS CATEGORY ({filteredNews.length})</h3>
          </div>
          <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  if (typeof playHapticClick === "function") playHapticClick(600, 0.02);
                  setSelectedCategory(cat);
                }}
                className={`px-3.5 py-1.5 rounded-full text-[10.5px] font-black whitespace-nowrap border cursor-pointer transition-all ${
                  selectedCategory === cat
                    ? "bg-red-600 border-red-500 text-white shadow-sm"
                    : "bg-zinc-100/80 dark:bg-zinc-900/50 border-zinc-200/55 dark:border-zinc-900 text-zinc-550 dark:text-zinc-400"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile News List Feed */}
        <div className="px-4 mt-3 space-y-3">
          {filteredNews.slice(0, 6).map((item, idx) => (
            <div
              key={item.id || idx}
              onClick={() => onSelectNews(item)}
              className="bg-white dark:bg-zinc-900/20 border border-zinc-150 dark:border-zinc-900/80 rounded-2xl p-3.5 flex items-center gap-4.5 active:scale-[0.98] hover:-translate-y-0.5 transition-all duration-300 cursor-pointer shadow-[0_4px_12px_rgba(0,0,0,0.01)] dark:shadow-none"
            >
              {item.thumbnail && (
                <div className="w-18 h-18 rounded-xl bg-zinc-100 dark:bg-zinc-950 overflow-hidden shrink-0">
                  <img src={item.thumbnail} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="flex-1 space-y-1.5 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[8.5px] font-black text-red-600 dark:text-red-400 uppercase tracking-wide">{item.category}</span>
                  <span className="text-[8.5px] text-zinc-400 dark:text-zinc-600 font-mono font-semibold">{item.date}</span>
                </div>
                <h4 className="text-[12.5px] font-black text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug">
                  {item.title}
                </h4>
              </div>
            </div>
          ))}
          {filteredNews.length === 0 && (
            <p className="text-center text-xs text-zinc-400 py-8">해당 카테고리에 등록된 기사가 없습니다.</p>
          )}
        </div>

        {/* Compact Mobile Poll Widget */}
        <div className="px-4 mt-8">
          <div className="bg-gradient-to-b from-zinc-50/50 to-zinc-100/50 dark:from-zinc-900/40 dark:to-zinc-950/60 border border-zinc-200/60 dark:border-zinc-850 rounded-3xl p-5 space-y-3.5 shadow-sm">
            <h4 className="text-[9.5px] font-black text-red-600 dark:text-red-500 tracking-widest flex items-center gap-1.5 uppercase font-mono">
              <Scale size={12} /> EDITORIAL MOBILE POLL
            </h4>
            <h3 className="text-xs font-black text-zinc-900 dark:text-white leading-snug">이솔뉴스 기사 무결성을 지탱하는 '독자 배심원단 영구 가동'에 동의하십니까?</h3>
            <div className="space-y-2">
              {[
                { key: "A", text: "동의 (배심원제 영구 가동)" },
                { key: "B", text: "반대 (효율 우선)" },
                { key: "C", text: "기권 (추가 대안 필요)" }
              ].map(opt => {
                const isSelected = votedOption === opt.key;
                const hasVoted = votedOption !== null;
                const votes = pollVotes[opt.key] || 0;
                const pct = hasVoted ? Math.round((votes / totalVotes) * 100) : 0;

                return (
                  <button
                    key={opt.key}
                    disabled={hasVoted}
                    onClick={() => handleVote(opt.key)}
                    className={`w-full text-left p-3.5 rounded-xl border text-[11.5px] font-black relative overflow-hidden flex justify-between items-center transition-all cursor-pointer ${
                      isSelected
                        ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-white"
                        : "bg-white dark:bg-zinc-950/80 border-zinc-200/80 dark:border-zinc-900 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
                    {hasVoted && (
                      <div 
                        className="absolute left-0 top-0 bottom-0 bg-red-600 opacity-[0.08] dark:opacity-15" 
                        style={{ width: `${pct}%` }}
                      />
                    )}
                    <span className="relative z-10">{opt.text}</span>
                    {hasVoted && <span className="relative z-10 font-mono text-zinc-500 dark:text-zinc-300 text-[10.5px] font-black">{pct}%</span>}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Floating Mobile Bottom Glass Dock (Fixed position inside mobile container) */}
        <div className="sticky bottom-3 inset-x-3 z-50 mt-8 px-2 pointer-events-auto">
          <div className="bg-zinc-900/90 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-700/50 dark:border-zinc-800 text-white rounded-3xl p-2.5 shadow-2xl flex items-center justify-around">
            <button
              onClick={() => {
                if (typeof playHapticClick === "function") playHapticClick(600, 0.03);
                onPageChange("isol-post");
              }}
              className="flex flex-col items-center gap-1 text-zinc-300 hover:text-red-400 active:scale-90 transition-all cursor-pointer px-3 py-1"
            >
              <Newspaper size={18} />
              <span className="text-[9px] font-bold">뉴스홈</span>
            </button>

            <button
              onClick={() => {
                if (typeof playHapticClick === "function") playHapticClick(600, 0.03);
                onPageChange("webtoon");
              }}
              className="flex flex-col items-center gap-1 text-zinc-300 hover:text-amber-400 active:scale-90 transition-all cursor-pointer px-3 py-1"
            >
              <Tv size={18} />
              <span className="text-[9px] font-bold">웹툰광장</span>
            </button>

            <button
              onClick={() => {
                if (typeof playHapticClick === "function") playHapticClick(800, 0.08);
                onPageChange("soul-center");
              }}
              className="w-11 h-11 rounded-full bg-gradient-to-tr from-red-600 via-rose-600 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-red-500/30 -mt-5 active:scale-90 transition-all cursor-pointer border-2 border-zinc-900"
            >
              <Plus size={22} className="stroke-[2.5]" />
            </button>

            <button
              onClick={() => {
                if (typeof playHapticClick === "function") playHapticClick(600, 0.03);
                onPageChange("soul-center");
              }}
              className="flex flex-col items-center gap-1 text-zinc-300 hover:text-emerald-400 active:scale-90 transition-all cursor-pointer px-3 py-1"
            >
              <Users size={18} />
              <span className="text-[9px] font-bold">시민기자</span>
            </button>

            <button
              onClick={() => {
                if (typeof playHapticClick === "function") playHapticClick(600, 0.03);
                onPageChange("community");
              }}
              className="flex flex-col items-center gap-1 text-zinc-300 hover:text-purple-400 active:scale-90 transition-all cursor-pointer px-3 py-1"
            >
              <Scale size={18} />
              <span className="text-[9px] font-bold">아고라</span>
            </button>
          </div>
        </div>
      </div>

      {/* 💻 DESKTOP VIEW (Visible on desktop/laptop screens only) */}
      <div className="hidden lg:block min-h-screen bg-transparent text-zinc-900 dark:text-zinc-100 font-sans pb-24 select-none animate-in fade-in duration-300">
      
      {/* Editorial Premium Top Line */}
      <div className="border-b border-zinc-200/60 dark:border-zinc-900/50 py-3 px-8 bg-zinc-50/85 dark:bg-zinc-950/40 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] font-bold text-zinc-500">
          <div className="flex items-center gap-6">
            <span className="flex items-center gap-1.5 text-red-600 dark:text-red-500 font-extrabold uppercase tracking-widest">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
              HOT SPECIAL REPORT
            </span>
            <div className="hidden lg:flex items-center gap-2 max-w-lg overflow-hidden whitespace-nowrap text-ellipsis">
              <span className="text-zinc-400 dark:text-zinc-500">실시간 연동 속보:</span>
              <span className="text-zinc-750 dark:text-zinc-300 font-semibold hover:text-red-500 dark:hover:text-white transition-colors cursor-pointer" onClick={() => onSelectNews(combinedNews[0])}>
                {combinedNews[0]?.title || "이솔 국영 종합 뉴스룸 무결성 기사 실시간 릴리즈 개시"}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4 font-mono text-[10px]">
            <span className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
              <Clock size={11} />
              <span>ISST {deviceTime}</span>
            </span>
            <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              SECURED (99.85%)
            </span>
          </div>
        </div>
      </div>

      {/* Hero Header block */}
        <div className="relative overflow-hidden px-8 py-10 bg-gradient-to-b from-zinc-50 via-white to-transparent dark:from-[#0e0e11] dark:via-zinc-950/20 dark:to-transparent">
          <div className="absolute top-0 right-10 w-[450px] h-[450px] bg-red-650/5 rounded-full blur-[140px] pointer-events-none" />
          
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end md:justify-between gap-6 relative z-10">
            <div className="text-left space-y-3.5 max-w-2xl">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-500 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <Sparkles size={11} className="text-red-500 animate-pulse" />
                  프리미엄 미디어 게이트웨이
                </span>
                <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                  포털 실시간 연동
                </span>
              </div>
            
            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              이솔뉴스 <span className="text-red-500">포털 얼라이언스</span>
            </h1>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm font-semibold leading-relaxed max-w-xl">
              투명하고 정직한 저널리즘을 위해 최신 AI 보조 도구와 완벽한 이미지 실사 보증(EXIF)을 지원하는 대한민국 일등 미디어 연합 포털에 동참하세요.
            </p>
          </div>

          <div className="flex items-center gap-6 bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-900 p-4 rounded-2xl backdrop-blur-md shadow-sm dark:shadow-xl">
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest font-mono">ALLIANCE MEMBERS</span>
              <div className="text-xl font-black text-zinc-900 dark:text-white font-mono tracking-tight flex items-center gap-1.5 mt-0.5">
                <span>104개 언론사</span>
              </div>
            </div>
            <div className="h-8 w-[1px] bg-zinc-200 dark:bg-zinc-900" />
            <div className="text-left">
              <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-black uppercase tracking-widest font-mono">REPORTERS ACTIVE</span>
              <div className="text-xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight flex items-center gap-1.5 mt-0.5">
                <span>{reporters.length + 12}명</span>
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Upper Grid: Featured, Onboarding, Hot clicks */}
      <div className="max-w-7xl mx-auto px-6 mt-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Featured Giant Story (Col-span 5) */}
          <div className="lg:col-span-5 flex flex-col justify-between bg-white dark:bg-zinc-900/10 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl overflow-hidden p-6 hover:border-red-500/20 hover:shadow-2xl transition-all duration-300 group shadow-sm">
            {featuredStory ? (
              <div className="space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="relative h-64 w-full rounded-2xl overflow-hidden bg-zinc-100 dark:bg-zinc-950">
                    <img 
                      src={featuredStory.thumbnail} 
                      alt="" 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute top-3 left-3">
                      <span className="bg-red-650 text-white text-[9px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-md">
                        {featuredStory.category}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 text-left">
                    <h3 className="text-lg lg:text-xl font-black text-zinc-900 dark:text-white leading-snug hover:text-red-500 transition-colors cursor-pointer" onClick={() => onSelectNews(featuredStory)}>
                      {featuredStory.title}
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-semibold">
                      {featuredStory.content || "정밀 가독을 위한 원문이 제공됩니다. 상세 버튼을 클릭하여 전체 뉴스와 고화질 실사 이미지, 그리고 무결성 블록체인 검증 내역을 확인해 보세요."}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-zinc-850 dark:text-zinc-300">{featuredStory.authorName || featuredStory.author || "종합뉴스팀"}</span>
                    <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold">{featuredStory.sourceAgency || "이솔 국영 뉴스룸"}</span>
                  </div>
                  <button 
                    onClick={() => onSelectNews(featuredStory)}
                    className="flex items-center gap-1.5 text-xs font-black text-red-500 hover:text-red-700 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <span>상세보기</span>
                    <ArrowUpRight size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-zinc-400 text-xs">최신 등록된 뉴스가 존재하지 않습니다.</p>
              </div>
            )}
          </div>

          {/* Column 2: Professional Newsroom Registration Hub (Col-span 4) */}
          <div className="lg:col-span-4 bg-gradient-to-br from-red-50/40 via-white to-zinc-50/50 dark:from-[#120f12] dark:via-zinc-900/60 dark:to-zinc-950/80 border border-red-500/15 dark:border-red-500/25 rounded-3xl p-6 flex flex-col justify-between shadow-sm dark:shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-red-650/5 rounded-full blur-[80px] pointer-events-none" />
            <div className="space-y-4 relative z-10 text-left">
              <div className="flex items-center gap-2">
                <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                  MEMBERSHIP
                </span>
                <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-black tracking-widest font-mono">PROFESSIONAL ALLIANCE</span>
              </div>
              
              <h3 className="text-xl lg:text-2xl font-black text-zinc-900 dark:text-white leading-tight">
                전문 언론사 연합 <br />
                <span className="text-red-500">공식 뉴스룸 등록</span>
              </h3>
              
              <p className="text-xs text-zinc-550 dark:text-zinc-400 font-semibold leading-relaxed">
                이솔뉴스 공식 제휴사 자격을 획득하세요. 전문적인 뉴스 송출 권한과 실시간 팩트체크 시스템 연합, 그리고 강력한 AI 6하원칙 기사 작성 툴킷을 평생 제공받을 수 있습니다.
              </p>

              <div className="space-y-2 pt-2 text-[11px] font-black text-zinc-650 dark:text-zinc-300">
                <div className="flex items-center gap-2">
                  <UserCheck size={13} className="text-emerald-500" />
                  <span>공인 기사 실시간 무료 무제한 발행</span>
                </div>
                <div className="flex items-center gap-2">
                  <Zap size={13} className="text-amber-500" />
                  <span>AI 뉴스 초안 작성 및 자동 교정 탑재</span>
                </div>
                <div className="flex items-center gap-2">
                  <Activity size={13} className="text-red-500" />
                  <span>소속 보도기자 실명 프로필 공식 기탁</span>
                </div>
              </div>
            </div>

            <div className="pt-6 relative z-10">
              <button
                onClick={() => {
                  if (typeof playHapticClick === "function") playHapticClick(800, 0.08);
                  onProfessionalRegClick();
                }}
                className="w-full bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase py-3.5 rounded-2xl transition-all shadow-lg shadow-red-500/10 flex items-center justify-center gap-2 cursor-pointer hover:scale-[1.01] active:scale-95"
              >
                <span>전문언론사 공식 등록하기</span>
                <ArrowUpRight size={14} />
              </button>
              <p className="text-center text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-2.5">
                등록 심사는 영업일 기준 최대 24시간 내 승인 처리됩니다.
              </p>
            </div>
          </div>

          {/* Column 3: Hot Articles & Mascot (Col-span 3) */}
          <div className="lg:col-span-3 bg-white dark:bg-zinc-900/10 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl p-6 flex flex-col justify-between text-left relative overflow-hidden shadow-sm">
            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <h4 className="text-[10px] font-black text-zinc-400 dark:text-zinc-500 tracking-wider flex items-center gap-1.5 font-mono">
                  <TrendingUp size={12} className="text-red-500" /> REALTIME POPULAR
                </h4>
                <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-mono">TOP 5</span>
              </div>

              <div className="space-y-3">
                {trendingNews.slice(0, 5).map((item, idx) => (
                  <div 
                    key={item.id || idx}
                    onClick={() => onSelectNews(item)}
                    className="flex items-start gap-2 cursor-pointer group hover:bg-zinc-50 dark:hover:bg-zinc-900/40 p-1.5 rounded-lg transition-all"
                  >
                    <span className="font-mono text-xs font-black text-red-500 w-4">{idx + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300 group-hover:text-red-650 dark:group-hover:text-white transition-colors line-clamp-1 leading-tight">
                        {item.title}
                      </p>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-bold mt-0.5 block">{item.category} • {item.likes || 0}추천</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Assistant Mascot Integration */}
            <div 
              onClick={handleMascotClick}
              className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 rounded-2xl p-3 flex gap-3 items-center cursor-pointer hover:border-red-500/20 hover:bg-zinc-100/50 dark:hover:bg-zinc-900/20 transition-all duration-300 mt-4 relative group"
            >
              <div className="w-9 h-9 rounded-full bg-red-650 flex items-center justify-center text-base shadow-inner group-hover:scale-105 transition-transform">
                🐝
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-red-500">요정 비서 '이솔비'</span>
                  <span className="text-[8px] text-zinc-400 dark:text-zinc-600 font-bold">CLICK ME</span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-tight font-semibold mt-0.5">
                  "{mascotChatBubble}"
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Main Bento Layout: Article Archive & Interactive Widgets */}
      <div className="max-w-7xl mx-auto px-6 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT: Filterable News Feed (Col-span 8) */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* News Filter Header */}
            <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200/85 dark:border-zinc-900 rounded-3xl p-6 text-left space-y-4 shadow-sm">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div className="flex items-center gap-2">
                  <Newspaper size={14} className="text-red-500" />
                  <h3 className="text-xs font-black text-zinc-800 dark:text-zinc-300 uppercase tracking-widest font-mono">ALL ALLIANCE ARTICLES</h3>
                </div>
                
                {/* Instant Search Bar for Desktop */}
                <div className="relative flex items-center min-w-[240px]">
                  <Search size={13} className="absolute left-3 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="노트북 기사 빠른 키워드 검색..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-7 py-1.5 text-xs font-bold text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-red-500 transition-all"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              </div>

              {/* Category selector */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      if (typeof playHapticClick === "function") playHapticClick(600, 0.02);
                      setSelectedCategory(cat);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-[11px] font-black border transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? "bg-red-600 border-red-500 text-white shadow-md shadow-red-500/10"
                        : "bg-zinc-100/80 dark:bg-zinc-950/60 border-zinc-200/60 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* News cards bento grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {filteredNews.map((item, idx) => (
                  <div
                    key={item.id || idx}
                    onClick={() => onSelectNews(item)}
                    className="bg-zinc-50/50 dark:bg-zinc-950/50 border border-zinc-200/60 dark:border-zinc-900 rounded-2xl p-4 flex flex-col justify-between hover:border-red-500/20 hover:bg-white dark:hover:bg-zinc-900/10 hover:shadow-md transition-all duration-300 cursor-pointer h-44 group shadow-[0_2px_8px_rgba(0,0,0,0.01)]"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 dark:text-zinc-500">
                        <span className="text-red-550 dark:text-red-500 uppercase tracking-wider font-extrabold text-[9px]">
                          {item.category}
                        </span>
                        <span>{item.date}</span>
                      </div>
                      <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-200 line-clamp-2 leading-snug group-hover:text-red-550 dark:group-hover:text-white transition-colors">
                        {item.title}
                      </h4>
                    </div>
                    
                    <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900/60 pt-3 mt-3 text-[10px] font-black text-zinc-500 dark:text-zinc-400">
                      <span>By {item.authorName || item.author || "시민 배심원"}</span>
                      <span className="text-[9px] text-zinc-400 dark:text-zinc-600 uppercase font-mono font-semibold">{item.sourceAgency || "이솔연합"}</span>
                    </div>
                  </div>
                ))}
                {filteredNews.length === 0 && (
                  <div className="col-span-2 py-12 text-center text-zinc-400 dark:text-zinc-500 text-xs">
                    이 카테고리에 기탁된 기사가 아직 없습니다.
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT: Editorial Sidebar Widgets (Col-span 4) */}
          <div className="lg:col-span-4 space-y-6 text-left">
            
            {/* Widget 1: Dynamic National Poll */}
            <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-300">
                  <Scale size={13} className="text-red-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest font-mono">NATIONAL POLICIES POLL</h4>
                </div>
                <span className="text-[9px] bg-red-500/10 text-red-650 dark:text-red-500 border border-red-500/15 font-black px-2 py-0.5 rounded uppercase tracking-wider font-mono">LIVE</span>
              </div>

              <div className="space-y-1">
                <h3 className="text-sm font-black text-zinc-900 dark:text-white leading-snug">이솔 국영 뉴스에 가상 배심원 영구 심의 제도를 개헌 도입하는 법안에 동의하십니까?</h3>
                <p className="text-[11px] text-zinc-500 leading-relaxed font-semibold">
                  본 도입 동의 시, 검증 완료 기사는 가상 배심원단 30인의 검증 서명을 거치게 되며, 보도 무결성은 100% 영구 보존됩니다.
                </p>
              </div>

              <div className="space-y-2 pt-2">
                {[
                  { key: "A", text: "찬성 (배심원제 전격 영구 가동)" },
                  { key: "B", text: "반대 (효율적인 신속 발행 우선)" },
                  { key: "C", text: "기권 (추가적인 법적 안전장치 검토)" }
                ].map(opt => {
                  const isSelected = votedOption === opt.key;
                  const hasVoted = votedOption !== null;
                  const votes = pollVotes[opt.key] || 0;
                  const pct = hasVoted ? Math.round((votes / totalVotes) * 100) : 0;

                  return (
                    <button
                      key={opt.key}
                      disabled={hasVoted}
                      onClick={() => handleVote(opt.key)}
                      className={`w-full text-left p-3.5 rounded-xl border text-xs font-black relative overflow-hidden flex justify-between items-center transition-all ${
                        isSelected
                          ? "bg-red-500/10 border-red-500/30 text-red-600 dark:text-white"
                          : "bg-zinc-50 dark:bg-zinc-950/80 border-zinc-200/60 dark:border-zinc-900 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-white hover:bg-zinc-100/30 cursor-pointer active:scale-[0.99]"
                      }`}
                    >
                      {hasVoted && (
                        <div 
                          className="absolute left-0 top-0 bottom-0 bg-red-600 dark:bg-red-650 opacity-[0.06] dark:opacity-15 transition-all duration-1000" 
                          style={{ width: `${pct}%` }}
                        />
                      )}
                      <span className="relative z-10 font-sans">{opt.text}</span>
                      {hasVoted && <span className="relative z-10 font-mono text-zinc-650 dark:text-zinc-300 text-xs font-black">{pct}%</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Widget 2: Realtime Trending Keywords */}
            <div className="bg-white dark:bg-zinc-900/10 border border-zinc-200/80 dark:border-zinc-900 rounded-3xl p-6 space-y-4 shadow-sm">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                <div className="flex items-center gap-2 text-zinc-800 dark:text-zinc-300">
                  <Activity size={13} className="text-red-500" />
                  <h4 className="text-[10px] font-black uppercase tracking-widest font-mono">TRENDING KEYWORDS</h4>
                </div>
                <span className="text-[8px] text-zinc-400 dark:text-zinc-500 font-mono">1시간 기준</span>
              </div>

              <div className="space-y-2">
                {[
                  { rank: 1, word: "전문언론사 연합 등록", up: true, diff: 42 },
                  { rank: 2, word: "오감 감응형 소설 공방", up: true, diff: 18 },
                  { rank: 3, word: "EXIF 실사 카메라 무결성", up: false, diff: 2 },
                  { rank: 4, word: "이솔 국영 종합 뉴스룸", up: true, diff: 5 },
                  { rank: 5, word: "배심원단 헌법 개정안", up: true, diff: 31 }
                ].map((item) => (
                  <div key={item.rank} className="flex items-center justify-between text-xs py-1 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 px-1 rounded transition-colors">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-red-500 w-4 text-center">{item.rank}</span>
                      <span className="font-bold text-zinc-700 dark:text-zinc-300 hover:text-red-500 dark:hover:text-white cursor-pointer transition-colors">{item.word}</span>
                    </div>
                    <span className={`text-[10px] font-mono font-bold ${item.up ? "text-red-500" : "text-zinc-400"}`}>
                      {item.up ? "▲" : "▼"} {item.diff}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </div>

    </div>
    </>
  );
};
