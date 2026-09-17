const jwt = require("jsonwebtoken");
require('dotenv').config();


exports.isauth = async(req,res,next)=>{
    try{

        //getting token from cookies , headers or body
        const token = req.cookies?.token ||
                      req.header("Authorization")?.replace("Bearer ", "") || 
                      req.body?.token;

        if(!token){
            return res.status(401).json({
                success:false,
                message: "Unauthorized and no valid token is found",
            });
        }
        
        //verify and decode the token
        const decodedToken = jwt.verify(token,process.env.JWT_SECRET);

        //storing the decoded token in request body
        req.user = decodedToken;

        next();
    }
    catch(err){
        console.error(err + "error while checking if user is auth or not");

        //if token is expired or invalid
        if(err.name === "TokenExpiredError"){
            return res.status(401).json({
                success:false,
                message:"Unauthorized and token is expired",
            });
        }

        if(err.name === "JsonWebTokenError"){
            return res.status(401).json({
                success:false,
                message:"Unauthorized and invalid token",
            });
        }

        //if any other error occurs
        return res.status(500).json({
            success:false,
            message:"Internal server error while checking if user is auth or not",
            error:err.message
        });
    }
}