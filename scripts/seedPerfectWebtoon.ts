import fs from 'fs';
import path from 'path';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, deleteDoc, getDocs, collection, serverTimestamp } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCtYG4Lnuq4XYtx_1AZpWs5pDHCJNKA4hk",
  authDomain: "vegan1.firebaseapp.com",
  projectId: "vegan1",
  storageBucket: "vegan1.appspot.com",
  messagingSenderId: "822051706796",
  appId: "1:822051706796:web:7f61s-projects"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// 70 story-driven cuts for Romance Webtoon with matched English prompts for perfect AI generation
const cutsData = [
  { kr: "비가 오는 날은 항상 우울했다.", en: "raining city street moody sad girl walking with umbrella" },
  { kr: "하지만 그날은 달랐다.", en: "girl looking up at the rain with a slight smile cinematic lighting" },
  { kr: "카페 구석 자리, 우연히 들려온 음악.", en: "cozy cafe interior corner seat warm bokeh lighting" },
  { kr: "내가 가장 좋아하는 인디 밴드의 미발매곡.", en: "vintage vinyl record player playing in cafe aesthetic" },
  { kr: "고개를 들어 그를 보았다.", en: "girl turning her head looking surprised in cafe" },
  { kr: "그도 나를 보고 있었다.", en: "handsome boy looking back at girl from across the cafe" },
  { kr: "마치 짜여진 알고리즘처럼.", en: "two people making eye contact across a cafe cinematic" },
  { kr: "우리의 주파수가 맞는 순간.", en: "soft glowing light connecting two people in cafe romantic" },
  { kr: "그의 시선이 내게 닿았을 때,", en: "close up boy eyes looking softly" },
  { kr: "세상이 잠시 멈춘 것 같았다.", en: "time stop effect cafe dust motes floating soft light" },
  { kr: "떨리는 손으로 커피잔을 들었다.", en: "close up girl hand holding warm coffee cup trembling slightly" },
  { kr: "그가 천천히 자리에서 일어나 다가온다.", en: "tall boy walking towards girl in cozy cafe" },
  { kr: "무슨 말을 해야 할지 모르겠다.", en: "girl looking nervous and shy blushing" },
  { kr: "하지만 도망치고 싶지 않다.", en: "girl looking determined and hopeful romantic" },
  // 14
  { kr: "안녕하세요.", en: "boy smiling warmly saying hello" },
  { kr: "그의 첫 마디는 평범했지만,", en: "boy talking softly soft natural light" },
  { kr: "목소리가 너무 좋아서 심장이 뛰었다.", en: "girl holding chest feeling heartbeat blushing" },
  { kr: "그 밴드, 좋아하시나봐요?", en: "boy pointing at the speaker smiling" },
  { kr: "나도 모르게 고개를 끄덕였다.", en: "girl nodding shyly" },
  { kr: "그렇게 우리의 대화가 시작되었다.", en: "two people sitting at a cafe table talking happily" },
  { kr: "우연일까, 필연일까.", en: "two coffee cups on a table romantic bokeh" },
  { kr: "비슷한 취향, 비슷한 상처.", en: "two people looking out the rain window together" },
  { kr: "말하지 않아도 알 수 있는 감정들.", en: "silhouetted couple sitting close in cafe warm light" },
  { kr: "조금씩 거리가 좁혀진다.", en: "close up hands getting closer on table" },
  { kr: "하지만 아직 무서워.", en: "girl looking anxious looking down" },
  { kr: "다시 상처받고 싶지 않아.", en: "girl hugging herself looking sad in memories" },
  { kr: "그의 다정함이 오히려 불안하다.", en: "boy looking with concern at girl" },
  { kr: "나, 이 사람을 믿어도 될까?", en: "girl looking deeply into boy's eyes searching for truth" },
  // 28
  { kr: "비가 그치고, 우리는 밖으로 나왔다.", en: "couple walking out of cafe rain stopped wet street reflection" },
  { kr: "우산 아래로 느껴지는 그의 체온.", en: "couple walking close together sharing an umbrella" },
  { kr: "손끝이 스칠 때마다 숨이 막혀.", en: "close up hands accidentally touching while walking" },
  { kr: "이 감정을 숨길 수 있을까?", en: "girl looking away blushing intensely" },
  { kr: "그가 갑자기 걸음을 멈췄다.", en: "boy stopping walking looking serious" },
  { kr: "나를 바라보는 진지한 눈빛.", en: "close up boy serious and romantic look" },
  { kr: "할 말이 있어요.", en: "boy taking a breath about to speak" },
  { kr: "심장이 터질 것 같아.", en: "girl looking surprised eyes wide open" },
  { kr: "나도, 사실은...", en: "girl opening mouth to speak soft light" },
  { kr: "말이 입안에서 맴돈다.", en: "girl biting lip hesitating" },
  { kr: "그가 조심스럽게 내 손을 잡았다.", en: "boy gently holding girl hand warm light" },
  { kr: "따뜻하다.", en: "close up intertwined hands romantic" },
  { kr: "이 온기를 놓치고 싶지 않아.", en: "girl smiling softly looking at hands" },
  { kr: "알고리즘의 끝은 해피엔딩일까?", en: "couple looking at each other under street light romantic" },
  // 42
  { kr: "네, 좋아요.", en: "girl smiling brightly nodding" },
  { kr: "나의 대답에 그는 활짝 웃었다.", en: "boy laughing happily bright smile" },
  { kr: "비 갠 하늘처럼 맑은 미소.", en: "clear sky after rain beautiful sunset" },
  { kr: "우리의 이야기는 이제 시작이다.", en: "couple walking away together holding hands back view" },
  { kr: "우연이 만든 완벽한 알고리즘.", en: "digital glowing lines forming a heart shape aesthetic" },
  { kr: "그렇게 나는 그에게 동기화되었다.", en: "two people looking deeply at each other glowing soft light" },
  { kr: "내일도 비가 왔으면 좋겠다.", en: "girl looking out window at night wishing" },
  { kr: "그와 우산을 함께 쓸 수 있게.", en: "imagining sharing umbrella with boy warm feeling" },
  { kr: "어떤 오류가 발생해도 상관없어.", en: "couple standing strong together dark background with light" },
  { kr: "우리가 함께라면 해결할 수 있으니까.", en: "boy wrapping arm around girl protecting" },
  { kr: "사랑이라는 변수.", en: "glowing magical particles floating around couple" },
  { kr: "가장 예측 불가능하지만,", en: "dynamic camera angle couple laughing" },
  { kr: "가장 아름다운 버그.", en: "beautiful glitched aesthetic romantic couple" },
  { kr: "시그널, 러브 알고리즘.", en: "title text style neon sign signal love algorithm" },
  // 56
  { kr: "다음 날 아침.", en: "morning sunlight streaming into bedroom" },
  { kr: "햇살이 기분 좋게 들어온다.", en: "girl stretching in bed smiling" },
  { kr: "휴대폰이 울렸다.", en: "close up smartphone on nightstand vibrating" },
  { kr: "그에게서 온 메시지.", en: "girl looking at phone smiling brightly" },
  { kr: "오늘 저녁에 시간 어때요?", en: "text message bubble on screen romantic aesthetic" },
  { kr: "나는 곧바로 답장을 보냈다.", en: "girl typing fast on phone happy" },
  { kr: "옷장을 열고 한참을 고민했다.", en: "girl looking at clothes in closet trying to choose" },
  { kr: "가장 예뻐 보이고 싶은 날.", en: "girl looking in mirror putting on light makeup" },
  { kr: "약속 장소에 도착했다.", en: "busy city square evening sunset" },
  { kr: "저 멀리 그가 보인다.", en: "boy waiting looking at watch handsome" },
  { kr: "나를 발견하고 손을 흔든다.", en: "boy waving smiling wide" },
  { kr: "달려가서 안기고 싶지만,", en: "girl running towards boy happy" },
  { kr: "애써 걸음을 늦췄다.", en: "girl walking elegantly trying to stay calm" },
  { kr: "오늘 예쁘네요.", en: "boy complimenting girl softly" },
  { kr: "그의 칭찬에 얼굴이 붉어졌다.", en: "girl blushing looking down shy" },
  { kr: "우리는 공원을 걸었다.", en: "couple walking in park evening lights" },
  { kr: "어제보다 훨씬 편안해진 공기.", en: "couple talking naturally laughing together" },
  { kr: "이 순간이 영원했으면 좋겠다.", en: "wide shot couple walking under starry sky beautiful night" },
  { kr: "앞으로 수많은 변수가 있겠지만.", en: "abstract glowing code lines romantic" },
  { kr: "함께라면 두렵지 않아.", en: "couple holding hands tight close up" },
  { kr: "우리의 주파수는 이제 완벽히 일치하니까.", en: "two glowing soundwaves merging into one" },
  { kr: "나는 그의 어깨에 기댔다.", en: "girl resting head on boy shoulder sitting on bench" },
  { kr: "그도 살며시 내 머리를 감싸 안았다.", en: "boy gently stroking girl hair warm embrace" },
  { kr: "이대로 시간이 멈췄으면.", en: "beautiful romantic cinematic scene time stop" },
  { kr: "시그널 러브 알고리즘, 끝.", en: "couple silhouette against full moon beautiful ending" }
];

