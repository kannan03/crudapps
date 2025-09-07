const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads")); // serve static files

// MongoDB connection
mongoose.connect("mongodb+srv://sivakannan:kannan3010@cluster0.vxmojpg.mongodb.net/myAppDB" || "mongodb://127.0.0.1:27017/myAppDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log("✅ MongoDB connected"))
.catch(err => console.error("❌ MongoDB connection error:", err));

// Schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  description: String,
  offerPercentage: { type: Number, default: 0 },
  productImage: { type: String } // store image path
});

const Product = mongoose.model("Product", productSchema);

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // folder where images are stored
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // unique file name
  }
});

const upload = multer({ storage });

// Routes
app.get("/api/products", async (req, res) => {
  const products = await Product.find();
  res.json(products);
});

// ✅ Create Product with Image
app.post("/api/products", upload.single("productImage"), async (req, res) => {
  try {
    const { name, price, description, offerPercentage } = req.body;
    console.log("req.body=====", req.body);
    console.log("req.file=====", req.file);

    const product = new Product({
      name,
      price,
      description,
      offerPercentage,
      productImage: req.file ? `/uploads/${req.file.filename}` : ""
    });
    await product.save();
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// ✅ Update Product (optionally upload new image)
app.put("/api/products/:id", upload.single("productImage"), async (req, res) => {
  try {
    const { name, price, description, offerPercentage } = req.body;
    const updateData = { name, price, description, offerPercentage };
    if (req.file) updateData.productImage = `/uploads/${req.file.filename}`;
    const product = await Product.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete("/api/products/:id", async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
