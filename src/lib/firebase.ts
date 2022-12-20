// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyALv8c-_lut4-NJExgIXKmgRxz-CZHQjIU",
  authDomain: "canonforces.firebaseapp.com",
  projectId: "canonforces",
  storageBucket: "canonforces.appspot.com",
  messagingSenderId: "894877771650",
  appId: "1:894877771650:web:9d0e9241dbc9e6292a519b",
  measurementId: "G-J7XRTMN1JB",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
