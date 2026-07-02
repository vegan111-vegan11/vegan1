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

// Data from seedUltimate.ts
const romanceData = [
  // 0-13
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
  // 14-27
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
  // 28-41
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
  // 42-55 (reused for the rest)
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
];

const mysteryData = [
  { kr: "그 자식은 나와 똑같이 생겼다.", en: "man looking at a perfect clone of himself dark room" },
  { kr: "거울을 보는 것 같은 기분.", en: "man touching a mirror reflecting his exact duplicate" },
  { kr: "하지만 거울 속의 나는 웃고 있지 않았다.", en: "reflection in mirror smiling evilly while man looks scared" },
  { kr: "저건 내가 아니다.", en: "close up man sweating looking terrified" },
  { kr: "누구야 넌?", en: "man shouting pointing at his clone" },
  { kr: "나? 나는 너지.", en: "clone smirking evil smile dark lighting" },
  { kr: "말도 안 되는 소리.", en: "man grabbing his head in disbelief" },
  { kr: "하지만 그는 내 기억을 모두 가지고 있었다.", en: "abstract glowing memory fragments floating between two identical men" },
  { kr: "내 필체, 내 습관, 내 상처까지.", en: "close up two arms with the exact same scar" },
  { kr: "완벽한 카피.", en: "two identical faces overlapping glitch effect" },
  { kr: "내 주변 사람들은 눈치채지 못했다.", en: "clone laughing with friends in a bar man watching from outside window" },
  { kr: "오히려 그를 더 진짜라고 믿고 있었다.", en: "friends hugging the clone ignoring the real man" },
  { kr: "점점 내 자리가 사라지고 있다.", en: "real man fading into shadows vanishing" },
  { kr: "어떻게 해야 하지?", en: "man sitting in dark room looking desperate holding his head" },
  
  { kr: "그는 내 직장에 출근했다.", en: "clone sitting at office desk typing confidently" },
  { kr: "내 여자친구와 데이트를 했다.", en: "clone holding hands with girlfriend smiling" },
  { kr: "내 부모님과 저녁을 먹었다.", en: "clone eating dinner with parents happy family scene" },
  { kr: "나는 그림자처럼 그를 지켜볼 수밖에 없었다.", en: "real man hiding in dark alley watching clone" },
  { kr: "어디서부터 잘못된 걸까.", en: "man looking at old photographs confused" },
  { kr: "며칠 전, 그 기이한 사고 때문인가?", en: "flashback car crash glowing strange light" },
  { kr: "빛이 번쩍였고, 정신을 잃었었다.", en: "blinding white light swallowing the scene" },
  { kr: "깨어났을 때, 세상에 내가 둘이 되어 있었다.", en: "man waking up on ground seeing his own body standing" },
  { kr: "이건 꿈이 아니야.", en: "man splashing water on his face in dirty bathroom" },
  { kr: "증명해야 해.", en: "man looking at himself in broken mirror determined" },
  { kr: "내가 진짜라는 증거를 찾아야 해.", en: "man searching through messy papers and files on desk" },
  { kr: "하지만 어떻게?", en: "man looking lost in a crowded city street" },
  { kr: "모든 시스템이 그를 나로 인식한다.", en: "computer screen showing access denied error glitch" },
  { kr: "나라는 존재가 부정당하고 있어.", en: "man looking at his own ID card fading away" },

  { kr: "그를 추적하기 시작했다.", en: "man following clone from a distance wearing hood" },
  { kr: "그의 동선, 그의 패턴.", en: "detective board with red strings connecting photos of clone" },
  { kr: "기계처럼 완벽하지만 맹점이 있을 거다.", en: "close up clone eye looking robotic slightly" },
  { kr: "찾았다.", en: "man eyes wide discovering a clue dark room" },
  { kr: "그는 특정 시간마다 어딘가로 보고를 하고 있다.", en: "clone talking on a weird futuristic phone in an alley" },
  { kr: "배후가 있다는 뜻이야.", en: "dark shadowy figure looming behind the clone" },
  { kr: "단순한 도플갱어가 아니야.", en: "clone face glitching showing robotic parts underneath" },
  { kr: "누군가 나를 대체하려고 해.", en: "creepy hands pulling puppet strings above the clone" },
  { kr: "하지만 왜 하필 나지?", en: "man looking at a glowing USB drive in his hand" },
  { kr: "내가 가진 비밀 때문인가?", en: "close up USB drive glowing with neon light" },
  { kr: "그렇다면 그 비밀을 먼저 풀어야 해.", en: "man plugging USB into a dusty old laptop" },
  { kr: "녀석의 은신처를 찾아냈다.", en: "abandoned factory building at night raining" },
  { kr: "문을 부수고 들어갔다.", en: "man kicking open a rusty metal door action shot" },
  { kr: "거기서 본 것은... 충격적이었다.", en: "man looking horrified eyes wide open in disbelief" },

  { kr: "나와 똑같은 캡슐이 수백 개.", en: "giant warehouse filled with glowing green cloning vats with identical men inside" },
  { kr: "이건 복제 인간 공장이다.", en: "rows of clones attached to wires sci-fi horror" },
  { kr: "그는 첫 번째 성공작일 뿐.", en: "clone stepping out of a vat covered in slime" },
  { kr: "그가 내 등 뒤에서 총을 겨눴다.", en: "clone holding a gun to the real man's head from behind" },
  { kr: "진짜는 중요하지 않아. 살아남는 게 진짜지.", en: "clone smirking evil look holding gun" },
  { kr: "나는 조용히 웃었다.", en: "real man smiling confidently despite the gun" },
  { kr: "그건 네 생각이고.", en: "real man pressing a hidden button on a remote" },
  { kr: "나에게는 진짜만 아는 비밀번호가 있다.", en: "computer screen showing self-destruct sequence initiated" },
  { kr: "자폭 시스템 가동.", en: "red alarm lights flashing in the factory" },
  { kr: "그의 눈이 공포로 물들었다.", en: "clone looking terrified dropping the gun" },
  { kr: "모든 것을 끝낼 시간이다.", en: "massive explosion engulfing the clone factory cinematic" },
  { kr: "카피 캣의 최후.", en: "burning clone face melting away" },
  { kr: "나는 내 자리를 되찾을 것이다.", en: "man walking away from the explosion looking badass" },
  { kr: "어떤 대가를 치르더라도.", en: "man looking at the city skyline determined dark aesthetic" }
];

