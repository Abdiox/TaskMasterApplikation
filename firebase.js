import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
  apiKey: "AIzaSyBsdUxvhxKD8di-LTEzW4-3pTel5HYFKP4",
  authDomain: "task-manager-9b9c9.firebaseapp.com",
  projectId: "task-manager-9b9c9",
  storageBucket: "task-manager-9b9c9.firebasestorage.app",
  messagingSenderId: "449082078302",
  appId: "1:449082078302:web:e64043c83c0d185547b0cf",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage),
});
export { app, db, auth };
