import { initializeApp } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, deleteDoc } from 'firebase/firestore';

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

async function main() {
  const snap = await getDocs(collection(db, 'webtoons'));
  console.log(`Found ${snap.size} webtoons:`);
  for (const doc of snap.docs) {
    const data = doc.data();
    console.log(`- ${doc.id}: ${data.title}`);
    
    // check episodes
    const epSnap = await getDocs(collection(db, 'webtoons', doc.id, 'episodes'));
    console.log(`  -> ${epSnap.size} episodes`);
    for (const ep of epSnap.docs) {
      const epData = ep.data();
      const cuts = epData.cuts || [];
      console.log(`    -> Ep ${ep.id}: ${cuts.length} cuts`);
      if (cuts.length > 0) {
        console.log(`      Cut 0 Image: ${cuts[0].imageUrl}`);
      }
    }
  }
}

main().catch(console.error).then(() => process.exit(0));
