import firebaseService from './firebase-service.js';
import stateManager from './state-manager.js';

class PerfilManager {
    constructor() {
        this.firebaseService = firebaseService;
        this.stateManager = stateManager;
        this.init();
    }

    async init() {
        this.setupEventListeners();
        this.setupStateListeners();
        await this.carregarPerfil();
        this.carregarConfiguracoes();
        await this.atualizarEstatisticas();
        this.verificarStatusSync();
        
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
            document.getElementById('altura').value = usuario.altura || '';
        }
        if (usuario.imc !== undefined) {
            document.getElementById('imcAtual').textContent = usuario.imc ? usuario.imc.toFixed(1) : '--';
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
            nome: document.getElementById('nome').value,
            idade: parseInt(document.getElementById('idade').value),
            peso: parseFloat(document.getElementById('peso').value),
            altura: parseFloat(document.getElementById('altura').value)
        };

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

