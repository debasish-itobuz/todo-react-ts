import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams<{ token: string }>();
  const [verificationMessage, setVerificationMessage] = useState("");

  useEffect(() => {
    const verifyUser = async () => {
      try {
        const response = await axios.get(
          `http://localhost:4001/user/verify-email?token=${token}`
        );

        if (response.status === 200) {
          setVerificationMessage("Email verified successfully!");
        } else {
          setVerificationMessage("Failed to verify email.");
        }
      } catch (error) {
        console.error("Verification error:", error);
        setVerificationMessage("Failed to verify email.");
      }
    };

    verifyUser();
  }, [token]);

  return (
    <div>
      <h1>Email Verification</h1>
      <p>{verificationMessage}</p>
    </div>
  );
};

export default VerifyEmail;
