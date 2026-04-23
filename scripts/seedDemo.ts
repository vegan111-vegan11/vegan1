import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc, deleteDoc, getDocs } from 'firebase/firestore';

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

const dialogues = [
  "여기인가... 소문으로만 듣던 곳이.",
  "생각보다 훨씬 더 복잡하군.",
  "시스템 접속을 시도해야겠어.",
  "누군가 이미 다녀간 흔적이 남아있어.",
  "이 데이터... 완전히 암호화되어 있군.",
  "해독하는 데 시간이 좀 걸리겠어.",
  "젠장, 함정이었나!",
  "보안 드론들이 몰려오고 있어.",
  "서둘러 빠져나가야 해.",
  "다음에 다시 올 땐 준비를 단단히 해야겠군."
];

async function seed() {
  console.log('1. Wiping old webtoons...');
  const wSnap = await getDocs(collection(db, 'webtoons'));
  for (const w of wSnap.docs) {
    const epSnap = await getDocs(collection(db, 'webtoons', w.id, 'episodes'));
    for (const e of epSnap.docs) await deleteDoc(e.ref);
    await deleteDoc(w.ref);
    console.log(`Deleted ${w.id}`);
  }

  const pSnap = await getDocs(collection(db, 'pending_webtoons'));
  for (const p of pSnap.docs) await deleteDoc(p.ref);

  console.log('2. Creating new static AI webtoon...');
  const webtoonId = 'ai-cyberpunk-demo';
  
  await setDoc(doc(db, 'webtoons', webtoonId), {
    title: '[AI 최신작] 사이버 펑크 2099',
    author: 'AI 오토마톤',
    genre: 'SF',
    rating: 4.9,
    thumbnail: '/demo-cuts/cut1.jpg',
    banner: '/demo-cuts/cut2.jpg',
    description: '100% 정적 파일로 서빙되는 고해상도 AI 웹툰. 렉이나 끊김 없이 부드럽게 재생됩니다.',
    status: 'approved',
    isNew: true,
    episodeCount: 1,
    createdAt: new Date(),
    approvedAt: new Date()
  });

  const cuts = [];
  for (let i = 0; i < 70; i++) {
    const imgIndex = (i % 10) + 1; // 1 to 10
    const diagIndex = i % 10;
    cuts.push({
      imageUrl: `/demo-cuts/cut${imgIndex}.jpg`,
      dialogue: dialogues[diagIndex] + ` (컷 ${i+1})`
    });
  }

  await setDoc(doc(db, 'webtoons', webtoonId, 'episodes', '1'), {
    vol: 1,
    title: `사이버 펑크 2099 1화`,
    cuts,
    createdAt: new Date()
  });

  console.log('Done! 70 cuts saved with static images and dialogue.');
  process.exit(0);
}

seed().catch(console.error);
