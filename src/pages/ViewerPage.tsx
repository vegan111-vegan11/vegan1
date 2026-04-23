import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { db, doc, getDoc, updateDoc, serverTimestamp } from '../firebase';

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

type WebtoonMeta = {
  title?: string;
  genre?: string;
  description?: string;
  theme?: string;
  synopsis?: string;
};

const BAD_WORDS = ['parts', 'hardware'];
const isBadImageUrl = (url: string) => {
  const lower = url.toLowerCase();
  return BAD_WORDS.some((w) => lower.includes(w));
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

function generateThemeAndSynopsis(input: { webtoonId: string; title?: string; genre?: string; description?: string }) {
  const title = (input.title ?? input.webtoonId).trim();
  const genre = (input.genre ?? '').trim();
  const desc = (input.description ?? '').trim();
  const bag = `${title} ${genre} ${desc}`.toLowerCase();

  const inferredTheme =
    genre ||
    (bag.includes('sf') || bag.includes('207') || bag.includes('네오') || bag.includes('cyber') || bag.includes('나노')
      ? 'SF'
      : bag.includes('판타지') || bag.includes('마법') || bag.includes('왕') || bag.includes('조선')
        ? '판타지'
        : bag.includes('미스터리') || bag.includes('thriller') || bag.includes('복제') || bag.includes('살인')
          ? '미스터리'
          : '드라마');

  const synopsis =
    desc.length > 0
      ? desc
      : inferredTheme === 'SF'
        ? `${title} — 네온빛 도시와 냉혹한 시스템 속에서, 주인공은 ‘탈출’과 ‘진실’ 사이에서 선택을 강요받는다.`
        : inferredTheme === '판타지'
          ? `${title} — 오래된 규율과 금단의 힘이 충돌하는 세계에서, 운명은 조용히 균열을 만든다.`
          : inferredTheme === '미스터리'
            ? `${title} — 일상의 틈으로 스며든 단서들이 서로 연결되며, 숨겨진 얼굴이 드러난다.`
            : `${title} — 관계와 욕망이 겹쳐지며, 작은 선택이 커다란 파문이 된다.`;

  return { theme: inferredTheme, synopsis };
}

function generateCutThemeAndDialogue(input: { synopsis: string; theme: string; index: number; total: number }) {
  const t = Math.max(1, input.total);
  const p = input.index / t;

  const beat =
    p < 0.15 ? '도입' : p < 0.35 ? '긴장' : p < 0.6 ? '전개' : p < 0.8 ? '충돌' : '여운';

  const cut_theme =
    input.theme === 'SF'
      ? beat === '도입'
        ? '네온의 고요'
        : beat === '긴장'
          ? '시스템 경보'
          : beat === '전개'
            ? '추적과 단서'
            : beat === '충돌'
              ? '격돌의 순간'
              : '잔상'
      : input.theme === '판타지'
        ? beat === '도입'
          ? '세계의 규율'
          : beat === '긴장'
            ? '금단의 기운'
            : beat === '전개'
              ? '징조'
              : beat === '충돌'
                ? '각성'
                : '여운'
        : input.theme === '미스터리'
          ? beat === '도입'
            ? '수상한 공기'
            : beat === '긴장'
              ? '불안한 단서'
              : beat === '전개'
                ? '의심의 연결'
                : beat === '충돌'
                  ? '정면대치'
                  : '침묵'
          : beat;

  const synopsisHint = input.synopsis.length > 90 ? input.synopsis.slice(0, 90) + '…' : input.synopsis;

  const dialogue =
    input.theme === 'SF'
      ? beat === '도입'
        ? `…여긴 너무 조용해. 조용한 건, 대개 폭발 직전이야.`
        : beat === '긴장'
          ? `경보가 울렸어. 누군가 내가 찾는 걸 먼저 봤다는 뜻이지.`
          : beat === '전개'
            ? `단서가 이어지고 있어. ${synopsisHint}`
            : beat === '충돌'
              ? `도망칠수록 시스템은 더 가까워져. 하지만… 멈출 수 없어.`
              : `끝난 게 아니야. 다음 장면은, 더 차가울 거야.`
      : input.theme === '판타지'
        ? beat === '도입'
          ? `이 세계의 규칙… 모두가 믿지만, 아무도 증명하진 않았지.`
          : beat === '긴장'
            ? `금단의 힘이 깨어났어. 내 안에서… 숨소리가 들려.`
            : beat === '전개'
              ? `징조는 늘 조용히 와. ${synopsisHint}`
              : beat === '충돌'
                ? `지금이야. 내가 두려워하던 ‘나’와 마주할 시간.`
                : `마법은 끝나지 않아. 여운은 더 길게 남아.`
        : input.theme === '미스터리'
          ? beat === '도입'
            ? `이상하지… 아무 일도 없는데, 모든 게 수상해.`
            : beat === '긴장'
              ? `단서가 보이면 더 무서워져. 진실은 늘 잔인하니까.`
              : beat === '전개'
                ? `조각들이 맞춰지고 있어. ${synopsisHint}`
                : beat === '충돌'
                  ? `도망치지 마. 이제는 네 차례야.`
                  : `침묵이 말하고 있어. 다음 장면이 답이겠지.`
          : `…${synopsisHint}`;

  return { cut_theme, dialogue };
}

const Skeleton: React.FC<{ height?: number }> = ({ height = 520 }) => (
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

const CutBlock: React.FC<{ cut: ViewerCut; displayIndex: number }> = ({ cut, displayIndex }) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const showSkeleton = !loaded || failed;

  return (
    <div style={{ width: '100%', margin: 0, padding: 0 }}>
      <div style={{ width: '100%', background: '#000000', position: 'relative' }}>
        {showSkeleton && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 1 }}>
            <Skeleton height={520} />
          </div>
        )}

        {/* Always mount the image so the browser can load it reliably */}
        {!failed ? (
          <img
            src={cut.imageUrl}
            loading="lazy"
            decoding="async"
            alt={`cut ${displayIndex}`}
            onLoad={() => setLoaded(true)}
            onError={() => {
              setFailed(true);
              setLoaded(false);
            }}
            style={{
              display: 'block',
              width: '100%',
              maxWidth: 800,
              margin: '0 auto',
              objectFit: 'cover',
              background: '#000000',
              opacity: loaded ? 1 : 0,
              transition: 'opacity 180ms ease-out',
              position: 'relative',
              zIndex: 2,
            }}
          />
        ) : (
          <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '18px 16px', opacity: 0.7 }}>
            <div style={{ fontSize: 13 }}>이미지를 불러오지 못했습니다.</div>
            <div style={{ fontSize: 12, opacity: 0.7, marginTop: 6, wordBreak: 'break-all' }}>{cut.imageUrl}</div>
          </div>
        )}
      </div>

      <div
        style={{
          width: '100%',
          maxWidth: 800,
          margin: '0 auto',
          background: '#000000',
          color: '#ffffff',
          fontSize: '1.2rem',
          lineHeight: 1.95,
          letterSpacing: '0.01em',
          padding: '14px 16px 18px',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {cut.dialogue}
      </div>
    </div>
  );
};

