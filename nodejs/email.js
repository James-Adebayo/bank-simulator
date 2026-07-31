const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: 465,
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.APP_PASSWORD
    }
});

class Mailer{
    async SendEmail(to, subject, html){
        try{
            const info = await transporter.sendMail({
                from: process.env.SMTP_FROM,
                to,
                subject,
                html
            });
            console.log("Mail sent")
        }catch(err){
            console.error("Error: ", err);
        }
    }
}

const m = new Mailer();
m.SendEmail(
    "redbarcompany@gmail.com", 
    "NEW EMAIL DETECTED", 
   ` <h2>New Email sent</h2>`
)