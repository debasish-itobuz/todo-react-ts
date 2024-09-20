import axios from "axios";
import React, { useEffect } from "react";
import queryString from "query-string";
import { Link } from "react-router-dom";

export default function VerifyUser() {
  const parsed = queryString.parse(location.search);
  const verifyEmail = async () => {
    try {
      const token = parsed.token;

      if (token) {
        const response = await axios.post(
          "http://localhost:4001/user/verify-email",
          {
            token: token,
          }
        );
      } else {
        console.log("Token not found in query string");
      }
    } catch (err) {
      console.log("Error", err);
    }
  };

  useEffect(() => {
    verifyEmail();
  }, []);

  return (
    <div className="mx-auto text-center mt-32 bg-slate-200 rounded w-60 px-5 py-8">
      <div>You are verified.. </div>
      <div className="flex flex-col items-center justify-center">
        <Link to="/login">
          <button className="bg-green-500 text-white px-4 py-2 rounded mt-6">
            Login
          </button>
        </Link>
      </div>
    </div>
  );
}
