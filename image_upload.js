// server.js
const express = require("express");
const multer = require("multer");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve uploaded images as static files
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

// API endpoint
app.post("/api/users", upload.single("profile_image"), (req, res) => {
  const { name, email, phone } = req.body;
  const profileImage = req.file ? `/uploads/${req.file.filename}` : null; // <-- image URL

  res.json({
    message: "User created successfully!",
    user: { name, email, phone, profileImage },
  });
});

app.listen(5000, () => console.log("Server running on http://localhost:5000"));


// reactjs 
//App.js
import { useState } from "react";
import axios from "axios";

function App() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    profile_image: null,
  });
  const [preview, setPreview] = useState(null);
  const [uploadedUrl, setUploadedUrl] = useState(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (files) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
      setPreview(URL.createObjectURL(files[0])); // Preview before upload
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append("name", formData.name);
    data.append("email", formData.email);
    data.append("phone", formData.phone);
    data.append("profile_image", formData.profile_image);

    try {
      const res = await axios.post("http://localhost:5000/api/users", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert("✅ " + res.data.message);
      setUploadedUrl("http://localhost:5000" + res.data.user.profileImage);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "50px auto" }}>
      <h2>User Form</h2>
      <form onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Name" onChange={handleChange} required />
        <br /><br />
        <input type="email" name="email" placeholder="Email" onChange={handleChange} required />
        <br /><br />
        <input type="text" name="phone" placeholder="Phone" onChange={handleChange} required />
        <br /><br />
        <input type="file" name="profile_image" accept="image/*" onChange={handleChange} required />
        <br /><br />
        {preview && (
          <div>
            <p>Preview before upload:</p>
            <img src={preview} alt="preview" width="150" />
          </div>
        )}
        <br />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}

export default App;
