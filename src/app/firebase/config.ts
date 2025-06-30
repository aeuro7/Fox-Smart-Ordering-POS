import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBiUI9pxXElGXfrHKDyPYDUJ6yeTmmpPMU",
  authDomain: "foxy-4b56b.firebaseapp.com",
  projectId: "foxy-4b56b",
  storageBucket: "foxy-4b56b.appspot.com",
  messagingSenderId: "448207274113",
  appId: "1:448207274113:web:2ee4824e4bf8abc56e4d80",
  measurementId: "G-LFN03Q99J0"
};

// Initialize Firebase (ป้องกันการ initialize ซ้ำใน Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Analytics (รองรับเฉพาะ client-side)
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
if (typeof window !== "undefined") {
  isSupported().then((yes) => {
    if (yes) analytics = getAnalytics(app);
  });
}

const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, analytics, auth }; 