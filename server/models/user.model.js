const mongoose = require("mongoose");
const { sendMail } = require("../utils/sendMail.util");
const successSignupTemplate = require("../templates/successSignup");

const UserSchema = new mongoose.Schema({

    fullName: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
    },
    tasks: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Todo"
    }],
    categories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Category"
    }]
}, { timestamps: true })

//pre middleware to check whether the user is new or not
UserSchema.pre("save", function(next){
    try{

        //user is created
        if(this.isNew){
            this.isNewUser = true;
        }
        
        //user is updated
        else{
            this.isNewUser = false;
        }
        
    }
    catch(err){
        console.log(err + " error while checking if user is new or not");
    }
})

//sending mail just after user successful registeration
UserSchema.post("save", async function(user){

    //if user is updated not created
    if(!this.isNewUser){
        return; //returning because we dont have to send mail 
    }

    //new user created
    //user first name + user last name + user email
    try{
        //sending success mail
        const result = await sendMail(user.email, "TaskFlow : Signup successful", successSignupTemplate(user.fullName, user.email));
        
        if(!result){
            throw new Error("Failed to send email");
        }

        console.log("Email sent successfully");
    }
    catch(err){
        console.log(err + "error while sending email after signup");
    }
})
    

module.exports = mongoose.model("User", UserSchema);