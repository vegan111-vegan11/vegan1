import React, { useEffect, useState, useRef } from 'react';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, getDoc } from '../firebase';

type FirestoreCut = {
  imageUrl?: string;
  dialogue?: unknown;
  cut_theme?: unknown;
  [key: string]: any;
};

type ViewerCut = {
  imageUrl: string;
  dialogue: string;
  cut_theme: string;
  rawIndex: number;
};

const extractFirstStringDeep = (value: unknown, depth = 0): string | null => {
  if (depth > 6) return null;
  if (typeof value === 'string') {
    const t = value.trim();
    return t.length > 0 ? t : null;
  }
  if (Array.isArray(value)) {
    for (const v of value) {
      const got = extractFirstStringDeep(v, depth + 1);
      if (got) return got;
    }
    return null;
  }
  if (value && typeof value === 'object') {
    const obj = value as any;
    for (const k of ['ko', 'kr', 'korean', 'kor']) {
      if (k in obj) {
        const got = extractFirstStringDeep(obj[k], depth + 1);
        if (got) return got;
      }
    }
    for (const k of ['dialogue', 'text', 'caption', 'line', 'script', 'message', 'content']) {
      if (k in obj) {
        const got = extractFirstStringDeep(obj[k], depth + 1);
        if (got) return got;
      }
    }
    for (const v of Object.values(obj)) {
      const got = extractFirstStringDeep(v, depth + 1);
      if (got) return got;
    }
    return null;
  }
  return null;
};

const ensureString = (v: unknown, fallback: string) => extractFirstStringDeep(v) ?? fallback;

const CutBlock: React.FC<{ cut: ViewerCut; displayIndex: number }> = ({ cut, displayIndex }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '1000px 0px' }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={containerRef} className="w-full m-0 p-0 flex flex-col items-center bg-black min-h-[500px]">
      <div className="w-full relative flex justify-center bg-[#0a0a0a] min-h-[500px]">
        {!loaded && !failed && (
          <div className="absolute inset-0 flex items-center justify-center text-white/10 text-sm font-medium tracking-widest">
            LOADING...
          </div>
        )}
        
        {isVisible && !failed ? (
          <img
            src={cut.imageUrl}
            alt={`cut ${displayIndex}`}
            onLoad={() => setLoaded(true)}
            onError={() => setFailed(true)}
            className="w-full max-w-[800px] h-auto object-cover transition-opacity duration-300 relative z-10"
            style={{ opacity: loaded ? 1 : 0 }}
          />
        ) : failed ? (
          <div className="w-full max-w-[800px] py-12 px-4 text-center text-white/50 bg-[#111]">
            <div className="text-sm">이미지를 불러오지 못했습니다.</div>
            <div className="text-xs mt-2 break-all opacity-70">{cut.imageUrl}</div>
          </div>
        ) : null}
      </div>

      {cut.dialogue && (
        <div className="w-full max-w-[800px] bg-black text-white text-[1.1rem] leading-[1.8] tracking-wide px-4 py-6 border-b border-white/10">
          {cut.dialogue}
        </div>
      )}
    </div>
  );
};

export default function ViewerPage(props: { webtoonId: string; episodeId: string; onClose: () => void }) {
  const { webtoonId, episodeId, onClose } = props;

  const [loading, setLoading] = useState(true);
  const [viewerCuts, setViewerCuts] = useState<ViewerCut[]>([]);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      setLoading(true);
      setViewerCuts([]);

      try {
        const epRef = doc(db, 'webtoons', webtoonId, 'episodes', episodeId);
        const epSnap = await getDoc(epRef);
        
        if (!epSnap.exists()) {
          toast.error('에피소드 데이터를 찾을 수 없습니다.');
          return;
        }

        const episodeData = epSnap.data() as any;
        const rawCutsAny = Array.isArray(episodeData?.cuts) ? (episodeData.cuts as any[]) : [];
        const rawCuts: FirestoreCut[] = rawCutsAny
          .map((c) => {
            if (!c) return null;
            if (typeof c === 'string') return { imageUrl: c } as FirestoreCut;
            if (typeof c === 'object') {
              const obj = c as any;
              const imageUrl = ensureString(obj.imageUrl ?? obj.url ?? obj.src ?? obj.image, '');
              return { ...obj, ...(imageUrl ? { imageUrl } : {}) } as FirestoreCut;
            }
            return null;
          })
          .filter(Boolean) as FirestoreCut[];

        const normalizedViewerCuts: ViewerCut[] = [];
        for (let i = 0; i < rawCuts.length; i++) {
          const c = rawCuts[i];
          const imageUrl = ensureString((c as any)?.imageUrl ?? (c as any)?.url ?? (c as any)?.src, '');
          if (!imageUrl) continue;

          const d = extractFirstStringDeep((c as any)?.dialogue);
          const t = extractFirstStringDeep((c as any)?.cut_theme);

          const dialogue = d ?? '';
          const cut_theme = t ?? '';

          normalizedViewerCuts.push({ imageUrl, dialogue, cut_theme, rawIndex: i });
        }

        if (!cancelled) {
          setViewerCuts(normalizedViewerCuts);
        }
      } catch (e) {
        toast.error('데이터 로딩 중 오류가 발생했습니다.');
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [webtoonId, episodeId]);

  return (
    <div className="fixed inset-0 z-[500] bg-black text-white flex flex-col overflow-hidden">
      {/* Header */}
      <div className="sticky top-0 z-50 h-14 flex items-center justify-between px-4 bg-black/80 backdrop-blur-md border-b border-white/10">
        <button
          onClick={onClose}
          className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center bg-transparent text-white cursor-pointer hover:bg-white/10 transition-colors"
          aria-label="back"
        >
          <ChevronRight className="rotate-180" size={22} />
        </button>

        <div className="flex-1 text-center font-bold text-sm opacity-90 truncate px-4">
          {webtoonId} · {episodeId}화
        </div>

        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-black scroll-smooth">
        <div className="w-full flex flex-col items-center">
          {loading ? (
            <div className="w-full max-w-[800px] flex flex-col items-center justify-center min-h-[50vh] opacity-60">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mb-4"></div>
              <div className="text-sm tracking-widest mt-4 font-bold">LOADING...</div>
            </div>
          ) : viewerCuts.length === 0 ? (
            <div className="py-20 text-center opacity-70 text-sm">표시할 이미지가 없습니다.</div>
          ) : (
            <div className="w-full bg-black flex flex-col">
              {viewerCuts.map((cut, idx) => (
                <CutBlock key={`${cut.imageUrl}-${cut.rawIndex}`} cut={cut} displayIndex={idx} />
              ))}
              <div className="py-16 text-center opacity-50 font-bold text-sm">
                에피소드의 끝입니다.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
