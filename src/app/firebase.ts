// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBC5XcvyFFuG5jRE-0op9YtnztMKSVGFjg",
  authDomain: "mumbai-keepsakes.firebaseapp.com",
  projectId: "mumbai-keepsakes",
  storageBucket: "mumbai-keepsakes.firebasestorage.app",
  messagingSenderId: "792659432818",
  appId: "1:792659432818:web:a46801c4dfa2aea68ff9eb"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const storage = getStorage(app);

export { db, storage, addDoc, collection, ref, uploadBytes, getDownloadURL };