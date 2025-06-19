import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8ZfA4MdXdeF0hZbECrJ0EehQ7Bz-eD8s",
  authDomain: "receipt-dang.firebaseapp.com",
  projectId: "receipt-dang",
  storageBucket: "receipt-dang.firebasestorage.app",
  messagingSenderId: "111937372224",
  appId: "1:111937372224:web:1f180d3e509db4db355fa5",
  measurementId: "G-R5383M9HN9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics and export it conditionally
let analytics = null;
if (typeof window !== 'undefined') {
  analytics = getAnalytics(app);
}

// Initialize Firestore
const db = getFirestore(app);

export { app, analytics, db }; 