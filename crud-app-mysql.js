const express = require("express");
const mysql = require("mysql2/promise");
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

const authMiddleware = (req, res, next) => {
    try {
       const token = req.headers["authorization"] ? req.headers["authorization"].split(" ")[1] : "";
       if (!token) return res.status(401).json({ error: "Token missing" });    
       const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
       req.user = decoded; // attach user info (id, email) to request
       next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
};

async function checkConnection() {
    try {
      const connection = await mysql.createConnection({
        host: "localhost",
        user: "root",
        password: "admin123",
        database: "kannan"
      });
      console.log("✅ MySQL connected!");
      const [rows] = await connection.query("SELECT NOW() AS now");
      console.log("Server time is:", rows[0].now);
      await connection.end();

    } catch (err) {
      console.error("❌ MySQL connection error:", err.message);
    }
  }
  

// MySQL connection
let db;
( async () => {
   try{
    await checkConnection();
    db = mysql.createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASS || "admin123",
      database: process.env.DB_NAME || "kannan",
      connectionLimit: 10
    });
  
   } catch(err){
       console.log("Connection Error:", err)
   }
})();

/*CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    age INT,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
*/

// REGISTER (Sign Up)
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    // Check existing
    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length > 0) return res.status(400).json({ error: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      "INSERT INTO users (name, email, age, password) VALUES (?, ?, ?, ?)",
      [name, email, age, hashedPassword]
    );

    res.status(201).json({ message: "User registered successfully", userId: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// LOGIN (Sign In)
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    const [rows] = await db.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(400).json({ error: "Invalid credentials" });

    const user = rows[0];
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
    const [rows] = await db.query("SELECT id, name, email, age, created_at FROM users");
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET user by id
app.get("/api/users/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, age, created_at FROM users WHERE id = ?", [req.params.id]);
    if (rows.length === 0) return res.status(404).json({ error: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE user
app.put("/api/users/:id", async (req, res) => {
  try {
    const { name, email, age } = req.body;
    const [result] = await db.query(
      "UPDATE users SET name = ?, email = ?, age = ? WHERE id = ?",
      [name, email, age, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE user
app.delete("/api/users/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM users WHERE id = ?", [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: "User not found" });
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PROTECTED route example
app.get("/profile", authMiddleware, async (req, res) => {
    try {
      const [rows] = await db.query(
        "SELECT id, name, email, age, created_at FROM users WHERE id = ?",
        [req.user.id]
      );
  
      if (rows.length === 0) return res.status(404).json({ error: "User not found" });
  
      res.json(rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});
  
// Start server
app.listen(PORT, () => console.log(`🚀 Server running at http://localhost:${PORT}`));
