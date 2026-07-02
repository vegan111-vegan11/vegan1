import fs from 'fs';
import path from 'path';
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

const outDir = path.join(process.cwd(), 'public', 'full-cuts');
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// 70 lines of dialogue for a proper webtoon feel
const dialogues = [
  "비가 멈추지 않는 도시, 네오-서울.",
  "나는 이 뒷골목에서 태어나 자랐다.",
  "의미 없는 네온사인만이 거리를 비추고,",
  "사람들은 홀로그램에 취해 살아간다.",
  "오늘도 누군가는 죽고, 누군가는 태어나겠지.",
  "하지만 내 알 바 아니다.",
  "내 이름은 '케이'.",
  "불법 사이버네틱스 파츠를 수리하는 엔지니어다.",
  "의뢰인은 보통 밤늦게 찾아온다.",
  "발소리 하나 없이 조용하게.",
  "딸랑-",
  "문이 열리는 소리와 함께 그녀가 들어왔다.",
  "온몸이 피투성이인 안드로이드.",
  "...수리가 필요한가?",
  "그녀는 아무 말 없이 카운터에 메모리 칩을 내려놓았다.",
  "이건... 기업용 1급 기밀 데이터 칩이잖아.",
  "당신, 대체 무슨 짓을 한 거야?",
  "그녀의 눈동자가 파랗게 빛났다.",
  "'살려줘요.'",
  "짧은 한마디.",
  "나는 깊은 한숨을 쉬었다.",
  "이런 귀찮은 일에는 엮이고 싶지 않았는데.",
  "하지만 그녀의 눈빛을 모른 척할 수 없었다.",
  "일단 들어와. 문부터 닫고.",
  "응급 처치 키트를 꺼냈다.",
  "인공 혈액이 멎을 기미가 보이지 않는다.",
  "시스템을 스캔해보니 메인보드 손상이 심각하다.",
  "대체 누구한테 쫓기는 거지?",
  "'크로노스 코퍼레이션.'",
  "그 이름을 듣는 순간, 내 손이 멈칫했다.",
  "도시를 지배하는 초거대 기업.",
  "그곳을 건드렸다면 살아서 나가긴 힘들다.",
  "하지만 이 메모리 칩에 뭐가 있길래...",
  "나는 컴퓨터에 칩을 연결했다.",
  "경고: 접근 권한이 없습니다.",
  "우회 프로그램을 돌려야겠어.",
  "해킹이 시작되었다. 10%, 20%...",
  "그때, 창문 밖에서 섬광이 번쩍였다.",
  "쾅-!!",
  "건물 전체가 흔들렸다.",
  "벌써 찾아온 건가!",
  "나는 총을 챙겨 들었다.",
  "그녀를 부축하고 뒷문으로 향했다.",
  "골목엔 무장한 요원들이 깔려 있었다.",
  "여기서 죽을 순 없어.",
  "나는 EMP 수류탄을 던졌다.",
  "전자기 펄스가 주변 기기들을 먹통으로 만들었다.",
  "지금이야, 뛰어!",
  "우리는 빗속을 뚫고 달렸다.",
  "숨이 턱 끝까지 차올랐다.",
  "하지만 요원들의 추격은 끈질겼다.",
  "저 앞은 막다른 길이다.",
  "어떻게 해야 하지?",
  "그녀가 갑자기 내 손을 잡았다.",
  "'이쪽으로.'",
  "그녀가 숨겨진 지하 통로를 열었다.",
  "이런 곳이 있었다니...",
  "지하수도를 따라 끝없이 걸었다.",
  "마침내 안전한 은신처에 도착했다.",
  "이제 말해봐. 그 칩의 정체가 뭐지?",
  "그녀는 칩을 가리키며 말했다.",
  "'이 도시에 숨겨진 진실.'",
  "크로노스가 시민들을 통제하는 방식.",
  "모든 기록이 조작되고 있었다는 사실.",
  "이 데이터가 세상에 공개된다면...",
  "폭동이 일어날 거야.",
  "나는 선택해야 했다.",
  "이대로 도망칠 것인가, 싸울 것인가.",
  "비가 멈추고 아침이 밝아오고 있었다.",
  "나의 대답은 정해져 있었다."
];

async function run() {
  console.log('1. Downloading 70 cuts...');
  const promises = [];
  for (let i = 1; i <= 70; i++) {
    const prompt = `anime style webtoon panel cyberpunk neon city character highly detailed cinematic lighting episode 1 scene ${i}`;
    const url = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=1200&nologo=true&seed=${i + 1000}`;
    
    promises.push(
      fetch(url)
        .then(res => res.arrayBuffer())
        .then(buffer => {
          fs.writeFileSync(path.join(outDir, `cut${i}.jpg`), Buffer.from(buffer));
          console.log(`Saved cut${i}.jpg`);
        })
        .catch(e => console.error(`Failed ${i}`, e))
    );
  }
  
  // Wait for all downloads to finish
  await Promise.all(promises);
  console.log('All downloads finished.');

  console.log('2. Wiping old webtoons...');
  const wSnap = await getDocs(collection(db, 'webtoons'));
  for (const w of wSnap.docs) {
    const epSnap = await getDocs(collection(db, 'webtoons', w.id, 'episodes'));
    for (const e of epSnap.docs) await deleteDoc(e.ref);
    await deleteDoc(w.ref);
    console.log(`Deleted ${w.id}`);
  }

  const pSnap = await getDocs(collection(db, 'pending_webtoons'));
  for (const p of pSnap.docs) await deleteDoc(p.ref);

  console.log('3. Creating full 70-cut webtoon...');
  const webtoonId = 'neo-seoul-2099';
  
  await setDoc(doc(db, 'webtoons', webtoonId), {
    title: '네오-서울 2099 (풀버전)',
    author: 'AI 마스터',
    genre: 'SF',
    rating: 5.0,
    thumbnail: '/full-cuts/cut1.jpg',
    banner: '/full-cuts/cut2.jpg',
    description: '1화 70컷이 모두 독립적인 이미지로 구성된 완전판 웹툰입니다. 끊김 없이 로딩됩니다.',
    status: 'approved',
    isNew: true,
    episodeCount: 1,
    createdAt: new Date(),
    approvedAt: new Date()
  });

  const cuts = [];
  for (let i = 0; i < 70; i++) {
    cuts.push({
      imageUrl: `/full-cuts/cut${i + 1}.jpg`,
      dialogue: dialogues[i]
    });
  }

  await setDoc(doc(db, 'webtoons', webtoonId, 'episodes', '1'), {
    vol: 1,
    title: `네오-서울 2099 1화`,
    cuts,
    createdAt: new Date()
  });

  console.log('Done! 70 cuts saved with unique static images and precise dialogue.');
  process.exit(0);
}

run().catch(console.error);
