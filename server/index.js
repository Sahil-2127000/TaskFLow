require('dotenv').config();
const express = require("express");
const cookieParser = require("cookie-parser");
const dbConnect = require("./configs/db");
const authRoutes = require("./routes/auth.route");
const categoryRoutes = require("./routes/category.route");
const todoRoutes = require("./routes/todo.route");
const cors = require("cors");


const app = express();

app.use(express.json());
app.use(cookieParser());


app.use(
    cors({
        origin:process.env.CLIENT_URL,
        credentials:true
    })
);

//connecting db
dbConnect();

//mounting routes
app.use("/api/v1/auth",authRoutes);
app.use("/api/v1/category",categoryRoutes);
app.use("/api/v1/todo",todoRoutes);

//listening server
const PORT = process.env.PORT || 4000 ;

app.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`);
})


//route for uptimeRobot
app.get("/api/v1/uptime",(req,res)=>{
    return res.status(200).json({
        success:true,
        message:"Server is running"
    })
})



