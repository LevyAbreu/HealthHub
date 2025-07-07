class ControleAlimentar {
    constructor() {
        this.refeicoes = JSON.parse(localStorage.getItem('refeicoes')) || [];
        this.metaCalorias = 2000;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.atualizarResumo();
        this.renderizarRefeicoes();
    }

    setupEventListeners() {
        const form = document.getElementById('refeicaoForm');
        form.addEventListener('submit', (e) => this.adicionarRefeicao(e));
    }

    adicionarRefeicao(e) {
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
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        this.refeicoes.push(refeicao);
        this.salvarDados();
        this.atualizarResumo();
        this.renderizarRefeicoes();
        
        // Limpar formulário
        document.getElementById('refeicaoForm').reset();
        
        // Feedback visual
        this.mostrarFeedback('Refeição adicionada com sucesso!');
    }

    removerRefeicao(id) {
        this.refeicoes = this.refeicoes.filter(r => r.id !== id);
        this.salvarDados();
        this.atualizarResumo();
        this.renderizarRefeicoes();
        this.mostrarFeedback('Refeição removida!');
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
        
        // Mudar cor da barra de progresso baseado no progresso
        const progressBar = document.getElementById('progressoCalorias');
        if (progresso < 50) {
            progressBar.style.backgroundColor = '#4caf50';
        } else if (progresso < 80) {
            progressBar.style.backgroundColor = '#ffeb3b';
        } else if (progresso < 100) {
            progressBar.style.backgroundColor = '#ff9800';
        } else {
            progressBar.style.backgroundColor = '#f44336';
        }
    }

    renderizarRefeicoes() {
        const container = document.getElementById('refeicoesLista');
        const refeicoesDoDia = this.getRefeicoesDoDia();

        if (refeicoesDoDia.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhuma refeição registrada hoje.</p>';
            return;
        }

        const refeicoesAgrupadas = this.agruparPorTipo(refeicoesDoDia);
        
        container.innerHTML = Object.keys(refeicoesAgrupadas).map(tipo => {
            const refeicoes = refeicoesAgrupadas[tipo];
            const totalCalorias = refeicoes.reduce((total, r) => total + r.calorias, 0);
            
            return `
                <div class="refeicao-grupo">
                    <h4>${this.formatarTipoRefeicao(tipo)} - ${totalCalorias} kcal</h4>
                    <div class="refeicao-items">
                        ${refeicoes.map(r => `
                            <div class="refeicao-item">
                                <div class="refeicao-info">
                                    <span class="alimento">${r.alimento}</span>
                                    <span class="detalhes">${r.quantidade}g - ${r.calorias} kcal</span>
                                    <span class="hora">${r.hora}</span>
                                </div>
                                <button class="btn-remove" onclick="controleAlimentar.removerRefeicao(${r.id})">
                                    ✕
                                </button>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    agruparPorTipo(refeicoes) {
        return refeicoes.reduce((grupos, refeicao) => {
            const tipo = refeicao.tipo;
            if (!grupos[tipo]) {
                grupos[tipo] = [];
            }
            grupos[tipo].push(refeicao);
            return grupos;
        }, {});
    }

    formatarTipoRefeicao(tipo) {
        const tipos = {
            'cafe-manha': 'Café da Manhã',
            'almoco': 'Almoço',
            'lanche': 'Lanche',
            'jantar': 'Jantar',
            'ceia': 'Ceia'
        };
        return tipos[tipo] || tipo;
    }

    mostrarFeedback(mensagem) {
        // Criar elemento de feedback
        const feedback = document.createElement('div');
        feedback.className = 'feedback-message';
        feedback.textContent = mensagem;
        document.body.appendChild(feedback);

        // Remover após 3 segundos
        setTimeout(() => {
            feedback.remove();
        }, 3000);
    }

    salvarDados() {
        localStorage.setItem('refeicoes', JSON.stringify(this.refeicoes));
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.controleAlimentar = new ControleAlimentar();
});

