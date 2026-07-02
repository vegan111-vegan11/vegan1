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
  const webtoonRef = doc(db, 'webtoons', webtoonId);
  
  await updateDoc(webtoonRef, {
    thumbnail: '/demo-cuts/cut1.jpg',
    banner: '/demo-cuts/cut2.jpg'
  });
  console.log('Fixed metadata images.');
  process.exit(0);
}

fix().catch(console.error);
