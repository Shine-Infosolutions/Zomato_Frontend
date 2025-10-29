import React, { useState } from "react";
import CartItem from "../components/Cart/CartItem";
import BillDetail from "../components/Cart/BillDetail";
import AddressPanel from "../components/Cart/AddressPanel";
import { useAppContext } from "../context/AppContext";
import { FaPlus, FaTrash } from "react-icons/fa";
import { GrNotes } from "react-icons/gr";
import { FaTimes } from "react-icons/fa";

const CartPage = () => {
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
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showAddressPanel, setShowAddressPanel] = useState(false);

  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  const handleAddMore = () => {
    window.history.back();
  };

  const subtotal = cartArray.reduce((total, item) => {
    const price =
      typeof item.price === "number"
        ? item.price
        : parseFloat(item.price?.toString().replace(/[^\d.]/g, "")) || 0;
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
      // Store order data before placing order (cart will be cleared after successful order)
      const orderData = {
        items: Object.values(cart).map(item => ({
          name: item.name || 'Unknown Item',
          quantity: item.quantity || 1,
          price: parseFloat(item.price?.toString().replace(/[^\d.]/g, '')) || 0
        })),
        subtotal,
        deliveryFee,
        gst,
        total: subtotal + deliveryFee + gst,
        addressId: selectedAddressId
      };
      
      const result = await placeOrder();
      if (result.success) {
        // Store order data for confirmation page
        localStorage.setItem(`order_${result.orderId}`, JSON.stringify(orderData));
        navigate(`/order-confirmation/${result.orderId}`);
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
    <div className="min-h-screen bg-gray-50 max-w-md mx-auto">
      {Object.keys(cart).length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-screen px-6">
          <div className="text-8xl mb-6">🛒</div>
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-8 text-center">Add some delicious items to get started</p>
          <button
            className="bg-red-500 text-white px-8 py-4 rounded-full font-semibold text-lg shadow-lg"
            onClick={handleAddMore}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <>
          {/* Header */}
          <div className="bg-white px-4 py-4 flex items-center justify-between shadow-sm">
            <button 
              onClick={() => window.history.back()}
              className="text-gray-700 text-2xl"
            >
              ←
            </button>
            <h1 className="text-lg font-semibold">My Cart ({formattedCart.length})</h1>
            <button
              onClick={clearCart}
              className="text-red-500"
            >
              <FaTrash size={18} />
            </button>
          </div>

          {/* Cart Items */}
          <div className="px-4 py-2">
            <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
              {formattedCart.map((item, index) => (
                <div key={item.cartKey}>
                  <div className="p-4">
                    <CartItem
                      item={item}
                      onUpdateQuantity={updateCartItemQuantity}
                      onRemoveItem={removeFromCart}
                      onAddMore={() => window.history.back()}
                    />
                  </div>
                  {index < formattedCart.length - 1 && <div className="h-px bg-gray-100 mx-4" />}
                </div>
              ))}
              
              <div className="p-4 border-t border-gray-100">
                <button
                  className="w-full py-3 text-red-500 font-medium flex items-center justify-center bg-red-50 rounded-xl"
                  onClick={handleAddMore}
                >
                  <FaPlus size={16} className="mr-2" /> Add more items
                </button>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="px-4 py-2">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              {!showInstructions ? (
                <button
                  className="flex items-center text-gray-700 w-full py-2"
                  onClick={() => setShowInstructions(true)}
                >
                  <GrNotes className="mr-3 text-gray-500" size={20} />
                  <span className="font-medium">Add cooking instructions</span>
                  <span className="ml-auto text-gray-400">→</span>
                </button>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-semibold text-gray-800">Special Instructions</h3>
                    <button
                      className="text-gray-400 p-1"
                      onClick={() => setShowInstructions(false)}
                    >
                      <FaTimes size={16} />
                    </button>
                  </div>
                  <textarea
                    className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                    placeholder="Any special requests? (e.g., less spicy, no onions)"
                    rows="3"
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    autoFocus
                  />
                </div>
              )}
            </div>
          </div>

          {/* Delivery Info */}
          <div className="px-4 py-2">
            <div className="bg-white rounded-2xl shadow-sm p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">🚚</span>
                  <span className="font-medium text-gray-700">Delivery Time</span>
                </div>
                <span className="font-semibold text-green-600">35-40 min</span>
              </div>
            </div>
          </div>

          <div className="pb-40">
            <AddressPanel
              showPanel={showAddressPanel}
              togglePanel={() => setShowAddressPanel(!showAddressPanel)}
              onSelectAddress={handleSelectAddress}
            />
          </div>
        </>
      )}

      {/* Bottom Checkout */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg">
          {/* Bill Summary */}
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800">Total Bill: ₹{Math.round(subtotal + deliveryFee + gst)}</span>
              <button 
                onClick={() => setShowBillDetails(!showBillDetails)}
                className="text-gray-500"
              >
                {showBillDetails ? '▲' : '▼'}
              </button>
            </div>
            {showBillDetails && (
              <div className="mt-3">
                <BillDetail
                  subtotal={subtotal}
                  deliveryFee={deliveryFee}
                  gst={gst}
                  totalPrice={subtotal + deliveryFee + gst}
                  showDetails={true}
                  toggleDetails={() => {}}
                />
              </div>
            )}
          </div>

          {/* Address */}
          <div className="px-4 py-3 bg-green-50">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="text-red-500 mr-2">📍</span>
                <div>
                  <span className="font-medium text-gray-800">
                    {selectedAddress ? (selectedAddress.nickname || selectedAddress.type) : 'Add Address'}
                  </span>
                  {selectedAddress && (
                    <p className="text-sm text-gray-600">
                      {selectedAddress.house_no}, {selectedAddress.street}, {selectedAddress.city}
                    </p>
                  )}
                </div>
              </div>
              <button
                className="text-green-600 text-sm font-medium"
                onClick={() => setShowAddressPanel(true)}
              >
                Change
              </button>
            </div>
          </div>

          {/* Checkout Button */}
          <div className="px-4 py-4">
            <button
              className={`w-full py-4 rounded-lg font-bold text-lg text-white ${
                selectedAddress ? 'bg-green-500' : 'bg-red-500'
              } ${isPlacingOrder ? 'opacity-70' : ''}`}
              onClick={selectedAddress ? handlePlaceOrder : () => setShowAddressPanel(true)}
              disabled={isPlacingOrder}
            >
              {isPlacingOrder ? 'Placing Order...' : 
               selectedAddress ? `Pay ₹${Math.round(subtotal + deliveryFee + gst)}` : 
               'Select Delivery Address'}
            </button>
            
            {orderError && (
              <p className="text-red-600 text-sm mt-2 text-center">{orderError}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;