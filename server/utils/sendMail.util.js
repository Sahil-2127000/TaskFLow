const resend = require("../configs/resend.config");
require('dotenv').config();

exports.sendMail = async (email, subject, htmlContent) => {
    try {
        const { data, error } = await resend.emails.send({
            from: process.env.MAIL_FROM,
            to: email,
            subject: subject,
            html: htmlContent,
        });

        // Resend does NOT throw on API errors - it returns them
        if (error) {
            console.log("Error while sending mail", error.message);
            throw new Error(error.message);
        }

        console.log("Mail sent successfully", data.id);
        return data;
    } catch (err) {
        console.log("Error while sending mail", err.message);
        throw err;
    }
}