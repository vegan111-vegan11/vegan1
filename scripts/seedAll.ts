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

// 1. Unsplash Image Pools for Reliability
const ROMANCE_IMAGES = [
  "https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9b?q=80&w=800",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?q=80&w=800",
  "https://images.unsplash.com/photo-1529333166437-7750a6dd5a70?q=80&w=800",
  "https://images.unsplash.com/photo-1494774157365-9e04c6720e47?q=80&w=800",
  "https://images.unsplash.com/photo-1511895426328-dc8714191300?q=80&w=800",
  "https://images.unsplash.com/photo-1484399172022-72a90b12e3c1?q=80&w=800",
  "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?q=80&w=800",
  "https://images.unsplash.com/photo-1469334031218-e382a71b716b?q=80&w=800",
  "https://images.unsplash.com/photo-1516726817505-f5ed825624d8?q=80&w=800",
  "https://images.unsplash.com/photo-1522098635833-216c03d81fbe?q=80&w=800"
];

const MYSTERY_IMAGES = [
  "https://images.unsplash.com/photo-1509281373149-e957c6296406?q=80&w=800",
  "https://images.unsplash.com/photo-1519074002996-a69e7ac46a42?q=80&w=800",
  "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?q=80&w=800",
  "https://images.unsplash.com/photo-1484244233201-29892afe6a2c?q=80&w=800",
  "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?q=80&w=800",
  "https://images.unsplash.com/photo-1447015237013-0e80b2786dea?q=80&w=800",
  "https://images.unsplash.com/photo-1502814404093-6a9cc24d1a08?q=80&w=800",
  "https://images.unsplash.com/photo-1442544213729-6a15f1611937?q=80&w=800",
  "https://images.unsplash.com/photo-1505528633441-118bb9d68367?q=80&w=800",
  "https://images.unsplash.com/photo-1456105828065-f933f81502bc?q=80&w=800"
];

const FANTASY_IMAGES = [
  "https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800",
  "https://images.unsplash.com/photo-1505664184310-86c221b2bb50?q=80&w=800",
  "https://images.unsplash.com/photo-1516410529446-2c777cb7366d?q=80&w=800",
  "https://images.unsplash.com/photo-1472653431158-6364773b2a56?q=80&w=800",
  "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=800",
  "https://images.unsplash.com/photo-1462275646964-a0e3386b89fa?q=80&w=800",
  "https://images.unsplash.com/photo-1485871981521-5b1fd3805eff?q=80&w=800",
  "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=800",
  "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800"
];

const JOSEON_IMAGES = [
  "https://images.unsplash.com/photo-1598463991669-e794fc77fb54?q=80&w=800",
  "https://images.unsplash.com/photo-1518081608678-a4de7b322e70?q=80&w=800",
  "https://images.unsplash.com/photo-1627918861616-e5c9299b9cf9?q=80&w=800",
  "https://images.unsplash.com/photo-1582236378873-f933f81502bc?q=80&w=800",
  "https://images.unsplash.com/photo-1584223847253-157dcda61df9?q=80&w=800",
  "https://images.unsplash.com/photo-1627918861616-e5c9299b9cf9?q=80&w=800",
  "https://images.unsplash.com/photo-1590059178351-4d33458db411?q=80&w=800",
  "https://images.unsplash.com/photo-1583002235940-d9d30a0bf0ba?q=80&w=800",
  "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800",
  "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800"
];

