import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Smartphone,
  Laptop,
  CheckCircle2,
  Sparkles,
  Command,
  Zap,
  Volume2,
  Moon,
  TrendingUp,
  Sliders,
  SlidersHorizontal,
  ChevronRight,
  Layers,
  Edit3,
  ShieldCheck,
  SmartphoneNfc,
  Check,
  ListOrdered,
  Search,
  Filter
} from "lucide-react";

interface UIUXImprovementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  isSimulatedMobileView: boolean;
  onToggleSimulatedMobileView: () => void;
  onOpenCommandPalette?: () => void;
  onOpenMobileArticleWriter?: () => void;
  onOpenMobileAdminPad?: () => void;
}

export const UIUXImprovementsModal: React.FC<UIUXImprovementsModalProps> = ({
  isOpen,
  onClose,
  isSimulatedMobileView,
  onToggleSimulatedMobileView,
  onOpenCommandPalette,
  onOpenMobileArticleWriter,
  onOpenMobileAdminPad,
}) => {
  const [activeTab, setActiveTab] = useState<"top10" | "mobile" | "web" | "admin" | "trend" | "list100">("top10");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [checklistFilterCategory, setChecklistFilterCategory] = useState<"all" | "mobile" | "web" | "admin" | "trend">("all");
  const [checklistSearch, setChecklistSearch] = useState("");

  if (!isOpen) return null;

  // 10대 핵심 보완점
  const top10Improvements = [
    {
      id: 1,
      category: "mobile",
      categoryName: "📱 모바일 최적화",
      title: "1손 엄지 터치 내비게이션 & 바텀 시트 (Bottom Sheet) 모달",
      desc: "모바일 화면 전용 Sticky Bottom Bar와 iOS/Android 스타일 하단 슬라이드업 드로어로 한 손 조작성을 극대화했습니다.",
      details: [
        "48px 이상 엄지 친화적 터치 피드백 영역 확보",
        "기사 빠른 보기 시 하단에서 부드럽게 올라오는 Bottom Sheet 적용",
        "활성 탭 물결 인디케이터 애니메이션 지원"
      ],
      icon: Smartphone,
      status: "완료",
      tag: "Mobile UI"
    },
    {
      id: 2,
      category: "web",
      categoryName: "💻 노트북/웹 최적화",
      title: "Bento Grid 레이아웃 & Split-Pane 기사 이중 뷰어",
      desc: "대형 스크린을 활용한 비대칭 벤토 그리드 및 기사 목록을 보면서 본문을 동시에 읽는 이중 스플릿 레이아웃.",
      details: [
        "1280px 이상 가로 분할 Dual Pane 리더 지원",
        "문맥 유지한 채 목록 스크롤 & 실시간 기사 전환",
        "비대칭 Bento Grid 구조로 주요 속보 가독성 향상"
      ],
      icon: Laptop,
      status: "완료",
      tag: "Web Layout"
    },
    {
      id: 3,
      category: "admin",
      categoryName: "✍️ 모바일 기사작성 & 관리자 UX",
      title: "핸드폰 전용 모바일 1-Tap 기사 작성 & 빠른 편집 패널",
      desc: "모바일 화면에서 한 손으로 쉽게 기사를 작성/수정하고 AI 헤드라인 교정 및 1-Tap 상태 변경을 지원합니다.",
      details: [
        "모바일 카메라 / 음성 입력 / AI 자동 요약 작성 스튜디오",
        "기사 카드 및 읽기 화면 상단 1-Tap 모바일 관리자 컨트롤러",
        "승인/보류/수정 상태의 즉각적인 모바일 Bottom Sheet 조작"
      ],
      icon: Edit3,
      status: "완료",
      tag: "Mobile Admin"
    },
    {
      id: 4,
      category: "web",
      categoryName: "💻 노트북/웹 최적화",
      title: "스마트 커맨드 팔레트 (Ctrl + K 인스턴트 검색)",
      desc: "키보드 shortcut(Ctrl+K)으로 즉시 열리는 검색 팔레트. 카테고리 이동, 테마 변경, AI 챗봇 연결을 한 번에 실행합니다.",
      details: [
        "Ctrl + K / Cmd + K 단축키 모달 리스너",
        "최근 검색어 자동 저장 및 카테고리 핫키 지원",
        "키보드 Arrow Key 및 Enter 탐색 가능"
      ],
      icon: Command,
      status: "완료",
      tag: "Keyboard UI"
    },
    {
      id: 5,
      category: "trend",
      categoryName: "⚡ 최신 트렌드",
      title: "⚡ 3초 AI 핵심 요약 (3-Line Executive Summary)",
      desc: "모든 보도 기사에 요약 접기/펼치기 아코디언, 핵심 키워드 태그, TTS 오디오 음성 브리핑을 탑재했습니다.",
      details: [
        "AI 자동 추출 3줄 가독성 텍스트 블록",
        "Web Speech API 기반 실시간 TTS 음성 낭독",
        "핵심 주제 키워드 자동 하이라이트"
      ],
      icon: Zap,
      status: "완료",
      tag: "AI Intelligence"
    },
    {
      id: 6,
      category: "mobile",
      categoryName: "📱 모바일 최적화",
      title: "스마트 해상도 자동 감지 & 뷰포트 수동 전환 스위처",
      desc: "접속 단말기 해상도(window.innerWidth)를 자동 감지하고, 단 한 번의 클릭으로 모바일/웹 모드를 자유롭게 전환합니다.",
      details: [
        "ResizeObserver 기반 실시간 뷰포트 트래킹",
        "상단 헤더 & Floating Action Button 모드 토글 지원",
        "1:1 프레임 모바일 시뮬레이터 샌드박스 완비"
      ],
      icon: Sliders,
      status: "완료",
      tag: "Viewport"
    },
    {
      id: 7,
      category: "trend",
      categoryName: "⚡ 최신 트렌드",
      title: "OLED Pure Black & 시력보호 눈부심 방지 테마",
      desc: "모바일 배터리 절약을 위한 순수 OLED Black 테마와 모니터 눈부심을 완화하는 시력보호 다크 테마 완비.",
      details: [
        "System / Light / Dark / OLED Pure Black 3단계 테마",
        "contrast 4.5:1 이상 WCAG AA 준수 고대비 컬러 매핑",
        "야간독서 시력보호 난반사 필터링"
      ],
      icon: Moon,
      status: "완료",
      tag: "Visual Design"
    },
    {
      id: 8,
      category: "web",
      categoryName: "💻 노트북/웹 최적화",
      title: "데스크톱 전용 실시간 핫 트렌드 위젯 패널",
      desc: "노트북 웹 화면 우측에 고정된 실시간 인기 검색어 랭킹, 특보 무한 롤링 티커, 온에어 슬라이더 위젯.",
      details: [
        "실시간 트래픽 집계 인기 키워드 TOP 10",
        "온에어 팟캐스트 / 라이브 방송 1-클릭 플레이어",
        "시민 여론조사 팩트체크 실시간 투표 보드"
      ],
      icon: TrendingUp,
      status: "완료",
      tag: "Live Widgets"
    },
    {
      id: 9,
      category: "trend",
      categoryName: "⚡ 최신 트렌드",
      title: "마이크로 인터랙션 & Web Audio 햅틱 사운드 피드백",
      desc: "버튼 클릭, 탭 이동, 스와이프 시 입체적인 청각 햅틱 사운드와 framer-motion 수축 미세 애니메이션을 적용했습니다.",
      details: [
        "Web Audio API 기반 합성 햅틱 클라우드 사운드",
        "spring physics 기반 버튼 눌림 효과",
        "모바일 기기 진동 Haptic feedback 연동"
      ],
      icon: Volume2,
      status: "완료",
      tag: "Interactions"
    },
    {
      id: 10,
      category: "trend",
      categoryName: "⚡ 최신 트렌드",
      title: "관성 스크롤 태그 & UI/UX 100가지 보완 종합 관리 모달",
      desc: "모든 보완 항목 100가지를 사용자가 분야별로 한눈에 확인하고 모바일/웹 최적화 모드를 직접 체감할 수 있는 센터.",
      details: [
        "100가지 항목 분야별 필터링 검색 시스템",
        "모바일 스크린 관성 터치 카테고리 태그 칩",
        "상단 네비게이션 배지 및 하단 FAB 즉시 접속"
      ],
      icon: Sparkles,
      status: "완료",
      tag: "Dashboard"
    }
  ];

  // 100가지 보완점 종합 리스트 생성 (4개 분야 x 25개 = 100개)
  const mobileList = [
    "한 손 조작 영역(Thumb Zone) 최적화 바텀 내비게이션",
    "Swipe-to-Dismiss 모바일 드로어 닫기 제스처",
    "터치 터치 타겟 48px 이상 크기 확보",
    "모바일 카메라 즉시 연동 사진 첨부 스튜디오",
    "Web Speech API 기반 모바일 음성 취재/작성 기능",
    "풀 스크린 모바일 Bottom Sheet 모달 레이아웃",
    "관성 가로 스크롤 태그 카테고리 바",
    "OLED Pure Black 모바일 배터리 절약 모드",
    "모바일 진동 API (Navigator.vibrate) 햅틱 반응",
    "모바일 화면 대칭 마진 및 여백 보정",
    "한 손 터치용 다이렉트 카테고리 필터링",
    "모바일 전용 간편 3초 AI 요약 아코디언",
    "기사 본문 모바일 폰트 스케일러 (A+ / A-)",
    "모바일 가로 회전(Landscape) 대응 레이아웃",
    "Pull-to-Refresh 스타일 모바일 새로고침",
    "모바일 전용 플로팅 Quick-Edit 패널",
    "카톡/라인 1-Tap 간편 모바일 기사 공유",
    "모바일 네트워크 저용량 모드 패스트 로딩",
    "모바일 브라우저 주소창 스크롤 연동 자동 숨김",
    "터치 시 Ripple 물결 인디케이터 반응",
    "모바일 한 손 엄지 전용 뒤로가기 Floating버튼",
    "모바일 기사 읽기 진행률(Reading Progress) 상단 바",
    "모바일 북마크 & 나중에 읽기 1-Tap 저장",
    "모바일 다크모드 가독성 고대비 폰트 컬러 매핑",
    "모바일 전용 홈 화면 PWA 앱 설치 프로모트"
  ];

  const webList = [
    "노트북 대화면 비대칭 Bento Grid 레이아웃",
    "1280px 이상 가로 Split-Pane 기사 이중 뷰어",
    "Ctrl + K / Cmd + K 키보드 스마트 커맨드 팔레트",
    "우측 고정 실시간 인기 검색어 & 핫 트렌드 위젯",
    "마우스 호버 카드 입체 3D Lift 효과",
    "멀티 모니터 가로 폭 대응 max-w-7xl 중앙 정렬",
    "데스크톱 멀티 탭 기사 관리 및 세션 유지",
    "노트북 키보드 Arrow Key 기사 탐색 지원",
    "상단 롤링 뉴스 티커 한눈에 보기 패널",
    "웹 브라우저 마우스 우클릭 팩트체크 컨텍스트 메뉴",
    "기사 본문 이미지 줌 및 라이트박스 (Lightbox) 크기 확대",
    "기사 작성 웹 마크다운 레디 텍스트 에디터",
    "실시간 미디어 온에어 위젯 슬라이더",
    "웹 화면 전용 고해상도 그래픽 차트 데이터 모듈",
    "멀티 칼럼 속보 카드 그리드 응답성",
    "웹 관리자 대시보드 통계 차트 보드",
    "데스크톱 드래그 앤 드롭 이미지 업로드",
    "노트북 가로 화면 패널 가분성 조절 핸들",
    "키보드 Esc 키 즉시 창 닫기 핸들링",
    "다채로운 카테고리 서브 네비게이션 드롭다운",
    "기사 내 키워드 하이라이트 툴팁 호버",
    "웹 브라우저 사이드바 토글 및 고정 모드",
    "노트북 트랙패드 두 손가락 제스처 스와이프",
    "대화면 시력 보호 라이트/다크/세피아 3컬러 모드",
    "웹 전용 인쇄 및 PDF 저장 레이아웃 최적화"
  ];

  const adminList = [
    "모바일 기사 작성 핸드폰 1-Tap 스마트 스튜디오",
    "핸드폰 화면 전용 모바일 1-Tap 기사 Quick-Edit 패널",
    "AI 자동 헤드라인 추출 및 문장 교정 엔진",
    "기사 엠바고 및 예약 발행 시간 설정 모듈",
    "모바일 카메라 직접 사진 촬영 및 캡션 자동 입력",
    "1-Tap 기사 승인 / 보류 / 임시저장 상태 변경",
    "기사 카테고리 & 태그 원터치 모바일 드롭다운",
    "취재 기자 현장 음성 메모 자동 텍스트 변환(STT)",
    "모바일 관리자 뉴스 팩트체크 검증 승인 도구",
    "모바일 현장 취재 기사 GPS 위치 태깅",
    "실시간 조회수 및 모바일 독자 반응 분석 지표",
    "기사 수정 이력(Revision History) 모바일 모니터링",
    "모바일 썸네일 이미지 자동 비율 크롭 도구",
    "댓글 관리 및 모바일 부적절 댓글 1-Tap 블라인드",
    "속보(Breaking News) 모바일 1-Tap 긴급 푸시 알림",
    "기자별 단독/특집 라벨링 Quick 선택기",
    "모바일 음성 기사 낭독(TTS) 미리듣기 테스트",
    "모바일 단독 기사 핀(Pin) 상단 고정 제어",
    "관련 기사 링크 추천 자동 매칭 시스템",
    "저작권 및 인용 출처 자동 하단 생성기",
    "기사 작성 중 모바일 자동 임시 저장(Auto Save)",
    "모바일 현장 취재 사진 워터마크 자동 삽입",
    "관리자 전용 비공개 모바일 미리보기 URL 생성",
    "기사 별 중요도(Primary/Secondary) 슬라이더 조절",
    "모바일 다중 기자 공동 작성 권한 부여"
  ];

  const trendList = [
    "3초 AI 핵심 요약 (3-Line Executive Summary)",
    "Web Audio API 기반 합성 햅틱 클라우드 사운드",
    "유리질감 글래스모피즘(Glassmorphism) 카드 디자인",
    "framer-motion spring physics 미세 애니메이션",
    "WCAG AA 준수 4.5:1 이상 고대비 텍스트 서식",
    "Dynamic Haptic Vibration 피드백 체계",
    "네온 오라 아우라(Glow Accent) 하이라이트",
    "스마트 Web Speech API AI TTS 음성 플레이어",
    "모바일/웹 뷰포트 인스턴트 시뮬레이션 시스템",
    "Bento Box 가변 그리드 모듈 구조",
    "아이콘 모션 반응형 200ms 터치 피드백",
    "최신 Neo-Brutalism + Clean Minimal 퓨전 UI",
    "단말기 시스템 테마 자동 동기화 센서",
    "인스턴트 Toast 메시지 유저 피드백 통지",
    "Skeleton Loading 방지 가짜 데이터 펄스 효과",
    "마이크로 그래디언트 테두리(Border Accent)",
    "텍스트 가독성 최적화 Plus Jakarta Sans 폰트",
    "이미지 레티나 디스플레이 고해상도 매핑",
    "스마트 검색 자동 완성 카테고리 태그",
    "콘텐츠 독서 잔여 시간(Reading Time) 계산기",
    "다크모드 오프라이트 순수 딥 블랙 아키텍처",
    "네이티브 모바일 앱 스타일 Smooth Curve 모서리",
    "인터랙티브 투표 및 실시간 반응 이모지 패널",
    "AI 에이전트 다이얼로그 챗봇 플로팅 도구",
    "전역 상태 보존 UI/UX 100가지 보완 센터"
  ];

  const all100Items = [
    ...mobileList.map((title, i) => ({ id: `m-${i}`, cat: "mobile", catName: "📱 모바일", title })),
    ...webList.map((title, i) => ({ id: `w-${i}`, cat: "web", catName: "💻 노트북/웹", title })),
    ...adminList.map((title, i) => ({ id: `a-${i}`, cat: "admin", catName: "✍️ 기사작성/관리자", title })),
    ...trendList.map((title, i) => ({ id: `t-${i}`, cat: "trend", catName: "⚡ 최신 트렌드", title }))
  ];

  const filtered100Items = all100Items.filter((item) => {
    const matchCat = checklistFilterCategory === "all" || item.cat === checklistFilterCategory;
    const matchSearch = item.title.toLowerCase().includes(checklistSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[280] flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-[2rem] sm:rounded-[2.5rem] max-w-5xl w-full max-h-[92vh] overflow-hidden shadow-2xl flex flex-col text-left"
        >
          {/* Header */}
          <div className="p-5 sm:p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-900/30">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} />
                  2026 UI/UX 100가지 보완 완성
                </span>
                <span className="text-[10px] font-mono text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-full font-bold flex items-center gap-1">
                  <CheckCircle2 size={12} />
                  100 / 100 APPLIED
                </span>
              </div>
              <h2 className="text-lg sm:text-xl md:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                모바일 & 노트북/웹 최적화 UI/UX 보완 센터
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-1">
                모바일 한 손 최적화, 웹 대화면 Bento Grid, 모바일 기사 작성/관리자 전용 UX 및 최신 트렌드가 모두 적용되었습니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Top Banner: Real-time Viewport & Quick Actions */}
          <div className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-5 sm:px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-bold shadow-inner">
            <div className="flex items-center gap-2">
              <Layers size={16} />
              <span>현재 화면 뷰포트: <strong className="underline underline-offset-2">{isSimulatedMobileView ? "📱 모바일 최적화 시뮬레이터 모드" : "💻 노트북/웹 데스크톱 대화면 모드"}</strong></span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => {
                  onToggleSimulatedMobileView();
                }}
                className="bg-black/80 hover:bg-black text-white px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider uppercase transition-all shadow cursor-pointer active:scale-95 flex items-center gap-1.5"
              >
                {isSimulatedMobileView ? <Laptop size={14} className="text-indigo-400" /> : <Smartphone size={14} className="text-blue-400" />}
                <span>{isSimulatedMobileView ? "💻 노트북/웹 화면으로 전환" : "📱 모바일 화면으로 전환"}</span>
              </button>
              {onOpenMobileArticleWriter && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenMobileArticleWriter();
                  }}
                  className="bg-amber-500 hover:bg-amber-600 text-black px-3 py-1.5 rounded-xl text-[11px] font-black tracking-wider transition-all cursor-pointer flex items-center gap-1 shadow"
                >
                  <Edit3 size={13} />
                  <span>📱 모바일 기사 작성기</span>
                </button>
              )}
            </div>
          </div>

          {/* Main Navigation Tabs */}
          <div className="flex px-4 sm:px-6 pt-3 border-b border-zinc-100 dark:border-zinc-800 gap-1.5 overflow-x-auto bg-zinc-50/50 dark:bg-zinc-900/20 no-scrollbar">
            {[
              { id: "top10", label: "🌟 10대 핵심 보완점", icon: Sparkles },
              { id: "list100", label: "💯 100가지 세부 보완 리스트", icon: ListOrdered },
              { id: "admin", label: "✍️ 모바일 기사작성/관리자 UX", icon: ShieldCheck }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3.5 py-2.5 text-xs font-black rounded-t-2xl border-b-2 transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                    activeTab === tab.id
                      ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-white dark:bg-zinc-900 shadow-sm"
                      : "border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                  }`}
                >
                  <Icon size={14} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: 10대 핵심 보완점 */}
          {activeTab === "top10" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {top10Improvements.map((item) => {
                  const Icon = item.icon;
                  const isSelected = selectedItem === item.id;
                  return (
                    <motion.div
                      key={item.id}
                      layout
                      onClick={() => setSelectedItem(isSelected ? null : item.id)}
                      className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                        isSelected
                          ? "bg-amber-500/5 dark:bg-amber-500/10 border-amber-500 shadow-lg"
                          : "bg-white dark:bg-zinc-900/80 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start mb-3">
                          <div className="flex items-center gap-2">
                            <span className="w-7 h-7 rounded-xl bg-amber-500/10 text-amber-500 font-mono font-black text-xs flex items-center justify-center border border-amber-500/20">
                              {String(item.id).padStart(2, "0")}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-md">
                              {item.tag}
                            </span>
                          </div>
                          <span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                            <CheckCircle2 size={12} />
                            {item.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-2.5 mb-2">
                          <Icon size={18} className="text-amber-500 shrink-0" />
                          <h3 className="font-extrabold text-sm text-zinc-900 dark:text-white leading-tight">
                            {item.title}
                          </h3>
                        </div>

                        <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium mb-3">
                          {item.desc}
                        </p>

                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="pt-3 border-t border-zinc-200 dark:border-zinc-800 space-y-1.5 text-[11px] text-zinc-500 dark:text-zinc-400 font-semibold"
                          >
                            {item.details.map((detail, idx) => (
                              <div key={idx} className="flex items-start gap-1.5">
                                <span className="text-amber-500 font-black">•</span>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </motion.div>
                        )}
                      </div>

                      <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/60 flex justify-between items-center text-[10px] font-bold text-zinc-400">
                        <span>{item.categoryName}</span>
                        <span className="flex items-center gap-1 text-amber-500">
                          {isSelected ? "접기" : "상세보기"} <ChevronRight size={12} className={isSelected ? "rotate-90 transition-transform" : ""} />
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 2: 100가지 보완점 종합 체크리스트 */}
          {activeTab === "list100" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Category Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-zinc-100/70 dark:bg-zinc-900/80 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
                  {[
                    { id: "all", label: "전체 (100)" },
                    { id: "mobile", label: "📱 모바일 (25)" },
                    { id: "web", label: "💻 노트북/웹 (25)" },
                    { id: "admin", label: "✍️ 기사작성/관리자 (25)" },
                    { id: "trend", label: "⚡ 최신트렌드 (25)" }
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setChecklistFilterCategory(f.id as any)}
                      className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        checklistFilterCategory === f.id
                          ? "bg-amber-500 text-black shadow-sm font-black"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>

                <div className="relative w-full sm:w-60">
                  <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <input
                    type="text"
                    value={checklistSearch}
                    onChange={(e) => setChecklistSearch(e.target.value)}
                    placeholder="보완 항목 검색..."
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>

              {/* 100 List Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {filtered100Items.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-start gap-2.5 hover:border-amber-500/50 transition-all text-left group"
                  >
                    <span className="w-5 h-5 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="stroke-[3]" />
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="text-[9px] font-mono font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.2 rounded">
                          #{index + 1}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400">
                          {item.catName}
                        </span>
                      </div>
                      <p className="text-xs font-extrabold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-500 transition-colors truncate">
                        {item.title}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: 모바일 기사작성 & 관리자 메뉴 상세 안내 및 빠른 조작 */}
          {activeTab === "admin" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 text-left">
              <div className="bg-gradient-to-br from-amber-500/10 via-orange-500/5 to-purple-500/10 p-6 rounded-3xl border border-amber-500/20">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shadow-lg">
                    <SmartphoneNfc size={22} />
                  </div>
                  <div>
                    <h3 className="text-base font-black text-zinc-900 dark:text-white">
                      📱 모바일 환경 전용 기사 작성 & 수정 관리자 솔루션
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      핸드폰 현장에서 한 손으로 쉽고 빠르게 속보를 작성하고 승인/편집할 수 있습니다.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-extrabold text-xs text-amber-500 mb-1 flex items-center gap-1.5">
                      <Edit3 size={14} /> 1. 모바일 간편 기사 작성기 (Quick Studio)
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      카메라 직접 촬영, 음성 취재 녹음, AI 3초 자동 헤드라인 추출 기능으로 모바일 폰에서 1분 만에 완벽한 보도자료 생성.
                    </p>
                    {onOpenMobileArticleWriter && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenMobileArticleWriter();
                        }}
                        className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-600 text-black font-black text-xs rounded-xl transition-all shadow cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Edit3 size={14} />
                        <span>지금 모바일 기사 작성기 열기</span>
                      </button>
                    )}
                  </div>

                  <div className="p-4 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                    <h4 className="font-extrabold text-xs text-blue-500 mb-1 flex items-center gap-1.5">
                      <ShieldCheck size={14} /> 2. 기사 본문 / 카드의 1-Tap Quick Admin Editor
                    </h4>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium">
                      기사 카드 우상단 관리자 톱니바퀴 및 본문 하단 바텀 시트로 제목/내용 수정, AI 맞춤법 교정, 엠바고 설정을 원터치 완료.
                    </p>
                    {onOpenMobileAdminPad && (
                      <button
                        onClick={() => {
                          onClose();
                          onOpenMobileAdminPad();
                        }}
                        className="mt-3 w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl transition-all shadow cursor-pointer active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <ShieldCheck size={14} />
                        <span>모바일 관리자 Quick-Edit 조작창 열기</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Step By Step Mobile Admin Workflow */}
              <div className="space-y-3">
                <h4 className="text-xs font-black uppercase tracking-wider text-zinc-400">
                  📱 핸드폰 관리자 핵심 사용 가이드
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                    <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-500 font-mono font-black text-xs flex items-center justify-center mb-2">
                      01
                    </span>
                    <strong className="block font-bold text-zinc-900 dark:text-white mb-1">
                      하단 FAB 및 하단바 접근
                    </strong>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      모바일 화면 하단 플로팅 퀵 메뉴(+)에서 '✍️ 모바일 기사 작성'을 언제든지 터치.
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                    <span className="w-6 h-6 rounded-lg bg-blue-500/20 text-blue-500 font-mono font-black text-xs flex items-center justify-center mb-2">
                      02
                    </span>
                    <strong className="block font-bold text-zinc-900 dark:text-white mb-1">
                      기사 1-Tap 스마트 수정
                    </strong>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      기사 카드의 톱니바퀴 아이콘을 누르면 모바일 바텀시트가 슬라이드업되어 즉시 기사 편집 가능.
                    </span>
                  </div>

                  <div className="p-3.5 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-200/80 dark:border-zinc-800">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-500 font-mono font-black text-xs flex items-center justify-center mb-2">
                      03
                    </span>
                    <strong className="block font-bold text-zinc-900 dark:text-white mb-1">
                      AI 3초 교정 & 즉시 반영
                    </strong>
                    <span className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                      'AI 헤드라인 추천' 및 '오탈자 교정' 버튼을 눌러 모바일에서도 전문가 수준 보도자료 발행.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="p-5 sm:p-6 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-zinc-500 font-semibold text-center sm:text-left">
              💡 오른쪽 하단 <strong>'📱/💻 뷰 전환'</strong> 버튼으로 모바일 & 웹 최적화 모드를 직접 체감해보세요.
            </p>
            <button
              onClick={onClose}
              className="w-full sm:w-auto px-6 py-2.5 bg-zinc-900 hover:bg-black dark:bg-white dark:hover:bg-zinc-100 text-white dark:text-black rounded-2xl font-black text-xs transition-all shadow cursor-pointer active:scale-95"
            >
              확인 완료
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

