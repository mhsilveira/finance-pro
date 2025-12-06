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
4. **Selecione o arquivo** da fatura

### O que acontece na importação?

Todas as transações são importadas com valores padrão:
- **Tipo**: `expense` (despesa)
- **Origem**: `CREDIT_CARD` (cartão de crédito)
- **Categoria**: `A Categorizar`

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

### Dicas

- ✅ A vírgula pode ser usada como separador decimal (31,50 ou 31.50)
- ✅ O sistema detecta automaticamente qual formato você está usando
- ✅ Use os filtros para visualizar apenas transações "A Categorizar"
- ✅ Os filtros são salvos automaticamente (localStorage)
- ✅ Você pode exportar suas transações a qualquer momento

### Campos Aceitos no Header

O sistema aceita variações de nomes nos headers:

**Data**: `data`, `date`
**Descrição**: `lançamento`, `lancamento`, `descrição`, `descricao`, `description`
**Valor**: `valor`, `value`, `amount`

## Workflow Recomendado

1. 📥 Baixar fatura do banco
2. 📤 Importar CSV (3 campos)
3. ✏️ Editar transações em lote
4. 🏷️ Categorizar conforme necessário
5. 📊 Ver estatísticas atualizadas no Dashboard
6. 💾 Exportar backup se desejar
