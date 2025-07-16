import firebaseService from './firebase-service.js';
import stateManager from './state-manager.js';

class ControleAgua {
    constructor() {
        this.registros = JSON.parse(localStorage.getItem('registrosAgua')) || [];
        this.configuracoes = JSON.parse(localStorage.getItem('configAgua')) || {
            metaDiaria: 2000,
            lembretes: false,
            intervalo: 60
        };
        this.intervalId = null;
        
        // Verificar se os módulos estão disponíveis
        try {
            this.firebaseService = firebaseService;
        } catch (e) {
            console.warn('Firebase service não disponível:', e);
            this.firebaseService = null;
        }
        
        try {
            this.stateManager = stateManager;
        } catch (e) {
            console.warn('State manager não disponível:', e);
            this.stateManager = null;
        }
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupStateListeners();
        this.carregarConfiguracoes();
        this.atualizarVisualizacao();
        this.atualizarEstatisticas();
        this.renderizarHistorico();
    }

    setupStateListeners() {
        // Escutar mudanças nas metas apenas se stateManager estiver disponível
        if (this.stateManager) {
            this.stateManager.subscribe('metas', (metas) => {
                this.atualizarMetaAgua(metas.agua);
            });

            // Escutar mudanças no consumo
            this.stateManager.subscribe('consumo', (consumo) => {
                this.atualizarEstatisticasConsumo(consumo);
            });
        }
    }

    atualizarMetaAgua(metaAgua) {
        this.configuracoes.metaDiaria = metaAgua;
        this.salvarConfiguracoes();
        this.atualizarVisualizacao();
        this.atualizarEstatisticas();
    }

    atualizarEstatisticasConsumo(consumo) {
        // Atualizar dados locais se necessário
        this.registros = consumo.registrosAgua || [];
        this.atualizarVisualizacao();
        this.atualizarEstatisticas();
        this.renderizarHistorico();
        
        // Atualizar estado global apenas se stateManager estiver disponível
        if (this.stateManager) {
            this.stateManager.updateConsumo();
        }
    }

    setupEventListeners() {
        const form = document.getElementById('aguaForm');
        form.addEventListener('submit', (e) => this.registrarAgua(e));

        const lembretes = document.getElementById('lembretes');
        lembretes.addEventListener('change', (e) => this.toggleLembretes(e));
    }

    carregarConfiguracoes() {
        document.getElementById('metaAgua').value = this.configuracoes.metaDiaria;
        document.getElementById('lembretes').checked = this.configuracoes.lembretes;
        document.getElementById('intervalo').value = this.configuracoes.intervalo;
        
        if (this.configuracoes.lembretes) {
            document.getElementById('intervaloLembretes').style.display = 'block';
        }
    }

    toggleLembretes(e) {
        const intervaloDiv = document.getElementById('intervaloLembretes');
        if (e.target.checked) {
            intervaloDiv.style.display = 'block';
        } else {
            intervaloDiv.style.display = 'none';
        }
    }

    salvarConfiguracoes() {
        this.configuracoes.metaDiaria = parseInt(document.getElementById('metaAgua').value);
        this.configuracoes.lembretes = document.getElementById('lembretes').checked;
        this.configuracoes.intervalo = parseInt(document.getElementById('intervalo').value);
        
        localStorage.setItem('configAgua', JSON.stringify(this.configuracoes));
        this.configurarLembretes();
        this.atualizarVisualizacao();
        this.mostrarFeedback('Configurações salvas!');
    }

    configurarLembretes() {
        // Limpar lembrete anterior
        if (this.intervalId) {
            clearInterval(this.intervalId);
        }

        if (this.configuracoes.lembretes) {
            this.intervalId = setInterval(() => {
                this.mostrarLembrete();
            }, this.configuracoes.intervalo * 60 * 1000);
        }
    }

    mostrarLembrete() {
        // Verificar se já atingiu a meta
        const aguaHoje = this.getAguaDoDia();
        if (aguaHoje < this.configuracoes.metaDiaria) {
            this.mostrarNotificacao('💧 Hora de beber água!', 'Mantenha-se hidratado para uma vida mais saudável.');
        }
    }

