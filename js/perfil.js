import firebaseService from './firebase-service.js';
import stateManager from './state-manager.js';

class PerfilManager {
    constructor() {
        this.firebaseService = firebaseService;
        this.stateManager = stateManager;
        this.init();
    }

    calcularEExibirIMC(peso, altura) {
        if (isNaN(peso) || isNaN(altura) || altura === 0) {
            document.getElementById("imcValor").textContent = "--";
            document.getElementById("imcDiagnostico").textContent = "--";
            drawGauge(0);
            return;
        }

        const imcCalculado = peso / (altura * altura);
        const faixa = getFaixaDoIMC(imcCalculado);

        // Atualiza elementos visuais
        document.getElementById("imcValor").textContent = imcCalculado.toFixed(2);
        document.getElementById("imcDiagnostico").textContent = faixa ? faixa.label : "";
        document.getElementById("imcDiagnostico").style.color = faixa ? faixa.cor : "#333";

        drawGauge(imcCalculado);
    }

    async init() {
        this.setupEventListeners();
        this.setupStateListeners();
        await this.carregarPerfil();
        this.carregarConfiguracoes();
        await this.atualizarEstatisticas();
        this.verificarStatusSync();
        drawGauge(0);
        
        // Iniciar monitoramento automático
        await this.firebaseService.iniciarMonitoramento();
    }

    setupEventListeners() {
        const form = document.getElementById('perfilForm');
        form.addEventListener('submit', (e) => this.salvarPerfil(e));
    }

    setupStateListeners() {
        // Escutar mudanças nos dados do usuário
        this.stateManager.subscribe('usuario', (usuario) => {
            this.atualizarCamposUsuario(usuario);
        });

        // Escutar mudanças nas metas
        this.stateManager.subscribe('metas', (metas) => {
            this.atualizarCamposMetas(metas);
        });

        // Escutar mudanças no consumo
        this.stateManager.subscribe('consumo', (consumo) => {
            this.atualizarEstatisticasConsumo(consumo);
        });

        // Escutar mudanças nas configurações
        this.stateManager.subscribe('configuracoes', (config) => {
            this.atualizarCamposConfiguracoes(config);
        });
    }

    atualizarCamposUsuario(usuario) {
        if (usuario.nome !== undefined) {
            document.getElementById('nome').value = usuario.nome || '';
        }
        if (usuario.idade !== undefined) {
            document.getElementById('idade').value = usuario.idade || '';
        }
        if (usuario.peso !== undefined) {
            document.getElementById('peso').value = usuario.peso || '';
        }
        if (usuario.altura !== undefined) {
            document.getElementById("altura").value = usuario.altura || "";
        }
        // Calcular e exibir IMC quando peso e altura estiverem disponíveis
        if (usuario.peso && usuario.altura) {
            this.calcularEExibirIMC(usuario.peso, usuario.altura);
        }
        if (usuario.imc !== undefined) {
            document.getElementById("imcAtual").textContent = usuario.imc ? usuario.imc.toFixed(1) : "--";
        }
    }

    atualizarCamposMetas(metas) {
        if (metas.calorias !== undefined) {
            document.getElementById('metaCalorias').value = metas.calorias;
        }
        if (metas.agua !== undefined) {
            document.getElementById('metaAgua').value = metas.agua;
        }
    }

    atualizarEstatisticasConsumo(consumo) {
        document.getElementById('totalCalorias').textContent = consumo.caloriasHoje || 0;
        document.getElementById('totalAgua').textContent = (consumo.aguaHoje / 1000).toFixed(1) + 'L';
    }

    atualizarCamposConfiguracoes(config) {
        if (config.notificacoes !== undefined) {
            document.getElementById('notificacoes').checked = config.notificacoes;
        }
        if (config.syncAuto !== undefined) {
            document.getElementById('syncAuto').checked = config.syncAuto;
        }
    }

    async carregarPerfil() {
        try {
            const usuario = await this.firebaseService.obterUsuario();
            if (usuario) {
                this.stateManager.updateUsuario(usuario);
            }
        } catch (error) {
            console.error('Erro ao carregar perfil:', error);
        }
    }

