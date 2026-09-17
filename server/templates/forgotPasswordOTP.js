const template = (otp, email) => {
    return `
    <!DOCTYPE html>
<html>
<head>
<style>
    body {
        font-family: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        background-color: #f3f4f6;
        margin: 0;
        padding: 0;
    }
    .container {
        width: 500px;
        margin: 40px auto;
        background-color: white;
        border-radius: 12px;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        overflow: hidden;
    }
    .header {
        background-color: #5B5BD6;
        padding: 24px;
        text-align: center;
    }
    .logo {
        font-size: 26px;
        font-weight: 700;
        color: white;
        margin: 0;
    }
    .content {
        padding: 32px;
    }
    .greeting {
        font-size: 20px;
        font-weight: 600;
        color: #111827;
        margin-bottom: 12px;
    }
    .intro {
        font-size: 14px;
        color: #6b7280;
        line-height: 1.6;
        margin-bottom: 24px;
    }
    .otp-box {
        background-color: #EFEEFC;
        padding: 16px;
        border-radius: 8px;
        text-align: center;
        margin: 16px 0;
        border: 1px dashed #5B5BD6;
    }
    .otp {
        font-size: 32px;
        font-weight: 700;
        color: #5B5BD6;
        letter-spacing: 6px;
    }
    .note {
        font-size: 13px;
        color: #6b7280;
        margin: 12px 0 20px 0;
    }
    .outro {
        font-size: 13px;
        color: #ef4444;
        margin-top: 10px;
    }
    .signature {
        font-size: 13px;
        color: #6b7280;
        margin-top: 24px;
    }
    .email {
        font-weight: 500;
        font-size: 16px;
        color: #5B5BD6;
    }
</style>
</head>
<body>

<div class="container">

    <div class="header">
        <h1 class="logo">TaskFlow</h1>
    </div>

    <div class="content">

        <h2 class="greeting">Reset Your Password</h2>

        <p class="intro">
            We received a request to reset the password for your TaskFlow account associated with <span class="email">${email}</span>.
            Use the OTP verification code below to set a new password:
        </p>

        <div class="otp-box">
            <span class="otp">${otp}</span>
        </div>

        <p class="note">
            This verification code is valid for <strong>10 minutes</strong>.
        </p>

        <p class="outro">
            If you did not request a password reset, please ignore this email or change your password if you suspect unauthorized access.
        </p>

        <p class="signature">
            Best regards,<br>
            The TaskFlow Team
        </p>

    </div>

</div>

</body>
</html>
    `;
};

module.exports = template;