const abyssData = [
  { kr: "심연의 문이 열렸다.", en: "massive dark glowing gate opening underground scary" },
  { kr: "봉인이 풀리는 소리.", en: "glowing magical chains breaking and shattering" },
  { kr: "대지가 흔들리고 룬이 피로 물든다.", en: "ground cracking red glowing runes bleeding" },
  { kr: "천 년의 침묵이 깨졌다.", en: "ancient dark tomb opening dust flying" },
  { kr: "나는 마지막 파수꾼.", en: "lonely knight standing in dark holding a glowing sword" },
  { kr: "이 검은 물결을 막아야만 한다.", en: "knight facing a massive wave of dark shadow monsters" },
  { kr: "하지만 혼자서는 역부족이다.", en: "knight looking overwhelmed by the sheer number of enemies" },
  { kr: "악몽의 피조물들이 기어나온다.", en: "horrifying monsters crawling out of the abyss" },
  { kr: "그들의 울음소리가 영혼을 갉아먹는다.", en: "monsters screaming glowing red eyes dark smoke" },
  { kr: "두려움에 떨 틈이 없다.", en: "knight gripping his sword tightly determined eyes" },
  { kr: "검을 쥐고 일어선다.", en: "knight standing up from one knee sword glowing bright blue" },
  { kr: "빛은 이미 사라진 지 오래.", en: "pitch black cave with only the sword providing light" },
  { kr: "어둠 속에서 길을 찾아야 해.", en: "knight walking carefully into the dark abyss" },
  { kr: "심연의 심장부로 간다.", en: "deep underground cavern with a glowing red core" },

  { kr: "이곳의 공기는 독과 같다.", en: "green toxic gas floating in the dark cavern" },
  { kr: "숨을 쉴 때마다 폐가 타들어간다.", en: "knight coughing holding his chest in pain" },
  { kr: "과거의 망령들이 속삭인다.", en: "ghostly faces floating around the knight whispering" },
  { kr: "포기해라. 넌 아무것도 구할 수 없다.", en: "evil ghost whispering into the knight's ear" },
  { kr: "그들의 목소리는 달콤하지만 치명적이다.", en: "beautiful but scary ghost woman trying to seduce the knight" },
  { kr: "환상에 빠지면 영원히 길을 잃는다.", en: "knight closing his eyes shaking his head trying to focus" },
  { kr: "정신을 똑바로 차려야 해.", en: "knight slapping his own face to wake up" },
  { kr: "고대의 방벽이 눈앞에 보인다.", en: "massive ancient stone wall with glowing blue runes" },
  { kr: "하지만 이미 반쯤 파괴되었다.", en: "stone wall crumbling dark monsters breaking through" },
  { kr: "이곳을 뚫리면 세계가 끝난다.", en: "vision of a beautiful city burning in dark fire" },
  { kr: "괴물들이 몰려온다.", en: "horde of dark beasts charging at the knight" },
  { kr: "피와 살육의 시간.", en: "knight swinging his glowing sword cutting through monsters blood splashing" },
  { kr: "내 검이 검은 피로 물든다.", en: "close up sword covered in black monster blood" },
  { kr: "아직 쓰러질 수 없어.", en: "knight heavily wounded but standing strong" },

  { kr: "끝없는 전투.", en: "piles of dead monsters knight breathing heavily" },
  { kr: "상처가 아물 새가 없다.", en: "knight bleeding from his armor looking tired" },
  { kr: "하지만 적들의 수가 줄어들지 않는다.", en: "even more monsters appearing from the shadows" },
  { kr: "저 멀리, 심연의 군주가 모습을 드러낸다.", en: "gigantic terrifying demon lord rising from the dark core" },
  { kr: "압도적인 절망.", en: "knight looking up at the massive demon feeling tiny" },
  { kr: "그의 시선이 닿는 곳마다 생명이 죽어간다.", en: "demon looking down plants and stones turning to ash" },
  { kr: "이게 신의 힘인가?", en: "demon lord radiating dark terrifying energy" },
  { kr: "아니, 이건 재앙일 뿐이다.", en: "knight glaring at the demon with hatred" },
  { kr: "내 안에 잠든 룬의 힘을 개방할 때가 왔다.", en: "knight glowing with intense blue magical energy runes appearing on his skin" },
  { kr: "내 목숨을 대가로.", en: "knight's eyes glowing bright blue sacrificing his life force" },
  { kr: "마지막 방어선은 나 자신이다.", en: "knight standing alone blocking the path of the demon" },
  { kr: "군주가 포효하며 돌진해온다.", en: "massive demon roaring shooting dark fire" },
  { kr: "나도 검을 치켜들고 맞선다.", en: "knight charging forward with a giant glowing sword" },
  { kr: "세상의 운명이 걸린 일격.", en: "epic clash between dark demon and glowing knight explosion of light" },

  { kr: "검과 검이 부딪히는 굉음.", en: "sparks flying from massive weapon clash shockwave" },
  { kr: "빛과 어둠이 충돌한다.", en: "half the screen bright blue light half pure dark fire" },
  { kr: "내 영혼이 타들어가는 고통.", en: "knight screaming in pain body turning into glowing ash" },
  { kr: "하지만 물러설 수 없다.", en: "knight pushing the sword deeper into the demon" },
  { kr: "모든 힘을 쏟아붓는다.", en: "blinding explosion of pure white light" },
  { kr: "빛의 폭발.", en: "entire cavern consumed by white purifying light" },
  { kr: "군주의 비명소리가 울려 퍼진다.", en: "demon disintegrating screaming in agony" },
  { kr: "그리고 찾아온 적막.", en: "empty silent cavern dust settling" },
  { kr: "내가 해낸 건가?", en: "knight lying on the ground looking at the ceiling" },
  { kr: "시야가 흐려진다.", en: "blurry vision of the cavern roof fading to black" },
  { kr: "봉인이 다시 닫히는 소리가 들린다.", en: "ancient gate closing glowing runes restoring themselves" },
  { kr: "이제 쉴 수 있겠군.", en: "knight closing his eyes peaceful expression" },
  { kr: "나의 임무는 끝났다.", en: "broken glowing sword stuck in the ground memorial" },
  { kr: "심연의 파수꾼, 영면을 맞이하다.", en: "beautiful serene glowing grave in the dark cave ending" }
];

