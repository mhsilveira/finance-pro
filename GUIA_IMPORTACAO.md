# Guia de Importação de Faturas de Cartão de Crédito

## Formato Simplificado (3 campos)

A aplicação agora suporta o formato padrão das faturas de cartão de crédito dos bancos brasileiros.

### Formato do CSV

```csv
data,lançamento,valor
2025-11-12,MP *NOVAPOINT,31
2025-11-11,UBER* TRIP,50.71
2025-11-11,LA CATRINA BAR E RESTA,89.65
```

### Como Importar

1. **Baixe a fatura do seu banco** (geralmente em formato CSV)
2. **Verifique se tem os 3 campos**: data, lançamento (ou descrição), valor
3. **Na página de Transações**, clique em "Importar CSV"
4. **Digite o nome do cartão** quando solicitado (ex: `ITAU`, `NUBANK`)
5. **Selecione o arquivo** da fatura

### O que acontece na importação?

Todas as transações são importadas com valores padrão:
- **Tipo**: `expense` (despesa)
- **Origem**: `CREDIT_CARD` (cartão de crédito)
- **Categoria**: `A Categorizar`
- **Cartão**: O nome que você digitou (ex: `ITAU`)

### Depois da Importação

1. **Edite cada transação** usando o botão de editar (ícone de lápis) ✏️
2. **Atribua a categoria correta**:
   - Alimentação
   - Transporte
   - Lazer
   - Educação
   - Saúde
   - etc.
3. **Crie novas categorias** conforme necessário
4. Se necessário, ajuste:
   - Tipo (receita/despesa)
   - Origem (cartão/dinheiro)
   - Descrição

### Formato Completo (opcional)

Para importações manuais, você ainda pode usar o formato completo com todos os campos:

```csv
Data,Descrição,Valor,Tipo,Categoria,Origem,Cartão
2025-11-12,Almoço,50.00,expense,Alimentação,CASH,
```

### Exemplo Real

Veja o arquivo `fatura_teste.csv` na raiz do projeto para um exemplo com dados reais de fatura de cartão.

### Filtros Disponíveis

Após importar, você pode usar os filtros para organizar suas transações:

- **Buscar**: Pesquisar por descrição
- **Tipo**: Receitas ou Despesas
- **Categoria**: Filtrar por categoria específica ou "A Categorizar"
- **Origem**: Cartão de Crédito ou Dinheiro
- **Cartão**: Filtrar por cartão específico (ITAU, NUBANK, etc)
- **Período**: Filtrar por mês/ano (ex: 2025-11)

### Dicas

- ✅ A vírgula pode ser usada como separador decimal (31,50 ou 31.50)
- ✅ O sistema detecta automaticamente qual formato você está usando
- ✅ Use o filtro de Categoria = "A Categorizar" para ver transações pendentes
- ✅ Use o filtro de Cartão para ver apenas transações de um cartão específico
- ✅ Use o filtro de Período (mês/ano) em vez de dia específico
- ✅ Os filtros são salvos automaticamente (localStorage)
- ✅ Você pode exportar suas transações a qualquer momento

### Campos Aceitos no Header

O sistema aceita variações de nomes nos headers:

**Data**: `data`, `date`
**Descrição**: `lançamento`, `lancamento`, `descrição`, `descricao`, `description`
**Valor**: `valor`, `value`, `amount`

## Workflow Recomendado

1. 📥 Baixar fatura do banco (formato CSV com 3 campos)
2. 📤 Importar CSV na página de Transações
3. 💳 Informar nome do cartão (ex: ITAU, NUBANK)
4. 🔍 Filtrar por Categoria = "A Categorizar"
5. ✏️ Editar cada transação e atribuir categoria correta
6. 🏷️ Criar novas categorias conforme necessário
7. 🔎 Usar filtro de Cartão para ver gastos por cartão
8. 📅 Usar filtro de Período (mês/ano) para análises mensais
9. 📊 Ver estatísticas atualizadas no Dashboard
10. 💾 Exportar backup se desejar
