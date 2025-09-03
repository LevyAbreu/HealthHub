import { initializeApp } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore, doc, getDoc, updateDoc } 
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAQ2M07WB7zVJiL02OtiYG-TFp3wdbrmVI",
  authDomain: "healthhub-2ff6e.firebaseapp.com",
  projectId: "healthhub-2ff6e",
  storageBucket: "healthhub-2ff6e.firebasestorage.app",
  messagingSenderId: "371731984767",
  appId: "1:371731984767:web:254c9bfa1253ea6a0baa4a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userRef = doc(db, "userData", user.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
            const userData = userSnap.data();
          
            // Dados básicos
            document.getElementById("nome").textContent = userData.Nome || "";
            document.getElementById("idade").textContent = userData.Idade || "";
            document.getElementById("altura").textContent = userData.Altura || "";
            document.getElementById("peso").textContent = userData.Peso || "";
          
            const alergiasLista = document.getElementById("alergiasLista");
            alergiasLista.innerHTML = "";
          
            if (userData.Alergia && userData.Alergia.length > 0) {
              userData.Alergia.forEach(alergia => {
                const item = document.createElement("div");
                item.classList.add("alergia-item");
          
                const nome = document.createElement("span");
                nome.classList.add("alergia-nome");
                nome.textContent = alergia;
          
                const comidas = document.createElement("span");
                comidas.classList.add("alergia-comidas");
                comidas.textContent = "[Comidas relacionadas]";
          
                item.appendChild(nome);
                item.appendChild(comidas);
                alergiasLista.appendChild(item);
              });
            } else {
              const vazio = document.createElement("div");
              vazio.classList.add("alergias-empty");
              vazio.textContent = "Nenhuma alergia registrada.";
              alergiasLista.appendChild(vazio);
            }

            const altura = parseFloat(userData.Altura);
            const peso = parseFloat(userData.Peso);
          
            if (!isNaN(altura) && !isNaN(peso) && altura > 0) {
              const alturaM = altura >= 100 ? altura / 100 : altura;
              const imc = peso / (alturaM * alturaM);
              const imcFormatado = imc.toFixed(1);
          
              document.getElementById("imcAtual").textContent = imcFormatado;
          
              let diagnostico = "";
              if (imc < 18.5) diagnostico = "Abaixo do peso";
              else if (imc < 24.9) diagnostico = "Peso normal";
              else if (imc < 29.9) diagnostico = "Sobrepeso";
              else if (imc < 34.9) diagnostico = "Obesidade grau I";
              else if (imc < 39.9) diagnostico = "Obesidade grau II";
              else diagnostico = "Obesidade grau III";
          
              desenharIMCGauge(imc, diagnostico);
          } else {
            console.warn("⚠️ Dados insuficientes para calcular IMC");
          }
        } else {
          console.log("❌ Usuário não encontrado no banco.");
        }
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
      }
    } else {
      window.location.href = "../pages/login.html";
    }
  });
  
  function desenharIMCGauge(imc, diagnostico) {
    const canvas = document.getElementById("imcGauge");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
  
    const largura = canvas.width;
    const altura = canvas.height;
    const centroX = largura / 2;
    const centroY = altura * 0.9;
    const raio = Math.min(largura, altura) / 2.2;
  
    ctx.clearRect(0, 0, largura, altura);
  
    const anguloMin = Math.PI;
    const anguloMax = 2 * Math.PI;
    const imcMin = 0;
    const imcMax = 50;
  
    function mapearIMC(valor) {
      return anguloMin + ((valor - imcMin) / (imcMax - imcMin)) * (anguloMax - anguloMin);
    }
  
    const gradiente = ctx.createLinearGradient(0, 0, largura, 0);
    gradiente.addColorStop(0.0, "#FF0000");
    gradiente.addColorStop(0.20, "#FF0000");
    gradiente.addColorStop(0.30, "#FFFF00");
    gradiente.addColorStop(0.40, "#00FF00");
    gradiente.addColorStop(0.55, "#FFFF00");
    gradiente.addColorStop(0.75, "#FF0000");
    gradiente.addColorStop(1.0, "#FF0000");
  
    ctx.beginPath();
    ctx.lineWidth = 15;
    ctx.lineCap = "round";
    ctx.strokeStyle = gradiente;
    ctx.arc(centroX, centroY, raio, anguloMin, anguloMax, false);
    ctx.stroke();
  
    const anguloIMC = mapearIMC(imc);
    const marcadorX = centroX + Math.cos(anguloIMC) * (raio - 10);
    const marcadorY = centroY + Math.sin(anguloIMC) * (raio - 10);
  
    ctx.beginPath();
    ctx.arc(marcadorX, marcadorY, 10, 0, 2 * Math.PI);
    ctx.fillStyle = "black";
    ctx.fill();
  
    ctx.font = "bold 28px Arial";
    ctx.fillStyle = "#000";
    ctx.textAlign = "center";
    ctx.fillText(imc.toFixed(1), centroX, centroY - 30);
  
    ctx.font = "16px Arial";
    ctx.fillStyle = "#666";
    ctx.fillText(diagnostico, centroX, centroY);
  }
  
  // Função para ativar edição inline
document.querySelectorAll(".edit-icon").forEach(icon => {
    icon.addEventListener("click", (e) => {
      const field = e.target.getAttribute("data-field");
      const span = document.getElementById(field.toLowerCase());
  
      if (!span) return;
  
      // Cria input com valor atual
      const input = document.createElement("input");
      input.type = "text";
      input.value = span.textContent;
      input.classList.add("inline-input");
  
      // Substitui o span pelo input
      span.replaceWith(input);
      input.focus();
  
      // Ao sair do input, salva o valor
      input.addEventListener("blur", async () => {
        const newValue = input.value.trim();
  
        // Atualiza no banco (Firestore)
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, "userData", user.uid);
          await updateDoc(userRef, { [field]: newValue });
        }
  
        // Substitui input por span novamente
        const newSpan = document.createElement("span");
        newSpan.id = field.toLowerCase();
        newSpan.textContent = newValue;
        input.replaceWith(newSpan);
      });
    });
  });
  