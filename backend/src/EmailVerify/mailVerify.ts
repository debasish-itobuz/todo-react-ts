import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER!,
    pass: process.env.EMAIL_PASS!,
  },
});

// Function to send verification email
export const sendVerificationEmail = async (
  toEmail: string,
  verificationToken: string | null
) => {
  // Construct the verification link using your frontend URL and the token
  const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

  // Set up email options
  const mailOptions = {
    from: process.env.EMAIL_USER!,
    to: toEmail,
    subject: "Verify Your Email",
    text: `Hello, please click on the following link to verify your email: ${verificationLink}`,
  };

  // Send the email
  const mail = transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("Error sending email:", error);
    } else {
      console.log("Email sent: " + info.response);
    }
    return info;
  });

  return mail;
};
