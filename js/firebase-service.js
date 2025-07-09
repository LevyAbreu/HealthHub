import { 
    db, 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    getDocs, 
    updateDoc, 
    deleteDoc, 
    query, 
    where, 
    orderBy, 
    limit 
} from './firebase-config.js';

class FirebaseService {
    constructor() {
        this.currentUserId = localStorage.getItem('currentUserId') || this.generateUserId();
        localStorage.setItem('currentUserId', this.currentUserId);
    }

    generateUserId() {
        return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ===== USUÁRIOS =====
    
    async criarUsuario(dadosUsuario) {
        try {
            const usuarioRef = doc(db, 'usuarios', this.currentUserId);
            await setDoc(usuarioRef, {
                id: this.currentUserId,
                nome: dadosUsuario.nome,
                idade: dadosUsuario.idade,
                peso: dadosUsuario.peso,
                altura: dadosUsuario.altura,
                criadoEm: new Date().toISOString()
            });
            console.log('Usuário criado com sucesso:', this.currentUserId);
            return this.currentUserId;
        } catch (error) {
            console.error('Erro ao criar usuário:', error);
            throw error;
        }
    }

    async obterUsuario(userId = this.currentUserId) {
        try {
            const usuarioRef = doc(db, 'usuarios', userId);
            const usuarioSnap = await getDoc(usuarioRef);
            
            if (usuarioSnap.exists()) {
                return usuarioSnap.data();
            } else {
                console.log('Usuário não encontrado');
                return null;
            }
        } catch (error) {
            console.error('Erro ao obter usuário:', error);
            throw error;
        }
    }

    async atualizarUsuario(dadosUsuario, userId = this.currentUserId) {
        try {
            const usuarioRef = doc(db, 'usuarios', userId);
            await updateDoc(usuarioRef, {
                ...dadosUsuario,
                atualizadoEm: new Date().toISOString()
            });
            console.log('Usuário atualizado com sucesso');
        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);
            throw error;
        }
    }

    // ===== CONSUMO DE ALIMENTOS =====
    
    async adicionarAlimento(dadosAlimento) {
        try {
            const alimentoRef = collection(db, 'consumo');
            const alimentoDoc = await addDoc(alimentoRef, {
                user: this.currentUserId,
                refeicao: dadosAlimento.refeicao,
                quantidade: dadosAlimento.quantidade,
                data_hora: new Date().toISOString(),
                calorias_gramas: dadosAlimento.calorias,
                alimento: dadosAlimento.alimento,
                tipo: 'alimento'
            });
            console.log('Alimento adicionado com ID:', alimentoDoc.id);
            return alimentoDoc.id;
        } catch (error) {
            console.error('Erro ao adicionar alimento:', error);
            throw error;
        }
    }

