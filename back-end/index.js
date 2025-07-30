import express from 'express';
import http from 'http';
import bodyParser from 'body-parser';
import sqlite3 from 'sqlite3';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config(); // Load .env

const app = express();
const sqlite = sqlite3.verbose();
const dbPath = process.env.DATABASE_URL || './todo.db';
const db = new sqlite.Database(dbPath);

app.use(bodyParser.json());

// Serve frontend (optional if needed)
app.use(express.static(path.join(process.cwd(), "public")));

app.get("/get", (req, res) => {
    console.log("GET /get");
    db.all("SELECT * FROM todo", (err, rows) => {
        res.json({ todoItems: rows });
    });
});

app.post("/add", (req, res) => {
    const item = req.body.item;
    db.get("SELECT max(id) as mn FROM todo", (err, row) => {
        let id = row.mn ? parseInt(row.mn) + 1 : 1;
        db.run("INSERT INTO todo VALUES (?, ?)", [id, item], (err) => {
            db.all("SELECT * FROM todo", (err, rows) => {
                res.json({ todoItems: rows });
            });
        });
    });
});

app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM todo WHERE id = ?", [id], (err) => {
        db.all("SELECT * FROM todo", (err, rows) => {
            res.json({ todoItems: rows });
        });
    });
});

app.post("/update", (req, res) => {
    const { id, item } = req.body;
    db.run("UPDATE todo SET item = ? WHERE id = ?", [item, id], (err) => {
        db.all("SELECT * FROM todo", (err, rows) => {
            res.json({ todoItems: rows });
        });
    });
});

// Create DB table if not exists and start server
http.createServer(app).listen(process.env.PORT, () => {
    db.run("CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY, item TEXT)", () => {
        console.log(`Server running on port ${process.env.PORT}`);
        console.log(`Using SQLite DB: ${dbPath}`);
    });
});