    async salvarPerfil(e) {
        e.preventDefault();
        
        const dadosUsuario = {
            nome: document.getElementById("nome").value,
            idade: parseInt(document.getElementById("idade").value),
            peso: parseFloat(document.getElementById("peso").value),
            altura: parseFloat(document.getElementById("altura").value)
        };

        // Calcular e exibir IMC imediatamente após salvar
        this.calcularEExibirIMC(dadosUsuario.peso, dadosUsuario.altura);

        try {
            // Atualizar estado local
            this.stateManager.updateUsuario(dadosUsuario);
            
            // Verificar se usuário já existe
            const usuarioExistente = await this.firebaseService.obterUsuario();
            
            if (usuarioExistente) {
                await this.firebaseService.atualizarUsuario(dadosUsuario);
                this.mostrarFeedback('Perfil atualizado com sucesso!');
            } else {
                await this.firebaseService.criarUsuario(dadosUsuario);
                this.mostrarFeedback('Perfil criado com sucesso!');
            }
            
        } catch (error) {
            console.error('Erro ao salvar perfil:', error);
            this.mostrarFeedback('Erro ao salvar perfil. Tente novamente.', 'error');
        }
    }

    carregarConfiguracoes() {
        const estado = this.stateManager.getState();
        this.atualizarCamposMetas(estado.metas);
        this.atualizarCamposConfiguracoes(estado.configuracoes);
    }

    salvarConfiguracoes() {
        const novasMetas = {
            calorias: parseInt(document.getElementById('metaCalorias').value),
            agua: parseInt(document.getElementById('metaAgua').value)
        };

        const novasConfiguracoes = {
            notificacoes: document.getElementById('notificacoes').checked,
            syncAuto: document.getElementById('syncAuto').checked
        };
        
        // Atualizar estado
        this.stateManager.updateMetas(novasMetas);
        this.stateManager.updateConfiguracoes(novasConfiguracoes);
        
        this.mostrarFeedback('Configurações salvas com sucesso!');
        
        // Solicitar permissão para notificações se habilitado
        if (novasConfiguracoes.notificacoes && 'Notification' in window) {
            Notification.requestPermission();
        }
    }

    async atualizarEstatisticas() {
        try {
            const estatisticas = await this.firebaseService.obterEstatisticasSemanais();
            
            document.getElementById('totalCalorias').textContent = estatisticas.totalCalorias || 0;
            document.getElementById('totalAgua').textContent = (estatisticas.totalAgua / 1000).toFixed(1) + 'L';
            document.getElementById('diasAtivos').textContent = estatisticas.diasAtivos || 0;
            
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
        }
    }

    verificarStatusSync() {
        const refeicoes = JSON.parse(localStorage.getItem('refeicoes')) || [];
        const agua = JSON.parse(localStorage.getItem('registrosAgua')) || [];
        
        const refeicoesNaoSync = refeicoes.filter(r => !r.sincronizado).length;
        const aguaNaoSync = agua.filter(a => !a.sincronizado).length;
        const totalPendentes = refeicoesNaoSync + aguaNaoSync;
        
        document.getElementById('dadosPendentes').textContent = totalPendentes;
        
        if (totalPendentes === 0) {
            document.getElementById('statusSync').textContent = 'Sincronizado';
            document.getElementById('statusSync').style.color = '#4caf50';
        } else {
            document.getElementById('statusSync').textContent = 'Pendente';
            document.getElementById('statusSync').style.color = '#ff9800';
        }
        
        // Última sincronização
        const ultimaSync = localStorage.getItem('ultimaSincronizacao');
        if (ultimaSync) {
            const data = new Date(ultimaSync);
            document.getElementById('ultimaSync').textContent = data.toLocaleString('pt-BR');
        }
    }

    async sincronizarAgora() {
        try {
            document.getElementById('statusSync').textContent = 'Sincronizando...';
            document.getElementById('statusSync').style.color = '#2196f3';
            
            await this.firebaseService.sincronizarDados();
            await this.stateManager.syncWithFirebase();
            
            localStorage.setItem('ultimaSincronizacao', new Date().toISOString());
            
            this.verificarStatusSync();
            await this.atualizarEstatisticas();
            
            // Atualizar dados de consumo
            this.stateManager.updateConsumo();
            
            this.mostrarFeedback('Sincronização concluída com sucesso!');
            
        } catch (error) {
            console.error('Erro na sincronização:', error);
            this.mostrarFeedback('Erro na sincronização. Verifique sua conexão.', 'error');
            document.getElementById('statusSync').textContent = 'Erro';
            document.getElementById('statusSync').style.color = '#f44336';
        }
    }

