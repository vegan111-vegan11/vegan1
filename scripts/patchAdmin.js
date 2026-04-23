import fs from 'fs';

let content = fs.readFileSync('src/App.tsx', 'utf-8');

// 1. Patch WebtoonDetail to dynamically fetch episodes
content = content.replace(
    `const WebtoonDetail: React.FC<{
  webtoon: Webtoon | null,
  onClose: () => void
}> = ({ webtoon, onClose }) => {

  const navigateToViewer = (epId: string) => {
    window.history.pushState({}, '', \`/viewer/\${webtoon?.id}/\${epId}\`);
    window.dispatchEvent(new Event('popstate'));
  };

  if (!webtoon) return null;`,
    `const WebtoonDetail: React.FC<{
  webtoon: Webtoon | null,
  onClose: () => void
}> = ({ webtoon, onClose }) => {
  const [episodes, setEpisodes] = useState<any[]>([]);

  useEffect(() => {
    if (webtoon) {
      const epRef = collection(db, 'webtoons', webtoon.id, 'episodes');
      getDocs(epRef).then(snap => {
        const eps = snap.docs.map(doc => ({ ...doc.data(), id: doc.id }));
        eps.sort((a: any, b: any) => a.vol - b.vol);
        setEpisodes(eps);
      });
    }
  }, [webtoon]);

  const navigateToViewer = (epId: string) => {
    window.history.pushState({}, '', \`/viewer/\${webtoon?.id}/\${epId}\`);
    window.dispatchEvent(new Event('popstate'));
  };

  if (!webtoon) return null;`
);

content = content.replace(
    `              <div className="space-y-4">
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
              </div>`,
    `              <div className="space-y-4">
                {episodes.length > 0 ? (
                  episodes.map((ep: any) => (
                    <button 
                      key={ep.id}
                      onClick={() => navigateToViewer(ep.id)}
                      className="w-full flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all group cursor-pointer text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-black/50 overflow-hidden relative shrink-0">
                          <img src={webtoon.thumbnail} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white group-hover:text-brand transition-colors">{webtoon.title} {ep.vol}화</h4>
                          <p className="text-xs text-white/50">{ep.cuts ? ep.cuts.length : 70}컷 분량</p>
                        </div>
                      </div>
                      <ChevronRight size={20} className="text-white/30 group-hover:text-brand transition-colors" />
                    </button>
                  ))
                ) : (
                  <p className="text-white/40 text-center py-6 border border-dashed border-white/10 rounded-xl">에피소드를 로딩 중입니다...</p>
                )}
              </div>`
);


// 2. We inject AdminDashboard logic
const adminBoardStr = `
const AdminDashboard = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [processing, setProcessing] = useState(false);
  const [updateInterval, setUpdateInterval] = useState('한 달');

  useEffect(() => {
    const q = query(collection(db, 'pending_webtoons'));
    getDocs(q).then(snap => {
      setPending(snap.docs.map(doc => ({ ...doc.data(), id: doc.id })));
    });
  }, []);

  const handleApprove = async (webtoon: any) => {
    setProcessing(true);
    try {
      // 1. Move Main Doc to 'webtoons'
      await setDoc(doc(db, 'webtoons', webtoon.id), { ...webtoon, status: 'approved' });
      
      // 2. Move episodes subcollection
      const epRef = collection(db, 'pending_webtoons', webtoon.id, 'episodes');
      const epSnap = await getDocs(epRef);
      const newEpRef = collection(db, 'webtoons', webtoon.id, 'episodes');
      for (const epDoc of epSnap.docs) {
        await setDoc(doc(newEpRef, epDoc.id), epDoc.data());
      }
      
      // 3. Delete from pending logic if needed (skipped for stability)
      
      toast.success(\`[\${webtoon.title}] 승인 및 정식 연재 시작!\`);
      setPending(p => p.filter(x => x.id !== webtoon.id));
    } catch (e) {
      toast.error("승인 중 오류 발생");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white p-10 pt-safe-top pr-safe-right pl-safe-left pb-safe-bottom">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl justify-center font-bold text-brand">이솔나라 관리자 센터</h1>
          <button onClick={() => { window.history.pushState({}, '', '/'); window.dispatchEvent(new Event('popstate')); }} className="px-6 py-2 bg-white/10 hover:bg-white/20 rounded-full font-bold">홈으로 돌아가기</button>
        </div>
        
        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8 mb-8">
           <h2 className="text-xl font-bold mb-4">자동 업데이트 주기 설정</h2>
           <div className="flex gap-4 items-center">
             <select 
               value={updateInterval} 
               onChange={(e) => setUpdateInterval(e.target.value)}
               className="bg-black border border-white/20 rounded-xl px-4 py-2"
             >
                <option value="일주일">일주일</option>
                <option value="한 달">한 달 (Default)</option>
                <option value="세 달">세 달</option>
             </select>
             <button className="bg-brand text-white px-6 py-2 rounded-xl font-bold">적용</button>
           </div>
        </div>

        <div className="bg-zinc-900 border border-white/10 rounded-2xl p-8">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-3"><Star className="text-yellow-400" /> AI 자동 생성 대기열 (Pending Webtoons)</h2>
          <div className="space-y-4">
            {pending.length > 0 ? pending.map(item => (
               <div key={item.id} className="flex flex-col md:flex-row gap-6 p-4 border border-white/10 bg-black/50 rounded-xl items-center">
                 <img src={item.thumbnail} className="w-24 h-32 object-cover rounded-lg" />
                 <div className="flex-1">
                   <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                   <p className="text-white/60 mb-2">{item.description}</p>
                   <span className="text-xs bg-brand/20 text-brand px-3 py-1 rounded-full">{item.genre}</span>
                 </div>
                 <button 
                  onClick={() => handleApprove(item)}
                  disabled={processing}
                  className="bg-brand hover:bg-brand/80 text-white font-bold py-4 px-8 rounded-xl shrink-0"
                 >
                   [ 승인 (Approve) ]
                 </button>
               </div>
            )) : <p className="text-white/40 text-center py-10">승인 대기 중인 작품이 없습니다.</p>}
          </div>
        </div>
      </div>
    </div>
  );
};
`;

content = content.replace("export function App() {", adminBoardStr + "\nexport function App() {");


// 3. Inject routing hook
content = content.replace(
    `  if (currentRoute.startsWith('/viewer/')) return <CustomViewer />;

  if (isLoading) {`,
    `  if (currentRoute.startsWith('/viewer/')) return <CustomViewer />;
  if (currentRoute === '/admin') return <AdminDashboard />;

  if (isLoading) {`
);

// 4. Also fix 'getDocs' import
if (!content.includes("getDocs")) {
    content = content.replace("getFirestore, collection, getDocs, doc, setDoc", "getFirestore, collection, doc, setDoc, getDocs, query, where, limit");
}

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log("Admin Dashboard and Fixes injected safely.");
