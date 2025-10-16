import React, { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { registerUser } from "../services/api";

const RegisterForm = ({ onSwitchToLogin, onSwitchToOTP }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: ""
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email is invalid";
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone is required";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Phone must be 10 digits";
    }
    
    if (!formData.password.trim()) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    
    try {
      const result = await registerUser(formData);
      
      if (result.success) {
        toast.success("Registration successful!");
        onSwitchToOTP(formData.email);
      } else {
        toast.error(result.error || "Registration failed");
      }
    } catch (error) {
      toast.error("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="relative mt-5">
        <div className="text-center absolute top-2 bg-white z-10 px-2">
          <h1 className="text-center">Create Account</h1>
        </div>
        <hr className="mt-5 relative top-6" />
      </div>

      <form className="mt-12 text-center space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-left text-sm font-medium text-gray-700 mb-1">Full Name</label>
          <input
            className="border border-gray-400 w-[250px] py-2.5 px-3 rounded-md focus:outline-none focus:border-red-800"
            type="text"
            name="name"
            placeholder="Enter your full name"
            value={formData.name}
            onChange={handleChange}
          />
          {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
        </div>

        <div>
          <label className="block text-left text-sm font-medium text-gray-700 mb-1">Email Address</label>
          <input
            className="border border-gray-400 w-[250px] py-2.5 px-3 rounded-md focus:outline-none focus:border-red-800"
            type="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>

        <div>
          <label className="block text-left text-sm font-medium text-gray-700 mb-1">Phone Number</label>
          <input
            className="border border-gray-400 w-[250px] py-2.5 px-3 rounded-md focus:outline-none focus:border-red-800"
            type="tel"
            name="phone"
            placeholder="Enter 10-digit phone number"
            value={formData.phone}
            onChange={handleChange}
            maxLength="10"
          />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
        </div>

        <div>
          <label className="block text-left text-sm font-medium text-gray-700 mb-1">Password</label>
          <input
            className="border border-gray-400 w-[250px] py-2.5 px-3 rounded-md focus:outline-none focus:border-red-800"
            type="password"
            name="password"
            placeholder="Enter password (min 6 characters)"
            value={formData.password}
            onChange={handleChange}
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`w-[250px] py-2.5 mt-4 px-1.5 rounded-md bg-red-800 text-white ${
            loading ? "opacity-70 cursor-not-allowed" : ""
          }`}
        >
          {loading ? "Creating Account..." : "Register"}
        </button>

        <div className="mt-4">
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-red-800 text-sm underline"
          >
            Already have an account? Login
          </button>
        </div>
      </form>
    </>
  );
};

export default RegisterForm;