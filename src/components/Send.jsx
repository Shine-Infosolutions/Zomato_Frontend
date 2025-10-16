import React from "react";
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { toast } from 'react-toastify';

const Send = () => {
  const { phone } = useAppContext();
  const navigate = useNavigate();
  const [timer, setTimer] = React.useState(15);
  const [isResendDisabled, setIsResendDisabled] = React.useState(true);

  React.useEffect(() => {
    if (timer > 0) {
      const interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(interval);
    } else {
      setIsResendDisabled(false);
    }
  }, [timer]);

  const handleResend = () => {
    if (!phone || phone.length !== 10) {
      toast.error("Invalid phone number");
      navigate('/');
      return;
    }
    setTimer(15);
    setIsResendDisabled(true);
    
    setTimeout(() => {
      toast.success("OTP resent successfully!");
    }, 1000);
  };


  //   const handleResendOtp = () => {
  //   // Navigate back to login page to resend OTP
  //   navigate('/');
  //   toast.info("Please request a new OTP");
  // };

  const handleChangeNumber = () => {
    // Navigate back to login page to change number
    navigate('/');
  };

  return (
    <>
    <div className="text-bold text-black-800 mx-12 flex p-6 font-sans text-center justify-around">
      <p>Didn't get the OTP? </p>

      <button
        onClick={handleResend}
        disabled={isResendDisabled}
        className={`${isResendDisabled ? "text-gray-400" : "text-red-500"}`}
      >
        Resend SMS {isResendDisabled && `in ${timer}s`}
      </button></div>
      <div className="text-center">
          <p className="text-gray-600">
        <button onClick={handleChangeNumber} className="text-red-800 font-medium">Change phone number</button>
      </p>    
      </div>

      </>
  );
};

export default Send;
