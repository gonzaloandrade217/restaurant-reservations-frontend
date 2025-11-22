import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAlKIjWadQ1fUI4XIGNhFlwJGfF0Cd2FxY",
  authDomain: "reserva-restaurante-9c803.firebaseapp.com",
  projectId: "reserva-restaurante-9c803",
  storageBucket: "reserva-restaurante-9c803.firebasestorage.app",
  messagingSenderId: "225476394028",
  appId: "1:225476394028:web:00665046b0e424c117e589",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
