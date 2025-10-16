import React, { useState } from "react";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import OTPVerification from "./OTPVerification";

const AuthForm = () => {
  const [currentView, setCurrentView] = useState("login"); // "login", "register", "otp"
  const [otpEmail, setOtpEmail] = useState("");

  const switchToRegister = () => setCurrentView("register");
  const switchToLogin = () => setCurrentView("login");
  const switchToOTP = (email) => {
    setOtpEmail(email);
    setCurrentView("otp");
  };

  if (currentView === "otp") {
    return (
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 mx-4">
          <OTPVerification email={otpEmail} onBack={switchToLogin} />
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden mx-4">
      <div className="p-4 sm:p-6">
          {currentView === "login" ? (
            <LoginForm onSwitchToRegister={switchToRegister} onSwitchToOTP={switchToOTP} />
          ) : (
            <RegisterForm onSwitchToLogin={switchToLogin} onSwitchToOTP={switchToOTP} />
          )}
      </div>
    </div>
  );
};

export default AuthForm;