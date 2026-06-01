const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Database Configuration
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306,
};

let pool;

async function initializeDatabase() {
    try {
        // Connect without database to create it
        const connection = await mysql.createConnection(dbConfig);
        await connection.query('CREATE DATABASE IF NOT EXISTS stock_management_db;');
        await connection.end();

        // Reconnect with database
        pool = mysql.createPool({
            ...dbConfig,
            database: 'stock_management_db',
            waitForConnections: true,
            connectionLimit: 10,
            queueLimit: 0
        });

        // Create Tables
        const createProductTable = `
            CREATE TABLE IF NOT EXISTS Product (
                id INT AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                price DECIMAL(10, 2) NOT NULL,
                quantity INT NOT NULL DEFAULT 0
            );
        `;
        const createIncomingTable = `
            CREATE TABLE IF NOT EXISTS IncomingProduct (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES Product(id) ON DELETE CASCADE
            );
        `;
        const createOutgoingTable = `
            CREATE TABLE IF NOT EXISTS OutgoingProduct (
                id INT AUTO_INCREMENT PRIMARY KEY,
                product_id INT NOT NULL,
                quantity INT NOT NULL,
                date DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (product_id) REFERENCES Product(id) ON DELETE CASCADE
            );
        `;

        await pool.query(createProductTable);
        await pool.query(createIncomingTable);
        await pool.query(createOutgoingTable);

        console.log('Database and tables initialized successfully.');
    } catch (error) {
        console.error('Error initializing database:', error);
        process.exit(1);
    }
}

// Routes
// --- Products ---
app.post('/products', async (req, res) => {
    try {
        const { name, price, quantity = 0 } = req.body;
        const [result] = await pool.query('INSERT INTO Product (name, price, quantity) VALUES (?, ?, ?)', [name, price, quantity]);
        res.status(201).json({ id: result.insertId, name, price, quantity });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Product ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/products/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM Product WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).json({ error: 'Product not found' });
        res.json(rows[0]);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.delete('/products/:id', async (req, res) => {
    try {
        await pool.query('DELETE FROM Product WHERE id = ?', [req.params.id]);
        res.json({ message: 'Product deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Incoming Stock ---
app.post('/incoming', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { product_id, quantity } = req.body;

        // Add incoming record
        await connection.query('INSERT INTO IncomingProduct (product_id, quantity) VALUES (?, ?)', [product_id, quantity]);

        // Update product quantity
        await connection.query('UPDATE Product SET quantity = quantity + ? WHERE id = ?', [quantity, product_id]);

        await connection.commit();
        res.status(201).json({ message: 'Incoming stock recorded successfully' });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/incoming', async (req, res) => {
    try {
        const query = `
            SELECT i.*, p.name as product_name 
            FROM IncomingProduct i 
            JOIN Product p ON i.product_id = p.id 
            ORDER BY i.date DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// --- Outgoing Stock ---
app.post('/outgoing', async (req, res) => {
    const connection = await pool.getConnection();
    try {
        await connection.beginTransaction();
        const { product_id, quantity } = req.body;

        // Check current quantity
        const [productRows] = await connection.query('SELECT quantity FROM Product WHERE id = ?', [product_id]);
        if (productRows.length === 0) {
            throw new Error('Product not found');
        }

        const currentQuantity = productRows[0].quantity;
        if (currentQuantity < quantity) {
            throw new Error('Insufficient stock');
        }

        // Add outgoing record
        await connection.query('INSERT INTO OutgoingProduct (product_id, quantity) VALUES (?, ?)', [product_id, quantity]);

        // Update product quantity
        await connection.query('UPDATE Product SET quantity = quantity - ? WHERE id = ?', [quantity, product_id]);

        await connection.commit();
        res.status(201).json({ message: 'Outgoing stock recorded successfully' });
    } catch (error) {
        await connection.rollback();
        // Send a 400 status for insufficient stock so frontend can handle it easily
        res.status(error.message === 'Insufficient stock' ? 400 : 500).json({ error: error.message });
    } finally {
        connection.release();
    }
});

app.get('/outgoing', async (req, res) => {
    try {
        const query = `
            SELECT o.*, p.name as product_name 
            FROM OutgoingProduct o 
            JOIN Product p ON o.product_id = p.id 
            ORDER BY o.date DESC
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Initialize DB and start server
initializeDatabase().then(() => {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
    });
});
