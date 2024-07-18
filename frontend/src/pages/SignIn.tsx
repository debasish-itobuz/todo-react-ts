import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const navigate = useNavigate();

  const handleLogIn = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setEmailError("Please enter a valid email address.");
      return;
    } else {
      setEmailError("");
    }

    try {
      const response = await axios.post("http://localhost:4001/user/login", {
        email: email,
        password: password,
      });

      const data = response.data;
      console.log(data);

      if (data.data.email !== email) {
        setEmailError("Invalid Credentials");
        return;
      }

      const user = await axios.get(
        `http://localhost:4001/user/get-user?id=${data.data.id}`
      );

      if (user.data.data.verified) {
        const userDetailsJSON = JSON.stringify(user.data.data);
        // console.log(user.data.data);
        localStorage.setItem("token", `Bearer ${data.data.token}`);
        localStorage.setItem("user", user.data.data.userName);
        localStorage.setItem("userDetails", userDetailsJSON);

        navigate("/todolist");
      } else {
        setEmailError("Please verify your email first.");
      }
    } catch (error) {
      console.error("Login error:", error);
      setEmailError("Invalid Credentials");
      setPasswordError("Invalid Credentials");
    }
  };

  return (
    <section className="text-gray-600 body-font mt-20">
      <div className="container px-5 py-24 mx-auto flex">
        <form className=" lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mx-auto mt-10 md:mt-0 relative z-10 shadow-xl">
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
              id="email"
              name="email"
              className={`w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out ${
                emailError ? "border-red-500" : ""
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
              }}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="leading-7 text-sm text-gray-600">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              className="w-full bg-white rounded border border-gray-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
              }}
            />
            {passwordError && (
              <p className="text-red-500 text-xs mt-1">{passwordError}</p>
            )}
          </div>

          <button
            className="text-white bg-indigo-500 border-0 py-2 px-6 focus:outline-none hover:bg-indigo-600 rounded text-lg"
            onClick={handleLogIn}
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
        </form>
      </div>
    </section>
  );
}
