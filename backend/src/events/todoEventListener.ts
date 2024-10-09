import todoEventEmitter from "./EventEmitter";
import { sendTaskCompletionEmail } from "../EmailVerify/mailVerify"; // Adjust path as necessary

// Listen for the "taskCompleted" event
todoEventEmitter.on("taskCompleted", async ({ email, todoTitle }) => {
  try {
    // Call the function to send the email
    const emailSent = await sendTaskCompletionEmail(email, todoTitle);
    if (emailSent) {
      console.log(
        `Task completion email sent to ${email} for task "${todoTitle}".`
      );
    } else {
      console.log(`Failed to send task completion email to ${email}.`);
    }
  } catch (error) {
    console.error("Error sending task completion email:", error);
  }
});
