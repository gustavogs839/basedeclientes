# Base de Clientes

Cadastro de clientes (nome, telefone, e-mail opcional, meio de captação opcional) com botão de WhatsApp.

## Rodando localmente

1. Crie um banco PostgreSQL gratuito no [Neon](https://neon.tech) e copie a *connection string*.
2. Copie `.env.example` para `.env` e cole a connection string em `DATABASE_URL`.
3. Instale as dependências e rode:

```
npm install
npm start
```

4. Abra `http://localhost:3000`.

## Publicando na nuvem (Render + Neon)

1. **Banco de dados (Neon)**: crie uma conta em https://neon.tech, crie um projeto e copie a *connection string* (algo como `postgresql://usuario:senha@host/banco?sslmode=require`).
2. **Repositório**: suba este projeto para um repositório no GitHub (o `.env` não vai junto, está no `.gitignore`).
3. **Deploy (Render)**: crie uma conta em https://render.com → **New Web Service** → conecte o repositório do GitHub.
   - Build command: `npm install`
   - Start command: `npm start`
   - Em **Environment**, adicione a variável `DATABASE_URL` com a connection string do Neon.
4. Após o deploy, o Render fornece uma URL pública (ex: `https://base-clientes-lopes.onrender.com`) para acessar o sistema de qualquer lugar.
