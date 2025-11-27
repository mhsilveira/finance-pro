# 💰 Finance Pro

Sistema completo de controle financeiro pessoal com interface moderna e funcionalidades avançadas.

## 📋 Índice

- [Sobre o Projeto](#sobre-o-projeto)
- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Pré-requisitos](#pré-requisitos)
- [Instalação](#instalação)
- [Como Usar](#como-usar)
- [Estrutura do Projeto](#estrutura-do-projeto)
- [Desenvolvimento](#desenvolvimento)
- [Deploy](#deploy)
- [Contribuindo](#contribuindo)

## 🎯 Sobre o Projeto

Finance Pro é uma aplicação full-stack para gerenciamento financeiro pessoal que permite aos usuários controlar suas receitas e despesas, visualizar análises detalhadas, definir orçamentos e acompanhar metas financeiras.

### Principais Diferenciais

- ✨ **Interface Moderna**: Design clean com gradientes blue/purple e suporte a dark mode
- 📊 **Dashboards Interativos**: Visualizações em tempo real com gráficos e estatísticas
- 🔍 **Filtros Avançados**: Busca e filtragem por múltiplos critérios
- 🔄 **Transações Recorrentes**: Automação de contas mensais e salários
- 📥 **Importação/Exportação CSV**: Migração e backup de dados facilitados
- 🎯 **Gestão de Orçamentos**: Controle de gastos por categoria com alertas visuais
- 🌙 **Dark Mode**: Tema escuro com persistência de preferência

## ✨ Funcionalidades

### 📊 Dashboard
- Visão geral das finanças
- Estatísticas em tempo real (total, receitas, despesas, saldo)
- Gráficos de tendência mensal (últimos 6 meses)
- Distribuição de gastos por categoria (gráfico de rosca)
- Lista de transações recentes

### 💳 Transações
- Cadastro de receitas e despesas
- Edição e exclusão de transações
- Filtros avançados:
  - Busca por descrição
  - Filtro por tipo (receita/despesa)
  - Filtro por categoria
  - Filtro por origem (cartão/dinheiro)
  - Filtro por período (data inicial e final)
- Exportação de transações para CSV
- Importação em lote via CSV
- Download de modelo CSV para importação

### 🔄 Transações Recorrentes
- Cadastro de transações que se repetem
- Frequências: diária, semanal, mensal, anual
- Ativar/desativar recorrentes sem excluir
- Geração manual de transação a partir do template
- Ideal para: aluguel, contas fixas, salário, assinaturas

### 📈 Análises e Insights
- Filtros por período (todos, último mês, último trimestre)
- Taxa de economia calculada automaticamente
- Distribuição detalhada por categoria com percentuais
- Comparação mensal de receitas vs despesas
- Top 10 maiores despesas
- Médias por categoria

### 🎯 Orçamentos e Metas
- Definição de limites mensais por categoria
- Acompanhamento visual do progresso
- Alertas por cores:
  - Verde: dentro do orçamento
  - Amarelo: atenção (80-100%)
  - Vermelho: acima do limite
- Metas financeiras com tracking de progresso
- Contador de dias até o prazo
- Armazenamento local (localStorage)

## 🛠 Tecnologias

### Frontend
- **Next.js 15** - Framework React com App Router
- **React 19** - Biblioteca UI
- **TypeScript** - Type safety
- **Tailwind CSS 4** - Estilização utility-first
- **Chart.js** - Visualização de dados
- **Radix UI** - Componentes acessíveis
- **Biome** - Linting e formatação
- **Google Fonts (Poppins)** - Tipografia moderna

### Backend
- **Node.js 20** - Runtime JavaScript
- **AWS Lambda** - Serverless functions
- **MongoDB** - Banco de dados NoSQL
- **Mongoose** - ODM para MongoDB
- **Zod** - Validação de schemas
- **Serverless Framework** - Deploy e gerenciamento

### Arquitetura Backend
- **Clean Architecture** com separação clara de camadas:
  - **Domain**: Entidades e casos de uso
  - **Application**: DTOs e validadores
  - **Infrastructure**: Implementações (MongoDB, HTTP)
  - **Interface**: Handlers Lambda

## 📋 Pré-requisitos

- Node.js 20.x ou superior
- NPM ou Yarn
- MongoDB (local ou Atlas)
- AWS CLI (opcional, para deploy)

## 🚀 Instalação

### 1. Clone o repositório

```bash
git clone https://github.com/mhsilveira/financial-control.git
cd financial-control
```

### 2. Instale as dependências

```bash
# Instalar dependências do root
npm install

# Instalar dependências do backend
cd backend
npm install

# Instalar dependências do frontend
cd ../frontend
npm install
```

### 3. Configure as variáveis de ambiente

#### Backend (.env)
```bash
cd backend
cp .env.example .env
```

Edite o arquivo `.env`:
```env
MONGODB_URI=mongodb://localhost:27017/financial-control
# ou para MongoDB Atlas:
# MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/financial-control
```

#### Frontend (.env.local)
```bash
cd frontend
cp .env.example .env.local
```

Edite o arquivo `.env.local`:
```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001/dev
```

### 4. Inicie os servidores

#### Backend (Serverless Offline)
```bash
cd backend
npm run dev
# Servidor roda em http://localhost:3001
```

#### Frontend (Next.js)
```bash
cd frontend
npm run dev
# Aplicação roda em http://localhost:3000
```

## 📖 Como Usar

### 1️⃣ Cadastrar Transações

1. Acesse http://localhost:3000/transactions
2. Clique em "Nova Transação"
3. Preencha os campos:
   - Descrição
   - Valor
   - Tipo (receita ou despesa)
   - Categoria
   - Origem (cartão ou dinheiro)
   - Data
   - Cartão (opcional)
4. Clique em "Adicionar"

### 2️⃣ Filtrar Transações

1. Na página de Transações, use os filtros:
   - **Buscar**: Digite na descrição
   - **Tipo**: Selecione receita ou despesa
   - **Categoria**: Escolha uma categoria específica
   - **Origem**: Cartão ou dinheiro
   - **Período**: Defina data inicial e final
2. Veja os resultados atualizados em tempo real
3. Clique em "Limpar filtros" para resetar

### 3️⃣ Exportar/Importar CSV

#### Exportar:
1. Na página de Transações, clique em "Exportar CSV"
2. O arquivo `transacoes_YYYY-MM-DD.csv` será baixado
3. Contém todas as transações filtradas

#### Importar:
1. Clique em "Modelo CSV" para baixar um template
2. Preencha o CSV com suas transações
3. Clique em "Importar CSV" e selecione o arquivo
4. Aguarde o processamento
5. Veja o resultado (X importadas, Y erros)

**Formato do CSV:**
```csv
Data,Descrição,Valor,Tipo,Categoria,Origem,Cartão
2025-11-27,Aluguel,1500.00,expense,Aluguel,CASH,
2025-11-25,Salário,5000.00,income,Salário,CASH,
2025-11-24,Almoço,45.50,expense,Alimentação,CREDIT_CARD,Nubank
```

### 4️⃣ Criar Transações Recorrentes

1. Acesse http://localhost:3000/recurring
2. Clique em "Nova Recorrente"
3. Preencha:
   - Descrição (ex: "Aluguel")
   - Valor
   - Tipo
   - Categoria
   - Frequência (mensal, semanal, etc.)
   - Origem
   - Data de início
4. A recorrente fica salva
5. Clique em "Gerar Transação Agora" quando precisar criar uma ocorrência

### 5️⃣ Definir Orçamentos

1. Acesse http://localhost:3000/budget
2. Na seção "Orçamentos Mensais", clique em "Adicionar Orçamento"
3. Digite:
   - Categoria (ex: "Alimentação")
   - Limite mensal (ex: 1000)
4. Acompanhe o progresso visualmente
5. Cores indicam o status:
   - 🟢 Verde: seguro
   - 🟡 Amarelo: atenção
   - 🔴 Vermelho: excedido

### 6️⃣ Criar Metas Financeiras

1. Acesse http://localhost:3000/budget
2. Na seção "Metas Financeiras", clique em "Adicionar Meta"
3. Defina:
   - Nome da meta (ex: "Viagem de férias")
   - Valor alvo
   - Valor atual (quanto já economizou)
   - Prazo
4. Acompanhe o progresso e dias restantes

### 7️⃣ Ativar Dark Mode

1. Clique no ícone 🌙 no canto superior direito da navbar
2. O tema muda para escuro
3. Clique no ícone ☀️ para voltar ao tema claro
4. A preferência é salva automaticamente

## 📂 Estrutura do Projeto

```
financial-control/
├── backend/
│   ├── src/
│   │   ├── domain/              # Entidades e casos de uso
│   │   │   ├── entities/        # Transaction
│   │   │   ├── repositories/    # Interfaces
│   │   │   └── use-cases/       # Lógica de negócio
│   │   ├── application/         # DTOs e validadores
│   │   │   ├── dtos/
│   │   │   └── validators/      # Zod schemas
│   │   ├── infrastructure/      # Implementações
│   │   │   ├── database/        # MongoDB/Mongoose
│   │   │   └── http/            # HTTP helpers
│   │   ├── interface/           # Entry points
│   │   │   └── lambda/          # Lambda handlers
│   │   ├── shared/              # Código compartilhado
│   │   │   ├── constants/
│   │   │   ├── config/
│   │   │   └── types/
│   │   └── bootstrap.ts         # Inicialização
│   ├── serverless.yml           # Config Serverless
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── app/                 # Next.js App Router
│   │   │   ├── dashboard/       # Dashboard page
│   │   │   ├── transactions/    # Transactions page
│   │   │   ├── recurring/       # Recurring transactions
│   │   │   ├── analytics/       # Analytics page
│   │   │   ├── budget/          # Budget & Goals page
│   │   │   ├── layout.tsx       # Root layout
│   │   │   ├── page.tsx         # Landing page
│   │   │   └── globals.css      # Global styles
│   │   ├── components/          # React components
│   │   │   ├── Navbar.tsx
│   │   │   ├── ThemeProvider.tsx
│   │   │   ├── AddTransactionModal.tsx
│   │   │   └── TransactionTable.tsx
│   │   ├── services/            # API & CSV services
│   │   │   ├── api.ts
│   │   │   ├── recurring.ts
│   │   │   └── csv.ts
│   │   └── types/               # TypeScript types
│   │       ├── transaction.ts
│   │       └── recurring.ts
│   └── package.json
│
├── CLAUDE.md                    # Docs para Claude Code
└── README.md                    # Este arquivo
```

## 💻 Desenvolvimento

### Comandos Úteis

#### Root
```bash
npm run dev       # Inicia backend
npm start         # Inicia frontend
```

#### Backend
```bash
npm run dev       # Serverless offline (porta 3001)
npm run build     # Compila TypeScript
npm test          # Executa testes
npm run lint      # ESLint
npm run deploy    # Deploy para AWS (dev)
npm run deploy:prod # Deploy para produção
```

#### Frontend
```bash
npm run dev       # Next.js dev server (porta 3000)
npm run build     # Build de produção
npm start         # Servidor de produção
npm run lint      # Biome linting
npm run format    # Biome formatting
```

### Padrões de Código

#### Backend
- **Clean Architecture**: Respeitar separação de camadas
- **Path Aliases**: Usar `@domain/*`, `@application/*`, etc.
- **Validação**: Sempre usar Zod schemas antes dos use cases
- **Error Handling**: Try/catch em todos os handlers

#### Frontend
- **Client Components**: Usar `"use client"` quando necessário
- **Hooks**: Seguir regras do React
- **TypeScript**: Sempre tipar props e estados
- **Tailwind**: Utility-first, sem CSS customizado
- **Dark Mode**: Usar classes `dark:` para estilos alternativos

## 🚀 Deploy

### Backend (AWS Lambda)

1. Configure AWS CLI:
```bash
aws configure
```

2. Deploy:
```bash
cd backend
npm run deploy
# ou para produção:
npm run deploy:prod
```

3. Anote a URL do API Gateway gerada

### Frontend (Vercel)

1. Instale Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
cd frontend
vercel
```

3. Configure a variável de ambiente:
```
NEXT_PUBLIC_API_BASE_URL=https://sua-api.execute-api.us-east-1.amazonaws.com/dev
```

## 🎨 Customização

### Cores do Tema

Edite `frontend/src/app/globals.css` para personalizar as cores:

```css
/* Gradiente principal */
.bg-gradient-to-r.from-blue-600.to-purple-600 {
  /* Customize aqui */
}
```

### Categorias

Adicione/remova categorias em:
- Backend: `backend/src/shared/constants/categories.ts`
- Frontend: `frontend/src/types/transaction.ts`

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

### Checklist para PR

- [ ] Código segue os padrões do projeto
- [ ] Testes passando (quando aplicável)
- [ ] Sem erros de linting
- [ ] Documentação atualizada
- [ ] Dark mode funciona corretamente
- [ ] Responsivo (mobile, tablet, desktop)

## 📝 Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## 👤 Autor

**Matheus Silveira**

- GitHub: [@mhsilveira](https://github.com/mhsilveira)

## 🙏 Agradecimentos

- Design inspirado em apps modernos de finanças
- Ícones: Emojis nativos + Radix Icons
- Comunidade Next.js e React

---

⭐ Se este projeto te ajudou, considere dar uma estrela!

**Desenvolvido com ❤️ usando Next.js, TypeScript e AWS**
