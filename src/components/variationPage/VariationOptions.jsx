import React, { useState, useEffect } from "react";

const VariationOptions = ({ food, onVariationChange }) => {
  const [selectedVariation, setSelectedVariation] = useState(
    food?.variation?.[0] || null
  );

  // Initialize with first variation when food changes
  useEffect(() => {
    // Reset selection if food changes
    setSelectedVariation(food?.variation?.[0] || null);
    if (food?.variation?.[0]) {
      onVariationChange?.(food.variation[0]);
    }
  }, [food, onVariationChange]);

  const handleChange = (variation) => {
    setSelectedVariation(variation);
    onVariationChange?.(variation);
  };

  if (!food?.variation?.length) return null;

  return (
    <div className="bg-white rounded-xl px-2.5 py-3.5 mx-3 my-4">
      <h1 className="text-base font-medium">Size</h1>
      <p className="text-sm text-gray-600 border-b-1 border-gray-300 pb-4">
        Required <span>• </span>Select any 1 Option
      </p>

      <div className="mt-5">
        {food.variation.map((variation, index) => (
          <label
            key={variation.id || variation._id || `variation-${index}`}
            className={`flex items-center p-2 rounded cursor-pointer border ${
              selectedVariation?.id === variation.id || selectedVariation?._id === variation._id
                ? "border-green-600 bg-green-50"
                : "border-gray-200"
            }`}
          >
            <input
              type="radio"
              name="variation"
              checked={selectedVariation?.id === variation.id || selectedVariation?._id === variation._id}
              onChange={() => handleChange(variation)}
              className="mr-2 accent-green-600"
            />
            <span className="flex-1">
              {variation.name}{" "}
              <span className="text-xs text-gray-500">
                {variation.quantity}
              </span>
            </span>
            <span className="font-medium">₹{variation.price}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default VariationOptions;
