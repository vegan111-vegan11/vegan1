import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCtYG4Lnuq4XYtx_1AZpWs5pDHCJNKA4hk',
  authDomain: 'vegan1.firebaseapp.com',
  projectId: 'vegan1',
  storageBucket: 'vegan1.appspot.com',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

type TrendWebtoon = {
  id: string;
  title: string;
  author: string;
  genre: string;
  rating: number;
  theme: string;
  synopsis: string;
  thumbnailPrompt: string;
  bannerPrompt: string;
  episodePromptBase: string;
  isHot?: boolean;
  isNew?: boolean;
};

function pollinationsUrl(prompt: string, opts: { width: number; height: number; seed: number }) {
  const q = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${q}?width=${opts.width}&height=${opts.height}&nologo=true&seed=${opts.seed}`;
}

function genDialogue(theme: string, synopsis: string, idx: number) {
  const p = idx / 70;
  const beat = p < 0.15 ? '도입' : p < 0.35 ? '긴장' : p < 0.6 ? '전개' : p < 0.8 ? '충돌' : '여운';
  const hint = synopsis.length > 70 ? synopsis.slice(0, 70) + '…' : synopsis;

  if (theme === 'SF') {
    if (beat === '도입') return `네온이 숨을 쉬는 밤… ${hint}`;
    if (beat === '긴장') return `경고등이 켜졌어. 누군가 먼저 움직였다.`;
    if (beat === '전개') return `흔적이 이어져. 한 조각씩, 진실이 드러난다.`;
    if (beat === '충돌') return `여기서 멈추면 끝이야. 지금이 아니면 못 나가.`;
    return `…아직 끝나지 않았어. 다음 장면이 답이겠지.`;
  }
  if (theme === '로맨스') {
    if (beat === '도입') return `처음 만난 순간, 공기가 달라졌어.`;
    if (beat === '긴장') return `왜 이렇게 심장이 빨라… 들키면 안 되는데.`;
    if (beat === '전개') return `말하지 못한 마음이, 자꾸만 새어 나와.`;
    if (beat === '충돌') return `도망치지 마. 이번엔… 내 진심이야.`;
    return `…다음에 만나면, 웃을 수 있을까.`;
  }
  if (theme === '다크판타지') {
    if (beat === '도입') return `검은 물결이 깨어난다. 나를 부르는 소리…`;
    if (beat === '긴장') return `문이 열렸다. 돌아갈 수 없는 길이야.`;
    if (beat === '전개') return `룬이 반응해… 심연이 숨을 쉰다.`;
    if (beat === '충돌') return `내가 지키지 않으면, 모든 것이 무너진다.`;
    return `…심연은 끝이 아니라, 시작이야.`;
  }
  return `…${hint}`;
}

function genCutTheme(theme: string, idx: number) {
  const p = idx / 70;
  const beat = p < 0.15 ? '도입' : p < 0.35 ? '긴장' : p < 0.6 ? '전개' : p < 0.8 ? '충돌' : '여운';
  if (theme === 'SF') return beat === '도입' ? '네온의 고요' : beat === '긴장' ? '시스템 경보' : beat === '전개' ? '추적과 단서' : beat === '충돌' ? '격돌' : '잔상';
  if (theme === '로맨스') return beat === '도입' ? '설렘' : beat === '긴장' ? '거리감' : beat === '전개' ? '고백 전야' : beat === '충돌' ? '진심' : '여운';
  if (theme === '다크판타지') return beat === '도입' ? '심연의 기척' : beat === '긴장' ? '봉인 해제' : beat === '전개' ? '룬의 속삭임' : beat === '충돌' ? '수호' : '잔향';
  return beat;
}

const WEBTOONS: TrendWebtoon[] = [
  {
    id: 'nano-singularity',
    title: '나노 싱귤래리티',
    author: 'AI 오토마톤',
    genre: 'SF',
    rating: 4.9,
    theme: 'SF',
    synopsis: '2077 네오서울. 나노 머신과 감시 시스템이 도시를 잠식하고, 마지막 해커는 탈출 루트를 해킹한다.',
    thumbnailPrompt: 'cyberpunk seoul webtoon cover neon rain cinematic',
    bannerPrompt: 'cyberpunk seoul skyline webtoon banner neon haze cinematic wide',
    episodePromptBase: 'cyberpunk webtoon panel neon alley chase rain cinematic',
    isHot: true,
    isNew: true,
  },
  {
    id: 'signal-love-algorithm',
    title: '시그널 러브 알고리즘',
    author: '감성 AI',
    genre: '로맨스',
    rating: 4.8,
    theme: '로맨스',
    synopsis: '퇴근길 카페에서 우연히 마주친 두 사람. 서로의 플레이리스트가 같은 순간, 관계는 천천히 알고리즘처럼 맞춰진다.',
    thumbnailPrompt: 'k-romance webtoon cover cafe rain bokeh warm tone',
    bannerPrompt: 'k-drama romance webtoon banner city night cafe warm neon wide',
    episodePromptBase: 'k-romance webtoon panel cafe rain umbrella confession soft light',
    isNew: true,
  },
  {
    id: 'abyss-keeper',
    title: '심연의 파수꾼',
    author: 'AI 판타지 봇',
    genre: '판타지',
    rating: 4.7,
    theme: '다크판타지',
    synopsis: '심연의 문이 열리고 봉인이 약해진다. 파수꾼은 도시 아래의 룬을 따라 내려가, 잠든 존재를 깨우지 않기 위해 싸운다.',
    thumbnailPrompt: 'dark fantasy webtoon cover abyss guardian rune glow dramatic',
    bannerPrompt: 'dark fantasy webtoon banner abyss gate rune glow wide cinematic',
    episodePromptBase: 'dark fantasy webtoon panel abyss gate rune magic shadow dramatic',
    isHot: true,
  },
];

async function seedTrending() {
  console.log('Seeding TRENDING webtoons (approved) with unique cuts + dialogue...');

  for (const w of WEBTOONS) {
    const thumb = pollinationsUrl(w.thumbnailPrompt, { width: 400, height: 600, seed: 10 });
    const banner = pollinationsUrl(w.bannerPrompt, { width: 1920, height: 1080, seed: 11 });

    await setDoc(doc(db, 'webtoons', w.id), {
      title: w.title,
      author: w.author,
      genre: w.genre,
      rating: w.rating,
      thumbnail: thumb,
      banner,
      description: w.synopsis,
      theme: w.theme,
      synopsis: w.synopsis,
      status: 'approved',
      isHot: !!w.isHot,
      isNew: !!w.isNew,
      episodeCount: 2,
      approvedAt: serverTimestamp(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const episodesRef = collection(db, 'webtoons', w.id, 'episodes');
    for (let ep = 1; ep <= 2; ep++) {
      const cuts = Array.from({ length: 70 }).map((_, i) => {
        const seed = ep * 10000 + i * 17 + (w.id.length % 97);
        const prompt = `${w.episodePromptBase}, episode ${ep}, scene ${i}, no text, illustrated, high detail`;
        return {
          imageUrl: pollinationsUrl(prompt, { width: 800, height: 1200, seed }),
          cut_theme: genCutTheme(w.theme, i),
          dialogue: genDialogue(w.theme, w.synopsis, i),
        };
      });

      await setDoc(doc(episodesRef, String(ep)), {
        vol: ep,
        title: `${w.title} ${ep}화`,
        cuts,
        updatedAt: serverTimestamp(),
        createdAt: serverTimestamp(),
      });
    }

    console.log(`[OK] ${w.id}: 2 episodes x 70 cuts seeded`);
  }

  console.log('Done.');
}

seedTrending().catch((e) => {
  console.error(e);
  process.exit(1);
});

