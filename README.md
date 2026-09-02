# UserFlow

Frontend desenvolvido para uma avaliação técnica utilizando **React + TypeScript**, com integração a um backend simulado em JSON Server.

O projeto implementa autenticação e gerenciamento de usuários com foco em organização, usabilidade e boas práticas.

## Funcionalidades

- Login com JWT
- Cadastro de usuários
- Rotas públicas e protegidas
- Listagem de usuários
- Paginação sincronizada com a URL
- Visualização de detalhes
- Criação de usuários
- Edição de usuários
- Exclusão com confirmação
- Alteração da própria senha
- Recuperação e redefinição de senha
- Tratamento de sessão expirada
- Validação de formulários
- Feedback de sucesso e erro
- Skeleton durante carregamento
- Página 404 personalizada
- Interface responsiva
- Navegação por teclado nos modais

## Tecnologias

### Frontend

- React
- TypeScript
- Vite
- React Router DOM
- TanStack React Query
- Axios
- React Hook Form
- Zod
- JWT Decode
- CSS

### Backend simulado

- Node.js
- JSON Server
- JSON Web Token

## Como executar

### 1. Clonar o repositório

```bash
git clone https://github.com/danielobededevdesigner-dotcom/Projeto-Avaliativo-Frontend.git
cd Projeto-Avaliativo-Frontend
```

### 2. Backend

Entre na pasta:

```bash
cd backend
```

Instale as dependências:

```bash
npm install
```

Inicie o servidor:

```bash
npm start
```

O backend será executado em:

```text
http://localhost:3001
```

### 3. Frontend

Em outro terminal:

```bash
cd frontend
```

Instale as dependências:

```bash
npm install
```

Crie um arquivo `.env` na pasta `frontend`:

```env
VITE_API_URL=http://localhost:3001
```

Depois execute:

```bash
npm run dev
```

O endereço local será exibido pelo Vite, normalmente:

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

A autenticação utiliza **JWT**, armazenado no navegador e enviado automaticamente nas requisições através de um interceptor do Axios.

O **TanStack React Query** é utilizado para requisições, cache e atualização dos dados após operações de CRUD.

Os formulários utilizam **React Hook Form + Zod** para validação.

A aplicação também trata estados de carregamento, erro, lista vazia e sessão expirada.

Os modais possuem suporte a `Esc`, clique externo e controle de foco para melhorar a navegação por teclado.

A paginação é sincronizada com a URL:

```text
/?page=2
```

permitindo manter a página atual mesmo após atualizar o navegador.

## Backend simulado

O backend é utilizado apenas para simular a API da avaliação.

Por isso, algumas implementações não representam práticas de produção, como armazenamento de dados em arquivo JSON e senhas sem hash.

Em uma aplicação real seriam utilizados banco de dados, hash de senhas, variáveis de ambiente no servidor e mecanismos adicionais de segurança.

## Build

Para gerar uma versão de produção do frontend:

```bash
cd frontend
npm run build
```

## Autor

**Daniel Obede**

Projeto desenvolvido para avaliação técnica Frontend com React + TypeScript.
