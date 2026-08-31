const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const SECRET_KEY = "segredo123";

server.use(middlewares);
server.use(bodyParser.json());

// Simula rota de login
server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;

  const user = db.get("users").find({ email, password }).value();

  if (user) {
    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
      },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    return res.json({ token });
  }

  return res.status(401).json({
    message: "Credenciais inválidas",
  });
});

// Middleware para proteger as rotas de /users
server.use((req, res, next) => {
  // POST /users é público para permitir cadastro
  if (req.path === "/users" && req.method === "POST") {
    return next();
  }

  // Todas as outras rotas /users exigem autenticação
  if (req.path.startsWith("/users")) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token ausente",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token ausente",
      });
    }

    try {
      const decoded = jwt.verify(token, SECRET_KEY);

      // Salva as informações do usuário autenticado
      req.user = decoded;

      return next();
    } catch {
      return res.status(401).json({
        message: "Token inválido ou expirado",
      });
    }
  }

  next();
});

// PUT /users/:id
server.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const db = router.db;

  // Verifica se o usuário do token é o mesmo do :id
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({
      message: "Acesso negado",
    });
  }

  const user = db
    .get("users")
    .find({
      id: parseInt(id),
    })
    .value();

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado",
    });
  }

  // Atualiza nome e e-mail
  db.get("users")
    .find({
      id: parseInt(id),
    })
    .assign({
      name,
      email,
    })
    .write();

  return res.json({
    message: "Usuário atualizado com sucesso",
  });
});

// PATCH /users/:id/password
server.patch("/users/:id/password", (req, res) => {
  const { id } = req.params;
  const { currentPassword, newPassword } = req.body;
  const db = router.db;

  // Apenas o próprio usuário pode alterar sua senha
  if (parseInt(id) !== req.user.id) {
    return res.status(403).json({
      message: "Acesso negado",
    });
  }

  const user = db
    .get("users")
    .find({
      id: parseInt(id),
    })
    .value();

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado",
    });
  }

  if (user.password !== currentPassword) {
    return res.status(400).json({
      message: "Senha atual incorreta",
    });
  }

  // Atualiza a senha
  db.get("users")
    .find({
      id: parseInt(id),
    })
    .assign({
      password: newPassword,
    })
    .write();

  return res.json({
    message: "Senha alterada com sucesso",
  });
});

// Rotas padrão do JSON Server
server.use(router);

server.listen(3001, () => {
  console.log("🚀 JSON Server rodando em http://localhost:3001");
});