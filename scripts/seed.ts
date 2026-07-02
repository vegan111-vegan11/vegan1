import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, collection } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCtYG4Lnuq4XYtx_1AZpWs5pDHCJNKA4hk",
    authDomain: "vegan1.firebaseapp.com",
    projectId: "vegan1",
    storageBucket: "vegan1.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CYBERPUNK_CUTS = [
    "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=800",
    "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=800",
    "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=800",
    "https://images.unsplash.com/photo-1542451313056-b7f3299c855a?q=80&w=800",
    "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=800",
    "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=800",
    "https://images.unsplash.com/photo-1506452814349-f02aead87da3?q=80&w=800",
    "https://images.unsplash.com/photo-1618336336306-038234debd34?q=80&w=800",
    "https://images.unsplash.com/photo-1533038590840-1c798b39d6b8?q=80&w=800",
    "https://images.unsplash.com/photo-1586716167814-ffae91e4f4fb?q=80&w=800"
];

const WEBTOONS = [
    {
        id: "nano-singularity",
        title: "나노 싱귤래리티",
        author: "AI 오토마톤",
        genre: "SF",
        rating: 4.9,
        thumbnail: CYBERPUNK_CUTS[0],
        banner: "https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=1920",
        description: "2077년 네오 서울, 특이점을 넘어선 나노 머신들의 반란과 이를 막으려는 마지막 해커의 사투.",
        status: "approved",
        isNew: true,
        createdAt: new Date()
    },
    {
        id: "joseon-future-2099",
        title: "조선 퓨처 2099",
        author: "타임 패러독스",
        genre: "판타지",
        rating: 4.8,
        thumbnail: CYBERPUNK_CUTS[1],
        banner: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1920",
        description: "과거와 미래가 융합된 2099년의 신 조선. 왕실 비밀 호위무사의 시간을 넘나드는 액션 활극.",
        status: "approved",
        isHot: true,
        createdAt: new Date()
    },
    {
        id: "copycat",
        title: "카피 캣",
        author: "도플갱어",
        genre: "미스터리",
        rating: 4.7,
        thumbnail: CYBERPUNK_CUTS[2],
        banner: "https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1920",
        description: "어느 날 나타난 완벽한 나의 복제인간. 그가 내 자리를 차지하기 시작했다.",
        status: "approved",
        createdAt: new Date()
    }
];

async function seed() {
    console.log("Seeding Database with 3 Stable Premium CDN Cyber webtoons...");

    for (const webtoon of WEBTOONS) {
        const { id, ...data } = webtoon;

        const episodes = [
            {
                id: "1",
                vol: 1,
                title: `${webtoon.title} 1화`,
                cuts: Array.from({ length: 70 }).map((_, i) => CYBERPUNK_CUTS[i % CYBERPUNK_CUTS.length])
            },
            {
                id: "2",
                vol: 2,
                title: `${webtoon.title} 2화`,
                cuts: Array.from({ length: 70 }).map((_, i) => CYBERPUNK_CUTS[(i + 3) % CYBERPUNK_CUTS.length])
            }
        ];

        // 1. Set main Webtoon details
        await setDoc(doc(db, 'webtoons', id), {
            ...data,
            episodeCount: 2
        });

        // 2. Set Subcollection for massive cuts payload
        const episodesRef = collection(db, 'webtoons', id, 'episodes');

        for (const ep of episodes) {
            const { id: epId, ...epData } = ep;
            await setDoc(doc(episodesRef, epId), epData);
        }

        console.log(`[Success] Seeded [${webtoon.title}] main doc + 2 subcollection episodes (140 cuts total).`);
    }

    console.log("Super Stable CDN Seed completely finished! All 420 Cuts injected.");
    process.exit(0);
}

seed();