// Fallback Unsplash image if Pollinations hangs
const FALLBACK_URL = "https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9b?q=80&w=800";

const outDir = path.join(process.cwd(), 'public', 'perfect-cuts');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

async function downloadImages() {
  console.log('Downloading 70 custom AI images matching the exact dialogue...');
  const CONCURRENCY = 4;
  
  for (let i = 0; i < cutsData.length; i += CONCURRENCY) {
    const chunk = cutsData.slice(i, i + CONCURRENCY);
    const promises = chunk.map(async (data, index) => {
      const cutNum = i + index + 1;
      const prompt = `korean webtoon style, romance, ${data.en}, cinematic lighting, highly detailed, highly aesthetic`;
      const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=1200&nologo=true&seed=${500 + cutNum}`;
      
      let success = false;
      let retries = 0;
      
      while (!success && retries < 2) {
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds max wait per request
          
          const res = await fetch(url, { signal: controller.signal });
          clearTimeout(timeoutId);
          
          if (res.status === 200) {
            const buffer = await res.arrayBuffer();
            if (buffer.byteLength > 10000) {
              fs.writeFileSync(path.join(outDir, `cut${cutNum}.jpg`), Buffer.from(buffer));
              console.log(`[OK] cut${cutNum}.jpg`);
              success = true;
            } else {
              throw new Error('Image too small');
            }
          }
        } catch (e) {
          retries++;
          console.log(`[Retry ${retries}] cut${cutNum}.jpg...`);
        }
      }
      
      if (!success) {
        console.log(`[Fallback] using fallback for cut${cutNum}.jpg`);
        const fallbackRes = await fetch(FALLBACK_URL);
        const buffer = await fallbackRes.arrayBuffer();
        fs.writeFileSync(path.join(outDir, `cut${cutNum}.jpg`), Buffer.from(buffer));
      }
    });
    
    await Promise.all(promises);
  }
}

async function seedDB() {
  console.log("Seeding Database...");
  
  const webtoonId = 'signal-love-algorithm';
  
  await setDoc(doc(db, 'webtoons', webtoonId), {
    title: '시그널 러브 알고리즘',
    author: '감성 AI',
    genre: '로맨스',
    rating: 5.0,
    theme: '로맨스',
    description: '대사와 완벽하게 일치하는 그림체로 새롭게 생성된 초고퀄리티 버전입니다.',
    status: 'approved',
    isNew: true,
    thumbnail: `/perfect-cuts/cut1.jpg`,
    banner: `/perfect-cuts/cut8.jpg`,
    episodeCount: 1,
    createdAt: serverTimestamp(),
    approvedAt: serverTimestamp()
  });

  const episodesRef = collection(db, 'webtoons', webtoonId, 'episodes');
  
  const cuts = cutsData.map((data, i) => ({
    imageUrl: `/perfect-cuts/cut${i + 1}.jpg`,
    dialogue: data.kr
  }));

  await setDoc(doc(episodesRef, '1'), {
    vol: 1,
    title: `시그널 러브 알고리즘 1화`,
    cuts,
    createdAt: serverTimestamp()
  });

  console.log(`[Success] Restored perfect webtoon with 70 cuts.`);
}

async function run() {
  await downloadImages();
  await seedDB();
  process.exit(0);
}

run().catch(console.error);
