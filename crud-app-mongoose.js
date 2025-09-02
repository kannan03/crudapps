// npm init -y
// npm install express mongoose bcryptjs jsonwebtoken cors dotenv


const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");
require("dotenv").config();

// app Initialize 
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

console.log("JWT_SECRET===============",JWT_SECRET);

// Middleware
app.use(express.json());
app.use(cors());

const authMiddleware = (req, res, next) => {
    try {
       const authHeader = req.headers["authorization"];
       if (!authHeader) return res.status(401).json({ error: "No token provided" });
       const token = authHeader.split(" ")[1];
       if (!token) return res.status(401).json({ error: "Token missing" });    
       const decoded = jwt.verify(token, process.env.JWT_SECRET || "supersecretkey");
       req.user = decoded; // attach user info (id, email) to request
       next();
    } catch (err) {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
};

// MongoDB connection
mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/user_crud_db", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// User Schema + Model
const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  age: { type: Number },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const User = mongoose.model("User", userSchema);

// User Router Create
// REGISTER (Sign Up)
app.post("/api/signup", async (req, res) => {
  try {
    const { name, email, age, password } = req.body;

    // Check existing user
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: "Email already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = new User({ name, email, age, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: "User registered successfully", userId: user._id });
  } catch (err) {
    console.log("something went wrong:", err);
    res.status(500).json({ error: err.message });
}
});

// LOGIN (Sign In)
app.post("/api/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Create token
    const token = jwt.sign(
      { id: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: "5h" }
    );

    res.json({ message: "Login successful", token });
  } catch (err) {
    console.log("something went wrong:", err);
    res.status(500).json({ error: err.message });
}
});

// get All users
app.get("/api/users", async (req, res) => {
    try{
        const users = await User.find().select("-password");
        res.json(users);    
    }catch(err){
        console.log("something went wrong:", err);
        res.status(500).json({ error: err.message });
    }
});

// READ one
app.get("/users/:id", async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
});  

// UPDATE
app.put("/api/users/:id", async (req, res) => {
    try {
      const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true,
      });
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json(user);
    } catch (err) {
        console.log("something went wrong:", err);
        res.status(500).json({ error: err.message });
    }
});

// DELETE
app.delete("/api/users/:id", async (req, res) => {
    try {
      const user = await User.findByIdAndDelete(req.params.id);
      if (!user) return res.status(404).json({ message: "User not found" });
      res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.log("something went wrong:", err);
        res.status(500).json({ error: err.message });
    }
});
  
  
// PROTECTED route example
app.get("/api/profile", authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select("-password");
      res.json(user);
    } catch (err) {
        console.log("something went wrong:", err);
        res.status(401).json({ error: "Invalid token" });
    }
});
  

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
