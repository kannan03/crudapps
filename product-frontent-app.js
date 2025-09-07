

// App.css
// body {
//     font-family: Arial, sans-serif;
//     background: #f5f7fa;
//     margin: 0;
//     padding: 0;
//   }
  
//   .container {
//     max-width: 900px;
//     margin: auto;
//     padding: 20px;
//   }
  
//   h1 {
//     text-align: center;
//     color: #333;
//   }
  
//   .form {
//     display: flex;
//     flex-direction: column;
//     gap: 10px;
//     background: #fff;
//     padding: 20px;
//     border-radius: 10px;
//     box-shadow: 0 3px 8px rgba(0,0,0,0.1);
//     margin-bottom: 30px;
//   }
  
//   .form input, .form textarea, .form button {
//     padding: 10px;
//     border: 1px solid #ddd;
//     border-radius: 6px;
//   }
  
//   .form textarea {
//     resize: none;
//     height: 60px;
//   }
  
//   .form button {
//     background: #007bff;
//     color: white;
//     border: none;
//     cursor: pointer;
//     transition: 0.3s;
//   }
  
//   .form button:hover {
//     background: #0056b3;
//   }
  
//   .preview {
//     text-align: center;
//   }
  
//   .preview img {
//     width: 120px;
//     border-radius: 8px;
//     margin-top: 10px;
//     border: 1px solid #ddd;
//   }
  
//   .product-list {
//     display: grid;
//     grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
//     gap: 20px;
//   }
  
//   .product-card {
//     background: #fff;
//     padding: 15px;
//     border-radius: 10px;
//     box-shadow: 0 3px 8px rgba(0,0,0,0.1);
//     text-align: center;
//   }
  
//   .product-card img {
//     width: 100%;
//     height: 150px;
//     object-fit: cover;
//     border-radius: 6px;
//     margin-bottom: 10px;
//   }
  
//   .product-card h3 {
//     margin: 5px 0;
//     color: #333;
//   }
  
//   .product-card p {
//     margin: 5px 0;
//     color: #666;
//   }
  
//   .offer {
//     color: #e63946;
//     font-weight: bold;
//   }
  
//   .actions {
//     display: flex;
//     justify-content: space-around;
//     margin-top: 10px;
//   }
  
//   .actions button {
//     padding: 6px 12px;
//     border: none;
//     border-radius: 6px;
//     cursor: pointer;
//   }
  
//   .actions button:hover {
//     opacity: 0.8;
//   }
  
//   .actions .delete {
//     background: #dc3545;
//     color: white;
//   }
  

import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/products";

function App() {
  const [products, setProducts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    price: "",
    description: "",
    offerPercentage: 0,
    productImage: null
  });
  const [preview, setPreview] = useState("");
  const [editingId, setEditingId] = useState(null);

  // Fetch products
  const fetchProducts = async () => {
    const res = await axios.get(API_URL);
    setProducts(res.data);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value, type, files } = e.target;
    if (type === "file") {
      setForm({ ...form, productImage: files[0] });
      setPreview(URL.createObjectURL(files[0]));
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Submit form with FormData
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", form.name);
    formData.append("price", form.price);
    formData.append("description", form.description);
    formData.append("offerPercentage", form.offerPercentage);
    if (form.productImage) {
      formData.append("productImage", form.productImage);
    }

    if (editingId) {
      await axios.put(`${API_URL}/${editingId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    } else {
      await axios.post(API_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    }

    setForm({ name: "", price: "", description: "", offerPercentage: 0, productImage: null });
    setPreview("");
    setEditingId(null);
    fetchProducts();
  };

  // Edit product
  const handleEdit = (product) => {
    setForm({
      name: product.name,
      price: product.price,
      description: product.description,
      offerPercentage: product.offerPercentage,
      productImage: null
    });
    setPreview(product.productImage ? `http://localhost:5000${product.productImage}` : "");
    setEditingId(product._id);
  };

  // Delete product
  const handleDelete = async (id) => {
    await axios.delete(`${API_URL}/${id}`);
    fetchProducts();
  };

  return (
    <div className="container">
      <h1>📦 Product CRUD with Image Upload</h1>

      <form className="form" onSubmit={handleSubmit}>
        <input type="text" name="name" placeholder="Product Name" value={form.name} onChange={handleChange} required />
        <input type="number" name="price" placeholder="Price" value={form.price} onChange={handleChange} required />
        <textarea name="description" placeholder="Description" value={form.description} onChange={handleChange}></textarea>
        <input type="number" name="offerPercentage" placeholder="Offer %" value={form.offerPercentage} onChange={handleChange} min="0" max="100" />
        
        {/* ✅ File Upload */}
        <input type="file" name="productImage" accept="image/*" onChange={handleChange} />

        {/* ✅ Preview */}
        {preview && (
          <div className="preview">
            <img src={preview} alt="Preview" />
          </div>
        )}

        <button type="submit">{editingId ? "Update" : "Add"} Product</button>
      </form>

      <div className="product-list">
        {products.map((p) => (
          <div key={p._id} className="product-card">
            {p.productImage && (
              <img src={`http://localhost:5000${p.productImage}`} alt={p.name} className="product-img" />
            )}
            <h3>{p.name}</h3>
            <p>{p.description}</p>
            <p>
              <b>${p.price}</b>{" "}
              {p.offerPercentage > 0 && (
                <span className="offer">
                  {p.offerPercentage}% OFF → $
                  {(p.price - (p.price * p.offerPercentage) / 100).toFixed(2)}
                </span>
              )}
            </p>
            <div className="actions">
              <button onClick={() => handleEdit(p)}>✏️ Edit</button>
              <button onClick={() => handleDelete(p._id)} className="delete">🗑 Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
