import React, { useState, useEffect, useRef } from "react";
import Banner from "../components/variationPage/Banner";
import { useAppContext } from "../context/AppContext";
import Header from "../components/variationPage/Header";
import VariationOptions from "../components/variationPage/VariationOptions";
import AddOns from "../components/variationPage/AddOns";
import Message from "../components/variationPage/Message";
import VariationFooter from "../components/variationPage/VariationFooter";
import { useNavigate } from "react-router-dom";

const VariationPage = ({
  food: propFood,
  onClose: propOnClose,
  onVariationChange,
}) => {
  const {
    cart,
    foodItem,
    addToCartWithQuantity,
    addToCartWithAddons,
    getBaseVariationId,
  } = useAppContext();
  const navigate = useNavigate();

  const food = propFood || foodItem;
  const [selectedVariation, setSelectedVariation] = useState(
    food?.variation?.[0] || null
  );
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1); // Add quantity state

  // Track if this is the first render or addon selection
  const isFirstRender = useRef(true);
  const previousAddons = useRef([]);

  // Store the initial quantity of this specific item with addons
  const initialQuantityRef = useRef(0);
  const currentItemIdRef = useRef("");

  // Get the base+variation ID
  const baseVariationId = getBaseVariationId(food, selectedVariation);

  // Get quantity for this base+variation from cart
  const cartQuantity =
    Object.values(cart).find((item) => item.id === baseVariationId)?.quantity ||
    0;

  const onClose = propOnClose || (() => {
    // Only navigate if this is a standalone page (not in modal)
    if (!propOnClose) {
      navigate(-1);
    }
  });

  // Use API data directly
  const stableFood = React.useMemo(() => {
    if (!food) return null;
    return {
      ...food,
      variation: food.variation || [],
      addon: food.addon || [],
    };
  }, [food]);

  useEffect(() => {
    setSelectedVariation(stableFood?.variation?.[0] || null);
    setSelectedAddons([]);
    isFirstRender.current = true;
    setQuantity(1); // Reset quantity to 1 when food changes
  }, [stableFood]);

  // Get the unique ID for the current item with addons
  // Get the unique ID for the current item with addons
  // Get the unique ID for the current item with addons
  useEffect(() => {
    if (!stableFood) return;

    const variationId = selectedVariation?.id || "default";
    const addonIds = selectedAddons
      .map((addon) => addon.id)
      .sort()
      .join("-");

    const itemId = `${stableFood.id}-${variationId}${
      addonIds ? `-${addonIds}` : ""
    }`;
    currentItemIdRef.current = itemId;

    // Find this specific item in cart
    const exactMatch = Object.values(cart).find((item) => item.id === itemId);
    initialQuantityRef.current = exactMatch ? exactMatch.quantity : 0;

    isFirstRender.current = false;
  }, [stableFood, selectedVariation, selectedAddons, cart]);

  // Calculate total price based on selections
  const getBasePrice = () => {
    if (selectedVariation) {
      return parseFloat(selectedVariation.price);
    }
    return parseFloat(food?.price || 0);
  };

  const getAddonPrice = () => {
    return selectedAddons.reduce(
      (total, addon) => total + parseFloat(addon.price || 0),
      0
    );
  };

  // Create a unique ID for this specific combination of food, variation, and add-ons
  const getUniqueItemId = () => {
    const variationId = selectedVariation?.id || "default";
    const addonIds = selectedAddons
      .map((addon) => addon.id)
      .sort()
      .join("-");
    return `${stableFood.id}-${variationId}${addonIds ? `-${addonIds}` : ""}`;
  };

  // Create a modified food object with the selected options
  const getFoodWithSelections = () => {
    const variationText = selectedVariation
      ? `${selectedVariation.name} (${selectedVariation.quantity})`
      : "";
    const addonText =
      selectedAddons.length > 0
        ? `+ ${selectedAddons.map((addon) => addon.name).join(", ")}`
        : "";

    // Calculate the item price: base price + addons (not multiplied)
    const itemPrice = getBasePrice() + getAddonPrice();

    return {
      ...food,
      id: getUniqueItemId(), // <-- unique id for cart
      price: itemPrice.toString(),
      basePrice: getBasePrice(),
      addonPrice: getAddonPrice(),
      selectedVariation,
      selectedAddons,
      originalPrice: food?.price,
      variationDetails: variationText,
      addonDetails: addonText,
    };
  };

  const handleAddToCart = () => {
    const foodWithSelections = getFoodWithSelections();

    // Get the current quantity in cart for this specific item
    const currentQuantityInCart = initialQuantityRef.current;

    // Add the counter value to the existing quantity in cart
    addToCartWithQuantity(foodWithSelections, currentQuantityInCart + quantity);

    if (onClose) onClose();
  };

  if (!stableFood) {
    console.error("No food data provided to VariationPage");
    return (
      <div className="p-4 text-red-500">Error: No food data available</div>
    );
  }

  const instances = Array.isArray(cart)
    ? Object.values(cart).filter((item) =>
        item.id.startsWith(
          `${stableFood.id}-${selectedVariation?.id || "default"}`
        )
      )
    : [];
  return (
    <div className="bg-gray-200 w-full">
      <Header food={stableFood} />
      <VariationOptions
        food={stableFood}
        onVariationChange={setSelectedVariation}
      />
      <AddOns food={stableFood} onAddonsChange={setSelectedAddons} />
      <Message />

      {/* Show all instances (with their addons) for this base+variation */}
      {Object.values(cart).filter((item) =>
        item.id.startsWith(`${stableFood.id}-`)
      ).length > 0 && (
        <div className="bg-white rounded-xl px-2.5 py-3.5 mx-3 my-4">
          <h3 className="text-base font-medium mb-2">Current Items in Cart</h3>
          {Object.values(cart)
            .filter((item) => item.id.startsWith(`${stableFood.id}-`))
            .map((item, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-sm text-gray-700 mb-2 p-2 border-b"
              >
                <div>
                  <div className="font-medium">
                    {item.variationDetails || "Regular"}
                  </div>
                  {item.addonDetails && (
                    <div className="text-xs text-gray-500">
                      {item.addonDetails}
                    </div>
                  )}
                </div>
                <div className="flex items-center">
                  <span className="bg-gray-100 px-2 py-1 rounded-md">
                    Qty: {item.quantity}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}

      <VariationFooter
        food={getFoodWithSelections()}
        onClose={onClose}
        basePrice={getBasePrice()}
        addonPrice={getAddonPrice()}
        onAddToCart={handleAddToCart}
        quantity={quantity}
        onQuantityChange={setQuantity}
      />
    </div>
  );
};

export default VariationPage;
