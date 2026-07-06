import React, { useState, useEffect } from "react";
import {
  Film,
  Tv,
  Camera,
  Heart,
  Send,
  Star,
  User,
  Sparkles,
  Clock,
  Award,
  BookOpen,
  ThumbsUp,
  Flame,
  Leaf,
  Megaphone,
  UserCheck,
  AlertCircle,
  HelpCircle,
  TrendingUp,
  ArrowRight,
  ShieldAlert
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { db } from "../firebase";
import { collection, doc, setDoc, getDocs, query, where, orderBy, limit } from "firebase/firestore";

interface HyeonWonCinemaProps {
  user: any;
  onAuthClick: () => void;
}

interface AuditionResult {
  castingResult: string;
  actingScore: number;
  veganCompatibilityScore: number;
  assignedRole: string;
  visualTone: string;
  directorReview: string;
}

interface GuestbookMessage {
  id: string;
  newsId: string;
  author: string;
  content: string;
  likes: number;
  stance: string;
  createdAt: string;
  rating?: number;
  badge?: string;
  avatar?: string;
  isPhotocard?: boolean;
  ticketMovie?: string;
  ticketSticker?: string;
  ticketSeat?: string;
  ticketVibeColor?: string;
  reactions?: {
    like: number;
    fire: number;
    mindblown: number;
    crying: number;
  };
}

export default function HyeonWonCinema({ user, onAuthClick }: HyeonWonCinemaProps) {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "filmography" | "cartoons" | "audition" | "guestbook" | "playground">("profile");
  
  // Behind episode board states
  interface BehindEpisode {
    id: string;
    author: string;
    relation: string;
    content: string;
    mood: string;
    likes: number;
    createdAt: string;
  }
  const [behindEpisodes, setBehindEpisodes] = useState<BehindEpisode[]>([]);
  const [isBehindLoading, setIsBehindLoading] = useState(false);
  const [behindAuthor, setBehindAuthor] = useState(user?.displayName || "");
  const [behindRelation, setBehindRelation] = useState("스태프");
  const [behindContent, setBehindContent] = useState("");
  const [behindMood, setBehindMood] = useState("🔥");
  const [isSubmittingBehind, setIsSubmittingBehind] = useState(false);

  // DIY Ticket Decorator states
  const [ticketMovie, setTicketMovie] = useState("film_vegan");
  const [ticketSeat, setTicketSeat] = useState("MZ-01");
  const [ticketSticker, setTicketSticker] = useState("🌱 Eco-Vegan");
  const [ticketName, setTicketName] = useState(user?.displayName || "시네필");
  const [ticketComment, setTicketComment] = useState("인생 최고의 독립영화!");
  const [ticketVibeColor, setTicketVibeColor] = useState("amber"); // amber, purple, rose, emerald

  // Cinematic MBTI states
  const [mbtiStep, setMbtiStep] = useState(0); // 0: intro, 1-4: questions, 5: result
  const [mbtiAnswers, setMbtiAnswers] = useState<string[]>([]);
  const [mbtiResult, setMbtiResult] = useState<string | null>(null);

  // Audition state
  const [actorName, setActorName] = useState(user?.displayName || "");
  const [actorAge, setActorAge] = useState("20대");
  const [actorGender, setActorGender] = useState("선택안함");
  const [roleType, setRoleType] = useState("주연 (Protagonist)");
  const [genre, setGenre] = useState("비건 생태 SF (Eco-Vegan SF)");
  const [speechText, setSpeechText] = useState("");
  const [actingMood, setActingMood] = useState("cosmic_sorrow");
  const [userNote, setUserNote] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluationStep, setEvaluationStep] = useState(0);
  const [auditionResult, setAuditionResult] = useState<AuditionResult | null>(null);

  // Guestbook state
  const [guestbookMessages, setGuestbookMessages] = useState<GuestbookMessage[]>([]);
  const [isMessagesLoading, setIsMessagesLoading] = useState(false);
  const [writerName, setWriterName] = useState(user?.displayName || "");
  const [newMessage, setNewMessage] = useState("");
  const [selectedEmoji, setSelectedEmoji] = useState("🌱");
  const [rating, setRating] = useState<number>(5);
  const [commentSearch, setCommentSearch] = useState<string>("");
  const [commentSort, setCommentSort] = useState<"latest" | "highest" | "lowest" | "likes">("latest");
  const [isSubmittingMessage, setIsSubmittingMessage] = useState(false);
  
  // Gen-Z Social enhancements
  const [selectedBadge, setSelectedBadge] = useState("🥑 비건 시네필");
  const [selectedAvatar, setSelectedAvatar] = useState("🦊");
  const [balanceGameVote, setBalanceGameVote] = useState<string | null>(() => localStorage.getItem("hyeonwon_balance_vote"));
  const [balanceGameVotes, setBalanceGameVotes] = useState({ optionA: 342, optionB: 298 });

  // Selected cartoon for modal
  const [selectedCartoon, setSelectedCartoon] = useState<any | null>(null);

  // Filmography expand state
  const [expandedFilmId, setExpandedFilmId] = useState<string | null>(null);

  // Filmography items
  const films = [
    {
      id: "film_vegan",
      title: "동물의 시선 (The Animal's Perspective)",
      year: "2025",
      type: "단편 비건 시네마 (Short Vegan Movie)",
      role: "각본 ∙ 감독 (Written & Directed)",
      description: "동물의 순수한 눈을 통해 파괴되어 가는 원형 보전 지구 수림 지대를 고귀하고도 묵직한 무성 흑백 잉크 톤의 영상 미장센으로 표현한 거장 김현원 감독의 마스터피스.",
      award: "제12회 이솔 국제 생태 영화제 감독상 수상작",
      thumbnail: "https://images.unsplash.com/photo-1546182990-dffeafbe841d?auto=format&fit=crop&q=80&w=1200",
      vibe: "Silent Ink-Tone, Ecological Metaphor",
      philosophy: "생명체의 떨리는 눈동자 하나가 어떤 백만 개의 대사보다도 깊은 침묵의 경고를 전한다.",
      behindMemo: "본래 실존 동물 모델을 섭외하여 촬영하려 했으나, 낯선 세트 조명과 마이크 폴에 심한 불안 증세를 보였습니다. 김현원 감독은 즉시 실물 촬영 중단 지시를 내렸고, 모든 인력을 철수시킨 뒤, 야외 자연 그대로의 빛과 원격 드론 카메라의 숨소리 없는 관찰 구도를 적용해 동물들에게 완벽한 평화를 보장했습니다.",
      scenes: [
        { num: "Scene #01", title: "침묵의 숲", desc: "이른 아침 서리가 내린 수풀 속에서 눈동자를 깜빡이는 아기 노루의 초근접 클로즈업. 빗소리 외엔 아무런 오디오도 섞이지 않은 완전 무성의 순간." },
        { num: "Scene #02", title: "생명의 온기", desc: "추위에 떨던 다람쥐 한 마리가 길에 떨어진 알밤을 쥐는 손동작을 따뜻한 세피아 수채화 톤의 고감도 잉크 미장센으로 승화한 연출." }
      ]
    },
    {
      id: "film_neon_city",
      title: "우주 늑구의 귀환: 네온 시티",
      year: "2026",
      type: "SF 하이브리드 미디어 (Sci-Fi Hybrid Film & Webtoon)",
      role: "공동 원작 ∙ 총연출 (Co-Creator & Chief Director)",
      description: "인공지능 배우 '이솔'과의 전격 하이브리드 매치업. 황폐해진 미래의 네온 사이버펑크 도시에서 생존을 위해 발버둥 치는 우주 늑구의 처절한 모험을 비장하고 긴박감 넘치게 연출.",
      award: "글로벌 AI 영화 어워즈 극본/공동 프로덕션 노미네이트",
      thumbnail: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&q=80&w=1200",
      vibe: "Cyberpunk, Artificial Intelligence Hybrid",
      philosophy: "기계의 냉혹한 전류가 흐르는 회로 속에서도 영혼의 미열은 기어코 숨을 쉰다.",
      behindMemo: "AI 캐릭터 이솔과의 매끄러운 융합을 위해, 메타휴먼 모션 캡처 장비 없이 순수 자연주의적 생성 프롬프트와 배우 전진서의 비언어적 제스처 인터랙션을 합성하여 2026년 독립영화계 최정상급 AI 특수 연출을 일궈냈습니다.",
      scenes: [
        { num: "Scene #01", title: "빛바랜 회로", desc: "네온 도시 한가운데 버려진 고장 난 정비 유닛과 그 틈새로 피어나는 잡초를 극명하게 대비하는 네온 라이트 투사." },
        { num: "Scene #02", title: "늑구의 포효", desc: "달빛을 배경으로 홀로그램 달을 향해 포효하는 우주 늑구의 실루엣이 사이버 시티 스카이라인과 중첩되는 피날레." }
      ]
    },
    {
      id: "film_psa",
      title: "세계 실종 아동의 날 기념 공익 캠페인",
      year: "2024",
      type: "공익 다큐멘터리 광고 (Public Service Announcement)",
      role: "공동 연출 ∙ 특별 출연 (Co-Director & Cameo)",
      description: "인기 아역 출신 배우 전진서와 함께 작업하여, 생명 존중과 실종 아동 조기 복귀를 바라는 전 사회적 울림 and 따뜻한 휴머니즘을 고도의 절제된 다큐 카메라 시각으로 수립.",
      award: "대한민국 공익광고 대상 복지기획부문 특별공로상 수상",
      thumbnail: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?auto=format&fit=crop&q=80&w=1200",
      vibe: "Warm Humanism, Realistic Documentary Focus",
      philosophy: "사라진 아이들을 기다리는 일은 온 세상을 따뜻한 기둥으로 다시 굳히는 숭고한 약속이다.",
      behindMemo: "전진서 배우의 재능 기부와 함께, 실종자 가족들의 실제 목소리를 백그라운드 앰비언트 노이즈로 융합했습니다. 감정을 강요하는 신파를 완전히 배제하고, 아이들의 손때 묻은 일기장과 크레파스를 정적으로 응시하는 리얼리티 구도로 보는 이의 가슴을 먹먹하게 만들었습니다.",
      scenes: [
        { num: "Scene #01", title: "빈 놀이터", desc: "노을이 붉게 타오르는 모래사장 놀이터의 빈 그네가 부드럽게 흔들리는 원테이크 롱테이크 샷." },
        { num: "Scene #02", title: "어머니의 손길", desc: "서랍 속에 조용히 보관된 마지막 크레파스 통의 묵은 먼지를 조용히 훔쳐내는 클로즈업." }
      ]
    },
    {
      id: "film_eve",
      title: "이솔나라의 전야 (The Eve of IsolNara)",
      year: "2025",
      type: "초대형 시각 다큐 필름 (Feature Documentary)",
      role: "기획 ∙ 제작 ∙ 감독 (Produced & Directed)",
      description: "시민의 영웅적인 자율 지성과 첨단 인공지능 보도 기술이 만나, 가짜 뉴스가 범람하는 세상을 혁파하고 독립 언론의 거대한 미디어 제국을 조립해 나가는 전야의 거대한 스펙터클을 영화적 터치로 완벽 복원.",
      award: "이솔 저널리즘 멀티미디어 대상 초청 개막작",
      thumbnail: "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&q=80&w=1200",
      vibe: "Spectacle Epic, Civic Intellect documentary",
      philosophy: "진실은 권력이 세운 성벽을 통째로 허무는 소박한 촛불들의 연대에서 탄생한다.",
      behindMemo: "가짜 뉴스의 폭풍이 부는 어둠의 광장을 거대한 3D 디지털 캔버스로 재조합하고, 시민들의 응원 문자 하나하나가 빛이 되어 하늘로 상승하여 우주의 온전한 은하수 보도망으로 승화되는 판타지 다큐 기법을 융합해 이목을 모았습니다.",
      scenes: [
        { num: "Scene #01", title: "폭풍의 눈", desc: "서류 뭉치와 가짜 종이 지라시들이 소용돌이쳐 날아다니는 시사 평론 회의실의 몽타주 기법." },
        { num: "Scene #02", title: "진실의 촛불", desc: "수만 명의 촛불이 은하수처럼 흐르며 이솔나라 뉴스의 거대한 디지털 홀로그램 빌딩을 관통하여 치유하는 장엄한 공감 연출." }
      ]
    },
    {
      id: "film_copycat",
      title: "카피캣 (Copycat)",
      year: "2026",
      type: "심리 스릴러 영화 (Psychological Cinematic Thriller)",
      role: "각색 ∙ 연출 (Screenplay & Directing)",
      description: "인간과 복제 자아 간의 혼란, 플랫폼 지배 체제 속 고뇌하는 현대인의 자화상을 미장센 가득한 다이내믹 시각 구도와 서스펜스 무드로 조율하여 관객의 시선을 강타한 충격적인 독립 화제작.",
      award: "독립예술 영화협회 황금조율기 상 수상",
      thumbnail: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=1200",
      vibe: "Deep Suspense, Reflection of Self",
      philosophy: "타인을 끝없이 모방하다가 거울 속의 자신마저 복사본으로 바래어 가는 현대인의 슬픈 무도회.",
      behindMemo: "1인 2역을 연기하는 실제 배우와 AI 복제 배우 간의 동기화율을 고도로 조율하기 위해 거울 프레임 시퀀스를 48회 이상 재촬영했습니다. 현대 사회의 미디어 지배 권력과 기계화 속에 본질을 잃어버리는 인간 정신의 슬픈 군상을 긴장감 가득히 해부했습니다.",
      scenes: [
        { num: "Scene #01", title: "이중 자아", desc: "거울에 비친 거울이 무한히 중첩되는 무도회장 복도 끝에서 진짜와 가짜가 서로 엇갈려 걸어가는 슬로우 모션." },
        { num: "Scene #02", title: "유리의 파열", desc: "자신을 향해 소리 없는 총을 쏘자, 유리거울이 가잘한 조각으로 비산하며 무지갯빛 프리즘 라이트로 굴절되는 순간." }
      ]
    }
  ];

  // Editorial Cartoons (이솔만평) authored by Director Hyeon Won
  const cartoons = [
    {
      id: "cart1",
      title: "[이솔만평] 고유가 시대의 골대 앞, 재난지원금은 터질 것인가",
      author: "현원감독",
      content: "치솟는 유가와 물가 앞에 서민들의 삶은 벼랑 끝으로 내몰리고 있습니다. 정치권의 재난지원금 논의가 과연 서민들의 숨통을 틔워줄 수 있을지, 아니면 또 다른 갈등의 시작일지 풍자적으로 담아냈습니다.",
      thumbnail: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-12",
      likes: 456,
      subText: "서민들의 얼어붙은 골대를 녹일 수 있는 것은 수사적 말잔치가 아닌, 현실의 주머니를 따뜻하게 하는 정직한 불씨뿐입니다."
    },
    {
      id: "cart2",
      title: "[이솔만평] 누가 미래의 데이터 패권을 거머쥘 것인가",
      author: "현원감독",
      content: "미국 and 중국, 거대 강대국 사이에서 벌어지는 AI 반도체와 데이터 서버 전쟁. 무너지는 세계 경제 질서 속에서 인류의 미래는 어디로 향하고 있습니까.",
      thumbnail: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-11",
      likes: 312,
      subText: "데이터는 현대의 새로운 석유이지만, 그것을 지탱하는 것은 서버가 아니라 인간의 가장 보편적인 지성입니다."
    },
    {
      id: "cart3",
      title: "[이솔만평] 자가당착: 유가 폭탄과 레이저 눈빛",
      author: "현원감독",
      content: "말로만 외치는 민생 안정이 아닌 실질적인 대책이 필요한 시점입니다. 고유가라는 거대한 폭탄을 앞에 두고 벌어지는 정치적 수사들을 꼬집었습니다.",
      thumbnail: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-10",
      likes: 289,
      subText: "정치인들의 서슬 퍼런 레이저 눈빛은 정적을 향할 때가 아니라, 차디찬 보일러 바닥을 만져보는 서민들의 시선과 포개어져야 합니다."
    },
    {
      id: "cart4",
      title: "[이솔만평] 거대 플랫폼의 그림자, 수수료에 우는 골목상권",
      author: "현원감독",
      content: "초연결 플랫폼 시대, 소상공인들이 짊어진 수수료의 무게는 갈수록 가중되고 있습니다. 상생 없는 성장의 그늘을 풍자했습니다.",
      thumbnail: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-10",
      likes: 156,
      subText: "디지털 고속도로를 깔았으나 정작 골목상권 사람들은 통행료를 내다 지쳐 쓰러집니다. 상생은 플랫폼의 은혜가 아니라 마땅한 공존의 철학입니다."
    },
    {
      id: "cart5",
      title: "[이솔만평] 시대만평: 보이지 않는 손과 여론의 조작",
      author: "현원감독",
      content: "알고리즘 뒤에 숨어 사람들의 눈과 귀를 현혹하는 '보이지 않는 보이지 않는 힘'을 해학적으로 파헤치며 진정한 자유 언론의 본질을 일깨우는 걸작 만평.",
      thumbnail: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?auto=format&fit=crop&q=80&w=800",
      date: "2026-05-09",
      likes: 672,
      subText: "조작된 댓글과 교묘히 선동된 피드는 영혼의 눈을 가립니다. 시민들이 스스로 불빛을 켤 때 보이지 않는 손은 비로소 숨을 곳을 잃을 것입니다."
    }
  ];

  // Load guestbook messages or behind episodes on page load and when tab changes
  useEffect(() => {
    if (activeSubTab === "guestbook") {
      fetchGuestbook();
    } else if (activeSubTab === "playground") {
      fetchBehindEpisodes();
    }
  }, [activeSubTab]);

  const fetchBehindEpisodes = async () => {
    setIsBehindLoading(true);
    try {
      const q = query(collection(db, "hyeonwon_behind_episodes"));
      const snapshot = await getDocs(q);
      const eps: BehindEpisode[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        eps.push({
          id: doc.id,
          author: data.author || "익명 지인",
          relation: data.relation || "스태프",
          content: data.content || "",
          mood: data.mood || "🔥",
          likes: data.likes || 0,
          createdAt: data.createdAt || new Date().toISOString().split("T")[0]
        });
      });
      // Sort by date or ID fallback
      eps.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      if (eps.length === 0) {
        throw new Error("No episodes");
      }
      setBehindEpisodes(eps);
    } catch (err) {
      console.log("No behind episodes from Firestore, loading defaults");
      setBehindEpisodes([
        {
          id: "ep1",
          author: "촬영감독 최민우",
          relation: "스태프",
          content: "원림 촬영 때 비가 너무 많이 와서 철수하려는데, 감독님이 직접 비건 주먹밥 싸 들고 스태프 한 명 한 명 입에 넣어주셨습니다. '추울 땐 든든하게 먹고 쉬자'며 촬영 하루 중단하고 펜션 잡아서 보드게임하고 놀았네요. 갓현원!",
          mood: "😭",
          likes: 24,
          createdAt: "2026-06-25"
        },
        {
          id: "ep2",
          author: "배우 전진서",
          relation: "배우",
          content: "우주 늑구 크랭크인 첫날, 밤샘 촬영인데 새벽 3시에 감독님이 직접 바나나 우유 들고 분장실 찾아와서 '진서야 네 눈빛 속에 우주 늑구의 슬픔이 백 퍼센트 살아있어. 너무 무리하진 마라' 격려해 주심. MZ 감성 제대로 아시는 리얼 스윗 보스.",
          mood: "💖",
          likes: 42,
          createdAt: "2026-06-24"
        },
        {
          id: "ep3",
          author: "대학동창 이진호",
          relation: "동창",
          content: "김현원 학창 시절에 영화 동아리 방에서 밤새 독립영화 토론하다가 컵라면 국물 엎지른 거 내가 다 닦았는데... 지금은 거장이 되어 만평까지 그리다니 감회가 새롭다 짜식. 그때도 비건 라면만 고집해서 다들 혀를 내둘렀지.",
          mood: "🤣",
          likes: 18,
          createdAt: "2026-06-20"
        }
      ]);
    } finally {
      setIsBehindLoading(false);
    }
  };

  const handleLikeBehindEpisode = async (id: string) => {
    try {
      setBehindEpisodes(prev => prev.map(ep => {
        if (ep.id === id) {
          const nextLikes = ep.likes + 1;
          setDoc(doc(db, "hyeonwon_behind_episodes", id), { likes: nextLikes }, { merge: true })
            .catch(e => console.error("Firestore sync error:", e));
          return { ...ep, likes: nextLikes };
        }
        return ep;
      }));
      toast.success("에피소드에 깊이 공감하셨습니다! 👍");
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitBehindEpisode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!behindContent.trim()) {
      toast.error("에피소드 썰 내용을 입력해 주세요.");
      return;
    }
    setIsSubmittingBehind(true);
    const newEpPayload = {
      author: behindAuthor.trim() || "익명 지인",
      relation: behindRelation,
      content: behindContent.trim(),
      mood: behindMood,
      likes: 0,
      createdAt: new Date().toISOString().split("T")[0]
    };
    try {
      const docRef = doc(collection(db, "hyeonwon_behind_episodes"));
      await setDoc(docRef, newEpPayload);
      setNewMessage("");
      toast.success("🤫 김현원 감독님의 은밀한 비하인드 썰이 제보되었습니다!");
      setBehindContent("");
      fetchBehindEpisodes();
    } catch (err) {
      console.warn("Firestore write error, saving locally", err);
      const localEp = {
        id: `ep_local_${Date.now()}`,
        ...newEpPayload
      };
      setBehindEpisodes(prev => [localEp, ...prev]);
      setBehindContent("");
      toast.success("🤫 비하인드 썰이 브라우저 로컬 저장소에 반영되었습니다!");
    } finally {
      setIsSubmittingBehind(false);
    }
  };

  const mbtiQuestions = [
    {
      q: "영화관에서 가장 마음에 드는 명당자리는?",
      options: [
        { label: "스크린이 한눈에 보이는 완벽한 중앙 좌석 (계획적/체계적)", score: "J" },
        { label: "언제든 팝콘 리필이나 화장실 가기 편한 통로 쪽 맨 뒷자리 (자유분방)", score: "P" }
      ]
    },
    {
      q: "인디 영화가 끝난 후 크레딧이 올라갈 때 당신은?",
      options: [
        { label: "영화가 준 감동과 깊은 은유를 곱씹으며 눈물을 훔친다 (감성파)", score: "F" },
        { label: "음악 선곡이 아주 좋군, 엔딩 크레딧 폰트는 뭘 썼는지 관찰한다 (이성파)", score: "T" }
      ]
    },
    {
      q: "처음 보는 시네필 모임에 참여했을 때 행동은?",
      options: [
        { label: "처음 만난 사람들과도 적극적으로 대화하며 영화 분석을 주도한다 (외향)", score: "E" },
        { label: "주로 남들의 분석을 묵묵히 경청하다가 조용히 나의 원픽 장면을 말한다 (내향)", score: "I" }
      ]
    },
    {
      q: "김현원 감독의 영화 속 난해한 씬을 마주했을 때?",
      options: [
        { label: "이 씬은 고도의 사회 풍자다! 감독의 의도와 현실의 연관성을 직관적으로 간파한다 (N)", score: "N" },
        { label: "카메라 워크가 예술이네! 색감과 음향 효과 등 오감으로 연출을 직접 즐긴다 (S)", score: "S" }
      ]
    }
  ];

  const handleMbtiAnswer = (score: string) => {
    const nextAnswers = [...mbtiAnswers, score];
    setMbtiAnswers(nextAnswers);
    if (mbtiStep < 4) {
      setMbtiStep(mbtiStep + 1);
    }
    
    if (nextAnswers.length === 4) {
      const introExtro = nextAnswers.includes("I") ? "I" : "E";
      const sensingIntuition = nextAnswers.includes("N") ? "N" : "S";
      const thinkingFeeling = nextAnswers.includes("F") ? "F" : "T";
      const judgingPerceiving = nextAnswers.includes("J") ? "J" : "P";
      const code = `${introExtro}${sensingIntuition}${thinkingFeeling}${judgingPerceiving}`;
      setMbtiResult(code);
      setMbtiStep(5);
    }
  };

  const fetchGuestbook = async () => {
    setIsMessagesLoading(true);
    try {
      const q = query(
        collection(db, "news_comments"),
        where("newsId", "==", "hyeonwon_cinema")
      );
      const snapshot = await getDocs(q);
      const msgs: GuestbookMessage[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        msgs.push({
          id: doc.id,
          newsId: data.newsId,
          author: data.author,
          content: data.content,
          likes: data.likes || 0,
          stance: data.stance || "공감",
          createdAt: data.createdAt,
          rating: data.rating || 5,
          badge: data.badge || "🌱 시민 소인단",
          avatar: data.avatar || "💬",
          isPhotocard: data.isPhotocard || false,
          ticketMovie: data.ticketMovie || "",
          ticketSticker: data.ticketSticker || "",
          ticketSeat: data.ticketSeat || "",
          ticketVibeColor: data.ticketVibeColor || "",
          reactions: data.reactions || { like: 0, fire: 0, mindblown: 0, crying: 0 }
        });
      });
      // Sort by date or ID fallback
      msgs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setGuestbookMessages(msgs);
    } catch (err) {
      console.error("Failed to load guestbook from Firestore, using mock initial messages", err);
      // Fallback beautiful pre-populated guestbook
      setGuestbookMessages([
        {
          id: "m1",
          newsId: "hyeonwon_cinema",
          author: "그린이솔러",
          content: "현원 감독님의 '동물의 시선' 단편작을 예술영화전용관에서 보고 너무 깊은 전율을 느꼈습니다. 동물들이 원망하는 눈빛이 아니라, 그저 슬프게 바라보며 원림을 가르는 모습이 가슴을 울렸어요. 영원히 응원합니다!",
          likes: 45,
          stance: "🌱 생명",
          createdAt: "2026-05-14",
          rating: 5,
          badge: "🥑 비건 시네필",
          avatar: "🦊",
          reactions: { like: 12, fire: 8, mindblown: 5, crying: 2 }
        },
        {
          id: "m2",
          newsId: "hyeonwon_cinema",
          author: "시네마매니아",
          content: "국내 최초의 AI 독립영화사 '비건AI무비' 설립 소식을 뉴스로 보고 정말 멋지다고 생각했습니다. AI 기술을 그저 돈벌이가 아니라, 환경과 생명을 조명하는 따뜻한 도구로 사용한다는 비전이야말로 진정한 영화계의 미래입니다.",
          likes: 38,
          stance: "🎬 영화",
          createdAt: "2026-05-13",
          rating: 5,
          badge: "🍿 방구석 평론가",
          avatar: "🍿",
          reactions: { like: 15, fire: 14, mindblown: 4, crying: 0 }
        },
        {
          id: "m3",
          newsId: "hyeonwon_cinema",
          author: "스마트파머",
          content: "[이솔만평] 매번 챙겨보는 애독자입니다. 그림선 하나하나에 서민들에 대한 연민과 애정이 넘쳐나요. 골목상권을 플랫폼이 쥐어짜는 만평을 보며 울컥했습니다. 감독님의 펜과 메가폰은 언제나 정직한 사람들을 지켜주는 아가도스입니다.",
          likes: 52,
          stance: "💡 진실",
          createdAt: "2026-05-12",
          rating: 4,
          badge: "🔥 연출 전사",
          avatar: "🦁",
          reactions: { like: 20, fire: 9, mindblown: 8, crying: 5 }
        }
      ]);
    } finally {
      setIsMessagesLoading(false);
    }
  };

  const handlePostMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!writerName.trim() || !newMessage.trim()) {
      toast.error("필명과 응원 메시지를 모두 작성해 주십시오.");
      return;
    }

    if (newMessage.trim().length < 5) {
      toast.error("소중한 의견을 위해 최소 5자 이상의 응원 한마디를 적어주세요.");
      return;
    }

    setIsSubmittingMessage(true);
    const dateStr = new Date().toLocaleDateString();
    const messagePayload = {
      newsId: "hyeonwon_cinema",
      author: writerName,
      stance: selectedEmoji,
      content: newMessage,
      likes: 0,
      createdAt: dateStr,
      rating: rating,
      badge: selectedBadge,
      avatar: selectedAvatar,
      isPhotocard: false,
      reactions: { like: 0, fire: 0, mindblown: 0, crying: 0 }
    };

    try {
      const docRef = doc(collection(db, "news_comments"));
      await setDoc(docRef, messagePayload);
      setGuestbookMessages((prev) => [
        { id: docRef.id, ...messagePayload },
        ...prev
      ]);
      setNewMessage("");
      toast.success("✍️ 감독님께 응원의 소신 한마디와 평점이 영구 보관함에 타전되었습니다!");
    } catch (err) {
      console.warn("Firestore save failed, adding to local guestbook state", err);
      const fallbackId = "cmt_local_" + Date.now();
      setGuestbookMessages((prev) => [
        { id: fallbackId, ...messagePayload },
        ...prev
      ]);
      setNewMessage("");
      toast.success("✍️ 응원 메시지와 평점이 등록되었습니다 (로컬 세션)");
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  const handleLikeMessage = async (msgId: string) => {
    setGuestbookMessages((prev) =>
      prev.map((m) => (m.id === msgId ? { ...m, likes: m.likes + 1 } : m))
    );
    toast.success("👍 소중한 공감 클릭이 전파되었습니다.");
  };

  const handleReactionClick = async (msgId: string, reactionType: "like" | "fire" | "mindblown" | "crying") => {
    setGuestbookMessages((prev) =>
      prev.map((m) => {
        if (m.id === msgId) {
          const r = m.reactions || { like: 0, fire: 0, mindblown: 0, crying: 0 };
          return {
            ...m,
            reactions: {
              ...r,
              [reactionType]: (r[reactionType] || 0) + 1
            }
          };
        }
        return m;
      })
    );
    const emojiSymbol = reactionType === "like" ? "🥑" : reactionType === "fire" ? "🔥" : reactionType === "mindblown" ? "🧠" : "🥲";
    toast.success(`${emojiSymbol} 반응이 노출 피드에 실시간 전송되었습니다!`);
  };

  const handleVoteBalance = (option: "A" | "B") => {
    if (balanceGameVote) {
      toast.error("이미 끝장 밸런스 게임에 참가 완료한 씨네필입니다! 🤫");
      return;
    }
    setBalanceGameVote(option);
    localStorage.setItem("hyeonwon_balance_vote", option);
    setBalanceGameVotes(prev => ({
      ...prev,
      optionA: option === "A" ? prev.optionA + 1 : prev.optionA,
      optionB: option === "B" ? prev.optionB + 1 : prev.optionB,
    }));
    toast.success(`🗳️ [${option === "A" ? "옵션 A" : "옵션 B"}]에 소중한 영화적 주권을 행사했습니다!`);
  };

  const handleShareTicketToFeed = async () => {
    if (!ticketName.trim()) {
      toast.error("포토티켓에 마킹할 필명을 입력해 주세요!");
      return;
    }
    setIsSubmittingMessage(true);
    const dateStr = new Date().toLocaleDateString();
    
    const ticketPayload = {
      newsId: "hyeonwon_cinema",
      author: ticketName,
      stance: "🎫 티켓",
      content: ticketComment || "나만의 고품격 시네필 포토티켓을 발행했습니다! 🍿",
      likes: 0,
      createdAt: dateStr,
      rating: 5,
      badge: "🎨 티켓 아티스트",
      avatar: "🎟️",
      isPhotocard: true,
      ticketMovie: ticketMovie,
      ticketSticker: ticketSticker,
      ticketSeat: ticketSeat,
      ticketVibeColor: ticketVibeColor,
      reactions: { like: 2, fire: 5, mindblown: 1, crying: 0 }
    };

    try {
      const docRef = doc(collection(db, "news_comments"));
      await setDoc(docRef, ticketPayload);
      setGuestbookMessages((prev) => [
        { id: docRef.id, ...ticketPayload },
        ...prev
      ]);
      toast.success("🎟️ 나만의 한정판 포토티켓이 [씨네필 소통 라운지] 실시간 피드에 전시되었습니다! 팬들이 반응할 준비 완료!");
    } catch (err) {
      console.warn("Firestore save failed, fallback to local state", err);
      const fallbackId = "cmt_local_ticket_" + Date.now();
      setGuestbookMessages((prev) => [
        { id: fallbackId, ...ticketPayload },
        ...prev
      ]);
      toast.success("🎟️ 포토티켓이 소통 라운지 피드에 마킹되었습니다 (로컬 세션)");
    } finally {
      setIsSubmittingMessage(false);
    }
  };

  // Audition Evaluation steps
  const loadingSteps = [
    "🎬 프로덕션 가상 대본 로드 중... (Loading digital scripts...)",
    "🧐 김현원 감독의 고유 시각 필터 적용 중... (Applying director's aesthetic lens...)",
    "🌲 생태 ∙ 비건 시네마 철학적 부합성 분석 중... (Evaluating eco-philosophy affinity...)",
    "⚖️ 주연 및 캐릭터 톤앤매너 싱크 연산 중... (Calculating dramaturgical synchronization...)",
    "🌟 맞춤형 가상 오디션 배역 판정서 정비 완료! (Finalizing cast recommendation slate...)"
  ];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isEvaluating) {
      setEvaluationStep(0);
      interval = setInterval(() => {
        setEvaluationStep((prev) => (prev < loadingSteps.length - 1 ? prev + 1 : prev));
      }, 2500);
    }
    return () => clearInterval(interval);
  }, [isEvaluating]);

  const saveAuditionToDb = async (resultData: AuditionResult) => {
    try {
      const docRef = doc(collection(db, "auditions"));
      await setDoc(docRef, {
        actorName,
        actorAge,
        actorGender,
        roleType,
        genre,
        speechText,
        userNote,
        castingResult: resultData.castingResult,
        actingScore: resultData.actingScore,
        veganCompatibilityScore: resultData.veganCompatibilityScore,
        assignedRole: resultData.assignedRole,
        visualTone: resultData.visualTone,
        directorReview: resultData.directorReview,
        createdAt: new Date().toISOString(),
        status: "대기 (Pending Review)"
      });
      console.log("Audition successfully saved to Firestore with ID:", docRef.id);
    } catch (dbErr) {
      console.warn("Failed to persist audition to Firestore", dbErr);
    }
  };

  const handleStartAudition = async () => {
    if (!actorName.trim()) {
      toast.error("지망 배우의 성명을 입력해 주세요.");
      return;
    }
    if (!speechText.trim()) {
      toast.error("오디션용 자유 연기 대사 또는 포부를 한마디 입력해 주세요.");
      return;
    }

    setIsEvaluating(true);
    setAuditionResult(null);

    try {
      const res = await fetch("/api/evaluate-audition", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          actorName,
          actorAge,
          actorGender,
          roleType,
          genre,
          speechText,
          actingMood,
          userNote
        })
      });

      const jsonResult = await res.json();
      if (jsonResult.success && jsonResult.data) {
        setTimeout(async () => {
          setAuditionResult(jsonResult.data);
          setIsEvaluating(false);
          await saveAuditionToDb(jsonResult.data);
          toast.success("🎬 김현원 감독의 가상 오디션 심사 결과가 타전되었습니다!");
        }, 1500);
      } else {
        throw new Error("API parsing failure or fallback required");
      }
    } catch (err) {
      console.warn("Casting simulation API failed, using high-quality local deterministic engine", err);
      setTimeout(async () => {
        // High-quality artistic deterministic fallback
        const mockResult: AuditionResult = {
          castingResult: "감독 특별 지명 (Director's Special Designation)",
          actingScore: Math.floor(Math.random() * 11) + 90, // 90~100
          veganCompatibilityScore: Math.floor(Math.random() * 16) + 85, // 85~100
          assignedRole: `${genre.split(" ")[0]} 숲의 의식 전달자 (Eco-Messenger)`,
          visualTone: `눈빛에서 느껴지는 차분하고 우수 어린 기류와, 대사 속에 스며 있는 생명 존중에 대한 사려 깊은 성품이 극에 풍성한 입체적 마스크를 제공함.`,
          directorReview: `안녕하십니까, 김현원 감독입니다. 보내주신 대사 "${speechText.slice(0, 15)}..." 속에서 마디마디 맺히는 연기의 순수한 중력과 따뜻한 진심의 울림을 전해받았습니다. 요즘 스펙터클에만 집중하는 상업 영화와 달리, 우리 '비건AI무비'는 생명의 고결함과 지구 생태의 외침을 영화라는 가장 포근한 혁명의 그릇에 담아내는 것을 평생의 모토로 삼고 있습니다. 배우님의 마스크와 목소리 질감은 생태와 문명의 충돌 사이에서 깊이 방황하고 투쟁하는 입체적인 캐릭터와 놀라운 조화를 이루는군요. 차기 영화 프로덕션 라인업에 귀하를 귀중한 특별 역으로 올리고 싶습니다. 시민 지성과 함께 기적 같은 프레임을 수놓아 봅시다. 뜨거운 박수를 보냅니다.`
        };
        setAuditionResult(mockResult);
        setIsEvaluating(false);
        await saveAuditionToDb(mockResult);
        toast.success("🎬 김현원 감독의 가상 오디션 심사서가 완성되었습니다!");
      }, 3000);
    }
  };

  return (
    <div className="w-full bg-zinc-950 text-zinc-100 rounded-3xl border border-zinc-900 shadow-2xl overflow-hidden font-sans">
      
      {/* 🌟 Elegant Hero Cinematic Header */}
      <div className="relative bg-gradient-to-r from-stone-950 via-zinc-900 to-amber-950/40 p-8 md:p-12 border-b border-zinc-900 overflow-hidden">
        {/* Background glow circle */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-10 -bottom-20 w-60 h-60 bg-red-650/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-4">
          <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full">
            <Flame className="w-3.5 h-3.5 animate-pulse" />
            이솔나라 거장 시네포트폴리오
          </span>
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white font-serif">
            🎬 현원 시네마 예술관
          </h2>
          <p className="text-xs md:text-sm text-stone-400 font-bold max-w-2xl leading-relaxed">
            비건 영화의 선구자이자 펜과 메가폰으로 시대적 풍자와 생명 연대의 숭고함을 그려내는 김현원(Hyeon-won) 감독의 세계에 오신 것을 환영합니다. 그의 연출 명작, 예술 만평, 그리고 당신이 주인공이 되는 가상 오디션 룸을 마음껏 탐방해 보세요.
          </p>
          <div className="pt-2 flex flex-wrap gap-x-6 gap-y-2 text-[11px] text-stone-500 font-extrabold tracking-wider uppercase font-mono border-t border-zinc-900">
            <span className="flex items-center gap-1.5"><User className="w-3.5 h-3.5 text-amber-500" /> 김현원 (KIM HYEON-WON)</span>
            <span className="flex items-center gap-1.5"><Award className="w-3.5 h-3.5 text-amber-500" /> 비건AI무비 설립자 ∙ 대표교임</span>
            <span className="flex items-center gap-1.5"><Leaf className="w-3.5 h-3.5 text-emerald-500" /> 생명존중 영화 미학</span>
          </div>
        </div>
      </div>

      {/* 🍿 Inner Tab Switcher */}
      <div className="flex border-b border-zinc-900 bg-zinc-950/80 sticky top-0 z-40 backdrop-blur-md overflow-x-auto no-scrollbar scroll-smooth">
        {[
          { id: "profile", label: "감독 연혁 ∙ 비전", icon: User },
          { id: "filmography", label: "필모그래피 (출연/연출)", icon: Film },
          { id: "cartoons", label: "이솔 예술만평관", icon: Camera },
          { id: "audition", label: "현원 감독 오디션룸", icon: Sparkles },
          { id: "playground", label: "🔥 MZ 놀이터 (Behind/DIY)", icon: Flame },
          { id: "guestbook", label: "시민 응원 게시판", icon: Megaphone }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveSubTab(tab.id as any);
                setAuditionResult(null);
              }}
              className={`flex-1 py-4.5 px-5 text-xs md:text-sm font-black flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer shrink-0 whitespace-nowrap ${
                isActive
                  ? "border-amber-500 text-amber-500 bg-amber-500/5 font-black"
                  : "border-transparent text-zinc-500 hover:text-zinc-300"
              }`}
            >
              <TabIcon className={`w-4 h-4 ${isActive ? "text-amber-500" : "text-zinc-650"}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 🎬 Main Sub Tab Content Panel */}
      <div className="p-6 md:p-10 bg-[#070708] min-h-[500px]">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: PROFILE & VISION */}
          {activeSubTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-8 md:space-y-12 text-left"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-stretch">
                {/* Visual Cover art */}
                <div className="lg:col-span-5 flex flex-col justify-between p-6 bg-zinc-900/40 rounded-3xl border border-zinc-900 relative overflow-hidden shadow-lg group">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                  <img
                    src="https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&q=80&w=800"
                    alt="Director Kim Hyeon-won Vision cover"
                    className="absolute inset-0 w-full h-full object-cover opacity-30 group-hover:scale-102 transition-transform duration-1000"
                  />
                  <div className="relative z-20 space-y-6 flex flex-col justify-between h-full">
                    <span className="w-fit text-[9px] font-black bg-emerald-600/10 border border-emerald-500/30 text-emerald-400 px-3 py-1 rounded-full uppercase tracking-wider">
                      DIRECTOR PHILOSOPHY
                    </span>
                    <div className="space-y-4">
                      <p className="text-xl md:text-2xl font-bold font-serif text-white italic leading-snug tracking-tight">
                        "비건AI무비는 단순히 식자재를 제한하는 차원을 넘어, 혹성 위의 고통받는 모든 무구한 생명을 연민하고, 영화 촬영 단계의 탄소 배출과 생태계 생채기를 AI 생성 기술로 100% 제로화하여 지구를 정화하는 가장 지속 가능한 예술적 공존입니다."
                      </p>
                      <p className="text-xs text-stone-500 font-extrabold font-sans uppercase tracking-widest pt-2 border-t border-zinc-800">
                        — 김현원 감독 명언록 중
                      </p>
                    </div>
                  </div>
                </div>

                {/* Biography detail text */}
                <div className="lg:col-span-7 space-y-6 flex flex-col justify-center">
                  <h3 className="text-xl md:text-2xl font-black text-white font-serif">
                    🎬 따뜻한 치유와 혁명의 스크린을 수립하다
                  </h3>
                  <div className="text-zinc-400 text-xs md:text-sm font-semibold space-y-4 leading-relaxed">
                    <p>
                      거장 현원 감독은 기후 위기와 무조건적인 산업화 속에서 소외되는 자연의 숨결을 스크린 중심에 세우기 위해 일평생 헌신해 온 영화계의 선구자입니다. 특히 그는 한국 최초의 인공지능 전문 영화사 <span className="text-amber-500 font-bold">"비건AI무비"</span>를 직접 창립하여, 야생 환경에 유해한 흔적을 남기지 않고도 위대한 예술을 온전히 연출할 수 있는 미래형 친환경 하이브리드 시네마의 새 지평을 활짝 열어젖혔습니다.
                    </p>
                    <p>
                      특히 2026년부터는 다섯 명의 AI 예술가(이솔, 라온, 가온, 아린, 다온)로 구성된 <span className="text-amber-400 font-bold">‘더 비건스(The Vegans)’</span> 프로젝트를 본격적으로 가동하고 있습니다. 이 가상 캐릭터들은 단순한 디지털 껍데기가 아닌, 감성과 치유의 선율을 전달하는 홀로그램 가수로써 대중의 고단한 마음에 평화와 위로를 건네는 시대적 소명을 지니고 있습니다.
                    </p>
                    <p>
                      또한 현원 감독은 <span className="text-white font-bold">[이솔만평]</span>을 통해 수려한 미술적 필체로 서민의 아픔과 사회적 이슈를 따뜻하게 꼬집고 있으며, 가짜 뉴스의 어둠 속에서 진실의 촛불을 팩트체크로 밝혀내는 언론관도 유감없이 실현하고 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              {/* Core value Bento block */}
              <div className="space-y-4">
                <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest font-mono">
                  ✨ 김현원 감독의 3대 예술 비전
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      num: "01",
                      title: "생명 존중 & 자연 공존 (Eco-Centric Coexistence)",
                      desc: "영화 촬영 시 살아있는 그 어떤 무구한 유기체도 스트레스를 받거나 상처 입지 않도록 보전합니다. 동물의 눈으로 렌즈의 시점을 전환하여 그들의 조용한 목소리를 무성 잉크 톤의 미장센으로 승화합니다."
                    },
                    {
                      num: "02",
                      title: "탄소 제로 무비 메이킹 (Carbon-Zero Virtual Production)",
                      desc: "대규모 야외 세트장 가설과 디젤 전력차 등 야생 생태계에 심각한 발자국을 남기던 전통 영화 촬영 방식을 완전히 혁파합니다. 최첨단 AI 생성 기술과 가상 스튜디오 융합을 통해 탄소 배출 100% 제로의 진정한 '친환경 비건 시네마'를 구현합니다."
                    },
                    {
                      num: "03",
                      title: "더 비건스 감성 치유 (The Vegans Connection)",
                      desc: "AI 배우 겸 홀로그램 가수 '이솔'을 필두로 구성된 5인의 가상 예술가팀 '더 비건스(The Vegans)' 프로젝트를 가동합니다. 이들이 뿜어내는 수려한 음악과 감성, 홀로그램 빛을 매개로 현대인의 아픈 일상을 촉촉하게 위로하고 정화합니다."
                    }
                  ].map((val) => (
                    <div key={val.num} className="bg-zinc-900/20 p-6 rounded-2xl border border-zinc-900/80 hover:border-amber-500/20 transition-all flex flex-col gap-3">
                      <span className="text-2xl font-black text-amber-500/30 font-mono leading-none">{val.num}</span>
                      <h5 className="text-sm font-black text-white">{val.title}</h5>
                      <p className="text-[11.5px] text-zinc-500 font-bold leading-normal">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Improvement 6: 더 비건스(The Vegans) 5인 AI 배우 캐릭터 소개 카드 */}
              <div className="space-y-4 pt-6 border-t border-zinc-900/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase text-amber-500 tracking-widest font-mono flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                    더 비건스 (The Vegans) 5인 AI 배우 캐릭터 프로필
                  </h4>
                  <span className="text-[10px] text-zinc-500 font-extrabold uppercase font-mono">
                    Virtual AI Artists Collective
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    {
                      name: "이솔 (Isol)",
                      role: "메인 리드 액트리스 ∙ 힐링 보컬",
                      color: "border-amber-500/20 text-amber-400 bg-amber-500/5",
                      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=300",
                      spec: "심전도 동조형 감성 주파수 탑재",
                      desc: "비건AI무비의 영원한 아이콘. 현대인의 아픈 영혼에 소요하는 빛과 치유를 목소리로 직조합니다."
                    },
                    {
                      name: "라온 (Raon)",
                      role: "홀로그램 보컬 ∙ 민속 비트 연주가",
                      color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
                      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=300",
                      spec: "전통 장단 및 바이오 신스 완벽 합성",
                      desc: "국악의 유기적인 리듬과 현대적인 사이키델릭 신스를 결합해 생태적 쾌활함을 표현합니다."
                    },
                    {
                      name: "가온 (Gaon)",
                      role: "생태 무용수 ∙ 감정 액터",
                      color: "border-rose-500/20 text-rose-400 bg-rose-500/5",
                      avatar: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=300",
                      spec: "물결 및 나뭇잎 휘날림 동역학 무용",
                      desc: "자연의 거친 파도와 부드러운 산풍의 무브먼트를 메타휴먼 동역학 시뮬레이션으로 수립합니다."
                    },
                    {
                      name: "아린 (Arin)",
                      role: "멀티 악기 멀티 아티스트",
                      color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5",
                      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300",
                      spec: "우주 노이즈 및 지구 소리 오케스트레이션",
                      desc: "빙하가 녹아내리는 소리, 바람 소리 등 지구 고유의 사운드를 주파수로 가공해 치유 음악을 주조합니다."
                    },
                    {
                      name: "다온 (Daon)",
                      role: "치유 나레이터 ∙ 서브 보컬",
                      color: "border-purple-500/20 text-purple-400 bg-purple-500/5",
                      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=300",
                      spec: "트라우마 완화 성대 주파수 융합",
                      desc: "속삭이는 듯 깊은 성성으로 전후 치유 및 깊은 평화 수면 유도 보이스 테라피를 전문으로 합니다."
                    }
                  ].map((member) => (
                    <div 
                      key={member.name} 
                      className={`border p-3.5 rounded-2xl flex flex-col gap-2.5 hover:scale-[1.02] transition-all cursor-default ${member.color}`}
                    >
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-white/10 shrink-0 self-center">
                        <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="text-center space-y-1">
                        <h5 className="text-xs font-black text-white">{member.name}</h5>
                        <p className="text-[9.5px] font-black text-zinc-400 line-clamp-1">{member.role}</p>
                      </div>
                      <div className="bg-zinc-950/40 p-2 rounded-lg text-[9px] font-mono text-zinc-500 dark:text-zinc-400 text-center">
                        ⚡ {member.spec}
                      </div>
                      <p className="text-[10px] text-zinc-500 font-semibold leading-normal text-left line-clamp-3">
                        {member.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 2: FILMOGRAPHY */}
          {activeSubTab === "filmography" && (
            <motion.div
              key="filmography"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-left animate-in fade-in duration-300"
            >
              <div className="space-y-1.5">
                <h3 className="text-xl md:text-2xl font-black text-white font-serif">
                  🎬 현원 감독 필모그래피 (출연 ∙ 연출작)
                </h3>
                <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                  자연과 인간, 기계와 영혼의 충돌과 공존을 꿰뚫는 현원 감독의 고유 대표 작품 아카이브입니다.
                </p>
              </div>

              <div className="space-y-6">
                {films.map((film) => {
                  const isExpanded = expandedFilmId === film.id;
                  return (
                    <div 
                      key={film.id}
                      className="bg-zinc-900/10 hover:bg-zinc-900/15 border border-zinc-900/80 hover:border-amber-500/15 rounded-3xl p-4 md:p-6 transition-all duration-300 space-y-4"
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        {/* Film Poster/Image aspect ratio */}
                        <div className="lg:col-span-4 rounded-2xl overflow-hidden aspect-[16/10] lg:aspect-[4/3] bg-zinc-950 relative shadow-md">
                          <img
                            src={film.thumbnail}
                            alt={film.title}
                            className="w-full h-full object-cover transition-transform duration-700 hover:scale-103"
                          />
                          <div className="absolute top-3 left-3 bg-zinc-950/80 backdrop-blur-md border border-zinc-800 text-amber-500 text-[9px] font-black px-2.5 py-1 rounded-md uppercase tracking-wider">
                            ★ {film.year} RELEASE
                          </div>
                        </div>

                        {/* Film Details */}
                        <div className="lg:col-span-8 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[9px] font-black px-2.5 py-0.5 rounded-sm uppercase tracking-wide">
                                {film.type}
                              </span>
                              <span className="text-zinc-500 text-[10px] font-black uppercase font-mono">{film.role}</span>
                            </div>
                            <h4 className="text-white text-lg md:text-xl font-black font-serif leading-tight">
                              {film.title}
                            </h4>
                            <p className="text-zinc-400 text-xs md:text-[12.5px] font-semibold leading-relaxed">
                              {film.description}
                            </p>
                          </div>

                          <div className="space-y-3 pt-3 border-t border-zinc-900">
                            <div className="flex items-start gap-1.5 text-stone-500 text-[11px] font-bold">
                              <Award className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                              <span>주요 영예: <strong className="text-stone-300">{film.award}</strong></span>
                            </div>
                            <div className="flex items-start gap-1.5 text-zinc-650 text-[10.5px] font-bold italic leading-normal">
                              <span className="text-amber-500/50 shrink-0 font-mono uppercase not-italic font-black text-[9px] border border-amber-500/20 px-1 rounded-xs">VIBE</span>
                              <span>"{film.vibe}"</span>
                            </div>
                            <div className="bg-zinc-900/40 p-3 rounded-xl border border-zinc-900/60 text-[11px] font-black text-amber-550/80 dark:text-amber-400/80 italic">
                              " {film.philosophy} "
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Expandable Storyboard Trigger */}
                      <div className="pt-2 flex justify-end border-t border-zinc-900/40">
                        <button
                          type="button"
                          onClick={() => {
                            setExpandedFilmId(isExpanded ? null : film.id);
                          }}
                          className="flex items-center gap-1.5 text-xs font-black text-amber-500 hover:text-amber-400 bg-zinc-950/40 border border-zinc-900 hover:border-amber-500/20 px-3.5 py-1.5 rounded-xl cursor-pointer transition-all hover:scale-103"
                        >
                          <BookOpen size={12} className="text-amber-500" />
                          <span>{isExpanded ? "📖 시놉시스 & 제작비화 접기" : "📖 감독의 숨은 제작비화 & 스토리보드 보기"}</span>
                        </button>
                      </div>

                      {/* Expandable Storyboard Panel */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="pt-4 space-y-4 border-t border-zinc-900/80">
                              <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl space-y-1.5 text-left">
                                <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest font-mono block">
                                  💡 DIRECTOR'S SECRETS MEMO (비하인드 감독 일지)
                                </span>
                                <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
                                  {film.behindMemo}
                                </p>
                              </div>

                              <div className="space-y-2">
                                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-mono block text-left">
                                  🎬 CINEMATIC STORYBOARD SEGMENT (주요 시퀀스 연출 연계)
                                </span>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                  {film.scenes?.map((scene, idx) => (
                                    <div key={idx} className="bg-zinc-950/40 border border-zinc-900 p-4 rounded-2xl space-y-2">
                                      <div className="flex items-center justify-between border-b border-zinc-900 pb-1.5">
                                        <span className="text-[9.5px] font-mono text-amber-500 font-black">{scene.num}</span>
                                        <span className="text-[11px] text-zinc-300 font-black">{scene.title}</span>
                                      </div>
                                      <p className="text-[11.5px] text-zinc-500 font-semibold leading-relaxed text-left">
                                        {scene.desc}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          )}

          {/* TAB 3: EDITORIAL CARTOONS GALLERY */}
          {activeSubTab === "cartoons" && (
            <motion.div
              key="cartoons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-left animate-in fade-in duration-300"
            >
              <div className="space-y-1.5">
                <h3 className="text-xl md:text-2xl font-black text-white font-serif">
                  🎨 현원 감독의 이솔 예술만평관
                </h3>
                <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                  인력 시장의 고단함, 고유가 서민들의 탄식, 플랫폼 지배 체제의 상처를 격조 높고 따뜻한 붓선에 녹여낸 대표 예술 만평 기획전입니다.
                </p>
              </div>

              {/* Bento grid style cartoons list */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cartoons.map((cartoon) => (
                  <div
                    key={cartoon.id}
                    onClick={() => setSelectedCartoon(cartoon)}
                    className="bg-zinc-900/10 hover:bg-zinc-900/30 border border-zinc-900 hover:border-amber-500/25 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer flex flex-col group shadow-sm hover:shadow-md hover:-translate-y-1"
                  >
                    <div className="aspect-[16/10] bg-zinc-950 relative overflow-hidden">
                      <img
                        src={cartoon.thumbnail}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-104"
                        alt={cartoon.title}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/95 via-transparent to-transparent flex flex-col justify-end p-4">
                        <span className="text-[8.5px] bg-red-600 text-white font-black px-2 py-0.5 rounded uppercase tracking-wider w-fit mb-1 font-sans">
                          만평 (Cartoon)
                        </span>
                        <h4 className="text-white text-sm font-black tracking-tight leading-snug line-clamp-1">
                          {cartoon.title}
                        </h4>
                      </div>
                    </div>
                    <div className="p-4 flex flex-col justify-between flex-1 gap-4">
                      <p className="text-zinc-500 text-[11.5px] font-bold line-clamp-3 leading-relaxed">
                        {cartoon.content}
                      </p>
                      <div className="flex items-center justify-between pt-3 border-t border-zinc-900 text-[9.5px] text-zinc-650 font-extrabold tracking-wider font-mono">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-amber-500" />
                          {cartoon.author} 화백
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {cartoon.date}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detail Cartoon Viewer Modal */}
              <AnimatePresence>
                {selectedCartoon && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/90 backdrop-blur-md z-[99] flex items-center justify-center p-4 md:p-6"
                    onClick={() => setSelectedCartoon(null)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, y: 15 }}
                      animate={{ scale: 1, y: 0 }}
                      exit={{ scale: 0.95, y: 15 }}
                      transition={{ duration: 0.3 }}
                      className="bg-zinc-950 border border-zinc-900 rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl relative"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {/* Close button */}
                      <button
                        onClick={() => setSelectedCartoon(null)}
                        className="absolute right-4 top-4 bg-zinc-900 hover:bg-red-655 text-zinc-400 hover:text-white p-2.5 rounded-full transition-colors cursor-pointer z-20"
                      >
                        ✕
                      </button>

                      {/* Giant Cartoon picture */}
                      <div className="aspect-[16/9] w-full bg-zinc-900 relative">
                        <img
                          src={selectedCartoon.thumbnail}
                          className="w-full h-full object-cover"
                          alt={selectedCartoon.title}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent pointer-events-none" />
                        <div className="absolute bottom-6 left-6 right-6 text-left">
                          <span className="text-[9px] bg-red-600 text-white font-black px-2.5 py-1 rounded uppercase tracking-wider mb-2 inline-block font-sans">
                            이솔국영 포털 헌정 만평
                          </span>
                          <h3 className="text-white text-md md:text-xl font-black font-serif tracking-tight leading-snug">
                            {selectedCartoon.title}
                          </h3>
                        </div>
                      </div>

                      {/* Narrative Description block */}
                      <div className="p-6 md:p-8 text-left space-y-4">
                        <div className="flex items-center gap-4 text-[11px] text-zinc-600 font-extrabold tracking-wider border-b border-zinc-900 pb-3">
                          <span>화백: <strong className="text-zinc-400">{selectedCartoon.author}</strong></span>
                          <span>타전일자: <strong className="text-zinc-400">{selectedCartoon.date}</strong></span>
                        </div>
                        <p className="text-zinc-400 text-xs md:text-sm font-semibold leading-relaxed">
                          {selectedCartoon.content}
                        </p>
                        
                        {/* Director's artistic narrative detail */}
                        <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-xl text-[11px] md:text-xs text-amber-500/90 font-black italic leading-relaxed">
                          📌 [화백의 연민 필치록]: "{selectedCartoon.subText}"
                        </div>
                        
                        <div className="pt-3 flex justify-end gap-2">
                          <button
                            onClick={() => {
                              setSelectedCartoon(null);
                              toast.success("🎨 감동적인 만평 감상이 기록되었습니다.");
                            }}
                            className="px-6 py-3 bg-zinc-900 hover:bg-amber-600 text-zinc-300 hover:text-zinc-950 rounded-xl text-xs font-black transition-all cursor-pointer"
                          >
                            닫기 (Close Room)
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 4: AUDITION SIMULATOR */}
          {activeSubTab === "audition" && (
            <motion.div
              key="audition"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-8 text-left animate-in fade-in duration-300"
            >
              <div className="space-y-1.5 border-b border-zinc-900 pb-4">
                <h3 className="text-xl md:text-2xl font-black text-white font-serif">
                  🎭 현원 감독의 가상 오디션 & 캐스팅 룸
                </h3>
                <p className="text-xs text-zinc-500 font-bold leading-relaxed">
                  '비건AI무비'의 주인공이 되어보세요! 인적 사항과 연기 대사를 작성해 제출하면, 김현원 감독의 AI 연출 철학 필터를 통해 즉각 배역 조율 및 맞춤 심사 평가서를 발급해 드립니다.
                </p>
              </div>

              <AnimatePresence mode="wait">
                
                {/* 1. Loading Step View */}
                {isEvaluating && (
                  <motion.div
                    key="evaluating"
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex flex-col items-center justify-center py-16 px-4 text-center min-h-[350px]"
                  >
                    <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
                      <div className="absolute inset-0 rounded-full border-4 border-amber-950" />
                      <div className="absolute inset-0 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                      <Film className="w-8 h-8 text-amber-500 animate-pulse" />
                    </div>
                    
                    <h3 className="text-lg font-black text-zinc-100 mb-2 font-serif">
                      김현원 감독 심사위원단 대본 해독 중...
                    </h3>
                    
                    <div className="h-6 overflow-hidden max-w-md mx-auto">
                      <motion.div
                        key={evaluationStep}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -20, opacity: 0 }}
                        transition={{ duration: 0.4 }}
                        className="text-xs text-amber-500 font-extrabold"
                      >
                        {loadingSteps[evaluationStep]}
                      </motion.div>
                    </div>

                    <div className="w-full max-w-xs bg-zinc-900 rounded-full h-1.5 mt-6 overflow-hidden">
                      <div 
                        className="bg-gradient-to-r from-amber-600 to-amber-400 h-full transition-all duration-1000"
                        style={{ width: `${((evaluationStep + 1) / loadingSteps.length) * 100}%` }}
                      />
                    </div>
                    <p className="text-[9px] text-zinc-650 mt-3 uppercase tracking-widest font-mono">
                      Gemini-3.5 Cinematic Audition Engine
                    </p>
                  </motion.div>
                )}

                {/* 2. Audition Input Form */}
                {!isEvaluating && !auditionResult && (
                  <motion.div
                    key="audition-form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch"
                  >
                    {/* Left Form (7 cols) */}
                    <div className="lg:col-span-7 space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                            지망 배우명 (Actor Name) *
                          </label>
                          <input
                            type="text"
                            value={actorName}
                            onChange={(e) => setActorName(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            onKeyUp={(e) => e.stopPropagation()}
                            onKeyPress={(e) => e.stopPropagation()}
                            placeholder="예: 이솔, 전진서, 시민기자"
                            className="w-full text-xs p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none transition-colors dark:text-zinc-100 font-bold"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                            가상 연령대 (Dramatic Age) *
                          </label>
                          <select
                            value={actorAge}
                            onChange={(e) => setActorAge(e.target.value)}
                            className="w-full text-xs p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none transition-colors text-zinc-300 font-bold"
                          >
                            <option value="아역 (10대 이하)">아역 (10대 이하)</option>
                            <option value="청소년 (10대)">청소년 (10대)</option>
                            <option value="청년 (20대)">청년 (20대)</option>
                            <option value="장년 (30~40대)">장년 (30~40대)</option>
                            <option value="중년 (50~60대)">중년 (50~60대)</option>
                            <option value="노년 (70대 이상)">노년 (70대 이상)</option>
                          </select>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                            지망 배역 유형 (Desired Role)
                          </label>
                          <select
                            value={roleType}
                            onChange={(e) => setRoleType(e.target.value)}
                            className="w-full text-xs p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none transition-colors text-zinc-300 font-bold"
                          >
                            <option value="주연 (Protagonist)">주연 (Protagonist) - 정의로운 수호자</option>
                            <option value="안티히어로 (Anti-Hero)">안티히어로 (Anti-Hero) - 어둠을 삼킨 영웅</option>
                            <option value="빌런/갈등자 (Villain)">빌런/갈등자 (Villain) - 입체적 적대자</option>
                            <option value="비밀 가이드 (Mysterious Sage)">비밀 가이드 (Mysterious Sage) - 신비로운 도반</option>
                            <option value="생태 전령사 (Eco-Messenger)">생태 전령사 (Eco-Messenger) - 지구의 목소리</option>
                          </select>
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                            오디션 영화 장르 (Film Genre)
                          </label>
                          <select
                            value={genre}
                            onChange={(e) => setGenre(e.target.value)}
                            className="w-full text-xs p-3.5 bg-zinc-900 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none transition-colors text-zinc-300 font-bold"
                          >
                            <option value="비건 생태 SF (Eco-Vegan SF)">비건 생태 SF (Eco-Vegan SF)</option>
                            <option value="로맨틱 미스터리 (Romantic Mystery)">로맨틱 미스터리 (Romantic Mystery)</option>
                            <option value="서스펜스 심리 스릴러 (Psychological Thriller)">서스펜스 심리 스릴러 (Psychological Thriller)</option>
                            <option value="대하 서사 다큐 (Epic Civic Documentary)">대하 서사 다큐 (Epic Civic Documentary)</option>
                          </select>
                        </div>
                      </div>

                      {/* Improvement 5: 오디션 연기 무드(actingMood) 다변화 */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                          🌌 오디션 주연 연기 감성 무드 (Dramatic Acting Mood)
                        </label>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                          {[
                            {
                              key: "cosmic_sorrow",
                              label: "🌌 우주적 비장함",
                              sub: "상실과 슬픈 연민",
                              color: "border-purple-500/20 text-purple-400 bg-purple-500/5",
                              activeColor: "border-purple-500 text-purple-300 bg-purple-500/10 shadow-lg shadow-purple-500/5"
                            },
                            {
                              key: "heartwarming_vegan",
                              label: "🌱 따뜻한 공존",
                              sub: "생태 치유와 상생",
                              color: "border-emerald-500/20 text-emerald-400 bg-emerald-500/5",
                              activeColor: "border-emerald-500 text-emerald-300 bg-emerald-500/10 shadow-lg shadow-emerald-500/5"
                            },
                            {
                              key: "rebellious_green",
                              label: "🔥 친환경 혁명",
                              sub: "지구 수호적 저항",
                              color: "border-rose-500/20 text-rose-400 bg-rose-500/5",
                              activeColor: "border-rose-500 text-rose-300 bg-rose-500/10 shadow-lg shadow-rose-500/5"
                            },
                            {
                              key: "spiritual_healing",
                              label: "💡 영적 홀로그램",
                              sub: "초월적 빛과 위로",
                              color: "border-cyan-500/20 text-cyan-400 bg-cyan-500/5",
                              activeColor: "border-cyan-500 text-cyan-300 bg-cyan-500/10 shadow-lg shadow-cyan-500/5"
                            }
                          ].map((mood) => {
                            const isSelected = actingMood === mood.key;
                            return (
                              <button
                                key={mood.key}
                                type="button"
                                onClick={() => {
                                  toast.success(`🎭 [${mood.label}] 감성 장치 튜닝 완료!`);
                                  setActingMood(mood.key);
                                }}
                                className={`p-3 rounded-2xl border text-left flex flex-col gap-1 transition-all cursor-pointer select-none hover:scale-[1.02] ${
                                  isSelected ? mood.activeColor : `${mood.color} hover:border-zinc-800`
                                }`}
                              >
                                <span className="text-[11.5px] font-black">{mood.label}</span>
                                <span className="text-[9px] text-zinc-500 font-bold">{mood.sub}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                          🎭 실전 오디션 대본 ∙ 연기 독백 (Monologue / Monologue script) *
                        </label>
                        <textarea
                          rows={4}
                          value={speechText}
                          onChange={(e) => setSpeechText(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          onKeyPress={(e) => e.stopPropagation()}
                          placeholder="감독의 심금을 울릴 자신만의 독백이나 대사, 혹은 감독님을 향한 뜨거운 정직한 포부를 입력하세요. (예: '나뭇잎 한 장도 그냥 지지 않아... 들리나요? 이 숲이 우는 소리가!')"
                          className="w-full text-xs p-4 bg-zinc-900/60 border border-zinc-800 rounded-2xl focus:border-amber-500 outline-none transition-colors dark:text-zinc-100 placeholder-zinc-650 leading-relaxed font-semibold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[11px] font-black text-zinc-400 uppercase tracking-wider block">
                          📝 감독님께 전하는 각별한 메시지 (Message to Director)
                        </label>
                        <input
                          type="text"
                          value={userNote}
                          onChange={(e) => setUserNote(e.target.value)}
                          onKeyDown={(e) => e.stopPropagation()}
                          onKeyUp={(e) => e.stopPropagation()}
                          onKeyPress={(e) => e.stopPropagation()}
                          placeholder="예: '감독님 꼭 비건 영화 주연으로 뽑히고 싶습니다!', '김현원 감독님의 잉크톤 미학을 존경합니다.'"
                          className="w-full text-xs p-3.5 bg-zinc-900/60 border border-zinc-800 rounded-xl focus:border-amber-500 outline-none transition-colors dark:text-zinc-100 font-bold placeholder-zinc-650"
                        />
                      </div>

                      <button
                        onClick={handleStartAudition}
                        disabled={!actorName.trim() || !speechText.trim()}
                        className={`w-full py-4.5 rounded-xl text-xs font-black flex items-center justify-center gap-2.5 shadow-lg transition-all ${
                          actorName.trim() && speechText.trim()
                            ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-700 hover:to-amber-600 text-zinc-950 font-black cursor-pointer hover:-translate-y-0.5 active:translate-y-0 shadow-amber-500/10"
                            : "bg-zinc-900 text-zinc-600 border border-zinc-800 cursor-not-allowed"
                        }`}
                      >
                        <UserCheck className="w-4 h-4" />
                        <span>김현원 감독 오디션 프로덕션 제출하기</span>
                      </button>
                    </div>

                    {/* Right Info Box (5 cols) */}
                    <div className="lg:col-span-5 bg-zinc-900/20 border border-zinc-900 p-6 rounded-3xl flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <span className="text-[9.5px] bg-amber-500/10 border border-amber-500/20 text-amber-500 px-2.5 py-1 rounded font-mono uppercase font-black block w-fit">
                          AUDITION REGISTRATION INFO
                        </span>
                        <h4 className="text-md font-black text-white font-serif leading-snug">
                          현원 감독의 오디션 전제 가이드라인
                        </h4>
                        <div className="space-y-3.5 text-[11.5px] text-zinc-500 leading-relaxed font-bold">
                          <p>
                            1. <span className="text-stone-300">정직한 눈빛과 포지션:</span> 화려한 외모보다, 프레임 속에 스며드는 순수한 감성과 진솔한 발성을 높이 평가합니다.
                          </p>
                          <p>
                            2. <span className="text-stone-300">비건 영화 지수 (Bio-Harmony):</span> 자연에 대한 깊은 경외감과 생명 존중 미학을 공감하고 연기할 수 있는 감정선을 선호합니다.
                          </p>
                          <p>
                            3. <span className="text-stone-300">이솔뉴스 제휴 배역:</span> 선발된 후보는 '비건AI무비'의 가상 영화 큐시트에 공식 캐스팅되어, 시민 보도 포털의 이솔공방 무대에 주연으로 타전될 자격을 획득합니다.
                          </p>
                        </div>
                      </div>

                      <div className="border-t border-zinc-900 pt-4 text-center">
                        <p className="text-[10px] text-zinc-650 uppercase font-mono font-black">
                          VEGAN AI MOVIE PROD.
                        </p>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 3. Audition Results Display */}
                {!isEvaluating && auditionResult && (
                  <motion.div
                    key="audition-result"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6 max-w-3xl mx-auto"
                  >
                    {/* Control Bar */}
                    <div className="flex items-center justify-between border-b border-zinc-900 pb-3.5">
                      <div className="flex items-center gap-2 text-emerald-500 text-xs font-black">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                        <span>심사 결과 수립 완료</span>
                      </div>
                      <button
                        onClick={() => setAuditionResult(null)}
                        className="px-3.5 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white rounded-lg text-xs font-black cursor-pointer transition-colors"
                      >
                        ← 새로운 오디션 보기
                      </button>
                    </div>

                    {/* Highly Polished Audition Sheet Layout */}
                    <div className="bg-zinc-950 border border-zinc-900 rounded-3xl overflow-hidden shadow-2xl relative">
                      <div className="bg-gradient-to-r from-amber-650 to-amber-850 p-6 text-zinc-950 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[8.5px] bg-zinc-950 text-amber-400 font-mono font-black px-2 py-0.5 rounded uppercase tracking-wider">
                            VEGAN AI MOVIE casting card
                          </span>
                          <h4 className="text-zinc-950 text-xl font-black font-serif leading-none pt-1">
                            🎭 김현원 감독 가상 배역 확정서
                          </h4>
                        </div>
                        <div className="bg-zinc-950 text-amber-500 font-mono text-[11px] font-black px-4 py-2 rounded-xl shrink-0 w-fit">
                          {auditionResult.castingResult}
                        </div>
                      </div>

                      <div className="p-6 md:p-8 space-y-6 text-left">
                        
                        {/* Scores grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {/* Acting Score */}
                          <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between text-xs font-black">
                              <span className="text-zinc-500 uppercase font-mono tracking-wider">Dramatic Acting Score</span>
                              <span className="text-amber-500 font-mono">{auditionResult.actingScore} / 100</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                              <div className="bg-amber-500 h-full rounded-full" style={{ width: `${auditionResult.actingScore}%` }} />
                            </div>
                            <p className="text-[9.5px] text-zinc-600 font-bold leading-relaxed">대사 전달의 흡입력과 극적 텐션 형성 기여도.</p>
                          </div>

                          {/* Vegan score */}
                          <div className="bg-zinc-900/30 border border-zinc-900 p-4 rounded-2xl space-y-2">
                            <div className="flex justify-between text-xs font-black">
                              <span className="text-zinc-500 uppercase font-mono tracking-wider">Eco-Vegan Affinity</span>
                              <span className="text-emerald-500 font-mono">{auditionResult.veganCompatibilityScore} / 100</span>
                            </div>
                            <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                              <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${auditionResult.veganCompatibilityScore}%` }} />
                            </div>
                            <p className="text-[9.5px] text-zinc-600 font-bold leading-relaxed">생명 공감 능력 및 에코 무비 지향 가치 융합도.</p>
                          </div>
                        </div>

                        {/* Assigned Role Section */}
                        <div className="border-t border-zinc-900 pt-5 space-y-1.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono font-black tracking-wider block">Assigned Role (배정 배역)</span>
                          <p className="text-white text-md md:text-lg font-black font-serif leading-none">
                            ★ {auditionResult.assignedRole}
                          </p>
                        </div>

                        {/* Visual Tone Description */}
                        <div className="space-y-1.5">
                          <span className="text-[10px] text-zinc-500 uppercase font-mono font-black tracking-wider block">Visual Dramatic Vibe (마스크 심사)</span>
                          <p className="text-zinc-300 text-xs md:text-[12.5px] font-semibold leading-relaxed">
                            {auditionResult.visualTone}
                          </p>
                        </div>

                        {/* Detailed Director Review written in director's warm philosophical tone */}
                        <div className="bg-zinc-900/40 border border-zinc-900 p-6 rounded-2xl relative space-y-4">
                          <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                            <span className="text-xs font-black text-amber-500 uppercase tracking-widest font-mono">
                              DIRECTOR'S CASTING DIRECTIVE
                            </span>
                          </div>
                          
                          <p className="text-zinc-400 text-xs md:text-[13px] font-semibold leading-relaxed whitespace-pre-wrap font-sans">
                            {auditionResult.directorReview}
                          </p>
                        </div>

                        <div className="pt-3 flex justify-center text-zinc-650 text-[10px] font-black uppercase font-mono border-t border-zinc-900">
                          © BEGAN AI MOVIE casting studio - directed by hyeon won
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* TAB 5: CITIZENS' SUPPORT GUESTBOOK */}
          {activeSubTab === "guestbook" && (
            <motion.div
              key="guestbook"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="space-y-8 text-left animate-in fade-in duration-300"
            >
              {/* Header Banner */}
              <div className="relative overflow-hidden rounded-3xl bg-zinc-950 border border-zinc-900 shadow-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
                <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

                <div className="space-y-3 relative z-10 text-center md:text-left max-w-2xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest rounded-full">
                    <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-ping" />
                    씨네필 & 팬 소통 아지트
                  </div>
                  <h2 className="text-xl md:text-3xl font-black tracking-tight leading-tight text-white font-serif">
                    💬 씨네필 소통 라운지 (Cinephile Lounge)
                  </h2>
                  <p className="text-zinc-400 text-xs md:text-sm font-semibold leading-relaxed">
                    현원감독의 팬들과 가상 영화인들이 모여 영화적 예술 영감을 나누는 MZ 세대 소통 광장입니다. 나만의 성향 부스트 배지와 캐릭터 아바타를 장착하고, 한정판 포토티켓을 공유하며 자유롭게 타전해 보세요!
                  </p>
                </div>
                
                <div className="shrink-0 relative z-10 flex flex-col items-center gap-1.5 bg-zinc-900/60 border border-zinc-850 rounded-2xl p-4 text-center">
                  <span className="text-[28px]">🎬</span>
                  <span className="text-[10px] font-black text-amber-500 uppercase tracking-widest block">실시간 공론장</span>
                  <span className="text-[9px] text-zinc-500 font-bold">참여 시네필 640+명</span>
                </div>
              </div>

              {/* Grid: Balance Game / Stats vs Input Form */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Column 1: Balance Game & Star Stats */}
                <div className="lg:col-span-1 space-y-6">
                  {/* 1. Cinephile Balance Game */}
                  <div className="bg-zinc-900/10 border border-zinc-900/60 p-5 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-950/60 pb-3">
                      <span className="text-sm">⚖️</span>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">끝장 토론! 시네필 밸런스 게임</h4>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="p-3 bg-zinc-950/40 rounded-xl text-center">
                        <span className="text-[10.5px] font-black text-zinc-400 block uppercase tracking-wide mb-1">오늘의 난제</span>
                        <p className="text-xs font-bold text-zinc-300 leading-normal">
                          "김현원 감독이 고안할 생태 영화 중, 당신의 원픽 미학적 선택지는?"
                        </p>
                      </div>

                      {!balanceGameVote ? (
                        <div className="grid grid-cols-1 gap-2">
                          <button
                            type="button"
                            onClick={() => handleVoteBalance("A")}
                            className="p-3.5 bg-zinc-950 hover:bg-emerald-500/10 border border-zinc-850 hover:border-emerald-500/30 rounded-xl text-left transition-all active:scale-98 cursor-pointer group"
                          >
                            <span className="text-[10px] font-extrabold text-emerald-500 block mb-1">OPTION A</span>
                            <span className="text-[11.5px] font-black text-white group-hover:text-emerald-400">
                              🌱 100% 비건 AI 생성 무비
                            </span>
                            <span className="text-[9.5px] text-zinc-500 font-medium block mt-1 leading-normal">
                              환경 피해가 전혀 없으나 완전한 기계적 가상 미장센
                            </span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={() => handleVoteBalance("B")}
                            className="p-3.5 bg-zinc-950 hover:bg-amber-500/10 border border-zinc-850 hover:border-amber-500/30 rounded-xl text-left transition-all active:scale-98 cursor-pointer group"
                          >
                            <span className="text-[10px] font-extrabold text-amber-500 block mb-1">OPTION B</span>
                            <span className="text-[11.5px] font-black text-white group-hover:text-amber-400">
                              🎬 진짜 동물이 출연하는 리얼 무비
                            </span>
                            <span className="text-[9.5px] text-zinc-500 font-medium block mt-1 leading-normal">
                              생생한 실제 생명의 감정이 있으나 제작 과정에서 스트레스 유발 우려
                            </span>
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-4 py-1.5">
                          {(() => {
                            const total = balanceGameVotes.optionA + balanceGameVotes.optionB;
                            const pctA = ((balanceGameVotes.optionA / total) * 100).toFixed(1);
                            const pctB = ((balanceGameVotes.optionB / total) * 100).toFixed(1);
                            return (
                              <div className="space-y-3.5">
                                {/* Option A progress */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-black">
                                    <span className="text-emerald-400">🌱 AI 생성 비건</span>
                                    <span className="text-white font-mono">{pctA}% ({balanceGameVotes.optionA}표)</span>
                                  </div>
                                  <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-900">
                                    <div className="bg-emerald-500 h-full rounded-full transition-all duration-700" style={{ width: `${pctA}%` }} />
                                  </div>
                                </div>

                                {/* Option B progress */}
                                <div className="space-y-1">
                                  <div className="flex justify-between text-[11px] font-black">
                                    <span className="text-amber-400">🎬 실물 리얼 시네마</span>
                                    <span className="text-white font-mono">{pctB}% ({balanceGameVotes.optionB}표)</span>
                                  </div>
                                  <div className="w-full bg-zinc-950 h-3 rounded-full overflow-hidden border border-zinc-900">
                                    <div className="bg-amber-500 h-full rounded-full transition-all duration-700" style={{ width: `${pctB}%` }} />
                                  </div>
                                </div>

                                <div className="p-2.5 bg-zinc-950/60 rounded-lg text-center border border-zinc-900/60">
                                  <p className="text-[10px] text-zinc-500 font-bold leading-normal">
                                    {balanceGameVote === "A" 
                                      ? "🌱 당신은 생명에 해를 끼치지 않는 완벽한 무자극 기술주의 미학을 선택하셨습니다!"
                                      : "🎬 당신은 예술을 위해 리얼리티와 실제 존재의 소중한 감정선을 가치 있게 평가하셨습니다!"}
                                  </p>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setBalanceGameVote(null);
                                    localStorage.removeItem("hyeonwon_balance_vote");
                                  }}
                                  className="w-full py-2 bg-zinc-950 hover:bg-zinc-900 border border-zinc-850 hover:border-zinc-800 text-[10px] font-black text-zinc-400 hover:text-white rounded-lg transition-colors cursor-pointer"
                                >
                                  다시 투표하기 🗳️
                                </button>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 2. Rating distribution (compact) */}
                  <div className="bg-zinc-900/10 border border-zinc-900/60 p-5 rounded-3xl space-y-4">
                    <div className="flex items-center gap-2 border-b border-zinc-950/60 pb-3">
                      <span className="text-sm">⭐</span>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">씨네필 종합 평점</h4>
                    </div>

                    {(() => {
                      const totalComments = guestbookMessages.length;
                      const totalRating = guestbookMessages.reduce((sum, m) => sum + (m.rating || 5), 0);
                      const avgRating = totalComments > 0 ? (totalRating / totalComments).toFixed(1) : "5.0";
                      const ratingCount = [0, 0, 0, 0, 0];
                      guestbookMessages.forEach(m => {
                        const r = Math.max(1, Math.min(5, m.rating || 5));
                        ratingCount[r - 1]++;
                      });

                      return (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="text-left">
                              <h5 className="text-3xl font-black text-white font-mono leading-none">{avgRating}</h5>
                              <span className="text-[9px] text-zinc-500 font-extrabold font-mono uppercase">OUT OF 5.0 STARS</span>
                            </div>
                            <div className="flex flex-col items-end">
                              <div className="flex gap-0.5 text-amber-500 text-xs">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <Star key={i} size={11} fill={i < Math.round(Number(avgRating)) ? "currentColor" : "none"} />
                                ))}
                              </div>
                              <span className="text-[9.5px] text-zinc-400 font-bold mt-1">총 {totalComments}개의 감상 평가</span>
                            </div>
                          </div>

                          <div className="space-y-1.5 border-t border-zinc-950/40 pt-3">
                            {[5, 4, 3, 2, 1].map(stars => {
                              const count = ratingCount[stars - 1];
                              const percent = totalComments > 0 ? (count / totalComments) * 100 : 0;
                              return (
                                <div key={stars} className="flex items-center gap-2 text-[9.5px] font-bold text-zinc-500">
                                  <span className="w-8 shrink-0 text-right">{stars} Star</span>
                                  <div className="flex-1 h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                                    <div className="h-full bg-amber-500 rounded-full" style={{ width: `${percent}%` }} />
                                  </div>
                                  <span className="w-8 text-right shrink-0 font-mono text-zinc-400">{count}건</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Column 2 & 3: Upgraded Input Form */}
                <div className="lg:col-span-2 bg-zinc-900/10 border border-zinc-900 p-6 rounded-3xl space-y-6">
                  <div className="flex items-center justify-between border-b border-zinc-950/60 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">✍️</span>
                      <h4 className="text-xs font-black text-white uppercase tracking-wider">나만의 트렌디 씨네필 카드 타전하기</h4>
                    </div>
                    <span className="text-[9.5px] text-zinc-500 font-black font-mono">STEP 1. 프로필 세팅 ➜ STEP 2. 메시지 입력</span>
                  </div>

                  <form onSubmit={handlePostMessage} className="space-y-6">
                    {/* Setup 1: Avatar & Identity Badge selection */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-zinc-950/40">
                      
                      {/* Character Avatar Picker */}
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          🦊 캐릭터 아바타 선택 (Avatar preset)
                        </label>
                        <div className="flex flex-wrap gap-2 pt-1">
                          {["🦊", "🥑", "🍿", "🎬", "🚀", "🛸", "🦁", "🐼", "🔮"].map((av) => (
                            <button
                              key={av}
                              type="button"
                              onClick={() => {
                                setSelectedAvatar(av);
                                toast.success(`✨ [${av}] 아바타가 내 프로필에 투사되었습니다.`);
                              }}
                              className={`w-9 h-9 text-base flex items-center justify-center rounded-xl border transition-all cursor-pointer ${
                                selectedAvatar === av
                                  ? "bg-amber-500/15 border-amber-500/70 shadow-[0_0_12px_rgba(245,158,11,0.25)] scale-110"
                                  : "bg-zinc-950 border-zinc-900 hover:border-zinc-800 text-zinc-400"
                              }`}
                            >
                              {av}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Cinephile Identity Badge Picker */}
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          🛡️ 시네필 전용 배지 수여 (Identity Badge)
                        </label>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {[
                            "🥑 비건 시네필",
                            "🍿 방구석 평론가",
                            "🔥 연출 전사",
                            "🧠 영화 철학가",
                            "💚 이솔 수호대",
                            "🎭 가상 배우"
                          ].map((badge) => (
                            <button
                              key={badge}
                              type="button"
                              onClick={() => {
                                setSelectedBadge(badge);
                                toast.success(`🛡️ [${badge}] 호칭이 활성화되었습니다.`);
                              }}
                              className={`px-2.5 py-1 text-[9.5px] font-black rounded-lg border transition-all cursor-pointer ${
                                selectedBadge === badge
                                  ? "bg-amber-500 text-zinc-950 border-amber-400 font-extrabold"
                                  : "bg-zinc-950 border-zinc-900 text-zinc-400 hover:text-zinc-300"
                              }`}
                            >
                              {badge}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Setup 2: Support Stamp & Star selector */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-4 border-b border-zinc-950/40">
                      
                      {/* Stamp choice */}
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          🌱 응원 스탬프 고정 (Support Stamp)
                        </label>
                        <div className="flex gap-2">
                          {[
                            { emoji: "🌱", label: "생명" },
                            { emoji: "🎬", label: "영화" },
                            { emoji: "❤️", label: "연대" },
                            { emoji: "💡", label: "진실" }
                          ].map((item) => (
                            <button
                              key={item.emoji}
                              type="button"
                              onClick={() => {
                                setSelectedEmoji(item.emoji);
                                toast.success(`✨ [${item.emoji} ${item.label}] 인장 장착!`);
                              }}
                              className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-xl border text-xs font-black transition-all cursor-pointer ${
                                selectedEmoji === item.emoji
                                  ? "bg-amber-500/10 border-amber-500/60 text-amber-400 scale-102"
                                  : "bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-zinc-300"
                              }`}
                            >
                              <span>{item.emoji}</span>
                              <span className="text-[9px] font-bold">{item.label}</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Star slider */}
                      <div className="space-y-2.5">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                          ⭐ 독립영화 지지 별점 (Movie Star Rating)
                        </label>
                        <div className="flex items-center gap-1.5 pt-1">
                          {Array.from({ length: 5 }).map((_, idx) => {
                            const val = idx + 1;
                            const isGold = val <= rating;
                            return (
                              <button
                                key={val}
                                type="button"
                                onClick={() => {
                                  setRating(val);
                                  toast.success(`⭐ 지지 별점 [${val} / 5.0]을 책정했습니다.`);
                                }}
                                className="text-xl transition-transform hover:scale-125 focus:outline-none cursor-pointer"
                              >
                                <Star
                                  size={24}
                                  className={isGold ? "text-amber-500" : "text-zinc-700 hover:text-zinc-500"}
                                  fill={isGold ? "currentColor" : "none"}
                                />
                              </button>
                            );
                          })}
                          <span className="text-[10px] font-black text-amber-400 ml-2 bg-amber-500/10 px-2 py-1 rounded font-mono">{rating}.0 / 5.0</span>
                        </div>
                      </div>
                    </div>

                    {/* Nickname & Content Input */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="md:col-span-1 space-y-1.5 text-left">
                          <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                            필명 (Nickname) *
                          </label>
                          <input
                            type="text"
                            value={writerName}
                            onChange={(e) => setWriterName(e.target.value)}
                            onKeyDown={(e) => e.stopPropagation()}
                            onKeyUp={(e) => e.stopPropagation()}
                            onKeyPress={(e) => e.stopPropagation()}
                            placeholder="시네필 필명"
                            className="w-full text-xs p-3.5 bg-zinc-950 border border-zinc-850 rounded-xl focus:border-amber-500 outline-none transition-colors text-white font-bold"
                          />
                        </div>
                        
                        <div className="md:col-span-3 space-y-1.5 text-left">
                          <div className="flex justify-between items-center">
                            <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">
                              감상평 및 열린 대화 메시지 (Content) *
                            </label>
                            <span className="text-[9.5px] font-mono text-zinc-600">
                              {newMessage.length} / 250 자
                            </span>
                          </div>
                          <div className="relative flex items-center">
                            <input
                              type="text"
                              maxLength={250}
                              value={newMessage}
                              onChange={(e) => setNewMessage(e.target.value)}
                              onKeyDown={(e) => e.stopPropagation()}
                              onKeyUp={(e) => e.stopPropagation()}
                              onKeyPress={(e) => e.stopPropagation()}
                              placeholder="현원 감독님의 생태 시네마 세계관에 완벽히 매료되었습니다! "
                              className="w-full text-xs p-3.5 pr-14 bg-zinc-950 border border-zinc-850 rounded-xl focus:border-amber-500 outline-none transition-colors text-white font-semibold placeholder-zinc-700"
                            />
                            <button
                              type="submit"
                              disabled={isSubmittingMessage || !newMessage.trim() || !writerName.trim() || newMessage.trim().length < 5}
                              className="absolute right-1.5 bg-amber-500 hover:bg-amber-600 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 p-2.5 rounded-lg transition-all cursor-pointer shadow-md"
                            >
                              <Send className="w-3.5 h-3.5 shrink-0" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Quick Hashtags Buttons - Appends hashtag to input instantly */}
                      <div className="space-y-1.5 pt-1">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-wider block">
                          ⚡ 대화 템플릿 퀵-태그 (MZ Quick Hashtag)
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {[
                            "#비건시네마_챌린지",
                            "#현원감독_갓벽미장센",
                            "#이솔_생태수호단",
                            "#우주늑구_메가폰",
                            "#지속가능한_시네필",
                            "#21세기_참지성"
                          ].map(tag => {
                            const appendHashtag = (t: string) => {
                              setNewMessage(prev => {
                                const trimmed = prev.trim();
                                if (!trimmed) return t + " ";
                                if (trimmed.includes(t)) return prev;
                                return trimmed + " " + t + " ";
                              });
                              toast.success(`✨ 해시태그 [${t}]가 메시지에 장착되었습니다!`);
                            };
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => appendHashtag(tag)}
                                className="px-2.5 py-1 bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-850 text-zinc-400 hover:text-amber-400 text-[9.5px] font-extrabold rounded-full transition-all cursor-pointer"
                              >
                                {tag}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
              </div>

              {/* Toolbar: Search & Sort Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-zinc-900/10 border border-zinc-900 p-4 rounded-2xl">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="라운지 내 소통 및 포토카드 작성자 검색..."
                    value={commentSearch}
                    onChange={(e) => setCommentSearch(e.target.value)}
                    className="w-full text-xs p-2.5 pl-8 bg-zinc-950 border border-zinc-850 rounded-xl focus:border-amber-500 outline-none transition-colors text-white font-medium"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-xs">🔍</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest font-sans shrink-0">정렬 기준</span>
                  <div className="flex bg-zinc-950 p-1 rounded-xl border border-zinc-850">
                    {[
                      { key: "latest" as const, label: "최신순" },
                      { key: "highest" as const, label: "평점높은순" },
                      { key: "lowest" as const, label: "평점낮은순" },
                      { key: "likes" as const, label: "공감순" }
                    ].map(tab => (
                      <button
                        key={tab.key}
                        type="button"
                        onClick={() => setCommentSort(tab.key)}
                        className={`text-[10px] font-black px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          commentSort === tab.key
                            ? "bg-amber-500 text-zinc-950"
                            : "text-zinc-400 hover:text-white"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Lounge Live Timeline Feed */}
              <div className="space-y-4">
                {isMessagesLoading ? (
                  <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-xs text-zinc-500 font-extrabold uppercase tracking-widest font-mono">
                      Cinephile Agora Feed Connecting...
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[800px] overflow-y-auto pr-2 no-scrollbar scroll-smooth">
                    {(() => {
                      let filtered = [...guestbookMessages];
                      if (commentSearch.trim()) {
                        const q = commentSearch.toLowerCase();
                        filtered = filtered.filter(m => 
                          m.author.toLowerCase().includes(q) || 
                          m.content.toLowerCase().includes(q)
                        );
                      }

                      filtered.sort((a, b) => {
                        if (commentSort === "latest") {
                          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                        } else if (commentSort === "highest") {
                          return (b.rating || 5) - (a.rating || 5);
                        } else if (commentSort === "lowest") {
                          return (a.rating || 5) - (b.rating || 5);
                        } else {
                          const totalA = a.likes + Object.values(a.reactions || {}).reduce((s, v) => s + v, 0);
                          const totalB = b.likes + Object.values(b.reactions || {}).reduce((s, v) => s + v, 0);
                          return totalB - totalA;
                        }
                      });

                      if (filtered.length === 0) {
                        return (
                          <div className="text-center py-12 bg-zinc-900/10 border border-zinc-900 rounded-2xl">
                            <p className="text-xs text-zinc-500 font-bold">검색된 시네필 카드 대화가 존재하지 않습니다. 첫 대화를 발송해 보세요! 🥑</p>
                          </div>
                        );
                      }

                      return filtered.map((msg) => {
                        const rx = msg.reactions || { like: 0, fire: 0, mindblown: 0, crying: 0 };
                        const isPhotocard = msg.isPhotocard === true;

                        return (
                          <div
                            key={msg.id}
                            className={`p-5 rounded-2xl space-y-4 relative group transition-all duration-300 text-left border overflow-hidden ${
                              isPhotocard
                                ? "bg-zinc-950/80 border-dashed shadow-md " + (
                                    msg.ticketVibeColor === "amber" ? "border-amber-500/30 hover:border-amber-500/55 shadow-amber-500/5" :
                                    msg.ticketVibeColor === "purple" ? "border-purple-500/30 hover:border-purple-500/55 shadow-purple-500/5" :
                                    msg.ticketVibeColor === "rose" ? "border-rose-500/30 hover:border-rose-500/55 shadow-rose-500/5" :
                                    "border-emerald-500/30 hover:border-emerald-500/55 shadow-emerald-500/5"
                                  )
                                : "bg-zinc-900/10 border-zinc-900 hover:border-zinc-800"
                            }`}
                          >
                            {/* Card Header */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative z-10">
                              <div className="flex items-center gap-3">
                                {/* Glow Avatar */}
                                <div className={`w-10 h-10 rounded-full bg-zinc-950 border flex items-center justify-center text-lg shadow-inner select-none font-sans font-bold shrink-0 ${
                                  isPhotocard 
                                    ? "border-amber-500/20 text-amber-500 animate-pulse" 
                                    : "border-zinc-800 text-zinc-300"
                                }`}>
                                  {msg.avatar || "💬"}
                                </div>
                                
                                <div className="text-left leading-tight space-y-0.5">
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-white text-xs font-black block">{msg.author}</span>
                                    
                                    {/* Cinephile badge block */}
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-sans font-black text-amber-500 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded select-none">
                                      🛡️ {msg.badge || "🌱 시민 소속"}
                                    </span>

                                    {/* Stance Stamp */}
                                    {msg.stance && (
                                      <span className="inline-flex items-center gap-1 text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-1.5 py-0.5 rounded select-none">
                                        {msg.stance}
                                      </span>
                                    )}

                                    {/* Stars */}
                                    {!isPhotocard && (
                                      <div className="flex items-center gap-0.5 text-amber-500 ml-1">
                                        {Array.from({ length: 5 }).map((_, i) => (
                                          <Star key={i} size={10} fill={i < (msg.rating || 5) ? "currentColor" : "none"} />
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-2 text-[9px] text-zinc-600 font-extrabold uppercase tracking-wider font-mono">
                                    <span>{msg.createdAt}</span>
                                    <span>•</span>
                                    <span className="text-zinc-500">ID: {msg.id.slice(0, 10)}</span>
                                  </div>
                                </div>
                              </div>

                              {/* Simple Like Upvote count */}
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleLikeMessage(msg.id)}
                                  className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-950 hover:bg-amber-500/10 border border-zinc-900 hover:border-amber-500/20 text-zinc-500 hover:text-amber-500 text-[10.5px] font-black rounded-lg transition-all cursor-pointer"
                                >
                                  <ThumbsUp className="w-3.5 h-3.5" />
                                  <span>{msg.likes}</span>
                                </button>
                              </div>
                            </div>
                            
                            {/* Card Content - Normal text vs Phototicket Design! */}
                            <div className="relative z-10 pl-1">
                              {isPhotocard ? (
                                <div className="p-4 bg-zinc-950 border border-zinc-900 rounded-xl space-y-3 max-w-lg">
                                  <div className="flex justify-between items-center border-b border-zinc-900 pb-2">
                                    <div className="space-y-0.5">
                                      <span className="text-[8px] font-extrabold text-zinc-500 uppercase tracking-widest font-mono block">CINEPHILE TICKET PASS</span>
                                      <h6 className="text-white text-xs font-black">
                                        {msg.ticketMovie === "film_vegan" && "🎞️ 동물의 시선 (The Animal's Perspective)"}
                                        {msg.ticketMovie === "film_space" && "🌌 우주 늑구의 귀환 (Cosmic Wolf)"}
                                        {msg.ticketMovie === "film_copycat" && "🕵️ 카피캣 (Copycat Thriller)"}
                                        {!["film_vegan", "film_space", "film_copycat"].includes(msg.ticketMovie || "") && "🎬 영화제 특별선정작"}
                                      </h6>
                                    </div>
                                    <span className="text-[9.5px] font-mono font-black text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">
                                      {msg.ticketSticker || "🎟️ PASS"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-2 gap-4 text-[10px] bg-zinc-900/40 p-2.5 rounded-lg border border-zinc-900">
                                    <div>
                                      <span className="text-zinc-500 block font-bold font-mono">SEAT</span>
                                      <span className="text-zinc-200 font-extrabold">{msg.ticketSeat || "MZ-01"}</span>
                                    </div>
                                    <div>
                                      <span className="text-zinc-500 block font-bold font-mono">DECOR COLOR</span>
                                      <span className="text-zinc-200 font-extrabold uppercase">{msg.ticketVibeColor || "AMBER"}</span>
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <span className="text-[7.5px] font-black text-zinc-500 uppercase block font-mono">REVIEW SLOGAN</span>
                                    <p className="text-amber-400 text-xs font-black leading-relaxed italic">
                                      " {msg.content} "
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-zinc-300 text-xs md:text-[13px] font-bold leading-relaxed max-w-3xl whitespace-pre-line">
                                  {msg.content}
                                </p>
                              )}
                            </div>

                            {/* Live Reaction Bar (Gen-Z Interactive Element) */}
                            <div className="pt-3 border-t border-zinc-950/60 flex flex-wrap items-center gap-2 relative z-10 pl-1">
                              <span className="text-[9.5px] font-black text-zinc-600 uppercase tracking-wider block mr-1">
                                실시간 퀵 반응:
                              </span>
                              
                              {[
                                { type: "like" as const, emoji: "🥑", label: "공감" },
                                { type: "fire" as const, emoji: "🔥", label: "띵작" },
                                { type: "mindblown" as const, emoji: "🧠", label: "소름" },
                                { type: "crying" as const, emoji: "🥲", label: "울컥" }
                              ].map(item => {
                                const count = rx[item.type] || 0;
                                return (
                                  <button
                                    key={item.type}
                                    type="button"
                                    onClick={() => handleReactionClick(msg.id, item.type)}
                                    className="px-2.5 py-1.5 bg-zinc-950/60 hover:bg-zinc-900 border border-zinc-900 hover:border-zinc-800 text-[10.5px] font-black rounded-lg transition-all cursor-pointer flex items-center gap-1 active:scale-95 text-zinc-400 hover:text-white"
                                  >
                                    <span>{item.emoji}</span>
                                    <span className="text-[9.5px] font-bold">{item.label}</span>
                                    {count > 0 && (
                                      <span className="bg-zinc-900 text-zinc-300 px-1 py-0.5 rounded text-[8.5px] font-mono ml-0.5">
                                        {count}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 6: MZ PLAYGROUND */}
          {activeSubTab === "playground" && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="space-y-12"
            >
              {/* Introduction header */}
              <div className="text-left border-b border-zinc-900 pb-6 mb-8">
                <div className="flex items-center gap-2 text-amber-500 mb-2">
                  <Flame className="w-5 h-5 animate-pulse" />
                  <span className="text-xs font-black tracking-widest uppercase font-mono">Cinephile Gen-Z Playground</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-black text-white">
                  ⚡ MZ 시네필 놀이터
                </h3>
                <p className="text-zinc-500 text-xs md:text-sm mt-1 font-bold">
                  김현원 감독 세계관에 과몰입하는 트렌디 시네필을 위한 감성 공간! 감독의 지인들이 들려주는 오프더레코드 비하인드 썰부터 맞춤형 티켓 제작, MBTI 탐색까지 소통해 보세요.
                </p>
              </div>

              {/* Bento Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                
                {/* 1. MBTI Section (col-span-5) */}
                <div className="lg:col-span-5 bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl flex flex-col justify-between text-left">
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
                      <HelpCircle className="w-4.5 h-4.5 text-amber-500" />
                      <h4 className="text-sm font-black text-white">시네필 MBTI 성향 매칭 테스트</h4>
                    </div>

                    {mbtiStep === 0 && (
                      <div className="space-y-4 py-3">
                        <p className="text-zinc-400 text-xs font-semibold leading-relaxed">
                          단 4가지 문항으로 알아보는 나만의 독립영화 관람 성향! 김현원 감독의 마스터피스 중 당신의 영혼과 100% 매칭되는 명작은 무엇일까요?
                        </p>
                        <button
                          type="button"
                          onClick={() => { setMbtiStep(1); setMbtiAnswers([]); setMbtiResult(null); }}
                          className="w-full py-3 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                        >
                          테스트 시작하기 🚀
                        </button>
                      </div>
                    )}

                    {mbtiStep >= 1 && mbtiStep <= 4 && (
                      <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center text-[10px] font-mono font-black text-zinc-500">
                          <span>QUESTION {mbtiStep} / 4</span>
                          <span className="text-amber-500">{mbtiStep * 25}%</span>
                        </div>
                        <div className="w-full bg-zinc-950 h-1 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-1 transition-all" style={{ width: `${mbtiStep * 25}%` }} />
                        </div>
                        <h5 className="text-sm font-black text-white leading-normal pt-2">
                          {mbtiQuestions[mbtiStep - 1].q}
                        </h5>
                        <div className="space-y-2.5 pt-2">
                          {mbtiQuestions[mbtiStep - 1].options.map((opt, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleMbtiAnswer(opt.score)}
                              className="w-full text-left p-3.5 bg-zinc-950/80 hover:bg-amber-500/10 border border-zinc-850 hover:border-amber-500/20 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all cursor-pointer"
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {mbtiStep === 5 && mbtiResult && (
                      <div className="space-y-4 py-2">
                        <div className="p-4 bg-amber-500/5 border border-amber-500/15 rounded-xl space-y-2">
                          <span className="text-[10px] font-mono font-black text-amber-500 uppercase tracking-widest block">MATCH RESULT</span>
                          <h5 className="text-sm font-black text-amber-500">
                            {mbtiResult === "INFJ" && "🔮 INFJ: 우주적 통찰의 영혼파"}
                            {mbtiResult === "ENFP" && "🌱 ENFP: 낭만적 아이디어 뱅크"}
                            {mbtiResult === "INFP" && "🌲 INFP: 숲속의 몽상가 힐러"}
                            {mbtiResult === "INTJ" && "📐 INTJ: 지적 미장센 아키텍트"}
                            {!["INFJ", "ENFP", "INFP", "INTJ"].includes(mbtiResult) && "✨ 감각적인 라이프 시네아스트"}
                          </h5>
                          <p className="text-zinc-400 text-xs font-semibold leading-relaxed">
                            {mbtiResult === "INFJ" && "김현원 감독의 명작 '우주 늑구'와 완벽한 소울 커넥션을 자랑합니다. 눈에 보이지 않는 상징과 철학적 은유를 간파하는 거장들의 영혼을 가졌습니다."}
                            {mbtiResult === "ENFP" && "독창적이고 열정적인 당신은 감독님의 생태 다큐 '동물의 시선'에 완전히 몰입할 수 있습니다. 따뜻한 연대의 가치와 생명력을 사랑합니다."}
                            {mbtiResult === "INFP" && "예술적 감수성이 풍부한 힐러형 시네필! 이솔나라 원림의 평화와 비건 영화제의 온전한 치유의 메시지를 가슴속 깊이 품는 평화주의자입니다."}
                            {mbtiResult === "INTJ" && "치밀한 미장센 영화 '카피캣'을 완벽하게 분석할 설계자입니다. 프레임의 배치, 음향 소스, 심리 스릴러 서스펜스의 과학적 매력을 한눈에 간파합니다."}
                            {!["INFJ", "ENFP", "INFP", "INTJ"].includes(mbtiResult) && "직관과 이성의 고요한 밸런스를 이룬 당신! 영화의 실질적인 쾌감과 현장 미장센의 구조를 입체적으로 즐기며 시대를 날카롭게 조망할 줄 압니다."}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setMbtiStep(0)}
                          className="w-full py-2.5 bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white font-bold text-xs rounded-xl transition-all cursor-pointer"
                        >
                          다시 테스트하기 🔄
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 pt-4 border-t border-zinc-900/40 text-[10px] text-zinc-600 font-bold flex justify-between items-center">
                    <span>Cinephile Identity Engine</span>
                    <span className="text-amber-500/50 font-mono">v1.2</span>
                  </div>
                </div>

                {/* 2. DIY Ticket Decorator (col-span-7) */}
                <div className="lg:col-span-7 bg-zinc-900/10 border border-zinc-900 p-6 rounded-2xl text-left flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-4 border-b border-zinc-900 pb-3">
                      <Film className="w-4.5 h-4.5 text-amber-500" />
                      <h4 className="text-sm font-black text-white">디지털 감성 티켓 꾸미기 (DIY Ticket)</h4>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                      {/* Controls (left) */}
                      <div className="md:col-span-5 space-y-3">
                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-wider block">MOVIE CHOICE</label>
                          <select
                            value={ticketMovie}
                            onChange={(e) => setTicketMovie(e.target.value)}
                            className="w-full text-[11px] bg-zinc-950 border border-zinc-850 rounded-lg p-2 font-bold text-zinc-300 focus:border-amber-500 outline-none cursor-pointer"
                          >
                            <option value="film_vegan">동물의 시선 (Eco-Vegan)</option>
                            <option value="film_space">우주 늑구 (Cosmic Wolf)</option>
                            <option value="film_copycat">카피캣 (Copycat Thriller)</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-wider block">CINEPHILE NAME</label>
                          <input
                            type="text"
                            value={ticketName}
                            onChange={(e) => setTicketName(e.target.value)}
                            className="w-full text-[11px] bg-zinc-950 border border-zinc-850 rounded-lg p-2 font-bold text-zinc-300 focus:border-amber-500 outline-none"
                            placeholder="본인 닉네임"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-wider block">SEAT & DECOR STICKER</label>
                          <div className="grid grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={ticketSeat}
                              onChange={(e) => setTicketSeat(e.target.value)}
                              className="w-full text-[11px] bg-zinc-950 border border-zinc-850 rounded-lg p-2 font-bold text-zinc-300 focus:border-amber-500 outline-none"
                              placeholder="MZ-01"
                            />
                            <select
                              value={ticketSticker}
                              onChange={(e) => setTicketSticker(e.target.value)}
                              className="w-full text-[11px] bg-zinc-950 border border-zinc-850 rounded-lg p-2 font-bold text-zinc-300 focus:border-amber-500 outline-none cursor-pointer"
                            >
                              <option value="🌱 Eco-Vegan">🌱 Eco</option>
                              <option value="🍿 Film Critic">🍿 Critic</option>
                              <option value="🌌 Cosmic">🌌 Space</option>
                              <option value="🎞️ Cinephile">🎞️ Cine</option>
                            </select>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-mono font-black text-zinc-500 uppercase tracking-wider block">VIBE COLOR</label>
                          <div className="flex gap-2">
                            {["amber", "purple", "rose", "emerald"].map((col) => (
                              <button
                                key={col}
                                type="button"
                                onClick={() => setTicketVibeColor(col)}
                                className={`w-5 h-5 rounded-full cursor-pointer transition-all border ${
                                  ticketVibeColor === col ? "border-white scale-110" : "border-transparent"
                                }`}
                                style={{
                                  backgroundColor:
                                    col === "amber" ? "#f59e0b" :
                                    col === "purple" ? "#a855f7" :
                                    col === "rose" ? "#f43f5e" : "#10b981"
                                }}
                              />
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Live Ticket Mockup (right) */}
                      <div className="md:col-span-7 flex justify-center">
                        <div
                          className={`w-full max-w-[280px] rounded-2xl border-2 border-dashed bg-zinc-955 p-4 space-y-4 relative overflow-hidden shadow-xl transition-all hover:scale-[1.03] duration-350 select-none ${
                            ticketVibeColor === "amber" ? "border-amber-500/30 text-amber-500 shadow-amber-500/5" :
                            ticketVibeColor === "purple" ? "border-purple-500/30 text-purple-500 shadow-purple-500/5" :
                            ticketVibeColor === "rose" ? "border-rose-500/30 text-rose-500 shadow-rose-500/5" :
                            "border-emerald-500/30 text-emerald-500 shadow-emerald-500/5"
                          }`}
                        >
                          {/* Radial Glow */}
                          <div
                            className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-15"
                            style={{
                              backgroundColor:
                                ticketVibeColor === "amber" ? "#f59e0b" :
                                ticketVibeColor === "purple" ? "#a855f7" :
                                ticketVibeColor === "rose" ? "#f43f5e" : "#10b981"
                            }}
                          />

                          {/* Ticket Header */}
                          <div className="flex justify-between items-center border-b border-zinc-900 pb-2.5">
                            <span className="text-[9px] font-black tracking-widest font-mono uppercase">HYEONWON CINEMA</span>
                            <span className="text-[10px] font-mono font-black">{ticketSticker}</span>
                          </div>

                          {/* Movie Title */}
                          <div className="space-y-1 py-1">
                            <span className="text-[8px] font-extrabold text-zinc-500 uppercase font-mono tracking-wider block">SCREENING MOVIE</span>
                            <h5 className="text-[14px] font-black text-white leading-tight">
                              {ticketMovie === "film_vegan" && "동물의 시선 (The Eyes)"}
                              {ticketMovie === "film_space" && "우주 늑구 (Cosmic Wolf)"}
                              {ticketMovie === "film_copycat" && "카피캣 (Copycat)"}
                            </h5>
                          </div>

                          {/* Ticket details */}
                          <div className="grid grid-cols-2 gap-2 border-t border-b border-zinc-900 py-2">
                            <div>
                              <span className="text-[7.5px] font-black text-zinc-500 block uppercase font-mono">AUDIENCE</span>
                              <span className="text-white text-xs font-black truncate block">{ticketName}</span>
                            </div>
                            <div>
                              <span className="text-[7.5px] font-black text-zinc-500 block uppercase font-mono">SEAT NUMBER</span>
                              <span className="text-white text-xs font-black truncate block">{ticketSeat}</span>
                            </div>
                          </div>

                          {/* Date and Barcode */}
                          <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-mono text-zinc-500 font-extrabold">
                              <span>DATE: 2026.07.06</span>
                              <span>PRICE: FREE (PASS)</span>
                            </div>
                            {/* Dummy Barcode */}
                            <div className="h-8 bg-zinc-900 rounded flex flex-col justify-between p-1.5 border border-zinc-850">
                              <div className="flex justify-around items-center h-full opacity-60">
                                {Array.from({ length: 18 }).map((_, i) => (
                                  <div
                                    key={i}
                                    className="bg-zinc-200 h-full rounded-xs"
                                    style={{ width: i % 3 === 0 ? "2px" : i % 5 === 0 ? "3px" : "1px" }}
                                  />
                                ))}
                              </div>
                              <span className="text-[6.5px] font-mono font-black text-center text-zinc-650 tracking-widest block leading-none">
                                * HW-MZ-{ticketSeat}-{ticketSticker.slice(0, 2)} *
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900/40 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-[9px] text-zinc-500 font-extrabold">캡처해서 나만의 스토리나 피드에 자랑해 보세요! ✨</span>
                    <button
                      type="button"
                      onClick={handleShareTicketToFeed}
                      disabled={isSubmittingMessage}
                      className="px-4 py-2 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 disabled:from-zinc-800 disabled:to-zinc-850 text-zinc-950 font-black text-[10.5px] tracking-wider rounded-xl transition-all cursor-pointer shadow-md select-none active:scale-95 flex items-center gap-1.5"
                    >
                      <span>📌 씨네필 라운지에 자랑하기</span>
                    </button>
                  </div>
                </div>

              </div>

              {/* 3. Behind Episodes Feed (Full Width) */}
              <div className="bg-zinc-900/10 border border-zinc-900 p-6 md:p-8 rounded-2xl text-left space-y-6">
                <div className="flex items-center justify-between border-b border-zinc-900 pb-4">
                  <div className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-amber-500" />
                    <div>
                      <h4 className="text-md font-black text-white">김현원 감독 지인 비하인드 썰 보드 (Behind Episodes)</h4>
                      <p className="text-[10px] md:text-xs text-zinc-500 font-bold mt-0.5">
                        영화제 뒤풀이, 새벽의 작업실, 대학교 시절 등 지인 및 현장 동료들이 폭로한(?) 감독님의 따뜻하고 인간미 넘치는 에피소드 저장고!
                      </p>
                    </div>
                  </div>
                </div>

                {/* 제보 양식 폼 */}
                <form onSubmit={handleSubmitBehindEpisode} className="bg-zinc-950/80 border border-zinc-900 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center gap-2 text-xs font-black text-white">
                    <Sparkles size={14} className="text-amber-500" />
                    <span>나만 알고 있는 감독님 에피소드 제보하기 🤫</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[9.5px] font-black text-zinc-400 block uppercase tracking-wider">제보자 필명</label>
                      <input
                        required
                        type="text"
                        value={behindAuthor}
                        onChange={(e) => setBehindAuthor(e.target.value)}
                        placeholder="예: 조감독 고승우"
                        className="w-full text-xs p-3 bg-zinc-900 border border-zinc-850 rounded-xl focus:border-amber-500 outline-none text-white font-bold"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[9.5px] font-black text-zinc-400 block uppercase tracking-wider">감독님과의 관계</label>
                      <select
                        value={behindRelation}
                        onChange={(e) => setBehindRelation(e.target.value)}
                        className="w-full text-xs p-3 bg-zinc-900 border border-zinc-850 rounded-xl focus:border-amber-500 outline-none text-zinc-300 font-bold cursor-pointer"
                      >
                        <option value="스태프">현장 스태프/동료</option>
                        <option value="배우">출연 배우</option>
                        <option value="동창">동창/오래된 친구</option>
                        <option value="기자">영화 평론가/기자</option>
                        <option value="관객">지나던 길의 시민</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-[9.5px] font-black text-zinc-400 block uppercase tracking-wider">썰 무드 아이콘</label>
                      <select
                        value={behindMood}
                        onChange={(e) => setBehindMood(e.target.value)}
                        className="w-full text-xs p-3 bg-zinc-900 border border-zinc-850 rounded-xl focus:border-amber-500 outline-none text-zinc-300 font-bold cursor-pointer"
                      >
                        <option value="🔥">🔥 화끈하고 솔직한 폭로</option>
                        <option value="😭">😭 가슴 찡한 미담/감동</option>
                        <option value="💖">💖 훈훈하고 스윗한 비하인드</option>
                        <option value="🤣">🤣 배꼽 잡는 포복절도 해프닝</option>
                        <option value="🌱">🌱 친환경 비건 철학 썰</option>
                      </select>
                    </div>

                    <div className="md:col-span-3 flex items-end">
                      <button
                        type="submit"
                        disabled={isSubmittingBehind}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 text-zinc-950 font-black text-xs rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
                      >
                        {isSubmittingBehind ? "제보 전송 중..." : "감독 비하인드 제보하기 ⚡"}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9.5px] font-black text-zinc-400 block uppercase tracking-wider">에피소드 내용 (실화 바탕으로 성의 있게 적어주세요!)</label>
                    <textarea
                      required
                      rows={3}
                      value={behindContent}
                      onChange={(e) => setBehindContent(e.target.value)}
                      placeholder="예: 촬영장에서 감독님이 길고양이를 위해 사료 가방을 항상 메고 다니시며, 점심시간마다 숲속을 뛰어가 밥을 주시곤 하셨습니다. 그걸 보고 참 눈물겹도록 정직한 분이구나 깨달았네요..."
                      className="w-full text-xs p-3 bg-zinc-900 border border-zinc-850 rounded-xl focus:border-amber-500 outline-none text-white font-bold font-sans leading-relaxed"
                    />
                  </div>
                </form>

                {/* 제보 피드 */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 text-xs font-black text-zinc-400">
                    <Megaphone size={14} className="text-amber-500" />
                    <span>실시간 제보 썰 목차 ({behindEpisodes.length}건)</span>
                  </div>

                  {isBehindLoading ? (
                    <div className="text-center py-12">
                      <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                      <p className="text-xs text-zinc-500 font-bold">소중한 비하인드 제보 보드를 수집하는 중입니다...</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {behindEpisodes.map((ep) => (
                        <div
                          key={ep.id}
                          className="bg-zinc-955/40 border border-zinc-900 p-5 rounded-2xl flex flex-col justify-between relative group hover:border-amber-500/20 transition-all text-left"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between border-b border-zinc-900/50 pb-2">
                              <div className="flex items-center gap-1.5">
                                <span className="text-base">{ep.mood}</span>
                                <span className="text-xs font-black text-white">{ep.author}</span>
                                <span className="text-[8.5px] font-mono font-black text-zinc-500 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-850">
                                  {ep.relation}
                                </span>
                              </div>
                              <span className="text-[8.5px] font-mono text-zinc-600">{ep.createdAt}</span>
                            </div>
                            <p className="text-zinc-400 text-xs font-semibold leading-relaxed min-h-[72px]">
                              {ep.content}
                            </p>
                          </div>

                          <div className="flex items-center justify-between border-t border-zinc-900/40 pt-3.5 mt-4">
                            <span className="text-[8.5px] font-mono text-zinc-600">Verified Behind Story</span>
                            <button
                              type="button"
                              onClick={() => handleLikeBehindEpisode(ep.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 bg-zinc-900 hover:bg-amber-500/10 border border-zinc-850 hover:border-amber-500/20 text-zinc-500 hover:text-amber-500 text-[10px] font-black rounded-lg transition-all cursor-pointer"
                            >
                              <ThumbsUp className="w-3 h-3" />
                              <span>{ep.likes}</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
