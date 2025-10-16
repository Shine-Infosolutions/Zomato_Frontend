import React from "react";
import profileImage from "../assets/blank-profile.png";
import { useAppContext } from "../context/AppContext";

const UserCard = () => {
  const { user } = useAppContext();
  
  // Fallback to localStorage if context user is not available
  const currentUser = user || JSON.parse(localStorage.getItem("user") || "{}");
  
  console.log('UserCard - Context user:', user);
  console.log('UserCard - Current user:', currentUser);

  // Get first letter of name or use "U" as default
  const firstLetter = currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : "U";

  // Generate a consistent color based on the first letter
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

  const avatarClass = getColorForLetter(firstLetter);

  return (
    <div className="flex items-center px-3 py-5 bg-white shadow-md rounded-lg mx-2">
      <div
        className={`w-12 h-12 rounded-full overflow-hidden mr-4 flex items-center justify-center ${avatarClass}`}
      >
        <span className="text-xl font-bold">{firstLetter}</span>
      </div>
      <div className="flex flex-col">
        <h1 className="text-lg font-semibold">{currentUser?.name || "User Name"}</h1>
        <p className="text-sm">
          {currentUser?.email || currentUser?.phone || "user@example.com"}
        </p>
      </div>
    </div>
  );
};

export default UserCard;
