import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyCtYG4Lnuq4XYtx_1AZpWs5pDHCJNKA4hk",
    authDomain: "vegan1.firebaseapp.com",
    projectId: "vegan1",
    storageBucket: "vegan1.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

console.log("Auto Generator Backend started. AI will periodically analyze trends and generate new webtoons.");

// Simulate backend polling every 10 seconds for demo purposes
setInterval(async () => {
    const timestamp = Date.now();
    const id = `auto-gen-${timestamp}`;
    const trendingTitle = `트렌드 신작 ${timestamp.toString().slice(-4)}`;

    const cuts = Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/trending_ai_webtoon_panel_${i}?width=800&height=1200&nologo=true&seed=${i}`);

    await setDoc(doc(db, 'webtoons', id), {
        title: trendingTitle,
        author: "AI 트렌드 봇",
        genre: "SF",
        rating: 0,
        thumbnail: `https://image.pollinations.ai/prompt/modern_webtoon_cover_${timestamp}?width=400&height=600&nologo=true`,
        banner: `https://image.pollinations.ai/prompt/modern_webtoon_banner_${timestamp}?width=1920&height=1080&nologo=true`,
        description: "AI가 실시간 트렌드를 분석하여 스토리를 구성하고 자동 생성한 신작입니다.",
        status: "pending", // Administrator must manually approve it to status: 'approved'
        isNew: true,
        createdAt: new Date(),
        episodes: [{ vol: 1, title: `${trendingTitle} 1화`, cuts }],
        episodeCount: 1
    });

    console.log(`[${new Date().toISOString()}] Generated new webtoon: '${trendingTitle}' with pending status. Waiting for admin approval.`);
}, 10000); // For demo, we run it every 10 seconds. In reality, it would be 24h cron jobs.
