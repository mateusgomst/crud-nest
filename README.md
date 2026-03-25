# CRUD Back (NestJS + Prisma + SQLite)

API de CRUD de usuarios usando NestJS e Prisma, com banco SQLite local.

## Requisitos

- Node.js 20+
- npm 10+

## Instalacao

1. Instale as dependencias:

```bash
npm install
```

Se aparecer erro de permissao no cache do npm (`EACCES`), use cache local:

```bash
npm install --cache .npm-cache
```

2. Crie o arquivo `.env` na raiz do projeto:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
```

3. Gere o client do Prisma e sincronize o banco:

```bash
npx prisma generate
npx prisma db push
```

Esse comando cria/atualiza o banco SQLite em `dev.db`.

## Como rodar a aplicacao

Antes de subir a API, garanta que o Prisma Client e o banco estao sincronizados:

```bash
npx prisma generate
npx prisma db push
```

Modo desenvolvimento (watch):

```bash
npm run start:dev
```

Se a porta `3000` estiver em uso:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
kill -9 <PID>
```

API local:

- `http://localhost:3000`
- Swagger: `http://localhost:3000/api`

## Resetar banco (limpar tudo)

Para apagar todos os dados do SQLite e recriar as tabelas do zero:

```bash
npx prisma db push --force-reset
npx prisma generate
```

Isso limpa completamente o arquivo `dev.db` e recria o schema atual.

## Teste rapido com curl

Listar usuarios:

```bash
curl --request GET \
  --url http://localhost:3000/users \
  --header 'Accept: application/json'
```

Criar usuario:

```bash
curl --request POST \
  --url http://localhost:3000/users \
  --header 'Content-Type: application/json' \
  --data '{
    "email": "mateus@example.com",
    "name": "Mateus Gomes",
    "password": "senha123"
  }'
```

## Scripts uteis

```bash
# build
npm run build

# testes unitarios
npm run test

# testes e2e
npm run test:e2e
```
