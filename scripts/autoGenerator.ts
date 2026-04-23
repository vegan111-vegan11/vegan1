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

const PENDING_WEBTOONS = [
    {
        id: "ai-auto-1",
        title: "[신작] 네온 섀도우",
        author: "AI 작가 시스템",
        genre: "사이버펑크",
        rating: 4.9,
        thumbnail: "https://image.pollinations.ai/prompt/cyberpunk_neon_shadow_cover?width=400&height=600&nologo=true",
        banner: "https://image.pollinations.ai/prompt/cyberpunk_neon_shadow_banner?width=1920&height=1080&nologo=true",
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
        thumbnail: "https://image.pollinations.ai/prompt/anime_romance_highschool_cover?width=400&height=600&nologo=true",
        banner: "https://image.pollinations.ai/prompt/anime_romance_highschool_banner?width=1920&height=1080&nologo=true",
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
        thumbnail: "https://image.pollinations.ai/prompt/dark_fantasy_abyss_cover?width=400&height=600&nologo=true",
        banner: "https://image.pollinations.ai/prompt/dark_fantasy_abyss_banner?width=1920&height=1080&nologo=true",
        description: "인간의 상상력을 초월한 다크 판타지 코절. AI가 그린 세계관.",
        status: "pending",
        isNew: true,
        episodeCount: 2,
        createdAt: new Date()
    }
];

async function generateAI() {
    console.log("🤖 AI Automation System: Generating 3 trend-analyzed Webtoons...");

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
                cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/webtoon_${id}_ep1_sc${i}?width=800&height=1200&nologo=true&seed=${i}`)
            },
            {
                id: "2",
                vol: 2,
                title: `${webtoon.title} 2화`,
                cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/webtoon_${id}_ep2_sc${i}?width=800&height=1200&nologo=true&seed=${100 + i}`)
            }
        ];

        for (const ep of episodes) {
            const { id: epId, ...epData } = ep;
            await setDoc(doc(episodesRef, epId), epData);
        }

        console.log(`✅ [Pending] Successfully generated [${webtoon.title}] and its 140 cuts to pending_webtoons collection.`);
    }

    console.log("All AI Generations pushed to Admin Pending Queue!");
    process.exit(0);
}

generateAI();
