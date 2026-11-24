import os
import sqlite3
from flask import Flask, jsonify, request, render_template

app = Flask(__name__)
DB = os.environ.get("TODO_DB", "todo.db")

def connect():
    conn = sqlite3.connect(DB, timeout=10)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with connect() as db:
        db.execute("CREATE TABLE IF NOT EXISTS todo (id INTEGER PRIMARY KEY, task TEXT NOT NULL, done BOOLEAN NOT NULL DEFAULT 0)")

init_db()

@app.get("/")
def home():
    return render_template("index.html")

@app.get("/health")
def health():
    with connect() as db:
        db.execute("SELECT 1")
    return jsonify(status="ok")

@app.get("/todos")
def todos():
    with connect() as db:
        rows = db.execute("SELECT id, task, done FROM todo ORDER BY id").fetchall()
    return jsonify([dict(id=r["id"], task=r["task"], done=bool(r["done"])) for r in rows])

@app.post("/todos")
def add():
    data = request.get_json(silent=True)
    task = data.get("task") if isinstance(data, dict) else None
    if not isinstance(task, str) or not task.strip():
        return jsonify(error="Görev adı gerekli"), 400
    with connect() as db:
        cur = db.execute("INSERT INTO todo(task, done) VALUES (?, 0)", (task.strip(),))
        ident = cur.lastrowid
    return jsonify(id=ident, task=task.strip(), done=False), 201

@app.patch("/todos/<int:ident>")
def update(ident):
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or type(data.get("done")) is not bool:
        return jsonify(error="done true veya false olmalı"), 400
    with connect() as db:
        cur = db.execute("UPDATE todo SET done=? WHERE id=?", (data["done"], ident))
        if not cur.rowcount:
            return jsonify(error="Görev bulunamadı"), 404
    return jsonify(id=ident, done=data["done"])

@app.delete("/todos/<int:ident>")
def delete(ident):
    with connect() as db:
        cur = db.execute("DELETE FROM todo WHERE id=?", (ident,))
        if not cur.rowcount:
            return jsonify(error="Görev bulunamadı"), 404
    return "", 204
