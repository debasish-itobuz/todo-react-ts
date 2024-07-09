import axios from "axios";
import React, { useEffect } from "react";
import queryString from "query-string";
import { Link } from "react-router-dom";

export default function VerifyUser() {
  const queryParams = queryString.parse(location.search);
  //   console.log(queryParams);
  const verifyEmail = async () => {
    try {
      const token = queryParams.token;

      if (token) {
        console.log("Token received:", token);

        const response = await axios.post(
          "http://localhost:4001/user/verify-email",
          {
            token: token,
          }
        );
        console.log("Response", response.data);
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
    <div className="mx-auto text-center mt-24 bg-slate-200 rounded w-48 p-4">
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
