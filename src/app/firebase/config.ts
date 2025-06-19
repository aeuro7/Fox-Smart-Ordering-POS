import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB8ZfA4MdXdeF0hZbECrJ0EehQ7Bz-eD8s",
  authDomain: "receipt-dang.firebaseapp.com",
  projectId: "receipt-dang",
  storageBucket: "receipt-dang.firebasestorage.app",
  messagingSenderId: "111937372224",
  appId: "1:111937372224:web:f9bfd602273f51bf355fa5",
  measurementId: "G-7X6ZE0VZNN"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics only in browser environment
let analytics = null;
if (typeof window !== 'undefined') {
  isSupported().then(yes => yes && (analytics = getAnalytics(app)));
}

const db = getFirestore(app);

export { db, analytics }; 