import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Command,
  Newspaper,
  BookOpen,
  Sparkles,
  Bot,
  Sun,
  Moon,
  Smartphone,
  Laptop,
  ArrowRight,
  TrendingUp,
  Tag
} from "lucide-react";

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearchSubmit?: (query: string) => void;
  onSelectNews?: (news: any) => void;
  onSelectCategory?: (category: string) => void;
  onNavigatePage?: (page: string) => void;
  onPageChange?: (page: string) => void;
  onToggleTheme?: () => void;
  theme?: "light" | "dark";
  isSimulatedMobileView?: boolean;
  onToggleSimulatedMobileView?: () => void;
  onOpenKakaoBot?: () => void;
  onOpen10Improvements?: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({
  isOpen,
  onClose,
  onSearchSubmit,
  onSelectNews,
  onSelectCategory,
  onNavigatePage,
  onPageChange,
  onToggleTheme,
  theme = "light",
  isSimulatedMobileView = false,
  onToggleSimulatedMobileView,
  onOpenKakaoBot,
  onOpen10Improvements,
}) => {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigateTo = (page: string) => {
    if (onPageChange) onPageChange(page);
    else if (onNavigatePage) onNavigatePage(page);
  };

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const quickActions = [
    {
      id: "search_news",
      title: query ? `'${query}' 뉴스 검색하기` : "기사 정밀 검색하기",
      subtitle: "이솔뉴스 전체 보도자료 및 시민 기사 검색",
      icon: Search,
      action: () => {
        if (query.trim()) {
          if (onSearchSubmit) onSearchSubmit(query.trim());
          navigateTo("isol-post");
          onClose();
        }
      },
    },
    {
      id: "cat_all",
      title: "전체기사 카테고리 보기",
      subtitle: "정치, 사회, 경제, IT/AI, 문화/예술 통합 보도",
      icon: Newspaper,
      action: () => {
        if (onSelectCategory) onSelectCategory("전체기사");
        navigateTo("isol-post");
        onClose();
      },
    },
    {
      id: "cat_vegan",
      title: "비건/생태 카테고리 열기",
      subtitle: "지구와 함께하는 비건 라이프 및 기후 생태 기사",
      icon: Tag,
      action: () => {
        if (onSelectCategory) onSelectCategory("비건/푸드");
        navigateTo("isol-post");
        onClose();
      },
    },
    {
      id: "cat_ai",
      title: "AI/기술 카테고리 열기",
      subtitle: "차세대 인공지능 연구소 및 생성형 AI 뉴스",
      icon: Sparkles,
      action: () => {
        if (onSelectCategory) onSelectCategory("AI/기술");
        navigateTo("isol-post");
        onClose();
      },
    },
    {
      id: "hyeonwon_cinema",
      title: "현원시네마 관람하기",
      subtitle: "독립영화 감독 김현원의 오리지널 스토리보드 & 포스터",
      icon: BookOpen,
      action: () => {
        navigateTo("hyeonwon-cinema");
        onClose();
      },
    },
    {
      id: "open_10_improvements",
      title: "🚀 10대 UI/UX 보완점 리포트 보기",
      subtitle: "모바일 & 노트북 최적화 및 최신 트렌드 적용현황",
      icon: Sparkles,
      action: () => {
        if (onOpen10Improvements) onOpen10Improvements();
        onClose();
      },
    },
    {
      id: "open_bot",
      title: "AI 카카오톡 챗봇 열기",
      subtitle: "실시간 기사 질의응답 및 언론 수호 AI 비서",
      icon: Bot,
      action: () => {
        if (onOpenKakaoBot) onOpenKakaoBot();
        onClose();
      },
    },
    {
      id: "toggle_viewport",
      title: isSimulatedMobileView ? "💻 노트북/웹 화면으로 전환" : "📱 모바일 화면으로 전환",
      subtitle: "접속 단말기 최적화 스마트 뷰포트 변경",
      icon: isSimulatedMobileView ? Laptop : Smartphone,
      action: () => {
        if (onToggleSimulatedMobileView) onToggleSimulatedMobileView();
        onClose();
      },
    },
    {
      id: "toggle_theme",
      title: theme === "dark" ? "☀️ 라이트 모드로 전환" : "🌙 다크 모드로 전환",
      subtitle: "눈이 편안한 디스플레이 테마 모드 토글",
      icon: theme === "dark" ? Sun : Moon,
      action: () => {
        if (onToggleTheme) onToggleTheme();
        onClose();
      },
    },
  ];

  const popularSearches = [
    "중앙은행 핀테크",
    "소울센터 기고",
    "비건 AI 무비",
    "이솔AI 엔진",
    "기후변화 협약",
    "웹툰 공모전",
  ];

  const filteredActions = query.trim()
    ? quickActions.filter(
        (a) =>
          a.title.toLowerCase().includes(query.toLowerCase()) ||
          a.subtitle.toLowerCase().includes(query.toLowerCase())
      )
    : quickActions;

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filteredActions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredActions.length) % filteredActions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filteredActions[selectedIndex]) {
        filteredActions[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="fixed inset-0 z-[290] flex items-start justify-center pt-16 md:pt-24 px-4 bg-black/70 backdrop-blur-md"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: -20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: -20 }}
          transition={{ duration: 0.15 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl max-w-xl w-full shadow-2xl overflow-hidden text-left"
        >
          {/* Top Search Input */}
          <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3 bg-zinc-50/50 dark:bg-zinc-900/40">
            <Command size={20} className="text-amber-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSelectedIndex(0);
              }}
              onKeyDown={handleKeyDown}
              placeholder="무엇이든 검색하세요 (예: 속보, 비건, AI, 테마 전환)..."
              className="w-full bg-transparent text-sm font-bold text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X size={16} />
              </button>
            )}
            <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono text-zinc-400 bg-zinc-200/60 dark:bg-zinc-800 rounded border border-zinc-300/50 dark:border-zinc-700">
              ESC
            </kbd>
          </div>

          {/* Popular searches row */}
          {!query && (
            <div className="px-5 py-3 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/20 dark:bg-zinc-900/20 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest shrink-0 flex items-center gap-1">
                <TrendingUp size={11} /> 인기 검색어:
              </span>
              {popularSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onSearchSubmit(term);
                    onNavigatePage("isol-post");
                    onClose();
                  }}
                  className="px-2.5 py-1 text-[11px] font-bold text-zinc-600 dark:text-zinc-300 hover:text-amber-500 dark:hover:text-amber-400 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-lg shrink-0 transition-colors cursor-pointer"
                >
                  {term}
                </button>
              ))}
            </div>
          )}

          {/* Action List */}
          <div className="max-h-[360px] overflow-y-auto p-2 space-y-1">
            {filteredActions.length === 0 ? (
              <div className="p-8 text-center text-zinc-400 space-y-2">
                <Search size={32} className="mx-auto opacity-30" />
                <p className="text-xs font-bold">'{query}'에 대한 커맨드를 찾을 수 없습니다.</p>
                <button
                  onClick={() => {
                    onSearchSubmit(query);
                    onNavigatePage("isol-post");
                    onClose();
                  }}
                  className="px-4 py-2 bg-amber-500 text-black font-black text-xs rounded-xl shadow mt-2 cursor-pointer"
                >
                  뉴스 키워드로 직접 검색하기
                </button>
              </div>
            ) : (
              filteredActions.map((action, idx) => {
                const Icon = action.icon;
                const isSelected = idx === selectedIndex;
                return (
                  <div
                    key={action.id}
                    onClick={action.action}
                    onMouseEnter={() => setSelectedIndex(idx)}
                    className={`p-3 rounded-2xl flex items-center justify-between transition-colors cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400"
                        : "hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isSelected
                            ? "bg-amber-500 text-black font-bold"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400"
                        }`}
                      >
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-black truncate">{action.title}</p>
                        <p className="text-[10px] text-zinc-400 truncate">{action.subtitle}</p>
                      </div>
                    </div>
                    <ArrowRight
                      size={14}
                      className={`shrink-0 transition-transform ${
                        isSelected ? "translate-x-1 text-amber-500" : "opacity-0"
                      }`}
                    />
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Guide */}
          <div className="p-3 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40 flex items-center justify-between text-[10px] text-zinc-400 font-semibold px-5">
            <div className="flex items-center gap-3">
              <span><kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">↑↓</kbd> 이동</span>
              <span><kbd className="font-mono bg-zinc-200 dark:bg-zinc-800 px-1 rounded">↵</kbd> 선택</span>
            </div>
            <span>스마트 커맨드 팔레트 V2</span>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
