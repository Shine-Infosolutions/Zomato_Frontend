import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { fetchCategoryData, getUserWishlist, getUserAddresses, getUserData } from "../services/api";

// Helper function to generate avatar color (can be moved to a utils file)
const getColorForLetter = (letter) => {
  const colors = [
    "bg-blue-200 text-blue-700",
    "bg-green-200 text-green-700",
    "bg-purple-200 text-purple-700",
    "bg-red-200 text-red-700",
    "bg-yellow-200 text-yellow-700",
    "bg-pink-200 text-pink-700",
    "bg-indigo-200 text-indigo-700",
  ];

  // Use character code to select a color
  const index = letter.charCodeAt(0) % colors.length;
  return colors[index];
};

const ProfileUpdate = () => {
  const { user, updateUserProfile, refreshUserProfile } = useAppContext();
  // Get user data from localStorage if context is empty
  const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  
  const [formData, setFormData] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    dob: currentUser?.dob || "",
    anniversary: currentUser?.anniversary || "",
    gender: currentUser?.gender || "male",
  });
  const [profileData, setProfileData] = useState({
    categories: [],
    wishlist: [],
    addresses: [],
    loading: true
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const [userRes, categoryRes, wishlistRes, addressRes] = await Promise.all([
        getUserData(),
        fetchCategoryData(),
        getUserWishlist(),
        getUserAddresses()
      ]);

      // Update user data if API call successful
      if (userRes.success && userRes.data) {
        setFormData({
          name: userRes.data.name || "",
          email: userRes.data.email || "",
          dob: userRes.data.dob || "",
          anniversary: userRes.data.anniversary || "",
          gender: userRes.data.gender || "male",
        });
      }

      setProfileData({
        categories: categoryRes.success ? categoryRes.data : [],
        wishlist: wishlistRes.success ? wishlistRes.data : [],
        addresses: addressRes.success ? addressRes.data : [],
        loading: false
      });
    } catch (error) {
      console.error('Error fetching profile data:', error);
      setProfileData(prev => ({ ...prev, loading: false }));
    }
  };

  // Get first letter of name for avatar
  const firstLetter = formData.name
    ? formData.name.charAt(0).toUpperCase()
    : "U";
  const avatarClass = getColorForLetter(firstLetter);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // In ProfileUpdate.jsx

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get user data from localStorage if context is empty
    const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
    
    if (!currentUser || !currentUser.email) {
      alert("User data is missing. Please log in again.");
      return;
    }

    const updatedData = {
      ...formData,
      id: currentUser.id || currentUser._id,
      phone: currentUser.phone || "",
    };

    console.log("Sending data:", updatedData); // For debugging

    try {
      const response = await fetch(
        "https://24-7-b.vercel.app/api/auth/update",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updatedData),
        }
      );

      const result = await response.json();

      if (response.ok) {
        // Update local user data
        const updatedUser = { ...user, ...formData };
        localStorage.setItem("user", JSON.stringify(updatedUser));
        localStorage.setItem("userProfile", JSON.stringify(updatedUser));
        refreshUserProfile(true);
      }
      
      alert("Profile updated successfully");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Network error. Please try again.");
    }
  };

  return (
    <div className="max-w-xl h-screen mx-auto p-4 bg-bgColor">
      {/* Profile Header */}
      <div className="text-center mb-6">
        <div className="flex justify-center mb-4">
          <div className={`w-24 h-24 rounded-full flex items-center justify-center ${avatarClass}`}>
            <span className="text-4xl font-bold">{firstLetter}</span>
          </div>
        </div>
        <h2 className="text-xl font-bold">{formData.name || 'User'}</h2>
        <p className="text-gray-600">{formData.email}</p>
        <p className="text-sm text-gray-500 mt-2">Coming soon...</p>
        <div className="flex items-center justify-center mt-2">
          <span className="text-lg font-semibold">Money ₹0</span>
        </div>
      </div>

      {/* Profile Stats */}
      {!profileData.loading && (
        <div className="grid grid-cols-3 gap-4 mb-6 text-center">
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold">{profileData.categories.length}</div>
            <div className="text-xs text-gray-600">Categories</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold">{profileData.wishlist.length}</div>
            <div className="text-xs text-gray-600">Wishlist</div>
          </div>
          <div className="bg-white p-3 rounded-lg shadow">
            <div className="text-lg font-bold">{profileData.addresses.length}</div>
            <div className="text-xs text-gray-600">Addresses</div>
          </div>
        </div>
      )}

      {/* Profile Options */}
      <div className="space-y-3 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Your profile</h3>
          <p className="text-sm text-gray-600">Update your profile</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Your orders</h3>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Veg Mode</h3>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Saved Addresses</h3>
          <p className="text-sm text-gray-600">{profileData.addresses.length} addresses</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-semibold">Team behind the project</h3>
        </div>
      </div>

      {/* Loading State */}
      {profileData.loading && (
        <div className="text-center py-8">
          <div className="text-gray-500">Loading profile data...</div>
        </div>
      )}
    </div>
  );
};

export default ProfileUpdate;
