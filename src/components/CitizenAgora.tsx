import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
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
  Sliders
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
  getDocs, 
  updateDoc, 
  doc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc,
  handleFirestoreError,
  OperationType 
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
  const [activeTab, setActiveTab] = useState<"posts" | "meetups" | "info">("posts");

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
    return clubs.filter(club => {
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
  }, [clubs, selectedCategory, clubSearchQuery]);

  // Check if current user is host of active club, or is an admin
  const isUserClubHost = useMemo(() => {
    if (!user) return false;
    const isAdmin = user.email === "f8001161@gmail.com" || user.email === "shjvt@nate.com";
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

  // Auto-select first matching club when filter excludes the currently active one
  useEffect(() => {
    if (filteredClubs.length > 0 && !filteredClubs.some(c => c.id === selectedClubId)) {
      setSelectedClubId(filteredClubs[0].id);
    }
  }, [filteredClubs, selectedClubId]);

  // 1. Load Custom Clubs from localStorage on start
  useEffect(() => {
    const savedClubs = localStorage.getItem("user_created_clubs_2026");
    if (savedClubs) {
      const parsed = JSON.parse(savedClubs);
      setClubs([...initialClubs, ...parsed]);
    }
  }, []);

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
          likedBy: data.likedBy || []
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

  // 7. Delete Post
  const handleDeletePost = async (postId: string, authorId: string) => {
    const isAdmin = user?.email === 'f8001161@gmail.com' || user?.email === 'shjvt@nate.com';
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
    const isAdmin = user?.email === 'f8001161@gmail.com' || user?.email === 'shjvt@nate.com';
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
            </div>

            {/* Category Quick Filter Chips */}
            <div className="space-y-1">
              <span className="text-[9.5px] font-black text-zinc-400 uppercase tracking-wider px-1">카테고리 분류</span>
              <div className="flex flex-wrap gap-1 pt-1">
                {["전체", "친환경/원예", "문화/예술", "인문학/독서", "레저/스포츠"].map((cat) => {
                  const isCatSelected = selectedCategory === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => { triggerHaptic(550, 0.02); setSelectedCategory(cat); }}
                      className={cn(
                        "px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all cursor-pointer border",
                        isCatSelected
                          ? "bg-red-500/10 border-red-500/30 text-red-655 dark:text-red-400"
                          : "bg-zinc-50 dark:bg-zinc-950 border-zinc-200/50 dark:border-zinc-800 text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-350"
                      )}
                    >
                      {cat}
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

          {/* Sub Tab Selection Menu (Posts Feed vs Meetups Schedule) */}
          <div className="flex items-center gap-1 border-b border-zinc-200 dark:border-zinc-800/80 pb-2 select-none">
            <button
              onClick={() => { triggerHaptic(600, 0.02); setActiveTab("posts"); }}
              className={cn(
                "px-5 py-2.5 text-xs font-black rounded-xl transition-all relative cursor-pointer",
                activeTab === "posts"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <span>자유 소통 피드 ({clubPosts.length})</span>
              {activeTab === "posts" && <motion.div layoutId="activeAgoraTabLine" className="absolute bottom-[-10px] left-2 right-2 h-[3px] bg-red-500 rounded-full" />}
            </button>

            <button
              onClick={() => { triggerHaptic(600, 0.02); setActiveTab("meetups"); }}
              className={cn(
                "px-5 py-2.5 text-xs font-black rounded-xl transition-all relative cursor-pointer flex items-center gap-1",
                activeTab === "meetups"
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
              )}
            >
              <span>오프라인 모임 번개 ({clubMeetups.length})</span>
              {activeTab === "meetups" && <motion.div layoutId="activeAgoraTabLine" className="absolute bottom-[-10px] left-2 right-2 h-[3px] bg-red-500 rounded-full" />}
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

                {/* Feed Posts List */}
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-12">
                      <RefreshCw className="animate-spin text-red-500 mx-auto mb-2" size={24} />
                      <p className="text-xs font-bold text-zinc-400">피드 게시글 수신 중...</p>
                    </div>
                  ) : clubPosts.length === 0 ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 p-12 rounded-[2rem] text-center space-y-2 shadow-sm">
                      <MessageSquare className="text-zinc-300 dark:text-zinc-700 mx-auto" size={32} />
                      <p className="text-xs font-black text-zinc-500">아직 등록된 교류 글이 없습니다.</p>
                      <p className="text-[10px] text-zinc-400">첫 번째 이야기를 먼저 전해 분위기를 환하게 만들어보세요!</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {clubPosts.map((post) => {
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

                            <div className="flex items-center gap-4 border-t border-zinc-100 dark:border-zinc-800/60 pt-3 text-xs select-none">
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
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
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
                      const isAdmin = user?.email === 'f8001161@gmail.com' || user?.email === 'shjvt@nate.com';
                      const isHost = isUserClubHost;
                      const isCreator = user && meetup.creatorId === user.uid;
                      const canDeleteMeetup = isAdmin || isHost || isCreator;

                      return (
                        <div 
                          key={meetup.id}
                          className="bg-white dark:bg-zinc-900 border border-zinc-200/50 dark:border-zinc-850 rounded-3xl p-5 shadow-sm space-y-4 flex flex-col justify-between relative group"
                        >
                          <div className="space-y-2.5">
                            <div className="flex items-center justify-between">
                              <span className={cn(
                                "text-[9px] font-black uppercase px-2 py-0.5 rounded select-none font-mono",
                                isFull 
                                  ? "bg-zinc-100 text-zinc-450 dark:bg-zinc-800" 
                                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                              )}>
                                {isFull ? "정원 모집 마감" : `참가 신청 중 (${meetup.attendees.length}/${meetup.capacity}명)`}
                              </span>

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

                            <h4 className="text-sm font-black text-zinc-800 dark:text-zinc-100 line-clamp-1">{meetup.title}</h4>
                            <p className="text-[11.5px] text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed font-semibold">
                              {meetup.description}
                            </p>
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
                            <div className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-red-500 animate-bounce" />
                              <span className="truncate">{meetup.location}</span>
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
