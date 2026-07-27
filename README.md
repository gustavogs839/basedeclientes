# Base de Clientes

Cadastro de clientes (nome, telefone, e-mail opcional, meio de captação opcional) com botão de WhatsApp.
Site estático (Firebase Hosting) que fala direto com o banco (Firestore) pelo navegador — sem servidor próprio.

**Atenção:** as regras do Firestore (`firestore.rules`) estão abertas — qualquer pessoa com o link do site
pode ver e editar os clientes, sem login. Se depois quiser restringir, é só adicionar Firebase Authentication
e trocar a regra `allow read, write: if true` por uma checagem de login.

## Configurando o projeto Firebase (uma vez)

1. Acesse https://console.firebase.google.com e crie um projeto novo.
2. No menu lateral, vá em **Build → Firestore Database** e clique em **Criar banco de dados** (modo produção, escolha uma região próxima, ex: `southamerica-east1`).
3. Vá em **⚙️ Configurações do projeto → Seus apps → </> (Web)** e registre um app. Copie o objeto `firebaseConfig` mostrado.
4. Cole esses valores em [`public/firebase-config.js`](public/firebase-config.js), substituindo os placeholders.
5. Copie o **ID do projeto** (Project ID) e cole em [`.firebaserc`](.firebaserc), no lugar de `SUBSTITUA_PELO_ID_DO_PROJETO`.

## Rodando localmente (emulador)

```
npm run serve
```

Abre em `http://localhost:5000` usando o emulador do Firestore (não mexe nos dados reais).

## Publicando

```
npx firebase-tools login
npx firebase-tools deploy
```

Ao final, o terminal mostra a URL pública, algo como `https://SEU_PROJETO.web.app`.
