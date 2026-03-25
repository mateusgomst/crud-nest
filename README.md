# Cinema API (NestJS + Prisma + PostgreSQL + Docker)

API REST para gerenciamento de um cinema: filmes, salas, sessoes, ingressos, combos de lanches e pedidos.
Inclui tambem o modulo de Usuarios, Perfis e Enderecos (Prova N1 - CMP2305).

## Como rodar (Docker)

```bash
docker compose build
docker compose up
```

Isso sobe o PostgreSQL e a API automaticamente. As migrations rodam no startup.

Documentacao interativa (Swagger): `http://localhost:3000/api`

## Resetar tudo (limpar banco e volumes)

```bash
docker compose down -v
docker compose up
```

---

## Fluxo de criacao dos recursos

A API possui dependencias entre entidades. Siga a ordem abaixo para cadastrar tudo corretamente.

### Fase 1 - Entidades independentes (sem dependencia)

Crie estas primeiro, em qualquer ordem:

**1. Criar Profile**
```bash
curl -X POST http://localhost:3000/profiles \
  -H 'Content-Type: application/json' \
  -d '{"name": "ADMIN"}'
```
> Anote o `id` (UUID) retornado. Voce vai precisar dele para criar um User.

**2. Criar Genero**
```bash
curl -X POST http://localhost:3000/generos \
  -H 'Content-Type: application/json' \
  -d '{"nome": "Acao"}'
```
> Anote o `id` retornado. Voce vai precisar dele para criar um Filme.

**3. Criar Sala**
```bash
curl -X POST http://localhost:3000/salas \
  -H 'Content-Type: application/json' \
  -d '{"identificacao": "Sala 1", "capacidade": 100}'
```
> Anote o `id` retornado. Voce vai precisar dele para criar uma Sessao.

**4. Criar Lanche/Combo (opcional)**
```bash
curl -X POST http://localhost:3000/lanches-combo \
  -H 'Content-Type: application/json' \
  -d '{"nome": "Combo Pipoca + Refri", "descricao": "Pipoca grande + refrigerante 500ml", "preco": 29.90}'
```
> Anote o `id` se quiser incluir combos em Pedidos.

---

### Fase 2 - Entidades que dependem da Fase 1

**5. Criar Filme** (depende de: Genero)
```bash
curl -X POST http://localhost:3000/filmes \
  -H 'Content-Type: application/json' \
  -d '{"titulo": "Matrix", "generoId": 1, "duracao": 136, "classificacaoEtaria": "14"}'
```
> Use o `id` do Genero criado na Fase 1.

**6. Criar User** (depende de: Profile)
```bash
curl -X POST http://localhost:3000/users \
  -H 'Content-Type: application/json' \
  -d '{"email": "mateus@example.com", "password": "senha123", "name": "Mateus Gomes", "profileId": "<UUID_DO_PROFILE>"}'
```
> Substitua `<UUID_DO_PROFILE>` pelo `id` do Profile criado na Fase 1.

---

### Fase 3 - Entidades que dependem da Fase 2

**7. Criar Sessao** (depende de: Filme + Sala)
```bash
curl -X POST http://localhost:3000/sessoes \
  -H 'Content-Type: application/json' \
  -d '{"filmeId": 1, "salaId": 1, "dataHora": "2026-04-01T19:00:00.000Z", "valorIngresso": 25.00}'
```
> Use os `id`s do Filme e da Sala. A API valida conflito de horario na mesma sala.

**8. Criar Address** (depende de: User) - opcional, 1 por usuario
```bash
curl -X POST http://localhost:3000/addresses \
  -H 'Content-Type: application/json' \
  -d '{"street": "Rua das Flores", "number": 123, "city": "Sao Paulo", "state": "SP", "zipCode": "01001-000", "userId": "<UUID_DO_USER>"}'
```
> Substitua `<UUID_DO_USER>` pelo `id` do User. Cada usuario pode ter no maximo 1 endereco.

---

### Fase 4 - Entidades que dependem da Fase 3

**9. Comprar Ingresso** (depende de: Sessao)
```bash
curl -X POST http://localhost:3000/ingressos \
  -H 'Content-Type: application/json' \
  -d '{"sessaoId": 1, "tipo": "INTEIRA"}'
```
> Tipos: `INTEIRA` ou `MEIA`. O valor e calculado automaticamente. A API verifica a capacidade da sala.

**10. Criar Pedido com itens** (depende de: Ingresso e/ou LancheCombo)
```bash
curl -X POST http://localhost:3000/pedidos \
  -H 'Content-Type: application/json' \
  -d '{
    "itens": [
      {"tipo": "INGRESSO", "referenciaId": 1},
      {"tipo": "COMBO", "referenciaId": 1}
    ]
  }'
```
> `referenciaId` aponta para o `id` de um Ingresso (se tipo = INGRESSO) ou LancheCombo (se tipo = COMBO).

---

## Resumo da ordem

```
Profile ──→ User ──→ Address
Genero  ──→ Filme ──┐
Sala  ──────────────┼──→ Sessao ──→ Ingresso ──┐
LancheCombo ────────────────────────────────────┼──→ Pedido (com itens)
```

## Endpoints

### Cinema

| Recurso | Rota | Metodos |
|---------|------|---------|
| Generos | `/generos` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Filmes | `/filmes` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Salas | `/salas` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Sessoes | `/sessoes` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Ingressos | `/ingressos` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Lanches/Combos | `/lanches-combo` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Pedidos | `/pedidos` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |

### Usuarios (Prova N1)

| Recurso | Rota | Metodos |
|---------|------|---------|
| Profiles | `/profiles` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Users | `/users` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |
| Addresses | `/addresses` | GET, POST, GET/:id, PATCH/:id, DELETE/:id |

## Relacionamentos

- Profile 1:N User
- User 1:1 Address (cascade delete)
- Genero 1:N Filme
- Filme 1:N Sessao
- Sala 1:N Sessao
- Sessao 1:N Ingresso
- Pedido 1:N PedidoItem (cascade delete)

## Desenvolvimento local (sem Docker)

```bash
npm install
```

Crie o `.env`:
```env
DATABASE_URL="postgresql://prisma:prisma@localhost:5432/cinema"
PORT=3000
```

```bash
npx prisma generate
npx prisma migrate deploy
npm run start:dev
```
