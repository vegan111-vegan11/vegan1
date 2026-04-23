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

const PENDING_WEBTOONS = [
    {
        id: "ai-auto-1",
        title: "[신작] 네온 섀도우",
        author: "AI 작가 시스템",
        genre: "사이버펑크",
        rating: 4.9,
        thumbnail: CYBERPUNK_CUTS[3],
        banner: "https://images.unsplash.com/photo-1542451313056-b7f3299c855a?q=80&w=1920",
        description: "AI가 글로벌 트렌드(사이버펑크, 액션)를 파악해 자동 생성한 파일럿 프로젝트 1호.",
        status: "pending",
        isNew: true,
        episodeCount: 2,
        createdAt: new Date()
    },
    {
        id: "ai-auto-2",
        title: "[신작] 로맨스 팩토리",
        author: "감성 AI",
        genre: "로맨스",
        rating: 4.8,
        thumbnail: CYBERPUNK_CUTS[4],
        banner: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?q=80&w=1920",
        description: "전 세계 로맨스 독자들의 데이터를 수집해 완벽한 서사 구조로 자동 생성된 웹툰.",
        status: "pending",
        isNew: true,
        episodeCount: 2,
        createdAt: new Date()
    },
    {
        id: "ai-auto-3",
        title: "[신작] 심연의 파수꾼",
        author: "AI 판타지 봇",
        genre: "판타지",
        rating: 4.7,
        thumbnail: CYBERPUNK_CUTS[5],
        banner: "https://images.unsplash.com/photo-1500462918059-b1a0cb512f1d?q=80&w=1920",
        description: "인간의 상상력을 초월한 다크 판타지 코절. AI가 그린 세계관.",
        status: "pending",
        isNew: true,
        episodeCount: 2,
        createdAt: new Date()
    }
];

async function generateAI() {
    console.log("🤖 AI Automation System: Generating 3 trend-analyzed Webtoons using Stable CDNs...");

    for (const webtoon of PENDING_WEBTOONS) {
        const { id, ...data } = webtoon;

        // 1. Set to 'pending_webtoons'
        await setDoc(doc(db, 'pending_webtoons', id), {
            ...data
        });

        const episodesRef = collection(db, 'pending_webtoons', id, 'episodes');

        // 2. Generate exactly 2 episodes with 70 cuts
        const episodes = [
            {
                id: "1",
                vol: 1,
                title: `${webtoon.title} 1화`,
                cuts: Array.from({ length: 70 }).map((_, i) => CYBERPUNK_CUTS[(i + 4) % CYBERPUNK_CUTS.length])
            },
            {
                id: "2",
                vol: 2,
                title: `${webtoon.title} 2화`,
                cuts: Array.from({ length: 70 }).map((_, i) => CYBERPUNK_CUTS[(i + 6) % CYBERPUNK_CUTS.length])
            }
        ];

        for (const ep of episodes) {
            const { id: epId, ...epData } = ep;
            await setDoc(doc(episodesRef, epId), epData);
        }

        console.log(`✅ [Pending] Successfully generated [${webtoon.title}] and its 140 cuts to pending_webtoons collection.`);
    }

    console.log("All Stable AI Generations pushed to Admin Pending Queue!");
    process.exit(0);
}

generateAI();
