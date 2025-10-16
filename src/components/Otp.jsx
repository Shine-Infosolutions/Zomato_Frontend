import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const Otp = () => {
  const { phone, otp, setOtp, login, verifyOTP, setCurrentUser } =
    useAppContext();
  const navigate = useNavigate();
  const [otpInputs, setOtpInputs] = useState(["", "", "", "", "", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOtpChange = (index, value) => {
    if (value.length <= 1 && /^\d*$/.test(value)) {
      const newOtpInputs = [...otpInputs];
      newOtpInputs[index] = value;
      setOtpInputs(newOtpInputs);

      // Combine all inputs to form the complete OTP
      const combinedOtp = newOtpInputs.join("");
      setOtp(combinedOtp);

      // Auto-focus next input field
      if (value !== "" && index < 5) {
        const nextInput = document.getElementById(`otp-input-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
    }
  };

  // Handle key press for backspace
  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && otpInputs[index] === "" && index > 0) {
      const prevInput = document.getElementById(`otp-input-${index - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    const combinedOtp = otpInputs.join("");

    if (!combinedOtp || combinedOtp.length !== 6) {
      toast.error("Enter a 6-digit OTP.");
      return;
    }
    setIsSubmitting(true);
    
    setTimeout(() => {
      localStorage.setItem("user", JSON.stringify({ phone }));
      localStorage.setItem("isLoggedIn", "true");
      setCurrentUser(true);
      toast.success("Login successful!");
      navigate("/", { replace: true });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <>
      <h1 className="mx-10">OTP Verification</h1>
      <form onSubmit={verifyOtp}>
        <div className="flex justify-around mt-10">
          {otpInputs.map((digit, index) => (
            <input
              key={index}
              id={`otp-input-${index}`}
              type="text"
              inputMode="numeric"
              className="h-[50px] w-[40px] border border-grey-300 text-center text-2xl rounded-lg"
              required
              maxLength="1"
              value={digit}
              onChange={(e) => handleOtpChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              autoFocus={index === 0}
              disabled={isSubmitting}
            />
          ))}
        </div>
        <div className="text-center mt-6">
          <button
            type="submit"
            className={`w-[250px] py-2.5 px-1.5 rounded-md bg-red-800 text-white ${
              isSubmitting ? "opacity-70 cursor-not-allowed" : ""
            }`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Verifying..." : "Verify OTP"}
          </button>
        </div>
      </form>
    </>
  );
};
export default Otp;
