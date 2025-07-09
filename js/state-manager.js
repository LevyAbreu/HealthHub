// Gerenciador de Estado Centralizado para HealthHub
class StateManager {
    constructor() {
        this.listeners = {};
        this.state = {
            usuario: {
                nome: '',
                idade: 0,
                peso: 0,
                altura: 0,
                imc: 0
            },
            metas: {
                calorias: 2000,
                agua: 2000
            },
            consumo: {
                caloriasHoje: 0,
                aguaHoje: 0,
                refeicoes: [],
                registrosAgua: []
            },
            configuracoes: {
                notificacoes: true,
                syncAuto: true
            }
        };
        this.init();
    }

    init() {
        // Carregar estado do localStorage
        this.loadFromStorage();
        
        // Configurar listeners para mudanças no localStorage de outras abas
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith('healthhub_')) {
                this.handleStorageChange(e);
            }
        });

        // Configurar listeners para eventos customizados
        window.addEventListener('healthhub_state_change', (e) => {
            this.handleStateChange(e.detail);
        });
    }

    // Carregar estado do localStorage
    loadFromStorage() {
        try {
            // Carregar dados do usuário
            const usuario = JSON.parse(localStorage.getItem('healthhub_usuario') || '{}');
            if (Object.keys(usuario).length > 0) {
                this.state.usuario = { ...this.state.usuario, ...usuario };
                this.calculateIMC();
            }

            // Carregar metas
            const metas = JSON.parse(localStorage.getItem('healthhub_metas') || '{}');
            if (Object.keys(metas).length > 0) {
                this.state.metas = { ...this.state.metas, ...metas };
            }

            // Carregar configurações
            const config = JSON.parse(localStorage.getItem('healthhub_configuracoes') || '{}');
            if (Object.keys(config).length > 0) {
                this.state.configuracoes = { ...this.state.configuracoes, ...config };
            }

            // Carregar dados de consumo
            this.loadConsumptionData();

        } catch (error) {
            console.error('Erro ao carregar estado do localStorage:', error);
        }
    }

    // Carregar dados de consumo do dia
    loadConsumptionData() {
        const hoje = new Date().toISOString().split('T')[0];
        
        // Carregar refeições
        const refeicoes = JSON.parse(localStorage.getItem('refeicoes') || '[]');
        const refeicoesDoDia = refeicoes.filter(r => r.data === hoje);
        this.state.consumo.refeicoes = refeicoesDoDia;
        this.state.consumo.caloriasHoje = refeicoesDoDia.reduce((total, r) => total + (r.calorias || 0), 0);

        // Carregar registros de água
        const registrosAgua = JSON.parse(localStorage.getItem('registrosAgua') || '[]');
        const aguaDoDia = registrosAgua.filter(r => r.data === hoje);
        this.state.consumo.registrosAgua = aguaDoDia;
        this.state.consumo.aguaHoje = aguaDoDia.reduce((total, r) => total + (r.quantidade || 0), 0);
    }

    // Calcular IMC
    calculateIMC() {
        if (this.state.usuario.peso > 0 && this.state.usuario.altura > 0) {
            this.state.usuario.imc = this.state.usuario.peso / (this.state.usuario.altura * this.state.usuario.altura);
        }
    }

    // Atualizar dados do usuário
    updateUsuario(dadosUsuario) {
        this.state.usuario = { ...this.state.usuario, ...dadosUsuario };
        this.calculateIMC();
        
        // Salvar no localStorage
        localStorage.setItem('healthhub_usuario', JSON.stringify(this.state.usuario));
        
        // Notificar listeners
        this.notifyListeners('usuario', this.state.usuario);
        
        // Disparar evento para outras abas
        this.dispatchCrossTabEvent('usuario', this.state.usuario);
    }

    // Atualizar metas
    updateMetas(novasMetas) {
        this.state.metas = { ...this.state.metas, ...novasMetas };
        
        // Salvar no localStorage
        localStorage.setItem('healthhub_metas', JSON.stringify(this.state.metas));
        
        // Atualizar configurações antigas para compatibilidade
        const configAgua = JSON.parse(localStorage.getItem('configAgua') || '{}');
        configAgua.metaDiaria = this.state.metas.agua;
        localStorage.setItem('configAgua', JSON.stringify(configAgua));
        
        // Notificar listeners
        this.notifyListeners('metas', this.state.metas);
        
        // Disparar evento para outras abas
        this.dispatchCrossTabEvent('metas', this.state.metas);
    }

    // Atualizar configurações
    updateConfiguracoes(novasConfiguracoes) {
        this.state.configuracoes = { ...this.state.configuracoes, ...novasConfiguracoes };
        
        // Salvar no localStorage
        localStorage.setItem('healthhub_configuracoes', JSON.stringify(this.state.configuracoes));
        
        // Notificar listeners
        this.notifyListeners('configuracoes', this.state.configuracoes);
        
        // Disparar evento para outras abas
        this.dispatchCrossTabEvent('configuracoes', this.state.configuracoes);
    }

    // Atualizar dados de consumo
    updateConsumo() {
        this.loadConsumptionData();
        
        // Notificar listeners
        this.notifyListeners('consumo', this.state.consumo);
        
        // Disparar evento para outras abas
        this.dispatchCrossTabEvent('consumo', this.state.consumo);
    }

    // Registrar listener para mudanças de estado
    subscribe(key, callback) {
        if (!this.listeners[key]) {
            this.listeners[key] = [];
        }
        this.listeners[key].push(callback);
        
        // Chamar callback imediatamente com o estado atual
        callback(this.state[key]);
    }

    // Remover listener
    unsubscribe(key, callback) {
        if (this.listeners[key]) {
            this.listeners[key] = this.listeners[key].filter(cb => cb !== callback);
        }
    }

    // Notificar todos os listeners de uma chave específica
    notifyListeners(key, data) {
        if (this.listeners[key]) {
            this.listeners[key].forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error('Erro ao executar listener:', error);
                }
            });
        }
    }

    // Disparar evento customizado para comunicação entre abas
    dispatchCrossTabEvent(key, data) {
        const event = new CustomEvent('healthhub_state_change', {
            detail: { key, data }
        });
        window.dispatchEvent(event);
    }

    // Lidar com mudanças no localStorage de outras abas
    handleStorageChange(e) {
        const key = e.key.replace('healthhub_', '');
        const newValue = e.newValue ? JSON.parse(e.newValue) : null;
        
        if (newValue && this.state[key]) {
            this.state[key] = newValue;
            
            // Recalcular IMC se dados do usuário mudaram
            if (key === 'usuario') {
                this.calculateIMC();
            }
            
            // Notificar listeners
            this.notifyListeners(key, newValue);
        }
    }

    // Lidar com eventos customizados
    handleStateChange(detail) {
        const { key, data } = detail;
        
        if (this.state[key]) {
            this.state[key] = data;
            
            // Recalcular IMC se dados do usuário mudaram
            if (key === 'usuario') {
                this.calculateIMC();
            }
            
            // Notificar listeners
            this.notifyListeners(key, data);
        }
    }

    // Obter estado atual
    getState(key = null) {
        return key ? this.state[key] : this.state;
    }

    // Método para sincronizar com Firebase
    async syncWithFirebase() {
        if (window.firebaseService) {
            try {
                // Sincronizar dados do usuário
                await window.firebaseService.atualizarUsuario(this.state.usuario);
                
                // Sincronizar dados de consumo
                await window.firebaseService.sincronizarDados();
                
                console.log('Estado sincronizado com Firebase');
            } catch (error) {
                console.error('Erro ao sincronizar com Firebase:', error);
            }
        }
    }

    // Método para debug
    debug() {
        console.log('Estado atual:', this.state);
        console.log('Listeners registrados:', Object.keys(this.listeners));
    }
}

// Criar instância global do gerenciador de estado
window.stateManager = new StateManager();

export default window.stateManager;

