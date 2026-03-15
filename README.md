# 💰 Finance Pro

Aplicação de controle financeiro pessoal, **self-hosted**. Rode localmente com um único comando — sem conta em nuvem, sem serviço externo, seus dados ficam só na sua máquina.

## ✨ Funcionalidades

- Dashboard com visão geral, gráficos de tendência e distribuição por categoria
- Cadastro, edição e exclusão de transações
- Filtros por descrição, tipo, categoria, origem e período
- Importação e exportação via CSV
- Transações recorrentes (templates com frequência configurável)
- Orçamentos mensais por categoria com alertas visuais
- Metas financeiras com tracking de progresso
- Dark mode com persistência de preferência

## 🛠 Stack

| Camada   | Tecnologias                                                                |
| -------- | -------------------------------------------------------------------------- |
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, Radix UI, Chart.js       |
| Backend  | Node.js 20, Serverless Framework (offline), TypeScript, Clean Architecture |
| Banco    | MongoDB 7 (container local)                                                |

## 🚀 Como rodar

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) e Docker Compose v2+

### Início rápido

```bash
# 1. Clone o repositório
git clone https://github.com/mhsilveira/financial-control.git
cd financial-control

# 2. Crie o arquivo de variáveis de ambiente
cp .env.example .env

# 3. Suba tudo
docker compose up -d
```

Pronto. A aplicação estará disponível em:

- **Frontend:** http://localhost:3000
- **API:** http://localhost:3001/dev

Os dados ficam num volume Docker local — persistem entre restarts e nunca saem da sua máquina.

### Comandos úteis

```bash
# Ver logs em tempo real
docker compose logs -f

# Parar (dados preservados)
docker compose down

# Parar e apagar todos os dados
docker compose down -v

# Reconstruir após mudanças nas dependências
docker compose up -d --build
```

## 📂 Estrutura

```
financial-control/
├── backend/          # Clean Architecture: domain, application, infrastructure, interface
├── frontend/         # Next.js App Router: dashboard, transactions, recurring, analytics, budget
├── docker-compose.yml
├── .env.example
└── CLAUDE.md         # Contexto para Claude Code
```

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/minha-feature`)
3. Commit (`git commit -m 'feat: minha feature'`)
4. Push (`git push origin feature/minha-feature`)
5. Abra um Pull Request

## 👤 Autor

**Matheus Silveira** — [@mhsilveira](https://github.com/mhsilveira)