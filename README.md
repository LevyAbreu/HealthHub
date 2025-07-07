# HealthHub - Monitoramento da Saúde

## Descrição do Projeto

O HealthHub é um sistema web completo para monitoramento da saúde que permite aos usuários acompanhar diversos aspectos do seu bem-estar de forma integrada e intuitiva. O projeto foi desenvolvido com HTML, CSS e JavaScript vanilla, oferecendo uma experiência responsiva e moderna.

## Funcionalidades 

#### 1. Controle Alimentar
- Registro de refeições por tipo (café da manhã, almoço, lanche, jantar, ceia)
- Cálculo automático de calorias baseado na quantidade e tipo de alimento
- Acompanhamento da meta diária de calorias
- Barra de progresso visual
- Histórico de refeições do dia
- Armazenamento local dos dados

#### 2. Gerenciamento de Exercícios 
- Registro de atividades físicas com 12 tipos diferentes
- Controle de duração e intensidade
- Cálculo automático de calorias queimadas
- Metas semanais (exercícios, calorias, tempo)
- Filtros por período (hoje, semana, mês)
- Estatísticas detalhadas
- Sistema de progresso visual

#### 3. Controle de Hidratação
- Visualização em formato de copo com marcações
- Botões rápidos para quantidades comuns (250ml, 500ml, 750ml)
- Registro personalizado com diferentes tipos de líquidos
- Sistema de lembretes configurável
- Notificações do navegador
- Estatísticas semanais
- Meta diária configurável

## Estrutura do Projeto

```
healthhub-project/
├── assets/
│   ├── background.jpg
│   ├── doctor.png
│   └── health_logo.png
├── css/
│   └── style.css
├── js/
│   ├── main.js (IMC)
│   ├── alimentacao.js
│   ├── exercicios.js
│   └── agua.js
├── index.html
├── imc.html
├── alimentacao.html
├── exercicios.html
└── agua.html
```

## Tecnologias Utilizadas

- **HTML5**: Estrutura semântica e acessível
- **CSS3**: Design responsivo com Flexbox e Grid
- **JavaScript ES6+**: Funcionalidades interativas e armazenamento local
- **LocalStorage**: Persistência de dados no navegador
- **Notification API**: Sistema de lembretes

## Características Técnicas

### Design Responsivo
- Layout adaptável para desktop, tablet e mobile
- Grid system flexível
- Componentes que se reorganizam automaticamente

### Experiência do Usuário
- Interface intuitiva e moderna
- Feedback visual imediato
- Animações suaves
- Estados de loading e feedback

### Armazenamento de Dados
- Todos os dados são salvos localmente no navegador
- Estrutura JSON organizada por funcionalidade
- Dados persistem entre sessões

## Funcionalidades Avançadas

### Sistema de Notificações
- Lembretes automáticos de hidratação
- Permissão do usuário para notificações
- Intervalos configuráveis

### Cálculos Automáticos
- Calorias de alimentos baseadas em quantidade
- Calorias queimadas por exercício e intensidade
- Progresso de metas em tempo real

### Visualizações Interativas
- Gauge de IMC com cores dinâmicas
- Copo de água com preenchimento animado
- Barras de progresso responsivas

## Como Usar

1. Abra o arquivo `index.html` em um navegador web
2. Navegue pelas diferentes seções usando o menu superior
3. Registre suas atividades em cada módulo
4. Acompanhe seu progresso através das estatísticas

## Próximas Funcionalidades

- **Monitoramento de Exames**: Registro e acompanhamento de consultas médicas
- **Alergias e Intolerâncias**: Cadastro de restrições alimentares

## Compatibilidade

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+