    mostrarNotificacao(titulo, mensagem) {
        // Verificar se o navegador suporta notificações
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                new Notification(titulo, {
                    body: mensagem,
                    icon: 'assets/health_logo.png'
                });
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        new Notification(titulo, {
                            body: mensagem,
                            icon: 'assets/health_logo.png'
                        });
                    }
                });
            }
        }
        
        // Fallback: mostrar feedback visual
        this.mostrarFeedback(mensagem);
    }

    registrarAgua(e) {
        e.preventDefault();
        
        const quantidade = parseInt(document.getElementById('quantidadeAgua').value);
        const tipo = document.getElementById('tipoLiquido').value;
        
        this.adicionarAgua(quantidade, tipo);
        
        // Limpar formulário
        document.getElementById('aguaForm').reset();
    }

    async adicionarAgua(quantidade, tipo = 'agua') {
        const registro = {
            id: Date.now(),
            quantidade: quantidade,
            tipo: tipo,
            data: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            sincronizado: false
        };

        // Adicionar ao localStorage
        this.registros.push(registro);
        this.salvarDados();
        
        // Tentar sincronizar com Firebase apenas se disponível
        if (this.firebaseService) {
            try {
                await this.firebaseService.adicionarBebida({
                    tipo: tipo,
                    quantidade: quantidade
                });
                registro.sincronizado = true;
                this.salvarDados();
            } catch (error) {
                console.error('Erro ao sincronizar com Firebase:', error);
                // Dados ficam no localStorage para sincronização posterior
            }
        }
        
        this.atualizarVisualizacao();
        this.atualizarEstatisticas();
        this.renderizarHistorico();
        
        // Feedback com base no progresso
        const aguaHoje = this.getAguaDoDia();
        const porcentagem = Math.round((aguaHoje / this.configuracoes.metaDiaria) * 100);
        
        if (porcentagem >= 100) {
            this.mostrarFeedback('🎉 Parabéns! Meta diária atingida!');
        } else if (porcentagem >= 75) {
            this.mostrarFeedback('💪 Quase lá! Você está indo muito bem!');
        } else {
            this.mostrarFeedback(`💧 +${quantidade}ml registrados! Continue assim!`);
        }
        
        // Atualizar estado global apenas se stateManager estiver disponível
        if (this.stateManager) {
            this.stateManager.updateConsumo();
        }
    }

    removerRegistro(id) {
        this.registros = this.registros.filter(r => r.id !== id);
        this.salvarDados();
        this.atualizarVisualizacao();
        this.atualizarEstatisticas();
        this.renderizarHistorico();
        this.mostrarFeedback('Registro removido!');
        
        // Atualizar estado global apenas se stateManager estiver disponível
        if (this.stateManager) {
            this.stateManager.updateConsumo();
        }
    }

    getAguaDoDia() {
        const hoje = new Date().toISOString().split('T')[0];
        return this.registros
            .filter(r => r.data === hoje)
            .reduce((total, r) => total + r.quantidade, 0);
    }

    atualizarVisualizacao() {
        const aguaHoje = this.getAguaDoDia();
        const porcentagem = Math.min(100, (aguaHoje / this.configuracoes.metaDiaria) * 100);
        
        document.getElementById('aguaConsumida').textContent = `${aguaHoje}ml`;
        document.querySelector('.agua-meta').textContent = `/ ${this.configuracoes.metaDiaria}ml`;
        document.getElementById('aguaPorcentagem').textContent = `${Math.round(porcentagem)}%`;
        
        // Copo
        const aguaFill = document.getElementById('aguaFill');
        aguaFill.style.height = `${porcentagem}%`;
        
        // Mudar cor baseado no progresso
        if (porcentagem < 25) {
            aguaFill.style.background = 'linear-gradient(to top, #f44336, #ff7961)';
        } else if (porcentagem < 50) {
            aguaFill.style.background = 'linear-gradient(to top, #ff9800, #ffb74d)';
        } else if (porcentagem < 75) {
            aguaFill.style.background = 'linear-gradient(to top, #2196f3, #64b5f6)';
        } else {
            aguaFill.style.background = 'linear-gradient(to top, #4caf50, #81c784)';
        }
    }

    atualizarEstatisticas() {
        const hoje = new Date();
        const inicioSemana = new Date(hoje);
        inicioSemana.setDate(hoje.getDate() - hoje.getDay());
        
        const registrosSemana = this.registros.filter(r => {
            const dataRegistro = new Date(r.data);
            return dataRegistro >= inicioSemana;
        });

        // Agrupar por dia
        const aguaPorDia = {};
        registrosSemana.forEach(r => {
            if (!aguaPorDia[r.data]) {
                aguaPorDia[r.data] = 0;
            }
            aguaPorDia[r.data] += r.quantidade;
        });

        const valores = Object.values(aguaPorDia);
        const mediaAgua = valores.length > 0 ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : 0;
        
        // Melhor dia
        let melhorDia = '-';
        let maiorQuantidade = 0;
        Object.keys(aguaPorDia).forEach(data => {
            if (aguaPorDia[data] > maiorQuantidade) {
                maiorQuantidade = aguaPorDia[data];
                melhorDia = this.formatarData(data);
            }
        });

        // Dias que atingiram a meta
        const diasMeta = valores.filter(v => v >= this.configuracoes.metaDiaria).length;
        
        // Total da semana
        const totalSemana = (valores.reduce((a, b) => a + b, 0) / 1000).toFixed(1);

        document.getElementById('mediaAgua').textContent = `${mediaAgua}ml`;
        document.getElementById('melhorDia').textContent = melhorDia;
        document.getElementById('diasMeta').textContent = `${diasMeta}/7`;
        document.getElementById('totalSemana').textContent = `${totalSemana}L`;
    }

    renderizarHistorico() {
        const container = document.getElementById('aguaLista');
        const hoje = new Date().toISOString().split('T')[0];
        const registrosHoje = this.registros
            .filter(r => r.data === hoje)
            .sort((a, b) => new Date(b.data + ' ' + b.hora) - new Date(a.data + ' ' + a.hora));

        if (registrosHoje.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum registro de hidratação hoje.</p>';
            return;
        }

        container.innerHTML = registrosHoje.map(registro => `
            <div class="agua-item">
                <div class="agua-info">
                    <div class="agua-header">
                        <span class="agua-quantidade">${registro.quantidade}ml</span>
                        <span class="agua-hora">${registro.hora}</span>
                    </div>
                    <div class="agua-tipo">
                        ${this.getIconeTipo(registro.tipo)} ${this.formatarTipo(registro.tipo)}
                    </div>
                </div>
                <button class="btn-remove" onclick="controleAgua.removerRegistro(${registro.id})">
                    ✕
                </button>
            </div>
        `).join('');
    }

    getIconeTipo(tipo) {
        const icones = {
            'agua': '💧',
            'cha': '🍵',
            'cafe': '☕',
            'suco': '🧃',
            'refrigerante': '🥤',
            'outro': '🥛'
        };
        return icones[tipo] || '💧';
    }

    formatarTipo(tipo) {
        const tipos = {
            'agua': 'Água',
            'cha': 'Chá',
            'cafe': 'Café',
            'suco': 'Suco Natural',
            'refrigerante': 'Refrigerante',
            'outro': 'Outro'
        };
        return tipos[tipo] || tipo;
    }

    formatarData(data) {
        const hoje = new Date().toISOString().split('T')[0];
        const ontem = new Date();
        ontem.setDate(ontem.getDate() - 1);
        const ontemStr = ontem.toISOString().split('T')[0];

        if (data === hoje) return 'Hoje';
        if (data === ontemStr) return 'Ontem';
        
        return new Date(data).toLocaleDateString('pt-BR');
    }

    mostrarFeedback(mensagem) {
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = mensagem;
        document.body.appendChild(feedback);

        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    salvarDados() {
        localStorage.setItem('registrosAgua', JSON.stringify(this.registros));
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se os módulos estão disponíveis
    if (typeof firebaseService === 'undefined') {
        console.warn('Firebase service não disponível, usando modo offline');
    }
    if (typeof stateManager === 'undefined') {
        console.warn('State manager não disponível, usando modo local');
    }
    
    window.controleAgua = new ControleAgua();
    
    if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission();
    }
});