const joseonData = [
  { kr: "서기 2099년, 신 조선.", en: "futuristic joseon dynasty city cyberpunk neon traditional korean architecture" },
  { kr: "궁궐 위로 네온사인이 반짝인다.", en: "korean royal palace with bright neon holograms cyberpunk" },
  { kr: "전통과 미래가 기괴하게 얽힌 도시.", en: "flying cars over traditional korean hanok houses rain" },
  { kr: "나는 왕실 비밀 호위무사, 이안.", en: "cool korean swordsman wearing high tech hanbok standing in rain" },
  { kr: "사이버네틱스 의수를 단 검객이다.", en: "close up glowing robotic cyborg arm holding a traditional sword" },
  { kr: "오늘 밤, 은밀한 명이 떨어졌다.", en: "king sitting on throne in cyberpunk palace giving orders" },
  { kr: "반정 세력이 궐을 습격할 것이다.", en: "shadowy figures running across rooftops at night" },
  { kr: "그들을 막아야 한다.", en: "swordsman looking determined drawing his blade" },
  { kr: "어둠 속에서 사이보그 닌자들이 나타났다.", en: "cyborg ninjas with glowing red eyes dropping from the ceiling" },
  { kr: "차갑게 빛나는 레이저 검.", en: "neon laser swords glowing in the dark" },
  { kr: "내 검이 먼저 움직였다.", en: "swordsman dashing forward fast motion blur action" },
  { kr: "금속이 부딪히는 소리.", en: "two swords clashing sparks flying intense" },
  { kr: "피 대신 스파크가 튄다.", en: "cyborg ninja getting slashed electrical sparks flying instead of blood" },
  { kr: "조선의 밤이 뜨거워진다.", en: "epic sword fight in a burning traditional courtyard" },

  { kr: "적들의 움직임이 심상치 않다.", en: "swordsman looking around suspiciously at fallen enemies" },
  { kr: "이건 단순한 반정이 아니야.", en: "finding a strange high tech device on the enemy body" },
  { kr: "누군가 타임머신 코어를 노리고 있다.", en: "glowing blue time machine core in a high tech lab" },
  { kr: "과거를 바꾸려는 수작인가?", en: "hologram showing historical timeline being altered" },
  { kr: "절대 허락할 수 없다.", en: "swordsman running fast through futuristic palace corridors" },
  { kr: "나는 코어가 있는 지하 연구소로 향했다.", en: "dark underground lab with glowing blue lights" },
  { kr: "연구소는 이미 쑥대밭이 되어 있었다.", en: "destroyed lab broken glass dead scientists" },
  { kr: "적의 수장이 코어를 훔쳐 달아나고 있다.", en: "villain running away holding the glowing blue core" },
  { kr: "거기 서라!", en: "swordsman shouting pointing his sword at the villain" },
  { kr: "그가 차원 문을 열었다.", en: "villain opening a glowing swirling time portal" },
  { kr: "놓칠 수 없다.", en: "swordsman leaping into the air towards the portal" },
  { kr: "나도 몸을 날려 차원 문으로 뛰어들었다.", en: "swordsman diving into the glowing time portal" },
  { kr: "시공간이 왜곡되는 감각.", en: "trippy abstract tunnel of light time travel effect" },
  { kr: "어디로 가는 거지?", en: "swordsman floating in a void of clocks and stars" },

  { kr: "눈을 떠보니, 익숙하면서도 낯선 풍경.", en: "swordsman landing on a dirt road in a historical village" },
  { kr: "이곳은... 1899년의 한양?", en: "old korean city hanyang 1899 historical setting" },
  { kr: "시간 여행을 해버렸다.", en: "swordsman looking at his robotic arm in a primitive village" },
  { kr: "적의 수장이 역사를 조작하려 하고 있다.", en: "villain sneaking towards the royal palace in the past" },
  { kr: "빨리 그를 막아야 해.", en: "swordsman running through crowded historical marketplace" },
  { kr: "사이버네틱스 의수를 숨기고 옷을 갈아입었다.", en: "swordsman wearing a traditional gat hat hiding his robotic arm" },
  { kr: "구한말의 혼란스러운 거리.", en: "historical korean street with people in old clothes" },
  { kr: "적을 찾기 위해 정보망을 가동했다.", en: "swordsman using a futuristic monocle scanning the crowd" },
  { kr: "내장된 칩이 신호를 잡아냈다.", en: "monocle screen showing a red target locking on" },
  { kr: "놈은 고종 황제 근처에 있다.", en: "villain standing near the king in a historical courtyard" },
  { kr: "암살하려는 건가!", en: "villain pulling out a futuristic laser gun in the past" },
  { kr: "궁궐로 잠입했다.", en: "swordsman jumping over the palace wall gracefully" },
  { kr: "긴박한 추격전.", en: "swordsman chasing the villain across the palace tiled roofs" },
  { kr: "놈과 다시 마주쳤다.", en: "swordsman and villain facing off on a roof under the full moon" },

  { kr: "과거의 궁궐에서 벌어지는 미래의 전투.", en: "laser gun shooting at sword on an old korean roof" },
  { kr: "내 검과 놈의 총이 부딪힌다.", en: "sword deflecting laser beam epic action" },
  { kr: "역사를 지키기 위한 사투.", en: "intense close combat swordsman pushing the villain back" },
  { kr: "내가 지면 조선의 미래가 사라진다.", en: "vision of the cyberpunk city fading away into dust" },
  { kr: "모든 에너지를 검에 집중했다.", en: "robotic arm glowing with massive energy channeling into sword" },
  { kr: "단칼에 놈의 코어를 파괴했다.", en: "swordsman slashing the glowing blue core in half explosion" },
  { kr: "놈은 재가 되어 사라졌다.", en: "villain screaming as he turns into temporal dust" },
  { kr: "하지만 차원 문이 닫히고 있다.", en: "time portal shrinking fast in the sky" },
  { kr: "돌아가야 해.", en: "swordsman jumping high towards the shrinking portal" },
  { kr: "마지막 힘을 쥐어짜 차원 문으로 몸을 던졌다.", en: "swordsman barely making it through the portal as it closes" },
  { kr: "다시 2099년의 네온사인.", en: "swordsman crashing onto the floor of the cyberpunk lab" },
  { kr: "역사는 무사히 지켜졌다.", en: "swordsman looking out the window at the intact cyberpunk city" },
  { kr: "나는 호위무사.", en: "swordsman sheathing his sword looking cool" },
  { kr: "시공간을 넘나드는 그림자.", en: "swordsman silhouette against neon skyline ending" }
];

