// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDWXFPBxVeg3NF1qDWdesFiKfklM7VqDjQ",
  authDomain: "pregnant-timer.firebaseapp.com",
  projectId: "pregnant-timer",
  storageBucket: "pregnant-timer.appspot.com",
  messagingSenderId: "814023251193",
  appId: "1:814023251193:web:a20665f3558b7af89afe28",
  measurementId: "G-E6103LMRD4"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);

export const auth = getAuth(app);




