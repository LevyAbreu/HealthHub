// Saúde Mental - JavaScript

// Estado da aplicação
let humorData = JSON.parse(localStorage.getItem('humorData')) || [];
let respiracaoAtiva = false;
let respiracaoInterval;

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarHistoricoHumor();
    atualizarEstatisticas();
});

// Função para registrar humor
function registrarHumor() {
    const humorSelecionado = document.querySelector('.humor-option.selected');
    const nota = document.getElementById('humor-nota').value;
    
    if (!humorSelecionado) {
        alert('Por favor, selecione como você está se sentindo.');
        return;
    }
    
    const humor = {
        data: new Date().toISOString().split('T')[0],
        humor: humorSelecionado.dataset.humor,
        nota: nota,
        timestamp: new Date().toISOString()
    };
    
    // Verificar se já existe registro para hoje
    const hoje = new Date().toISOString().split('T')[0];
    const indiceHoje = humorData.findIndex(item => item.data === hoje);
    
    if (indiceHoje !== -1) {
        humorData[indiceHoje] = humor;
    } else {
        humorData.push(humor);
    }
    
    // Manter apenas os últimos 30 dias
    humorData = humorData.slice(-30);
    
    localStorage.setItem('humorData', JSON.stringify(humorData));
    
    // Limpar seleção
    document.querySelectorAll('.humor-option').forEach(option => {
        option.classList.remove('selected');
    });
    document.getElementById('humor-nota').value = '';
    
    // Atualizar estatísticas
    atualizarEstatisticas();
    
    // Feedback
    mostrarFeedback('Humor registrado com sucesso!');
}

// Seleção de humor
document.addEventListener('click', function(e) {
    if (e.target.closest('.humor-option')) {
        document.querySelectorAll('.humor-option').forEach(option => {
            option.classList.remove('selected');
        });
        e.target.closest('.humor-option').classList.add('selected');
    }
});

// Exercício de respiração 4-7-8
function iniciarRespiracao() {
    const btn = document.getElementById('btnRespiracao');
    const circulo = document.getElementById('circuloRespiracao');
    const instrucao = document.getElementById('respiracaoInstrucao');
    
    if (respiracaoAtiva) {
        pararRespiracao();
        return;
    }
    
    respiracaoAtiva = true;
    btn.textContent = 'Parar';
    btn.classList.add('btn-secondary');
    
    let ciclo = 0;
    const totalCiclos = 4;
    
    function executarCiclo() {
        if (!respiracaoAtiva) return;
        
        ciclo++;
        instrucao.textContent = `Ciclo ${ciclo}/${totalCiclos}`;
        
        // Fase 1: Inspirar (4 segundos)
        setTimeout(() => {
            if (!respiracaoAtiva) return;
            instrucao.textContent = 'Inspire pelo nariz...';
            circulo.style.transform = 'scale(1.5)';
            circulo.style.backgroundColor = '#4CAF50';
        }, 500);
        
        // Fase 2: Segurar (7 segundos)
        setTimeout(() => {
            if (!respiracaoAtiva) return;
            instrucao.textContent = 'Segure a respiração...';
            circulo.style.backgroundColor = '#FF9800';
        }, 4500);
        
        // Fase 3: Expirar (8 segundos)
        setTimeout(() => {
            if (!respiracaoAtiva) return;
            instrucao.textContent = 'Expire pela boca...';
            circulo.style.transform = 'scale(1)';
            circulo.style.backgroundColor = '#2196F3';
        }, 11500);
        
        // Próximo ciclo ou finalizar
        setTimeout(() => {
            if (!respiracaoAtiva) return;
            if (ciclo < totalCiclos) {
                executarCiclo();
            } else {
                finalizarRespiracao();
            }
        }, 19500);
    }
    
    executarCiclo();
}

