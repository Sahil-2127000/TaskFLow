const signupMailTemplate = (firstName,lastName,email) =>{
    return `
    <!DOCTYPE html>
<html>
<head>
<style>
    body {
        font-family: "Inter", sans-serif;
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
        background-color: #3b82f6;
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
    .note {
        font-size: 13px;
        color: #6b7280;
        margin: 12px 0 20px 0;
    }
    .outro {
        font-size: 13px;
        color: #6b7280;
        margin-top: 10px;
    }
    .signature {
        font-size: 13px;
        color: #6b7280;
        margin-top: 20px;
    }
    .email{
        font-weight: 400;
        font-size: 18px;
        color:blue;
        margin-left: 5px;
    }
</style>
</head>
<body>

<div class="container">

    <div class="header">
        <h1 class="logo">TaskFlow</h1>
    </div>

    <div class="content">

        <h2 class="greeting">Hello! ${firstName} ${lastName} 👋</h2>

        <p class="intro">
            Welcome to TaskFlow! Your account has been successfully created.
            Now you can login and start managing your tasks.
        </p>

        <p class="note">
            Your email address is <span class="email">${email}</span>
        </p>

        <p class="outro">
            If you did not create this account, please ignore this email.
        </p>

        <p class="signature">
            Happy Tasking,<br>
            The TaskFlow Team
        </p>

    </div>

</div>

</body>
</html>
    `;
}

module.exports = signupMailTemplate;
    