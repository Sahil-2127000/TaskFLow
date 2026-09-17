const transporter = require("../configs/nodemailer.config");

exports.sendMail = async (email, subject, htmlContent) => {
    try {
        const result = await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: subject,
            html: htmlContent,
        });
        console.log("Mail sent successfully", result);
        return result;
    } catch (err) {
        console.log("Error while sending mail", err.message);
        throw err;
    }
}
