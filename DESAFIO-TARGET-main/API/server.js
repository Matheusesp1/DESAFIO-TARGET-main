const express = require("express");
const cors = require("cors");
const fs = require("fs");

const app = express();
app.use(cors());
app.use(express.json());

// Carrega dados
const db = JSON.parse(fs.readFileSync("./database.json", "utf8"));

// ------------------------------
// 1 - Cálculo de Comissões
// ------------------------------
app.get("/comissoes", (req, res) => {
  const comissoes = {};

  db.vendas.forEach((venda) => {
    let taxa = 0;
    if (venda.valor >= 500) taxa = 0.05;
    else if (venda.valor >= 100) taxa = 0.01;

    const comissao = venda.valor * taxa;

    if (!comissoes[venda.vendedor]) comissoes[venda.vendedor] = 0;

    comissoes[venda.vendedor] += comissao;
  });

  res.json(comissoes);
});

// ------------------------------
// 2 - Movimentação de Estoque
// ------------------------------
let ultimoId = 0;

app.post("/movimentar-estoque", (req, res) => {
  const { codigoProduto, quantidade, descricao } = req.body;

  const produto = db.estoque.find((p) => p.codigoProduto == codigoProduto);

  if (!produto) return res.status(404).json({ erro: "Produto não encontrado" });

  ultimoId++;

  produto.estoque += quantidade;

  res.json({
    idMovimentacao: ultimoId,
    produto: produto.descricaoProduto,
    descricao,
    quantidadeMovimentada: quantidade,
    estoqueFinal: produto.estoque,
  });
});

// ------------------------------
// 3 - Juros (2,5% ao dia)
// ------------------------------
app.post("/juros", (req, res) => {
  const { valor, dataVencimento } = req.body;

  const hoje = new Date();
  const venc = new Date(dataVencimento);

  const dias = Math.floor((hoje - venc) / (1000 * 60 * 60 * 24));

  if (dias <= 0) {
    return res.json({
      diasAtraso: 0,
      juros: 0,
      valorFinal: valor,
    });
  }

  const juros = valor * 0.025 * dias;

  res.json({
    diasAtraso: dias,
    juros,
    valorFinal: valor + juros,
  });
});

// Servidor
app.listen(3000, () => {
  console.log("API rodando em http://localhost:3000");
  console.log("teste")
});
