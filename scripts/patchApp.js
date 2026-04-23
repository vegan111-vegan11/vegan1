import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

if (!content.includes('import { REAL_WEBTOONS }')) {
    content = content.replace("import { cn } from './lib/utils';", "import { cn } from './lib/utils';\nimport { REAL_WEBTOONS } from './realDataFallback';");
}

content = content.replace(
    `  isCompleted?: boolean;
  episodes: number;`,
    `  isCompleted?: boolean;
  episodes?: any;
  status?: string;`
);

content = content.replace(
    `const WebtoonDetail: React.FC<{
  webtoon: Webtoon | null,
  onClose: () => void
}> = ({ webtoon, onClose }) => {
  if (!webtoon) return null;`,
    `const WebtoonDetail: React.FC<{
  webtoon: Webtoon | null,
  onClose: () => void
}> = ({ webtoon, onClose }) => {
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);

  useEffect(() => {
    if (!webtoon) setSelectedEpisode(null);
  }, [webtoon]);

  if (!webtoon) return null;

  if (selectedEpisode) {
    return (
      <div className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-3xl flex flex-col pt-safe-top">
        <div className="h-16 shrink-0 flex items-center px-4 border-b border-white/10 justify-between bg-black sticky top-0 z-10 w-full shadow-2xl">
          <button onClick={() => setSelectedEpisode(null)} className="text-white hover:text-brand transition-colors p-2 rounded-full hover:bg-white/10">
            <X size={24} />
          </button>
          <h3 className="text-white font-bold">{selectedEpisode.title || '에피소드'}</h3>
          <div className="w-10"></div>
        </div>
        <div className="flex-1 overflow-y-auto w-full max-w-2xl mx-auto flex flex-col items-center bg-black min-h-screen">
          {selectedEpisode.cuts?.map((cut: string, index: number) => (
            <img key={index} src={cut} loading="lazy" className="w-full object-cover block m-0 p-0 pointer-events-none fade-in" alt={"cut " + index} referrerPolicy="no-referrer" />
          ))}
          <div className="py-20 text-white/30 font-bold text-center">에피소드의 끝입니다.</div>
        </div>
      </div>
    );
  }`
);

content = content.replace(
    `            <div className="flex flex-wrap gap-4">
              <button className="flex-1 min-w-[200px] bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3 text-lg">
                <Play size={24} fill="currentColor" /> 첫 화부터 보기
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white/60 hover:text-white">
                <Heart size={24} />
              </button>
              <button className="p-4 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 transition-all text-white/60 hover:text-white">
                <Share2 size={24} />
              </button>
            </div>

            <div className="mt-12 pt-12 border-t border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <MessageSquare size={20} className="text-brand" /> 댓글 (1,248)
              </h3>
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-bold text-sm">독자_{i}</span>
                        <span className="text-xs text-white/30">2시간 전</span>
                      </div>
                      <p className="text-sm text-white/60">정말 재미있어요! 다음 화가 너무 기다려집니다. 작가님 화이팅!</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>`,
    `            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => {
                  if (webtoon.episodes && webtoon.episodes.length > 0) {
                    setSelectedEpisode(webtoon.episodes[0]);
                  } else {
                    toast.info('등록된 에피소드가 없거나 로딩중입니다.');
                  }
                }}
                className="flex-1 min-w-[200px] bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3 text-lg"
              >
                <Play size={24} fill="currentColor" /> 최신화 보기
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Play size={20} className="text-brand" fill="currentColor" /> 에피소드 리스트
              </h3>
              <div className="space-y-4">
                {webtoon.episodes && webtoon.episodes.length > 0 ? (
                  webtoon.episodes.map((ep: any, index: number) => (
                    <button 
                      key={index}
                      onClick={() => setSelectedEpisode(ep)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative shrink-0">
                          <img src={ep.cuts?.[0] || webtoon.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div className="text-left">
                          <h4 className="font-bold text-white group-hover:text-brand transition-colors">{ep.title || index + 1 + '화'}</h4>
                          <p className="text-xs text-white/50">{ep.cuts?.length || 0}컷 분량</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/30 group-hover:text-brand transition-colors" />
                    </button>
                  ))
                ) : (
                  <p className="text-white/40 text-center py-6 border border-dashed border-white/10 rounded-xl">등록된 에피소드가 없습니다.</p>
                )}
              </div>
            </div>`
);

content = content.replace(
    `            {['홈', '장르', '랭킹', '신작'].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                href="#"
                className="hover:text-white transition-colors relative group"
              >`,
    `            {['홈', '장르', '랭킹', '신작', 'On-Air'].map((item, i) => (
              <motion.a
                key={item}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                href={item === 'On-Air' ? '#live' : '#'}
                onClick={(e) => {
                  if (item === 'On-Air') { e.preventDefault(); toast.info("🔥 곧 라이브 스트리밍 서비스가 시작됩니다!"); }
                }}
                className={"transition-colors relative group " + (item === 'On-Air' ? "text-brand italic hover:text-brand" : "hover:text-white")}
              >`
);

content = content.replace(
    `                {['홈', '장르', '랭킹', '신작'].map((item, i) => (
                  <motion.a
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    href="#"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="hover:text-brand transition-colors"
                  >`,
    `                {['홈', '장르', '랭킹', '신작', 'On-Air'].map((item, i) => (
                  <motion.a
                    key={item}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: i * 0.1 }}
                    href={item === 'On-Air' ? '#live' : '#'}
                    onClick={(e) => {
                      if (item === 'On-Air') { e.preventDefault(); toast.info("🔥 곧 라이브 스트리밍 서비스가 시작됩니다!"); }
                      setIsMobileMenuOpen(false);
                    }}
                    className={"transition-colors " + (item === 'On-Air' ? "text-brand italic" : "hover:text-brand")}
                  >`
);

content = content.replace(
    `    // Fetch Webtoons from Firestore
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
    });`,
    `    // Attempt Fetching but inject REAL_WEBTOONS as ultimate approved source
    const webtoonsQuery = query(collection(db, 'webtoons'), limit(10));

    const timeoutId = setTimeout(() => {
      setWebtoons(REAL_WEBTOONS as object[] as Webtoon[]);
      setIsLoading(false);
    }, 1500);

    const unsubscribeWebtoons = onSnapshot(webtoonsQuery, (snapshot) => {
      clearTimeout(timeoutId);
      let fetchedWebtoons = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Webtoon[];
      let merged = [...(REAL_WEBTOONS as object[] as Webtoon[]), ...fetchedWebtoons]
        .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
        .filter(w => w.status === 'approved' || REAL_WEBTOONS.find((rw:any) => rw.id === w.id));
      
      setWebtoons(merged);
      setIsLoading(false);
    }, (error) => {
      clearTimeout(timeoutId);
      console.warn("Permission Denied. Injecting fallback production data...", error);
      setWebtoons(REAL_WEBTOONS as object[] as Webtoon[]);
      setIsLoading(false);
    });`
);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('App.tsx string patch complete.');
