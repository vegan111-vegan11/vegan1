/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, Component } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Menu,
  User,
  Bell,
  ChevronRight,
  Star,
  TrendingUp,
  Clock,
  Flame,
  Play,
  Info,
  X,
  Sun,
  Moon,
  LogOut,
  Mail,
  Lock,
  Github,
  Chrome,
  Heart,
  Share2,
  MessageSquare,
  Eye
} from 'lucide-react';
import { Toaster, toast } from 'sonner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import {
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  User as FirebaseUser
} from 'firebase/auth';
import {
  auth,
  db,
  googleProvider,
  githubProvider,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  handleFirestoreError,
  OperationType
} from './firebase';
import { AlertCircle } from 'lucide-react';

// Error Boundary Component
interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: any;
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "알 수 없는 오류가 발생했습니다.";
      try {
        const parsed = JSON.parse(this.state.error.message);
        if (parsed.error) errorMessage = `Firebase 오류: ${parsed.error}`;
      } catch (e) {
        errorMessage = this.state.error.message || errorMessage;
      }

      return (
        <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mb-6">
            <AlertCircle size={32} />
          </div>
          <h2 className="text-2xl font-bold mb-4">문제가 발생했습니다</h2>
          <p className="text-white/60 mb-8 max-w-md">{errorMessage}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-brand text-white px-8 py-3 rounded-full font-bold hover:bg-brand/80 transition-all"
          >
            페이지 새로고침
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// --- Utilities ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Mock Data ---
interface Webtoon {
  id: string;
  title: string;
  author?: string;
  genre?: string;
  rating?: number;
  thumbnail: string;
  banner?: string;
  description?: string;
  isNew?: boolean;
  isHot?: boolean;
  isCompleted?: boolean;
  episodes?: any;
  episodeCount?: number;
}

const GENRES = ['전체', '로맨스', '판타지', '드라마', '액션', 'SF', '미스터리', '일상'];

// --- Components ---

const WebtoonDetail: React.FC<{
  webtoon: Webtoon | null,
  onClose: () => void
}> = ({ webtoon, onClose }) => {
  const [episodes, setEpisodes] = useState<any[]>([]);
  const [isLoadingEpisodes, setIsLoadingEpisodes] = useState(false);

  useEffect(() => {
    if (webtoon) {
      setIsLoadingEpisodes(true);
      const epRef = collection(db, 'webtoons', webtoon.id, 'episodes');
      getDocs(epRef).then(snap => {
        const eps = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        eps.sort((a: any, b: any) => a.vol - b.vol);
        setEpisodes(eps);
      }).catch(err => {
        console.error("Fetch err:", err);
      }).finally(() => {
        setIsLoadingEpisodes(false);
      });
    }
  }, [webtoon]);

  const navigateToViewer = (epId: string) => {
    window.history.pushState({}, '', `/viewer/${webtoon?.id}/${epId}`);
    window.dispatchEvent(new Event('popstate'));
  };

  if (!webtoon) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 40 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 40 }}
          className="relative bg-surface dark:bg-zinc-900 w-full max-w-5xl h-full max-h-[90vh] rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl flex flex-col md:flex-row"
        >
          <button onClick={onClose} className="absolute top-6 right-6 z-10 p-2 bg-black/20 hover:bg-black/40 rounded-full text-white transition-all">
            <X size={24} />
          </button>

          <div className="w-full md:w-2/5 h-64 md:h-full relative">
            <img
              src={webtoon.thumbnail}
              className="w-full h-full object-cover"
              alt={webtoon.title}
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-black/60 to-transparent" />
          </div>

          <div className="flex-1 p-8 md:p-12 overflow-y-auto no-scrollbar">
            <div className="flex items-center gap-2 mb-4">
              <span className="bg-brand/20 text-brand text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                {webtoon.genre}
              </span>
              {webtoon.isHot && <span className="bg-orange-500/20 text-orange-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">Hot</span>}
              {webtoon.isNew && <span className="bg-blue-500/20 text-blue-500 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">New</span>}
            </div>

            <h2 className="text-4xl md:text-5xl font-bold mb-2 tracking-tight">{webtoon.title}</h2>
            <p className="text-xl text-white/60 mb-8 font-medium">{webtoon.author}</p>

            <div className="flex items-center gap-8 mb-10">
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">평점</span>
                <div className="flex items-center gap-1 text-xl font-bold">
                  <Star size={20} className="text-yellow-400 fill-yellow-400" />
                  {webtoon.rating}
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">조회수</span>
                <div className="flex items-center gap-1 text-xl font-bold">
                  <Eye size={20} className="text-white/60" />
                  1.2M
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white/30 uppercase tracking-widest mb-1">좋아요</span>
                <div className="flex items-center gap-1 text-xl font-bold">
                  <Heart size={20} className="text-white/60" />
                  45K
                </div>
              </div>
            </div>

            <p className="text-lg text-white/70 leading-relaxed mb-10 max-w-2xl">
              {webtoon.description}
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => {
                  if (episodes && episodes.length > 0) {
                    navigateToViewer(episodes[0].id || '1');
                  } else {
                    toast.info('등록된 에피소드가 없거나 로딩중입니다.');
                  }
                }}
                className="flex-1 min-w-[200px] bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3 text-lg cursor-pointer active:scale-95 z-50"
              >
                <Play size={24} fill="currentColor" /> 감상하기
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Play size={20} className="text-brand" fill="currentColor" /> 에피소드 리스트
              </h3>
              <div className="space-y-4">
                {isLoadingEpisodes ? (
                  <p className="text-white/40 text-center py-6 border border-dashed border-white/10 rounded-xl">에피소드를 로딩 중입니다...</p>
                ) : episodes && episodes.length > 0 ? (
                  episodes.map((ep: any, index: number) => (
                    <button
                      key={index}
                      onClick={() => navigateToViewer(ep.id || ep.vol?.toString() || '1')}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative shrink-0">
                          <img src={ep.cuts?.[0] || webtoon.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-brand transition-colors">{ep.title || index + 1 + '화'}</h4>
                          <p className="text-xs text-white/50">{ep.cuts?.length || 70}컷 분량</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/30 group-hover:text-brand transition-colors" />
                    </button>
                  ))
                ) : (
                  <p className="text-white/40 text-center py-6 border border-dashed border-white/10 rounded-xl">등록된 에피소드가 없습니다.</p>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const AuthModal: React.FC<{ isOpen: boolean, onClose: () => void, onLogin: (user: any) => void }> = ({ isOpen, onClose, onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      toast.success('구글 계정으로 로그인되었습니다.');
      onLogin(result.user);
      onClose();
    } catch (error: any) {
      let errorMessage = error.message;
      if (error.code === 'auth/network-request-failed') {
        errorMessage = '네트워크 연결에 실패했습니다. Firebase 콘솔에서 승인된 도메인에 현재 도메인을 추가했는지 확인해 주세요.';
      }
      toast.error('구글 로그인에 실패했습니다: ' + errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, githubProvider);
      toast.success('GitHub 계정으로 로그인되었습니다.');
      onLogin(result.user);
      onClose();
    } catch (error: any) {
      toast.error('GitHub 로그인에 실패했습니다: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        const result = await signInWithEmailAndPassword(auth, email, password);
        toast.success('로그인이 완료되었습니다.');
        onLogin(result.user);
      } else {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        toast.success('회원가입이 완료되었습니다.');
        onLogin(result.user);
      }
      onClose();
    } catch (error: any) {
      toast.error('인증 실패: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-surface dark:bg-zinc-900 w-full max-w-md rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            <button onClick={onClose} className="absolute top-6 right-6 text-white/30 hover:text-white">
              <X size={20} />
            </button>

            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold mb-2">간편하게 시작하세요</h2>
              <p className="text-white/50 text-sm">번거로운 회원가입 없이 1초 만에 로그인</p>
            </div>

            <div className="space-y-4 mb-10">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-4 hover:bg-white/90 transition-all shadow-xl shadow-white/5 active:scale-95 disabled:opacity-50"
              >
                <Chrome size={24} className="text-[#4285F4]" />
                <span className="text-lg">Google로 1초 로그인</span>
              </button>

              <button
                onClick={handleGithubLogin}
                disabled={loading}
                className="w-full bg-zinc-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-700 transition-all border border-white/5 active:scale-95 disabled:opacity-50"
              >
                <Github size={20} /> GitHub로 계속하기
              </button>
            </div>

            <div className="relative flex items-center gap-4 mb-8 opacity-30">
              <div className="flex-1 h-px bg-white/20" />
              <span className="text-[10px] text-white font-bold uppercase tracking-widest">또는 직접 입력</span>
              <div className="flex-1 h-px bg-white/20" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="email"
                    required
                    placeholder="이메일 주소"
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-white/20 transition-all text-sm"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={16} />
                  <input
                    type="password"
                    required
                    placeholder="비밀번호"
                    className="w-full bg-white/5 border border-white/5 rounded-xl pl-12 pr-4 py-3 outline-none focus:border-white/20 transition-all text-sm"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-white/5 hover:bg-white/10 text-white/60 font-bold py-3 rounded-xl transition-all text-sm disabled:opacity-50"
              >
                {isLogin ? '로그인' : '회원가입'}
              </button>
            </form>

            <p className="text-center mt-8 text-sm text-white/50">
              {isLogin ? '계정이 없으신가요?' : '이미 계정이 있으신가요?'} {' '}
              <button
                onClick={() => setIsLogin(!isLogin)}
                className="text-brand font-bold hover:underline"
              >
                {isLogin ? '회원가입' : '로그인'}
              </button>
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const AdminDashboard: React.FC<{
  webtoons: Webtoon[],
  onBack: () => void,
  onAdd: (w: Webtoon) => void,
  onDelete: (id: string) => void
}> = ({ webtoons, onBack, onAdd, onDelete }) => {
  const [activeTab, setActiveTab] = useState<'stats' | 'webtoons' | 'pending' | 'users'>('pending');
  const [pendingWebtoons, setPendingWebtoons] = useState<Webtoon[]>([]);
  const [updateInterval, setUpdateInterval] = useState('1 month');
  const [isAdding, setIsAdding] = useState(false);
  const [newWebtoon, setNewWebtoon] = useState<Partial<Webtoon>>({
    genre: '로맨스',
    rating: 4.5,
    thumbnail: '',
    banner: '',
    isHot: false,
    isNew: true,
    episodes: 0,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newWebtoon.title && newWebtoon.author) {
      onAdd({
        ...newWebtoon,
        id: Math.random().toString(36).substr(2, 9),
      } as Webtoon);
      setIsAdding(false);
      setNewWebtoon({
        genre: '로맨스',
        rating: 4.5,
        thumbnail: '',
        banner: '',
        episodes: 0,
      });
    }
  };

  useEffect(() => {
    const fetchPending = async () => {
      const q = query(collection(db, 'pending_webtoons'));
      const snap = await getDocs(q);
      setPendingWebtoons(snap.docs.map(d => ({ ...d.data(), id: d.id } as Webtoon)));
    };
    fetchPending();
  }, []);

  const handleApprove = async (w: Webtoon) => {
    try {
      const { id, ...data } = w;
      // 1. Move to webtoons
      await setDoc(doc(db, 'webtoons', id), {
        ...data,
        status: 'approved',
        approvedAt: serverTimestamp(),
        createdAt: (data as any).createdAt ?? serverTimestamp(),
      });
      // 2. Transfer subcollections
      const epRef = collection(db, 'pending_webtoons', id, 'episodes');
      const snap = await getDocs(epRef);
      for (const d of snap.docs) {
        await setDoc(doc(db, 'webtoons', id, 'episodes', d.id), d.data());
        await deleteDoc(doc(db, 'pending_webtoons', id, 'episodes', d.id));
      }
      // 3. Delete from pending
      await deleteDoc(doc(db, 'pending_webtoons', id));
      toast.success('웹툰이 승인되어 라이브로 배포되었습니다!');
      setPendingWebtoons(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      toast.error('승인 중 오류 발생.');
    }
  };

  return (
    <div className="min-h-screen bg-bg text-white font-sans">
      {/* Admin Sidebar */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-surface border-r border-white/5 p-6 flex flex-col">
        <div className="flex items-center gap-2 mb-12">
          <h1 className="text-xl font-bold tracking-tighter text-brand italic">ADMIN<span className="text-white not-italic">U</span></h1>
        </div>

        <nav className="flex-1 space-y-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'pending' ? "bg-brand text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <Clock size={18} /> 승인 대기열 (Pending)
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'stats' ? "bg-brand text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <TrendingUp size={18} /> 대시보드
          </button>
          <button
            onClick={() => setActiveTab('webtoons')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'webtoons' ? "bg-brand text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <Play size={18} /> 웹툰 관리
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
              activeTab === 'users' ? "bg-brand text-white" : "text-white/50 hover:bg-white/5 hover:text-white"
            )}
          >
            <User size={18} /> 사용자 관리
          </button>
        </nav>

        <button
          onClick={onBack}
          className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:bg-white/5 hover:text-white transition-all mt-auto"
        >
          <ChevronRight size={18} className="rotate-180" /> 메인으로 돌아가기
        </button>
      </div>

      {/* Main Content */}
      <div className="ml-64 p-10">
        <header className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              {activeTab === 'stats' && "대시보드 개요"}
              {activeTab === 'webtoons' && "웹툰 라이브러리"}
              {activeTab === 'users' && "사용자 목록"}
            </h2>
            <p className="text-white/50 text-sm mt-1">
              {activeTab === 'stats' && "플랫폼의 현재 상태를 한눈에 확인하세요."}
              {activeTab === 'webtoons' && "총 " + webtoons.length + "개의 웹툰이 등록되어 있습니다."}
              {activeTab === 'users' && "총 1,248명의 활성 사용자가 있습니다."}
            </p>
          </div>

          {activeTab === 'webtoons' && (
            <button
              onClick={() => setIsAdding(true)}
              className="bg-brand hover:bg-brand/90 text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 transition-all"
            >
              <Play size={18} fill="currentColor" /> 새 웹툰 추가
            </button>
          )}
        </header>

        {activeTab === 'stats' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { label: '총 조회수', value: '1.2M', icon: Play, color: 'text-blue-500' },
              { label: '이번 달 수익', value: '₩45.2M', icon: TrendingUp, color: 'text-green-500' },
              { label: '신규 가입자', value: '+124', icon: User, color: 'text-purple-500' },
            ].map((stat, i) => (
              <div key={i} className="bg-surface border border-white/5 p-8 rounded-3xl">
                <div className={cn("p-3 rounded-2xl bg-white/5 w-fit mb-6", stat.color)}>
                  <stat.icon size={24} />
                </div>
                <p className="text-white/50 text-sm font-medium mb-1">{stat.label}</p>
                <h3 className="text-4xl font-bold tracking-tight">{stat.value}</h3>
              </div>
            ))}

            <div className="col-span-1 md:col-span-3 bg-surface border border-white/5 p-8 rounded-3xl h-64 flex items-center justify-center text-white/20 italic">
              [조회수 추이 그래프 영역]
            </div>
          </div>
        )}

        {activeTab === 'pending' && (
          <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden p-8">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">AI 승인 대기열</h3>
              <div className="flex items-center gap-4">
                <span className="text-sm text-white/50">자동 업데이트 주기</span>
                <select
                  value={updateInterval}
                  onChange={(e) => setUpdateInterval(e.target.value)}
                  className="bg-black/50 border border-white/10 rounded-lg px-4 py-2 text-sm appearance-none outline-none focus:border-brand"
                >
                  <option value="1 week">1주일</option>
                  <option value="1 month">한 달 (디폴트)</option>
                  <option value="3 months">3개월</option>
                </select>
              </div>
            </div>

            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-bottom border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50">웹툰</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50">장르</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {pendingWebtoons.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-white/30">승인 대기 중인 신작이 없습니다.</td></tr>
                ) : pendingWebtoons.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={w.thumbnail} className="w-10 h-14 object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-sm">{w.title}</p>
                          <p className="text-xs text-white/50">{w.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">{w.genre}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleApprove(w)}
                        className="bg-brand hover:bg-brand/90 text-white font-bold py-2 px-6 rounded-full transition-all shadow-xl shadow-brand/20 text-sm"
                      >
                        승인하기
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'webtoons' && (
          <div className="bg-surface border border-white/5 rounded-3xl overflow-hidden">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-bottom border-white/5 bg-white/5">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50">웹툰</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50">장르</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50">평점</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50">상태</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-white/50 text-right">관리</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {webtoons.map((w) => (
                  <tr key={w.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={w.thumbnail} className="w-10 h-14 object-cover rounded-lg" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <p className="font-bold text-sm">{w.title}</p>
                          <p className="text-xs text-white/50">{w.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-white/70">{w.genre}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1 text-sm font-bold">
                        <Star size={14} className="text-yellow-400 fill-yellow-400" />
                        {w.rating}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {w.isHot && <span className="bg-brand/20 text-brand text-[10px] font-bold px-2 py-0.5 rounded uppercase">Hot</span>}
                        {w.isNew && <span className="bg-blue-500/20 text-blue-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">New</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => onDelete(w.id)}
                        className="text-white/30 hover:text-brand transition-colors p-2"
                      >
                        <X size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="bg-surface border border-white/5 rounded-3xl p-12 flex flex-col items-center justify-center text-white/30 gap-4">
            <User size={64} />
            <p className="text-xl font-medium">사용자 관리 기능은 준비 중입니다.</p>
          </div>
        )}
      </div>

      {/* Add Webtoon Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-surface w-full max-w-xl rounded-3xl p-10 border border-white/10 shadow-2xl"
            >
              <h3 className="text-2xl font-bold mb-8">새 웹툰 등록</h3>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">제목</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand transition-all"
                      value={newWebtoon.title || ''}
                      onChange={e => setNewWebtoon({ ...newWebtoon, title: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase tracking-wider">작가</label>
                    <input
                      type="text"
                      required
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand transition-all"
                      value={newWebtoon.author || ''}
                      onChange={e => setNewWebtoon({ ...newWebtoon, author: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">장르</label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand transition-all appearance-none"
                    value={newWebtoon.genre}
                    onChange={e => setNewWebtoon({ ...newWebtoon, genre: e.target.value })}
                  >
                    {GENRES.filter(g => g !== '전체').map(g => (
                      <option key={g} value={g} className="bg-surface">{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-white/50 uppercase tracking-wider">작품 설명</label>
                  <textarea
                    required
                    rows={3}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-brand transition-all resize-none"
                    value={newWebtoon.description || ''}
                    onChange={e => setNewWebtoon({ ...newWebtoon, description: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase">인기작 여부</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newWebtoon.isHot}
                        onChange={e => setNewWebtoon({ ...newWebtoon, isHot: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/5 border border-white/10 text-brand focus:ring-brand"
                      />
                      <span className="text-sm">인기작 (Hot)</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-white/50 uppercase">신작 여부</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={newWebtoon.isNew}
                        onChange={e => setNewWebtoon({ ...newWebtoon, isNew: e.target.checked })}
                        className="w-5 h-5 rounded bg-white/5 border border-white/10 text-brand focus:ring-brand"
                      />
                      <span className="text-sm">신작 (New)</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 bg-white/5 hover:bg-white/10 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-brand hover:bg-brand/90 text-white font-bold py-3 rounded-xl transition-all"
                  >
                    등록하기
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const GenreSection: React.FC<{
  webtoons: Webtoon[],
  isLoading: boolean,
  onWebtoonClick: (w: Webtoon) => void
}> = ({ webtoons, isLoading, onWebtoonClick }) => {
  const [selectedGenre, setSelectedGenre] = useState('전체');

  const filteredWebtoons = selectedGenre === '전체'
    ? webtoons
    : webtoons.filter(w => w.genre === selectedGenre);

  return (
    <section className="px-6 md:px-16 py-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-6">
        <div className="flex items-center gap-3">
          <Menu className="text-brand" size={24} />
          <h2 className="text-2xl font-bold tracking-tight">장르별 탐색</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 -mx-2 px-2">
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={cn(
                "px-4 py-1.5 rounded-full text-sm font-medium transition-all whitespace-nowrap",
                selectedGenre === genre
                  ? "bg-brand text-white"
                  : "bg-white/5 text-white/50 hover:bg-white/10 hover:text-white"
              )}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          layout
          className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2"
        >
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-40 md:w-48 space-y-3">
                <Skeleton className="aspect-[2/3]" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))
          ) : filteredWebtoons.length > 0 ? (
            filteredWebtoons.map((webtoon) => (
              <motion.div
                key={webtoon.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.2 }}
              >
                <WebtoonCard webtoon={webtoon} onClick={() => onWebtoonClick(webtoon)} />
              </motion.div>
            ))
          ) : (
            <div className="w-full py-12 flex flex-col items-center justify-center text-white/30 gap-4">
              <Info size={48} />
              <p className="text-lg">이 장르에 해당하는 웹툰이 없습니다.</p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </section>
  );
};

const Navbar: React.FC<{
  onAdminClick: () => void,
  onAuthClick: () => void,
  user: any,
  onLogout: () => void,
  theme: string,
  onThemeToggle: () => void,
  searchQuery: string,
  onSearchChange: (q: string) => void
}> = ({ onAdminClick, onAuthClick, user, onLogout, theme, onThemeToggle, searchQuery, onSearchChange }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      <nav className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 md:px-16 py-4 flex items-center justify-between",
        isScrolled ? "bg-bg/80 dark:bg-zinc-950/80 backdrop-blur-xl py-3 border-b border-white/5 shadow-2xl" : "bg-transparent"
      )}>
        <div className="flex items-center gap-10">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold tracking-tighter text-brand italic cursor-pointer"
          >
            WEBTOON<span className="text-white not-italic">U</span>
          </motion.h1>

          <div className="hidden lg:flex items-center gap-8 text-sm font-bold text-white/70">
            {['홈', '장르', '랭킹', '신작'].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                href="#"
                className="hover:text-white transition-colors relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-brand transition-all group-hover:w-full" />
              </motion.a>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4 md:gap-6">
          <div className="hidden sm:flex items-center bg-white/5 dark:bg-white/10 rounded-full px-4 py-2 gap-3 border border-white/10 focus-within:border-brand/50 focus-within:bg-white/10 transition-all w-48 lg:w-72">
            <Search size={18} className="text-white/40" />
            <input
              type="text"
              placeholder="제목, 작가 검색"
              className="bg-transparent border-none outline-none text-sm text-white w-full placeholder:text-white/20"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={onThemeToggle}
              className="p-2.5 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white active:scale-90"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <button className="p-2.5 hover:bg-white/10 rounded-full transition-all text-white/70 hover:text-white relative active:scale-90">
              <Bell size={20} />
              <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-brand rounded-full border-2 border-bg" />
            </button>

            {user ? (
              <div className="flex items-center gap-3">
                <button
                  onClick={onAdminClick}
                  className="hidden sm:flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition-all text-sm font-bold"
                >
                  <User size={16} /> 관리자
                </button>
                <button
                  onClick={onLogout}
                  className="p-2.5 hover:bg-brand/20 hover:text-brand rounded-full transition-all text-white/70 active:scale-90"
                  title="로그아웃"
                >
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <button
                onClick={onAuthClick}
                className="bg-brand hover:bg-brand/90 text-white px-6 py-2 rounded-full font-bold text-sm transition-all shadow-lg shadow-brand/20 active:scale-95"
              >
                로그인
              </button>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-2.5 hover:bg-white/10 rounded-full transition-all text-white active:scale-90"
            >
              <Menu size={20} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-bg/95 backdrop-blur-xl lg:hidden"
          >
            <div className="p-6 flex flex-col h-full">
              <div className="flex items-center justify-between mb-12">
                <h1 className="text-2xl font-bold tracking-tighter text-brand italic">WEBTOON<span className="text-white not-italic">U</span></h1>
                <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X size={24} />
                </button>
              </div>

              <nav className="flex flex-col gap-6 text-3xl font-bold">
                {['홈', '장르', '랭킹', '신작'].map((item, i) => (
                  <motion.a
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    href="#"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-brand transition-colors"
                  >
                    {item}
                  </motion.a>
                ))}
              </nav>

              <div className="mt-auto space-y-4">
                {!user && (
                  <button
                    onClick={() => { setIsMobileMenuOpen(false); onAuthClick(); }}
                    className="w-full bg-brand text-white py-4 rounded-2xl font-bold text-lg"
                  >
                    로그인 / 회원가입
                  </button>
                )}
                <div className="flex justify-center gap-8 py-8 border-t border-white/10">
                  <Star size={24} className="text-white/30" />
                  <TrendingUp size={24} className="text-white/30" />
                  <Clock size={24} className="text-white/30" />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

const Hero = ({ webtoons, onWebtoonClick, isLoading }: { webtoons: Webtoon[], onWebtoonClick: (w: Webtoon) => void, isLoading?: boolean }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const current = webtoons[currentIndex];

  useEffect(() => {
    if (webtoons.length === 0 || isLoading) return;
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % webtoons.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [webtoons.length, isLoading]);

  if (isLoading || webtoons.length === 0) {
    return (
      <section className="relative h-[70vh] md:h-[85vh] w-full bg-surface overflow-hidden">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 max-w-3xl space-y-6">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-16 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-12 w-32 rounded-full" />
            <Skeleton className="h-12 w-32 rounded-full" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative h-[85vh] w-full overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="absolute inset-0"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/40 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent z-10" />
          <img
            src={current.banner}
            alt={current.title}
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />

          <div className="absolute inset-0 z-20 flex flex-col justify-center px-6 md:px-16 max-w-3xl">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center gap-2 mb-4">
                {current.isHot && (
                  <span className="bg-brand text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider flex items-center gap-1">
                    <Flame size={10} /> 인기
                  </span>
                )}
                {current.isNew && (
                  <span className="bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                    신작
                  </span>
                )}
                <span className="text-white/60 text-xs font-medium uppercase tracking-widest">{current.genre}</span>
              </div>

              <h2 className="text-5xl md:text-7xl font-bold mb-4 tracking-tighter leading-none font-serif italic">
                {current.title}
              </h2>
              <p className="text-white/70 text-lg mb-8 line-clamp-2 max-w-xl">
                {current.description}
              </p>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => onWebtoonClick(current)}
                  className="bg-brand hover:bg-brand/90 text-white px-8 py-3 rounded-full font-bold flex items-center gap-2 transition-transform active:scale-95"
                >
                  <Play size={18} fill="currentColor" /> 지금 읽기
                </button>
                <button
                  onClick={() => onWebtoonClick(current)}
                  className="bg-white/10 hover:bg-white/20 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 transition-all border border-white/10"
                >
                  <Info size={18} /> 상세 정보
                </button>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="absolute bottom-12 right-6 md:right-16 z-30 flex gap-2">
        {webtoons.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentIndex(idx)}
            className={cn(
              "h-1 transition-all duration-300 rounded-full",
              idx === currentIndex ? "w-8 bg-brand" : "w-2 bg-white/30"
            )}
          />
        ))}
      </div>
    </section>
  );
};

const WebtoonCard: React.FC<{ webtoon: Webtoon, onClick: () => void }> = ({ webtoon, onClick }) => {
  return (
    <motion.div
      whileHover={{ y: -10, scale: 1.02 }}
      onClick={onClick}
      className="group relative flex-shrink-0 w-44 md:w-56 cursor-pointer p-2 rounded-2xl bg-white/5 border border-white/10 hover:border-brand/50 backdrop-blur-md transition-all duration-300 shadow-xl"
    >
      <div className="relative aspect-[2/3] rounded-xl overflow-hidden mb-4">
        <img
          src={webtoon.thumbnail}
          alt={webtoon.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 group-hover:opacity-100 transition-opacity" />
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-14 h-14 rounded-full bg-brand/90 backdrop-blur-md shadow-brand/30 shadow-2xl flex items-center justify-center text-white scale-75 group-hover:scale-100 transition-transform">
            <Play size={28} fill="currentColor" className="ml-1" />
          </div>
        </div>

        {webtoon.episodes !== undefined && (
          <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 text-brand text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider shadow-lg">
            총 {Array.isArray(webtoon.episodes) ? webtoon.episodes.length : (webtoon.episodeCount || webtoon.episodes || 0)}화
          </div>
        )}
      </div>

      <div className="px-1">
        <h3 className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 line-clamp-1 group-hover:from-brand group-hover:to-purple-500 transition-all">
          {webtoon.title}
        </h3>
        <p className="text-sm text-white/40 font-medium line-clamp-1 mt-1">
          {webtoon.author || "WebtoonU 독점작"}
        </p>
      </div>
    </motion.div>
  );
};

const Section: React.FC<{
  title: string,
  icon?: any,
  webtoons: Webtoon[],
  isLoading?: boolean,
  onWebtoonClick?: (w: Webtoon) => void
}> = ({ title, icon: Icon, webtoons, isLoading, onWebtoonClick }) => {
  return (
    <section className="px-6 md:px-16 py-12">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          {Icon && <Icon className="text-brand" size={24} />}
          <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        </div>
        <button className="text-white/50 hover:text-white text-sm font-medium flex items-center gap-1 transition-colors">
          전체보기 <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto no-scrollbar pb-4 -mx-2 px-2">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-40 md:w-48 space-y-3">
              <Skeleton className="aspect-[2/3]" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))
        ) : (
          webtoons.map((webtoon) => (
            <WebtoonCard key={webtoon.id} webtoon={webtoon} onClick={() => onWebtoonClick?.(webtoon)} />
          ))
        )}
      </div>
    </section>
  );
};

const Footer: React.FC<{ onAdminClick: () => void }> = ({ onAdminClick }) => {
  return (
    <footer className="bg-surface px-6 md:px-16 py-16 border-t border-white/5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2 md:col-span-1">
          <h1 className="text-2xl font-bold tracking-tighter text-brand italic mb-6">WEBTOON<span className="text-white not-italic">U</span></h1>
          <p className="text-white/50 text-sm leading-relaxed max-w-xs">
            세계 최고의 프리미엄 웹툰 플랫폼. 오늘 당신의 새로운 인생작을 만나보세요.
          </p>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">플랫폼</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><a href="#" className="hover:text-white transition-colors">회사 소개</a></li>
            <li><a href="#" className="hover:text-white transition-colors">작가 지원</a></li>
            <li><a href="#" className="hover:text-white transition-colors">채용 정보</a></li>
            <li><a href="#" className="hover:text-white transition-colors">법적 고지</a></li>
            <li><button onClick={onAdminClick} className="hover:text-brand transition-colors">관리자 모드</button></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">고객 지원</h4>
          <ul className="space-y-4 text-sm text-white/50">
            <li><a href="#" className="hover:text-white transition-colors">고객센터</a></li>
            <li><a href="#" className="hover:text-white transition-colors">문의하기</a></li>
            <li><a href="#" className="hover:text-white transition-colors">개인정보 처리방침</a></li>
            <li><a href="#" className="hover:text-white transition-colors">이용 약관</a></li>
          </ul>
        </div>

        <div>
          <h4 className="text-white font-bold mb-6">다운로드</h4>
          <div className="flex flex-col gap-3">
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all text-left">
              App Store
            </button>
            <button className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-lg text-sm font-medium transition-all text-left">
              Google Play
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-white/5 gap-4">
        <p className="text-white/30 text-xs">
          © 2026 웹툰 유니버스. All rights reserved.
        </p>
        <div className="flex gap-6 text-white/30">
          <a href="#" className="hover:text-white transition-colors"><Star size={18} /></a>
          <a href="#" className="hover:text-white transition-colors"><TrendingUp size={18} /></a>
          <a href="#" className="hover:text-white transition-colors"><Clock size={18} /></a>
        </div>
      </div>
    </footer>
  );
};

const Skeleton: React.FC<{ className?: string }> = ({ className }) => (
  <div className={cn("animate-pulse bg-white/5 rounded-xl", className)} />
);

const ScrollToTop: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };
    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.button
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.5 }}
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-8 right-8 z-[90] p-4 bg-brand text-white rounded-full shadow-2xl shadow-brand/40 hover:scale-110 active:scale-95 transition-all"
        >
          <ChevronRight className="-rotate-90" size={24} />
        </motion.button>
      )}
    </AnimatePresence>
  );
};

const ProgressBar: React.FC = () => {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = (window.scrollY / totalHeight) * 100;
      setScrollProgress(progress);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="fixed top-0 left-0 w-full h-1 z-[100] pointer-events-none">
      <motion.div
        className="h-full bg-brand shadow-[0_0_10px_rgba(255,51,102,0.8)]"
        style={{ width: `${scrollProgress} % ` }}
      />
    </div>
  );
};

const CustomCursor: React.FC = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('button, a, input, select, textarea')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <motion.div
      className="fixed top-0 left-0 w-8 h-8 rounded-full border border-brand pointer-events-none z-[1000] hidden md:block"
      animate={{
        x: position.x - 16,
        y: position.y - 16,
        scale: isHovering ? 1.5 : 1,
        backgroundColor: isHovering ? 'rgba(255, 51, 102, 0.1)' : 'transparent',
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 250, mass: 0.5 }}
    />
  );
};

const LoadingScreen: React.FC = () => (
  <motion.div
    initial={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[1000] bg-bg dark:bg-zinc-950 flex flex-col items-center justify-center"
  >
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.5, repeat: Infinity, repeatType: 'reverse' }}
      className="mb-8"
    >
      <div className="text-4xl font-black text-brand tracking-tighter flex items-center gap-1">
        <div className="w-10 h-10 bg-brand rounded-lg flex items-center justify-center text-white text-2xl">W</div>
        <span>WEBTOON</span>
      </div>
    </motion.div>
    <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        className="w-full h-full bg-brand"
      />
    </div>
  </motion.div>
);

type ViewerCut = { url: string; dialogue?: string | null };

const CustomViewer: React.FC<{ webtoonId: string; episodeId: string; onClose: () => void; }> = ({ webtoonId, episodeId, onClose }) => {
  const [cuts, setCuts] = useState<ViewerCut[]>([]);
  const [episodeDialogue, setEpisodeDialogue] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [visibleCuts, setVisibleCuts] = useState<ViewerCut[]>([]);

  useEffect(() => {
    const fetchCuts = async () => {
      try {
        const epRef = doc(db, 'webtoons', webtoonId, 'episodes', episodeId);
        const snap = await getDoc(epRef);
        if (snap.exists()) {
          const data = snap.data() as any;

          const rawCuts = Array.isArray(data.cuts) ? data.cuts : [];
          const normalized: ViewerCut[] = rawCuts
            .map((c: any, idx: number) => {
              if (typeof c === 'string') return { url: c, dialogue: null };
              if (c && typeof c === 'object') {
                const url = c.url ?? c.image ?? c.src ?? c.cut ?? c.path;
                const dialogue = c.dialogue ?? c.text ?? c.caption ?? null;
                return typeof url === 'string' ? { url, dialogue: typeof dialogue === 'string' ? dialogue : null } : null;
              }
              return null;
            })
            .filter(Boolean) as ViewerCut[];

          if (normalized.length > 0) {
            setCuts(normalized);
          } else {
            toast.error('표시할 이미지가 없습니다.');
            setCuts([]);
          }

          setEpisodeDialogue(data.dialogue ?? data.dialogues ?? null);
        } else {
          toast.error('에피소드 데이터를 찾을 수 없습니다.');
        }
      } catch (err) {
        toast.error('에피소드 로딩 실패.');
      } finally {
        setLoading(false);
      }
    };
    fetchCuts();
  }, [webtoonId, episodeId]);

  useEffect(() => {
    setVisibleCuts([]);
    if (loading) return;
    if (cuts.length === 0) return;

    let cancelled = false;
    let idx = 0;
    let timerId: number | null = null;

    const getEpisodeDialogueText = (i: number): string | null => {
      const dialogue = episodeDialogue;
      if (!dialogue) return null;
      if (typeof dialogue === 'string') return dialogue;
      if (Array.isArray(dialogue)) return typeof dialogue[i] === 'string' ? dialogue[i] : null;
      if (typeof dialogue === 'object') {
        const v = (dialogue as any)[i] ?? (dialogue as any)[String(i)] ?? (dialogue as any)[i + 1] ?? (dialogue as any)[String(i + 1)];
        return typeof v === 'string' ? v : null;
      }
      return null;
    };

    const scheduleNext = () => {
      if (cancelled) return;
      if (idx >= cuts.length) return;

      const cut = cuts[idx];
      const dialogueText = cut.dialogue ?? getEpisodeDialogueText(idx) ?? null;

      // 프리로드 성공한 컷만 추가 (엑박/alt 텍스트 방지)
      const img = new Image();
      img.onload = () => {
        if (cancelled) return;
        setVisibleCuts((prev) => [...prev, { url: cut.url, dialogue: dialogueText }]);
        idx += 1;
        timerId = window.setTimeout(scheduleNext, 1000);
      };
      img.onerror = () => {
        if (cancelled) return;
        idx += 1;
        timerId = window.setTimeout(scheduleNext, 1000);
      };
      img.referrerPolicy = 'no-referrer';
      img.src = cut.url;
    };

    // 첫 컷은 즉시 시작
    scheduleNext();

    return () => {
      cancelled = true;
      if (timerId) window.clearTimeout(timerId);
    };
  }, [cuts, loading, episodeDialogue]);

  return (
    <div className="fixed inset-0 z-[500] bg-[#000000] flex flex-col overflow-hidden">
      <div className="h-16 shrink-0 flex items-center px-4 border-b border-white/10 justify-between bg-[#000000] shadow-[0_20px_60px_rgba(0,0,0,0.8)] z-10 w-full text-white">
        <button onClick={onClose} className="hover:text-brand transition-colors p-2 rounded-full hover:bg-white/10">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-black tracking-[0.35em] text-white/50">VIEW</span>
          <span className="text-[12px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 via-brand to-cyan-300">
            {webtoonId} · {episodeId}화
          </span>
        </div>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 overflow-y-auto w-full max-w-[740px] mx-auto flex flex-col bg-[#000000]">
        {loading ? (
          <div className="py-24 w-full px-6">
            <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-8 text-center">
              <div className="mx-auto mb-5 h-10 w-10 rounded-full border-2 border-brand border-t-transparent animate-spin" />
              <p className="text-white/60 font-semibold tracking-tight">컷을 불러오는 중...</p>
              <p className="mt-2 text-xs text-white/35">이미지는 1초 간격으로 순차 로딩됩니다.</p>
            </div>
          </div>
        ) : cuts.length > 0 ? (
          <>
            {visibleCuts.map((cut, idx) => {
              const line = cut.dialogue ?? null;
              return (
                <div key={idx} className="w-full">
                  <img
                    src={cut.url}
                    loading="lazy"
                    className="w-full object-cover block m-0 p-0 fade-in"
                    alt={`cut ${idx}`}
                    referrerPolicy="no-referrer"
                  />
                  {line && (
                    <div className="w-full px-4 py-3 border-b border-white/5">
                      <p className="text-[15px] leading-relaxed text-white/80 font-medium tracking-[0.01em]">
                        {line}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            {visibleCuts.length < cuts.length && (
              <div className="w-full px-4 py-8">
                <p className="text-xs text-white/35">
                  로딩 중… {visibleCuts.length}/{cuts.length}
                </p>
              </div>
            )}
            {visibleCuts.length >= cuts.length && (
              <div className="py-24 text-white/30 font-bold text-center">에피소드의 끝입니다.</div>
            )}
          </>
        ) : (
          <div className="py-20 text-red-500 font-bold text-center">표시할 이미지가 없습니다.</div>
        )}
      </div>
    </div>
  );
};

export default function AppWrapper() {
  return (
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  );
}

function App() {
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const [user, setUser] = useState<any>(null);
  const [isAdminView, setIsAdminView] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  const [webtoons, setWebtoons] = useState<Webtoon[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedWebtoon, setSelectedWebtoon] = useState<Webtoon | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        // Sync user profile to Firestore
        const userRef = doc(db, 'users', firebaseUser.uid);
        try {
          const userDoc = await getDoc(userRef);
          if (!userDoc.exists()) {
            await setDoc(userRef, {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName,
              photoURL: firebaseUser.photoURL,
              role: firebaseUser.email === 'f8001161@gmail.com' ? 'admin' : 'user',
              createdAt: serverTimestamp()
            });
          }
        } catch (error) {
          console.error("Error syncing user profile:", error);
        }
      } else {
        setUser(null);
      }
    });

    // Fetch Webtoons from Firestore
    const webtoonsQuery = query(collection(db, 'webtoons'), orderBy('createdAt', 'desc'), limit(10));

    // Set a timeout to hide loading screen if Firestore takes too long
    const timeoutId = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    const unsubscribeWebtoons = onSnapshot(webtoonsQuery, (snapshot) => {
      clearTimeout(timeoutId);
      const fetchedWebtoons = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Webtoon[];

      if (fetchedWebtoons.length > 0) {
        setWebtoons(fetchedWebtoons);
      } else {
        // Fallback to empty if Firestore is empty
        setWebtoons([]);
      }
      setIsLoading(false);
    }, (error) => {
      clearTimeout(timeoutId);
      handleFirestoreError(error, OperationType.LIST, 'webtoons');
      setIsLoading(false);
    });

    return () => {
      unsubscribe();
      unsubscribeWebtoons();
      clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('로그아웃되었습니다.');
      setIsAdminView(false);
    } catch (error: any) {
      toast.error('로그아웃 실패: ' + error.message);
    }
  };

  const handleAddWebtoon = async (newW: Webtoon) => {
    try {
      const { id, ...data } = newW;
      await setDoc(doc(db, 'webtoons', id), {
        ...data,
        createdAt: serverTimestamp()
      });
      toast.success('새 웹툰이 등록되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `webtoons / ${newW.id}`);
    }
  };

  const handleDeleteWebtoon = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'webtoons', id));
      toast.success('웹툰이 삭제되었습니다.');
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `webtoons / ${id}`);
    }
  };

  const filteredWebtoons = webtoons.filter(w =>
    w.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    w.genre.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Default admin check (using user email from context)
  const isAdmin = user?.email === 'f8001161@gmail.com';

  if (currentPath.startsWith('/viewer')) {
    const [, , webtoonId, episodeId] = currentPath.split('/');
    if (webtoonId && episodeId) {
      return (
        <CustomViewer webtoonId={webtoonId} episodeId={episodeId} onClose={() => {
          window.history.pushState({}, '', '/');
          window.dispatchEvent(new Event('popstate'));
        }} />
      );
    }
  }

  if (isAdminView && isAdmin) {
    return (
      <AdminDashboard
        webtoons={webtoons}
        onBack={() => setIsAdminView(false)}
        onAdd={handleAddWebtoon}
        onDelete={handleDeleteWebtoon}
      />
    );
  }

  return (
    <div className="min-h-screen bg-bg dark:bg-zinc-950 text-white font-sans selection:bg-brand selection:text-white transition-colors duration-500">
      <AnimatePresence>
        {isLoading && <LoadingScreen />}
      </AnimatePresence>
      <Toaster position="top-center" expand={true} richColors />

      <Navbar
        onAdminClick={() => setIsAdminView(true)}
        onAuthClick={() => setIsAuthModalOpen(true)}
        user={user}
        onLogout={handleLogout}
        theme={theme}
        onThemeToggle={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      <main className="pt-0">
        <Hero webtoons={webtoons.slice(0, 5)} onWebtoonClick={setSelectedWebtoon} isLoading={isLoading} />

        <div className="relative z-30 -mt-20">
          <Section
            title="지금 뜨는 인기작"
            icon={TrendingUp}
            webtoons={filteredWebtoons.filter(w => w.isHot)}
            isLoading={isLoading}
            onWebtoonClick={setSelectedWebtoon}
          />

          <Section
            title="최신 업데이트"
            icon={Clock}
            webtoons={[...filteredWebtoons].reverse().filter(w => w.isNew)}
            isLoading={isLoading}
            onWebtoonClick={setSelectedWebtoon}
          />

          <GenreSection
            webtoons={filteredWebtoons}
            isLoading={isLoading}
            onWebtoonClick={setSelectedWebtoon}
          />

          <div className="px-6 md:px-16 py-12">
            <div className="relative h-64 rounded-3xl overflow-hidden group cursor-pointer">
              <div
                className="w-full h-full bg-gradient-to-br from-indigo-900 to-purple-900 transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-brand/80 to-transparent flex flex-col justify-center px-12">
                <h3 className="text-3xl font-bold mb-2">프리미엄 멤버십</h3>
                <p className="text-white/80 mb-6">지금 가입하고 광고 없이 무제한으로 즐기세요.</p>
                <button className="bg-white text-brand px-6 py-2 rounded-full font-bold w-fit hover:bg-brand hover:text-white transition-all">
                  자세히 보기
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer onAdminClick={() => setIsAdminView(true)} />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={setUser}
      />

      <WebtoonDetail
        webtoon={selectedWebtoon}
        onClose={() => setSelectedWebtoon(null)}
      />

      <ScrollToTop />
      <ProgressBar />
      <CustomCursor />
    </div>
  );
}
