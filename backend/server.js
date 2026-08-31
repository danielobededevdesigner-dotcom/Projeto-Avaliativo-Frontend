const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const SECRET_KEY = "segredo123";

server.use(middlewares);
server.use(bodyParser.json());

// LOGIN
server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;

  const user = db
    .get("users")
    .find({ email, password })
    .value();

  if (!user) {
    return res.status(401).json({
      message: "Credenciais inválidas",
    });
  }

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
});

// CADASTRO PÚBLICO
server.post("/users", (req, res) => {
  const { name, email, password } = req.body;
  const db = router.db;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Nome, e-mail e senha são obrigatórios",
    });
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const users = db.get("users").value();

  const existingUser = users.find(
    (user) =>
      user.email &&
      user.email.trim().toLowerCase() ===
        normalizedEmail
  );

  if (existingUser) {
    return res.status(409).json({
      message: "E-mail já cadastrado",
    });
  }

  const nextId =
    users.length > 0
      ? Math.max(
          ...users.map((user) => Number(user.id))
        ) + 1
      : 1;

  const newUser = {
    id: nextId,
    name: name.trim(),
    email: email.trim(),
    password,
  };

  db.get("users")
    .push(newUser)
    .write();

  return res.status(201).json({
    id: newUser.id,
    name: newUser.name,
    email: newUser.email,
  });
});

// PROTEÇÃO DAS ROTAS /users
server.use((req, res, next) => {
  if (req.path.startsWith("/users")) {
    const authHeader =
      req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Token ausente",
      });
    }

    const token =
      authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Token ausente",
      });
    }

    try {
      const decoded = jwt.verify(
        token,
        SECRET_KEY
      );

      req.user = decoded;

      return next();
    } catch {
      return res.status(401).json({
        message:
          "Token inválido ou expirado",
      });
    }
  }

  next();
});

// EDITAR USUÁRIO
server.put("/users/:id", (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  const db = router.db;

  const userId = Number(id);

  const users = db.get("users").value();

  const user = users.find(
    (currentUser) =>
      Number(currentUser.id) === userId
  );

  if (!user) {
    return res.status(404).json({
      message: "Usuário não encontrado",
    });
  }

  if (!name || !email) {
    return res.status(400).json({
      message: "Nome e e-mail são obrigatórios",
    });
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const existingUser = users.find(
    (currentUser) =>
      Number(currentUser.id) !== userId &&
      currentUser.email &&
      currentUser.email
        .trim()
        .toLowerCase() === normalizedEmail
  );

  if (existingUser) {
    return res.status(409).json({
      message: "E-mail já cadastrado",
    });
  }

  db.get("users")
    .find({
      id: userId,
    })
    .assign({
      name: name.trim(),
      email: email.trim(),
    })
    .write();

  return res.json({
    message:
      "Usuário atualizado com sucesso",
  });
});

// ALTERAR A PRÓPRIA SENHA
server.patch(
  "/users/:id/password",
  (req, res) => {
    const { id } = req.params;
    const {
      currentPassword,
      newPassword,
    } = req.body;

    const db = router.db;
    const userId = Number(id);

    if (userId !== req.user.id) {
      return res.status(403).json({
        message: "Acesso negado",
      });
    }

    const user = db
      .get("users")
      .find({
        id: userId,
      })
      .value();

    if (!user) {
      return res.status(404).json({
        message: "Usuário não encontrado",
      });
    }

    if (
      user.password !== currentPassword
    ) {
      return res.status(400).json({
        message: "Senha atual incorreta",
      });
    }

    if (
      !newPassword ||
      newPassword.length < 6
    ) {
      return res.status(400).json({
        message:
          "A nova senha deve ter pelo menos 6 caracteres",
      });
    }

    db.get("users")
      .find({
        id: userId,
      })
      .assign({
        password: newPassword,
      })
      .write();

    return res.json({
      message:
        "Senha alterada com sucesso",
    });
  }
);

// ROTAS PADRÃO DO JSON SERVER
server.use(router);

server.listen(3001, () => {
  console.log(
    "🚀 JSON Server rodando em http://localhost:3001"
  );
});