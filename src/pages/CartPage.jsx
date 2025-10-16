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
  const cartArray = Object.values(cart);
  const formattedCart = cartArray.map((item) => ({
    ...item,
    price: typeof item.price === "string" ? item.price : `₹${item.price}`,
  }));

  const [instructions, setInstructions] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [showBillDetails, setShowBillDetails] = useState(false);
  const [showAddressPanel, setShowAddressPanel] = useState(false);

  // Find the selected address from context
  const selectedAddress = addresses.find((a) => a._id === selectedAddressId);

  // Update quantity handler
  const handleUpdateQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      handleRemoveItem(itemId);
      return;
    }
    updateCartItemQuantity(itemId, newQuantity);
  };

  // Remove item handler
  const handleRemoveItem = (itemId) => {
    removeFromCart(itemId);
  };

  // Navigate to menu to add more items
  const handleAddMore = () => {
    // Navigate to menu or show menu modal
    window.history.back();
  };

  // Calculate subtotal
  const subtotal = cartArray.reduce((total, item) => {
    // Handle price whether it's a number or string
    const price =
      typeof item.price === "number"
        ? item.price
        : parseFloat(item.price?.toString().replace(/[^\d.]/g, "")) || 0;

    return total + price * item.quantity;
  }, 0);

  // Delivery fee
  const deliveryFee = 40;

  // GST calculation (5% of subtotal)
  const gst = subtotal * 0.05;

  // Handle address selection
  const handleSelectAddress = (address) => {
    if (address && address._id) {
      setSelectedAddressId(address._id);
      localStorage.setItem("selectedAddressId", address._id);
      console.log("Selected address:", address);
    }
  };
  // Handle place order
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
        // Show success message and redirect to order details
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
    <div className="p-4 pt-0 max-w-xl h-screen mx-auto bg-bgColor">
      {/* ...cart clear button and empty cart logic... */}
      {Object.keys(cart).length > 0 && (
        <div className="flex justify-end mb-0">
          <button
            onClick={clearCart}
            className="flex items-center text-red-600 bg-gray-200 mb-2 px-3 py-1 rounded-md hover:bg-red-100"
          >
            <FaTrash className="mr-2" size={14} />
            Clear Cart
          </button>
        </div>
      )}
      {Object.keys(cart).length === 0 ? (
        <div className="bg-white p-8 text-center">
          <p className="text-gray-500 mb-4">Your cart is empty</p>
          <button
            className="bg-orange-500 text-white px-4 py-2 rounded-lg"
            onClick={handleAddMore}
          >
            Browse Menu
          </button>
        </div>
      ) : (
        <div
          className="max-h-[70vh] bg-white rounded-lg shadow-md p-4 overflow-y-scroll"
          style={{ scrollbarWidth: "none" }}
        >
          {/* Cart items */}
          {formattedCart.map((item) => (
            <CartItem
              key={item.id}
              item={item}
              onUpdateQuantity={updateCartItemQuantity}
              onRemoveItem={removeFromCart}
              onAddMore={() => window.history.back()}
            />
          ))}
          {/* Add more items button */}
          <div className="mt-4 mb-4 pb-2 border-b border-gray-200">
            <button
              className="text-orange-500 font-medium flex items-center cursor-pointer"
              onClick={handleAddMore}
            >
              <FaPlus size={14} className="mr-2" /> Add more items
            </button>
          </div>
          <div className="mt-6 border-gray-200">
            {!showInstructions ? (
              <div className="flex items-center relative">
                <GrNotes className="mb-2 absolute left-0 cursor-pointer" />
                <button
                  className="ml-6 pb-2 cursor-pointer hover:text-blue-600"
                  onClick={() => setShowInstructions(true)}
                >
                  Add Instructions for Restaurant
                </button>
              </div>
            ) : (
              <div className="mt-2 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium">Instructions for Restaurant</h3>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    onClick={() => setShowInstructions(false)}
                  >
                    <FaTimes />
                  </button>
                </div>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                  placeholder="E.g., Less spicy, no onions, extra sauce, etc."
                  rows="3"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  autoFocus
                ></textarea>
              </div>
            )}
          </div>

          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="flex justify-between text-lg">
              <span>
                Delivery in <span className="font-bold">35-40 min</span>
              </span>
            </div>
          </div>

          {/* Address Panel Component */}
          <AddressPanel
            showPanel={showAddressPanel}
            togglePanel={() => setShowAddressPanel(!showAddressPanel)}
            onSelectAddress={handleSelectAddress}
          />
        </div>
      )}
      {/* Fixed bottom section with bill details and address button */}
      {Object.keys(cart).length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white shadow-lg border-t border-gray-200 p-4">
          {/* Bill Details Component with sliding panel */}
          <BillDetail
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            gst={gst}
            totalPrice={subtotal + deliveryFee + gst}
            showDetails={showBillDetails}
            toggleDetails={() => setShowBillDetails(!showBillDetails)}
          />

          {/* Selected Address Display */}
          {selectedAddress ? (
            <div className="bg-gray-50 p-3 rounded-lg mb-2 border">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-700">
                    Delivering to: {selectedAddress.nickname || selectedAddress.type}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">
                    {selectedAddress.house_no}, {selectedAddress.street}, {selectedAddress.city}
                  </div>
                </div>
                <button
                  className="text-blue-600 text-xs underline"
                  onClick={() => setShowAddressPanel(true)}
                >
                  Change
                </button>
              </div>
            </div>
          ) : null}

          <button
            className="cursor-pointer w-full bg-green-700 text-white py-3 rounded-lg font-bold mt-2 hover:bg-green-800"
            onClick={() => setShowAddressPanel(true)}
          >
            {selectedAddress ? 'Place Order' : 'Select Address to Continue'}
          </button>
        </div>
      )}
    </div>
  );
};

export default CartPage;
