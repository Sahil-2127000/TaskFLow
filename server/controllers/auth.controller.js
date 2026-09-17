const User = require("../models/User.model");
const crypto = require("crypto");
const OTP = require("../models/otp.model");
const { sendMail } = require("../utils/sendMail.util");
const signupOTPTemplate = require("../templates/signupOTP");
const forgotPasswordOTPTemplate = require("../templates/forgotPasswordOTP");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require('dotenv').config();

// sending otp to the user email address
exports.sendOtp = async (req , res ) =>{
    try{

        //destructuring email from body
        const {email} = req.body;

        if(!email || typeof email !== "string" || !email.trim()){
            return res.status(400).json({
                success:false,
                message: "A valid email address is required",
            });
        }

        const cleanEmail = email.trim().toLowerCase();
        const user = await User.findOne({email: cleanEmail});

        //user already exists
        if(user){
            return res.status(400).json({
                success:false,
                message: "User already exists with this email",
            });
        }
        
        //purge any previous OTPs for this email
        await OTP.deleteMany({ email: cleanEmail });

        //creating otp
        const otp = crypto.randomInt(100000,999999);

        //saving otp in otp Model
        const emailOtp = await OTP.create({email: cleanEmail , otp});

        //sending otp
        const result = await sendMail(cleanEmail ,"TaskFlow : OTP for Signup", signupOTPTemplate(otp , cleanEmail));
        
        //failed to send otp
        if(!result){
            return res.status(400).json({
                success:false,
                message: "Failed to send otp",
            });
        }

        //successfully otp is sent
        res.status(200).json({
            success:true,
            message: "OTP sent successfully",
        });
        

    }catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message: "Internal Server Error while sending otp",
            error : err.message  
        });
    }
}

// handling the user sign up request
exports.signupController = async(req,res)=>{
    try{

        const{email , password , confirmPassword , firstName , lastName , otp} = req.body;

        if(!email || typeof email !== "string" || !password || typeof password !== "string" || !confirmPassword || !firstName || !lastName || !otp){
            return res.status(400).json({
                success:false,
                message: "All fields are required and must be valid",
            });
        }

        if(password.length < 6){
            return res.status(400).json({
                success:false,
                message: "Password must be at least 6 characters long",
            });
        }

        if(password !== confirmPassword){
            return res.status(400).json({
                success:false,
                message: "Password and confirm password are not matching",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        //check if user already exists
        const existingUser = await User.findOne({email: cleanEmail});

        if(existingUser){
            return res.status(400).json({
                success:false,
                message: "User already exists",
            });
        }

        //find the latest otp for this mail
        const otprecord = await OTP.findOne({email}).sort({createdAt : -1}).limit(1);

        if(!otprecord){
            return res.status(400).json({
                success:false,
                message: "OTP not found",
            });
        }

        //check if otp is correct
        if(Number(otprecord.otp) !== Number(otp)){
            return res.status(400).json({
                success:false,
                message: "Invalid OTP",
            });
        }

        //delete the otp record
        await OTP.deleteMany({email: cleanEmail});

        //hash password
        const hashedPassword = await bcrypt.hash(password,10);

        if(!hashedPassword){
            return res.status(400).json({
                success:false,
                message: "Failed to hash password",
            });
        }

        //create user
        const user = await User.create({
            email: cleanEmail,
            password : hashedPassword,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
            categories:[],
            tasks:[]
        });

        const userResponse = user.toObject();

        delete userResponse.password;

        if(!user){
            return res.status(400).json({
                success:false,
                message: "Failed to create user",
            });
        }

        //creating token
        const token = await jwt.sign({_id : user._id},
                        process.env.JWT_SECRET,
                        {
                        expiresIn : "2d"
                        }
        );

        userResponse.token = token;

        //set cookies
        res.cookie("token",token,
            {   
                httpOnly:true, 
                secure:process.env.NODE_ENV === "production",
                sameSite:process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge: 2 * 60 * 60 * 24 * 1000  // 2 days
            });

        //send success response
        res.status(201).json({
            success:true,
            message: "User created successfully",
            userResponse,
        });

        
    }catch(err){
        console.log(err);
        res.status(500).json({
            success:false,
            message: "Internal Server Error",
            error : err.message  
        });
    }
}

// handling the user login request
exports.loginController = async(req,res) =>{
    try{

        //data validation
        const {email , password} = req.body;

        if(!email || typeof email !== "string" || !password || typeof password !== "string" || !email.trim()){
            return res.status(400).json({
                success:false,
                message: "Email and password are required",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        //check if user exists or not
        const user = await User.findOne({email: cleanEmail});

        if(!user){
            return res.status(400).json({
                success:false,
                message: "Invalid email or password",
            });
        }

        //checking password correctness
        const isPasswordValid = await bcrypt.compare(password,user.password);

        if(!isPasswordValid){
            return res.status(400).json({
                success:false,
                message: "Invalid email or password",
            });
        }

        //generating token
        const token = await jwt.sign(
            {_id : user._id},
            process.env.JWT_SECRET,
            {
                expiresIn:"2d"
            }
        );

        //setting cookie
        res.cookie("token",token,
            {
                httpOnly:true,
                secure:process.env.NODE_ENV === "production",
                sameSite:process.env.NODE_ENV === "production" ? "none" : "lax",
                maxAge:2 * 60 * 60 * 24 * 1000 // 2days
            }
        );

        const userResponse = {
                _id:user._id,
                email:user.email,
                firstName:user.firstName,
                lastName:user.lastName
        };
        

        //sending response
        res.status(200).json({
            success:true,
            message: "User logged in successfully",
            user : userResponse,
            token,
        });

    }catch(err){
        return res.status(500).json({
            success:false,
            message: "Internal Server Error while logging in",
            error : err.message  
        });
    }
}

// user logout
exports.logoutController = async (req, res) => {
    try {
        res.clearCookie("token", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        });

        return res.status(200).json({
            success: true,
            message: "User logged out successfully",
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error while logging out",
            error: err.message,
        });
    }
};

// get current authenticated user profile
exports.getMeController = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select("-password");

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "User details fetched successfully",
            user,
        });
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error while fetching user profile",
            error: err.message,
        });
    }
};

