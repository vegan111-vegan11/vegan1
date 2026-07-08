import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { toast } from "sonner";
import { 
  Users, 
  MessageSquare, 
  ThumbsUp, 
  Send, 
  Plus, 
  Search, 
  ChevronRight, 
  Sparkles, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  Flame, 
  Vote, 
  Trash2, 
  X,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  UserCheck,
  UserPlus,
  Share2,
  Heart,
  PlusCircle,
  Filter,
  Settings,
  ShieldAlert,
  UserMinus,
  Edit,
  Sliders,
  Copy,
  Check,
  ExternalLink
} from "lucide-react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

import { 
  db, 
  collection, 
  addDoc, 
  getDoc,
  getDocs, 
  setDoc,
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  handleFirestoreError,
  OperationType,
  checkIsAdmin
} from "../firebase";

// TYPES FOR THE MEETUP/CLUB SYSTEM
interface Club {
  id: string;
  name: string;
  emoji: string;
  description: string;
  tags: string[];
  bannerGradient: string;
  memberCount: number;
  hostName: string;
  hostId?: string;
  isOfficial?: boolean;
  category?: string;
}

interface ClubPost {
  id: string;
  clubId: string;
  author: string;
  authorId: string;
  authorAvatar: string;
  content: string;
  createdAt: string;
  likes: number;
  likedBy?: string[];
  reactions?: Record<string, string[]>;
}

interface ClubMeetup {
  id: string;
  clubId: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  capacity: number;
  attendees: string[]; // List of userIds
  attendeeNames?: string[];
  creatorId?: string;
  creatorName?: string;
}

interface CitizenAgoraProps {
  user: any;
  onAuthClick: () => void;
}