const sfData = [
  { kr: "네온사인이 비추는 젖은 아스팔트.", en: "wet asphalt reflecting neon lights cyberpunk city rain" },
  { kr: "이 도시는 언제나 불길한 냄새가 난다.", en: "dark alleyway trash cans glowing vending machine" },
  { kr: "내 이름은 케이.", en: "cool cyber hacker guy smoking a cigarette in the rain" },
  { kr: "오늘도 누군가의 뒷조사를 한다.", en: "hacker looking at holographic screens in a dark room" },
  { kr: "의뢰인은 정체를 숨긴 기업의 간부.", en: "shadowy corporate executive in a luxury penthouse" },
  { kr: "간단한 일이라고 했다.", en: "briefcase full of glowing digital credits on a table" },
  { kr: "하지만 이 바닥에 간단한 일은 없다.", en: "hacker loading a futuristic pistol looking serious" },
  { kr: "목표물의 흔적을 쫓아 뒷골목으로 들어섰다.", en: "hacker walking down a dangerous neon lit slum street" },
  { kr: "드론의 감시망을 피해야 한다.", en: "police drone with red scanning light searching the alley" },
  { kr: "해킹 디바이스를 꺼냈다.", en: "close up hand holding a glowing hacking gadget" },
  { kr: "보안 코드를 우회하는 데 성공.", en: "gadget screen showing access granted green text" },
  { kr: "안으로 진입했다.", en: "hacker sneaking into a high tech corporate facility" },
  { kr: "적막한 복도.", en: "empty white sterile hallway with glowing lights" },
  { kr: "뭔가 잘못되었다는 직감이 든다.", en: "hacker stopping looking around nervously" },

  { kr: "바닥에 쓰러진 경비원들.", en: "dead security guards on the floor blood and sparks" },
  { kr: "누군가 나보다 먼저 왔다.", en: "hacker looking at footprints in the blood" },
  { kr: "목표물은 이미 죽어 있었다.", en: "target scientist dead in a chair with a hole in his head" },
  { kr: "함정이다!", en: "hacker eyes wide realizing it's a trap red emergency lights turn on" },
  { kr: "사이렌이 울리기 시작했다.", en: "spinning red alarm lights flashing warning" },
  { kr: "무장한 기업의 사병들이 몰려온다.", en: "squad of heavy armored corporate soldiers running down hall" },
  { kr: "도망칠 곳이 없다.", en: "hacker cornered in a room soldiers aiming guns" },
  { kr: "총격전이 시작되었다.", en: "hacker diving behind a desk bullets flying everywhere" },
  { kr: "레이저가 귓가를 스친다.", en: "red laser beam barely missing hacker's face" },
  { kr: "나는 연막탄을 터뜨렸다.", en: "hacker throwing a smoke grenade thick white smoke" },
  { kr: "혼란을 틈타 창문으로 뛰어내렸다.", en: "hacker crashing through a glass window falling" },
  { kr: "플라잉 카의 지붕 위로 착지.", en: "hacker landing hard on the roof of a flying car mid air" },
  { kr: "거친 추격전.", en: "flying car speeding through neon city police cars chasing" },
  { kr: "어떻게든 살아남아야 해.", en: "hacker holding onto the flying car dodging laser fire" },

  { kr: "가까스로 추격을 따돌렸다.", en: "flying car hiding in a dark foggy underbridge" },
  { kr: "하지만 상처가 깊다.", en: "hacker holding a bleeding wound on his side" },
  { kr: "은신처로 돌아가 데이터를 분석했다.", en: "hacker sitting at computer bandaged up typing" },
  { kr: "죽은 목표물이 남긴 암호화된 파일.", en: "computer screen showing a locked glowing file icon" },
  { kr: "이게 대체 뭐길래 나를 함정에 빠뜨렸지?", en: "hacker looking confused and angry at the screen" },
  { kr: "파일의 압축을 풀었다.", en: "progress bar loading on futuristic UI" },
  { kr: "이건... 기업의 생체 실험 데이터다.", en: "horrifying photos of human experiments in tubes on screen" },
  { kr: "수많은 사람들의 희생.", en: "hacker looking shocked hands trembling" },
  { kr: "이걸 세상에 공개해야 해.", en: "hacker glaring at the screen with justice" },
  { kr: "하지만 내 목숨이 위험해질 거다.", en: "hacker looking at his gun on the table" },
  { kr: "갈등하는 나 자신.", en: "hacker reflecting in a mirror looking conflicted" },
  { kr: "어떻게 할 것인가.", en: "close up hacker's eyes intense thought" },
  { kr: "비가 다시 내리기 시작한다.", en: "rain washing against the dirty apartment window" },
  { kr: "선택의 시간이다.", en: "hacker pressing the upload button on keyboard" },

  { kr: "나는 데이터를 네트워크에 전송했다.", en: "global map showing data spreading everywhere green lines" },
  { kr: "이제 돌이킬 수 없다.", en: "news broadcast on a giant billboard exposing the corporation" },
  { kr: "기업의 암살자들이 곧 찾아올 것이다.", en: "heavily armed cyborg assassins walking up the stairs" },
  { kr: "내 총의 탄창을 확인했다.", en: "hacker reloading his futuristic pistol click sound" },
  { kr: "마지막 전투가 될 것이다.", en: "hacker standing in the middle of room waiting" },
  { kr: "문이 부서지는 소리.", en: "door exploding inward smoke filling the room" },
  { kr: "들어와라, 이 쓰레기들아.", en: "hacker aiming his gun into the smoke grinning" },
  { kr: "방아쇠를 당겼다.", en: "muzzle flash from the gun bright light" },
  { kr: "화약 냄새와 네온 불빛.", en: "epic gunfight in small apartment neon light shining through smoke" },
  { kr: "나의 이야기는 여기서 끝날지도 모른다.", en: "hacker getting shot but smiling" },
  { kr: "하지만 이 도시의 진실은 밝혀질 것이다.", en: "citizens rioting against the corporation outside" },
  { kr: "그것만으로도 충분해.", en: "hacker lying on floor looking peaceful at the neon ceiling" },
  { kr: "나노 싱귤래리티.", en: "title text style cyberpunk font nano singularity" },
  { kr: "특이점은 이미 시작되었다.", en: "city skyline with a massive glowing explosion ending" }
];

