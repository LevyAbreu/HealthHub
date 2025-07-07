class GerenciadorExercicios {
    constructor() {
        this.exercicios = JSON.parse(localStorage.getItem('exercicios')) || [];
        this.metas = {
            exerciciosSemana: 5,
            caloriasSemana: 2000,
            tempoSemana: 300
        };
        this.caloriasExercicio = {
            'caminhada': { baixa: 3, moderada: 4, alta: 5 },
            'corrida': { baixa: 8, moderada: 10, alta: 12 },
            'ciclismo': { baixa: 6, moderada: 8, alta: 10 },
            'natacao': { baixa: 6, moderada: 8, alta: 11 },
            'musculacao': { baixa: 3, moderada: 5, alta: 6 },
            'yoga': { baixa: 2, moderada: 3, alta: 4 },
            'pilates': { baixa: 3, moderada: 4, alta: 5 },
            'danca': { baixa: 4, moderada: 5, alta: 7 },
            'futebol': { baixa: 6, moderada: 8, alta: 10 },
            'basquete': { baixa: 6, moderada: 8, alta: 10 },
            'tenis': { baixa: 5, moderada: 7, alta: 8 },
            'outro': { baixa: 3, moderada: 5, alta: 7 }
        };
        this.periodoAtual = 'hoje';
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.atualizarMetas();
        this.atualizarEstatisticas();
        this.renderizarExercicios();
    }

    setupEventListeners() {
        const form = document.getElementById('exercicioForm');
        form.addEventListener('submit', (e) => this.registrarExercicio(e));

        // Filtros de período
        document.querySelectorAll('.filtro-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.alterarPeriodo(e));
        });
    }

    registrarExercicio(e) {
        e.preventDefault();
        
        const tipo = document.getElementById('tipoExercicio').value;
        const duracao = parseInt(document.getElementById('duracao').value);
        const intensidade = document.getElementById('intensidade').value;
        const observacoes = document.getElementById('observacoes').value;
        
        const caloriasPorMinuto = this.caloriasExercicio[tipo][intensidade];
        const caloriasQueimadas = Math.round(caloriasPorMinuto * duracao);
        
        const exercicio = {
            id: Date.now(),
            tipo: tipo,
            duracao: duracao,
            intensidade: intensidade,
            calorias: caloriasQueimadas,
            observacoes: observacoes,
            data: new Date().toISOString().split('T')[0],
            hora: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        this.exercicios.push(exercicio);
        this.salvarDados();
        this.atualizarMetas();
        this.atualizarEstatisticas();
        this.renderizarExercicios();
        
        // Limpar formulário
        document.getElementById('exercicioForm').reset();
        
        // Feedback visual
        this.mostrarFeedback(`Exercício registrado! ${caloriasQueimadas} kcal queimadas.`);
    }

    removerExercicio(id) {
        this.exercicios = this.exercicios.filter(e => e.id !== id);
        this.salvarDados();
        this.atualizarMetas();
        this.atualizarEstatisticas();
        this.renderizarExercicios();
        this.mostrarFeedback('Exercício removido!');
    }

    alterarPeriodo(e) {
        document.querySelectorAll('.filtro-btn').forEach(btn => btn.classList.remove('active'));
        e.target.classList.add('active');
        this.periodoAtual = e.target.dataset.periodo;
        this.renderizarExercicios();
    }

    getExerciciosPorPeriodo(periodo) {
        const hoje = new Date();
        const exerciciosFiltrados = this.exercicios.filter(exercicio => {
            const dataExercicio = new Date(exercicio.data);
            
            switch(periodo) {
                case 'hoje':
                    return dataExercicio.toDateString() === hoje.toDateString();
                case 'semana':
                    const inicioSemana = new Date(hoje);
                    inicioSemana.setDate(hoje.getDate() - hoje.getDay());
                    return dataExercicio >= inicioSemana;
                case 'mes':
                    return dataExercicio.getMonth() === hoje.getMonth() && 
                           dataExercicio.getFullYear() === hoje.getFullYear();
                default:
                    return true;
            }
        });
        
        return exerciciosFiltrados.sort((a, b) => new Date(b.data + ' ' + b.hora) - new Date(a.data + ' ' + a.hora));
    }

    atualizarMetas() {
        const exerciciosSemana = this.getExerciciosPorPeriodo('semana');
        const totalExercicios = exerciciosSemana.length;
        const totalCalorias = exerciciosSemana.reduce((total, e) => total + e.calorias, 0);
        const totalTempo = exerciciosSemana.reduce((total, e) => total + e.duracao, 0);

        document.getElementById('metaExercicios').textContent = `${totalExercicios}/${this.metas.exerciciosSemana}`;
        document.getElementById('metaCalorias').textContent = `${totalCalorias}/${this.metas.caloriasSemana} kcal`;
        document.getElementById('metaTempo').textContent = `${totalTempo}/${this.metas.tempoSemana} min`;

        // Calcular progresso geral (média das três metas)
        const progressoExercicios = Math.min(100, (totalExercicios / this.metas.exerciciosSemana) * 100);
        const progressoCalorias = Math.min(100, (totalCalorias / this.metas.caloriasSemana) * 100);
        const progressoTempo = Math.min(100, (totalTempo / this.metas.tempoSemana) * 100);
        
        const progressoGeral = Math.round((progressoExercicios + progressoCalorias + progressoTempo) / 3);
        
        document.getElementById('progressoSemanal').style.width = `${progressoGeral}%`;
        document.getElementById('progressoTexto').textContent = `${progressoGeral}% da meta semanal`;
        
        // Cor da barra de progresso
        const progressBar = document.getElementById('progressoSemanal');
        if (progressoGeral < 50) {
            progressBar.style.backgroundColor = '#f44336';
        } else if (progressoGeral < 80) {
            progressBar.style.backgroundColor = '#ff9800';
        } else {
            progressBar.style.backgroundColor = '#4caf50';
        }
    }

    atualizarEstatisticas() {
        const exerciciosMes = this.getExerciciosPorPeriodo('mes');
        const totalExercicios = exerciciosMes.length;
        const totalTempo = exerciciosMes.reduce((total, e) => total + e.duracao, 0);
        const totalCalorias = exerciciosMes.reduce((total, e) => total + e.calorias, 0);
        
        // Exercício favorito (mais praticado)
        const contadorTipos = {};
        exerciciosMes.forEach(e => {
            contadorTipos[e.tipo] = (contadorTipos[e.tipo] || 0) + 1;
        });
        
        const exercicioFavorito = Object.keys(contadorTipos).reduce((a, b) => 
            contadorTipos[a] > contadorTipos[b] ? a : b, '-');

        document.getElementById('totalExercicios').textContent = totalExercicios;
        document.getElementById('totalTempo').textContent = totalTempo;
        document.getElementById('totalCalorias').textContent = totalCalorias;
        document.getElementById('exercicioFavorito').textContent = 
            exercicioFavorito !== '-' ? this.formatarTipoExercicio(exercicioFavorito) : '-';
    }

    renderizarExercicios() {
        const container = document.getElementById('exerciciosLista');
        const exercicios = this.getExerciciosPorPeriodo(this.periodoAtual);

        if (exercicios.length === 0) {
            container.innerHTML = '<p class="empty-state">Nenhum exercício registrado neste período.</p>';
            return;
        }

        container.innerHTML = exercicios.map(exercicio => `
            <div class="exercicio-item">
                <div class="exercicio-info">
                    <div class="exercicio-header">
                        <span class="exercicio-tipo">${this.formatarTipoExercicio(exercicio.tipo)}</span>
                        <span class="exercicio-data">${this.formatarData(exercicio.data)} às ${exercicio.hora}</span>
                    </div>
                    <div class="exercicio-detalhes">
                        <span class="detalhe">⏱️ ${exercicio.duracao} min</span>
                        <span class="detalhe">🔥 ${exercicio.calorias} kcal</span>
                        <span class="detalhe intensidade-${exercicio.intensidade}">
                            📊 ${this.formatarIntensidade(exercicio.intensidade)}
                        </span>
                    </div>
                    ${exercicio.observacoes ? `<p class="exercicio-obs">"${exercicio.observacoes}"</p>` : ''}
                </div>
                <button class="btn-remove" onclick="gerenciadorExercicios.removerExercicio(${exercicio.id})">
                    ✕
                </button>
            </div>
        `).join('');
    }

    formatarTipoExercicio(tipo) {
        const tipos = {
            'caminhada': 'Caminhada',
            'corrida': 'Corrida',
            'ciclismo': 'Ciclismo',
            'natacao': 'Natação',
            'musculacao': 'Musculação',
            'yoga': 'Yoga',
            'pilates': 'Pilates',
            'danca': 'Dança',
            'futebol': 'Futebol',
            'basquete': 'Basquete',
            'tenis': 'Tênis',
            'outro': 'Outro'
        };
        return tipos[tipo] || tipo;
    }

    formatarIntensidade(intensidade) {
        const intensidades = {
            'baixa': 'Baixa',
            'moderada': 'Moderada',
            'alta': 'Alta'
        };
        return intensidades[intensidade] || intensidade;
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
        localStorage.setItem('exercicios', JSON.stringify(this.exercicios));
    }
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    window.gerenciadorExercicios = new GerenciadorExercicios();
});