    async obterAlimentosDoDia(data = null) {
        try {
            const dataConsulta = data || new Date().toISOString().split('T')[0];
            const alimentosRef = collection(db, 'consumo');
            const q = query(
                alimentosRef,
                where('user', '==', this.currentUserId),
                where('tipo', '==', 'alimento'),
                orderBy('data_hora', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const alimentos = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const dataAlimento = data.data_hora.split('T')[0];
                if (dataAlimento === dataConsulta) {
                    alimentos.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            return alimentos;
        } catch (error) {
            console.error('Erro ao obter alimentos do dia:', error);
            throw error;
        }
    }

    async removerAlimento(alimentoId) {
        try {
            await deleteDoc(doc(db, 'consumo', alimentoId));
            console.log('Alimento removido com sucesso');
        } catch (error) {
            console.error('Erro ao remover alimento:', error);
            throw error;
        }
    }

    // ===== CONSUMO DE BEBIDAS =====
    
    async adicionarBebida(dadosBebida) {
        try {
            const bebidaRef = collection(db, 'consumo');
            const bebidaDoc = await addDoc(bebidaRef, {
                user: this.currentUserId,
                tipo: dadosBebida.tipo,
                quantidade: dadosBebida.quantidade,
                data_hora: new Date().toISOString(),
                categoria: 'bebida'
            });
            console.log('Bebida adicionada com ID:', bebidaDoc.id);
            return bebidaDoc.id;
        } catch (error) {
            console.error('Erro ao adicionar bebida:', error);
            throw error;
        }
    }

    async obterBebidasDoDia(data = null) {
        try {
            const dataConsulta = data || new Date().toISOString().split('T')[0];
            const bebidasRef = collection(db, 'consumo');
            const q = query(
                bebidasRef,
                where('user', '==', this.currentUserId),
                where('categoria', '==', 'bebida'),
                orderBy('data_hora', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const bebidas = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const dataBebida = data.data_hora.split('T')[0];
                if (dataBebida === dataConsulta) {
                    bebidas.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            return bebidas;
        } catch (error) {
            console.error('Erro ao obter bebidas do dia:', error);
            throw error;
        }
    }

    async removerBebida(bebidaId) {
        try {
            await deleteDoc(doc(db, 'consumo', bebidaId));
            console.log('Bebida removida com sucesso');
        } catch (error) {
            console.error('Erro ao remover bebida:', error);
            throw error;
        }
    }

    // ===== ESTATÍSTICAS E RELATÓRIOS =====
    
    async obterEstatisticasSemanais() {
        try {
            const hoje = new Date();
            const inicioSemana = new Date(hoje);
            inicioSemana.setDate(hoje.getDate() - hoje.getDay());
            
            const consumoRef = collection(db, 'consumo');
            const q = query(
                consumoRef,
                where('user', '==', this.currentUserId),
                orderBy('data_hora', 'desc')
            );
            
            const querySnapshot = await getDocs(q);
            const dados = [];
            
            querySnapshot.forEach((doc) => {
                const data = doc.data();
                const dataItem = new Date(data.data_hora);
                if (dataItem >= inicioSemana) {
                    dados.push({
                        id: doc.id,
                        ...data
                    });
                }
            });
            
            return this.processarEstatisticas(dados);
        } catch (error) {
            console.error('Erro ao obter estatísticas semanais:', error);
            throw error;
        }
    }

    processarEstatisticas(dados) {
        const alimentos = dados.filter(item => item.tipo === 'alimento');
        const bebidas = dados.filter(item => item.categoria === 'bebida');
        
        const totalCalorias = alimentos.reduce((total, item) => total + (item.calorias_gramas || 0), 0);
        const totalAgua = bebidas
            .filter(item => item.tipo === 'agua')
            .reduce((total, item) => total + item.quantidade, 0);
        
        const diasUnicos = [...new Set(dados.map(item => item.data_hora.split('T')[0]))];
        
        return {
            totalCalorias,
            totalAgua,
            diasAtivos: diasUnicos.length,
            totalRefeicoes: alimentos.length,
            mediaCalorias: alimentos.length > 0 ? Math.round(totalCalorias / diasUnicos.length) : 0,
            mediaAgua: bebidas.length > 0 ? Math.round(totalAgua / diasUnicos.length) : 0
        };
    }

    // ===== SINCRONIZAÇÃO COM LOCALSTORAGE =====
    
    async sincronizarDados() {
        try {
            console.log('Iniciando sincronização de dados...');
            
            // Sincronizar dados de alimentação
            const refeicoesLocal = JSON.parse(localStorage.getItem('refeicoes')) || [];
            for (const refeicao of refeicoesLocal) {
                if (!refeicao.sincronizado) {
                    await this.adicionarAlimento({
                        refeicao: refeicao.tipo,
                        quantidade: refeicao.quantidade,
                        calorias: refeicao.calorias,
                        alimento: refeicao.alimento
                    });
                    refeicao.sincronizado = true;
                }
            }
            localStorage.setItem('refeicoes', JSON.stringify(refeicoesLocal));
            
            // Sincronizar dados de hidratação
            const aguaLocal = JSON.parse(localStorage.getItem('registrosAgua')) || [];
            for (const registro of aguaLocal) {
                if (!registro.sincronizado) {
                    await this.adicionarBebida({
                        tipo: registro.tipo,
                        quantidade: registro.quantidade
                    });
                    registro.sincronizado = true;
                }
            }
            localStorage.setItem('registrosAgua', JSON.stringify(aguaLocal));
            
            console.log('Sincronização concluída com sucesso');
        } catch (error) {
            console.error('Erro na sincronização:', error);
        }
    }

    // ===== MONITORAMENTO AUTOMÁTICO =====
    
    async iniciarMonitoramento() {
        // Sincronizar dados a cada 5 minutos
        setInterval(() => {
            this.sincronizarDados();
        }, 5 * 60 * 1000);
        
        // Verificar metas diárias a cada hora
        setInterval(() => {
            this.verificarMetas();
        }, 60 * 60 * 1000);
        
        console.log('Monitoramento automático iniciado');
    }

    async verificarMetas() {
        try {
            const usuario = await this.obterUsuario();
            if (!usuario) return;
            
            const alimentos = await this.obterAlimentosDoDia();
            const bebidas = await this.obterBebidasDoDia();
            
            const caloriasConsumidas = alimentos.reduce((total, item) => total + (item.calorias_gramas || 0), 0);
            const aguaConsumida = bebidas
                .filter(item => item.tipo === 'agua')
                .reduce((total, item) => total + item.quantidade, 0);
            
            // Verificar meta de calorias (exemplo: 2000 kcal)
            const metaCalorias = 2000;
            if (caloriasConsumidas > metaCalorias * 1.2) {
                this.enviarNotificacao('Atenção!', 'Você excedeu sua meta de calorias diárias em 20%');
            }
            
            // Verificar meta de água (exemplo: 2000ml)
            const metaAgua = 2000;
            if (aguaConsumida < metaAgua * 0.5) {
                this.enviarNotificacao('Hidratação', 'Você está consumindo pouca água hoje. Beba mais!');
            }
            
        } catch (error) {
            console.error('Erro ao verificar metas:', error);
        }
    }

    enviarNotificacao(titulo, mensagem) {
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(titulo, {
                body: mensagem,
                icon: 'assets/health_logo.png'
            });
        }
    }
}

// Exportar instância única do serviço
const firebaseService = new FirebaseService();
export default firebaseService;

