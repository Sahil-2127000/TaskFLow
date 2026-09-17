import api from '../api/client';

export const categoryService = {
  /**
   * Fetch all categories belonging to the user
   */
  async getAllCategories() {
    const response = await api.get('/category/get-all-categories');
    return response.data;
  },

  /**
   * Create a new category
   * @param {string} categoryName
   * @param {string} [color]
   * @param {string} [textColor]
   */
  async createCategory(categoryName, color, textColor) {
    const response = await api.post('/category/create-category', { categoryName, color, textColor });
    return response.data;
  },

  /**
   * Update an existing category
   * @param {string} id
   * @param {string} categoryName
   * @param {string} [color]
   * @param {string} [textColor]
   */
  async updateCategory(id, categoryName, color, textColor) {
    const response = await api.put(`/category/update-category/${id}`,
       { categoryName, color, textColor });
    return response.data;
  },

  /**
   * Delete a category
   * @param {string} id
   */
  async deleteCategory(id) {
    const response = await api.delete(`/category/delete-category/${id}`);
    return response.data;
  },
};

export default categoryService;
