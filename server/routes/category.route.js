const express = require('express');
const { isauth } = require('../middlewares/auth.middleware');
const { createCategory, deleteCategory, updateCategory, getAllCategories } = require('../controllers/category.controller');
const router = express.Router();


//create category
router.post('/create-category',isauth,createCategory);

//update category
router.put('/update-category/:categoryId',isauth,updateCategory);

//delete category
router.delete('/delete-category/:categoryId',isauth,deleteCategory);

//get all categories
router.get('/get-all-categories',isauth,getAllCategories);

module.exports = router;