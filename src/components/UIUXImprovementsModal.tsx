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
  ChevronRight,
  Layers,
  Edit3,
  ShieldCheck,
  SmartphoneNfc,
  Check,
  ListOrdered,
  Search,
  BookOpen,
  Building2,
  Share2,
  Eye,
  BarChart3,
  FileText,
  SlidersHorizontal
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
  const [activeTab, setActiveTab] = useState<"top10" | "menu10" | "list100" | "admin">("top10");
  const [selectedItem, setSelectedItem] = useState<number | null>(null);
  const [selectedMenuIndex, setSelectedMenuIndex] = useState<number>(0);
  const [checklistFilterCategory, setChecklistFilterCategory] = useState<string>("all");
  const [checklistSearch, setChecklistSearch] = useState("");

  if (!isOpen) return null;

  // 1. 10대 핵심 종합 보완점
  const top10Improvements = [
    {
      id: 1,
      category: "mobile",
      categoryName: "📱 모바일 최적화",
      title: "모바일 헤더 겹침 제로화 & 언론사 표준 기사 페이징 (2개 모아보기/6개 표준)",
      desc: "모바일에서 메뉴가 아래 콘텐츠를 가리던 문제를 Sticky 구조로 완벽 해소하고, 끝없는 스크롤 대신 2개씩 모아보기 및 언론사 표준 페이징으로 푸터 접근성을 혁신했습니다.",
      details: [
        "Sticky 헤더 전환 및 자연스러운 콘텐츠 배치로 모바일 메뉴 가림 현상 원천 해결",
        "언론사 표준 페이징 (◀ 이전 / 번호 / 다음 ▶) 및 '2개씩 보기 (포커스)' 모드 탑재",
        "긴 스크롤 없이 1-클릭으로 즉시 이동 가능한 '⬇️ 바닥글(푸터) 바로가기' 연동",
        "가로 스크롤 메뉴 우측 그라데이션 페이드 인디케이터로 다음 메뉴 시각적 힌트 제공"
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
      title: "메뉴별 10대 보완점 & UI/UX 100가지 보완 종합 센터",
      desc: "10개 메뉴별 10가지 보완점(총 100개)을 사용자가 분야별로 한눈에 확인하고 모바일/웹 최적화 모드를 직접 체감하는 센터.",
      details: [
        "10개 메뉴별 10가지 세부 보완점 데이터베이스 완비",
        "100가지 전체 체크리스트 실시간 검색 및 필터링",
        "모바일 / 노트북 뷰포트 인스턴트 전환 지원"
      ],
      icon: Sparkles,
      status: "완료",
      tag: "Dashboard"
    }
  ];

  // 2. 10개 메뉴별 10가지 보완점 구조 (10 메뉴 x 10 항목 = 100개)
  const menuCategories = [
    {
      id: "m_main",
      name: "📱 모바일 메인 뷰",
      icon: Smartphone,
      color: "from-blue-500 to-indigo-600",
      items: [
        "한 손 엄지 최적화 48px+ 하단 고정 Sticky Bottom Navigation Bar",
        "터치 제스처 슬라이드업 모바일 Bottom Sheet 드로어 모달",
        "관성 가로 스크롤 카테고리 태그 칩 터치 스와이퍼",
        "Pull-to-Refresh 상단 끌어당겨 새로고침 인터랙션 피드백",
        "모바일 3초 AI 핵심 요약 (3-Line Summary) 카드 접기/펼치기",
        "한 손 조작 전용 모바일 퀵 에디트 & 플로팅 (+) FAB 버튼",
        "모바일 배터리 절약 전용 OLED Pure Black 다크 테마",
        "상단 스마트 스크롤 연동 주소창 및 헤더 자동 숨김",
        "카카오톡/라인 1-Tap 터치 모바일 기사 간편 공유 시트",
        "모바일 PWA 홈 화면 추가 프로모트 안내 팝업"
      ]
    },
    {
      id: "w_desktop",
      name: "💻 웹/노트북 대화면",
      icon: Laptop,
      color: "from-indigo-500 to-purple-600",
      items: [
        "대화면 비대칭 Bento Grid 속보 및 주요 기사 카드 배치",
        "1280px+ Dual-Pane Split Reader (목록과 본문 동시 열람)",
        "Ctrl + K / Cmd + K 키보드 핫키 커맨드 팔레트 검색",
        "우측 고정 실시간 인기 검색어 TOP 10 & 핫 트렌드 위젯",
        "기사 카드 마우스 호버 입체 3D Lift & 마이크로 글로우 효과",
        "키보드 방향키(Arrow Key) 기사 즉시 탐색 및 Esc 창닫기",
        "온에어 팟캐스트 / 미디어 실시간 슬라이더 플로팅 플레이어",
        "대화면 가독성 최적화 max-w-7xl 중앙 정렬 및 여백 밸런스",
        "기사 본문 이미지 Lightbox 확장 및 HD 레티나 화질 제공",
        "인쇄 및 PDF 다운로드 전용 웹 클린 스티키 레이아웃"
      ]
    },
    {
      id: "a_reader",
      name: "📰 기사 본문 & 리더",
      icon: BookOpen,
      color: "from-emerald-500 to-teal-600",
      items: [
        "AI Web Speech API 기반 실시간 TTS 오디오 기사 낭독",
        "상단 기사 독서 진행률 (Reading Progress) 프로그래스 바",
        "가독성 폰트 스케일러 (A+ / A- 5단계 글자 크기 조절)",
        "핵심 주제 키워드 자동 하이라이트 & 스마트 툴팁",
        "시력보호 야간독서 눈부심 방지 오프라이트 세피아/다크 모드",
        "예상 독서 잔여 시간(Reading Time) 실시간 자동 계산",
        "관련 기사 타임라인 AI 추천 및 연관 뉴스 릴레이",
        "기사 스크랩 & 나중에 읽기 1-Tap 개인 북마크 저장",
        "언론사 공식 가입 및 출처 저작권 신뢰성 검증 배지",
        "기사 본문 내 인포그래픽 및 데이터 차트 인터랙티브 뷰어"
      ]
    },
    {
      id: "m_writer",
      name: "✍️ 모바일 기사 작성기",
      icon: Edit3,
      color: "from-amber-500 to-orange-600",
      items: [
        "모바일 핸드폰 전용 한 손 기사 작성 퀵 스튜디오",
        "기사 카드 및 읽기 화면 상단 1-Tap Quick-Edit 패널",
        "AI 헤드라인 3가지 자동 추출 및 제목 교정 엔진",
        "모바일 카메라 직접 촬영 및 사진 자동 압축 업로드",
        "취재 기자 현장 음성 취재 메모 자동 텍스트 변환 (STT)",
        "1-Tap 기사 승인 / 보류 / 임시저장 상태 즉시 토글",
        "기사 엠바고(발행 예약) 및 중요도(Primary/Breaking) 슬라이더",
        "모바일 기사 작성 중 10초 주기 실시간 Auto Save 복구",
        "오탈자 및 문맥 AI Compliance 검수 자동 피드백",
        "현장 사진 워터마크 자동 삽입 및 기자 서명 자동 바인딩"
      ]
    },
    {
      id: "m_registry",
      name: "🏛️ 언론사 제휴/등록",
      icon: Building2,
      color: "from-sky-500 to-blue-600",
      items: [
        "사업자 등록증 / 신문사업 등록증 AI OCR 1-Click 자동입력",
        "매체 등록 전용 4단계 반응형 위저드 (Wizard) 가이드",
        "공식 도메인 HTTPS 보안 인증 및 DNS MX 레코드 자동 조회",
        "실시간 승인 심사 타임라인 & 단계별 진행 현황 프로그래스",
        "언론 설립일, 상주기자 수 및 발행 주기 자동 자격 스코어링",
        "등록 완료 시 공식 제휴 및 가입 인증서 팝업 발행",
        "시민기자 vs 전문 언론사 혜택 비교 매트릭스 테이블",
        "전국 50+ 연동 매체망 실시간 트래픽 상태 모니터링 로그",
        "매체별 고유 RSS / API 연동 키 자동 발급 시스템",
        "제휴 신청서 임시저장 및 모바일 바텀시트 빠른 수정"
      ]
    },
    {
      id: "ai_search",
      name: "🔍 AI 검색 & 커맨드",
      icon: Command,
      color: "from-purple-500 to-pink-600",
      items: [
        "Ctrl + K / Cmd + K 단축키 글로벌 커맨드 팔레트",
        "초성 검색 및 초고속 인스턴트 연관 키워드 자동완성",
        "최근 검색어 자동 저장 및 1-Tap 삭제 관리",
        "카테고리별 / 언론사별 / 날짜별 고밀도 스마트 필터",
        "AI 기반 자연어 맥락 탐색 (\"최근 경제 이슈 요약해줘\")",
        "키보드 Arrow Key 및 Enter 키 기반 빠른 항목 선택",
        "검색 결과 트렌드 히트맵 & 키워드 구름 태그 제공",
        "팩트체크 완료 기사만 골라보기 필터링 스위치",
        "모바일 음성 검색 (STT) 마이크 즉시 연동",
        "검색어 입력 시 200ms 디바운스 실시간 결과 프리뷰"
      ]
    },
    {
      id: "live_trend",
      name: "⚡ 실시간 트렌드/온에어",
      icon: Zap,
      color: "from-rose-500 to-red-600",
      items: [
        "1초 단위 실시간 트래픽 집계 핫 키워드 TOP 10 랭킹",
        "긴급 속보 실시간 무한 롤링 티커 배너",
        "라이브 팟캐스트 / 온에어 미디어 1-Click 오디오 플레이어",
        "시민 여론조사 팩트체크 실시간 이모지 투표 보드",
        "트렌드 키워드 변동 추이 실시간 상승/하강 인디케이터",
        "이슈별 관련 속보 묶어보기 클러스터링 카드",
        "실시간 뉴스 알림 구독 1-Tap 팝업 신청",
        "카드별 실시간 조회수 & 댓글 수 모니터링 스파크라인",
        "라이브 방송 제보 영상 미디어 플레이어",
        "트렌드 핫이슈 SNS 인스타그램/X 스타일 공유 모듈"
      ]
    },
    {
      id: "fact_check",
      name: "🛡️ AI 팩트체크/신고",
      icon: ShieldCheck,
      color: "from-cyan-500 to-blue-600",
      items: [
        "AI 딥러닝 문장 허위성 및 가짜뉴스 가능성 지수 표시",
        "익명성 보장 100% 암호화 시청자 기사 제보 센터",
        "팩트체크 원본 근거 문헌 및 언론사 보도 비교 매트릭스",
        "허위 사실 유포 기사 1-Tap 시정 요청 및 댓글 블라인드",
        "AI 팩트체커 검증 완료 인증 배지 및 신뢰도 마크",
        "제보 첨부파일 보안 스캔 및 메타데이터 자동 제거",
        "언론 윤리 강령 준수 여부 자동 스코어링",
        "팩트체크 요청 결과 실시간 카카오톡 알림톡 연동",
        "이슈별 찬반 전문가 의견 서머리 탭",
        "시민 참전 팩트체크 토론장 및 투표 시스템"
      ]
    },
    {
      id: "theme_access",
      name: "🌙 테마 & 가독성",
      icon: Moon,
      color: "from-violet-500 to-indigo-600",
      items: [
        "System / Light / Dark / OLED Pure Black 4단계 테마",
        "WCAG AA 표준 4.5:1 이상 고대비 텍스트 서식",
        "야간 독서용 난반사 방지 오프라이트 웜 세피아 필터",
        "OS 단말기 시스템 테마 자동 동기화 센서",
        "색맹/약시 유저를 위한 색상 반전 및 명암 대비 강화",
        "화면 확대 시 깨짐 없는 SVG 전용 백터 아이콘",
        "애니메이션 최소화(Reduce Motion) 접근성 옵션",
        "가독성 특화 Plus Jakarta Sans & 본문 서체 매핑",
        "테마 변경 시 300ms 부드러운 컬러 크로스페이드",
        "테마 상태 LocalStorage 지속 보존 및 즉시 적용"
      ]
    },
    {
      id: "admin_desk",
      name: "📊 관리자 데스크",
      icon: BarChart3,
      color: "from-emerald-600 to-green-700",
      items: [
        "실시간 매체 트래픽 및 기사 읽기 체류시간 분석 차트",
        "모바일/웹 접속 기기 비율 실시간 원형 그래프",
        "카테고리별 기사 생산량 및 승인 대기 목록 그리드",
        "기자별 단독 기사 랭킹 & 기여도 스코어보드",
        "긴급 푸시 알림 타겟팅 발송 및 수신율 리포트",
        "부적절 댓글 자동 AI 필터링 및 1-Tap 블라인드",
        "기사 수정 이력(Revision History) 타임라인 추적",
        "광고 및 제휴 배너 클릭률(CTR) 모니터링 패널",
        "매체 서버 CPU / Memory 상태 실시간 시스템 헤리티지",
        "CSV / Excel 지원 뉴스 통계 데이터 1-Click 내보내기"
      ]
    }
  ];

  // 전체 100가지 항목 플랫 배열 (검색 및 전체 리스트용)
  const all100Items = menuCategories.flatMap((menu, mIdx) =>
    menu.items.map((title, iIdx) => ({
      id: `${menu.id}-${iIdx}`,
      menuId: menu.id,
      menuName: menu.name,
      index: mIdx * 10 + iIdx + 1,
      title
    }))
  );

  const filtered100Items = all100Items.filter((item) => {
    const matchCat = checklistFilterCategory === "all" || item.menuId === checklistFilterCategory;
    const matchSearch = item.title.toLowerCase().includes(checklistSearch.toLowerCase());
    return matchCat && matchSearch;
  });

  const selectedMenuData = menuCategories[selectedMenuIndex] || menuCategories[0];

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
          <div className="p-5 sm:p-6 md:p-7 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start bg-zinc-50/50 dark:bg-zinc-900/30">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                  <Sparkles size={12} />
                  2026 메뉴별 10대 보완점 (총 100가지) 적용 리포트
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
                10개 주요 메뉴별로 추출된 10가지 세부 보완점(총 100개)과 최신 트렌드 UI/UX 요소가 완벽 적용되었습니다.
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-2.5 text-zinc-400 hover:text-zinc-900 dark:hover:text-white rounded-full bg-zinc-100 dark:bg-zinc-800 transition-colors cursor-pointer shrink-0 ml-2"
            >
              <X size={20} />
            </button>
          </div>

          {/* Top Banner: Device Responsive Status & Quick Actions */}
          <div className="bg-gradient-to-r from-zinc-850 via-zinc-900 to-black text-white px-5 sm:px-6 py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs font-bold shadow-inner">
            <div className="flex items-center gap-2">
              <Layers size={15} className="text-red-500" />
              <span>자동 반응형 최적화: <strong className="text-emerald-400">⚡ 스마트폰 ↔ 태블릿 ↔ 노트북 단말 자동 100% 감응</strong></span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
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
              { id: "menu10", label: "📌 메뉴별 10대 보완점 (10개 메뉴 x 10개)", icon: FileText },
              { id: "list100", label: "💯 100가지 전체 체크리스트", icon: ListOrdered },
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

          {/* Tab 2: 메뉴별 10대 보완점 (10개 메뉴 x 10개) */}
          {activeTab === "menu10" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
              {/* Menu Selector Chips (10 Menus) */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
                    <SlidersHorizontal size={14} />
                    보완 항목을 확인할 메뉴를 선택하세요 (총 10개 주요 메뉴)
                  </h3>
                  <span className="text-[11px] font-mono font-bold text-amber-500">
                    메뉴 #{selectedMenuIndex + 1} / 10
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {menuCategories.map((menu, idx) => {
                    const MenuIcon = menu.icon;
                    const isSelected = selectedMenuIndex === idx;
                    return (
                      <button
                        key={menu.id}
                        onClick={() => setSelectedMenuIndex(idx)}
                        className={`p-2.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? "bg-amber-500 text-black border-amber-500 shadow-md font-black"
                            : "bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-amber-500/50"
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <MenuIcon size={16} className={isSelected ? "text-black" : "text-amber-500"} />
                          <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded-full ${isSelected ? "bg-black/20 text-black" : "bg-zinc-200 dark:bg-zinc-800 text-zinc-500"}`}>
                            10/10
                          </span>
                        </div>
                        <span className="text-xs font-extrabold truncate">{menu.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Selected Menu Details Header */}
              <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-purple-500/10 border border-amber-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500 text-black flex items-center justify-center font-black shadow">
                    {React.createElement(selectedMenuData.icon, { size: 20 })}
                  </div>
                  <div>
                    <h4 className="text-sm sm:text-base font-black text-zinc-900 dark:text-white flex items-center gap-2">
                      <span>{selectedMenuData.name}</span>
                      <span className="text-xs bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 px-2 py-0.5 rounded-full font-bold">
                        10대 보완점 적용 완료
                      </span>
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium mt-0.5">
                      해당 메뉴에 특화된 최신 트렌드 및 UI/UX 보완 항목 10가지 리스트입니다.
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 text-xs font-mono font-bold text-amber-500">
                  항목 #{selectedMenuIndex * 10 + 1} ~ #{selectedMenuIndex * 10 + 10}
                </div>
              </div>

              {/* 10 Items for Selected Menu */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {selectedMenuData.items.map((itemTitle, iIdx) => (
                  <div
                    key={iIdx}
                    className="p-3.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 rounded-2xl flex items-start gap-3 hover:border-amber-500/60 transition-all text-left shadow-xs"
                  >
                    <span className="w-6 h-6 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 font-mono font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                      {String(iIdx + 1).padStart(2, "0")}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-extrabold text-zinc-400">
                          {selectedMenuData.name} 특화 보완
                        </span>
                        <span className="text-[10px] font-bold text-emerald-500 bg-emerald-500/10 px-2 py-0.2 rounded-full flex items-center gap-1">
                          <Check size={10} className="stroke-[3]" /> 적용됨
                        </span>
                      </div>
                      <p className="text-xs font-black text-zinc-800 dark:text-zinc-100 leading-snug">
                        {itemTitle}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: 100가지 보완점 종합 체크리스트 */}
          {activeTab === "list100" && (
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Category Filter & Search */}
              <div className="flex flex-col sm:flex-row gap-2 justify-between items-center bg-zinc-100/70 dark:bg-zinc-900/80 p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-1 overflow-x-auto w-full sm:w-auto no-scrollbar">
                  <button
                    onClick={() => setChecklistFilterCategory("all")}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      checklistFilterCategory === "all"
                        ? "bg-amber-500 text-black shadow-sm font-black"
                        : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                    }`}
                  >
                    전체 (100)
                  </button>
                  {menuCategories.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setChecklistFilterCategory(m.id)}
                      className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                        checklistFilterCategory === m.id
                          ? "bg-amber-500 text-black shadow-sm font-black"
                          : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                      }`}
                    >
                      {m.name}
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
                {filtered100Items.map((item) => (
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
                          #{item.index}
                        </span>
                        <span className="text-[9px] font-bold text-zinc-400 truncate">
                          {item.menuName}
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

          {/* Tab 4: 모바일 기사작성 & 관리자 메뉴 상세 안내 및 빠른 조작 */}
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
              💡 상단 <strong>'📱/💻 뷰 전환'</strong> 버튼으로 모바일 & 웹 최적화 화면을 직접 체감해보세요.
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
