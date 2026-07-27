require('dotenv').config();
const express = require('express');
const path = require('path');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 3000;

if (!process.env.DATABASE_URL) {
  console.error(
    'Defina a variável de ambiente DATABASE_URL com a string de conexão do PostgreSQL (veja .env.example).'
  );
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});

async function initDb() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS clientes (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      telefone TEXT NOT NULL,
      email TEXT,
      meio_captacao TEXT,
      criado_em TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);
}

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

function onlyDigits(str) {
  return String(str || '').replace(/\D/g, '');
}

// Lista todos os clientes (mais recentes primeiro)
app.get('/api/clientes', async (req, res, next) => {
  try {
    const { rows } = await pool.query('SELECT * FROM clientes ORDER BY id DESC');
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// Cria um cliente
app.post('/api/clientes', async (req, res, next) => {
  try {
    const { nome, telefone, email, meio_captacao } = req.body || {};

    if (!nome || !String(nome).trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    const telefoneDigits = onlyDigits(telefone);
    if (!telefoneDigits) {
      return res.status(400).json({ error: 'Telefone é obrigatório.' });
    }

    const { rows } = await pool.query(
      'INSERT INTO clientes (nome, telefone, email, meio_captacao) VALUES ($1, $2, $3, $4) RETURNING *',
      [
        String(nome).trim(),
        telefoneDigits,
        email ? String(email).trim() : null,
        meio_captacao ? String(meio_captacao).trim() : null,
      ]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Atualiza um cliente
app.put('/api/clientes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { nome, telefone, email, meio_captacao } = req.body || {};

    if (!nome || !String(nome).trim()) {
      return res.status(400).json({ error: 'Nome é obrigatório.' });
    }
    const telefoneDigits = onlyDigits(telefone);
    if (!telefoneDigits) {
      return res.status(400).json({ error: 'Telefone é obrigatório.' });
    }

    const { rows } = await pool.query(
      'UPDATE clientes SET nome = $1, telefone = $2, email = $3, meio_captacao = $4 WHERE id = $5 RETURNING *',
      [
        String(nome).trim(),
        telefoneDigits,
        email ? String(email).trim() : null,
        meio_captacao ? String(meio_captacao).trim() : null,
        id,
      ]
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

// Remove um cliente
app.delete('/api/clientes/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM clientes WHERE id = $1', [id]);
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Cliente não encontrado.' });
    }
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

initDb()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Base de clientes rodando em http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Erro ao conectar/inicializar o banco de dados:', err.message);
    process.exit(1);
  });