function pararRespiracao() {
    respiracaoAtiva = false;
    const btn = document.getElementById('btnRespiracao');
    const circulo = document.getElementById('circuloRespiracao');
    const instrucao = document.getElementById('respiracaoInstrucao');
    
    btn.textContent = 'Iniciar Respiração 4-7-8';
    btn.classList.remove('btn-secondary');
    circulo.style.transform = 'scale(1)';
    circulo.style.backgroundColor = '#0072ff';
    instrucao.textContent = 'Clique em "Iniciar" para começar';
}

function finalizarRespiracao() {
    respiracaoAtiva = false;
    const btn = document.getElementById('btnRespiracao');
    const circulo = document.getElementById('circuloRespiracao');
    const instrucao = document.getElementById('respiracaoInstrucao');
    
    btn.textContent = 'Iniciar Respiração 4-7-8';
    btn.classList.remove('btn-secondary');
    circulo.style.transform = 'scale(1)';
    circulo.style.backgroundColor = '#4CAF50';
    instrucao.textContent = 'Exercício concluído! Parabéns!';
    
    setTimeout(() => {
        circulo.style.backgroundColor = '#0072ff';
        instrucao.textContent = 'Clique em "Iniciar" para começar';
    }, 3000);
    
    mostrarFeedback('Exercício de respiração concluído!');
}

// Meditação guiada (placeholder)
function iniciarMeditacao(tipo) {
    const tempos = {
        'matinal': 5,
        'pausa': 3,
        'noturna': 10
    };
    
    const tempo = tempos[tipo];
    alert(`Iniciando meditação ${tipo} de ${tempo} minutos.\n\nEsta é uma funcionalidade em desenvolvimento. Em breve teremos áudios guiados!`);
    
    // Simular conclusão da meditação
    setTimeout(() => {
        mostrarFeedback(`Meditação ${tipo} concluída!`);
    }, 2000);
}

// Carregar histórico de humor
function carregarHistoricoHumor() {
    // Placeholder para gráfico - em uma implementação real usaria Chart.js ou similar
    const canvas = document.getElementById('humorChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#f0f0f0';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#0072ff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Gráfico do humor será exibido aqui', canvas.width/2, canvas.height/2);
        ctx.font = '12px Arial';
        ctx.fillText('(Funcionalidade em desenvolvimento)', canvas.width/2, canvas.height/2 + 20);
    }
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const diasRegistrados = humorData.length;
    document.getElementById('diasRegistrados').textContent = diasRegistrados;
    
    if (diasRegistrados > 0) {
        // Calcular humor médio
        const valores = {
            'muito-bem': 5,
            'bem': 4,
            'neutro': 3,
            'triste': 2,
            'ansioso': 1
        };
        
        const soma = humorData.reduce((acc, item) => acc + valores[item.humor], 0);
        const media = soma / diasRegistrados;
        
        let humorMedio = 'Neutro';
        if (media >= 4.5) humorMedio = 'Muito Bem';
        else if (media >= 3.5) humorMedio = 'Bem';
        else if (media >= 2.5) humorMedio = 'Neutro';
        else if (media >= 1.5) humorMedio = 'Triste';
        else humorMedio = 'Ansioso';
        
        document.getElementById('humorMedio').textContent = humorMedio;
        
        // Calcular sequência de dias bons
        let sequencia = 0;
        for (let i = humorData.length - 1; i >= 0; i--) {
            if (valores[humorData[i].humor] >= 4) {
                sequencia++;
            } else {
                break;
            }
        }
        document.getElementById('sequenciaBoa').textContent = sequencia;
    }
}

// Função para mostrar feedback
function mostrarFeedback(mensagem, tipo = 'success') {
    const feedback = document.createElement('div');
    feedback.className = `feedback-message ${tipo === 'error' ? 'error' : ''}`;
    feedback.textContent = mensagem;
    
    document.body.appendChild(feedback);
    
    setTimeout(() => {
        feedback.remove();
    }, 3000);
}

