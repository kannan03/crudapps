const express = require('express');
const { Client } = require('pg');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

// Middleware to parse request bodies
app.use(bodyParser.json());
app.use(cors());

// PostgreSQL connection
const client = new Client({
  user: 'postgres',      // PostgreSQL username
  host: 'localhost',     // PostgreSQL host
  database: 'node_crud', // Database name
  password: '',          // PostgreSQL password
  port: 5432,            // PostgreSQL port
});

client.connect(); // Connect to PostgreSQL

// CREATE: Add a new user
app.post('/users', async (req, res) => {
  const { name, email } = req.body;
  const query = 'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING id';
  
  try {
    const result = await client.query(query, [name, email]);
    res.status(201).send({ message: 'User added', id: result.rows[0].id });
  } catch (err) {
    res.status(500).send({ message: 'Error adding user', error: err });
  }
});

// READ: Get all users
app.get('/users', async (req, res) => {
  const query = 'SELECT * FROM users';
  
  try {
    const result = await client.query(query);
    res.status(200).send(result.rows);
  } catch (err) {
    res.status(500).send({ message: 'Error retrieving users', error: err });
  }
});

// READ: Get a single user by ID
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  const query = 'SELECT * FROM users WHERE id = $1';
  
  try {
    const result = await client.query(query, [id]);
    if (result.rows.length > 0) {
      res.status(200).send(result.rows[0]);
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
  const query = 'UPDATE users SET name = $1, email = $2 WHERE id = $3';
  
  try {
    const result = await client.query(query, [name, email, id]);
    if (result.rowCount > 0) {
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
  const query = 'DELETE FROM users WHERE id = $1';
  
  try {
    const result = await client.query(query, [id]);
    if (result.rowCount > 0) {
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