    async exportarDados() {
        try {
            const usuario = await this.firebaseService.obterUsuario();
            const alimentos = await this.firebaseService.obterAlimentosDoDia();
            const bebidas = await this.firebaseService.obterBebidasDoDia();
            const estatisticas = await this.firebaseService.obterEstatisticasSemanais();
            
            const dadosExportacao = {
                usuario: usuario,
                alimentosHoje: alimentos,
                bebidasHoje: bebidas,
                estatisticasSemanais: estatisticas,
                estado: this.stateManager.getState(),
                alergias: window.alergias || [], // Incluir alergias na exportação
                dataExportacao: new Date().toISOString()
            };
            
            const dataStr = JSON.stringify(dadosExportacao, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            
            const link = document.createElement('a');
            link.href = URL.createObjectURL(dataBlob);
            link.download = `healthhub_dados_${new Date().toISOString().split('T')[0]}.json`;
            link.click();
            
            this.mostrarFeedback('Dados exportados com sucesso!');
            
        } catch (error) {
            console.error('Erro ao exportar dados:', error);
            this.mostrarFeedback('Erro ao exportar dados.', 'error');
        }
    }

    mostrarFeedback(mensagem, tipo = 'success') {
        const feedback = document.createElement('div');
        feedback.className = `feedback-message ${tipo === 'error' ? 'error' : ''}`;
        feedback.textContent = mensagem;
        feedback.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 5px;
            color: white;
            font-weight: bold;
            z-index: 1000;
            background-color: ${tipo === 'error' ? '#f44336' : '#4caf50'};
        `;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.perfilManager = new PerfilManager();
});

// Banco de dados simples de alergias e alimentos a evitar
const alergiasBanco = {
    'leite': ['queijo', 'manteiga', 'iogurte', 'sorvete', 'chocolate ao leite', 'creme de leite'],
    'ovo': ['maionese', 'bolo', 'biscoito', 'massa de pastel', 'merengue', 'quiche'],
    'glúten': ['pão', 'macarrão', 'pizza', 'biscoito', 'cerveja', 'aveia'],
    'amendoim': ['paçoca', 'pé de moleque', 'doce de amendoim', 'óleo de amendoim', 'molho satay'],
    'castanha': ['castanha do pará', 'castanha de caju', 'nozes', 'amêndoas', 'pistache'],
    'camarão': ['frutos do mar', 'paella', 'risotto de camarão', 'tempurá', 'bobó de camarão'],
    'soja': ['molho shoyu', 'tofu', 'leite de soja', 'tempeh', 'miso', 'edamame'],
    'lactose': ['leite', 'queijo', 'iogurte', 'sorvete', 'manteiga', 'creme de leite'],
    'peixe': ['salmão', 'atum', 'sardinha', 'bacalhau', 'anchova', 'molho de peixe'],
    'trigo': ['pão', 'macarrão', 'pizza', 'biscoito', 'farinha de trigo', 'cerveja']
};

// Array para armazenar as alergias do usuário
window.alergias = JSON.parse(localStorage.getItem('alergias')) || [];

// Função para adicionar alergia
window.adicionarAlergia = function() {
    const input = document.getElementById('alergia');
    const nomeAlergia = input.value.trim().toLowerCase();
    
    if (nomeAlergia === '') {
        alert('Por favor, digite o nome de uma alergia.');
        return;
    }
    
    // Verificar se a alergia já foi adicionada
    if (window.alergias.some(a => a.nome === nomeAlergia)) {
        alert('Esta alergia já foi adicionada.');
        return;
    }
    
    // Buscar alimentos a evitar no banco de dados
    let alimentosEvitar = alergiasBanco[nomeAlergia] || ['Consulte um médico para mais informações'];
    
    // Adicionar a alergia ao array
    window.alergias.push({
        nome: nomeAlergia,
        alimentos: alimentosEvitar
    });
    
    // Salvar no localStorage
    localStorage.setItem('alergias', JSON.stringify(window.alergias));
    
    // Limpar o input
    input.value = '';
    
    // Atualizar a exibição
    atualizarListaAlergias();
    
    // Mostrar feedback
    if (window.perfilManager) {
        window.perfilManager.mostrarFeedback(`Alergia "${nomeAlergia}" adicionada com sucesso!`);
    }
}

// Função para atualizar a lista de alergias na tela
function atualizarListaAlergias() {
    const container = document.getElementById('alergiasLista');
    
    if (window.alergias.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma alergia registrada.</p>';
        return;
    }
    
    let html = '';
    window.alergias.forEach((alergia, index) => {
        html += `
            <div class="alergia-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px; background-color: #f9f9f9;">
                <p class="azul" style="font-weight: bold; color: #00BCD4; margin: 0 0 10px 0; text-transform: capitalize; font-size: 18px;">${alergia.nome}</p>
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 10px;">
                    <p class="Alimentos_evitar" style="margin: 0; font-weight: bold; color: #333;">Alimentos a evitar:</p>
                    ${alergia.alimentos.map(alimento => 
                        `<p class="azul" style="margin: 0; color: #00BCD4; text-transform: capitalize;">${alimento}</p>`
                    ).join(' - ')}
                </div>
                <button onclick="removerAlergia(${index})" style="margin-top: 10px; background: #f44336; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; font-weight: bold;">Remover</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Função para remover alergia
window.removerAlergia = function(index) {
    const alergiaRemovida = window.alergias[index].nome;
    window.alergias.splice(index, 1);
    localStorage.setItem('alergias', JSON.stringify(window.alergias));
    atualizarListaAlergias();
    
    // Mostrar feedback
    if (window.perfilManager) {
        window.perfilManager.mostrarFeedback(`Alergia "${alergiaRemovida}" removida com sucesso!`);
    }
}

// Carregar alergias quando a página carregar
document.addEventListener('DOMContentLoaded', function() {
    // Permitir adicionar alergia pressionando Enter
    const input = document.getElementById('alergia');
    if (input) {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                window.adicionarAlergia();
            }
        });
    }
    
    // Carregar alergias salvas
    setTimeout(() => {
        atualizarListaAlergias();
    }, 100);
});

