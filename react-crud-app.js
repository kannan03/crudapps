//frontend/src/index.js
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);


//frontend/src/App.js
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import UserList from "./pages/UserList";

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/signup">Sign Up</Link> |{" "}
        <Link to="/signin">Sign In</Link> |{" "}
        <Link to="/users">User List</Link>
      </nav>
      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/users" element={<UserList />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

//frontend/src/pages/UserList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import UserList from "./frontend/src/pages/UserList";

function UserList() {
  const token = localStorage.getItem("token");
  if( !token) return <Navigate to="/signin" />;

  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({ id: null, name: "", email: "", password: "" });
  const [isEditing, setIsEditing] = useState(false);

  const API = "http://localhost:5000/api/users";

  // Fetch users
  const fetchUsers = async () => {
    const res = await axios.get(API);
    setUsers(res.data);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleAdd = async (e) => {
    e.preventDefault();
    await axios.post(API, { name: form.name, email: form.email });
    fetchUsers();
    setForm({ id: null, name: "", email: "",password : "" });
  };

  const handleEdit = (user) => {
    setIsEditing(true);
    setForm(user);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`${API}/${form.id}`, { name: form.name, email: form.email });
    fetchUsers();
    setIsEditing(false);
    setForm({ id: null, name: "", email: "", password : "" });
  };

  const handleDelete = async (id) => {
    await axios.delete(`${API}/${id}`);
    fetchUsers();
  };

  return (
    <div style={{ maxWidth: 500, margin: "20px auto", padding: 20 }}>
      <h1>User CRUD (React + Axios)</h1>

      <form onSubmit={isEditing ? handleUpdate : handleAdd}>
        <input
          type="text"
          name="name"
          placeholder="Name"
          value={form.name}
          onChange={handleChange}
          style={{ display: "block", margin: "8px 0", padding: "8px", width: "100%" }}
        />
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={{ display: "block", margin: "8px 0", padding: "8px", width: "100%" }}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          style={{ display: "block", margin: "8px 0", padding: "8px", width: "100%" }}
        />

        <button type="submit" style={{ padding: "8px 12px", marginTop: "8px" }}>
          {isEditing ? "Update User" : "Add User"}
        </button>
      </form>

      <ul style={{ marginTop: 20 }}>
        {users.map((u) => (
          <li key={u.id} style={{ margin: "10px 0", padding: "10px", border: "1px solid #ccc" }}>
            <b>{u.name}</b> - {u.email}
            <div>
              <button onClick={() => handleEdit(u)} style={{ marginRight: 10 }}>Edit</button>
              <button onClick={() => handleDelete(u.id)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;

