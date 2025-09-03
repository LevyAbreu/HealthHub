# HealthHub

## Visão Geral

O **HealthHub** é um sistema web de monitoramento da saúde que integra funcionalidades essenciais para o bem-estar diário do usuário. O projeto oferece uma interface visual agradável e acessível, permitindo acompanhar aspectos como alimentação, atividades físicas, hidratação e IMC.

> Acesse a versão online: [HealthHub](https://levyabreu.github.io/HealthHub/)

---

## Funcionalidades Atuais

### IMC (Índice de Massa Corporal)

* Cálculo de IMC com base na altura e peso informados
* Feedback visual e textual de acordo com a classificação (baixo peso, normal, sobrepeso, etc.)
* Indicador gráfico dinâmico com cores

### Controle de Alimentação

* Registro das refeições por categoria (café da manhã, almoço, etc.)
* Cálculo automático de calorias com base nos alimentos informados
* Barra de progresso da meta diária de calorias
* Histórico de refeições no dia atual
* Armazenamento local (LocalStorage)

### Monitoramento de Hidratação

* Visual de copo d'água preenchível
* Botões de registro rápido (250ml, 500ml, 750ml)
* Meta diária ajustável
* Exibição da quantidade ingerida e da meta restante
* Histórico salvo no navegador

### Registro de Atividades Físicas

* Cadastro de tipos de exercícios com tempo de execução
* Cálculo estimado de calorias gastas
* Barra de progresso de metas
* Filtros por período (hoje, semana, mês)

---

## Tecnologias Utilizadas

* **HTML5** – Estrutura semântica
* **CSS3** – Layout responsivo com Flexbox e animações
* **JavaScript (ES6)** – Lógica de negócio e manipulação de dados
* **LocalStorage API** – Persistência dos dados no navegador

---

## Estrutura do Projeto

```
HealthHub/
├── assets/           
├── css/
│   ├── style.css      
├── js/
│   ├── agua.js
│   ├── alimentacao.js
│   ├── exercicios.js
│   ├── firebase-config.js
│   ├── firebase-service.js
│   ├── main.js
│   ├── perfil.js
│   ├── saude-mental.js
│   ├── sono.js
│   └── state-manager.js
├── alimentacao.html
├── exercicios.html
├── imc.html
├── index.html
├── pefil.html
├── saude-mental.html
└── sono.html
```

---

## Como Usar

1. Clone ou baixe o repositório
2. Abra o arquivo `index.html` em qualquer navegador moderno
3. Navegue pelas seções no menu superior
4. Comece a registrar seus dados e acompanhar seu progresso

---

## Melhorias Futuras (em desenvolvimento)

* Monitoramento de ingestão de água
* Módulo de exames e histórico clínico
* Registro de alergias e restrições alimentares
* Lembretes de hidratação via notificação do navegador
* Relatórios e gráficos mais detalhados
* Versão em aplicativo mobile

---

## Compatibilidade

Totalmente funcional nos principais navegadores:

* Google Chrome
* Mozilla Firefox
* Microsoft Edge
* Safari

---

## Autoria

Desenvolvido por **Levy Abreu**
[GitHub](https://github.com/LevyAbreu) | [vlbdsa.vag@gmail.com](mailto:vlbdsa.vag@gmail.com)

### Este projeto está licenciado sob a Licença Creative Commons Atribuição-NãoComercial 4.0 Internacional (CC BY-NC 4.0).