// Funções de cálculo e desenho do IMC
const faixas = [
    { de: 0, ate: 18.4, cor: "#00BCD4", nome: "Abaixo do peso" },
    { de: 18.5, ate: 24.9, cor: "#4CAF50", nome: "Normal" },
    { de: 25, ate: 29.9, cor: "#FFC107", nome: "Sobrepeso" },
    { de: 30, ate: 34.9, cor: "#FF5722", nome: "Obesidade Grau I" },
    { de: 35, ate: 39.9, cor: "#F44336", nome: "Obesidade Grau II" },
    { de: 40, ate: 60, cor: "#B71C1C", nome: "Obesidade Grau III" },
];  

function mapIMCToAngle(valor) {
    const maxIMC = 40;
    const start = Math.PI;
    const end = 0;
    return start + ((end - start) * (valor / maxIMC));
}

function getFaixaDoIMC(imc) {
    return faixas.find(faixa => imc >= faixa.de && imc <= faixa.ate);
}

function drawGauge(imcValue) {
    const canvas = document.getElementById("imcSerasaGauge");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");

    const centerX = canvas.width / 2;
    const centerY = canvas.height * 0.9;
    const radius = 100;
    const thickness = 20;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Desenha os arcos coloridos (faixas de IMC)
    faixas.forEach(faixa => {
        const startAngle = mapIMCToAngle(faixa.de);
        const endAngle = mapIMCToAngle(faixa.ate);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, startAngle, endAngle, false);
        ctx.strokeStyle = faixa.cor;
        ctx.lineWidth = thickness;
        ctx.stroke();
    });

    // Determina a faixa atual e sua cor
    const faixaAtual = getFaixaDoIMC(imcValue);
    const diagnosticoTexto = faixaAtual ? faixaAtual.nome : "--";
    const pointerColor = faixaAtual ? faixaAtual.cor : "#333";

    // Atualiza o diagnóstico textual
    const diagnosticoFinalEl = document.getElementById("imcDiagnostico");
    if (diagnosticoFinalEl) {
        diagnosticoFinalEl.textContent = diagnosticoTexto;
        diagnosticoFinalEl.style.color = pointerColor;
    }

    // Atualiza o valor do IMC
    const imcValorEl = document.getElementById("imcValor");
    if (imcValorEl) {
        imcValorEl.textContent = imcValue > 0 ? imcValue.toFixed(1) : "--";
        imcValorEl.style.color = pointerColor;
    }

    // Calcula o ângulo do ponteiro
    const angle = mapIMCToAngle(imcValue);

    // Desenha ponteiro
    const pointerLength = radius - 15;
    const px = centerX + pointerLength * Math.cos(angle);
    const py = centerY + pointerLength * Math.sin(angle);

    // Desenha o ponteiro
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(px, py);
    ctx.strokeStyle = pointerColor;
    ctx.lineWidth = 4;
    ctx.stroke();

    // Desenha o círculo central
    ctx.beginPath();
    ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
    ctx.fillStyle = pointerColor;
    ctx.fill();

    // Desenha o valor do IMC no centro do gauge
    ctx.fillStyle = "#333";
    ctx.font = "bold 24px Arial";
    ctx.textAlign = "center";
    ctx.fillText(imcValue > 0 ? imcValue.toFixed(1) : "--", centerX, centerY - 40);
}

