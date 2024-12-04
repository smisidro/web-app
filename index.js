const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();


const app = express();
const port = process.env.PORT || 3000;


app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

// Create table if not exists
const createTableIfNotExists = () => {
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      completed INTEGER DEFAULT 0,
      date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  db.run(createTableSQL, (err) => {
    if (err) {
      console.error('Error creating table:', err.message);
    } else {
      console.log('Table "items" is ready.');
    }
  });
};
createTableIfNotExists();

// Fetch all items
app.get('/items', (req, res) => {
  db.all('SELECT * FROM items ORDER BY id ASC', (err, rows) => {
    if (err) {
      return res.status(500).json({ error: 'Failed to fetch tasks' });
    }
    console.log('Fetched tasks:', rows);  // Log the fetched tasks
    res.json(rows);
  });
});

// Add a task
app.post('/items', (req, res) => {
  const { name, description = '' } = req.body; // Destructure and set default values
  const completed = 0;

  if (!name) {
      return res.status(400).json({ error: 'Task name is required' });
  }

  const query = 'INSERT INTO items (name, description, completed) VALUES (?, ?, ?)';
  db.run(query, [name, description, completed], function (err) {
      if (err) {
          console.error('Database error:', err);
          return res.status(500).json({ error: 'Failed to insert task' });
      }

      const fetchQuery = 'SELECT * FROM items WHERE id = ?';
      db.get(fetchQuery, [this.lastID], (err, newItem) => {
          if (err) {
              console.error('Fetch error:', err);
              return res.status(500).json({ error: 'Failed to fetch task' });
          }
          res.status(201).json(newItem);
      });
  });
});

// Update a task
app.put('/items/:id', (req, res) => {
  const { id } = req.params;
  const { name, description, completed } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing required field: name' });
  }

  const updateQuery = 'UPDATE items SET name = ?, description = ?, completed = ? WHERE id = ?';
  db.run(updateQuery, [name, description || "", completed, id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to update task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    const fetchQuery = 'SELECT * FROM items WHERE id = ?';
    db.get(fetchQuery, [id], (err, updatedTask) => {
      if (err) {
        return res.status(500).json({ error: 'Failed to fetch updated task' });
      }
      console.log('Updated task:', updatedTask);  // Log the updated task
      res.status(200).json(updatedTask);
    });
  });
});

// Delete a task
app.delete('/items/:id', (req, res) => {
  const { id } = req.params;

  const deleteQuery = 'DELETE FROM items WHERE id = ?';
  db.run(deleteQuery, [id], function (err) {
    if (err) {
      return res.status(500).json({ error: 'Failed to delete task' });
    }

    if (this.changes === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.status(200).json({ message: 'Task deleted successfully' });
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
