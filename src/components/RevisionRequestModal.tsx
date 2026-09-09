import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, FileText, CheckCircle2, AlertCircle, Sparkles, MessageSquare, User, Tag, Camera, Upload, Image as ImageIcon } from "lucide-react";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase";
import { toast } from "sonner";

export interface RevisionTargetArticle {
  id: string;
  title: string;
  author: string;
  category?: string;
  content?: string;
  thumbnail?: string;
  reporterId?: string;
}

interface RevisionRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  article: RevisionTargetArticle | null;
  currentUser?: {
    uid?: string;
    email?: string | null;
    displayName?: string | null;
  } | null;
  onSuccess?: () => void;
}

export const RevisionRequestModal: React.FC<RevisionRequestModalProps> = ({
  isOpen,
  onClose,
  article,
  currentUser,
  onSuccess,
}) => {
  const [category, setCategory] = useState("오타/맞춤법/비문 교정");
  const [revisionNote, setRevisionNote] = useState("");
  const [revisedTitle, setRevisedTitle] = useState("");
  const [revisedContent, setRevisedContent] = useState("");
  const [revisedThumbnail, setRevisedThumbnail] = useState("");
  const [requesterName, setRequesterName] = useState(
    currentUser?.displayName || (currentUser?.email ? currentUser.email.split("@")[0] : "")
  );
  const [requesterContact, setRequesterContact] = useState(currentUser?.email || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showContentEditor, setShowContentEditor] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleImageFile = (file: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일(JPG, PNG, WebP 등)만 첨부할 수 있습니다.");
      return;
    }
    if (file.size > 25 * 1024 * 1024) {
      toast.error("사진 파일 크기가 25MB를 초과합니다. 보다 가벼운 사진을 선택해주세요.");
      return;
    }
    const toastId = toast.loading("📷 교체용 사진을 최적화 압축 중...");
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target?.result as string;
      if (!rawData) {
        toast.error("사진 데이터를 읽어오지 못했습니다.", { id: toastId });
        return;
      }
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 800;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_WIDTH) {
              height = Math.round((height * MAX_WIDTH) / width);
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width = Math.round((width * MAX_HEIGHT) / height);
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = "high";
            ctx.drawImage(img, 0, 0, width, height);
            let compressed = canvas.toDataURL("image/jpeg", 0.8);
            if (compressed.length > 400000) {
              compressed = canvas.toDataURL("image/jpeg", 0.65);
            }
            setRevisedThumbnail(compressed);
            toast.success("📷 교체용 사진이 성공적으로 최적화 첨부되었습니다!", { id: toastId });
            return;
          }
        } catch (err) {
          console.warn("Canvas compression error:", err);
        }
        if (rawData.length > 900000) {
          toast.error("사진 해상도가 너무 높아 압축에 실패했습니다. 다른 사진을 선택해 주세요.", { id: toastId });
          return;
        }
        setRevisedThumbnail(rawData);
        toast.success("📷 교체용 사진이 첨부되었습니다.", { id: toastId });
      };
      img.onerror = () => {
        toast.error("사진 형식을 해석할 수 없습니다. 유효한 이미지 파일을 선택해 주세요.", { id: toastId });
      };
      img.src = rawData;
    };
    reader.onerror = () => {
      toast.error("사진 파일을 읽는 도중 오류가 발생했습니다.", { id: toastId });
    };
    reader.readAsDataURL(file);
  };

  if (!isOpen || !article) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!revisionNote.trim()) {
      toast.error("수정 또는 정정이 필요한 사유를 입력해 주세요.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("편집국 데스크로 수정 요청을 접수하는 중...");

    try {
      const newsRef = doc(db, "citizen_news", article.id);
      const requesterIdentifier = requesterName.trim()
        ? `${requesterName.trim()}${requesterContact.trim() ? ` (${requesterContact.trim()})` : ""}`
        : currentUser?.email || "익명 독자/기자";

      const updates: Record<string, any> = {
        status: "revision",
        revisionCategory: category,
        revisionNote: revisionNote.trim(),
        requestedBy: requesterIdentifier,
        requestedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      if (revisedTitle.trim()) {
        updates.requestedTitle = revisedTitle.trim();
      }
      if (revisedContent.trim()) {
        updates.requestedContent = revisedContent.trim();
      }
      if (revisedThumbnail.trim()) {
        updates.requestedThumbnail = revisedThumbnail.trim();
      }

      await updateDoc(newsRef, updates);

      toast.success("✨ 기사 수정 요청이 관리자 데스크로 성공적으로 접수되었습니다. 검토 후 신속히 반영됩니다.", {
        id: toastId,
        duration: 4000,
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      console.error("Revision request error:", err);
      toast.error("수정 요청 접수 중 오류가 발생했습니다. 다시 시도해 주세요.", { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = [
    { id: "오타/맞춤법/비문 교정", label: "📝 오타 / 맞춤법 교정", desc: "오탈자나 문맥상 어색한 표현 정돈" },
    { id: "사실관계/팩트 정정", label: "⚖️ 사실관계 / 팩트 정정", desc: "수치, 인명, 연도 등 오보 정정" },
    { id: "취재 내용 추가 및 보완", label: "➕ 취재 내용 추가/보완", desc: "추가 인터뷰나 새로운 후속 정보 반영" },
    { id: "사진/미디어 자료 교체", label: "🖼️ 사진 / 미디어 교체", desc: "고화질 사진 교체 또는 저작권 안내" },
    { id: "기명/소속 표기 정정", label: "👤 기명 / 소속 표기 정정", desc: "작성자 기자명 또는 취재 소속 변경" },
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[300] flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-white dark:bg-[#111116] border border-zinc-200 dark:border-zinc-800 rounded-3xl sm:rounded-[2rem] shadow-2xl p-5 sm:p-7 z-10 overflow-hidden space-y-5 my-auto"
        >
          {/* Top Header */}
          <div className="flex items-start justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
            <div className="space-y-1 text-left">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-red-500/10 text-red-650 dark:text-red-450 text-[10px] font-black rounded-md uppercase tracking-wider">
                  EDITORIAL DESK REVISION
                </span>
                <span className="text-[10px] font-bold text-zinc-400">
                  실시간 데스크 심사
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-zinc-900 dark:text-zinc-50 tracking-tight flex items-center gap-1.5">
                <MessageSquare size={18} className="text-red-500" />
                기사 수정 및 정정 요청
              </h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Target Article Summary Card */}
          <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900/60 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 text-left space-y-1.5">
            <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-400">
              <FileText size={12} className="text-orange-500" />
              <span>대상 기사</span>
              <span className="text-zinc-300 dark:text-zinc-700">•</span>
              <span>작성자: {article.author} 기자</span>
            </div>
            <p className="text-xs sm:text-sm font-black text-zinc-800 dark:text-zinc-200 line-clamp-2">
              {article.title}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            {/* 1. Category Selection */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-[11px] font-black text-zinc-700 dark:text-zinc-300">
                <Tag size={13} className="text-red-500" />
                수정 / 정정 유형 선택
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {categories.map((c) => {
                  const isSelected = category === c.id;
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => setCategory(c.id)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-red-500/10 border-red-500 text-red-700 dark:text-red-400 font-black shadow-xs"
                          : "bg-zinc-50 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800/80 text-zinc-600 dark:text-zinc-400 font-bold hover:border-zinc-300"
                      }`}
                    >
                      <div className="text-xs">{c.label}</div>
                      <div className="text-[10px] text-zinc-400 font-normal mt-0.5 truncate">
                        {c.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. Revision Reason (Required) */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-1.5 text-[11px] font-black text-zinc-700 dark:text-zinc-300">
                  <AlertCircle size={13} className="text-amber-500" />
                  수정 / 정정 사유 및 요청 상세 (필수)
                </label>
                <span className="text-[10px] font-bold text-zinc-400">
                  {revisionNote.length}자
                </span>
              </div>
              <textarea
                required
                rows={3}
                value={revisionNote}
                onChange={(e) => setRevisionNote(e.target.value)}
                placeholder="예: '본문 3번째 문단의 수치가 500억원으로 잘못 표기되어 50억원으로 정정 요청합니다.', '오탈자 및 추가 취재 내용 반영 요망'"
                className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-3 text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:border-red-500 transition-all font-sans leading-relaxed"
              />
            </div>

            {/* 3. Optional Detailed Content / Title toggle */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => {
                  if (!showContentEditor && !revisedContent && article.content) {
                    setRevisedContent(article.content);
                  }
                  setShowContentEditor(!showContentEditor);
                }}
                className="text-[11px] font-bold text-zinc-500 hover:text-red-500 flex items-center gap-1 cursor-pointer transition-colors"
              >
                <Sparkles size={12} className="text-red-500" />
                <span>{showContentEditor ? "▼ 수정 본문/헤드라인 직접 입력 닫기" : "▶ 수정할 제목 또는 본문 전체 직접 작성하기 (선택)"}</span>
              </button>

              {showContentEditor && (
                <div className="mt-2.5 p-3.5 bg-zinc-50 dark:bg-zinc-900/40 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-3 animate-in fade-in duration-200">
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                      수정 희망 기사 제목 (변경 시에만 입력)
                    </label>
                    <input
                      type="text"
                      value={revisedTitle}
                      onChange={(e) => setRevisedTitle(e.target.value)}
                      placeholder={article.title}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                      수정 희망 기사 본문
                    </label>
                    <textarea
                      rows={5}
                      value={revisedContent}
                      onChange={(e) => setRevisedContent(e.target.value)}
                      placeholder="수정된 전체 본문 내용을 입력해 주시면 관리자 데스크 승인 시 즉각 교체됩니다."
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 font-serif leading-relaxed"
                    />
                  </div>

                  {/* Optional Photo Replacement */}
                  <div>
                    <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-wider mb-1">
                      교체할 대표 사진 첨부 (선택)
                    </label>

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                        e.target.value = "";
                      }}
                    />
                    <input
                      ref={cameraInputRef}
                      type="file"
                      accept="image/*"
                      capture="environment"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageFile(file);
                        e.target.value = "";
                      }}
                    />

                    {revisedThumbnail ? (
                      <div className="relative rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800 h-28 group bg-zinc-100 dark:bg-zinc-900">
                        <img
                          src={revisedThumbnail}
                          alt="교체 사진 미리보기"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setRevisedThumbnail("")}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-black/70 hover:bg-black text-white text-xs transition-colors cursor-pointer"
                          title="사진 제거"
                        >
                          <X size={14} />
                        </button>
                        <div className="absolute bottom-1 left-2 bg-black/60 px-2 py-0.5 rounded text-[9px] text-white font-bold">
                          ✓ 교체 사진 첨부됨
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <Upload size={13} className="text-red-500" />
                            <span>📁 앨범 선택</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => cameraInputRef.current?.click()}
                            className="py-2 px-3 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-red-500 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 flex items-center justify-center gap-1.5 cursor-pointer transition-all active:scale-95"
                          >
                            <Camera size={13} className="text-amber-500" />
                            <span>📸 카메라 촬영</span>
                          </button>
                        </div>
                        <input
                          type="url"
                          value={revisedThumbnail}
                          onChange={(e) => setRevisedThumbnail(e.target.value)}
                          placeholder="또는 교체 이미지 웹 링크 (https://...)"
                          className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500 placeholder:text-zinc-400"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 4. Requester info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div>
                <label className="flex items-center gap-1 text-[10px] font-black text-zinc-500 dark:text-zinc-400 mb-1">
                  <User size={11} /> 신청자 성명 / 닉네임
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="예: 홍길동 (독자 또는 기자)"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
                />
              </div>
              <div>
                <label className="flex items-center gap-1 text-[10px] font-black text-zinc-500 dark:text-zinc-400 mb-1">
                  📧 연락처 / 이메일 (피드백용)
                </label>
                <input
                  type="text"
                  value={requesterContact}
                  onChange={(e) => setRequesterContact(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900 dark:text-zinc-100 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-2.5 pt-3 border-t border-zinc-100 dark:border-zinc-800">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="flex-1 py-3 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 font-bold rounded-2xl text-xs transition-colors cursor-pointer"
              >
                닫기
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-[2] py-3 bg-gradient-to-r from-red-650 to-rose-600 hover:from-red-600 hover:to-rose-500 text-white font-black rounded-2xl text-xs shadow-lg shadow-red-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>접수 처리 중...</span>
                  </>
                ) : (
                  <>
                    <Send size={14} />
                    <span>데스크로 수정 요청 제출</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
