const express = require('express');
const mysql = require('mysql2');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(cors());

// MySQL connection with Promise support
const db = mysql.createConnection({
  host: 'localhost',   // Change to your MySQL host if necessary
  user: 'root',        // MySQL username
  password: '',        // MySQL password
  database: 'node_crud'
});

// Use promise-based API from mysql2
const dbPromise = db.promise();

// CREATE: Add a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  try {
    const [result] = await dbPromise.query('INSERT INTO users (name, email) VALUES (?, ?)', [name, email]);
    res.status(201).send({ message: 'User added', id: result.insertId });
  } catch (err) {
    res.status(500).send({ message: 'Error adding user', error: err });
  }
});

// READ: Get all users
app.get('/users', async (req, res) => {
  try {
    const [rows] = await dbPromise.query('SELECT * FROM users');
    res.status(200).send(rows);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving users', error: err });
  }
});

// READ: Get a single user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await dbPromise.query('SELECT * FROM users WHERE id = ?', [id]);
    if (rows.length > 0) {
      res.status(200).send(rows[0]);
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving user', error: err });
  }
});

// UPDATE: Update user details
app.put('/users/:id', async (req, res) => {
  const { id } = req.params;
  const { name, email } = req.body;
  try {
    const [result] = await dbPromise.query('UPDATE users SET name = ?, email = ? WHERE id = ?', [name, email, id]);
    if (result.affectedRows > 0) {
      res.status(200).send({ message: 'User updated' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Error updating user', error: err });
  }
});

// DELETE: Delete a user
app.delete('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const [result] = await dbPromise.query('DELETE FROM users WHERE id = ?', [id]);
    if (result.affectedRows > 0) {
      res.status(200).send({ message: 'User deleted' });
    } else {
      res.status(404).send({ message: 'User not found' });
    }
  } catch (err) {
    res.status(500).send({ message: 'Error deleting user', error: err });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
