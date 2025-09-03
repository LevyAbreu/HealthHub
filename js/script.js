import { initializeApp } 
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } 
    from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

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
const auth = getAuth(app);

// Mostrar nome do usuário logado
const usernameSpan = document.getElementById("username");

onAuthStateChanged(auth, (user) => {
  if (user) {
    if (user.displayName) {
      usernameSpan.textContent = user.displayName; // Nome cadastrado
    } else {
      usernameSpan.textContent = user.email; // fallback: email
    }
  } else {
    // Se não estiver logado, redireciona para login
    window.location.href = "../pages/login.html";
  }
});

// Função de logout
const logoutBtn = document.getElementById("logoutBtn");
if (logoutBtn) {
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    signOut(auth).then(() => {
      window.location.href = "../pages/login.html"; 
    }).catch((error) => {
      console.error("Erro ao sair:", error);
    });
  });
}