// 2. High Quality Dialogues (70 cuts each)
function getDialogue(theme: string, i: number): string {
  const p = i / 70;
  if (theme === '로맨스') {
    if (p < 0.2) return ["비가 오는 날은 항상 우울했다.", "하지만 그날은 달랐다.", "카페 구석 자리, 우연히 들려온 음악.", "내가 가장 좋아하는 인디 밴드의 미발매곡.", "고개를 들어 그를 보았다.", "그도 나를 보고 있었다.", "마치 짜여진 알고리즘처럼.", "우리의 주파수가 맞는 순간.", "그의 시선이 내게 닿았을 때,", "세상이 잠시 멈춘 것 같았다.", "떨리는 손으로 커피잔을 들었다.", "그가 천천히 자리에서 일어나 다가온다.", "무슨 말을 해야 할지 모르겠다.", "하지만 도망치고 싶지 않다."][i % 14];
    if (p < 0.5) return ["안녕하세요.", "그의 첫 마디는 평범했지만,", "목소리가 너무 좋아서 심장이 뛰었다.", "그 밴드, 좋아하시나봐요?", "나도 모르게 고개를 끄덕였다.", "그렇게 우리의 대화가 시작되었다.", "우연일까, 필연일까.", "비슷한 취향, 비슷한 상처.", "말하지 않아도 알 수 있는 감정들.", "조금씩 거리가 좁혀진다.", "하지만 아직 무서워.", "다시 상처받고 싶지 않아.", "그의 다정함이 오히려 불안하다.", "나, 이 사람을 믿어도 될까?"][i % 14];
    if (p < 0.8) return ["비가 그치고, 우리는 밖으로 나왔다.", "우산 아래로 느껴지는 그의 체온.", "손끝이 스칠 때마다 숨이 막혀.", "이 감정을 숨길 수 있을까?", "그가 갑자기 걸음을 멈췄다.", "나를 바라보는 진지한 눈빛.", "할 말이 있어요.", "심장이 터질 것 같아.", "나도, 사실은...", "말이 입안에서 맴돈다.", "그가 조심스럽게 내 손을 잡았다.", "따뜻하다.", "이 온기를 놓치고 싶지 않아.", "알고리즘의 끝은 해피엔딩일까?"][i % 14];
    return ["네, 좋아요.", "나의 대답에 그는 활짝 웃었다.", "비 갠 하늘처럼 맑은 미소.", "우리의 이야기는 이제 시작이다.", "우연이 만든 완벽한 알고리즘.", "그렇게 나는 그에게 동기화되었다.", "내일도 비가 왔으면 좋겠다.", "그와 우산을 함께 쓸 수 있게.", "어떤 오류가 발생해도 상관없어.", "우리가 함께라면 해결할 수 있으니까.", "사랑이라는 변수.", "가장 예측 불가능하지만,", "가장 아름다운 버그.", "시그널, 러브 알고리즘."][i % 14];
  } else if (theme === '미스터리') {
    if (p < 0.2) return ["그 자식은 나와 똑같이 생겼다.", "거울을 보는 것 같은 기분.", "하지만 거울 속의 나는 웃고 있지 않았다.", "저건 내가 아니다.", "누구야 넌?", "나? 나는 너지.", "말도 안 되는 소리.", "하지만 그는 내 기억을 모두 가지고 있었다.", "내 필체, 내 습관, 내 상처까지.", "완벽한 카피.", "내 주변 사람들은 눈치채지 못했다.", "오히려 그를 더 진짜라고 믿고 있었다.", "점점 내 자리가 사라지고 있다.", "어떻게 해야 하지?"][i % 14];
    if (p < 0.5) return ["그는 내 직장에 출근했다.", "내 여자친구와 데이트를 했다.", "내 부모님과 저녁을 먹었다.", "나는 그림자처럼 그를 지켜볼 수밖에 없었다.", "어디서부터 잘못된 걸까.", "며칠 전, 그 기이한 사고 때문인가?", "빛이 번쩍였고, 정신을 잃었었다.", "깨어났을 때, 세상에 내가 둘이 되어 있었다.", "이건 꿈이 아니야.", "증명해야 해.", "내가 진짜라는 증거를 찾아야 해.", "하지만 어떻게?", "모든 시스템이 그를 나로 인식한다.", "나라는 존재가 부정당하고 있어."][i % 14];
    if (p < 0.8) return ["그를 추적하기 시작했다.", "그의 동선, 그의 패턴.", "기계처럼 완벽하지만 맹점이 있을 거다.", "찾았다.", "그는 특정 시간마다 어딘가로 보고를 하고 있다.", "배후가 있다는 뜻이야.", "단순한 도플갱어가 아니야.", "누군가 나를 대체하려고 해.", "하지만 왜 하필 나지?", "내가 가진 비밀 때문인가?", "그렇다면 그 비밀을 먼저 풀어야 해.", "녀석의 은신처를 찾아냈다.", "문을 부수고 들어갔다.", "거기서 본 것은... 충격적이었다."][i % 14];
    return ["나와 똑같은 캡슐이 수백 개.", "이건 복제 인간 공장이다.", "그는 첫 번째 성공작일 뿐.", "그가 내 등 뒤에서 총을 겨눴다.", "진짜는 중요하지 않아. 살아남는 게 진짜지.", "나는 조용히 웃었다.", "그건 네 생각이고.", "나에게는 진짜만 아는 비밀번호가 있다.", "자폭 시스템 가동.", "그의 눈이 공포로 물들었다.", "모든 것을 끝낼 시간이다.", "카피 캣의 최후.", "나는 내 자리를 되찾을 것이다.", "어떤 대가를 치르더라도."][i % 14];
  } else if (theme === '다크판타지') {
    if (p < 0.2) return ["심연의 문이 열렸다.", "봉인이 풀리는 소리.", "대지가 흔들리고 룬이 피로 물든다.", "천 년의 침묵이 깨졌다.", "나는 마지막 파수꾼.", "이 검은 물결을 막아야만 한다.", "하지만 혼자서는 역부족이다.", "악몽의 피조물들이 기어나온다.", "그들의 울음소리가 영혼을 갉아먹는다.", "두려움에 떨 틈이 없다.", "검을 쥐고 일어선다.", "빛은 이미 사라진 지 오래.", "어둠 속에서 길을 찾아야 해.", "심연의 심장부로 간다."][i % 14];
    if (p < 0.5) return ["이곳의 공기는 독과 같다.", "숨을 쉴 때마다 폐가 타들어간다.", "과거의 망령들이 속삭인다.", "포기해라. 넌 아무것도 구할 수 없다.", "그들의 목소리는 달콤하지만 치명적이다.", "환상에 빠지면 영원히 길을 잃는다.", "정신을 똑바로 차려야 해.", "고대의 방벽이 눈앞에 보인다.", "하지만 이미 반쯤 파괴되었다.", "이곳을 뚫리면 세계가 끝난다.", "괴물들이 몰려온다.", "피와 살육의 시간.", "내 검이 검은 피로 물든다.", "아직 쓰러질 수 없어."][i % 14];
    if (p < 0.8) return ["끝없는 전투.", "상처가 아물 새가 없다.", "하지만 적들의 수가 줄어들지 않는다.", "저 멀리, 심연의 군주가 모습을 드러낸다.", "압도적인 절망.", "그의 시선이 닿는 곳마다 생명이 죽어간다.", "이게 신의 힘인가?", "아니, 이건 재앙일 뿐이다.", "내 안에 잠든 룬의 힘을 개방할 때가 왔다.", "내 목숨을 대가로.", "마지막 방어선은 나 자신이다.", "군주가 포효하며 돌진해온다.", "나도 검을 치켜들고 맞선다.", "세상의 운명이 걸린 일격."][i % 14];
    return ["검과 검이 부딪히는 굉음.", "빛과 어둠이 충돌한다.", "내 영혼이 타들어가는 고통.", "하지만 물러설 수 없다.", "모든 힘을 쏟아붓는다.", "빛의 폭발.", "군주의 비명소리가 울려 퍼진다.", "그리고 찾아온 적막.", "내가 해낸 건가?", "시야가 흐려진다.", "봉인이 다시 닫히는 소리가 들린다.", "이제 쉴 수 있겠군.", "나의 임무는 끝났다.", "심연의 파수꾼, 영면을 맞이하다."][i % 14];
  } else if (theme === '조선') {
    if (p < 0.2) return ["서기 2099년, 신 조선.", "궁궐 위로 네온사인이 반짝인다.", "전통과 미래가 기괴하게 얽힌 도시.", "나는 왕실 비밀 호위무사, 이안.", "사이버네틱스 의수를 단 검객이다.", "오늘 밤, 은밀한 명이 떨어졌다.", "반정 세력이 궐을 습격할 것이다.", "그들을 막아야 한다.", "어둠 속에서 사이보그 닌자들이 나타났다.", "차갑게 빛나는 레이저 검.", "내 검이 먼저 움직였다.", "금속이 부딪히는 소리.", "피 대신 스파크가 튄다.", "조선의 밤이 뜨거워진다."][i % 14];
    if (p < 0.5) return ["적들의 움직임이 심상치 않다.", "이건 단순한 반정이 아니야.", "누군가 타임머신 코어를 노리고 있다.", "과거를 바꾸려는 수작인가?", "절대 허락할 수 없다.", "나는 코어가 있는 지하 연구소로 향했다.", "연구소는 이미 쑥대밭이 되어 있었다.", "적의 수장이 코어를 훔쳐 달아나고 있다.", "거기 서라!", "그가 차원 문을 열었다.", "놓칠 수 없다.", "나도 몸을 날려 차원 문으로 뛰어들었다.", "시공간이 왜곡되는 감각.", "어디로 가는 거지?"][i % 14];
    if (p < 0.8) return ["눈을 떠보니, 익숙하면서도 낯선 풍경.", "이곳은... 1899년의 한양?", "시간 여행을 해버렸다.", "적의 수장이 역사를 조작하려 하고 있다.", "빨리 그를 막아야 해.", "사이버네틱스 의수를 숨기고 옷을 갈아입었다.", "구한말의 혼란스러운 거리.", "적을 찾기 위해 정보망을 가동했다.", "내장된 칩이 신호를 잡아냈다.", "놈은 고종 황제 근처에 있다.", "암살하려는 건가!", "궁궐로 잠입했다.", "긴박한 추격전.", "놈과 다시 마주쳤다."][i % 14];
    return ["과거의 궁궐에서 벌어지는 미래의 전투.", "내 검과 놈의 총이 부딪힌다.", "역사를 지키기 위한 사투.", "내가 지면 조선의 미래가 사라진다.", "모든 에너지를 검에 집중했다.", "단칼에 놈의 코어를 파괴했다.", "놈은 재가 되어 사라졌다.", "하지만 차원 문이 닫히고 있다.", "돌아가야 해.", "마지막 힘을 쥐어짜 차원 문으로 몸을 던졌다.", "다시 2099년의 네온사인.", "역사는 무사히 지켜졌다.", "나는 호위무사.", "시공간을 넘나드는 그림자."][i % 14];
  } else {
    // SF default
    if (p < 0.2) return ["네온사인이 비추는 젖은 아스팔트.", "이 도시는 언제나 불길한 냄새가 난다.", "내 이름은 케이.", "오늘도 누군가의 뒷조사를 한다.", "의뢰인은 정체를 숨긴 기업의 간부.", "간단한 일이라고 했다.", "하지만 이 바닥에 간단한 일은 없다.", "목표물의 흔적을 쫓아 뒷골목으로 들어섰다.", "드론의 감시망을 피해야 한다.", "해킹 디바이스를 꺼냈다.", "보안 코드를 우회하는 데 성공.", "안으로 진입했다.", "적막한 복도.", "뭔가 잘못되었다는 직감이 든다."][i % 14];
    if (p < 0.5) return ["바닥에 쓰러진 경비원들.", "누군가 나보다 먼저 왔다.", "목표물은 이미 죽어 있었다.", "함정이다!", "사이렌이 울리기 시작했다.", "무장한 기업의 사병들이 몰려온다.", "도망칠 곳이 없다.", "총격전이 시작되었다.", "레이저가 귓가를 스친다.", "나는 연막탄을 터뜨렸다.", "혼란을 틈타 창문으로 뛰어내렸다.", "플라잉 카의 지붕 위로 착지.", "거친 추격전.", "어떻게든 살아남아야 해."][i % 14];
    if (p < 0.8) return ["가까스로 추격을 따돌렸다.", "하지만 상처가 깊다.", "은신처로 돌아가 데이터를 분석했다.", "죽은 목표물이 남긴 암호화된 파일.", "이게 대체 뭐길래 나를 함정에 빠뜨렸지?", "파일의 압축을 풀었다.", "이건... 기업의 생체 실험 데이터다.", "수많은 사람들의 희생.", "이걸 세상에 공개해야 해.", "하지만 내 목숨이 위험해질 거다.", "갈등하는 나 자신.", "어떻게 할 것인가.", "비가 다시 내리기 시작한다.", "선택의 시간이다."][i % 14];
    return ["나는 데이터를 네트워크에 전송했다.", "이제 돌이킬 수 없다.", "기업의 암살자들이 곧 찾아올 것이다.", "내 총의 탄창을 확인했다.", "마지막 전투가 될 것이다.", "문이 부서지는 소리.", "들어와라, 이 쓰레기들아.", "방아쇠를 당겼다.", "화약 냄새와 네온 불빛.", "나의 이야기는 여기서 끝날지도 모른다.", "하지만 이 도시의 진실은 밝혀질 것이다.", "그것만으로도 충분해.", "나노 싱귤래리티.", "특이점은 이미 시작되었다."][i % 14];
  }
}

