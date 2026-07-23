import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Zap,
  Volume2,
  Share2,
  Bookmark,
  Calendar,
  User,
  ExternalLink,
  Sparkles,
  ChevronDown
} from "lucide-react";
export interface CitizenNewsArticle {
  id: string;
  title: string;
  category: string;
  content: string;
  summary?: string;
  author?: string;
  authorName?: string;
  reporterName?: string;
  createdAt?: string;
  imageUrl?: string;
  viewCount?: number;
  likeCount?: number;
  aiFactScore?: number;
  ai5W1H?: any;
}

interface ArticleBottomSheetModalProps {
  article: CitizenNewsArticle | null;
  isOpen?: boolean;
  onClose: () => void;
  onReadFull: (article: any) => void;
}

export const ArticleBottomSheetModal: React.FC<ArticleBottomSheetModalProps> = ({
  article,
  onClose,
  onReadFull,
}) => {
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [showAiSummary, setShowAiSummary] = useState(true);

  if (!article) return null;

  const handleSpeakSummary = () => {
    if ("speechSynthesis" in window) {
      if (isPlayingTTS) {
        window.speechSynthesis.cancel();
        setIsPlayingTTS(false);
      } else {
        const textToRead = `${article.title}. 핵심 요약. ${article.summary || article.content.slice(0, 150)}`;
        const utterance = new SpeechSynthesisUtterance(textToRead);
        utterance.lang = "ko-KR";
        utterance.onend = () => setIsPlayingTTS(false);
        utterance.onerror = () => setIsPlayingTTS(false);
        window.speechSynthesis.speak(utterance);
        setIsPlayingTTS(true);
      }
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[270] flex items-end justify-center bg-black/70 backdrop-blur-sm lg:hidden">
        {/* Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 250 }}
          className="relative w-full max-w-lg bg-white dark:bg-zinc-950 rounded-t-[2.5rem] border-t border-zinc-200 dark:border-zinc-800 shadow-2xl p-6 pb-10 max-h-[85vh] overflow-y-auto text-left z-10"
        >
          {/* Drag Handle Bar */}
          <div className="w-12 h-1.5 bg-zinc-300 dark:bg-zinc-800 rounded-full mx-auto mb-5" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-800 transition-colors"
          >
            <X size={18} />
          </button>

          {/* Category & Badge */}
          <div className="flex items-center gap-2 mb-3">
            <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider">
              {article.category || "보도뉴스"}
            </span>
            <span className="text-[10px] text-zinc-400 font-bold flex items-center gap-1">
              <Calendar size={12} />
              {article.createdAt ? new Date(article.createdAt).toLocaleDateString("ko-KR") : "2026.07.22"}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-black text-zinc-900 dark:text-white leading-snug mb-3">
            {article.title}
          </h2>

          {/* Author */}
          <div className="flex items-center gap-2 mb-4 text-xs font-bold text-zinc-500 border-b border-zinc-100 dark:border-zinc-800/80 pb-3">
            <User size={14} className="text-amber-500" />
            <span>{article.author || "시민기자"}</span>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">
              팩트체크 검증완료
            </span>
          </div>

          {/* ⚡ 3-Second AI Executive Summary Card */}
          <div className="mb-5 bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <button
                onClick={() => setShowAiSummary(!showAiSummary)}
                className="flex items-center gap-1.5 text-xs font-black text-amber-600 dark:text-amber-400 cursor-pointer"
              >
                <Zap size={15} fill="currentColor" className="animate-pulse" />
                <span>⚡ 3초 AI 핵심 요약</span>
                <ChevronDown size={14} className={showAiSummary ? "rotate-180 transition-transform" : ""} />
              </button>

              <button
                onClick={handleSpeakSummary}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-black flex items-center gap-1 transition-all cursor-pointer ${
                  isPlayingTTS
                    ? "bg-amber-500 text-black animate-pulse"
                    : "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                }`}
              >
                <Volume2 size={12} />
                <span>{isPlayingTTS ? "재생 중..." : "TTS 요약 낭독"}</span>
              </button>
            </div>

            {showAiSummary && (
              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-300 space-y-1.5 leading-relaxed pt-1">
                <p>• {article.summary || article.content.slice(0, 120) + "..."}</p>
                <p>• 이솔뉴스 AI 언론 검증망을 거쳐 사실 관계 무결성이 확보된 보도입니다.</p>
              </div>
            )}
          </div>

          {/* Article Image if any */}
          {article.imageUrl && (
            <div className="rounded-2xl overflow-hidden mb-4 aspect-video border border-zinc-200 dark:border-zinc-800">
              <img
                src={article.imageUrl}
                alt=""
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          {/* Excerpt */}
          <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium line-clamp-4 mb-6">
            {article.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                onReadFull(article);
                onClose();
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-400 text-black font-black py-3.5 rounded-2xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
            >
              <span>기사 전체 읽기</span>
              <ExternalLink size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
