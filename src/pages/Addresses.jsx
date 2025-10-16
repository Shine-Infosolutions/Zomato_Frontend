import React from "react";
import AddressManager from "../components/AddressManager";

const SavedAddresses = () => {
  // Get user ID from localStorage (set during login)
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id || user._id;
  
  console.log('localStorage user:', user);
  console.log('Extracted userId:', userId);

  if (!userId) {
    return (
      <div className="max-w-xl h-screen flex items-center justify-center mx-auto bg-bgColor">
        <div className="text-center">
          <p>Please login to view addresses</p>
          <p className="text-sm text-gray-500 mt-2">Debug: No user ID found in localStorage</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl h-screen overflow-auto mx-auto bg-bgColor">
      <AddressManager userId={userId} />
    </div>
  );
};

export default SavedAddresses;