const WEBTOONS = [
  {
    id: "nano-singularity",
    title: "나노 싱귤래리티",
    author: "AI 오토마톤",
    genre: "SF",
    rating: 4.9,
    theme: "SF",
    description: "2077년 네오 서울, 특이점을 넘어선 나노 머신들의 반란과 이를 막으려는 마지막 해커의 사투.",
    imagesPool: "full" // uses /full-cuts/
  },
  {
    id: "joseon-future-2099",
    title: "조선 퓨처 2099",
    author: "타임 패러독스",
    genre: "판타지",
    rating: 4.8,
    theme: "조선",
    description: "과거와 미래가 융합된 2099년의 신 조선. 왕실 비밀 호위무사의 시간을 넘나드는 액션 활극.",
    imagesPool: "joseon"
  },
  {
    id: "copycat",
    title: "카피 캣",
    author: "도플갱어",
    genre: "미스터리",
    rating: 4.7,
    theme: "미스터리",
    description: "어느 날 나타난 완벽한 나의 복제인간. 그가 내 자리를 차지하기 시작했다.",
    imagesPool: "mystery"
  },
  {
    id: "signal-love-algorithm",
    title: "시그널 러브 알고리즘",
    author: "감성 AI",
    genre: "로맨스",
    rating: 4.8,
    theme: "로맨스",
    description: "퇴근길 카페에서 우연히 마주친 두 사람. 서로의 플레이리스트가 같은 순간, 관계는 천천히 알고리즘처럼 맞춰진다.",
    imagesPool: "romance"
  },
  {
    id: "abyss-keeper",
    title: "심연의 파수꾼",
    author: "AI 판타지 봇",
    genre: "판타지",
    rating: 4.7,
    theme: "다크판타지",
    description: "심연의 문이 열리고 봉인이 약해진다. 파수꾼은 도시 아래의 룬을 따라 내려가, 잠든 존재를 깨우지 않기 위해 싸운다.",
    imagesPool: "fantasy"
  },
  {
    id: "neo-seoul-2099",
    title: "네오-서울 2099 (풀버전)",
    author: "AI 마스터",
    genre: "SF",
    rating: 5.0,
    theme: "SF",
    description: "1화 70컷이 모두 독립적인 이미지로 구성된 완전판 웹툰입니다. 끊김 없이 로딩됩니다.",
    imagesPool: "demo" // uses /demo-cuts/
  }
];

