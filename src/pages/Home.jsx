import React, { useState, useEffect } from "react";
import Header from "../components/HomePage/Header";
import FoodSlider from "../components/HomePage/FoodSlider";
import Recommendation from "../components/itemDetail/Recommendation";
import FoodItemGrid from "../components/HomePage/FoodItemGrid";
import CartButton from "../components/CartButton";
import BottomSheetModal from "../components/BottomSheetModal";
import VariationPage from "./VariationPage";
import ItemCustomizationModal from "../components/ItemCustomizationModal";
import { useAppContext } from "../context/AppContext";
import CurrentOrder from "../components/CurrentOrder";

const Home = () => {
  const [open, setOpen] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [showCustomizationModal, setShowCustomizationModal] = useState(false);
  const [currentCustomization, setCurrentCustomization] = useState(null);
  const [customizationQuantity, setCustomizationQuantity] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchFilter, setSearchFilter] = useState('');
  const {
    cart,
    addToCartWithQuantity,
    refreshUserProfile,
    addresses,
    selectedAddressId,
  } = useAppContext();

  useEffect(() => {
    // Only fetch profile if user is logged in but profile isn't loaded yet
    const userProfile = localStorage.getItem("userProfile");
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";

    if (isLoggedIn && !userProfile) {
      refreshUserProfile(true);
    }
  }, []);

  // Find the selected address
  const selectedAddress = addresses.find(
    (addr) => addr._id === selectedAddressId
  );

  const handleFoodClick = (food) => {
    // Check if this item already has customizations in the cart
    const existingCustomizations = Object.values(cart).filter(
      (item) =>
        item.id.startsWith(`${food.id}-`) &&
        (item.selectedVariation || item.selectedAddons?.length > 0)
    );

    if (existingCustomizations.length > 0 && food.variation?.length > 0) {
      // If there are existing customizations, show the modal
      setCurrentCustomization(existingCustomizations[0]);
      setCustomizationQuantity(existingCustomizations[0].quantity || 1);
      setSelectedFood(food);
      setShowCustomizationModal(true);
    } else {
      // If no customizations or no variations available, open the variation page
      setSelectedFood(food);
      setOpen(true);
    }
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleCustomizationModalClose = () => {
    setShowCustomizationModal(false);
  };

  const handleIncrementQuantity = () => {
    setCustomizationQuantity((prev) => prev + 1);
    // Update cart with new quantity
    if (currentCustomization) {
      addToCartWithQuantity(currentCustomization, customizationQuantity + 1);
    }
  };

  const handleDecrementQuantity = () => {
    if (customizationQuantity > 1) {
      setCustomizationQuantity((prev) => prev - 1);
      // Update cart with new quantity
      if (currentCustomization) {
        addToCartWithQuantity(currentCustomization, customizationQuantity - 1);
      }
    }
  };

  const handleAddNewCustomization = () => {
    setShowCustomizationModal(false);
    setOpen(true);
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
  };

  return (
    <div className="max-w-xl mx-auto">
      <Header selectedAddress={selectedAddress} onSearchSelect={setSearchFilter} />
      <FoodSlider onCategoryClick={handleCategoryClick} />
      <FoodItemGrid onFoodClick={handleFoodClick} searchFilter={searchFilter} />
      <div id="recommendations-section">
        <Recommendation
          onFoodClick={handleFoodClick}
          selectedCategory={selectedCategory}
        />
      </div>
      <CartButton />
      <BottomSheetModal open={open} onClose={() => setOpen(false)}>
        <VariationPage food={selectedFood} onClose={handleClose} />
      </BottomSheetModal>
      {showCustomizationModal && (
        <ItemCustomizationModal
          item={currentCustomization}
          onClose={handleCustomizationModalClose}
          onIncrement={handleIncrementQuantity}
          onDecrement={handleDecrementQuantity}
          onAddNewCustomization={handleAddNewCustomization}
          quantity={customizationQuantity}
        />
      )}
      <CurrentOrder />
    </div>
  );
};

export default Home;
