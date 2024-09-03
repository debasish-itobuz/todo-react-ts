import { Response } from "express";
import { ZodError } from "zod";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function catchBlock(e: any, res: Response, message: string) {
  if (e instanceof ZodError) {
    return res.status(400).send({ errors: e.issues, message: message });
  }
  return res.status(400).send({ message: e.message });
}

const evaluateStrongPassword = (password: string): string => {
  let strength = "Weak";
  const regexes = [/[a-z]/, /[A-Z]/, /\d/, /[!@#$%^&*(),.?":{}|<>]/];
  const passedTests = regexes.filter((regex) => regex.test(password)).length;

  if (password.length >= 8 && passedTests === 4) strength = "Strong";
  else if (password.length >= 6 && passedTests >= 2) strength = "Medium";

  return strength;
};

export { catchBlock, evaluateStrongPassword };
