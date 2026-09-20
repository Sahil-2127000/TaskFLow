const mongoose = require("mongoose");
const Category = require("../models/category.model");
const User = require("../models/user.model");
const Todo = require("../models/todo.model");

const DEFAULT_CATEGORIES = [
    { name: 'Development', color: '#F3E8FF', textColor: '#9333EA' },
    { name: 'Study', color: '#DBEAFE', textColor: '#2563EB' },
    { name: 'Health', color: '#D1FAE5', textColor: '#059669' },
    { name: 'Personal', color: '#E0E7FF', textColor: '#4F46E5' },
    { name: 'Career', color: '#FEE2E2', textColor: '#DC2626' },
];

exports.createCategory = async (req, res) => {
    try {
        const { categoryName, color, textColor } = req.body;

        if (!categoryName || typeof categoryName !== "string" || !categoryName.trim()) {
            return res.status(400).json({
                success: false,
                message: "A valid category name is required"
            });
        }

        const userId = req.user._id;

        // Fetch user categories to check for duplicates
        const userDetails = await User.findById(userId).populate("categories");
        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        const existingCategory = (userDetails.categories || []).some(
            (cat) => cat && cat.name && cat.name.toLowerCase() === categoryName.trim().toLowerCase()
        );

        if (existingCategory) {
            return res.status(400).json({
                success: false,
                message: "A category with this name already exists"
            });
        }

        // Create category
        const category = await Category.create({
            name: categoryName.trim(),
            color: color || "#E0E7FF",
            textColor: textColor || "#4F46E5",
            user: userId,
        });

        // Add category to the user model atomically
        await User.findByIdAndUpdate(userId, {
            $addToSet: { categories: category._id }
        });

        return res.status(201).json({
            success: true,
            message: "Category created successfully",
            category
        });

    } catch (err) {
        console.error("Error creating category:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error while creating a category",
            error: err.message
        });
    }
};

exports.getAllCategories = async (req, res) => {
    try {
        const userId = req.user._id;

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized access while fetching categories"
            });
        }

        // Fetch user with categories
        const userDetails = await User.findById(userId).populate("categories");

        if (!userDetails) {
            return res.status(404).json({
                success: false,
                message: "User not found"
            });
        }

        // Filter out any dangling null references
        let allCategories = (userDetails.categories || []).filter(Boolean);

        // If user has no categories in database yet, auto-seed defaults directly in MongoDB
        if (allCategories.length === 0) {
            try {
                const createdCats = await Category.insertMany(
                    DEFAULT_CATEGORIES.map((c) => ({
                        name: c.name,
                        color: c.color,
                        textColor: c.textColor,
                        user: userId,
                    }))
                );

                const catIds = createdCats.map((c) => c._id);
                await User.findByIdAndUpdate(userId, {
                    $set: { categories: catIds }
                });

                allCategories = createdCats;
            } catch (seedErr) {
                console.error("Error auto-seeding categories in getAllCategories:", seedErr);
            }
        }

        return res.status(200).json({
            success: true,
            message: "All categories fetched successfully",
            data: allCategories
        });

    } catch (err) {
        console.error("Error fetching categories:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching all categories",
            error: err.message
        });
    }
};

exports.deleteCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        const userId = req.user._id;

        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Category ID is required"
            });
        }

        // Find category
        const categoryDetails = await Category.findOne({ _id: categoryId, user: userId });

        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category not found or unauthorized"
            });
        }

        // Remove category from user model atomically
        await User.findByIdAndUpdate(userId, {
            $pull: { categories: categoryId }
        });

        // Delete category from Category collection
        await Category.findByIdAndDelete(categoryId);

        // Unset category reference from associated todos
        await Todo.updateMany(
            { category: categoryId, user: userId },
            { $unset: { category: "" } }
        );

        return res.status(200).json({
            success: true,
            message: "Category deleted successfully",
        });

    } catch (err) {
        console.error("Error deleting category:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error while deleting category",
            error: err.message
        });
    }
};

exports.updateCategory = async (req, res) => {
    try {
        const { categoryName, color, textColor } = req.body;
        const { categoryId } = req.params;
        const userId = req.user._id;

        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({
                success: false,
                message: "Valid Category ID is required"
            });
        }

        if (!categoryName || typeof categoryName !== "string" || !categoryName.trim()) {
            return res.status(400).json({
                success: false,
                message: "Valid category name is required"
            });
        }

        // Find category
        const categoryDetails = await Category.findOne({ _id: categoryId, user: userId });

        if (!categoryDetails) {
            return res.status(404).json({
                success: false,
                message: "Category not found or unauthorized"
            });
        }

        // If renaming, check if another category for this user has the same name
        const isRenaming = categoryDetails.name.toLowerCase() !== categoryName.trim().toLowerCase();

        if (isRenaming) {
            const userDetails = await User.findById(userId).populate("categories");
            const existingCategory = (userDetails?.categories || []).some(
                (cat) => cat && cat._id.toString() !== categoryId && cat.name && cat.name.toLowerCase() === categoryName.trim().toLowerCase()
            );

            if (existingCategory) {
                return res.status(400).json({
                    success: false,
                    message: "Another category with this name already exists"
                });
            }
        }

        // Update category
        categoryDetails.name = categoryName.trim();
        if (color) categoryDetails.color = color;
        if (textColor) categoryDetails.textColor = textColor;
        await categoryDetails.save();

        return res.status(200).json({
            success: true,
            message: "Category updated successfully",
            category: categoryDetails
        });

    } catch (err) {
        console.error("Error updating category:", err);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error while updating category",
            error: err.message
        });
    }
};


