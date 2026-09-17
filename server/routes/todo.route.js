const express = require("express");
const { isauth } = require("../middlewares/auth.middleware");
const {
    createTodo,
    updateTodo,
    deleteTodo,
    getAllTodos,
} = require("../controllers/todo.controller");

const router = express.Router();

// Create todo
router.post("/create-todo", isauth, createTodo);

// Update todo (status, taskName, category)
router.put("/update-todo/:todoId", isauth, updateTodo);

// Delete todo
router.delete("/delete-todo/:todoId", isauth, deleteTodo);

// Get all todos (with optional ?categoryId=... or ?status=... query params)
router.get("/get-all-todos", isauth, getAllTodos);

module.exports = router;
