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
let alergias = [];

// Função para adicionar alergia
function adicionarAlergia() {
    const input = document.getElementById('alergia');
    const nomeAlergia = input.value.trim().toLowerCase();
    
    if (nomeAlergia === '') {
        alert('Por favor, digite o nome de uma alergia.');
        return;
    }
    
    // Verificar se a alergia já foi adicionada
    if (alergias.some(a => a.nome === nomeAlergia)) {
        alert('Esta alergia já foi adicionada.');
        return;
    }
    
    // Buscar alimentos a evitar no banco de dados
    let alimentosEvitar = alergiasBanco[nomeAlergia] || ['Consulte um médico para mais informações'];
    
    // Adicionar a alergia ao array
    alergias.push({
        nome: nomeAlergia,
        alimentos: alimentosEvitar
    });
    
    // Limpar o input
    input.value = '';
    
    // Atualizar a exibição
    atualizarListaAlergias();
}

// Função para atualizar a lista de alergias na tela
function atualizarListaAlergias() {
    const container = document.getElementById('alergiasLista');
    
    if (alergias.length === 0) {
        container.innerHTML = '<p class="empty-state">Nenhuma alergia registrada.</p>';
        return;
    }
    
    let html = '';
    alergias.forEach((alergia, index) => {
        html += `
            <div class="alergia-item" style="margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 8px;">
                <p class="azul" style="font-weight: bold; color: #00BCD4; margin: 0 0 10px 0; text-transform: capitalize;">${alergia.nome}</p>
                <div style="display: flex; align-items: center; flex-wrap: wrap; gap: 10px;">
                    <p class="Alimentos_evitar" style="margin: 0; font-weight: bold;">Alimentos a evitar:</p>
                    ${alergia.alimentos.map(alimento => 
                        `<p class="azul" style="margin: 0; color: #00BCD4; text-transform: capitalize;">${alimento}</p>`
                    ).join(' - ')}
                </div>
                <button onclick="removerAlergia(${index})" style="margin-top: 10px; background: #f44336; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Remover</button>
            </div>
        `;
    });
    
    container.innerHTML = html;
}

// Função para remover alergia
function removerAlergia(index) {
    alergias.splice(index, 1);
    atualizarListaAlergias();
}

// Permitir adicionar alergia pressionando Enter
document.addEventListener('DOMContentLoaded', function() {
    const input = document.getElementById('alergia');
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            adicionarAlergia();
        }
    });
});