// request OTP for forgot password
exports.forgotPasswordController = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email || typeof email !== "string" || !email.trim()) {
            return res.status(400).json({
                success: false,
                message: "A valid email address is required",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // check if user exists
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "No account found with this email address",
            });
        }

        // purge any existing reset OTPs for this email
        await OTP.deleteMany({ email: cleanEmail });

        // generate 6-digit OTP
        const otp = crypto.randomInt(100000, 999999);

        // save OTP to DB
        await OTP.create({ email: cleanEmail, otp });

        // send email with OTP
        const result = await sendMail(
            cleanEmail,
            "TaskFlow : Password Reset Verification Code",
            forgotPasswordOTPTemplate(otp, cleanEmail)
        );

        if (!result) {
            return res.status(500).json({
                success: false,
                message: "Failed to send password reset OTP email",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password reset OTP sent to your email",
        });

    } catch (err) {
        console.error("Error in forgotPasswordController:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while sending reset OTP",
            error: err.message,
        });
    }
};

// reset password using OTP
exports.resetPasswordController = async (req, res) => {
    try {
        const { email, otp, newPassword, confirmPassword } = req.body;

        if (!email || typeof email !== "string" || !otp || !newPassword || typeof newPassword !== "string" || !confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "All fields are required (email, otp, newPassword, confirmPassword)",
            });
        }

        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "New password and confirm password do not match",
            });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({
                success: false,
                message: "Password must be at least 6 characters long",
            });
        }

        const cleanEmail = email.trim().toLowerCase();

        // check if user exists
        const user = await User.findOne({ email: cleanEmail });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // find latest OTP record for this email
        const otpRecord = await OTP.findOne({ email: cleanEmail }).sort({ createdAt: -1 }).limit(1);

        if (!otpRecord) {
            return res.status(400).json({
                success: false,
                message: "OTP expired or not found. Please request a new one.",
            });
        }

        // verify OTP
        if (Number(otpRecord.otp) !== Number(otp)) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        // delete OTP records for this email
        await OTP.deleteMany({ email: cleanEmail });

        // hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // update user password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({
            success: true,
            message: "Password reset successfully. You can now login with your new password.",
        });

    } catch (err) {
        console.error("Error in resetPasswordController:", err);
        return res.status(500).json({
            success: false,
            message: "Internal server error while resetting password",
            error: err.message,
        });
    }
};


