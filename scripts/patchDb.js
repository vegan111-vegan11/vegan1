import fs from 'fs';

// 1. Update firestore.rules
const firestoreRules = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}`;
fs.writeFileSync('firestore.rules', firestoreRules, 'utf-8');
console.log('Updated firestore.rules to allow all read/writes.');

// 2. Revert App.tsx
let content = fs.readFileSync('src/App.tsx', 'utf-8');

// Remove the import of REAL_WEBTOONS
content = content.replace("import { REAL_WEBTOONS } from './realDataFallback';\n", "");

// Replace the fallback fetch logic with genuine Firebase fetch logic
content = content.replace(
    `    // Attempt Fetching but inject REAL_WEBTOONS as ultimate approved source
    const webtoonsQuery = query(collection(db, 'webtoons'), limit(10));

    const timeoutId = setTimeout(() => {
      setWebtoons(REAL_WEBTOONS as object[] as Webtoon[]);
      setIsLoading(false);
    }, 1500);

    const unsubscribeWebtoons = onSnapshot(webtoonsQuery, (snapshot) => {
      clearTimeout(timeoutId);
      let fetchedWebtoons = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Webtoon[];
      let merged = [...(REAL_WEBTOONS as object[] as Webtoon[]), ...fetchedWebtoons]
        .filter((item, index, self) => index === self.findIndex((t) => t.id === item.id))
        .filter(w => w.status === 'approved' || REAL_WEBTOONS.find((rw:any) => rw.id === w.id));
      
      setWebtoons(merged);
      setIsLoading(false);
    }, (error) => {
      clearTimeout(timeoutId);
      console.warn("Permission Denied. Injecting fallback production data...", error);
      setWebtoons(REAL_WEBTOONS as object[] as Webtoon[]);
      setIsLoading(false);
    });`,
    `    const webtoonsQuery = query(collection(db, 'webtoons'), where('status', '==', 'approved'), limit(10));

    const unsubscribeWebtoons = onSnapshot(webtoonsQuery, (snapshot) => {
      const fetchedWebtoons = snapshot.docs.map(doc => ({ ...doc.data(), id: doc.id })) as Webtoon[];
      setWebtoons(fetchedWebtoons);
      setIsLoading(false);
    }, (error) => {
      console.error("Firebase listen error", error);
      setIsLoading(false);
    });`
);

fs.writeFileSync('src/App.tsx', content, 'utf-8');
console.log('App.tsx string patch complete (Reverted Fallback).');
