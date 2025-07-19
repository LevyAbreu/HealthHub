// Monitoramento de Sono - JavaScript

// Estado da aplicação
let sonoData = JSON.parse(localStorage.getItem('sonoData')) || [];
let metaSono = JSON.parse(localStorage.getItem('metaSono')) || {
    horas: 8,
    horarioIdeal: '22:00',
    lembreteDormir: false,
    lembreteAcordar: false
};

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    carregarConfiguracoes();
    atualizarEstatisticas();
    carregarHistorico();
    
    // Event listener para o formulário
    document.getElementById('sonoForm').addEventListener('submit', registrarSono);
});

// Função para registrar sono
function registrarSono(e) {
    e.preventDefault();
    
    const horaDormir = document.getElementById('horaDormir').value;
    const horaAcordar = document.getElementById('horaAcordar').value;
    const qualidade = document.getElementById('qualidadeSono').value;
    const observacoes = document.getElementById('observacoesSono').value;
    
    if (!horaDormir || !horaAcordar || !qualidade) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Calcular duração do sono
    const duracao = calcularDuracaoSono(horaDormir, horaAcordar);
    
    const registro = {
        data: new Date().toISOString().split('T')[0],
        horaDormir: horaDormir,
        horaAcordar: horaAcordar,
        duracao: duracao,
        qualidade: qualidade,
        observacoes: observacoes,
        timestamp: new Date().toISOString()
    };
    
    // Verificar se já existe registro para hoje
    const hoje = new Date().toISOString().split('T')[0];
    const indiceHoje = sonoData.findIndex(item => item.data === hoje);
    
    if (indiceHoje !== -1) {
        sonoData[indiceHoje] = registro;
    } else {
        sonoData.push(registro);
    }
    
    // Manter apenas os últimos 30 dias
    sonoData = sonoData.slice(-30);
    
    localStorage.setItem('sonoData', JSON.stringify(sonoData));
    
    // Limpar formulário
    document.getElementById('sonoForm').reset();
    
    // Atualizar estatísticas e histórico
    atualizarEstatisticas();
    carregarHistorico();
    
    // Feedback
    mostrarFeedback('Sono registrado com sucesso!');
}

// Calcular duração do sono
function calcularDuracaoSono(horaDormir, horaAcordar) {
    const [horaDormirH, horaDormirM] = horaDormir.split(':').map(Number);
    const [horaAcordarH, horaAcordarM] = horaAcordar.split(':').map(Number);
    
    let minutosTotal = 0;
    
    // Se acordou no dia seguinte
    if (horaAcordarH < horaDormirH || (horaAcordarH === horaDormirH && horaAcordarM < horaDormirM)) {
        // Calcular até meia-noite
        minutosTotal += (24 - horaDormirH) * 60 - horaDormirM;
        // Adicionar do início do dia até acordar
        minutosTotal += horaAcordarH * 60 + horaAcordarM;
    } else {
        // Mesmo dia
        minutosTotal = (horaAcordarH - horaDormirH) * 60 + (horaAcordarM - horaDormirM);
    }
    
    return minutosTotal / 60; // Retornar em horas
}

// Salvar meta de sono
function salvarMetaSono() {
    const metaHoras = document.getElementById('metaHoras').value;
    const horarioIdeal = document.getElementById('horarioIdealDormir').value;
    const lembreteDormir = document.getElementById('lembreteDormir').checked;
    const lembreteAcordar = document.getElementById('lembreteAcordar').checked;
    
    metaSono = {
        horas: parseInt(metaHoras),
        horarioIdeal: horarioIdeal,
        lembreteDormir: lembreteDormir,
        lembreteAcordar: lembreteAcordar
    };
    
    localStorage.setItem('metaSono', JSON.stringify(metaSono));
    
    atualizarEstatisticas();
    mostrarFeedback('Meta de sono salva com sucesso!');
}

// Carregar configurações
function carregarConfiguracoes() {
    document.getElementById('metaHoras').value = metaSono.horas;
    document.getElementById('horarioIdealDormir').value = metaSono.horarioIdeal;
    document.getElementById('lembreteDormir').checked = metaSono.lembreteDormir;
    document.getElementById('lembreteAcordar').checked = metaSono.lembreteAcordar;
}

