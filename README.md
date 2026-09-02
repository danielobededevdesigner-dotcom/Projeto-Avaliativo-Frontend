# UserFlow

Frontend desenvolvido para uma avaliação técnica utilizando **React + TypeScript**, integrado a um backend simulado com JSON Server.

A aplicação implementa autenticação e gerenciamento de usuários, com foco em organização do código, usabilidade e boas práticas.

## Funcionalidades

- Autenticação com JWT
- Cadastro de usuários
- Rotas públicas e protegidas
- Listagem e paginação de usuários
- Visualização de detalhes
- Criação, edição e exclusão de usuários
- Alteração da própria senha
- Recuperação e redefinição de senha
- Validação de formulários
- Tratamento de sessão expirada
- Feedback de sucesso e erro
- Skeleton de carregamento
- Página 404 personalizada
- Interface responsiva
- Navegação por teclado nos modais

## Tecnologias

**Frontend:** React, TypeScript, Vite, React Router DOM, TanStack React Query, Axios, React Hook Form, Zod, JWT Decode e CSS.

**Backend simulado:** Node.js, JSON Server e JSON Web Token.

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/danielobededevdesigner-dotcom/Projeto-Avaliativo-Frontend.git
cd Projeto-Avaliativo-Frontend
```

### 2. Backend

```bash
cd backend
npm install
npm start
```

O backend será executado em:

```text
http://localhost:3001
```

### 3. Frontend

Abra outro terminal e entre na pasta:

```bash
cd frontend
npm install
```

Crie o arquivo `.env` a partir do `.env.example`.

No Windows:

```powershell
copy .env.example .env
```

A configuração padrão é:

```env
VITE_API_URL=http://localhost:3001
```

Depois execute:

```bash
npm run dev
```

O Vite exibirá o endereço da aplicação, normalmente:

```text
http://localhost:5173
```

## Rotas

| Rota | Descrição |
|---|---|
| `/login` | Login |
| `/cadastro` | Cadastro |
| `/recuperar-senha` | Recuperação de senha |
| `/redefinir-senha` | Redefinição de senha |
| `/` | Gerenciamento de usuários |
| `*` | Página 404 |

## Decisões técnicas

A autenticação utiliza **JWT**, enviado automaticamente nas requisições autenticadas através de um interceptor do Axios.

O **TanStack React Query** é responsável pelas requisições, cache e atualização da listagem após operações de CRUD.

Os formulários utilizam **React Hook Form + Zod** para gerenciamento e validação dos dados.

A aplicação trata estados de carregamento, erro, lista vazia e sessão expirada.

Os modais possuem suporte a `Esc`, clique externo e gerenciamento de foco para melhorar a navegação por teclado.

A paginação é sincronizada com a URL, por exemplo:

```text
/?page=2
```

permitindo manter a página selecionada após atualizar o navegador.

## Backend simulado

O backend é utilizado apenas para simular a API durante a avaliação.

Por isso, algumas implementações, como armazenamento em arquivo JSON e senhas sem hash, são adequadas apenas ao ambiente de desenvolvimento e não representam práticas recomendadas para produção.

## Build

Para gerar a versão de produção:

```bash
cd frontend
npm run build
```

## Autor

**Daniel Obede**

Projeto desenvolvido para avaliação técnica Frontend com React + TypeScript.
