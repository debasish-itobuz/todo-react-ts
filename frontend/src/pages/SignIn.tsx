import React, { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios, { AxiosError } from "axios";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { GlobalContext } from "../components/UserContext";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const schema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address")
    .min(1, "Email is required"),
  password: z.string().min(1, "Password is required"),
});

type FormValues = z.infer<typeof schema>;

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });
  const navigate = useNavigate();
  const { setUserDetails, setToken } = useContext(GlobalContext);
  const [authError, setAuthError] = useState<string | null>(null);
  const [verifyMessage, setVerifyMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      const response = await axios.post(
        "http://localhost:4001/user/login",
        data
      );
      const loginData = response.data;

      const getUser = async () => {
        try {
          const response = await axios.get(
            `http://localhost:4001/user/get-user?id=${loginData.data.id}`
          );

          return response.data;
        } catch (error) {
          if (error instanceof AxiosError) {
            return error.response?.data;
          }
        }
      };

      if (loginData) {
        getUser().then((userResponse) => {
          userResponse.data.videos = userResponse.data.videos.map((e: any) => {
            return {
              title: e.title,
              url: e.url,
              _id: e._id,
              thumbnail: e.thumbnail,
            };
          });

          localStorage.setItem("userDetails", JSON.stringify(userResponse));
          setUserDetails(userResponse);
        });

        setToken(loginData.data.token);
        localStorage.setItem("token", `Bearer ${loginData.data.token}`);

        navigate("/todolist");
      }
    } catch (error: any) {
      console.error("Login error:", error);

      if (error.response.data.message) {
        setVerifyMessage(error.response.data.message);
      } else {
        setAuthError("Invalid credentials !!");
        setVerifyMessage("");
      }

      setTimeout(() => {
        setVerifyMessage("");
      }, 3000);
    }
  };

  return (
    <section className="text-gray-600 body-font mt-20">
      <div className="container px-5 py-24 mx-auto flex">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mx-auto mt-10 md:mt-0 relative z-10 shadow-xl"
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
            Log In
          </h2>
          <div className="mb-4">
            <label className="leading-7 text-sm text-gray-600">Email</label>
            <input
              type="email"
              {...register("email")}
              className={`w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out ${
                errors.email ? "border-red-500" : ""
              }`}
              autoComplete="email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1">
                {errors.email.message}
              </p>
            )}
          </div>
          {authError && (
            <p className="text-red-500 text-xs mb-4">{authError}</p>
          )}

          <div className="mb-4 relative">
            <label className="leading-7 text-sm text-gray-600">Password</label>
            <input
              type={showPassword ? "text" : "password"}
              {...register("password")}
              className={`w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out ${
                errors.password ? "border-red-500" : ""
              }`}
              autoComplete="current-password"
            />
            <button
              type="button"
              className="absolute top-10 right-3 text-gray-500 text-xl"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {authError && (
            <p className="text-red-500 text-xs mb-4">{authError}</p>
          )}

          <button
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            type="submit"
          >
            Login
          </button>
          <div className="flex justify-between mt-3">
            <p>Don't have an account ?</p>
            <Link to="/signup" className="text-indigo-500">
              Sign Up
            </Link>
          </div>
          {verifyMessage && (
            <p className="text-red-500 text-s mt-4 pt-2">{verifyMessage}</p>
          )}
        </form>
      </div>
    </section>
  );
}
