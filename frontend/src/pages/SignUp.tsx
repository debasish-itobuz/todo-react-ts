import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import axios from "axios";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const signUpSchema = z
  .object({
    name: z.string().min(3, "Name should be at least 3 characters."),
    email: z.string().email("Please enter a valid email address."),
    password: z.string().min(4, "Password should be at least 4 characters."),
    confirmPassword: z
      .string()
      .min(4, "Password should be at least 4 characters."),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match.",
  });

type SignUpFormData = z.infer<typeof signUpSchema>;

export default function SignUp() {
  const [serverError, setServerError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  const evaluateStrongPassword = (password: string) => {
    let strength = "Weak";
    const regexes = [/[a-z]/, /[A-Z]/, /\d/, /[!@#$%^&*(),.?":{}|<>]/];
    const passedTests = regexes.filter((regex) => regex.test(password)).length;

    if (password.length >= 8 && passedTests === 4) strength = "Strong";
    else if (password.length >= 6 && passedTests >= 2) strength = "Medium";

    setPasswordStrength(strength);

    setTimeout(() => {
      setPasswordStrength("");
    }, 4000);
  };

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    try {
      await axios.post("http://localhost:4001/user/register", {
        userName: data.name,
        email: data.email,
        password: data.password,
      });

      setServerError("");
      setSuccessMessage(
        "SignUp Done. Please check your mail to verify your email."
      );
      reset();

      setTimeout(() => {
        setSuccessMessage("");
      }, 3000);
    } catch (error) {
      console.log("Error", error);
      setServerError("User already exists or weak Password");
      setSuccessMessage("");

      setTimeout(() => {
        setServerError("");
      }, 3000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="text-gray-600 body-font mt-20">
      <div className="container px-5 py-24 mx-auto flex">
        <form
          className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mx-auto mt-10 md:mt-0 relative z-10 shadow-xl"
          onSubmit={handleSubmit(onSubmit)}
        >
          <Link to="/">
            <svg
              fill="none"
              stroke="currentColor"
              className="w-6 h-6 ml-1 rotate-180 absolute end-5"
              viewBox="0 0 24 24"
            >
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </Link>
          <h2 className="text-gray-900 text-lg mb-1 font-medium title-font">
            Sign Up
          </h2>
          <div className="mb-4">
            <label className="leading-7 text-sm text-gray-600">Name</label>
            <input
              type="text"
              id="name"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              {...register("name")}
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="leading-7 text-sm text-gray-600">Email</label>
            <input
              type="email"
              id="email"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              {...register("email")}
              onChange={(e) => {
                register("email").onChange(e);
                setServerError("");
              }}
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div className="mb-4 relative">
            <label className="leading-7 text-sm text-gray-600">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              id="password"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              {...register("password")}
              onChange={(e) => {
                register("password").onChange(e);
                evaluateStrongPassword(e.target.value);
              }}
            />
            <button
              type="button"
              className="absolute top-10 right-3 text-gray-500 text-xl"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password ? (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            ) : (
              passwordStrength && (
                <p
                  className={`text-xs mt-1 ${
                    passwordStrength === "Strong"
                      ? "text-green-500"
                      : passwordStrength === "Medium"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  Password Strength:{passwordStrength}
                </p>
              )
            )}
          </div>

          <div className="mb-4 relative">
            <label className="leading-7 text-sm text-gray-600">
              Confirm Password
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirmPassword"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              {...register("confirmPassword")}
            />
            <span
              className=" absolute top-10 right-3 text-xl text-gray-500 cursor-pointer"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
            {errors.confirmPassword && (
              <p className="text-red-500 text-xs mt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <svg
                className="animate-spin h-5 w-5 text-white mx-auto"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                ></path>
              </svg>
            ) : (
              "Submit"
            )}
          </button>
          <div className="flex justify-between mt-3">
            <p>Already have an account?</p>
            <Link to="/login" className="text-indigo-500">
              Log In
            </Link>
          </div>
          {successMessage ? (
            <p className="text-green-500 text-s mt-4 pt-2">{successMessage}</p>
          ) : (
            <p className="text-red-500 text-s mt-4 pt-2">{serverError}</p>
          )}
        </form>
      </div>
    </section>
  );
}
