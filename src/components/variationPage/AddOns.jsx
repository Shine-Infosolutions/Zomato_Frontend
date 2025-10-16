import React, { useState, useEffect } from "react";
import { VscDiffModified } from "react-icons/vsc";

const AddOns = ({ food, onAddonsChange }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);

  // Reset selected addons when food changes
  useEffect(() => {
    setSelectedAddons([]);
    onAddonsChange?.([]);
  }, [food, onAddonsChange]);

  const handleToggle = (addon) => {
    let updated;
    if (selectedAddons.some((a) => (a._id || a.id) === (addon._id || addon.id))) {
      updated = selectedAddons.filter((a) => (a._id || a.id) !== (addon._id || addon.id));
    } else {
      updated = [...selectedAddons, addon];
    }
    setSelectedAddons(updated);
    onAddonsChange?.(updated);
  };

  if (!food?.addon?.length) return null;

  return (
    <div className="bg-white rounded-xl px-2.5 py-3.5 mx-3 my-4">
      <div>
        <h1 className="text-base font-medium ">Toppings</h1>
        <p className="text-sm text-gray-600 border-b-1 border-gray-300 pb-4">
          Select up to {food.addon.length} options
        </p>
      </div>
      <div>
        {food.addon.map((addon, index) => (
          <label
            key={addon._id || addon.id || index}
            className={`flex items-center p-2 rounded cursor-pointer border ${
              selectedAddons.some((a) => (a._id || a.id) === (addon._id || addon.id))
                ? "border-none bg-blue-50"
                : "border-none"
            }`}
          >
            <input
              type="checkbox"
              checked={selectedAddons.some((a) => (a._id || a.id) === (addon._id || addon.id))}
              onChange={() => handleToggle(addon)}
              className="mr-2 accent-blue-600"
            />
            <span className="flex-1">{addon.name}</span>
            <span className="font-medium">₹{addon.price}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default AddOns;
