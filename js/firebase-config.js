// Configuração do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit 
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";

// Configuração do Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAQ2M07WB7zVJiL02OtiYG-TFp3wdbrmVI",
    authDomain: "healthhub-2ff6e.firebaseapp.com",
    projectId: "healthhub-2ff6e",
    storageBucket: "healthhub-2ff6e.firebasestorage.app",
    messagingSenderId: "371731984767",
    appId: "1:371731984767:web:254c9bfa1253ea6a0baa4a"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db, collection, doc, addDoc, setDoc, getDoc, getDocs, updateDoc, deleteDoc, query, where, orderBy, limit };

