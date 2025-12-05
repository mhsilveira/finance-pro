# 📥 Guia de Importação de Transações

## Como Testar a Importação

### 1. Arquivo de Teste Incluído
O arquivo `exemplo_transacoes_teste.csv` contém 25 transações de exemplo prontas para importar.

### 2. Como Importar
1. Acesse a página **Transações** no app
2. Clique no botão **"Importar CSV"** 📤
3. Selecione o arquivo `exemplo_transacoes_teste.csv`
4. Aguarde a mensagem de confirmação com o resultado

### 3. Formato do CSV

O CSV deve ter as seguintes colunas (exatamente com esses nomes):

```csv
Data,Descrição,Valor,Tipo,Categoria,Origem,Cartão
```

#### Campos Obrigatórios:
- **Data**: Formato YYYY-MM-DD (ex: 2025-01-15)
- **Descrição**: Texto livre descrevendo a transação
- **Valor**: Número com ponto decimal (ex: 234.50)
- **Tipo**: `income` ou `expense`
- **Categoria**: Texto livre (ex: Alimentação, Transporte, Saúde)
- **Origem**: `CASH` ou `CREDIT_CARD`

#### Campos Opcionais:
- **Cartão**: Nome do cartão (obrigatório apenas se Origem = CREDIT_CARD)

### 4. Exemplo de Linha Válida

```csv
2025-01-15,Supermercado Extra,234.50,expense,Alimentação,CASH,
2025-01-14,Salário Janeiro,5500.00,income,Salário,CASH,
2025-01-13,Restaurante Japonês,189.90,expense,Alimentação,CREDIT_CARD,Nubank
```

## 🎯 Categorias Sugeridas

- **Alimentação**: Supermercado, restaurantes, delivery
- **Transporte**: Uber, gasolina, combustível, estacionamento
- **Saúde**: Farmácia, médicos, academia, plano de saúde
- **Moradia**: Aluguel, condomínio, IPTU, reformas
- **Contas**: Água, luz, internet, telefone, TV
- **Entretenimento**: Cinema, streaming, shows, viagens
- **Educação**: Cursos, livros, mensalidade
- **Compras**: Roupas, eletrônicos, presentes
- **Salário**: Pagamento principal
- **Freelance**: Trabalhos extras
- **Bônus**: Gratificações, 13º
- **Outros**: Outras receitas/despesas

## 🔮 Próximas Features

### 1. OCR de Faturas
- Upload de foto/PDF da fatura
- Extração automática com IA
- Revisão antes de importar

### 2. Parsers de Bancos Específicos
- **Nubank**: PDF/Email de fatura
- **Itaú**: Extrato OFX/PDF
- **Inter**: API/Extrato
- **Bradesco**: PDF/Extrato
- **Santander**: PDF/Extrato

### 3. Categorização Automática
- Machine Learning baseado em histórico
- Sugestões de categoria por descrição
- Aprendizado com correções do usuário

### 4. Melhorias de Import
- Drag & drop de arquivos
- Preview antes de importar
- Mapeamento de colunas customizado
- Detecção de duplicatas
- Validação avançada

## 💡 Dicas

1. **Exportar antes de importar**: Faça backup exportando suas transações atuais
2. **Testar com poucas linhas**: Comece importando 2-3 transações para validar
3. **Verificar formato de data**: Sempre use YYYY-MM-DD
4. **Cuidado com vírgulas**: Use ponto para decimais (234.50, não 234,50)
5. **Textos com vírgula**: Coloque entre aspas ("Restaurante, Bar e Grill")

## 🐛 Problemas Comuns

### "Colunas obrigatórias ausentes"
- Verifique se o cabeçalho está exatamente como especificado
- Não adicione ou remova colunas

### "Tipo inválido"
- Use apenas `income` ou `expense` (minúsculas)

### "Origem inválida"
- Use apenas `CASH` ou `CREDIT_CARD` (maiúsculas)

### "Erro ao processar linha X"
- Verifique o formato da data naquela linha
- Verifique se o valor é numérico
- Procure vírgulas não escapadas

## 📞 Suporte

Se encontrar problemas, verifique:
1. Console do navegador (F12)
2. Mensagens de erro detalhadas
3. Formato do arquivo CSV

---

**Happy importing!** 🚀
