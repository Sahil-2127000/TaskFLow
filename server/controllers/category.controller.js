const Category = require("../models/category.model");
const User = require("../models/User.model");


exports.createCategory = async(req,res)=>{
    
    try{

        //fetch the category name and optional colors from the body
        const { categoryName, color, textColor } = req.body;

        //validation of the fetched data

        if(!categoryName || categoryName === null || categoryName === undefined || categoryName.trim() === ""){
            return res.status(401).json({
                success:false,
                message: "Invalid Category Name"
            });
        }

        //fetch user from req.user
        const userId = req.user._id;

        //check if category already exists for that user
        const userDetails = await User.findOne({ _id: userId})
                            .populate("categories");

        
        const existingCategory = userDetails.categories.some((category)=> category.name.toLowerCase() === categoryName.toLowerCase()) ;


        if(existingCategory){
            return res.status(401).json({
                success:false,
                message: "Category already exists"
            });
        }

        //create category
        const category = await Category.create({
            name: categoryName.trim(),
            color: color || "#E0E7FF",
            textColor: textColor || "#4F46E5",
            user: userId,
        });

        //add category to the user model
        userDetails.categories.push(category._id);

        await userDetails.save();

        //send successful resopnse

        return res.status(201).json({
            success : true,
            message: "Category created successfully",
            category
        })
        

    }
    catch(err){
        return res.status(500).json({
            success : false,
            message:"Internal Server Error while creating a category",
            error: err.message
        })
    }

}

exports.getAllCategories = async(req,res)=>{
    try{
        
        //fetch userId from token
        const userId = req.user._id;

        if(!userId){
            return res.status(401).json({
                success:false,
                message: "Unauthorized access while fetching all the categories"
            });
        }

        //fetch all the categories of the user
        const userDetails = await User.findOne({ _id: userId})
                            .populate("categories");

        
        //fetching all the categories of the user
        const allCategories = userDetails.categories;

        if(!allCategories){
            return res.status(404).json({
                success:false,
                message: "No categories found for the user"
            });
        }

        //return successful response
        return res.status(200).json({
            success:true,
            message: "All categories fetched successfully",
            data : allCategories
        });

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message:"Internal Server Error while fetching all the categories",
            error: err.message
        });
    }
}

exports.deleteCategory = async(req,res)=>{
    try{

        //fetching id from params
        const {categoryId} = req.params;
        
        //validating the category id
        if(!categoryId){
            return res.status(401).json({
                success:false,
                message: "Category Id is required"
            });
        }
        
        //fetching user from the req.user
        const userId = req.user._id;
        
        //validating the user
        const userDetails = await User.findById(userId);
        
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message: "User not found"
            });
        }

        //fetching category from its id
        const categoryDetails = await Category.findById(categoryId);

        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message: "Category not found"
            });
        }

        //checking whether the category is associated with the user
        const isCategoryOwned = userDetails.categories.some(
            (id) => id.toString() === categoryId
        );
        
        if (!isCategoryOwned) {
            return res.status(403).json({
                success: false,
                message: "Category is not associated with the user",
            });
        }

        //deleting category from user model
        userDetails.categories.pull(categoryId);

        await userDetails.save();

        //deleting category from the category collection
        await Category.findByIdAndDelete(categoryId);

        //sending successful response
        return res.status(200).json({
            success:true,
            message: "Category deleted successfully",
        });

        

    }
    catch(err){
        return res.status(500).json({
            success : false,
            message: "Internal Server Error while deleting a category",
            error: err.message
        });
    }
}

exports.updateCategory = async(req,res)=>{
    try{
        
        //fetching the data from the body
        const { categoryName, color, textColor } = req.body;
        const { categoryId } = req.params;

        //validating the data
        if(!categoryName || categoryName === null || categoryName === undefined || categoryName.trim() === ""){
            return res.status(401).json({
                success:false,
                message: "Invalid Category Name"
            });
        }

        if(!categoryId){
            return res.status(401).json({
                success:false,
                message: "Category Id is required"
            });
        }

        //fetching user from the req.user
        const userId = req.user._id;

        //validating the user
        const userDetails = await User.findById(userId)
                            .populate("categories");

        if(!userDetails){
            return res.status(404).json({
                success:false,
                message: "User not found"
            });
        }

        //fetching the category
        const categoryDetails = await Category.findById(categoryId);

        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message: "Category not found"
            });
        }

        //checking whether the category is associated with the user
        const isCategoryOwned = userDetails.categories.some(
           (cat) => cat._id.toString() === categoryId
        );

        if (!isCategoryOwned) {
            return res.status(403).json({
                success: false,
                message: "Category is not associated with the user",
            });
        }

        //checking if category name is being changed, and if so, check whether another category already uses that name
        const isRenaming = categoryDetails.name.toLowerCase() !== categoryName.trim().toLowerCase();

        if (isRenaming) {
            const existingCategory = userDetails.categories.some(
                (cat) => cat._id.toString() !== categoryId && cat.name.toLowerCase() === categoryName.trim().toLowerCase()
            );

            if (existingCategory) {
                return res.status(401).json({
                    success: false,
                    message: "Another category with this name already exists"
                });
            }
        }

        //updating the category
        categoryDetails.name = categoryName.trim();
        if (color) categoryDetails.color = color;
        if (textColor) categoryDetails.textColor = textColor;
        await categoryDetails.save();

        //sending successful response
        return res.status(200).json({
            success:true,
            message: "Category updated successfully",
            category: categoryDetails
        });

    }
    catch(err){
        return res.status(500).json({
            success:false,
            message: "Internal Server Error while updating a category",
            error: err.message
        });
    }
}

