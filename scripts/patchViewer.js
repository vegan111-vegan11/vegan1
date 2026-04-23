import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. We replace WebtoonDetail's local selectedEpisode viewer logic
content = content.replace(
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
  }

  return (
    <AnimatePresence>`,
    `const WebtoonDetail: React.FC<{
  webtoon: Webtoon | null,
  onClose: () => void
}> = ({ webtoon, onClose }) => {

  const navigateToViewer = (epId: string) => {
    window.history.pushState({}, '', \`/viewer/\${webtoon?.id}/\${epId}\`);
    window.dispatchEvent(new Event('popstate'));
  };

  if (!webtoon) return null;

  return (
    <AnimatePresence>`
);

content = content.replace(
    `            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => {
                  if (webtoon.episodes && webtoon.episodes.length > 0) {
                    setSelectedEpisode(webtoon.episodes[0]);
                  } else {
                    toast.info('등록된 에피소드가 없거나 로딩중입니다.');
                  }
                }}
                className="flex-1 min-w-[200px] bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3 text-lg cursor-pointer active:scale-95 z-50"
              >
                <Play size={24} fill="currentColor" /> {webtoon.episodes && webtoon.episodes.length > 0 ? '첫 화 보기' : '감상하기'}
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
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer text-left"
                    >`,
    `            <div className="flex flex-wrap gap-4 mb-8">
              <button 
                onClick={() => {
                  navigateToViewer('1');
                }}
                className="flex-1 min-w-[200px] bg-brand hover:bg-brand/90 text-white font-bold py-4 rounded-2xl transition-all shadow-xl shadow-brand/20 flex items-center justify-center gap-3 text-lg cursor-pointer active:scale-95 z-50"
              >
                <Play size={24} fill="currentColor" /> 첫 화부터 보기
              </button>
            </div>

            <div className="mt-8 pt-8 border-t border-white/5">
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Play size={20} className="text-brand" fill="currentColor" /> 에피소드 리스트
              </h3>
              <div className="space-y-4">
                {[1, 2].map((epVol) => (
                    <button 
                      key={epVol}
                      onClick={() => navigateToViewer(epVol.toString())}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative shrink-0">
                          <img src={webtoon.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-brand transition-colors">{webtoon.title} {epVol}화</h4>
                          <p className="text-xs text-white/50">70컷 분량</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/30 group-hover:text-brand transition-colors" />
                    </button>
                 ))}
              </div>
            </div>
          </div>`
);

content = content.replace(
    `                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative shrink-0">
                          <img src={ep.cuts?.[0] || webtoon.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div>
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
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};`,
    `          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};`
);


// 2. Add Viewer component
const viewerComponent = `
const CustomViewer: React.FC = () => {
  const [cuts, setCuts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const pathParts = window.location.pathname.split('/');
  const webtoonId = pathParts[2] || '';
  const episodeId = pathParts[3] || '1';

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchCuts = async () => {
      try {
        const epRef = doc(db, 'webtoons', webtoonId, 'episodes', episodeId);
        const snap = await getDoc(epRef);
        if (snap.exists()) {
          setCuts(snap.data().cuts || []);
        } else {
          toast.error("에피소드를 찾을 수 없습니다.");
        }
      } catch (err) {
        toast.error("데이터 로드 실패.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCuts();
  }, [webtoonId, episodeId]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col pt-safe-top">
      <div className="h-16 shrink-0 flex items-center px-4 border-b border-white/10 justify-between bg-black sticky top-0 z-[200] w-full shadow-2xl">
        <button onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('popstate')); }} className="text-white hover:text-brand transition-colors p-2 rounded-full hover:bg-white/10">
          <ChevronRight className="rotate-180" size={24} />
        </button>
        <h3 className="text-white font-bold">{webtoonId} - {episodeId}화</h3>
        <div className="w-10"></div>
      </div>
      <div className="flex-1 w-full max-w-3xl mx-auto flex flex-col items-center pointer-events-none pb-20">
        {isLoading ? (
          <div className="py-32 flex flex-col items-center gap-4">
            <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin" />
            <p className="text-brand font-bold animate-pulse">컷 로딩중...</p>
          </div>
        ) : cuts.length > 0 ? (
          cuts.map((cut, index) => (
            <img 
              key={index} 
              src={cut} 
              loading="lazy" 
              className="w-full object-cover block m-0 p-0" 
              alt={\`cut \${index}\`} 
              referrerPolicy="no-referrer" 
            />
          ))
        ) : (
          <div className="py-32 text-white/30 font-bold text-center">작품이 아직 업로드되지 않았습니다.</div>
        )}
        {!isLoading && cuts.length > 0 && (
          <div className="w-full py-16 text-center border-t border-white/10 mt-10">
            <h4 className="text-2xl font-bold italic text-white/50">To Be Continued...</h4>
            <p className="mt-4 text-brand">관심웹툰으로 등록해 다음 화를 기다려보세요!</p>
          </div>
        )}
      </div>
    </div>
  );
};
`;

content = content.replace("export function App() {", viewerComponent + "\nexport function App() {");


// 3. Mount Custom Routing
content = content.replace(
    `export function App() {
  const [webtoons, setWebtoons] = useState<Webtoon[]>([]);`,
    `export function App() {
  const [currentRoute, setCurrentRoute] = useState(window.location.pathname);
  useEffect(() => {
    const handlePop = () => setCurrentRoute(window.location.pathname);
    window.addEventListener('popstate', handlePop);
    return () => window.removeEventListener('popstate', handlePop);
  }, []);

  const [webtoons, setWebtoons] = useState<Webtoon[]>([]);`
);

content = content.replace(
    `  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <motion.div`,
    `  if (currentRoute.startsWith('/viewer/')) return <CustomViewer />;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex flex-col items-center justify-center p-6 text-center">
        <motion.div`
);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('Successfully patched App.tsx Viewer Routing!');
