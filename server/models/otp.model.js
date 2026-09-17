const mongoose = require("mongoose");


const OTPSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    otp: {
        type: Number,
        required: true
    },
    expireAt: {
        type: Date,
        default: Date.now,
        expires: 600
    }
}, { timestamps: true });

module.exports = mongoose.model("OTP", OTPSchema);
