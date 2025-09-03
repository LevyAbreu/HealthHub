import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  GoogleAuthProvider, 
  signInWithPopup, 
  sendPasswordResetEmail 
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Configuração do Firebase (HealthHub)
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

// Formulário de login
document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const errorMessage = document.getElementById("errorMessage");
  const successMessage = document.getElementById("successMessage");

  errorMessage.style.display = "none";
  successMessage.style.display = "none";

  try {
    await signInWithEmailAndPassword(auth, email, password);
    successMessage.textContent = "Login realizado com sucesso!";
    successMessage.style.display = "block";

    setTimeout(() => {
      window.location.href = "../pages/home.html";
    }, 1000);
  } catch (error) {
    errorMessage.textContent = "Erro no login: " + error.message;
    errorMessage.style.display = "block";
  }
});

// Login com Google
const googleProvider = new GoogleAuthProvider();
const googleBtn = document.getElementById("googleLogin");
if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      window.location.href = "../pages/home.html";
    } catch (error) {
      alert("Erro no login com Google: " + error.message);
    }
  });
}

// Recuperar senha
const forgotPasswordLink = document.getElementById("forgotPassword");
if (forgotPasswordLink) {
  forgotPasswordLink.addEventListener("click", async (e) => {
    e.preventDefault();
    const email = prompt("Digite seu e-mail para redefinir a senha:");
    if (email) {
      try {
        await sendPasswordResetEmail(auth, email);
        alert("Um link de redefinição de senha foi enviado para seu e-mail.");
      } catch (error) {
        alert("Erro ao enviar link de redefinição: " + error.message);
      }
    }
  });
}
