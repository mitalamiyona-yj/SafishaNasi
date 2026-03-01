const db = require("../db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.registerUser = async (req, res) => {
  const { name, email, password, role } = req.body;

  const hashedPassword = await bcrypt.hash(password, 10);

  db.query(
    "INSERT INTO users (name,email,password,role) VALUES (?,?,?,?)",
    [name, email, hashedPassword, role],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({ message: "User registered successfully" });
    }
  );
};

exports.loginUser = (req, res) => {
  const { email, password } = req.body;

  db.query(
    "SELECT * FROM users WHERE email=?",
    [email],
    async (err, results) => {
      if (err) return res.status(500).json(err);

      if (results.length === 0)
        return res.status(401).json({ message: "User not found" });

      const user = results[0];

      const match = await bcrypt.compare(password, user.password);

      if (!match)
        return res.status(401).json({ message: "Invalid password" });

      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.json({ token, user });
    }
  );
};