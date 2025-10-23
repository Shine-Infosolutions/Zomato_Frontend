import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { AiOutlinePlus, AiOutlineMinus, AiOutlineClose } from "react-icons/ai";
import { useAppContext } from "../context/AppContext";
import CartNotification from "./CartNotification";

const ZomatoCartPopup = ({ item, isOpen, onClose, onCustomize }) => {
  const { cart, addToCartWithQuantity, removeFromCart } = useAppContext();
  const [isVisible, setIsVisible] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [showNotification, setShowNotification] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      document.body.style.overflow = "hidden";
      // Get current quantity from cart
      const cartItem = Object.values(cart).find(cartItem => 
        cartItem.id === item?.id || cartItem.id.startsWith(`${item?.id}-`)
      );
      setQuantity(cartItem?.quantity || 1);
    } else {
      const timer = setTimeout(() => {
        setIsVisible(false);
        document.body.style.overflow = "";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen, cart, item]);

  if (!item || !isVisible) return null;

  // Get all variations of this item in cart
  const itemVariations = Object.values(cart).filter(cartItem =>
    cartItem.id.startsWith(`${item.id.split("-")[0]}-`) || cartItem.id === item.id
  );

  const totalQuantity = itemVariations.reduce((sum, variant) => sum + variant.quantity, 0);

  const handleAddToCart = () => {
    const itemWithQuantity = { ...item, quantity };
    addToCartWithQuantity(itemWithQuantity, quantity);
    setShowNotification(true);
    onClose();
  };

  const handleCustomize = () => {
    onCustomize(item);
    onClose();
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black transition-opacity duration-300 ${
          isOpen ? "bg-opacity-50" : "bg-opacity-0 pointer-events-none"
        }`}
        onClick={onClose}
      />

      {/* Popup */}
      <div
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 w-full max-w-md bg-white rounded-t-2xl shadow-2xl transition-transform duration-300 ${
          isOpen ? "translate-y-0" : "translate-y-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-800">Add to Cart</h3>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 transition-colors"
          >
            <AiOutlineClose size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Item Details */}
        <div className="p-4">
          <div className="flex items-start space-x-3">
            {item.image && (
              <img
                src={item.image}
                alt={item.name}
                className="w-16 h-16 rounded-lg object-cover"
              />
            )}
            <div className="flex-1">
              <h4 className="font-medium text-gray-800 mb-1">{item.name}</h4>
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {item.description}
              </p>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-semibold text-primary">
                  ₹{item.price}
                </span>
                {item.originalPrice && item.originalPrice !== item.price && (
                  <span className="text-sm text-gray-500 line-through">
                    ₹{item.originalPrice}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Current Cart Items */}
          {itemVariations.length > 0 && (
            <div className="mt-4 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">
                Already in cart ({totalQuantity} items):
              </p>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {itemVariations.map((variant, idx) => (
                  <div key={idx} className="flex justify-between items-center text-sm">
                    <div>
                      <span className="text-gray-800">
                        {variant.variationDetails || "Regular"}
                      </span>
                      {variant.addonDetails && (
                        <p className="text-xs text-gray-500">{variant.addonDetails}</p>
                      )}
                    </div>
                    <span className="text-gray-600">Qty: {variant.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Selector */}
          <div className="mt-4">
            <p className="text-sm font-medium text-gray-700 mb-2">Quantity</p>
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
                disabled={quantity <= 1}
              >
                <AiOutlineMinus size={16} />
              </button>
              <span className="text-xl font-semibold text-gray-800 min-w-[2rem] text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="w-10 h-10 rounded-full border-2 border-primary text-primary flex items-center justify-center hover:bg-primary hover:text-white transition-colors"
              >
                <AiOutlinePlus size={16} />
              </button>
            </div>
          </div>

          {/* Variations Available */}
          {(item.variation?.length > 0 || item.addon?.length > 0) && (
            <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-800">
                    Customization Available
                  </p>
                  <p className="text-xs text-orange-600">
                    {item.variation?.length > 0 && `${item.variation.length} variations`}
                    {item.variation?.length > 0 && item.addon?.length > 0 && " • "}
                    {item.addon?.length > 0 && `${item.addon.length} add-ons`}
                  </p>
                </div>
                <button
                  onClick={handleCustomize}
                  className="text-xs bg-orange-100 text-orange-700 px-3 py-1 rounded-full hover:bg-orange-200 transition-colors"
                >
                  Customize
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex space-x-3">
            {(item.variation?.length > 0 || item.addon?.length > 0) && (
              <button
                onClick={handleCustomize}
                className="flex-1 py-3 px-4 border-2 border-primary text-primary rounded-lg font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Customize
              </button>
            )}
            <button
              onClick={handleAddToCart}
              className="flex-1 py-3 px-4 bg-primary text-white rounded-lg font-medium hover:bg-red-700 transition-colors"
            >
              Add ₹{(parseFloat(item.price) * quantity).toFixed(0)}
            </button>
          </div>
        </div>
      </div>

      <CartNotification
        isVisible={showNotification}
        item={item}
        onClose={() => setShowNotification(false)}
      />
    </>,
    document.body
  );
};

export default ZomatoCartPopup;