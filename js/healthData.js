import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAQ2M07WB7zVJiL02OtiYG-TFp3wdbrmVI",
    authDomain: "healthhub-2ff6e.firebaseapp.com",
    projectId: "healthhub-2ff6e",
    storageBucket: "healthhub-2ff6e.firebasestorage.app",
    messagingSenderId: "371731984767",
    appId: "1:371731984767:web:254c9bfa1253ea6a0baa4a"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const healthForm = document.getElementById("healthForm");
const errorMessage = document.getElementById("errorMessage");
const successMessage = document.getElementById("successMessage");

// Checa se o usuário está logado
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Redireciona para login se não estiver logado
        window.location.href = "../pages/login.html";
    }
});

healthForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const age = parseInt(document.getElementById("age").value);
    const height = parseFloat(document.getElementById("height").value);
    const weight = parseFloat(document.getElementById("weight").value);
    const allergies = document.getElementById("allergies").value
        .split(",")
        .map(a => a.trim())
        .filter(a => a.length > 0);

    const user = auth.currentUser;
    if (!user) {
        errorMessage.style.display = "block";
        errorMessage.textContent = "Usuário não autenticado.";
        return;
    }

    const userData = {
        Nome: user.displayName || user.email || "Usuário sem nome",
        Idade: age,
        Altura: height,
        Peso: weight,
        Alergia: allergies
    };

    try {
        await setDoc(doc(db, "userData", user.uid), userData);
        successMessage.style.display = "block";
        successMessage.textContent = "Dados de saúde salvos com sucesso!";
        errorMessage.style.display = "none";

        // Redireciona para home após 1.5s
        setTimeout(() => {
            window.location.href = "../pages/home.html";
        }, 1500);
    } catch (error) {
        console.error("Erro ao salvar dados:", error);
        errorMessage.style.display = "block";
        errorMessage.textContent = "Erro ao salvar dados. Tente novamente.";
        successMessage.style.display = "none";
    }
});
