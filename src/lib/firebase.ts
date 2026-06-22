import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyB2Ko7cyBS0RZ4eeLFr__jGp8orU1t6Tko",
  authDomain: "hazel-linker-vcf5x.firebaseapp.com",
  projectId: "hazel-linker-vcf5x",
  storageBucket: "hazel-linker-vcf5x.firebasestorage.app",
  messagingSenderId: "246333909820",
  appId: "1:246333909820:web:2cf0b2d7917e3a30530c39"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with specific database ID
export const db = getFirestore(app, "ai-studio-919026ad-1b03-4742-93a8-43df018145c1");

export { doc, getDoc, setDoc, onSnapshot };
