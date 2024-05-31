// index.js
const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

const app = express();
const port = 3000;

app.use(bodyParser.json());

// Configuração da conexão com o banco de dados PostgreSQL
const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'postgres',
  password: 'local_password',
  port: 5432,
});

// Rota POST para salvar um objeto JSON com nome e idade
app.post('/pessoas', async (req, res) => {
  const { nome, idade } = req.body;

  try {
    const result = await pool.query('INSERT INTO pessoas (nome, idade) VALUES ($1, $2) RETURNING *', [nome, idade]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro ao inserir pessoa:', err);
    res.status(500).json({ error: 'Erro ao inserir pessoa' });
  }
});

// Rota GET para retornar uma lista com todas as pessoas
app.get('/pessoas', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM pessoas');
    res.json(result.rows);
  } catch (err) {
    console.error('Erro ao buscar pessoas:', err);
    res.status(500).json({ error: 'ERR', err  });
  }
});
// Rota raiz que retorna uma página HTML com um botão
// Rota raiz que retorna uma página HTML com um formulário para cadastrar uma nova pessoa
app.get('/', (req, res) => {
  res.send(`
    <html>
    <head>
      <title>Rota Raiz</title>
    </head>
    <body>
      <h1>Cadastrar Nova Pessoa</h1>
      <button onclick="fetch('/pessoas').then(response => response.json()).then(data => document.getElementById('json-container').innerText = JSON.stringify(data, null, 2))">Obter Pessoas</button>
      <pre id="json-container"></pre>
      <form id="form-cadastro" onsubmit="event.preventDefault(); cadastrarPessoa()">
        <label for="nome">Nome:</label>
        <input type="text" id="nome" name="nome" required>
        <label for="idade">Idade:</label>
        <input type="number" id="idade" name="idade" required>
        <button type="submit">Cadastrar</button>
      </form>
      <pre id="json-container"></pre>

      <script>
        function cadastrarPessoa() {
          const nome = document.getElementById('nome').value;
          const idade = document.getElementById('idade').value;

          fetch('/pessoas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, idade })
          })
          .then(response => response.json())
          .then(data => {
            document.getElementById('json-container').innerText = JSON.stringify(data, null, 2);
            document.getElementById('form-cadastro').reset();
          })
          .catch(error => console.error('Erro ao cadastrar pessoa:', error));
        }
      </script>
    </body>
    </html>
  `);
});

// Função para criar a tabela pessoas
async function createTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pessoas (
        id SERIAL PRIMARY KEY,
        nome VARCHAR(100),
        idade INTEGER
      )
    `);
    console.log('Tabela criada com sucesso!');
  } catch (err) {
    console.error('Erro ao criar tabela:', err);
  }
}
// Função para semeação de dados
async function seedData() {
  try {
    // Insere três objetos de exemplo ao iniciar o servidor
    await pool.query('INSERT INTO pessoas (nome, idade) VALUES ($1, $2), ($3, $4), ($5, $6)', ['João', 25, 'Maria', 30, 'José', 35]);
    console.log('Dados semeados com sucesso!');
  } catch (err) {
    console.error('Erro ao semear dados:', err);
  }
}

// Inicia o servidor após semeação de dados
async function startServer() {
  try {
    await createTable();
    //await seedData();
    app.listen(port, () => {
      console.log("Servidor rodando na porta ${port}");
    });
  } catch (err) {
    console.error('Erro ao iniciar o servidor:', err);
  }
}

// Inicia o servidor
startServer();
