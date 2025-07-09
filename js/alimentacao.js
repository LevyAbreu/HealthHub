import firebaseService from './firebase-service.js';
import stateManager from './state-manager.js';

class ControleAlimentar {
    constructor() {
        this.refeicoes = JSON.parse(localStorage.getItem('refeicoes')) || [];
        this.metaCalorias = 2000;
        this.firebaseService = firebaseService;
        this.stateManager = stateManager;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupStateListeners();
        this.atualizarResumo();
        this.renderizarRefeicoes();
    }

    setupEventListeners() {
        const form = document.getElementById('refeicaoForm');
        form.addEventListener('submit', (e) => this.adicionarRefeicao(e));
    }

    setupStateListeners() {
        // Escutar mudanças nas metas
        this.stateManager.subscribe('metas', (metas) => {
            this.atualizarMetaCalorias(metas.calorias);
        });

        // Escutar mudanças no consumo
        this.stateManager.subscribe('consumo', (consumo) => {
            this.atualizarEstatisticasConsumo(consumo);
        });
    }

    atualizarMetaCalorias(metaCalorias) {
        this.metaCalorias = metaCalorias;
        this.atualizarResumo();
    }

    atualizarEstatisticasConsumo(consumo) {
        // Atualizar dados locais se necessário
        this.refeicoes = consumo.refeicoes || [];
        this.atualizarResumo();
        this.renderizarRefeicoes();
    }

    async adicionarRefeicao(e) {
        e.preventDefault();
        
        const tipoRefeicao = document.getElementById('tipoRefeicao').value;
        const alimento = document.getElementById('alimento').value;
        const quantidade = parseFloat(document.getElementById('quantidade').value);
        const caloriasPor100g = parseFloat(document.getElementById('calorias').value);
        
        const caloriasTotal = (caloriasPor100g * quantidade) / 100;
        
        const refeicao = {
            id: Date.now(),
            tipo: tipoRefeicao,
            alimento: alimento,
            quantidade: quantidade,
            calorias: Math.round(caloriasTotal),
            data: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            sincronizado: false
        };

        // Adicionar ao localStorage
        this.refeicoes.push(refeicao);
        this.salvarDados();
        
        // Tentar sincronizar com Firebase
        try {
            await this.firebaseService.adicionarAlimento({
                refeicao: tipoRefeicao,
                quantidade: quantidade,
                calorias: Math.round(caloriasTotal),
                alimento: alimento
            });
            refeicao.sincronizado = true;
            this.salvarDados();
        } catch (error) {
            console.error('Erro ao sincronizar com Firebase:', error);
            // Dados ficam no localStorage para sincronização posterior
        }
        
        this.atualizarResumo();
        this.renderizarRefeicoes();
        
        // Limpar formulário
        document.getElementById('refeicaoForm').reset();
        
        // Feedback visual
        this.mostrarFeedback('Refeição adicionada com sucesso!');
        
        // Atualizar estado global
        this.stateManager.updateConsumo();
    }

    removerRefeicao(id) {
        this.refeicoes = this.refeicoes.filter(r => r.id !== id);
        this.salvarDados();
        this.atualizarResumo();
        this.renderizarRefeicoes();
        this.mostrarFeedback('Refeição removida!');
        
        // Atualizar estado global
        this.stateManager.updateConsumo();
    }

    getRefeicoesDoDia() {
        const hoje = new Date().toISOString().split('T')[0];
        return this.refeicoes.filter(r => r.data === hoje);
    }

    atualizarResumo() {
        const refeicoesDoDia = this.getRefeicoesDoDia();
        const caloriasConsumidas = refeicoesDoDia.reduce((total, r) => total + r.calorias, 0);
        const caloriasRestantes = Math.max(0, this.metaCalorias - caloriasConsumidas);
        const progresso = Math.min(100, (caloriasConsumidas / this.metaCalorias) * 100);

        document.getElementById('caloriasConsumidas').textContent = `${caloriasConsumidas} kcal`;
        document.getElementById('caloriasRestantes').textContent = `${caloriasRestantes} kcal`;
        document.getElementById('progressoCalorias').style.width = `${progresso}%`;
        
        // Atualizar meta exibida
        document.getElementById('metaCalorias').textContent = `${this.metaCalorias} kcal`;

        // Feedback visual baseado no progresso
        const progressBar = document.getElementById('progressoCalorias');
        if (progresso >= 100) {
            progressBar.style.backgroundColor = '#f44336'; // Vermelho se exceder
        } else if (progresso >= 80) {
            progressBar.style.backgroundColor = '#ff9800'; // Laranja se próximo
        } else {
            progressBar.style.backgroundColor = '#4caf50'; // Verde se normal
        }
    }

    renderizarRefeicoes() {
        const container = document.getElementById('listaRefeicoes');
        const refeicoesDoDia = this.getRefeicoesDoDia();
        
        if (refeicoesDoDia.length === 0) {
            container.innerHTML = '<p class="sem-dados">Nenhuma refeição registrada hoje.</p>';
            return;
        }

        container.innerHTML = refeicoesDoDia.map(refeicao => `
            <div class="refeicao-item">
                <div class="refeicao-info">
                    <h4>${refeicao.tipo}</h4>
                    <p><strong>${refeicao.alimento}</strong></p>
                    <p>${refeicao.quantidade}g - ${refeicao.calorias} kcal</p>
                    <small>${refeicao.hora}</small>
                </div>
                <button onclick="controleAlimentar.removerRefeicao(${refeicao.id})" class="btn-remover">
                    ✕
                </button>
            </div>
        `).join('');
    }

    salvarDados() {
        localStorage.setItem('refeicoes', JSON.stringify(this.refeicoes));
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
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.controleAlimentar = new ControleAlimentar();
});