export default function ViewerPage(props: { webtoonId: string; episodeId: string; onClose: () => void }) {
  const { webtoonId, episodeId, onClose } = props;

  const [loading, setLoading] = useState(true);
  const [healing, setHealing] = useState(true);
  const [viewerCuts, setViewerCuts] = useState<ViewerCut[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);

  const timerRef = useRef<number | null>(null);

  const visibleCuts = useMemo(() => {
    if (viewerCuts.length === 0) return [];
    return viewerCuts.slice(0, Math.min(visibleCount, viewerCuts.length));
  }, [viewerCuts, visibleCount]);

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

    const run = async () => {
      setLoading(true);
      setHealing(true);
      setViewerCuts([]);
      setVisibleCount(0);

      try {
        const webtoonRef = doc(db, 'webtoons', webtoonId);
        const epRef = doc(db, 'webtoons', webtoonId, 'episodes', episodeId);

        const [webtoonSnap, epSnap] = await Promise.all([getDoc(webtoonRef), getDoc(epRef)]);
        if (!epSnap.exists()) {
          toast.error('에피소드 데이터를 찾을 수 없습니다.');
          return;
        }

        const meta = (webtoonSnap.exists() ? (webtoonSnap.data() as any) : {}) as WebtoonMeta;
        const episodeData = epSnap.data() as any;
        const rawCutsAny = Array.isArray(episodeData?.cuts) ? (episodeData.cuts as any[]) : [];
        const rawCuts: FirestoreCut[] = rawCutsAny
          .map((c) => {
            if (!c) return null;
            if (typeof c === 'string') return { imageUrl: c } as FirestoreCut;
            if (typeof c === 'object') {
              const obj = c as any;
              // normalize common url keys into imageUrl (without deleting originals)
              const imageUrl = ensureString(obj.imageUrl ?? obj.url ?? obj.src ?? obj.image, '');
              return { ...obj, ...(imageUrl ? { imageUrl } : {}) } as FirestoreCut;
            }
            return null;
          })
          .filter(Boolean) as FirestoreCut[];

        // 1) Self-heal project-level fields
        const currentTheme = ensureString(meta.theme, '');
        const currentSynopsis = ensureString(meta.synopsis, '');
        const { theme: generatedTheme, synopsis: generatedSynopsis } = generateThemeAndSynopsis({
          webtoonId,
          title: meta.title,
          genre: meta.genre,
          description: meta.description,
        });

        const nextTheme = currentTheme.length > 0 ? currentTheme : generatedTheme;
        const nextSynopsis = currentSynopsis.length > 0 ? currentSynopsis : generatedSynopsis;

        if (webtoonSnap.exists()) {
          const updates: any = {};
          if (currentTheme.length === 0) updates.theme = nextTheme;
          if (currentSynopsis.length === 0) updates.synopsis = nextSynopsis;
          if (Object.keys(updates).length > 0) {
            updates.updatedAt = serverTimestamp();
            await updateDoc(webtoonRef, updates);
          }
        }

        // 2) Self-heal cut-level fields (cut_theme, dialogue) in episode.cuts[]
        let cutChanged = false;
        const healedCuts: FirestoreCut[] = rawCuts.map((c, i) => {
          const imageUrl = ensureString((c as any)?.imageUrl ?? (c as any)?.url ?? (c as any)?.src, '');
          if (!imageUrl || isBadImageUrl(imageUrl)) return c;

          const existingDialogue = extractFirstStringDeep((c as any)?.dialogue);
          const existingCutTheme = extractFirstStringDeep((c as any)?.cut_theme);

          if (existingDialogue && existingCutTheme) return c;

          const generated = generateCutThemeAndDialogue({ synopsis: nextSynopsis, theme: nextTheme, index: i, total: rawCuts.length });
          const nextDialogue = existingDialogue ?? generated.dialogue;
          const nextCutTheme2 = existingCutTheme ?? generated.cut_theme;

          const next: FirestoreCut = { ...(c as any) };
          if (!existingCutTheme) {
            next.cut_theme = nextCutTheme2;
            cutChanged = true;
          }
          if (!existingDialogue) {
            next.dialogue = nextDialogue;
            cutChanged = true;
          }
          return next;
        });

        // Also persist normalization (string -> object, url -> imageUrl) so viewer is consistent.
        if (cutChanged || rawCutsAny.length !== healedCuts.length || rawCutsAny.some((c) => typeof c === 'string')) {
          await updateDoc(epRef, { cuts: healedCuts, healedAt: serverTimestamp() });
        }

        // 3) Build viewer cuts ONLY from DB (healedCuts)
        const normalizedViewerCuts: ViewerCut[] = [];
        for (let i = 0; i < healedCuts.length; i++) {
          const c = healedCuts[i];
          const imageUrl = ensureString((c as any)?.imageUrl ?? (c as any)?.url ?? (c as any)?.src, '');
          if (!imageUrl || isBadImageUrl(imageUrl)) continue;

          const d = extractFirstStringDeep((c as any)?.dialogue);
          const t = extractFirstStringDeep((c as any)?.cut_theme);

          // 렌더링 시점에는 절대 ...이 나오지 않게 보장
          const dialogue = d ?? generateCutThemeAndDialogue({ synopsis: nextSynopsis, theme: nextTheme, index: i, total: healedCuts.length }).dialogue;
          const cut_theme = t ?? generateCutThemeAndDialogue({ synopsis: nextSynopsis, theme: nextTheme, index: i, total: healedCuts.length }).cut_theme;

          normalizedViewerCuts.push({ imageUrl, dialogue, cut_theme, rawIndex: i });
        }

        if (!cancelled) {
          setViewerCuts(normalizedViewerCuts);
          setVisibleCount(0);
        }
      } catch (e) {
        toast.error('데이터 로딩/자동완성 중 오류가 발생했습니다.');
      } finally {
        if (!cancelled) {
          setHealing(false);
          setLoading(false);
        }
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [webtoonId, episodeId]);

  useEffect(() => {
    if (loading || healing) return;
    if (viewerCuts.length === 0) return;

    if (timerRef.current) window.clearTimeout(timerRef.current);
    setVisibleCount(1);

    const tick = () => {
      setVisibleCount((prev) => {
        const next = Math.min(prev + 1, viewerCuts.length);
        return next;
      });
      timerRef.current = window.setTimeout(() => {
        tick();
      }, 800);
    };

    timerRef.current = window.setTimeout(() => {
      tick();
    }, 800);

    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      timerRef.current = null;
    };
  }, [viewerCuts, loading, healing]);

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
              <div style={{ marginTop: 16, opacity: 0.6, fontSize: 14 }}>
                {healing ? '데이터 자동 완성 중…' : '불러오는 중…'}
              </div>
            </div>
          ) : viewerCuts.length === 0 ? (
            <div style={{ padding: '64px 16px', textAlign: 'center', opacity: 0.7 }}>표시할 이미지가 없습니다.</div>
          ) : (
            <>
              {visibleCuts.map((cut, idx) => (
                <CutBlock key={`${cut.imageUrl}-${cut.rawIndex}`} cut={cut} displayIndex={idx} />
              ))}
              {visibleCuts.length < viewerCuts.length && (
                <div style={{ width: '100%', maxWidth: 800, margin: '0 auto', padding: '16px' }}>
                  <div style={{ opacity: 0.55, fontSize: 13 }}>
                    로딩 중… {visibleCuts.length}/{viewerCuts.length}
                  </div>
                </div>
              )}
              {visibleCuts.length >= viewerCuts.length && (
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

