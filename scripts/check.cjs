// scripts/check.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs } = require('firebase/firestore');

// 감독님 프로젝트 설정 (이미지에서 확인한 값 그대로입니다)
const firebaseConfig = {
  apiKey: "AIzaSyCtYG4Lnuq4XYtx_1AZpWs5pDHCJNKA4hk",
  authDomain: "vegan1.firebaseapp.com",
  projectId: "vegan1",
  storageBucket: "vegan1.appspot.com",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkDB() {
  console.log("🔍 파이어베이스 'pending_webtoons' 금고 여는 중...");

  try {
    const querySnapshot = await getDocs(collection(db, "pending_webtoons"));

    if (querySnapshot.empty) {
      console.log("⚠️ 텅 비어있습니다. 데이터가 아직 안 들어갔나 봐요!");
      return;
    }

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log(`\n📌 [제목]: ${data.title}`);
      console.log(`   - 장르: ${data.genre}`);
      console.log(`   - 요약: ${data.synopsis}`);
      console.log(`   - ID: ${doc.id}`);
      console.log("------------------------------------------");
    });

    console.log("\n✅ 이상 총 " + querySnapshot.size + "개의 신작이 DB에 잘 들어있습니다!");
  } catch (error) {
    console.error("❌ 읽기 실패! 이유:", error.message);
  }
  process.exit(0);
}

checkDB();