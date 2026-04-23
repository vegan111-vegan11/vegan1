export const REAL_WEBTOONS = [
    {
        id: "nano-singularity",
        title: "나노 싱귤래리티",
        author: "AI 오토마톤",
        genre: "SF",
        rating: 4.9,
        thumbnail: "https://image.pollinations.ai/prompt/cyberpunk_seoul_webtoon_cover_nano_singularity?width=400&height=600&nologo=true",
        banner: "https://image.pollinations.ai/prompt/cyberpunk_seoul_webtoon_banner_nano_singularity?width=1920&height=1080&nologo=true",
        description: "2077년 네오 서울, 특이점을 넘어선 나노 머신들의 반란과 이를 막으려는 마지막 해커의 사투.",
        status: "approved",
        isNew: true,
        episodes: [
            { vol: 1, title: "나노 싱귤래리티 1화", cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/webtoon_panel_nano_singularity_episode_1_scene_${i}?width=800&height=1200&nologo=true&seed=${i}`) },
            { vol: 2, title: "나노 싱귤래리티 2화", cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/webtoon_panel_nano_singularity_episode_2_scene_${i}?width=800&height=1200&nologo=true&seed=${100 + i}`) }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: "joseon-future-2099",
        title: "조선 퓨처 2099",
        author: "타임 패러독스",
        genre: "판타지",
        rating: 4.8,
        thumbnail: "https://image.pollinations.ai/prompt/korean_traditional_hanbok_neon_cyberpunk_cover?width=400&height=600&nologo=true",
        banner: "https://image.pollinations.ai/prompt/korean_traditional_hanbok_neon_cyberpunk_banner?width=1920&height=1080&nologo=true",
        description: "과거와 미래가 융합된 2099년의 신 조선. 왕실 비밀 호위무사의 시간을 넘나드는 액션 활극.",
        status: "approved",
        isHot: true,
        episodes: [
            { vol: 1, title: "조선 퓨처 2099 1화", cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/korean_hanbok_action_webtoon_episode_1_scene_${i}?width=800&height=1200&nologo=true&seed=${200 + i}`) },
            { vol: 2, title: "조선 퓨처 2099 2화", cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/korean_hanbok_action_webtoon_episode_2_scene_${i}?width=800&height=1200&nologo=true&seed=${300 + i}`) }
        ],
        createdAt: new Date().toISOString()
    },
    {
        id: "copycat",
        title: "카피 캣",
        author: "도플갱어",
        genre: "미스터리",
        rating: 4.7,
        thumbnail: "https://image.pollinations.ai/prompt/thriller_webtoon_cover_copycat_mirror?width=400&height=600&nologo=true",
        banner: "https://image.pollinations.ai/prompt/thriller_webtoon_banner_copycat_shadow?width=1920&height=1080&nologo=true",
        description: "어느 날 나타난 완벽한 나의 복제인간. 그가 내 자리를 차지하기 시작했다.",
        status: "approved",
        episodes: [
            { vol: 1, title: "카피 캣 1화", cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/thriller_webtoon_copycat_episode_1_scene_${i}?width=800&height=1200&nologo=true&seed=${400 + i}`) },
            { vol: 2, title: "카피 캣 2화", cuts: Array.from({ length: 70 }).map((_, i) => `https://image.pollinations.ai/prompt/thriller_webtoon_copycat_episode_2_scene_${i}?width=800&height=1200&nologo=true&seed=${500 + i}`) }
        ],
        createdAt: new Date().toISOString()
    }
];
