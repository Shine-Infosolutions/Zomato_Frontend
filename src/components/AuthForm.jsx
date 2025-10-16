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
    return <OTPVerification email={otpEmail} onBack={switchToLogin} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
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