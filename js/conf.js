// conf.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.6.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAMDeuNc7wvxbuCiX1mcM6SFNckofh0d8g",
    authDomain: "wedsite-d28b6.firebaseapp.com",
    projectId: "wedsite-d28b6",
    storageBucket: "wedsite-d28b6.firebasestorage.app",
    messagingSenderId: "895688883914",
    appId: "1:895688883914:web:755cba4660ae7640923e33",
    measurementId: "G-TW862FJ7JK"
};

// Init Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Cho file khác dùng
export { auth };
