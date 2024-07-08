import React from "react";
import { Link } from "react-router-dom";

const VerifyEmail = () => {
  return (
    <section className="text-gray-600 body-font mt-20">
      <div className="container px-5 py-24 mx-auto flex">
        <div className="lg:w-1/3 md:w-1/2 bg-white rounded-lg p-8 flex flex-col mx-auto mt-10 md:mt-0 relative z-10 shadow-xl">
          <h2 className="text-gray-900 text-lg mb-4 font-medium title-font">
            Verify Your Email
          </h2>
          <p className="text-gray-600 mb-4">
            An email has been sent to your registered email address. Please
            follow the instructions in the email to verify your account.
          </p>
          <Link to="/" className="text-blue-500">Back to home page</Link>
        </div>
      </div>
    </section>
  );
};

export default VerifyEmail;