const WEBTOONS = [
  {
    id: "copycat",
    title: "카피 캣",
    author: "도플갱어",
    genre: "미스터리",
    rating: 4.7,
    theme: "미스터리",
    description: "어느 날 나타난 완벽한 나의 복제인간. 그가 내 자리를 차지하기 시작했다.",
    basePrompt: "korean webtoon style, mystery thriller, dark, suspenseful, highly detailed, cinematic",
    data: mysteryData
  },
  {
    id: "abyss-keeper",
    title: "심연의 파수꾼",
    author: "AI 판타지 봇",
    genre: "판타지",
    rating: 4.7,
    theme: "다크판타지",
    description: "심연의 문이 열리고 봉인이 약해진다. 파수꾼은 도시 아래의 룬을 따라 내려가, 잠든 존재를 깨우지 않기 위해 싸운다.",
    basePrompt: "korean webtoon style, dark fantasy, abyss, gothic, monsters, highly detailed, cinematic",
    data: abyssData
  },
  {
    id: "nano-singularity",
    title: "나노 싱귤래리티",
    author: "AI 오토마톤",
    genre: "SF",
    rating: 4.9,
    theme: "SF",
    description: "2077년 네오 서울, 특이점을 넘어선 나노 머신들의 반란과 이를 막으려는 마지막 해커의 사투.",
    basePrompt: "korean webtoon style, cyberpunk, neon city, highly detailed, cinematic",
    data: sfData
  },
  {
    id: "joseon-future-2099",
    title: "조선 퓨처 2099",
    author: "타임 패러독스",
    genre: "판타지",
    rating: 4.8,
    theme: "조선",
    description: "과거와 미래가 융합된 2099년의 신 조선. 왕실 비밀 호위무사의 시간을 넘나드는 액션 활극.",
    basePrompt: "korean webtoon style, joseon dynasty mixed with cyberpunk, palace, sword fighter, highly detailed, cinematic",
    data: joseonData
  },
  {
    id: "signal-love-algorithm",
    title: "시그널 러브 알고리즘",
    author: "감성 AI",
    genre: "로맨스",
    rating: 4.8,
    theme: "로맨스",
    description: "퇴근길 카페에서 우연히 마주친 두 사람. 서로의 플레이리스트가 같은 순간, 관계는 천천히 알고리즘처럼 맞춰진다.",
    basePrompt: "korean webtoon style, romance, beautiful cafe, soft lighting, emotional, highly detailed, aesthetic",
    data: romanceData
  }
];

