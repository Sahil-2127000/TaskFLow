import api from '../api/client';

export const todoService = {
  /**
   * Fetch todos with optional query parameters (date, search, status)
   * @param {Object} params - { date, search, status }
   */
  async getAllTodos(params = {}) {
    const response = await api.get('/todo/get-all-todos', { params });
    return response.data;
  },

  /**
   * Fetch today's tasks only
   */
  async getTodayTodos() {
    const response = await api.get('/todo/get-all-todos', {
      params: { date: 'today' },
    });
    return response.data;
  },

  /**
   * Create a new task
   * @param {Object} todoData - { taskName,categoryId }
   */
  async createTodo(todoData) {
    const response = await api.post('/todo/create-todo', todoData);
    return response.data;
  },

  /**
   * Update an existing task
   * @param {string} id - Task ID
   * @param {Object} updateData - Partial todo fields (status, taskName, etc.)
   */
  async updateTodo(id, updateData) {
    const response = await api.put(`/todo/update-todo/${id}`, updateData);
    return response.data;
  },

  /**
   * Delete a task by ID
   * @param {string} id - Task ID
   */
  async deleteTodo(id) {
    const response = await api.delete(`/todo/delete-todo/${id}`);
    return response.data;
  },
};

export default todoService;