function getImageUrl(pool: string, index: number) {
  if (pool === 'full') return `/full-cuts/cut${(index % 70) + 1}.jpg`;
  if (pool === 'demo') return `/demo-cuts/cut${(index % 10) + 1}.jpg`;
  if (pool === 'romance') return ROMANCE_IMAGES[index % ROMANCE_IMAGES.length];
  if (pool === 'mystery') return MYSTERY_IMAGES[index % MYSTERY_IMAGES.length];
  if (pool === 'fantasy') return FANTASY_IMAGES[index % FANTASY_IMAGES.length];
  if (pool === 'joseon') return JOSEON_IMAGES[index % JOSEON_IMAGES.length];
  return `/demo-cuts/cut1.jpg`;
}

async function seed() {
  console.log("1. Wiping ALL webtoons...");
  const wSnap = await getDocs(collection(db, 'webtoons'));
  for (const w of wSnap.docs) {
    const epSnap = await getDocs(collection(db, 'webtoons', w.id, 'episodes'));
    for (const e of epSnap.docs) await deleteDoc(e.ref);
    await deleteDoc(w.ref);
  }
  const pSnap = await getDocs(collection(db, 'pending_webtoons'));
  for (const p of pSnap.docs) await deleteDoc(p.ref);

  console.log("2. Restoring 6 Original Webtoons with Polished Dialogue and Static Images...");

  for (const webtoon of WEBTOONS) {
    const { id, imagesPool, ...data } = webtoon;

    await setDoc(doc(db, 'webtoons', id), {
      ...data,
      thumbnail: getImageUrl(imagesPool, 0),
      banner: getImageUrl(imagesPool, 1),
      status: 'approved',
      isNew: true,
      episodeCount: 2,
      createdAt: serverTimestamp(),
      approvedAt: serverTimestamp()
    });

    const episodesRef = collection(db, 'webtoons', id, 'episodes');
    
    for (let ep = 1; ep <= 2; ep++) {
      const cuts = [];
      for (let i = 0; i < 70; i++) {
        cuts.push({
          imageUrl: getImageUrl(imagesPool, i + (ep * 10)),
          dialogue: getDialogue(data.theme, i)
        });
      }

      await setDoc(doc(episodesRef, String(ep)), {
        vol: ep,
        title: `${data.title} ${ep}화`,
        cuts,
        createdAt: serverTimestamp()
      });
    }
    console.log(`[Success] Restored ${data.title} (140 cuts)`);
  }

  console.log("All 6 Webtoons perfectly restored with polished dialogues!");
  process.exit(0);
}

seed().catch(console.error);
