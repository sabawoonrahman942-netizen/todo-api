import os
import tempfile
import unittest

tmp = tempfile.TemporaryDirectory()
os.environ["TODO_DB"] = os.path.join(tmp.name, "test.db")
from app import app

class TodoTest(unittest.TestCase):
    def test_crud(self):
        client = app.test_client()
        self.assertEqual(client.get("/").status_code, 200)
        self.assertEqual(client.get("/health").status_code, 200)
        self.assertEqual(client.post("/todos", json={}).status_code, 400)
        response = client.post("/todos", json={"task": "Docker"})
        self.assertEqual(response.status_code, 201)
        ident = response.json["id"]
        self.assertTrue(any(t["id"] == ident for t in client.get("/todos").json))
        self.assertEqual(client.patch(f"/todos/{ident}", json={"done": True}).status_code, 200)
        self.assertTrue(next(t for t in client.get("/todos").json if t["id"] == ident)["done"])
        self.assertEqual(client.delete(f"/todos/{ident}").status_code, 204)
        self.assertFalse(any(t["id"] == ident for t in client.get("/todos").json))
