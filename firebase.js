import { initializeApp } from "firebase/app";
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyDH8v8gy6ccRMeROnlArJyDuFyfLXwUA4k",
    authDomain: "aloha-b9fba.firebaseapp.com",
    projectId: "aloha-b9fba",
    storageBucket: "aloha-b9fba.appspot.com",
    messagingSenderId: "1084591949080",
    appId: "1:1084591949080:web:239890950d6b327fb7ca6d"
  };

  
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

export { db };