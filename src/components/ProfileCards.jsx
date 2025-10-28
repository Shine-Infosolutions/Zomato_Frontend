import React from "react";
import { useAppContext } from "../context/AppContext";
import rupeeSVG from "../assets/rupee-sign-svgrepo-com.svg";
import { CiUser } from "react-icons/ci";
import { IoIosArrowForward } from "react-icons/io";
import { HiOutlineShoppingBag } from "react-icons/hi2";
import { BsBuildings } from "react-icons/bs";
import { FaPeopleGroup } from "react-icons/fa6";
import { IoPower } from "react-icons/io5";
import { VscDiffModified } from "react-icons/vsc";
import { FaToggleOn } from "react-icons/fa";
import { FaToggleOff } from "react-icons/fa";
import { toast } from "react-toastify";

const ProfileCards = () => {
  const { logout, navigate, vegModeEnabled, toggleVegMode } = useAppContext();

  const openProfile = () => {
    navigate("/profile-update");
  };

  const handleVegModeToggle = () => {
    toggleVegMode();
    toast.success(
      vegModeEnabled ? "Veg mode turned off" : "Veg mode turned on"
    );
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className=" px-3 py-5 bg-white shadow-xs rounded-lg mx-2 my-5">
        <div className="flex items-center">
          <div className=" h-6 w-6 p-1 rounded-full bg-gray-200">
            <img src={rupeeSVG} alt="" />{" "}
          </div>
          <div>
            <span className="text-md text-black ml-5">WALLET</span>
          </div>
        </div>

        <div className="flex items-center mt-3">
          <span>Money</span>
          <span
            className="bg-green-300 text-green-700 rounded-full mx-2 text-xs px-2"
            style={{ padding: "1px 8px" }}
          >
            ₹0
          </span>
        </div>
      </div>

      <div
        className="flex items-center gap-2 my-3 px-3 py-5 bg-white shadow-xs rounded-lg mx-3 cursor-pointer"
        onClick={openProfile}
      >
        <div className="flex items-center rounded-full overflow-hidden w-[30px]">
          <CiUser className="text-gray-500 text-3xl bg-gray-200 rounded-full  p-1.5" />
        </div>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-md font-normal">Your profile</h1>
          <div className="flex items-center gap-2">
            <p className="text-sm text-gray-500">Update your profile</p>
            <IoIosArrowForward className="mt-1 text-xl text-gray-500" />
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-2 px-3 py-5 my-3 bg-white shadow-xs rounded-lg mx-3 cursor-pointer"
        onClick={() => navigate("/orders")}
      >
        <div className="flex items-center  rounded-full overflow-hidden">
          <HiOutlineShoppingBag className="text-gray-500 text-3xl bg-gray-200 rounded-full p-1.5" />
        </div>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-md font-normal">Your orders</h1>
          <div className="flex items-center gap-2">
            <IoIosArrowForward className="mt-1 text-xl text-gray-500" />
          </div>
        </div>
      </div>
      <div
        className="flex items-center gap-2 px-3 py-5 my-3 bg-white shadow-xs rounded-lg mx-3 cursor-pointer"
        onClick={handleVegModeToggle}
      >
        <div className="flex items-center rounded-full overflow-hidden">
          <VscDiffModified className="text-green-600 text-3xl bg-gray-200 rounded-full p-1.5" />
        </div>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-md font-normal">Veg Mode</h1>
          <div className="flex items-center gap-2">
            {vegModeEnabled ? (
              <FaToggleOn className="mt-1 text-3xl text-green-700" />
            ) : (
              <FaToggleOff className="mt-1 text-3xl text-gray-400" />
            )}
          </div>
        </div>
      </div>

      <div
        className="flex items-center gap-2 px-3 py-5 my-3 bg-white shadow-xs rounded-lg mx-3"
        onClick={() => navigate("/addresses")}
      >
        <div className="flex items-center  rounded-full overflow-hidden">
          <BsBuildings className="text-gray-500 text-3xl bg-gray-200 rounded-full p-1.5" />
        </div>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-md font-normal">Saved Addresses</h1>
          <div className="flex items-center gap-2">
            <IoIosArrowForward className="mt-1 text-xl text-gray-500" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-5 my-3 bg-white shadow-xs rounded-lg mx-3">
        <div className="flex items-center  rounded-full overflow-hidden">
          <FaPeopleGroup className="text-gray-500 text-3xl bg-gray-200 rounded-full p-1.5" />
        </div>
        <div className="flex items-center justify-between w-full">
          <h1 className="text-md font-normal">Team behind the project</h1>
          <div className="flex items-center gap-2">
            <IoIosArrowForward className="mt-1 text-xl text-gray-500" />
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 px-3 py-5 my-3 bg-white shadow-xs rounded-lg mx-3">
        <div className="flex items-center  rounded-full overflow-hidden">
          <IoPower className="text-gray-500 text-3xl bg-gray-200 rounded-full p-1.5" />
        </div>
        <div
          className="flex items-center justify-between w-full"
          onClick={logout}
        >
          <h1 className="text-md font-normal">Logout</h1>
          <div className="flex items-center gap-2">
            <IoIosArrowForward className="mt-1 text-xl text-gray-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCards;
