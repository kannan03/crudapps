const express = require("express");
const { Pool } = require("pg");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

// Middleware
app.use(express.json());
app.use(cors());

// Auth middleware
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers["authorization"];
    if (!authHeader) return res.status(401).json({ error: "No token provided" });
    const token = authHeader.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Token missing" });
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // attach user info (id, email)
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};

// PostgreSQL connection
const db = new Pool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASS || "admin2@123",
  database: process.env.DB_NAME || "kannan",
  port: process.env.DB_PORT || 5432,
});

// Test connection
db.connect()
  .then(() => console.log("✅ PostgreSQL connected"))
  .catch((err) => console.error("❌ PostgreSQL connection error:", err.message));

/* CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
*/

// REGISTER (Sign Up)
app.post("/api/users", async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    // Check existing
    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length > 0) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const insert = await db.query(
      "INSERT INTO users (name, email, age, password) VALUES ($1, $2, $3, $4) RETURNING id",
      [name, email, age, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", userId: insert.rows[0].id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (Sign In)
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await db.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: "1h" });

    res.json({ message: "Login successful", token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET all users
app.get("/api/users", async (req, res) => {
  try {
    const result = await db.query("SELECT id, name, email, age, created_at FROM users");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id
app.get("/api/users/:id", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, age, created_at FROM users WHERE id = $1",
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const result = await db.query(
      "UPDATE users SET name = $1, email = $2, age = $3 WHERE id = $4 RETURNING id",
      [name, email, age, req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const result = await db.query("DELETE FROM users WHERE id = $1", [req.params.id]);
    if (result.rowCount === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROTECTED route example
app.get("/profile", authMiddleware, async (req, res) => {
  try {
    const result = await db.query(
      "SELECT id, name, email, age, created_at FROM users WHERE id = $1",
      [req.user.id]
    );

    if (result.rows.length === 0) return res.status(404).json({ error: "User not found" });

    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
