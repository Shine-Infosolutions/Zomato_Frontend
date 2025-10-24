import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineDelete } from "react-icons/ai";
import { FaTrash } from "react-icons/fa";
import BottomSheetModal from "./BottomSheetModal";
import VariationPage from "../pages/VariationPage";

const AddToCartButton = ({ item, onFoodClick }) => {
  const { cart, removeFromCart, addToCart, navigate, updateCartItemQuantity, activeModal, setActiveModal } = useAppContext();
  const [showViewCart, setShowViewCart] = useState(false);
  const [showAddButton, setShowAddButton] = useState(false);

  const isModalOpen = activeModal === item.id;

  // Check if item is valid before proceeding
  if (!item || !item.id) {
    return (
      <button
        className="px-4 py-1 w-20 bg-light text-primary cursor-not-allowed border border-gray-300 rounded-md opacity-50"
        disabled
      >
        Add
      </button>
    );
  }

  // Get item quantity in cart
  const getItemDetails = () => {
    // First check for exact ID match
    const exactMatch = Object.values(cart).find(
      (cartItem) => cartItem.id === item.id
    );

    // Find all variations of this item
    const variations = Object.values(cart).filter((cartItem) =>
      cartItem.id.startsWith(`${item.id}-`)
    );

    // Calculate total quantity across all variations
    const variationsQuantity = variations.reduce(
      (total, variant) => total + variant.quantity,
      0
    );

    // If we have an exact match, add its quantity to the variations quantity
    const totalQuantity = exactMatch
      ? exactMatch.quantity + variationsQuantity
      : variationsQuantity;

    // Get the ID to use for cart operations (prefer exact match if available)
    const cartItemId = exactMatch
      ? exactMatch.id
      : variations.length > 0
      ? variations[0].id
      : item.id;

    return {
      quantity: totalQuantity,
      cartItemId: cartItemId,
      hasCustomizations: variations.length > 0,
    };
  };

  const { quantity, cartItemId, hasCustomizations } = getItemDetails();

  const handleAddClick = (e) => {
    e.stopPropagation();
    setActiveModal(item.id);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
    setShowAddButton(false);
    setShowViewCart(true);
    setTimeout(() => setShowViewCart(false), 3000);
  };

  const totalCartItems = Object.values(cart).reduce((total, item) => total + item.quantity, 0);

  const handleQuantityChange = (e) => {
    e.stopPropagation();
    addToCart(item);
  };



  if (quantity > 0) {
    return (
      <>
        {!showAddButton ? (
          <div className="flex items-center border w-20 border-primary rounded-md overflow-hidden">
            <button
              className={`w-8 h-8 flex items-center justify-center bg-light text-primary`}
              onClick={(e) => {
                e.stopPropagation();
                if (quantity === 1) {
                  setShowAddButton(true);
                } else {
                  const cartKey = Object.keys(cart).find(key => 
                    cart[key].id === cartItemId || cart[key]._id === cartItemId || key === cartItemId
                  );
                  if (cartKey) {
                    updateCartItemQuantity(cartKey, cart[cartKey].quantity - 1);
                  }
                }
              }}
            >
              {quantity === 1 ? (
                <FaTrash size={12} />
              ) : (
                <AiOutlineMinus size={16} />
              )}
            </button>
            <span className="w-8 h-8 flex items-center justify-center bg-white">
              {quantity}
            </span>
            <button
              className="w-8 h-8 bg-light text-primary flex items-center justify-center"
              onClick={handleQuantityChange}
            >
              <AiOutlinePlus size={16} />
            </button>
          </div>
        ) : (
          <button
            className="px-4 py-1 w-20 bg-orange-500 text-white cursor-pointer border border-orange-500 rounded-md transition-all ease-in-out duration-300"
            onClick={(e) => {
              e.stopPropagation();
              setActiveModal(item.id);
            }}
          >
            Add
          </button>
        )}
      </>
    );
  }

  return (
    <>
      <button
        className="px-4 py-1 w-20 bg-light text-primary cursor-pointer border border-primary rounded-md transition-all ease-in-out duration-300"
        onClick={handleAddClick}
      >
        Add
      </button>

      {isModalOpen && (
        <BottomSheetModal
          open={isModalOpen}
          onClose={handleCloseModal}
          height="85vh"
        >
          <VariationPage
            food={item}
            onClose={handleCloseModal}
          />
        </BottomSheetModal>
      )}

      {showViewCart && totalCartItems > 0 && (
        <div className="fixed bottom-4 left-4 right-4 z-50">
          <button
            onClick={() => navigate('/cart')}
            className="w-full bg-red-500 text-white py-3 px-4 rounded-lg shadow-lg flex items-center justify-between font-medium animate-slideUpFadeIn"
          >
            <span>View Cart</span>
            <span className="bg-white text-red-500 px-2 py-1 rounded-md text-sm">
              {totalCartItems} item{totalCartItems > 1 ? 's' : ''}
            </span>
          </button>
        </div>
      )}
    </>
  );
};

export default AddToCartButton;
