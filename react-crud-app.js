// App.js

import React, { useState } from 'react';

function App() {
  // Initialize users state
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);

  // Handle adding a new user
  const addUser = () => {
    if (!name || !email) {
      alert('Both name and email are required!');
      return;
    }

    const newUser = {
      name,
      email,
    };

    setUsers([...users, newUser]);
    setName('');
    setEmail('');
  };

  // Handle editing an existing user
  const editUser = (index) => {
    const user = users[index];
    setName(user.name);
    setEmail(user.email);
    setEditingIndex(index);
  };

  // Handle updating the user
  const updateUser = () => {
    if (!name || !email) {
      alert('Both name and email are required!');
      return;
    }

    const updatedUsers = [...users];
    updatedUsers[editingIndex] = { name, email };
    setUsers(updatedUsers);
    setName('');
    setEmail('');
    setEditingIndex(null);
  };

  // Handle deleting a user
  const deleteUser = (index) => {
    const updatedUsers = users.filter((user, i) => i !== index);
    setUsers(updatedUsers);
  };

  return (
    <div className="App">
      <h1>User Management</h1>
      <div>
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {editingIndex !== null ? (
          <button onClick={updateUser}>Update User</button>
        ) : (
          <button onClick={addUser}>Add User</button>
        )}
      </div>

      <h2>Users List</h2>
      <ul>
        {users.map((user, index) => (
          <li key={index}>
            <strong>{user.name}</strong> - {user.email}
            <button onClick={() => editUser(index)}>Edit</button>
            <button onClick={() => deleteUser(index)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
