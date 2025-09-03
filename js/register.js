import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js"
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js"

const firebaseConfig = {
  apiKey: "AIzaSyAQ2M07WB7zVJiL02OtiYG-TFp3wdbrmVI",
  authDomain: "healthhub-2ff6e.firebaseapp.com",
  projectId: "healthhub-2ff6e",
  storageBucket: "healthhub-2ff6e.firebasestorage.app",
  messagingSenderId: "371731984767",
  appId: "1:371731984767:web:254c9bfa1253ea6a0baa4a"
};

const app = initializeApp(firebaseConfig)
const auth = getAuth(app)

// Função de validação de senha
function validarSenha(password) {
  const errors = []
  if (!/[0-9]/.test(password)) errors.push("A senha deve conter ao menos 1 número.")
  if (!/[a-z]/.test(password)) errors.push("A senha deve conter ao menos 1 letra minúscula.")
  if (!/[A-Z]/.test(password)) errors.push("A senha deve conter ao menos 1 letra maiúscula.")
  if (!/[!@#$%^&*()\-+.,]/.test(password)) errors.push("A senha deve conter ao menos 1 caractere especial.")
  if (password.length < 6) errors.push("A senha deve ter no mínimo 6 caracteres.")
  return errors
}

// Captura o formulário
document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault()

  const name = document.getElementById("name").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const passwordConfirm = document.getElementById("passwordConfirm").value

  // Confirmação de senha
  if (password !== passwordConfirm) {
    alert("As senhas não coincidem!")
    return
  }

  // Validação de senha
  const errosSenha = validarSenha(password)
  if (errosSenha.length > 0) {
    alert(errosSenha.join("\n"))
    return
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(userCredential.user, { displayName: name })
    console.log("Nome salvo no perfil:", name)


    alert("Conta criada com sucesso! Agora complete seus dados de saúde.")
    window.location.href = "../pages/healthData.html" // 🔥 redireciona para o cadastro de saúde
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      alert("Este e-mail já está cadastrado!")
    } else {
      alert("Erro no cadastro: " + error.message)
    }
  }
})