// Atualizar estatísticas
function atualizarEstatisticas() {
    const diasRegistrados = sonoData.length;
    document.getElementById('diasRegistrados').textContent = diasRegistrados;
    
    if (diasRegistrados > 0) {
        // Calcular média de horas de sono
        const somaHoras = sonoData.reduce((acc, item) => acc + item.duracao, 0);
        const mediaHoras = somaHoras / diasRegistrados;
        document.getElementById('horasSonoMedia').textContent = `${mediaHoras.toFixed(1)}h`;
        
        // Calcular qualidade média
        const qualidades = {
            'excelente': 5,
            'boa': 4,
            'regular': 3,
            'ruim': 2,
            'pessima': 1
        };
        
        const somaQualidade = sonoData.reduce((acc, item) => acc + qualidades[item.qualidade], 0);
        const mediaQualidade = somaQualidade / diasRegistrados;
        
        let qualidadeTexto = 'Regular';
        if (mediaQualidade >= 4.5) qualidadeTexto = 'Excelente';
        else if (mediaQualidade >= 3.5) qualidadeTexto = 'Boa';
        else if (mediaQualidade >= 2.5) qualidadeTexto = 'Regular';
        else if (mediaQualidade >= 1.5) qualidadeTexto = 'Ruim';
        else qualidadeTexto = 'Péssima';
        
        document.getElementById('qualidadeMedia').textContent = qualidadeTexto;
        
        // Calcular porcentagem da meta cumprida
        const diasMetaCumprida = sonoData.filter(item => item.duracao >= metaSono.horas).length;
        const porcentagemMeta = (diasMetaCumprida / diasRegistrados) * 100;
        document.getElementById('metaCumprida').textContent = `${porcentagemMeta.toFixed(0)}%`;
        
        // Mostrar última noite
        const ultimoRegistro = sonoData[sonoData.length - 1];
        const ultimaNoiteDiv = document.getElementById('ultimaNoite');
        ultimaNoiteDiv.innerHTML = `
            <p><strong>Dormiu:</strong> ${ultimoRegistro.horaDormir}</p>
            <p><strong>Acordou:</strong> ${ultimoRegistro.horaAcordar}</p>
            <p><strong>Duração:</strong> ${ultimoRegistro.duracao.toFixed(1)}h</p>
            <p><strong>Qualidade:</strong> ${ultimoRegistro.qualidade}</p>
            ${ultimoRegistro.observacoes ? `<p><strong>Observações:</strong> ${ultimoRegistro.observacoes}</p>` : ''}
        `;
    } else {
        document.getElementById('horasSonoMedia').textContent = '0h';
        document.getElementById('qualidadeMedia').textContent = '-';
        document.getElementById('metaCumprida').textContent = '0%';
    }
}

function carregarHistorico() {
    const dadosSono = JSON.parse(localStorage.getItem('dadosSono')) || [];
  
    // Dados pro gráfico
    const dias = dadosSono.map((dado, index) => `Dia ${index + 1}`);
    const horasDormidas = dadosSono.map(dado => calcularHorasSono(dado.horaDormir, dado.horaAcordar));
  
    // Configuração do gráfico
    const config = {
      type: 'bar',
      data: {
        labels: dias,
        datasets: [{
          label: 'Horas Dormidas',
          data: horasDormidas,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true,
            suggestedMax: 12
          }
        }
      }
    };
  
    // Verifica se os dois canvases existem
    const ctx1 = document.getElementById('sonoChart1');
    const ctx2 = document.getElementById('sonoChart2');
  
    if (ctx1) {
      new Chart(ctx1.getContext('2d'), config);
    }
  
    if (ctx2) {
      new Chart(ctx2.getContext('2d'), config);
    }
  
    // Atualiza lista
    const lista = document.getElementById('sonoLista');
    lista.innerHTML = '';
    dadosSono.slice(-7).forEach(dado => {
      const item = document.createElement('div');
      item.textContent = `Dormiu às ${dado.horaDormir}, acordou às ${dado.horaAcordar} (${dado.qualidade}/5)`;
      lista.appendChild(item);
    });
  }
  

// Obter classe CSS para qualidade
function getQualidadeClass(qualidade) {
    const classes = {
        'excelente': 'qualidade-excelente',
        'boa': 'qualidade-boa',
        'regular': 'qualidade-regular',
        'ruim': 'qualidade-ruim',
        'pessima': 'qualidade-pessima'
    };
    return classes[qualidade] || '';
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

