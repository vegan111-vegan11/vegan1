import { initializeApp } from 'firebase/app';
import { getFirestore, doc, updateDoc, getDoc } from 'firebase/firestore';

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

async function fix() {
  const webtoonId = 'neo-seoul-2099';
  const epRef = doc(db, 'webtoons', webtoonId, 'episodes', '1');
  
  const snap = await getDoc(epRef);
  if (!snap.exists()) {
    console.error('Episode not found');
    process.exit(1);
  }

  const data = snap.data();
  const cuts = data.cuts || [];
  
  for (let i = 0; i < cuts.length; i++) {
    // We have 10 valid images in demo-cuts
    const validImageIndex = (i % 10) + 1;
    cuts[i].imageUrl = `/demo-cuts/cut${validImageIndex}.jpg`;
  }

  await updateDoc(epRef, { cuts });
  console.log('Fixed 70 cuts to use valid /demo-cuts/ images.');
  process.exit(0);
}

fix().catch(console.error);