function generateUrl(basePrompt: string, englishScene: string, seed: number) {
  const prompt = `${basePrompt}, scene depicting: ${englishScene}, no text`;
  return `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?width=800&height=1200&nologo=true&seed=${seed}`;
}

async function downloadImage(url: string, dest: string, retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url);
      if (res.status === 200) {
        const buffer = await res.arrayBuffer();
        if (buffer.byteLength > 10000) {
          fs.writeFileSync(dest, Buffer.from(buffer));
          return true;
        }
      }
    } catch (e) {
      // ignore and retry
    }
    await new Promise(r => setTimeout(r, 1000));
  }
  return false;
}

// Fallback image just in case
const FALLBACK = "https://images.unsplash.com/photo-1518104593124-ac2e82a5eb9b?q=80&w=800";

async function processWebtoon(webtoon: any) {
  const { id, basePrompt, data, ...meta } = webtoon;
  const baseSeed = webtoon.title.length * 10000;
  
  const outDir = path.join(process.cwd(), 'public', 'ai-webtoons', id);
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  console.log(`\n===========================================`);
  console.log(`Starting physically download for: ${meta.title}`);
  console.log(`===========================================`);

  // Download thumbnail and banner
  const thumbUrl = generateUrl(basePrompt, data[0].en, baseSeed);
  const bannerUrl = generateUrl(basePrompt, data[7].en, baseSeed + 1) + "&width=1920&height=1080";
  
  await downloadImage(thumbUrl, path.join(outDir, 'thumbnail.jpg'));
  await downloadImage(bannerUrl, path.join(outDir, 'banner.jpg'));

  // Update Firestore metadata first
  await setDoc(doc(db, 'webtoons', id), {
    ...meta,
    thumbnail: `/ai-webtoons/${id}/thumbnail.jpg`,
    banner: `/ai-webtoons/${id}/banner.jpg`,
    status: 'approved',
    isNew: true,
    episodeCount: 1,
    createdAt: serverTimestamp(),
    approvedAt: serverTimestamp()
  });

  const cuts = [];
  
  // Download 70 cuts sequentially but with slight concurrency to speed up
  const CONCURRENCY = 4;
  for (let i = 0; i < 70; i += CONCURRENCY) {
    const chunk = [];
    for (let j = 0; j < CONCURRENCY; j++) {
      if (i + j < 70) chunk.push(i + j);
    }
    
    await Promise.all(chunk.map(async (idx) => {
      const line = data[idx % data.length];
      const url = generateUrl(basePrompt, line.en, baseSeed + 100 + idx);
      const destFile = `cut_${idx}.jpg`;
      const destPath = path.join(outDir, destFile);
      
      const success = await downloadImage(url, destPath, 5);
      if (!success) {
        console.log(`Failed to download cut ${idx}. Using fallback.`);
        const res = await fetch(FALLBACK);
        const buf = await res.arrayBuffer();
        fs.writeFileSync(destPath, Buffer.from(buf));
      }
      
      cuts[idx] = {
        imageUrl: `/ai-webtoons/${id}/${destFile}`,
        dialogue: line.kr
      };
      process.stdout.write(`.`);
    }));
  }
  console.log(`\n[OK] Downloaded 70 cuts for ${meta.title}`);

  // Save to episode
  const episodesRef = collection(db, 'webtoons', id, 'episodes');
  await setDoc(doc(episodesRef, '1'), {
    vol: 1,
    title: `${meta.title} 1화`,
    cuts: cuts.filter(Boolean),
    createdAt: serverTimestamp()
  });
}

async function run() {
  console.log("Wiping current webtoons to ensure clean DB...");
  const wSnap = await getDocs(collection(db, 'webtoons'));
  for (const w of wSnap.docs) {
    const epSnap = await getDocs(collection(db, 'webtoons', w.id, 'episodes'));
    for (const e of epSnap.docs) await deleteDoc(e.ref);
    await deleteDoc(w.ref);
  }

  // Sequentially process webtoons to prevent getting IP banned completely
  for (const w of WEBTOONS) {
    await processWebtoon(w);
  }
  
  console.log("ALL 350 IMAGES PHYSICALLY DOWNLOADED AND SAVED TO DB.");
  process.exit(0);
}

run().catch(console.error);
