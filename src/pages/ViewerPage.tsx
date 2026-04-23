import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, getDoc } from '../firebase';

type ViewerCut = {
  url: string;
  dialogue: string;
};

function normalizeCuts(raw: unknown): ViewerCut[] {
  if (!Array.isArray(raw)) return [];

  const badWords = ['parts', 'hardware'];
  const isBad = (url: string) => {
    const lower = url.toLowerCase();
    return badWords.some((w) => lower.includes(w));
  };

  const out: ViewerCut[] = [];
  for (const item of raw) {
    if (!item) continue;

    if (typeof item === 'string') {
      const url = item;
      if (!url || isBad(url)) continue;
      out.push({ url, dialogue: '...' });
      continue;
    }

    if (typeof item === 'object') {
      const obj = item as any;
      const url = obj.url ?? obj.src ?? obj.image ?? obj.cut ?? obj.path;
      if (typeof url !== 'string' || !url) continue;
      if (isBad(url)) continue;

      const d = obj.dialogue ?? obj.text ?? obj.caption;
      const dialogue = typeof d === 'string' && d.trim().length > 0 ? d : '...';
      out.push({ url, dialogue });
    }
  }

  return out;
}

const Skeleton: React.FC<{ height?: number }> = ({ height = 520 }) => {
  return (
    <div
      style={{
        height,
        width: '100%',
        background: '#1a1a1a',
        borderRadius: 0,
        animation: 'viewerPulse 1.4s ease-in-out infinite',
      }}
    />
  );
};

const CutBlock: React.FC<{ cut: ViewerCut; index: number }> = ({ cut, index }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const showSkeleton = !loaded || failed;
  const skeletonHeight = 520;

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <div style={{ width: '100%', background: '#000000' }}>
        {showSkeleton && <Skeleton height={skeletonHeight} />}
        {!failed && (
          <img
            src={cut.url}
            loading="lazy"
            alt={`cut ${index}`}
            referrerPolicy="no-referrer"
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(false);
            }}
            style={{
              display: loaded ? 'block' : 'none',
              width: '100%',
              maxWidth: 800,
              margin: '0 auto',
              objectFit: 'cover',
              background: '#000000',
            }}
          />
        )}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 800,
          margin: '0 auto',
          background: '#000000',
          color: '#ffffff',
          fontSize: '1.1rem',
          lineHeight: 1.9,
          letterSpacing: '0.01em',
          padding: '14px 16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {cut.dialogue || '...'}
      </div>
    </div>
  );
};

export default function ViewerPage(props: { webtoonId: string; episodeId: string; onClose: () => void }) {
  const { webtoonId, episodeId, onClose } = props;

  const [cuts, setCuts] = useState<ViewerCut[]>([]);
  const [loading, setLoading] = useState(true);
  const [display, setDisplay] = useState<boolean[]>([]);

  const timeoutsRef = useRef<number[]>([]);

  const visibleCuts = useMemo(() => {
    if (cuts.length === 0) return [];
    return cuts.filter((_, idx) => display[idx]);
  }, [cuts, display]);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.textContent = `
      @keyframes viewerPulse { 
        0% { opacity: 0.55; } 
        50% { opacity: 0.9; } 
        100% { opacity: 0.55; } 
      }
    `;
    document.head.appendChild(styleEl);
    return () => {
      document.head.removeChild(styleEl);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setCuts([]);
    setDisplay([]);

    const run = async () => {
      try {
        const epRef = doc(db, 'webtoons', webtoonId, 'episodes', episodeId);
        const snap = await getDoc(epRef);
        if (!snap.exists()) {
          toast.error('에피소드 데이터를 찾을 수 없습니다.');
          return;
        }

        const data = snap.data() as any;
        const normalized = normalizeCuts(data?.cuts);
        if (!cancelled) {
          setCuts(normalized);
          setDisplay(new Array(normalized.length).fill(false));
        }
      } catch (e) {
        toast.error('에피소드 로딩 실패.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [webtoonId, episodeId]);

  useEffect(() => {
    // clear previous timers
    for (const id of timeoutsRef.current) window.clearTimeout(id);
    timeoutsRef.current = [];

    if (loading) return;
    if (cuts.length === 0) return;

    // sequentially reveal, 0.8s interval
    for (let i = 0; i < cuts.length; i++) {
      const id = window.setTimeout(() => {
        setDisplay((prev) => {
          if (!prev[i]) {
            const next = prev.slice();
            next[i] = true;
            return next;
          }
          return prev;
        });
      }, i * 800);
      timeoutsRef.current.push(id);
    }

    return () => {
      for (const id of timeoutsRef.current) window.clearTimeout(id);
      timeoutsRef.current = [];
    };
  }, [cuts, loading]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 500, background: '#000000', color: '#ffffff', overflow: 'hidden' }}>
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 10,
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 12px',
          background: 'rgba(0,0,0,0.8)',
          backdropFilter: 'blur(10px)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 40,
            height: 40,
            borderRadius: 999,
            border: '1px solid rgba(255,255,255,0.12)',
            background: 'transparent',
            color: '#ffffff',
            cursor: 'pointer',
          }}
          aria-label="back"
        >
          <ChevronRight style={{ transform: 'rotate(180deg)' }} size={22} />
        </button>

        <div style={{ textAlign: 'center', flex: 1, fontSize: 13, fontWeight: 700, opacity: 0.9 }}>
          {webtoonId} · {episodeId}화
        </div>

        <div style={{ width: 40 }} />
      </div>

      <div style={{ height: 'calc(100vh - 56px)', overflowY: 'auto', background: '#000000' }}>
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch' }}>
          {loading ? (
            <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
              <Skeleton height={520} />
              <div style={{ marginTop: 16, opacity: 0.6, fontSize: 14 }}>불러오는 중…</div>
            </div>
          ) : cuts.length === 0 ? (
            <div style={{ padding: '64px 16px', textAlign: 'center', opacity: 0.7 }}>표시할 이미지가 없습니다.</div>
          ) : (
            <>
              {visibleCuts.map((cut, idx) => (
                <CutBlock key={`${cut.url}-${idx}`} cut={cut} index={idx} />
              ))}
              {visibleCuts.length < cuts.length && (
                <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '16px' }}>
                  <div style={{ opacity: 0.55, fontSize: 13 }}>
                    로딩 중… {visibleCuts.length}/{cuts.length}
                  </div>
                </div>
              )}
              {visibleCuts.length >= cuts.length && (
                <div style={{ padding: '56px 16px', textAlign: 'center', opacity: 0.55, fontWeight: 700 }}>
                  에피소드의 끝입니다.
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

