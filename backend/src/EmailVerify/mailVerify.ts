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
): Promise<boolean> => {
  const verificationLink = `http://localhost:5173/verify-email?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER!,
    to: toEmail,
    subject: "Verify Your Email",
    text: `Hello, please click on the following link to verify your email: ${verificationLink}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification link sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};

// Function to send a task completion email
export const sendTaskCompletionEmail = async (
  toEmail: string,
  taskTitle: string
): Promise<boolean> => {
  const mailOptions = {
    from: process.env.EMAIL_USER!,
    to: toEmail,
    subject: "Task Completed",
    text: `Hello, your task titled "${taskTitle}" has been completed.`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Task completion email sent successfully!");
    return true;
  } catch (error) {
    console.error("Error sending email:", error);
    return false;
  }
};
