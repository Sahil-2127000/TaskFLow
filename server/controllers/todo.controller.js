const Category = require("../models/category.model");
const Todo = require("../models/todo.model");
const User = require("../models/User.model");

//create a todo
exports.createTodo = async(req,res)=>{
    try{
        const { taskName, description, categoryId, taskDate } = req.body;
        const userId = req.user._id;

        //data validations
        if(!taskName || taskName.trim() === "" || !categoryId){
            return res.status(400).json({
                success:false,
                message:"Task name and category are required"
            });
        }

        //check if category exists and belongs to this user
        const category = await Category.findOne({ _id: categoryId, user: userId });
        if(!category){
            return res.status(404).json({
                success:false,
                message:"Category not found or unauthorized"
            });
        }

        //normalized taskDate
        const parsedDate = taskDate ? new Date(taskDate) : new Date();

        //check if todo exists already in this category for this user on the same date
        const startOfDay = new Date(parsedDate);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(parsedDate);
        endOfDay.setHours(23, 59, 59, 999);

        const existingtodo = await Todo.findOne({
            taskName: taskName.trim(),
            category: categoryId,
            user: userId,
            taskDate: { $gte: startOfDay, $lte: endOfDay }
        });

        if(existingtodo){
            return res.status(400).json({
                success:false,
                message:"Todo already exists in this category for today"
            });
        }
        
        //create a todo
        const todo = await Todo.create({
            taskName: taskName.trim(),
            description: description ? description.trim() : "",
            taskDate: parsedDate,
            category: categoryId,
            user: userId,
        });

        //add todo to the user model
        const user = await User.findById(userId);
        if (user) {
            user.tasks.push(todo._id);
            await user.save();
        }

        const populatedTodo = await Todo.findById(todo._id).populate("category");

        //send success response
        return res.status(201).json({
            success:true,
            message:"Todo created successfully",
            data: populatedTodo || todo
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Internal server error in todo creation",
            error:err.message
        });
    }
}

//update a todo (edit taskName, description, taskDate, status, or category)
exports.updateTodo = async(req,res)=>{
    try{
        const { todoId } = req.params;
        const { taskName, description, taskDate, status, categoryId } = req.body;
        const userId = req.user._id;

        if(!todoId){
            return res.status(400).json({
                success:false,
                message:"Todo ID is required"
            });
        }

        const updateData = {};
        if(taskName !== undefined && taskName.trim() !== "") updateData.taskName = taskName.trim();
        if(description !== undefined) updateData.description = description.trim();
        if(taskDate !== undefined) updateData.taskDate = new Date(taskDate);
        if(status !== undefined) updateData.status = status;
        
        if(categoryId){
            //verify new category belongs to this user
            const category = await Category.findOne({ _id: categoryId, user: userId });
            if(!category){
                return res.status(404).json({
                    success:false,
                    message:"Category not found or unauthorized"
                });
            }
            updateData.category = categoryId;
        }

        const updatedTodo = await Todo.findOneAndUpdate(
            { _id: todoId, user: userId },
            updateData,
            { new: true }
        ).populate("category");

        if(!updatedTodo){
            return res.status(404).json({
                success:false,
                message:"Todo not found or unauthorized"
            });
        }

        return res.status(200).json({
            success:true,
            message:"Todo updated successfully",
            data:updatedTodo
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Internal server error in todo update",
            error:err.message
        });
    }
}

//delete a todo
exports.deleteTodo = async(req,res)=>{
    try{
        const { todoId } = req.params;
        const userId = req.user._id;

        if(!todoId){
            return res.status(400).json({
                success:false,
                message:"Todo ID is required"
            });
        }

        const deletedTodo = await Todo.findOneAndDelete({ _id: todoId, user: userId });

        if(!deletedTodo){
            return res.status(404).json({
                success:false,
                message:"Todo not found or unauthorized"
            });
        }

        //remove from user tasks array
        await User.findByIdAndUpdate(userId, { $pull: { tasks: todoId } });

        return res.status(200).json({
            success:true,
            message:"Todo deleted successfully"
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Internal server error in todo deletion",
            error:err.message
        });
    }
}

//get all todos (with support for date, search, category, and status filters)
exports.getAllTodos = async(req,res)=>{
    try{
        const userId = req.user._id;
        const { categoryId, status, date, search } = req.query;

        const filter = { user: userId };
        
        if(categoryId) filter.category = categoryId;
        
        if(status && status !== "all") {
            filter.status = status;
        }

        if(search && typeof search === "string" && search.trim() !== "") {
            const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            filter.taskName = { $regex: escapedSearch, $options: "i" };
        }

        // Date filter: 'today' or specific date string 'YYYY-MM-DD'
        if(date === "today") {
            const startOfDay = new Date();
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date();
            endOfDay.setHours(23, 59, 59, 999);
            filter.taskDate = { $gte: startOfDay, $lte: endOfDay };
        } else if(date && date !== "all") {
            const startOfDay = new Date(date);
            startOfDay.setHours(0, 0, 0, 0);
            const endOfDay = new Date(date);
            endOfDay.setHours(23, 59, 59, 999);
            filter.taskDate = { $gte: startOfDay, $lte: endOfDay };
        }

        const todos = await Todo.find(filter)
            .populate("category")
            .sort({ createdAt: -1 });

        return res.status(200).json({
            success:true,
            message:"Todos fetched successfully",
            count: todos.length,
            data: todos
        });

    }catch(err){
        console.error(err);
        return res.status(500).json({
            success:false,
            message:"Internal server error while fetching todos",
            error:err.message
        });
    }
}

