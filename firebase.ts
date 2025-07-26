// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDkFhifrO-4X-fiP5Lo0-HPX73LkKnY4-U",
  authDomain: "cwtracker-2d403.firebaseapp.com",
  projectId: "cwtracker-2d403",
  storageBucket: "cwtracker-2d403.firebasestorage.app",
  messagingSenderId: "247189571504",
  appId: "1:247189571504:web:64551dc7aa91733f5c7875",
  measurementId: "G-CD8KQXG2P4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;