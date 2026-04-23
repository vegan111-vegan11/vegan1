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

const allUrls = [...ROMANCE_IMAGES, ...MYSTERY_IMAGES, ...FANTASY_IMAGES, ...JOSEON_IMAGES];

async function check() {
  const bad = [];
  for (const url of allUrls) {
    const res = await fetch(url, { method: 'HEAD' });
    if (res.status !== 200) {
      console.log(`BAD URL (${res.status}): ${url}`);
      bad.push(url);
    }
  }
  console.log(`Found ${bad.length} bad URLs.`);
}

check();
