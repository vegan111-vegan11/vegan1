import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Send, ShieldCheck, Building2, HelpCircle, FileText, CheckCircle, Image, Globe, Calendar, Megaphone } from "lucide-react";
import { addDoc, collection } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";
import { toast } from "sonner";

interface CorporateAdApplyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CorporateAdApplyModal: React.FC<CorporateAdApplyModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    companyName: "",
    advertiser: "",
    contact: "",
    title: "",
    imageUrl: "",
    targetUrl: "",
    position: "gnb_top" as "gnb_top" | "inline_article" | "sidebar" | "footer_top",
    period: "1개월",
    notes: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.companyName ||
      !formData.advertiser ||
      !formData.contact ||
      !formData.title ||
      !formData.imageUrl ||
      !formData.targetUrl
    ) {
      toast.error("⚠️ 필수 입력사항이 유실되었습니다. 성실하게 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    const toastId = toast.loading("🗳️ 광고 제휴 제안서 암호화 송출 중...");

    try {
      const applicationPayload = {
        companyName: formData.companyName,
        advertiser: formData.advertiser,
        contact: formData.contact,
        title: formData.title,
        imageUrl: formData.imageUrl,
        targetUrl: formData.targetUrl,
        position: formData.position,
        period: formData.period,
        status: "pending",
        notes: formData.notes,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "banner_applications"), applicationPayload);
      
      toast.success("✨ 광고 집행 제안서가 안전하게 접수되었습니다! 심사위원회에서 신속히 검토하겠습니다.", { id: toastId });
      setIsSuccess(true);
      
      // Reset form
      setFormData({
        companyName: "",
        advertiser: "",
        contact: "",
        title: "",
        imageUrl: "",
        targetUrl: "",
        position: "gnb_top",
        period: "1개월",
        notes: "",
      });
    } catch (err: any) {
      console.error(err);
      handleFirestoreError(err, OperationType.CREATE, "banner_applications");
      toast.error(`⚠️ 송출 실패: ${err.message || err}`, { id: toastId });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-zinc-950/80 backdrop-blur-md"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-zinc-900 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl z-10 text-left font-sans"
          >
            {/* Top Branding Accent Bar */}
            <div className="h-1.5 bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-500 w-full" />

            {/* Header */}
            <div className="p-6 border-b border-zinc-800 flex justify-between items-start">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span className="text-[9px] font-black tracking-widest text-amber-500 uppercase">
                    IsolNews Brand Partnership Center
                  </span>
                </div>
                <h3 className="text-xl font-black text-white mt-1">
                  기업·관공서 광고 제휴 및 배너 신청
                </h3>
                <p className="text-xs text-zinc-400 mt-1">
                  이솔뉴스는 공공성, 신뢰도, 투명한 상생 협력의 가치에 준하는 파트너사를 환영합니다.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="p-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {isSuccess ? (
                <div className="text-center py-10 space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                    <CheckCircle className="text-emerald-500 w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h4 className="text-lg font-black text-white">광고 제의서 접수 완료</h4>
                    <p className="text-xs text-zinc-400 leading-relaxed max-w-md mx-auto">
                      신청하신 배너 세부정보가 보안 서신을 통해 심의관 대표 옴부즈맨 메일함으로 즉각 송고되었습니다. 등록번호가 발행되었으며, 24시간 이내 연락처로 연락드리겠습니다.
                    </p>
                  </div>
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setIsSuccess(false);
                        onClose();
                      }}
                      className="px-6 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                    >
                      창 닫기
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 text-xs text-zinc-300">
                  {/* Alert Banner */}
                  <div className="p-4 rounded-2xl bg-zinc-950/60 border border-zinc-800 flex gap-3">
                    <Megaphone size={18} className="text-amber-500 shrink-0 mt-0.5" />
                    <p className="leading-relaxed text-zinc-400">
                      이솔뉴스 인터넷신문위원회 자율 규약에 따라 선정적 광고, 사행성 오락 등 미풍양속을 저해하는 소재는 자동 심사 반려됩니다. <strong className="text-amber-500">이솔나라 공익 기조</strong>에 정합하는 제안을 권장합니다.
                    </p>
                  </div>

                  {/* Section 1: Brand Info */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                      <Building2 size={12} className="text-amber-500" />
                      01. 광고주 및 대리인 정보
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">신청 기업 / 관공서명 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="예: 이솔나라 국방부, (주)이솔테크"
                          value={formData.companyName}
                          onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                          className="w-full p-3 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-bold text-white transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">담당 주무관 / 대리인명 <span className="text-red-500">*</span></label>
                        <input
                          type="text"
                          required
                          placeholder="예: 홍길동 팀장"
                          value={formData.advertiser}
                          onChange={(e) => setFormData({ ...formData, advertiser: e.target.value })}
                          className="w-full p-3 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-bold text-white transition-colors"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">소통 채널 (이메일 및 전화번호) <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="예: brand@isol.govt.kr / 02-1234-5678"
                        value={formData.contact}
                        onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                        className="w-full p-3 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-bold text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Section 2: Banner Details */}
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase text-zinc-500 tracking-wider flex items-center gap-1.5 border-b border-zinc-800 pb-1.5">
                      <FileText size={12} className="text-indigo-500" />
                      02. 배너 세부 기획
                    </h4>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">광고 및 캠페인 타이틀 <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        required
                        placeholder="예: 2026 이솔나라 과학인재 양성 장학생 선발 캠페인"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full p-3 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-bold text-white transition-colors"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">소재 이미지 URL <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="https://images.unsplash.com/..."
                            value={formData.imageUrl}
                            onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                            className="w-full p-3 pl-9 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-mono text-white transition-colors"
                          />
                          <Image size={13} className="absolute left-3 top-4 text-zinc-500" />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">클릭 시 연결될 랜딩 타겟 URL <span className="text-red-500">*</span></label>
                        <div className="relative">
                          <input
                            type="text"
                            required
                            placeholder="https://www.isol.govt.kr"
                            value={formData.targetUrl}
                            onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
                            className="w-full p-3 pl-9 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-mono text-white transition-colors"
                          />
                          <Globe size={13} className="absolute left-3 top-4 text-zinc-500" />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">희망 노출 레이아웃 위치 <span className="text-red-500">*</span></label>
                        <select
                          value={formData.position}
                          onChange={(e) => setFormData({ ...formData, position: e.target.value as any })}
                          className="w-full p-3 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-bold text-white transition-colors cursor-pointer"
                        >
                          <option value="gnb_top">상단 GNB 영역 adjacent (728x90 권장)</option>
                          <option value="inline_article">기사 본문 하단 인라인 (800x120 권장)</option>
                          <option value="sidebar">우측 사이드바 위젯 (300x250 권장)</option>
                          <option value="footer_top">하단 푸터 상단 전폭 배너 (1200x150 권장)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">희망 집행 기간 <span className="text-red-500">*</span></label>
                        <select
                          value={formData.period}
                          onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                          className="w-full p-3 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-bold text-white transition-colors cursor-pointer"
                        >
                          <option value="1주일">1주일 체험 게재 (시범 운영)</option>
                          <option value="1개월">1개월 정기 송출 (추천)</option>
                          <option value="3개월">3개월 중기 캠페인 (5% 감면)</option>
                          <option value="6개월">6개월 장기 캠페인 (15% 감면)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-zinc-400 mb-1.5">기타 요청사항 및 정산 관련 비고 (선택)</label>
                      <textarea
                        placeholder="예: 공익성 세금계산서 발급 여부 및 특별 송출 스케줄 요청 등"
                        rows={3}
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-3 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-amber-500 rounded-xl font-medium text-white transition-colors"
                      />
                    </div>
                  </div>

                  {/* Submission actions */}
                  <div className="flex gap-3 justify-end pt-4 border-t border-zinc-800">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-5 py-2.5 bg-zinc-800 hover:bg-zinc-750 text-zinc-400 hover:text-white rounded-xl font-bold transition-all cursor-pointer"
                    >
                      취소
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-zinc-950 rounded-xl font-black transition-all flex items-center gap-2 cursor-pointer shadow-lg shadow-amber-500/15 disabled:opacity-50"
                    >
                      <Send size={13} />
                      {isSubmitting ? "송출 통신 중..." : "제안서 안전 송고 제출"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