export default function CitizenAgora({ user, onAuthClick }: CitizenAgoraProps) {
  // CLUBS SEED DATA
  const initialClubs: Club[] = [
    {
      id: "smart-farm",
      name: "🌱 스마트팜 & 도시농업 연맹",
      emoji: "🌱",
      description: "수경재배 가전 공유, 스마트 IOT 센서 조절 노하우, 옥상 유기농 씨앗 나눔을 통해 친환경 먹거리를 직접 가꾸는 미래형 가드닝 모임입니다.",
      tags: ["스마트가드닝", "씨앗나눔", "도시농업", "사물인터넷"],
      bannerGradient: "from-emerald-500/10 to-teal-500/10 dark:from-emerald-950/20 dark:to-teal-950/20 border-emerald-500/20 dark:border-emerald-500/30",
      memberCount: 148,
      hostName: "민수스마트팜",
      isOfficial: true,
      category: "친환경/원예"
    },
    {
      id: "busking",
      name: "🎸 한강 노을 버스킹 & 도심 소극장",
      emoji: "🎸",
      description: "아름다운 낙조 시간대 한강 야외 공연, 앰프 및 음향 장비 셰어링, 콜라보 합주를 위한 버스커 및 길거리 아티스트들의 아지트입니다.",
      tags: ["길거리공연", "통기타", "앰프공유", "콜라보레이션"],
      bannerGradient: "from-amber-500/10 to-orange-500/10 dark:from-amber-950/20 dark:to-orange-950/20 border-amber-500/20 dark:border-amber-500/30",
      memberCount: 92,
      hostName: "기타맨준",
      isOfficial: true,
      category: "문화/예술"
    },
    {
      id: "book-salon",
      name: "📚 이솔 인문학 회독 & 북 크리에이터",
      emoji: "📚",
      description: "AI 특이점 시대 속 인간성을 탐색하고 매주 지정 소설이나 인문학 도서를 회독한 뒤, 개별 창작 수필집을 발행하는 소모임입니다.",
      tags: ["독서클럽", "북크로싱", "독립출판", "철학살롱"],
      bannerGradient: "from-purple-500/10 to-indigo-500/10 dark:from-purple-950/20 dark:to-indigo-950/20 border-purple-500/20 dark:border-purple-500/30",
      memberCount: 215,
      hostName: "지성인아고라",
      isOfficial: true,
      category: "인문학/독서"
    },
    {
      id: "eco-riding",
      name: "🚴 그린 웨이스트 제로 라이딩",
      emoji: "🚴",
      description: "에코 드라이브 정기 라이딩 번개, 자전거 플로깅(정화 활동)을 전개하며 이솔나라의 맑은 공기를 정화해나가는 건강 러닝 서클입니다.",
      tags: ["정기라이딩", "플로깅", "제로웨이스트", "자전거클럽"],
      bannerGradient: "from-sky-500/10 to-blue-500/10 dark:from-sky-950/20 dark:to-blue-950/20 border-sky-500/20 dark:border-sky-500/30",
      memberCount: 74,
      hostName: "친환경바이크",
      isOfficial: false,
      category: "레저/스포츠"
    }
  ];

  const [clubs, setClubs] = useState<Club[]>(initialClubs);
  const [selectedClubId, setSelectedClubId] = useState<string>("smart-farm");
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "chat" | "meetups" | "missions">("posts");

  // Real-time Chat state
  interface ClubChat {
    id: string;
    clubId: string;
    author: string;
    authorId: string;
    authorAvatar: string;
    content: string;
    createdAt: string;
    userRank?: string;
  }
  const [clubChats, setClubChats] = useState<ClubChat[]>([]);
  const [chatMessageInput, setChatMessageInput] = useState("");
  const [isSubmittingChat, setIsSubmittingChat] = useState(false);
  const [copiedMeetupId, setCopiedMeetupId] = useState<string | null>(null);

  // 3-Sec Flash Meetup states
  const [flashTimeLeft, setFlashTimeLeft] = useState(30);
  const [flashActive, setFlashActive] = useState(false);
  const [flashJoinedCount, setFlashJoinedCount] = useState(1);
  const [hasJoinedFlash, setHasJoinedFlash] = useState(false);

  // Daily Challenge states
  const [completedMissions, setCompletedMissions] = useState<string[]>(() => {
    const saved = localStorage.getItem("completed_missions_2026");
    return saved ? JSON.parse(saved) : [];
  });

  // User rank/badge based on completed missions count
  const userRank = useMemo(() => {
    const count = completedMissions.length;
    if (count >= 10) return "이솔 영웅 🏆";
    if (count >= 6) return "아고라 리더 🔥";
    if (count >= 3) return "에코 액티비스트 🏃";
    return "새싹 시민 🌱";
  }, [completedMissions]);

  // State for posts inside the active club
  const [clubPosts, setClubPosts] = useState<ClubPost[]>([]);
  const [newPostContent, setNewPostContent] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  // State for meetups inside the active club
  const [clubMeetups, setClubMeetups] = useState<ClubMeetup[]>([]);
  const [isMeetupModalOpen, setIsMeetupModalOpen] = useState(false);
  const [meetupTitle, setMeetupTitle] = useState("");
  const [meetupDesc, setMeetupDesc] = useState("");
  const [meetupDate, setMeetupDate] = useState("");
  const [meetupTime, setMeetupTime] = useState("");
  const [meetupLoc, setMeetupLoc] = useState("");
  const [meetupCap, setMeetupCap] = useState(10);
  const [isSubmittingMeetup, setIsSubmittingMeetup] = useState(false);

  // State for User Joined Clubs
  const [joinedClubIds, setJoinedClubIds] = useState<string[]>(() => {
    const saved = localStorage.getItem("user_joined_clubs_2026");
    return saved ? JSON.parse(saved) : ["smart-farm"]; // default joined
  });

  // Create Custom Club Modal
  const [isCreateClubModalOpen, setIsCreateClubModalOpen] = useState(false);
  const [newClubName, setNewClubName] = useState("");
  const [newClubEmoji, setNewClubEmoji] = useState("🌱");
  const [newClubDesc, setNewClubDesc] = useState("");
  const [newClubTags, setNewClubTags] = useState("");
  const [newClubCategory, setNewClubCategory] = useState("레저/스포츠");
  const [isSubmittingClub, setIsSubmittingClub] = useState(false);

  // Search & Filter state for Clubs list
  const [clubSearchQuery, setClubSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [clubSortMode, setClubSortMode] = useState<"memberCount" | "name">("memberCount");

  // Post search & sorting states
  const [postSearchQuery, setPostSearchQuery] = useState("");
  const [postSortMode, setPostSortMode] = useState<"latest" | "popular">("latest");

  // Club Management Modal & Form States
  const [isManageClubModalOpen, setIsManageClubModalOpen] = useState(false);
  const [editClubName, setEditClubName] = useState("");
  const [editClubEmoji, setEditClubEmoji] = useState("🌱");
  const [editClubDesc, setEditClubDesc] = useState("");
  const [editClubTags, setEditClubTags] = useState("");
  const [clubMembers, setClubMembers] = useState<any[]>([]);

  const activeClub = useMemo(() => {
    return clubs.find(c => c.id === selectedClubId) || clubs[0];
  }, [clubs, selectedClubId]);

  const filteredClubs = useMemo(() => {
    const list = clubs.filter(club => {
      // 1. Category Filter
      if (selectedCategory !== "전체") {
        const clubCat = club.category || "레저/스포츠";
        if (clubCat !== selectedCategory) return false;
      }

      // 2. Search query Filter
      if (clubSearchQuery.trim()) {
        const query = clubSearchQuery.toLowerCase();
        const nameMatch = club.name.toLowerCase().includes(query);
        const descMatch = club.description.toLowerCase().includes(query);
        const tagsMatch = club.tags.some(tag => tag.toLowerCase().includes(query));
        return nameMatch || descMatch || tagsMatch;
      }

      return true;
    });

    if (clubSortMode === "memberCount") {
      return [...list].sort((a, b) => b.memberCount - a.memberCount);
    } else {
      return [...list].sort((a, b) => a.name.localeCompare(b.name, "ko"));
    }
  }, [clubs, selectedCategory, clubSearchQuery, clubSortMode]);

  // Check if current user is host of active club, or is an admin
  const isUserClubHost = useMemo(() => {
    if (!user) return false;
    const isAdmin = checkIsAdmin(user.email);
    return activeClub.hostId === user.uid || isAdmin || (!activeClub.hostId && isAdmin);
  }, [activeClub, user]);

  // Generate mock members consistently for the active club
  useEffect(() => {
    if (!activeClub) return;
    const mockNames = ["김이솔", "박스마트", "최버스커", "이아고라", "정가드너", "조기타", "윤인문", "한그린", "임에코"];
    const seeds = ["alice", "bob", "charlie", "david", "emma", "frank", "grace", "henry", "isabel"];
    const roles = ["일반 회원", "일반 회원", "열성 활동가", "일반 회원", "우수 회원"];

    // Base count on activeClub.memberCount
    const count = Math.max(3, Math.min(8, activeClub.memberCount));
    const list = Array.from({ length: count }).map((_, idx) => {
      const nameIdx = (activeClub.id.charCodeAt(0) + idx) % mockNames.length;
      const seedIdx = (activeClub.id.charCodeAt(0) + idx) % seeds.length;
      const roleIdx = idx % roles.length;
      return {
        id: `member-${activeClub.id}-${idx}`,
        name: mockNames[nameIdx],
        role: idx === 0 ? "스태프" : roles[roleIdx],
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seeds[seedIdx]}`,
        joinedAt: "2026-06-15"
      };
    });
    setClubMembers(list);
  }, [activeClub]);

  // Haptic feedback simulator
  const triggerHaptic = (freq = 800, dur = 0.05) => {
    if (typeof window !== "undefined" && window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(dur * 1000);
    }
  };

  // Flash Countdown timer logic
  useEffect(() => {
    let timer: any;
    if (flashActive && flashTimeLeft > 0) {
      timer = setInterval(() => {
        setFlashTimeLeft(prev => prev - 1);
        if (Math.random() > 0.7) {
          setFlashJoinedCount(c => c + 1);
        }
      }, 1000);
    } else if (flashTimeLeft === 0 && flashActive) {
      setFlashActive(false);
      toast.success("⚡ 3초 번개 매칭이 정식 완료되었습니다! 단톡방이 개설되었습니다.", {
        description: "한강 공원 버스킹 현장으로 지금 바로 이동하세요!",
        icon: "🚴"
      });
    }
    return () => clearInterval(timer);
  }, [flashActive, flashTimeLeft]);

  const handleStartFlash = () => {
    triggerHaptic(750, 0.08);
    setFlashTimeLeft(30);
    setFlashActive(true);
    setFlashJoinedCount(1);
    setHasJoinedFlash(true);
    toast.info("⚡ 번개 긴급 모임이 호스팅되었습니다! 30초 내에 아고라 인원들이 모집됩니다.");
  };

  const handleJoinFlash = () => {
    triggerHaptic(600, 0.05);
    setHasJoinedFlash(true);
    setFlashJoinedCount(prev => prev + 1);
    toast.success("⚡ 번개 긴급 모임에 참여 신청되었습니다! 실시간 수락 완료.");
  };

  // Auto-select first matching club when filter excludes the currently active one
  useEffect(() => {
    if (filteredClubs.length > 0 && !filteredClubs.some(c => c.id === selectedClubId)) {
      setSelectedClubId(filteredClubs[0].id);
    }
  }, [filteredClubs, selectedClubId]);

  // Synchronize completed missions and joined clubs with Firestore when user logs in
  useEffect(() => {
    if (!user) return;
    
    const syncProfile = async () => {
      try {
        const userProfileRef = doc(db, "agora_user_profiles", user.uid);
        const docSnap = await getDoc(userProfileRef);
        
        if (docSnap.exists()) {
          const serverData = docSnap.data();
          
          // Merge local and server completed missions
          const mergedMissions = Array.from(new Set([
            ...completedMissions,
            ...(serverData.completedMissions || [])
          ]));
          
          // Merge local and server joined clubs
          const mergedClubs = Array.from(new Set([
            ...joinedClubIds,
            ...(serverData.joinedClubIds || [])
          ]));
          
          setCompletedMissions(mergedMissions);
          setJoinedClubIds(mergedClubs);
          
          localStorage.setItem("completed_missions_2026", JSON.stringify(mergedMissions));
          localStorage.setItem("user_joined_clubs_2026", JSON.stringify(mergedClubs));
          
          // Save merged data back to server
          await setDoc(userProfileRef, {
            userId: user.uid,
            email: user.email || "",
            displayName: user.displayName || "시민",
            completedMissions: mergedMissions,
            joinedClubIds: mergedClubs,
            updatedAt: new Date().toISOString()
          }, { merge: true });
        } else {
          // If no server data, upload local data to server
          await setDoc(userProfileRef, {
            userId: user.uid,
            email: user.email || "",
            displayName: user.displayName || "시민",
            completedMissions,
            joinedClubIds,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (err) {
        console.warn("Failed to synchronize user profile with Firestore:", err);
      }
    };
    
    syncProfile();
  }, [user]);

  // 1. Load Custom Clubs from localStorage on start
  useEffect(() => {
    const savedClubs = localStorage.getItem("user_created_clubs_2026");
    if (savedClubs) {
      const parsed = JSON.parse(savedClubs);
      setClubs([...initialClubs, ...parsed]);
    }
  }, []);

  // 1-B. Fetch Club Chats from Firestore
  useEffect(() => {
    if (!selectedClubId) return;

    const chatsCol = collection(db, "agora_clubs", selectedClubId, "chats");
    const q = query(chatsCol, orderBy("createdAt", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ClubChat[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          clubId: selectedClubId,
          author: data.author || "익명 회원",
          authorId: data.authorId || "",
          authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${docSnap.id}`,
          content: data.content || "",
          createdAt: data.createdAt || new Date().toISOString(),
          userRank: data.userRank || "새싹 시민 🌱"
        });
      });
      setClubChats(list);
    }, (error) => {
      console.warn("Firestore chats sync failed, using mock chats for:", selectedClubId);
      setClubChats([
        {
          id: "mock-chat-1",
          clubId: selectedClubId,
          author: "이솔가드너",
          authorId: "gardener-1",
          authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gardener",
          content: "안녕하세요! 실시간 소모임 채팅방이 활성화되었습니다. 반가워요! 🙌",
          createdAt: new Date(Date.now() - 300000).toISOString(),
          userRank: "아고라 리더 🔥"
        }
      ]);
    });

    return () => unsubscribe();
  }, [selectedClubId]);

  const handleCreateChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }
    if (!chatMessageInput.trim()) return;

    setIsSubmittingChat(true);
    triggerHaptic(650, 0.04);

    const chatPayload = {
      clubId: selectedClubId,
      author: user.displayName || "익명 회원",
      authorId: user.uid,
      authorAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      content: chatMessageInput.trim(),
      createdAt: new Date().toISOString(),
      userRank: userRank
    };

    try {
      const chatsCol = collection(db, "agora_clubs", selectedClubId, "chats");
      await addDoc(chatsCol, chatPayload);
      setChatMessageInput("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `agora_clubs/${selectedClubId}/chats`);
      const tempChat: ClubChat = { id: "temp-chat-" + Date.now(), ...chatPayload };
      setClubChats(prev => [...prev, tempChat]);
      setChatMessageInput("");
    } finally {
      setIsSubmittingChat(false);
    }
  };

  // 2. Fetch Club Posts from Firestore with local storage backup
  useEffect(() => {
    if (!selectedClubId) return;
    setIsLoading(true);

    const postsCol = collection(db, "agora_clubs", selectedClubId, "posts");
    const q = query(postsCol, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ClubPost[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          clubId: selectedClubId,
          author: data.author || "익명 회원",
          authorId: data.authorId || "",
          authorAvatar: data.authorAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${docSnap.id}`,
          content: data.content || "",
          createdAt: data.createdAt || new Date().toISOString(),
          likes: data.likes || 0,
          likedBy: data.likedBy || [],
          reactions: data.reactions || { "❤️": [], "🔥": [], "🌱": [], "💡": [] }
        });
      });
      setClubPosts(list);
      setIsLoading(false);
    }, (error) => {
      console.warn("Firestore error, falling back to local posts for:", selectedClubId);
      // Local mockup fallbacks for post feeds
      const mockFeeds: Record<string, ClubPost[]> = {
        "smart-farm": [
          {
            id: "sf-p1",
            clubId: "smart-farm",
            author: "이솔가드너",
            authorId: "user-sf-1",
            authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=gardener",
            content: "이번에 가정용 스마트 식물재배기로 바질이랑 수경 상추 수확했습니다! 필요하신 회원님들 계시면 내일 모임때 한아름 나눔해드릴게요. 🌱 씨앗 발아율 95% 대박이네요.",
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
            likes: 18,
            likedBy: []
          },
          {
            id: "sf-p2",
            clubId: "smart-farm",
            author: "미래농부",
            authorId: "user-sf-2",
            authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=future",
            content: "스마트 제어기 수경용 양액 농도(EC) 조절 팁 올립니다. 여름철에는 양액 농도를 평소보다 10~20% 옅게 해주는 것이 과도한 증산 작용으로 인한 잎마름 현상을 예방하는 핵심 포인트입니다!",
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
            likes: 12,
            likedBy: []
          }
        ],
        "busking": [
          {
            id: "bk-p1",
            clubId: "busking",
            author: "어쿠스틱소울",
            authorId: "user-bk-1",
            authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=acoustic",
            content: "이번 주 토요일 한강 선유도 공원 노을 야외 버스킹 연주 리스트 공유합니다! 감미로운 가요와 재즈 커버곡 위주로 가을바람 쐬러 오세요~ 앰프 스탠바이 완료!",
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
            likes: 25,
            likedBy: []
          }
        ]
      };
      setClubPosts(mockFeeds[selectedClubId] || [
        {
          id: "generic-p1",
          clubId: selectedClubId,
          author: "이솔러버",
          authorId: "generic-user",
          authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=generic",
          content: "새로운 모임 채널이 생성되었습니다! 회원 여러분의 다양한 일상 소통과 따뜻한 의견 공유를 기대합니다.",
          createdAt: new Date().toISOString(),
          likes: 3,
          likedBy: []
        }
      ]);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [selectedClubId]);

  // 3. Fetch Club Meetups with local storage backup
  useEffect(() => {
    if (!selectedClubId) return;

    const meetupsCol = collection(db, "agora_clubs", selectedClubId, "meetups");
    const q = query(meetupsCol, orderBy("date", "asc"));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: ClubMeetup[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        list.push({
          id: docSnap.id,
          clubId: selectedClubId,
          title: data.title || "",
          description: data.description || "",
          date: data.date || "",
          time: data.time || "",
          location: data.location || "",
          capacity: data.capacity || 10,
          attendees: data.attendees || [],
          attendeeNames: data.attendeeNames || []
        });
      });
      setClubMeetups(list);
    }, (error) => {
      // Local mockup fallbacks for meetups
      const mockMeetups: Record<string, ClubMeetup[]> = {
        "smart-farm": [
          {
            id: "sf-m1",
            clubId: "smart-farm",
            title: "🌱 주말 도심 스마트 온실 투어 & 씨앗 나눔 번개",
            description: "인근 유휴 부지에 개설된 에코 스마트팜 온실을 다 함께 탐방하고, 사물인터넷 관수 설비 시스템 구동 시뮬레이션을 눈으로 확인한 뒤 희귀 허브 씨앗 발아 키트를 무상 나눔하는 교류 행사입니다.",
            date: "2026.07.11 (토요일)",
            time: "14:00 - 16:30",
            location: "이솔 국영 에코 스마트 온실 3관",
            capacity: 15,
            attendees: ["user-sf-1", "user-sf-2"],
            attendeeNames: ["이솔가드너", "미래농부"]
          }
        ],
        "busking": [
          {
            id: "bk-m1",
            clubId: "busking",
            title: "🎸 한강 선율 노을 버스킹 합동 기획 회의",
            description: "버스킹 장비 구비 현황을 점검하고, 버스커들간 연주 구역 조율 및 7월 정기 버스킹 단체 합동 앵콜곡 리허설 합주 일정을 확정하는 오프라인 커피 챗 모임입니다.",
            date: "2026.07.15 (수요일)",
            time: "19:30 - 21:00",
            location: "한강 아티스트 라운지 카페",
            capacity: 8,
            attendees: ["user-bk-1"],
            attendeeNames: ["어쿠스틱소울"]
          }
        ]
      };
      setClubMeetups(mockMeetups[selectedClubId] || []);
    });

    return () => unsubscribe();
  }, [selectedClubId]);

  // 4. Handle Join/Leave Club
  const handleToggleJoinClub = (clubId: string) => {
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }

    triggerHaptic(750, 0.05);
    let updated: string[];
    const isJoined = joinedClubIds.includes(clubId);

    if (isJoined) {
      updated = joinedClubIds.filter(id => id !== clubId);
    } else {
      updated = [...joinedClubIds, clubId];
    }

    setJoinedClubIds(updated);
    localStorage.setItem("user_joined_clubs_2026", JSON.stringify(updated));
    if (user) {
      setDoc(doc(db, "agora_user_profiles", user.uid), {
        joinedClubIds: updated,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }

    // Update club member count locally
    setClubs(prev => prev.map(c => {
      if (c.id === clubId) {
        return { ...c, memberCount: isJoined ? Math.max(1, c.memberCount - 1) : c.memberCount + 1 };
      }
      return c;
    }));
  };

  // 5. Submit Post to Club Feed
  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }
    if (!newPostContent.trim()) return;

    setIsSubmittingPost(true);
    triggerHaptic(650, 0.04);

    const postPayload = {
      clubId: selectedClubId,
      author: user.displayName || "익명 회원",
      authorId: user.uid,
      authorAvatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
      content: newPostContent.trim(),
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: []
    };

    try {
      const postsCol = collection(db, "agora_clubs", selectedClubId, "posts");
      await addDoc(postsCol, postPayload);
      setNewPostContent("");
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, `agora_clubs/${selectedClubId}/posts`);
      // Local fallback
      const tempPost: ClubPost = { id: "temp-" + Date.now(), ...postPayload };
      setClubPosts(prev => [tempPost, ...prev]);
      setNewPostContent("");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  // 6. Like Post
  const handleLikePost = async (post: ClubPost) => {
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }

    triggerHaptic(700, 0.05);
    const hasLiked = post.likedBy?.includes(user.uid);
    const newLikedBy = hasLiked 
      ? (post.likedBy || []).filter(id => id !== user.uid)
      : [...(post.likedBy || []), user.uid];
    const newLikes = hasLiked ? Math.max(0, post.likes - 1) : post.likes + 1;

    setClubPosts(prev => prev.map(p => p.id === post.id ? { ...p, likes: newLikes, likedBy: newLikedBy } : p));

    try {
      const postRef = doc(db, "agora_clubs", selectedClubId, "posts", post.id);
      await updateDoc(postRef, {
        likes: newLikes,
        likedBy: newLikedBy
      });
    } catch (err) {
      // Background update fail ignored
    }
  };

  // 6-2. Emotion Reactions (❤️, 🔥, 🌱, 💡)
  const handleReactionPost = async (post: ClubPost, emoji: string) => {
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }

    triggerHaptic(700, 0.04);
    const currentReactions = post.reactions || { "❤️": [], "🔥": [], "🌱": [], "💡": [] };
    const usersList = currentReactions[emoji] || [];
    const hasReacted = usersList.includes(user.uid);
    
    const updatedUsers = hasReacted
      ? usersList.filter(id => id !== user.uid)
      : [...usersList, user.uid];
      
    const newReactions = {
      ...currentReactions,
      [emoji]: updatedUsers
    };

    setClubPosts(prev => prev.map(p => p.id === post.id ? { ...p, reactions: newReactions } : p));

    try {
      const postRef = doc(db, "agora_clubs", selectedClubId, "posts", post.id);
      await updateDoc(postRef, {
        reactions: newReactions
      });
    } catch (err) {
      // Ignored for offline robustness
    }
  };

  // 7. Delete Post
  const handleDeletePost = async (postId: string, authorId: string) => {
    const isAdmin = checkIsAdmin(user?.email);
    if (!isAdmin && user?.uid !== authorId) return;

    if (!window.confirm("정말로 피드 게시글을 삭제하시겠습니까?")) return;

    triggerHaptic(900, 0.08);
    setClubPosts(prev => prev.filter(p => p.id !== postId));

    try {
      const postRef = doc(db, "agora_clubs", selectedClubId, "posts", postId);
      await deleteDoc(postRef);
    } catch (err) {
      // Ignored local deletion completed
    }
  };

  // 8. Open offline meetup reservation
  const handleToggleMeetupAttend = async (meetup: ClubMeetup) => {
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }

    triggerHaptic(750, 0.06);
    const isAttending = meetup.attendees.includes(user.uid);
    let newAttendees: string[];
    let newAttendeeNames: string[];

    if (isAttending) {
      newAttendees = meetup.attendees.filter(id => id !== user.uid);
      newAttendeeNames = (meetup.attendeeNames || []).filter(name => name !== (user.displayName || "익명회원"));
    } else {
      if (meetup.attendees.length >= meetup.capacity) {
        alert("이 모임은 벌써 신청 정원이 모두 가득 찼습니다!");
        return;
      }
      newAttendees = [...meetup.attendees, user.uid];
      newAttendeeNames = [...(meetup.attendeeNames || []), user.displayName || "익명회원"];
    }

    // Update local state snappy
    setClubMeetups(prev => prev.map(m => m.id === meetup.id ? { ...m, attendees: newAttendees, attendeeNames: newAttendeeNames } : m));

    try {
      const meetupRef = doc(db, "agora_clubs", selectedClubId, "meetups", meetup.id);
      await updateDoc(meetupRef, {
        attendees: newAttendees,
        attendeeNames: newAttendeeNames
      });
    } catch (err) {
      // Ignored background sync
    }
  };

  // 9. Create New Meetup Event
  const handleCreateMeetup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }

    if (!meetupTitle.trim() || !meetupDate || !meetupLoc.trim()) return;

    setIsSubmittingMeetup(true);
    triggerHaptic(650, 0.05);

    const meetupPayload = {
      clubId: selectedClubId,
      title: meetupTitle.trim(),
      description: meetupDesc.trim(),
      date: meetupDate,
      time: meetupTime || "15:00",
      location: meetupLoc.trim(),
      capacity: meetupCap,
      attendees: [user.uid],
      attendeeNames: [user.displayName || "익명회원"],
      creatorId: user.uid,
      creatorName: user.displayName || "익명회원"
    };

    try {
      const meetupsCol = collection(db, "agora_clubs", selectedClubId, "meetups");
      await addDoc(meetupsCol, meetupPayload);
      setIsMeetupModalOpen(false);
      setMeetupTitle("");
      setMeetupDesc("");
      setMeetupDate("");
      setMeetupTime("");
      setMeetupLoc("");
    } catch (err) {
      // Local fallback
      const tempMeetup: ClubMeetup = { id: "temp-m-" + Date.now(), ...meetupPayload };
      setClubMeetups(prev => [...prev, tempMeetup]);
      setIsMeetupModalOpen(false);
      setMeetupTitle("");
      setMeetupDesc("");
      setMeetupDate("");
      setMeetupTime("");
      setMeetupLoc("");
    } finally {
      setIsSubmittingMeetup(false);
    }
  };

  // 9b. Delete Meetup Event (Creator or Club Host or Admin)
  const handleDeleteMeetup = async (meetupId: string, creatorId?: string) => {
    const isAdmin = checkIsAdmin(user?.email);
    const isHost = isUserClubHost;
    const isCreator = user && creatorId === user.uid;

    if (!isAdmin && !isHost && !isCreator) {
      alert("번개 개설자나 소모임 방장만 일정을 취소/삭제할 수 있습니다.");
      return;
    }

    if (!window.confirm("정말로 이 오프라인 번개 약속을 취소하고 일정을 삭제하시겠습니까?")) return;

    triggerHaptic(950, 0.08);
    setClubMeetups(prev => prev.filter(m => m.id !== meetupId));

    try {
      const meetupRef = doc(db, "agora_clubs", selectedClubId, "meetups", meetupId);
      await deleteDoc(meetupRef);
    } catch (err) {
      // Ignored local deletion completed
    }
  };

  // 10. Create Custom Club
  const handleCreateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      triggerHaptic(900, 0.08);
      onAuthClick();
      return;
    }

    if (!newClubName.trim() || !newClubDesc.trim()) return;

    setIsSubmittingClub(true);
    triggerHaptic(800, 0.08);

    const cleanTags = newClubTags.split(",").map(t => t.trim()).filter(t => t.length > 0);
    const slug = "club-" + Date.now();

    const newClubObj: Club = {
      id: slug,
      name: `${newClubEmoji} ${newClubName.trim()}`,
      emoji: newClubEmoji,
      description: newClubDesc.trim(),
      tags: cleanTags.length > 0 ? cleanTags : ["신규소모임", "이솔광장"],
      bannerGradient: "from-rose-500/10 to-red-500/10 dark:from-rose-950/20 dark:to-red-950/20 border-rose-500/20 dark:border-rose-500/30",
      memberCount: 1,
      hostName: user.displayName || "신규회원",
      hostId: user.uid,
      isOfficial: false,
      category: newClubCategory
    };

    const updatedClubs = [...clubs, newClubObj];
    setClubs(updatedClubs);
    // Filter out official clubs to persist custom clubs only in localStorage
    const customOnly = updatedClubs.filter(c => !initialClubs.some(init => init.id === c.id));
    localStorage.setItem("user_created_clubs_2026", JSON.stringify(customOnly));

    // Auto join the created club
    const updatedJoined = [...joinedClubIds, slug];
    setJoinedClubIds(updatedJoined);
    localStorage.setItem("user_joined_clubs_2026", JSON.stringify(updatedJoined));
    if (user) {
      setDoc(doc(db, "agora_user_profiles", user.uid), {
        joinedClubIds: updatedJoined,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }

    // Reset Form
    setNewClubName("");
    setNewClubDesc("");
    setNewClubTags("");
    setNewClubCategory("레저/스포츠");
    setIsCreateClubModalOpen(false);
    setIsSubmittingClub(false);
    setSelectedClubId(slug);
  };

  // 11. Update existing club details
  const handleUpdateClub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    triggerHaptic(800, 0.06);

    const cleanTags = editClubTags.split(",").map(t => t.trim()).filter(t => t.length > 0);
    
    const updatedClubs = clubs.map(c => {
      if (c.id === activeClub.id) {
        return {
          ...c,
          name: `${editClubEmoji} ${editClubName.trim()}`,
          emoji: editClubEmoji,
          description: editClubDesc.trim(),
          tags: cleanTags.length > 0 ? cleanTags : ["수정됨", "소모임"]
        };
      }
      return c;
    });

    setClubs(updatedClubs);
    // Save to local storage
    const customOnly = updatedClubs.filter(c => !initialClubs.some(init => init.id === c.id));
    localStorage.setItem("user_created_clubs_2026", JSON.stringify(customOnly));

    setIsManageClubModalOpen(false);
  };

  // 12. Dissolve / Delete custom club
  const handleDissolveClub = () => {
    if (!user) return;
    
    const confirmName = activeClub.name.replace(activeClub.emoji, "").trim();
    if (!window.confirm(`정말로 [${confirmName}] 소모임을 완전히 폐쇄하고 삭제하시겠습니까?\n이 작업은 되돌릴 수 없으며 모든 피드와 번개 예약이 삭제됩니다.`)) {
      return;
    }

    triggerHaptic(950, 0.1);

    const updatedClubs = clubs.filter(c => c.id !== activeClub.id);
    setClubs(updatedClubs);

    // Save to local storage
    const customOnly = updatedClubs.filter(c => !initialClubs.some(init => init.id === c.id));
    localStorage.setItem("user_created_clubs_2026", JSON.stringify(customOnly));

    // Remove from joined list if needed
    const updatedJoined = joinedClubIds.filter(id => id !== activeClub.id);
    setJoinedClubIds(updatedJoined);
    localStorage.setItem("user_joined_clubs_2026", JSON.stringify(updatedJoined));
    if (user) {
      setDoc(doc(db, "agora_user_profiles", user.uid), {
        joinedClubIds: updatedJoined,
        updatedAt: new Date().toISOString()
      }, { merge: true }).catch(() => {});
    }

    setIsManageClubModalOpen(false);
    // Auto select first club
    setSelectedClubId("smart-farm");
  };

  // 13. Kick member from club (host only)
  const handleKickMember = (memberId: string, memberName: string) => {
    if (!window.confirm(`정말로 @${memberName} 회원을 이 소모임에서 강제 퇴장(추방)시키겠습니까?`)) {
      return;
    }

    triggerHaptic(900, 0.08);
    setClubMembers(prev => prev.filter(m => m.id !== memberId));
    
    // Decrease memberCount in state
    setClubs(prev => prev.map(c => {
      if (c.id === activeClub.id) {
        return { ...c, memberCount: Math.max(1, c.memberCount - 1) };
      }
      return c;
    }));
  };

  // 14. Adjust member level (host only)
  const handleChangeMemberRole = (memberId: string, currentRole: string) => {
    triggerHaptic(700, 0.05);
    const roles = ["일반 회원", "열성 활동가", "스태프", "우수 회원"];
    const nextIdx = (roles.indexOf(currentRole) + 1) % roles.length;
    const nextRole = roles[nextIdx];

    setClubMembers(prev => prev.map(m => m.id === memberId ? { ...m, role: nextRole } : m));
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[#0c0c0f] text-zinc-900 dark:text-zinc-100 font-sans pb-24">
      {/* Visual Elegant Header Block */}
      <div className="relative bg-gradient-to-b from-rose-600 via-red-600 to-red-700 text-white pt-24 pb-16 px-4 md:px-8 overflow-hidden select-none">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white blur-[100px]" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-orange-400 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className="bg-black/25 border border-white/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-rose-200">
                🌱 CONNECTING CITIZENS & PASSIONS
              </span>
              <h2 className="text-3xl md:text-4xl font-black tracking-tight">
                이솔 클럽 <span className="text-amber-200">소모임 광장</span>
              </h2>
              <p className="text-white/80 text-xs md:text-sm max-w-xl font-medium leading-relaxed">
                스마트팜 농부들부터 길거리 버스커, 인문학 살롱 회원들까지! 이솔 뉴스가 적극 지원하는 프리미엄 시민 소모임 네트워크에서 따뜻한 취향 공동체를 일궈나가세요.
              </p>
            </div>

            <div className="flex flex-wrap gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  triggerHaptic(650, 0.04);
                  if (!user) onAuthClick();
                  else setIsCreateClubModalOpen(true);
                }}
                className="px-5 py-3.5 bg-black hover:bg-zinc-900 text-white font-black rounded-2xl shadow-xl border border-white/10 flex items-center gap-2 text-xs cursor-pointer"
              >
                <PlusCircle size={15} className="text-rose-400 animate-pulse" />
                <span>새 소모임 개설하기</span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column: Club Sidebar Selection */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] border border-zinc-250/60 dark:border-zinc-800 p-5 shadow-sm space-y-4 animate-fadeIn">
            
            <div className="space-y-1.5">
              <h3 className="text-xs font-black text-zinc-400 uppercase tracking-widest px-1 select-none flex items-center justify-between">
                <span>활성화 소모임 목록</span>
                <span className="bg-zinc-100 dark:bg-zinc-800 text-[9px] text-zinc-500 dark:text-zinc-400 px-2 py-0.5 rounded-full font-mono">{filteredClubs.length} / {clubs.length}</span>
              </h3>
              
              {/* Club Search Bar */}
              <div className="relative">
                <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="모임명, 설명, 해시태그 검색..."
                  value={clubSearchQuery}
                  onChange={(e) => setClubSearchQuery(e.target.value)}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-9 pr-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-150 transition-colors placeholder-zinc-400"
                />
                {clubSearchQuery && (
                  <button 
                    onClick={() => setClubSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 text-xs font-black cursor-pointer"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Club list Sort toggle */}
              <div className="flex items-center justify-between px-1 pt-1">
                <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider">정렬 방식</span>
                <div className="flex bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => { triggerHaptic(500, 0.02); setClubSortMode("memberCount"); }}
                    className={cn(
                      "px-2 py-1 rounded text-[9.5px] font-black transition-colors",
                      clubSortMode === "memberCount"
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    인원순
                  </button>
                  <button
                    type="button"
                    onClick={() => { triggerHaptic(500, 0.02); setClubSortMode("name"); }}
                    className={cn(
                      "px-2 py-1 rounded text-[9.5px] font-black transition-colors",
                      clubSortMode === "name"
                        ? "bg-zinc-200 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-100"
                        : "text-zinc-400 hover:text-zinc-600"
                    )}
                  >
                    이름순
                  </button>
                </div>
              </div>
            </div>

            {/* Category Quick Filter Chips */}
            <div className="space-y-1">
              <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider px-1">🌱 카테고리 분류</span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {[
                  { key: "전체", label: "🔍 전체" },
                  { key: "친환경/원예", label: "🌱 친환경/원예" },
                  { key: "문화/예술", label: "🎸 문화/예술" },
                  { key: "인문학/독서", label: "📚 인문학/독서" },
                  { key: "레저/스포츠", label: "🚴 레저/스포츠" }
                ].map((item) => {
                  const isCatSelected = selectedCategory === item.key;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={() => { triggerHaptic(550, 0.02); setSelectedCategory(item.key); }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border flex items-center gap-1 hover:scale-105",
                        isCatSelected
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-sm"
                          : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                      )}
                    >
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="border-t border-zinc-150/60 dark:border-zinc-800/60 my-2" />

            <div className="space-y-1.5 max-h-[50vh] overflow-y-auto no-scrollbar pr-1 select-none">
              {filteredClubs.length === 0 ? (
                <div className="text-center py-12 text-zinc-450 dark:text-zinc-500 space-y-2">
                  <Filter size={24} className="mx-auto text-zinc-300" />
                  <p className="text-xs font-black">검색 조건에 맞는 모임이 없습니다.</p>
                  <p className="text-[9.5px] text-zinc-400">새로운 모임을 직접 개설해 보시는건 어떨까요?</p>
                </div>
              ) : (
                filteredClubs.map((club) => {
                  const isSelected = club.id === selectedClubId;
                  const isJoined = joinedClubIds.includes(club.id);

                  return (
                    <button
                      key={club.id}
                      onClick={() => {
                        triggerHaptic(600, 0.02);
                        setSelectedClubId(club.id);
                      }}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl border transition-all cursor-pointer relative group flex items-start gap-3",
                        isSelected
                          ? "bg-gradient-to-r from-red-500/10 to-transparent border-red-500/40 text-red-655 dark:text-red-400 font-black"
                          : "bg-transparent border-transparent hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50 text-zinc-750 dark:text-zinc-350"
                      )}
                    >
                      <span className="text-xl shrink-0 mt-0.5">{club.emoji}</span>
                      <div className="space-y-1 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 justify-between">
                          <p className="text-xs font-black truncate max-w-[110px]">{club.name.replace(club.emoji, "").trim()}</p>
                          {club.isOfficial && (
                            <span className="bg-red-500/10 text-red-500 text-[8px] font-black uppercase px-1 rounded border border-red-500/25 shrink-0 select-none">공식</span>
                          )}
                        </div>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 font-semibold">
                          <span className="text-[8.5px] bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-1 py-0.5 rounded font-bold shrink-0">{club.category || "기타"}</span>
                          <span>회원 {club.memberCount}명</span>
                        </div>
                        {isJoined && (
                          <div className="text-[9.5px] text-emerald-500 font-extrabold flex items-center gap-0.5 pt-0.5">
                            <CheckCircle2 size={10} /> 가입됨
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right column: Active Club Workspace */}
        <div className="lg:col-span-3 space-y-6">
          {/* Club Info Banner Card */}
          <div className={cn(
            "rounded-[2.5rem] border p-6 md:p-8 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm",
            activeClub.bannerGradient
          )}>
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-3xl select-none">{activeClub.emoji}</span>
                <h3 className="text-xl md:text-2xl font-black tracking-tight">{activeClub.name}</h3>
              </div>
              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-400 font-medium leading-relaxed">
                {activeClub.description}
              </p>
              
              <div className="flex flex-wrap gap-1.5 select-none pt-1">
                {activeClub.tags.map(tag => (
                  <span key={tag} className="bg-zinc-200/50 dark:bg-zinc-800/60 text-zinc-500 dark:text-zinc-400 px-2.5 py-0.5 rounded-lg text-[9.5px] font-bold font-mono">
                    #{tag}
                  </span>
                ))}
              </div>

              {/* Club Vibe Temperature Indicator */}
              <div className="pt-2 flex flex-col gap-1.5 w-full max-w-sm select-none">
                <div className="flex items-center justify-between text-[11px] font-black text-zinc-650 dark:text-zinc-300">
                  <span className="flex items-center gap-1">
                    <Flame size={13} className="text-red-500 animate-pulse fill-red-500" />
                    <span>소모임 활성 온도: <strong className="text-red-600 dark:text-red-400">{(36.5 + (activeClub.memberCount % 45) + 12.4).toFixed(1)}°C</strong></span>
                  </span>
                  <span className="text-[10px] bg-red-500/10 text-red-655 px-1.5 py-0.5 rounded font-black">
                    🔥 이달의 슈퍼루키 클럽
                  </span>
                </div>
                <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-orange-400 to-red-550 h-full rounded-full transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(30, 36.5 + (activeClub.memberCount % 45) + 12.4))}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch md:items-end gap-2.5 shrink-0 w-full md:w-auto">
              <div className="text-right text-xs select-none">
                <span className="text-zinc-400 font-bold">클럽 방장: </span>
                <span className="font-extrabold text-zinc-700 dark:text-zinc-300">@{activeClub.hostName}</span>
              </div>

              <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-2 justify-end w-full">
                {isUserClubHost && (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      triggerHaptic(650, 0.05);
                      // Set edit form values
                      setEditClubName(activeClub.name.replace(activeClub.emoji, "").trim());
                      setEditClubEmoji(activeClub.emoji);
                      setEditClubDesc(activeClub.description);
                      setEditClubTags(activeClub.tags.join(", "));
                      setIsManageClubModalOpen(true);
                    }}
                    className="px-4 py-3 bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 border border-zinc-750 dark:border-zinc-700 text-white rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    <Settings size={14} className="text-red-400 transition-transform duration-500 hover:rotate-90" />
                    <span>소모임 설정 & 관리</span>
                  </motion.button>
                )}

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleToggleJoinClub(activeClub.id)}
                  className={cn(
                    "px-5 py-3 rounded-xl font-black text-xs flex items-center justify-center gap-1.5 cursor-pointer border transition-all shadow-sm flex-1",
                    joinedClubIds.includes(activeClub.id)
                      ? "bg-zinc-200 dark:bg-zinc-850 border-zinc-300/50 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-800"
                      : "bg-red-655 border-red-600 text-white hover:bg-red-700 shadow-red-500/10"
                  )}
                >
                  {joinedClubIds.includes(activeClub.id) ? (
                    <>
                      <UserCheck size={14} className="text-emerald-500" />
                      <span>클럽 탈퇴하기</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={14} />
                      <span>이 소모임 가입하기</span>
                    </>
                  )}
                </motion.button>
              </div>
            </div>
          </div>

          {/* Sub Tab Selection Menu (Posts Feed vs Chatroom vs Meetups Schedule vs Missions) */}
          <div className="flex flex-wrap items-center gap-1 border-b border-zinc-200 dark:border-zinc-800/80 pb-2 select-none">
            <button
              onClick={() => { triggerHaptic(600, 0.02); setActiveTab("posts"); }}
              className={cn(
                "px-4 md:px-5 py-3.5 text-xs font-black rounded-xl transition-all relative cursor-pointer active:scale-95 duration-150 tracking-tight",
                activeTab === "posts"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 font-black"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <span>자유 소통 피드 ({clubPosts.length})</span>
              {activeTab === "posts" && <motion.div layoutId="activeAgoraTabLine" className="absolute bottom-[-10px] left-2 right-2 h-[3px] bg-red-500 rounded-full" />}
            </button>

            <button
              onClick={() => { triggerHaptic(600, 0.02); setActiveTab("chat"); }}
              className={cn(
                "px-4 md:px-5 py-3.5 text-xs font-black rounded-xl transition-all relative cursor-pointer flex items-center gap-1 active:scale-95 duration-150 tracking-tight",
                activeTab === "chat"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 font-black"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <span>실시간 채팅방 ({clubChats.length})</span>
              {activeTab === "chat" && <motion.div layoutId="activeAgoraTabLine" className="absolute bottom-[-10px] left-2 right-2 h-[3px] bg-red-500 rounded-full" />}
            </button>

            <button
              onClick={() => { triggerHaptic(600, 0.02); setActiveTab("meetups"); }}
              className={cn(
                "px-4 md:px-5 py-3.5 text-xs font-black rounded-xl transition-all relative cursor-pointer flex items-center gap-1 active:scale-95 duration-150 tracking-tight",
                activeTab === "meetups"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 font-black"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <span>오프라인 모임 번개 ({clubMeetups.length})</span>
              {activeTab === "meetups" && <motion.div layoutId="activeAgoraTabLine" className="absolute bottom-[-10px] left-2 right-2 h-[3px] bg-red-500 rounded-full" />}
            </button>

            <button
              onClick={() => { triggerHaptic(600, 0.02); setActiveTab("missions"); }}
              className={cn(
                "px-4 md:px-5 py-3.5 text-xs font-black rounded-xl transition-all relative cursor-pointer flex items-center gap-1 active:scale-95 duration-150 tracking-tight",
                activeTab === "missions"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400 font-black"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <span className="flex items-center gap-1">
                <Sparkles size={12} className="text-amber-500 animate-pulse" />
                일일 미션 챌린지
              </span>
              {activeTab === "missions" && <motion.div layoutId="activeAgoraTabLine" className="absolute bottom-[-10px] left-2 right-2 h-[3px] bg-red-500 rounded-full" />}
            </button>
          </div>

          {/* Active Tab Panel Content */}
          <div className="space-y-6">
            
            {/* TAB: FEEDS POSTS */}
            {activeTab === "posts" && (
              <div className="space-y-6">
                
                {/* Write Post Box (Only if joined or prompt join) */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-850 rounded-3xl p-4 md:p-5 shadow-sm space-y-3.5">
                  <div className="flex gap-3">
                    <img
                      src={user?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=guest"}
                      alt="avatar"
                      className="w-9 h-9 rounded-full object-cover border"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <textarea
                        rows={3}
                        placeholder={
                          joinedClubIds.includes(activeClub.id)
                            ? `${activeClub.name.split(" ").slice(1).join(" ")} 회원님들께 따뜻한 글 한 줄을 나누어 주세요!`
                            : "이 소모임 회원들에게 글을 남기려면 먼저 우측 상단 '이 소모임 가입하기' 버튼을 눌러주세요."
                        }
                        disabled={!joinedClubIds.includes(activeClub.id)}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-semibold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-150 leading-relaxed resize-none disabled:opacity-60"
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/80 pt-3 select-none">
                    <p className="text-[10.5px] text-zinc-400 font-bold">
                      ⚠️ 품격 있는 존중의 대화를 실천해 주세요.
                    </p>

                    <button
                      type="button"
                      disabled={isSubmittingPost || !newPostContent.trim() || !joinedClubIds.includes(activeClub.id)}
                      onClick={handleCreatePost}
                      className="px-4.5 py-2.5 bg-red-655 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer text-xs flex items-center justify-center gap-1 shadow-sm disabled:opacity-50"
                    >
                      {isSubmittingPost ? (
                        <RefreshCw className="animate-spin" size={12} />
                      ) : (
                        <>
                          <Send size={12} />
                          <span>피드 게시</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Feed Posts Sub-Toolbar: Search & Sort */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-4 rounded-3xl shadow-sm select-none">
                  <div className="relative flex-1">
                    <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="피드 본문 또는 작성자 닉네임 검색..."
                      value={postSearchQuery}
                      onChange={(e) => setPostSearchQuery(e.target.value)}
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl pl-8.5 pr-3 py-2 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-150 placeholder-zinc-400"
                    />
                    {postSearchQuery && (
                      <button 
                        onClick={() => setPostSearchQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-650 text-xs font-black cursor-pointer"
                      >
                        ×
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">피드 정렬</span>
                    <div className="flex bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 p-0.5 rounded-lg">
                      <button
                        type="button"
                        onClick={() => { triggerHaptic(500, 0.02); setPostSortMode("latest"); }}
                        className={cn(
                          "px-3 py-1 rounded-md text-[10px] font-black transition-colors",
                          postSortMode === "latest"
                            ? "bg-red-500/10 text-red-655"
                            : "text-zinc-400 hover:text-zinc-600"
                        )}
                      >
                        최신순
                      </button>
                      <button
                        type="button"
                        onClick={() => { triggerHaptic(500, 0.02); setPostSortMode("popular"); }}
                        className={cn(
                          "px-3 py-1 rounded-md text-[10px] font-black transition-colors",
                          postSortMode === "popular"
                            ? "bg-red-500/10 text-red-655"
                            : "text-zinc-400 hover:text-zinc-600"
                        )}
                      >
                        인기순
                      </button>
                    </div>
                  </div>
                </div>

                {/* Feed Posts List */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="animate-spin text-red-500 mx-auto mb-2" size={24} />
                      <p className="text-xs font-bold text-zinc-400">피드 게시글 수신 중...</p>
                    </div>
                  ) : (() => {
                    let processed = [...clubPosts];

                    // 1. Filter by Search Query
                    if (postSearchQuery.trim()) {
                      const q = postSearchQuery.toLowerCase();
                      processed = processed.filter(post => 
                        post.author.toLowerCase().includes(q) || 
                        post.content.toLowerCase().includes(q)
                      );
                    }

                    // 2. Sort by Mode
                    if (postSortMode === "latest") {
                      processed.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                    } else if (postSortMode === "popular") {
                      processed.sort((a, b) => {
                        const scoreA = a.likes + Object.values(a.reactions || {}).reduce((sum, list) => sum + list.length, 0);
                        const scoreB = b.likes + Object.values(b.reactions || {}).reduce((sum, list) => sum + list.length, 0);
                        return scoreB - scoreA;
                      });
                    }

                    if (processed.length === 0) {
                      return (
                        <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-12 rounded-[2rem] text-center space-y-2 shadow-sm">
                          <MessageSquare className="text-zinc-300 dark:text-zinc-700 mx-auto" size={32} />
                          <p className="text-xs font-black text-zinc-500">조건에 부합하는 피드 게시글이 없습니다.</p>
                          <p className="text-[10px] text-zinc-400">새로운 이야기를 먼저 작성해 보세요!</p>
                        </div>
                      );
                    }

                    return (
                      <div className="space-y-4">
                        {processed.map((post) => {
                          const isLiked = user && post.likedBy?.includes(user.uid);
                          const canDelete = user && (user.uid === post.authorId || user.email === 'f8001161@gmail.com');

                          return (
                            <div 
                              key={post.id}
                              className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850/80 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 relative group"
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <img
                                    src={post.authorAvatar}
                                    alt={post.author}
                                    className="w-8 h-8 rounded-full border border-zinc-200/60"
                                    referrerPolicy="no-referrer"
                                  />
                                  <div>
                                    <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200">@{post.author}</h4>
                                    <p className="text-[9px] font-mono text-zinc-400 font-bold">
                                      {new Date(post.createdAt).toLocaleDateString("ko-KR", {
                                        month: "long",
                                        day: "numeric",
                                        hour: "2-digit",
                                        minute: "2-digit"
                                      })}
                                    </p>
                                  </div>
                                </div>

                                {canDelete && (
                                  <button
                                    onClick={() => handleDeletePost(post.id, post.authorId)}
                                    className="p-1 text-zinc-400 hover:text-red-500 cursor-pointer"
                                    title="글 삭제"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>

                              <p className="text-xs md:text-sm text-zinc-650 dark:text-zinc-350 leading-relaxed font-semibold whitespace-pre-wrap">
                                {post.content}
                              </p>

                              <div className="flex flex-wrap items-center gap-2 border-t border-zinc-100 dark:border-zinc-800/60 pt-3 text-xs select-none">
                                <button
                                  onClick={() => handleLikePost(post)}
                                  className={cn(
                                    "flex items-center gap-1 font-bold cursor-pointer transition-colors px-2.5 py-1 rounded-lg",
                                    isLiked 
                                      ? "bg-red-500/10 text-red-600 dark:text-red-400" 
                                      : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 hover:text-zinc-600"
                                  )}
                                >
                                  <ThumbsUp size={12} className={isLiked ? "fill-current" : ""} />
                                  <span className="font-mono">{post.likes}</span>
                                </button>

                                {/* 4 Emotional Reactions */}
                                {["❤️", "🔥", "🌱", "💡"].map((emoji) => {
                                  const reactorList = post.reactions?.[emoji] || [];
                                  const hasReacted = user && reactorList.includes(user.uid);
                                  return (
                                    <button
                                      key={emoji}
                                      onClick={() => handleReactionPost(post, emoji)}
                                      className={cn(
                                        "flex items-center gap-1 cursor-pointer transition-all px-2.5 py-1 rounded-lg text-xs font-bold hover:scale-105",
                                        hasReacted 
                                          ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20" 
                                          : "text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                                      )}
                                    >
                                      <span>{emoji}</span>
                                      <span className="font-mono text-[10px]">{reactorList.length}</span>
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>

              </div>
            )}

            {/* TAB: CHAT / CHATROOM SESSIONS */}
            {activeTab === "chat" && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="bg-white dark:bg-zinc-900 border border-zinc-250/60 dark:border-zinc-850 rounded-3xl p-4 md:p-6 shadow-sm flex flex-col h-[500px]">
                  <div className="border-b border-zinc-100 dark:border-zinc-800 pb-3 mb-4 flex items-center justify-between">
                    <div className="text-left">
                      <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-150 flex items-center gap-1.5">
                        <MessageSquare size={16} className="text-red-550 animate-pulse" />
                        실시간 소모임 단톡방
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-bold">클럽 멤버들과 따뜻한 이야기를 실시간으로 가볍게 나누어보세요.</p>
                    </div>
                    <span className="text-[9.5px] bg-red-500/10 text-red-600 font-black px-2.5 py-1 rounded-full flex items-center gap-1.5 tracking-wider">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                      LIVE
                    </span>
                  </div>

                  <div className="flex-1 overflow-y-auto space-y-4 pr-1 mb-4 no-scrollbar">
                    {clubChats.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-center opacity-45 select-none py-12">
                        <MessageSquare size={36} className="text-zinc-400 mb-2 stroke-1" />
                        <p className="text-xs font-bold text-zinc-500">첫 번째 실시간 메시지를 작성해 보세요!</p>
                      </div>
                    ) : (
                      clubChats.map((chat) => {
                        const isMe = chat.authorId === user?.uid;
                        return (
                          <div
                            key={chat.id}
                            className={cn(
                              "flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300",
                              isMe ? "ml-auto flex-row-reverse text-right" : "mr-auto text-left"
                            )}
                          >
                            <img
                              src={chat.authorAvatar}
                              alt="avatar"
                              className="w-8 h-8 rounded-full object-cover shrink-0 border border-zinc-200"
                              referrerPolicy="no-referrer"
                            />
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5 text-[10.5px] font-bold flex-wrap">
                                <span className="text-zinc-850 dark:text-zinc-150">{chat.author}</span>
                                <span className="bg-red-500/10 text-red-600 dark:text-red-400 text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider scale-90">
                                  {chat.userRank || "새싹 시민 🌱"}
                                </span>
                                <span className="text-[9px] text-zinc-400 font-mono">
                                  {new Date(chat.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <div
                                className={cn(
                                  "p-3 rounded-2xl text-xs font-semibold leading-relaxed break-all shadow-sm border",
                                  isMe
                                    ? "bg-red-655 border-red-500 text-white rounded-tr-none"
                                    : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-150 rounded-tl-none"
                                )}
                              >
                                {chat.content}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <form onSubmit={handleCreateChat} className="flex gap-2 border-t border-zinc-100 dark:border-zinc-800 pt-3">
                    <input
                      type="text"
                      placeholder={
                        joinedClubIds.includes(activeClub.id)
                          ? "실시간 대화에 참여하세요..."
                          : "대화에 참여하려면 먼저 소모임에 가입해주세요!"
                      }
                      disabled={!joinedClubIds.includes(activeClub.id) || isSubmittingChat}
                      value={chatMessageInput}
                      onChange={(e) => setChatMessageInput(e.target.value)}
                      className="flex-1 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-150 placeholder-zinc-400 disabled:opacity-60"
                    />
                    <button
                      type="submit"
                      disabled={
                        !chatMessageInput.trim() ||
                        !joinedClubIds.includes(activeClub.id) ||
                        isSubmittingChat
                      }
                      className="px-4.5 bg-red-655 hover:bg-red-700 text-white font-black rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0 disabled:opacity-50"
                    >
                      {isSubmittingChat ? (
                        <RefreshCw className="animate-spin" size={14} />
                      ) : (
                        <Send size={14} />
                      )}
                    </button>
                  </form>
                </div>
              </div>
            )}

            {/* TAB: MEETUPS / OFFLINE SESSIONS */}
            {activeTab === "meetups" && (
              <div className="space-y-6">
                
                {/* Meetup Creation / Headline Banner Card */}
                <div className="bg-gradient-to-r from-red-655 to-rose-600 text-white rounded-[2rem] p-6 shadow-md flex flex-col sm:flex-row items-center justify-between gap-4 select-none">
                  <div className="space-y-1">
                    <span className="bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">OFFLINE MEETUP PLANNER</span>
                    <h4 className="text-base font-black">실시간 오프라인 번개 개설</h4>
                    <p className="text-[11px] text-white/80 font-medium max-w-md">시민 회원들과 만나 노하우를 직접 배우고 교류하는 오프라인 번개 일정을 호스팅할 수 있습니다.</p>
                  </div>

                  <button
                    onClick={() => {
                      triggerHaptic(650, 0.04);
                      if (!user) onAuthClick();
                      else setIsMeetupModalOpen(true);
                    }}
                    className="px-4 py-3 bg-white text-red-600 hover:bg-red-50 font-black rounded-xl text-xs flex items-center justify-center gap-1 shrink-0 cursor-pointer shadow"
                  >
                    <Plus size={14} />
                    <span>번개 약속 잡기</span>
                  </button>
                </div>

                {/* Improvement 5: 실시간 3초 번개 모임 모집 타이머 (3-Sec Flash Meetup Countdown Widget) */}
                <div className="bg-zinc-50 dark:bg-zinc-950 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-[2rem] p-5 relative overflow-hidden select-none">
                  <div className="absolute top-0 right-0 p-3">
                    <span className="bg-red-500/10 text-red-655 text-[9px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="w-1.5 h-1.5 bg-red-550 rounded-full animate-ping" />
                      LIVE
                    </span>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-red-500/10 text-red-655 rounded-2xl shrink-0">
                      <Clock size={20} className={flashActive ? "animate-spin" : ""} />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-xs font-black text-zinc-800 dark:text-zinc-200 font-sans">⚡ 초고속 3초 소모임 번개 매칭 발전기</h4>
                      <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed font-sans">
                        현재 이 소모임에 온라인으로 활동 중인 회원을 실시간 소환합니다. 가볍게 만나 수다를 나누거나 즉석 치맥을 번개 제안해 보세요!
                      </p>

                      {flashActive ? (
                        <div className="mt-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-2xl space-y-3.5">
                          <div className="flex items-center justify-between font-sans">
                            <span className="text-[10px] font-black text-red-500 animate-pulse">매칭 마감 {flashTimeLeft}초 전!</span>
                            <span className="text-[10px] font-bold text-zinc-400">참여자 <strong className="text-zinc-700 dark:text-zinc-200 font-black">{flashJoinedCount}명</strong> 대기 중</span>
                          </div>
                          <div className="w-full bg-zinc-150 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="bg-red-550 h-full rounded-full transition-all duration-1000"
                              style={{ width: `${(flashTimeLeft / 30) * 100}%` }}
                            />
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={handleJoinFlash}
                              disabled={hasJoinedFlash}
                              className={cn(
                                "flex-1 py-2 rounded-xl text-[11px] font-black cursor-pointer transition-all text-center font-sans",
                                hasJoinedFlash
                                  ? "bg-zinc-150 text-zinc-450 dark:bg-zinc-850 cursor-not-allowed border-zinc-200 dark:border-zinc-800"
                                  : "bg-red-655 text-white hover:bg-red-700 hover:scale-[1.02] border-red-600"
                              )}
                            >
                              {hasJoinedFlash ? "✓ 번개 줄서기 완료!" : "🙋 나도 즉석 번개 합류하기"}
                            </button>
                            <button
                              type="button"
                              onClick={() => { triggerHaptic(900, 0.05); setFlashActive(false); }}
                              className="px-3 py-2 bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-450 rounded-xl text-[11px] font-black cursor-pointer font-sans"
                            >
                              취소
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="mt-3">
                          <button
                            type="button"
                            onClick={handleStartFlash}
                            className="px-4 py-2 bg-zinc-900 hover:bg-black dark:bg-zinc-800 dark:hover:bg-zinc-700 text-white rounded-xl text-[10px] font-black flex items-center gap-1 transition-all hover:scale-[1.02] cursor-pointer font-sans border border-zinc-750 dark:border-zinc-700"
                          >
                            <span>🔥 지금 즉시 번개 타이머 작동시키기 (30초 한정)</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Meetup Items Grid */}
                {clubMeetups.length === 0 ? (
                  <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-12 rounded-[2rem] text-center space-y-2 shadow-sm">
                    <Calendar className="text-zinc-300 dark:text-zinc-700 mx-auto" size={32} />
                    <p className="text-xs font-black text-zinc-500">예정된 오프라인 번개 모임이 없습니다.</p>
                    <p className="text-[10px] text-zinc-400">제일 먼저 번개 모임을 추진해 리더가 되어보세요!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {clubMeetups.map((meetup) => {
                      const isAttending = user && meetup.attendees.includes(user.uid);
                      const isFull = meetup.attendees.length >= meetup.capacity;
                      const isAdmin = checkIsAdmin(user?.email);
                      const isHost = isUserClubHost;
                      const isCreator = user && meetup.creatorId === user.uid;
                      const canDeleteMeetup = isAdmin || isHost || isCreator;

                      const ddayBadge = (() => {
                        try {
                          const meetupDateObj = new Date(meetup.date);
                          if (isNaN(meetupDateObj.getTime())) return null;
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          meetupDateObj.setHours(0, 0, 0, 0);
                          const diffTime = meetupDateObj.getTime() - today.getTime();
                          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                          if (diffDays === 0) return "오늘 진행";
                          if (diffDays < 0) return `마감됨 (${Math.abs(diffDays)}일 전)`;
                          return `D-${diffDays}`;
                        } catch (e) {
                          return null;
                        }
                      })();

                      return (
                        <div 
                          key={meetup.id}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between relative group"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap items-center gap-1.5">
                                <span className={cn(
                                  "text-[9px] font-black uppercase px-2 py-0.5 rounded select-none font-mono",
                                  isFull 
                                    ? "bg-zinc-100 text-zinc-450 dark:bg-zinc-800" 
                                    : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                                )}>
                                  {isFull ? "정원 모집 마감" : `참가 신청 중 (${meetup.attendees.length}/${meetup.capacity}명)`}
                                </span>

                                {ddayBadge && (
                                  <span className={cn(
                                    "text-[9px] font-black px-1.5 py-0.5 rounded select-none font-mono",
                                    ddayBadge.includes("마감")
                                      ? "bg-zinc-100 text-zinc-400 dark:bg-zinc-800"
                                      : ddayBadge === "오늘 진행"
                                      ? "bg-rose-500 text-white animate-pulse"
                                      : "bg-red-500/10 text-red-600 dark:text-red-400"
                                  )}>
                                    {ddayBadge}
                                  </span>
                                )}
                              </div>

                              <div className="flex items-center gap-1">
                                {/* Share Button */}
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const shareText = `🌱 [이솔 소모임 번개 초대]
진행 모임: ${activeClub?.name || "소모임"}
제목: ${meetup.title}
일시: ${meetup.date} ${meetup.time}
장소: ${meetup.location}
소개: ${meetup.description}
함께 소중한 취향과 생태 가치를 나눠요!`;
                                    navigator.clipboard.writeText(shareText);
                                    toast.success("📋 번개 초대 양식이 클립보드에 복사되었습니다! 편하게 붙여넣으세요.");
                                  }}
                                  className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-600 rounded-lg transition-colors cursor-pointer"
                                  title="초대 메시지 복사"
                                >
                                  <Share2 size={13} />
                                </button>

                                {canDeleteMeetup && (
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteMeetup(meetup.id, meetup.creatorId)}
                                    className="p-1 hover:bg-red-500/10 text-zinc-450 hover:text-red-500 rounded-lg transition-colors cursor-pointer"
                                    title="번개 취소하기"
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                )}
                              </div>
                            </div>

                            <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100 line-clamp-1">{meetup.title}</h4>
                            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-semibold">
                              {meetup.description}
                            </p>
                          </div>

                          {/* Capacity gauge bar */}
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[9px] font-black text-zinc-400">
                              <span>모집 진행률</span>
                              <span>{Math.min(100, Math.floor((meetup.attendees.length / meetup.capacity) * 100))}%</span>
                            </div>
                            <div className="w-full bg-zinc-100 dark:bg-zinc-800 h-1 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  isFull 
                                    ? "bg-zinc-400" 
                                    : meetup.attendees.length >= meetup.capacity * 0.8 
                                    ? "bg-amber-500 animate-pulse" 
                                    : "bg-emerald-500"
                                )}
                                style={{ width: `${Math.min(100, Math.floor((meetup.attendees.length / meetup.capacity) * 100))}%` }}
                              />
                            </div>
                          </div>

                          <div className="space-y-2 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] font-bold text-zinc-500 dark:text-zinc-400 select-none">
                            <div className="flex items-center gap-1.5">
                              <Calendar size={13} className="text-red-500" />
                              <span>{meetup.date}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock size={13} className="text-red-500" />
                              <span>{meetup.time}</span>
                            </div>
                            <div className="flex items-center justify-between gap-1.5">
                              <div className="flex items-center gap-1.5 truncate">
                                <MapPin size={13} className="text-red-500 animate-bounce shrink-0" />
                                <span className="truncate" title={meetup.location}>{meetup.location}</span>
                              </div>
                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic(400, 0.02);
                                    navigator.clipboard.writeText(meetup.location);
                                    setCopiedMeetupId(meetup.id);
                                    setTimeout(() => setCopiedMeetupId(null), 2000);
                                    toast.success("📍 모임 장소가 클립보드에 복사되었습니다!");
                                  }}
                                  className={cn(
                                    "p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded transition-all cursor-pointer flex items-center justify-center active:scale-95 duration-150",
                                    copiedMeetupId === meetup.id
                                      ? "text-emerald-500 bg-emerald-500/10 dark:bg-emerald-500/20"
                                      : "text-zinc-400 hover:text-red-500"
                                  )}
                                  title="장소 주소 복사"
                                >
                                  {copiedMeetupId === meetup.id ? (
                                    <Check size={11} className="stroke-[3.5]" />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </button>
                                <a
                                  href={`https://map.kakao.com/?q=${encodeURIComponent(meetup.location)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    triggerHaptic(400, 0.02);
                                  }}
                                  className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-red-500 rounded transition-colors cursor-pointer flex items-center"
                                  title="카카오맵에서 장소 확인"
                                >
                                  <ExternalLink size={11} />
                                </a>
                              </div>
                            </div>

                            {meetup.attendeeNames && meetup.attendeeNames.length > 0 && (
                              <div className="flex flex-wrap gap-1 pt-1.5 text-[9px] text-zinc-400">
                                <span className="font-black shrink-0">참석확정:</span>
                                <span className="truncate">{meetup.attendeeNames.join(", ")}</span>
                              </div>
                            )}
                          </div>

                          <button
                            onClick={() => handleToggleMeetupAttend(meetup)}
                            className={cn(
                              "w-full py-2.5 rounded-xl font-black text-xs cursor-pointer border transition-all text-center mt-2.5",
                              isAttending
                                ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-600 dark:text-emerald-400"
                                : isFull
                                ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                : "bg-zinc-900 border-zinc-800 text-white hover:bg-black"
                            )}
                          >
                            {isAttending ? "✓ 참석 신청 완료 (취소하기)" : isFull ? "정원 가득 참" : "참석 신청하기"}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* TAB: DAILY MISSION CHALLENGES */}
            {activeTab === "missions" && (
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-amber-500 to-orange-555 text-white rounded-[2rem] p-6 shadow-md select-none">
                  <div className="space-y-1">
                    <span className="bg-white/20 border border-white/20 px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider">DAILY MISSION ZONE</span>
                    <h4 className="text-base font-black">소모임 일일 미션 챌린지 📸</h4>
                    <p className="text-[11px] text-white/80 font-medium max-w-md font-sans">매일 소모임 특화 행동을 실천하고 인증샷을 남겨 보세요. 실천 시 활성 온도가 더욱 불타오릅니다!</p>
                  </div>
                </div>

                {/* Mission checklist card */}
                <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-sm space-y-6 select-none">
                  <div className="flex items-center justify-between font-sans">
                    <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100 flex items-center gap-1.5">
                      <Sparkles className="text-amber-500" size={16} />
                      오늘의 이솔나눔 행동 수칙
                    </h4>
                    <span className="text-xs font-bold text-zinc-400">
                      진행도: <strong className="text-orange-500">{
                        (() => {
                          const clubMissions = selectedClubId === "smart-farm" 
                            ? ["sf-1", "sf-2", "sf-3"] 
                            : selectedClubId === "busking" 
                            ? ["bk-1", "bk-2", "bk-3"] 
                            : selectedClubId === "book-salon" 
                            ? ["bs-1", "bs-2", "bs-3"] 
                            : ["er-1", "er-2", "er-3"];
                          const doneCount = clubMissions.filter(m => completedMissions.includes(m)).length;
                          return `${doneCount} / 3`;
                        })()
                      }</strong>
                    </span>
                  </div>

                  <div className="space-y-3 font-sans">
                    {(() => {
                      const missionsList = selectedClubId === "smart-farm" ? [
                        { id: "sf-1", text: "수경재배 가전 물갈이 & 친환경 영양제 투여하기 💧" },
                        { id: "sf-2", text: "오늘 수확한 허브/방울토마토 샐러드에 얹어 식사 인증 🥗" },
                        { id: "sf-3", text: "이솔 스마트팜 IoT 센서 모니터링 스크린샷 올리기 📱" }
                      ] : selectedClubId === "busking" ? [
                        { id: "bk-1", text: "나의 악기 먼지 닦고 정밀 튜닝하기 🎸" },
                        { id: "bk-2", text: "이번 주 한강 버스킹 희망 선곡 리스트 1곡 등록하기 📝" },
                        { id: "bk-3", text: "좋아하는 길거리 아티스트 음원 스트리밍 1회 인증 🎧" }
                      ] : selectedClubId === "book-salon" ? [
                        { id: "bs-1", text: "오늘 읽은 인문학 도서 마음에 와닿는 1줄 손글씨 필사 ✍️" },
                        { id: "bs-2", text: "이달의 공동 수필집 작성을 위한 브레인스토밍 아이디어 1줄 🧠" },
                        { id: "bs-3", text: "아고라 다른 동료의 피드글에 따뜻한 응원 감상평 남기기 💬" }
                      ] : [
                        { id: "er-1", text: "오늘 에코 라이딩 중 길가의 플라스틱 컵 1개 줍기(플로깅) 🗑️" },
                        { id: "er-2", text: "안전을 위한 자전거 타이어 공기압 체크 및 브레이크 점검 ⚙️" },
                        { id: "er-3", text: "오늘 라이딩 주행 거리 스크린샷 캡처해 두기 🚴" }
                      ];

                      return missionsList.map((m) => {
                        const isDone = completedMissions.includes(m.id);
                        return (
                          <div 
                            key={m.id}
                            onClick={() => {
                              triggerHaptic(500, 0.03);
                              let next: string[];
                              if (isDone) {
                                next = completedMissions.filter(id => id !== m.id);
                              } else {
                                next = [...completedMissions, m.id];
                                toast.success("🎉 미션 완료! 챌린지 샷을 업로드하여 아고라 시민들과 공유해 보세요.", {
                                  icon: "📸"
                                });
                              }
                              setCompletedMissions(next);
                              localStorage.setItem("completed_missions_2026", JSON.stringify(next));
                              if (user) {
                                setDoc(doc(db, "agora_user_profiles", user.uid), {
                                  completedMissions: next,
                                  updatedAt: new Date().toISOString()
                                }, { merge: true }).catch(() => {});
                              }
                            }}
                            className={cn(
                              "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer",
                              isDone 
                                ? "bg-orange-500/10 border-orange-500/20 text-orange-950 dark:text-orange-200" 
                                : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-350 dark:hover:border-zinc-700"
                            )}
                          >
                            <span className="text-xs font-bold leading-snug">{m.text}</span>
                            <span className={cn(
                              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0",
                              isDone ? "bg-orange-550 border-orange-550 text-white" : "border-zinc-300 dark:border-zinc-700"
                            )}>
                              {isDone && <span className="text-[10px] font-black">✓</span>}
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Dynamic Photo Upload Simulation Widget for Gen Z appeal */}
                  <div className="bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl space-y-4 font-sans">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <h5 className="text-xs font-black text-zinc-800 dark:text-zinc-200">📸 실시간 미션 인증 숏폼 갤러리</h5>
                        <p className="text-[10px] text-zinc-400 font-bold">클럽 멤버들과 따끈따끈한 미션 인증 사진을 즉시 셰어링하세요.</p>
                      </div>
                      <span className="text-[9px] bg-amber-500/10 text-amber-600 font-black px-2 py-0.5 rounded-full">인기 급상승</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-zinc-200 dark:bg-zinc-800 aspect-square rounded-xl overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?w=150&auto=format&fit=crop&q=60" alt="pic1" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/45 flex items-end p-1.5 opacity-100">
                          <span className="text-[8.5px] text-white font-black truncate">@민수스마트🌱</span>
                        </div>
                      </div>
                      <div className="bg-zinc-200 dark:bg-zinc-800 aspect-square rounded-xl overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=150&auto=format&fit=crop&q=60" alt="pic2" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/45 flex items-end p-1.5 opacity-100">
                          <span className="text-[8.5px] text-white font-black truncate">@기타맨준🎸</span>
                        </div>
                      </div>
                      <div className="bg-zinc-200 dark:bg-zinc-800 aspect-square rounded-xl overflow-hidden relative group">
                        <img src="https://images.unsplash.com/photo-1476820865390-c52aeebb9891?w=150&auto=format&fit=crop&q=60" alt="pic3" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/45 flex items-end p-1.5 opacity-100">
                          <span className="text-[8.5px] text-white font-black truncate">@지성인📚</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          triggerHaptic(700, 0.05);
                          toast.info("📷 기기 카메라/갤러리 연동 중...", {
                            description: "데스크톱 브라우저 환경에서 시뮬레이션 사진이 자동 매핑됩니다."
                          });
                          setTimeout(() => {
                            toast.success("🔥 인증 완료! 미션 성공으로 활성 온도가 2°C 증가했습니다.");
                          }, 1500);
                        }}
                        className="w-full py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black cursor-pointer text-center transition-all shadow-sm border border-orange-600"
                      >
                        ⚡ 내 미션 실천 샷 등록하기 (활성 온도 부스트)
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* --- MANAGE CLUB MODAL (HOST & ADMIN CONTROLS) --- */}
      <AnimatePresence>
        {isManageClubModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsManageClubModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-3xl p-6 md:p-8 relative z-10 shadow-2xl text-left overflow-hidden"
            >
              <button
                onClick={() => setIsManageClubModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5 w-fit">
                    <Sliders size={12} /> HOST CONTROL CENTER
                  </span>
                  <h3 className="text-xl md:text-2xl font-black tracking-tight flex items-center gap-2">
                    <span>{activeClub.emoji}</span>
                    <span>{activeClub.name.replace(activeClub.emoji, "").trim()} 소모임 관리 공방</span>
                  </h3>
                  <p className="text-xs text-zinc-400 font-bold">방장 권한으로 모임 프로필을 편집하고, 멤버와 모임 일정을 제어합니다.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                  
                  {/* Left panel: Edit details & Dissolve */}
                  <form onSubmit={handleUpdateClub} className="space-y-4 border-r border-zinc-150/40 dark:border-zinc-800/60 pr-0 md:pr-6">
                    <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider pb-1 border-b border-zinc-150/60 dark:border-zinc-800/40">기본 정보 수정</h4>
                    
                    <div className="grid grid-cols-4 gap-2">
                      <div className="col-span-1 space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">아이콘</label>
                        <select
                          value={editClubEmoji}
                          onChange={(e) => setEditClubEmoji(e.target.value)}
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-2.5 text-lg outline-none cursor-pointer text-center"
                        >
                          <option value="🌱">🌱</option>
                          <option value="🎸">🎸</option>
                          <option value="📚">📚</option>
                          <option value="🚴">🚴</option>
                          <option value="🎨">🎨</option>
                          <option value="📸">📸</option>
                          <option value="🍳">🍳</option>
                          <option value="⛺">⛺</option>
                          <option value="🍿">🍿</option>
                        </select>
                      </div>

                      <div className="col-span-3 space-y-1">
                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">소모임명</label>
                        <input
                          type="text"
                          placeholder="소모임 이름"
                          value={editClubName}
                          onChange={(e) => setEditClubName(e.target.value)}
                          required
                          className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-100"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">소모임 소개글</label>
                      <textarea
                        placeholder="소개글을 작성하세요."
                        rows={3}
                        value={editClubDesc}
                        onChange={(e) => setEditClubDesc(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500 text-zinc-850 dark:text-zinc-100 leading-relaxed resize-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">검색 태그 (콤마로 구분)</label>
                      <input
                        type="text"
                        placeholder="예: 커피, 원두나눔, 핸드드립"
                        value={editClubTags}
                        onChange={(e) => setEditClubTags(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-100"
                      />
                    </div>

                    <div className="flex gap-2.5 pt-2">
                      <button
                        type="submit"
                        className="flex-1 py-3 bg-red-655 hover:bg-red-700 text-white font-black rounded-xl text-xs cursor-pointer shadow-md transition-all text-center"
                      >
                        저장하기
                      </button>

                      <button
                        type="button"
                        onClick={handleDissolveClub}
                        className="px-3.5 py-3 bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 font-black rounded-xl text-xs cursor-pointer hover:bg-red-500/20 transition-all text-center flex items-center justify-center"
                        title="소모임 폐쇄"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </form>

                  {/* Right panel: Member management */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between pb-1 border-b border-zinc-150/60 dark:border-zinc-800/40">
                      <h4 className="text-xs font-black text-zinc-400 uppercase tracking-wider">소모임 멤버 관리 ({clubMembers.length})</h4>
                      <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded text-zinc-400 font-bold">실시간 인가</span>
                    </div>

                    <div className="space-y-2 max-h-[280px] overflow-y-auto pr-1">
                      {clubMembers.length === 0 ? (
                        <div className="text-center py-8 text-zinc-400 text-xs font-semibold">
                          <Users className="mx-auto text-zinc-300 dark:text-zinc-700 mb-2" size={24} />
                          가입한 일반 멤버가 없습니다.
                        </div>
                      ) : (
                        clubMembers.map((member) => (
                          <div 
                            key={member.id} 
                            className="flex items-center justify-between p-2.5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200/50 dark:border-zinc-800/80 rounded-xl"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <img 
                                src={member.avatar} 
                                alt={member.name} 
                                className="w-8 h-8 rounded-full border border-zinc-250 dark:border-zinc-800 shrink-0 bg-white" 
                                referrerPolicy="no-referrer"
                              />
                              <div className="min-w-0">
                                <p className="text-xs font-black text-zinc-800 dark:text-zinc-200 truncate">@{member.name}</p>
                                <button 
                                  type="button"
                                  onClick={() => handleChangeMemberRole(member.id, member.role)}
                                  className="text-[9px] font-black text-red-655 dark:text-red-400 hover:underline cursor-pointer text-left block"
                                >
                                  {member.role} ⇅
                                </button>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleKickMember(member.id, member.name)}
                              className="p-1.5 hover:bg-red-500/10 text-zinc-400 hover:text-red-500 rounded-lg transition-colors cursor-pointer shrink-0"
                              title="추방하기"
                            >
                              <UserMinus size={14} />
                            </button>
                          </div>
                        ))
                      )}
                    </div>

                    <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-2xl space-y-1 text-left">
                      <p className="text-[10px] text-amber-600 dark:text-amber-400 font-extrabold flex items-center gap-1">
                        <ShieldAlert size={12} /> 방장 주의 사항
                      </p>
                      <p className="text-[9.5px] text-zinc-500 dark:text-zinc-400 leading-relaxed font-bold">
                        방장은 소모임을 정화하고 음란물이나 욕설을 업로드하는 멤버를 추방할 권리가 주어집니다. 잦은 추방은 소모임 정지 사유가 될 수 있습니다.
                      </p>
                    </div>

                  </div>

                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREATE NEW CLUB MODAL --- */}
      <AnimatePresence>
        {isCreateClubModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCreateClubModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-md p-6 md:p-8 relative z-10 shadow-2xl text-left"
            >
              <button
                onClick={() => setIsCreateClubModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="bg-red-500/10 border border-red-500/20 text-red-655 dark:text-red-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    NEW GATHERING FOUNDATION
                  </span>
                  <h3 className="text-xl font-black tracking-tight">새로운 취향 모임 개설</h3>
                </div>

                <form onSubmit={handleCreateClub} className="space-y-4">
                  <div className="grid grid-cols-4 gap-2">
                    <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">아이콘</label>
                      <select
                        value={newClubEmoji}
                        onChange={(e) => setNewClubEmoji(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-2 py-2.5 text-lg outline-none cursor-pointer"
                      >
                        <option value="🌱">🌱</option>
                        <option value="🎸">🎸</option>
                        <option value="📚">📚</option>
                        <option value="🚴">🚴</option>
                        <option value="🎨">🎨</option>
                        <option value="📸">📸</option>
                        <option value="🍳">🍳</option>
                        <option value="⛺">⛺</option>
                        <option value="🍿">🍿</option>
                      </select>
                    </div>

                    <div className="col-span-3 space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">모임 이름</label>
                      <input
                        type="text"
                        placeholder="예: 수제 커피 메이커들"
                        value={newClubName}
                        onChange={(e) => setNewClubName(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">모임 한줄 소개</label>
                    <textarea
                      placeholder="모임의 목적과 주된 오프라인 활동 방향을 상세하게 설명하세요."
                      rows={4}
                      value={newClubDesc}
                      onChange={(e) => setNewClubDesc(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500 text-zinc-850 dark:text-zinc-100 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">모임 카테고리</label>
                      <select
                        value={newClubCategory}
                        onChange={(e) => setNewClubCategory(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none cursor-pointer focus:border-red-500 text-zinc-800 dark:text-zinc-150"
                      >
                        <option value="친환경/원예">🌱 친환경/원예</option>
                        <option value="문화/예술">🎸 문화/예술</option>
                        <option value="인문학/독서">📚 인문학/독서</option>
                        <option value="레저/스포츠">🚴 레저/스포츠</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">검색 태그 (쉼표 구분)</label>
                      <input
                        type="text"
                        placeholder="예: 커피, 핸드드립"
                        value={newClubTags}
                        onChange={(e) => setNewClubTags(e.target.value)}
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingClub}
                    className="w-full py-3.5 bg-red-655 hover:bg-red-700 text-white font-black rounded-xl shadow-lg cursor-pointer text-xs"
                  >
                    {isSubmittingClub ? (
                      <RefreshCw className="animate-spin mx-auto" size={14} />
                    ) : (
                      <span>새 모임 개설하기</span>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- CREATE NEW MEETUP MODAL --- */}
      <AnimatePresence>
        {isMeetupModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMeetupModalOpen(false)}
              className="absolute inset-0 bg-black cursor-pointer"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 30 }}
              className="bg-white dark:bg-zinc-900 border border-zinc-250 dark:border-zinc-800 rounded-[2.5rem] w-full max-w-md p-6 md:p-8 relative z-10 shadow-2xl text-left"
            >
              <button
                onClick={() => setIsMeetupModalOpen(false)}
                className="absolute top-5 right-5 text-zinc-400 hover:text-zinc-600 cursor-pointer"
              >
                <X size={20} />
              </button>

              <div className="space-y-6">
                <div className="space-y-1">
                  <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider">
                    NEW MEETING RESERVE
                  </span>
                  <h3 className="text-xl font-black tracking-tight">오프라인 번개 개설하기</h3>
                </div>

                <form onSubmit={handleCreateMeetup} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">번개 모임명</label>
                    <input
                      type="text"
                      placeholder="예: 스마트 수경재배 기기 현장 가습 조절 시연회"
                      value={meetupTitle}
                      onChange={(e) => setMeetupTitle(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-850 dark:text-zinc-100"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">모임 상세 묘사</label>
                    <textarea
                      placeholder="만남 장소 특징, 준비물, 주요 진행 타임테이블을 회원들에게 소개해보세요."
                      rows={3}
                      value={meetupDesc}
                      onChange={(e) => setMeetupDesc(e.target.value)}
                      required
                      className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 text-xs font-bold outline-none focus:border-red-500 text-zinc-800 dark:text-zinc-100 leading-relaxed resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">모임 날짜</label>
                      <input
                        type="text"
                        placeholder="예: 2026.07.12 (일)"
                        value={meetupDate}
                        onChange={(e) => setMeetupDate(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-zinc-850 dark:text-zinc-100"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">모임 시간</label>
                      <input
                        type="text"
                        placeholder="예: 14:00 - 17:00"
                        value={meetupTime}
                        onChange={(e) => setMeetupTime(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-zinc-850 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">모임 장소</label>
                      <input
                        type="text"
                        placeholder="예: 스마트 가든 하우스 2층"
                        value={meetupLoc}
                        onChange={(e) => setMeetupLoc(e.target.value)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:border-red-500 text-zinc-850 dark:text-zinc-100"
                      />
                    </div>

                    <div className="col-span-1 space-y-1">
                      <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider">최대 모집정원</label>
                      <input
                        type="number"
                        min={2}
                        max={100}
                        value={meetupCap}
                        onChange={(e) => setMeetupCap(parseInt(e.target.value) || 10)}
                        required
                        className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2.5 text-xs font-bold outline-none text-zinc-850 dark:text-zinc-100"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmittingMeetup}
                    className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg cursor-pointer text-xs"
                  >
                    {isSubmittingMeetup ? (
                      <RefreshCw className="animate-spin mx-auto" size={14} />
                    ) : (
                      <span>오프라인 번개 약속 확정하기</span>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
