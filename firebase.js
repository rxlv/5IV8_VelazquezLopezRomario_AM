// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDyKQpu__L5JxUj-ljbMvG54XJo-dZhaV8",
  authDomain: "app1-dbd95.firebaseapp.com",
  projectId: "app1-dbd95",
  storageBucket: "app1-dbd95.firebasestorage.app",
  messagingSenderId: "171930626866",
  appId: "1:171930626866:web:c50bc8517d16df6f9c852b",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Auth
export const auth = getAuth(app);