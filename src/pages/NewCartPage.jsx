import React, { useState } from "react";
import AddressPanel from "../components/Cart/AddressPanel";
import { useAppContext } from "../context/AppContext";
import { FaPlus, FaTrash, FaMinus, FaArrowLeft, FaClock, FaMapMarkerAlt } from "react-icons/fa";
import { MdEdit } from "react-icons/md";
import { BiNotepad } from "react-icons/bi";

const NewCartPage = () => {
  const {
    cart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    placeOrder,
    navigate,
  } = useAppContext();

  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState(null);
  const cartArray = Object.entries(cart).map(([key, item]) => ({
    ...item,
    cartKey: key,
    price: typeof item.price === "string" ? item.price : `₹${item.price}`,
  }));
  const formattedCart = cartArray;

  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showAddressPanel, setShowAddressPanel] = useState(false);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateCartItemQuantity(itemId, newQuantity);
  };

  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  const handleAddMore = () => {
    window.history.back();
  };

  const subtotal = cartArray.reduce((total, item) => {
    const price = typeof item.price === "number" ? item.price : parseFloat(item.price?.toString().replace(/[^\\d.]/g, "")) || 0;
    return total + price * item.quantity;
  }, 0);

  const deliveryFee = 40;
  const gst = subtotal * 0.05;

  const handleSelectAddress = (address) => {
    if (address && address._id) {
      setSelectedAddressId(address._id);
      localStorage.setItem("selectedAddressId", address._id);
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) {
      setShowAddressPanel(true);
      return;
    }

    setIsPlacingOrder(true);
    setOrderError(null);

    try {
      const result = await placeOrder();
      if (result.success) {
        alert(result.message);
        navigate(`/orders/${result.orderId}`);
      } else {
        setOrderError(result.message);
      }
    } catch (error) {
      setOrderError("An unexpected error occurred. Please try again.");
    } finally {
      setIsPlacingOrder(false);
    }
  };

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-md mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button onClick={handleAddMore} className="mr-3">
                <FaArrowLeft className="text-gray-600" size={20} />
              </button>
              <h1 className="text-xl font-bold text-gray-900">Cart</h1>
            </div>
            {Object.keys(cart).length > 0 && (
              <button
                onClick={clearCart}
                className="text-red-500 text-sm font-medium"
              >
                Clear All
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-md mx-auto">
        {Object.keys(cart).length === 0 ? (
          /* Empty Cart */
          <div className="flex flex-col items-center justify-center min-h-[60vh] px-6">
            <div className="w-32 h-32 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-16 h-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m8 0V9a2 2 0 00-2-2H9a2 2 0 00-2 2v4.01" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-500 text-center mb-8">Looks like you haven't added anything to your cart yet</p>
            <button
              onClick={handleAddMore}
              className="bg-orange-500 hover:bg-orange-600 text-white px-8 py-3 rounded-full font-semibold transition-colors"
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="pb-48">
            {/* Restaurant Info */}
            <div className="bg-white mx-4 mt-4 rounded-xl p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-gray-900">Buddha Avenue</h2>
                  <div className="flex items-center mt-1">
                    <FaClock className="text-green-500 mr-1" size={12} />
                    <span className="text-sm text-gray-600">35-40 min</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-500">{Object.keys(cart).length} items</p>
                  <p className="font-bold text-green-600">₹{(subtotal + deliveryFee + gst).toFixed(0)}</p>
                </div>
              </div>
            </div>

            {/* Cart Items */}
            <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm overflow-hidden">
              {formattedCart.map((item, index) => {
                const itemPrice = typeof item.price === 'number' ? item.price : parseFloat(item.price?.toString().replace(/[^\\d.]/g, '')) || 0;
                return (
                  <div key={item.cartKey} className={`p-4 ${index !== formattedCart.length - 1 ? 'border-b border-gray-100' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div className="flex-1 pr-4">
                        <div className="flex items-center mb-1">
                          <div className={`w-3 h-3 rounded-sm mr-2 ${item.veg ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <h3 className="font-semibold text-gray-900">{item.name}</h3>
                        </div>
                        {item.variation && (
                          <p className="text-sm text-gray-500 mb-1">{item.variation.name}</p>
                        )}
                        <p className="font-bold text-gray-900">₹{itemPrice}</p>
                      </div>
                      <div className="flex items-center">
                        <div className="flex items-center bg-orange-50 border border-orange-200 rounded-lg">
                          <button
                            onClick={() => handleUpdateQuantity(item.cartKey, item.quantity - 1)}
                            className="p-2 text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <FaMinus size={12} />
                          </button>
                          <span className="px-3 py-2 font-bold text-orange-600 min-w-[40px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleUpdateQuantity(item.cartKey, item.quantity + 1)}
                            className="p-2 text-orange-600 hover:bg-orange-100 transition-colors"
                          >
                            <FaPlus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
              
              <div className="p-4 border-t border-gray-100">
                <button
                  onClick={handleAddMore}
                  className="flex items-center text-orange-600 font-semibold"
                >
                  <FaPlus className="mr-2" size={14} />
                  Add more items
                </button>
              </div>
            </div>

            {/* Special Instructions */}
            <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm">
              {!showInstructions ? (
                <button
                  onClick={() => setShowInstructions(true)}
                  className="w-full p-4 flex items-center text-left"
                >
                  <BiNotepad className="text-gray-400 mr-3" size={20} />
                  <span className="text-gray-600">Add cooking instructions</span>
                  <MdEdit className="text-gray-400 ml-auto" size={16} />
                </button>
              ) : (
                <div className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-gray-900">Special Instructions</h3>
                    <button
                      onClick={() => setShowInstructions(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      ✕
                    </button>
                  </div>
                  <textarea
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    placeholder="e.g., Make it less spicy, no onions, extra sauce"
                    className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>

            {/* Bill Details */}
            <div className="bg-white mx-4 mt-4 rounded-xl shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Bill Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between text-gray-600">
                  <span>Item Total</span>
                  <span>₹{subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Delivery Fee</span>
                  <span>₹{deliveryFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Taxes & Charges</span>
                  <span>₹{gst.toFixed(2)}</span>
                </div>
                <div className="border-t border-gray-200 pt-2 mt-3">
                  <div className="flex justify-between font-bold text-gray-900 text-lg">
                    <span>To Pay</span>
                    <span>₹{(subtotal + deliveryFee + gst).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Fixed Bottom Checkout */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg">
          <div className="max-w-md mx-auto p-4">
            {/* Address Selection */}
            {selectedAddress ? (
              <div className="bg-gray-50 rounded-lg p-3 mb-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start">
                    <FaMapMarkerAlt className="text-green-500 mt-1 mr-2" size={14} />
                    <div>
                      <p className="font-medium text-gray-900 text-sm">
                        {selectedAddress.nickname || selectedAddress.type}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {selectedAddress.house_no}, {selectedAddress.street}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowAddressPanel(true)}
                    className="text-orange-600 text-sm font-medium"
                  >
                    Change
                  </button>
                </div>
              </div>
            ) : null}

            {/* Checkout Button */}
            <button
              onClick={selectedAddress ? handlePlaceOrder : () => setShowAddressPanel(true)}
              disabled={isPlacingOrder}
              className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
                selectedAddress && !isPlacingOrder
                  ? 'bg-green-600 hover:bg-green-700 text-white shadow-lg'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isPlacingOrder ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Placing Order...
                </div>
              ) : selectedAddress ? (
                `Place Order • ₹${(subtotal + deliveryFee + gst).toFixed(0)}`
              ) : (
                'Select Delivery Address'
              )}
            </button>

            {orderError && (
              <p className="text-red-500 text-sm text-center mt-2">{orderError}</p>
            )}
          </div>
        </div>
      )}

      {/* Address Panel */}
      <AddressPanel
        showPanel={showAddressPanel}
        togglePanel={() => setShowAddressPanel(!showAddressPanel)}
        onSelectAddress={handleSelectAddress}
      />
    </div>
  );
};

export default NewCartPage;