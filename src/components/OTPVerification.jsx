import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const OTPVerification = ({ email, onBack }) => {
  const { setUser, setCurrentUser } = useAppContext();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(300); // 5 minutes = 300 seconds
  const [canResend, setCanResend] = useState(false);
  const navigate = useNavigate();

  // Timer countdown
  useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer(prev => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setCanResend(false); // Never allow resend
    }
  }, [timer]);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, ""); // Only numbers
    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const verifyOtp = async (e) => {
    e.preventDefault();
    
    if (otp.length !== 6) {
      toast.error("Please enter a valid 6-digit OTP.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: email,
          otp: otp
        })
      });
      
      const data = await response.json();
      if (data.success && data.user) {
        const userData = {
          _id: data.user._id,
          name: data.user.name,
          email: data.user.email,
          phone: data.user.phone,
          isVerified: data.user.isVerified
        };
        
        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("isLoggedIn", "true");
        setUser(userData);
        setCurrentUser(true);
        
        toast.success("Login successful!");
        navigate("/");
      } else {
        toast.error(data.message || "Invalid OTP");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h1>
          <p className="text-gray-600">
            We've sent a 6-digit verification code to
          </p>
          <p className="font-medium text-gray-900">{email}</p>
        </div>

        <form onSubmit={verifyOtp} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enter Verification Code
            </label>
            <input
              type="tel"
              value={otp}
              onChange={handleOtpChange}
              className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              placeholder="000000"
              maxLength="6"
              autoComplete="one-time-code"
            />
          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className={`w-full py-3 px-4 rounded-lg font-medium ${
              loading || otp.length !== 6
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-red-800 text-white hover:bg-red-900"
            }`}
          >
            {loading ? "Verifying..." : "Verify Code"}
          </button>
        </form>

        <div className="mt-6 text-center space-y-4">
          <div className="text-sm text-gray-600">
            <span>Code expires in {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}</span>
          </div>

          <button
            onClick={onBack}
            className="text-gray-600 hover:text-gray-800 text-sm underline"
          >
            Back to Login
          </button>
        </div>

        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            Didn't receive the code? Check your spam folder. Code is valid for 5 minutes.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OTPVerification;