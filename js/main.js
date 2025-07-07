document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("imcSerasaGauge");
    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.9;
    const radius = 100;
    const thickness = 20;

    const maxIMC = 40;

    const faixas = [
        { label: "Desnutrido", cor: "#f44336", de: 0, ate: 18.4 },
        { label: "Normal", cor: "#4caf50", de: 18.5, ate: 24.9 },
        { label: "Sobrepeso", cor: "#ffeb3b", de: 25, ate: 29.9 },
        { label: "Obesidade Grau I", cor: "#ff9800", de: 30, ate: 34.9 },
        { label: "Obesidade Grau II", cor: "#f44336", de: 35, ate: 39.9 },
        { label: "Obesidade Grau III (Mórbida)", cor: "#d32f2f", de: 40, ate: maxIMC }
    ];

    function mapIMCToAngle(valor) {
        const start = Math.PI; // 180 graus
        const end = 0; // 0 graus
        return start + ((end - start) * (valor / maxIMC));
    }

    function getFaixaDoIMC(imc) {
        return faixas.find(faixa => imc >= faixa.de && imc <= faixa.ate);
    }

    function drawGauge(imcValue) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Desenha os arcos coloridos
        faixas.forEach(faixa => {
            const startAngle = mapIMCToAngle(faixa.de);
            const endAngle = mapIMCToAngle(faixa.ate);
            ctx.beginPath();
            ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
            ctx.strokeStyle = faixa.cor;
            ctx.lineWidth = thickness;
            ctx.stroke();
        });

        // Faixa atual do IMC
        const faixaAtual = getFaixaDoIMC(imcValue);
        const pointerColor = faixaAtual ? faixaAtual.cor : "#333";
        const angle = mapIMCToAngle(imcValue);

        // Desenha ponteiro
        const pointerLength = radius - 15;
        const px = centerX + pointerLength * Math.cos(angle);
        const py = centerY + pointerLength * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(px, py);
        ctx.strokeStyle = pointerColor;
        ctx.lineWidth = 4;
        ctx.stroke();

        // Círculo central
        ctx.beginPath();
        ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI);
        ctx.fillStyle = pointerColor;
        ctx.fill();

        // Texto IMC numérico com cor dinâmica
        ctx.font = "bold 32px 'Varela Round', sans-serif";
        ctx.fillStyle = pointerColor;
        ctx.textAlign = "center";
        ctx.fillText(imcValue.toFixed(1), centerX, centerY - 90);

        // Rótulo
        ctx.font = "16px 'Varela Round', sans-serif";
        ctx.fillStyle = "#777";
        ctx.fillText("IMC", centerX, centerY - 60);

        // Texto da categoria (Desnutrido, Regular, etc)
        ctx.font = "18px 'Varela Round', sans-serif";
        ctx.fillStyle = pointerColor;
        ctx.fillText(faixaAtual ? faixaAtual.label : "", centerX, centerY - 30);
    }

    // Inicializa o gauge com um valor padrão (ou 0)
    drawGauge(0);

    const imcForm = document.getElementById("imcForm");
    imcForm.addEventListener("submit", (e) => {
        e.preventDefault();

        const peso = parseFloat(document.getElementById("peso").value);
        const altura = parseFloat(document.getElementById("altura").value);

        if (isNaN(peso) || isNaN(altura) || altura === 0) {
            alert("Por favor, insira valores válidos para peso e altura.");
            return;
        }

        const imcCalculado = peso / (altura * altura);
        const faixa = getFaixaDoIMC(imcCalculado);

        document.getElementById("imcValor").textContent = imcCalculado.toFixed(2);
        document.getElementById("imcDiagnostico").textContent = faixa ? faixa.label : "";
        document.getElementById("imcDiagnostico").style.color = faixa ? faixa.cor : "#333";

        drawGauge(imcCalculado);
    });
});

