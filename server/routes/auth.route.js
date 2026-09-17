const express = require("express");
const { isauth } = require("../middlewares/auth.middleware");

const router = express.Router();

//importing controllers
const {
    sendOtp, 
    signupController, 
    loginController, 
    logoutController, 
    getMeController,
    forgotPasswordController,
    resetPasswordController
} = require("../controllers/auth.controller");

//routes for sending otp
router.post("/send-otp", sendOtp);

//routes for signup
router.post("/signup", signupController);

//routes for login
router.post("/login", loginController);

//routes for forgot password (request OTP)
router.post("/forgot-password", forgotPasswordController);

//routes for reset password (verify OTP and set new password)
router.post("/reset-password", resetPasswordController);

//route for logout
router.post("/logout", logoutController);

//route for verifying auth state / fetching current user
router.get("/me", isauth, getMeController);

module.exports = router;
