const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");

const SECRET_KEY = "segredo123";
const RESET_SECRET_KEY =
  "segredo-recuperacao-123";

const ADMIN_USER_ID = 1;

server.use(middlewares);
server.use(bodyParser.json());

// ==========================================
// LOGIN
// ==========================================

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

// ==========================================
// ESQUECI MINHA SENHA
// ==========================================

server.post(
  "/auth/forgot-password",
  (req, res) => {
    const { email } = req.body;
    const db = router.db;

    if (!email) {
      return res.status(400).json({
        message: "Informe o e-mail",
      });
    }

    const normalizedEmail = email
      .trim()
      .toLowerCase();

    const users = db.get("users").value();

    const user = users.find(
      (currentUser) =>
        currentUser.email &&
        currentUser.email
          .trim()
          .toLowerCase() ===
          normalizedEmail
    );

    if (!user) {
      return res.status(404).json({
        message: "E-mail não encontrado",
      });
    }

    const resetToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        purpose: "password-reset",
      },
      RESET_SECRET_KEY,
      {
        expiresIn: "15m",
      }
    );

    return res.json({
      message:
        "Solicitação de recuperação gerada com sucesso.",
      resetToken,
    });
  }
);

// ==========================================
// REDEFINIR SENHA
// ==========================================

server.post(
  "/auth/reset-password",
  (req, res) => {
    const { token, newPassword } =
      req.body;

    if (!token) {
      return res.status(400).json({
        message:
          "Token de recuperação ausente",
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

    try {
      const decoded = jwt.verify(
        token,
        RESET_SECRET_KEY
      );

      if (
        decoded.purpose !==
        "password-reset"
      ) {
        return res.status(401).json({
          message:
            "Token de recuperação inválido",
        });
      }

      const db = router.db;

      const user = db
        .get("users")
        .find({
          id: decoded.id,
        })
        .value();

      if (!user) {
        return res.status(404).json({
          message:
            "Usuário não encontrado",
        });
      }

      db.get("users")
        .find({
          id: decoded.id,
        })
        .assign({
          password: newPassword,
        })
        .write();

      return res.json({
        message:
          "Senha redefinida com sucesso",
      });
    } catch {
      return res.status(401).json({
        message:
          "Link de recuperação inválido ou expirado",
      });
    }
  }
);

// ==========================================
// CADASTRO PÚBLICO
// ==========================================

server.post("/users", (req, res) => {
  const { name, email, password } =
    req.body;

  const db = router.db;

  if (!name || !email || !password) {
    return res.status(400).json({
      message:
        "Nome, e-mail e senha são obrigatórios",
    });
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const users = db.get("users").value();

  const existingUser = users.find(
    (user) =>
      user.email &&
      user.email
        .trim()
        .toLowerCase() ===
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
          ...users.map((user) =>
            Number(user.id)
          )
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

// ==========================================
// PROTEÇÃO DAS ROTAS /users
// ==========================================

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

// ==========================================
// LISTAR USUÁRIOS COM PAGINAÇÃO
// GET /users?page=1&limit=5
// ==========================================

server.get("/users", (req, res) => {
  const db = router.db;

  const page = Math.max(
    1,
    Number(req.query.page) || 1
  );

  const limit = Math.max(
    1,
    Number(req.query.limit) || 5
  );

  const users = db.get("users").value();

  const total = users.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedUsers = users
    .slice(start, end)
    .map((user) => ({
      id: user.id,
      name: user.name,
      email: user.email,
    }));

  res.setHeader(
    "Access-Control-Expose-Headers",
    "X-Total-Count"
  );

  res.setHeader(
    "X-Total-Count",
    String(total)
  );

  return res.json(paginatedUsers);
});

// ==========================================
// DETALHES DO USUÁRIO
// ==========================================

server.get("/users/:id", (req, res) => {
  const db = router.db;

  const userId = Number(req.params.id);

  const user = db
    .get("users")
    .find({
      id: userId,
    })
    .value();

  if (!user) {
    return res.status(404).json({
      message:
        "Usuário não encontrado",
    });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
  });
});

// ==========================================
// EDITAR USUÁRIO
// ==========================================

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
      message:
        "Usuário não encontrado",
    });
  }

  // ========================================
  // PROTEÇÃO DA CONTA ADMIN
  //
  // Somente o próprio Admin (ID 1)
  // pode editar a conta do Admin.
  // ========================================

  if (
    userId === ADMIN_USER_ID &&
    Number(req.user.id) !==
      ADMIN_USER_ID
  ) {
    return res.status(403).json({
      message:
        "Somente o administrador pode editar esta conta.",
    });
  }

  if (!name || !email) {
    return res.status(400).json({
      message:
        "Nome e e-mail são obrigatórios",
    });
  }

  const normalizedEmail = email
    .trim()
    .toLowerCase();

  const existingUser = users.find(
    (currentUser) =>
      Number(currentUser.id) !==
        userId &&
      currentUser.email &&
      currentUser.email
        .trim()
        .toLowerCase() ===
        normalizedEmail
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

// ==========================================
// ALTERAR A PRÓPRIA SENHA
// ==========================================

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

    /*
     * Cada usuário só pode alterar
     * a própria senha.
     */
    if (
      userId !==
      Number(req.user.id)
    ) {
      return res.status(403).json({
        message:
          "Você só pode alterar a sua própria senha.",
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
        message:
          "Usuário não encontrado",
      });
    }

    if (
      user.password !== currentPassword
    ) {
      return res.status(400).json({
        message:
          "Senha atual incorreta",
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

// ==========================================
// EXCLUIR USUÁRIO
// ==========================================

server.delete(
  "/users/:id",
  (req, res) => {
    const db = router.db;
    const userId = Number(
      req.params.id
    );

    const user = db
      .get("users")
      .find({
        id: userId,
      })
      .value();

    if (!user) {
      return res.status(404).json({
        message:
          "Usuário não encontrado",
      });
    }

    // ======================================
    // PROTEÇÃO DA CONTA ADMIN
    //
    // Outro usuário não pode excluir
    // a conta do Admin.
    //
    // Somente o próprio Admin pode realizar
    // uma exclusão da conta ID 1.
    // ======================================

    if (
      userId === ADMIN_USER_ID &&
      Number(req.user.id) !==
        ADMIN_USER_ID
    ) {
      return res.status(403).json({
        message:
          "Somente o administrador pode excluir esta conta.",
      });
    }

    db.get("users")
      .remove({
        id: userId,
      })
      .write();

    return res.json({
      message:
        "Usuário excluído com sucesso",
    });
  }
);

// ==========================================
// ROTAS PADRÃO DO JSON SERVER
// ==========================================

server.use(router);

const PORT = process.env.PORT || 3001

server.listen(PORT, () => {
  console.log(`🚀 JSON Server rodando na porta ${PORT}`)
});