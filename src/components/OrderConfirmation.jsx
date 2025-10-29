// src/components/OrderConfirmation.jsx
import React, { useEffect, useState } from "react";
import { FaCheck } from "react-icons/fa";
import { useNavigate, useParams } from "react-router-dom";
import { useAppContext } from "../context/AppContext";

const OrderConfirmation = () => {
  const { orderId } = useParams();
  const [animate, setAnimate] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { addresses } = useAppContext();

  useEffect(() => {
    const getOrderDetails = () => {
      try {
        // Get stored order data
        const storedOrderData = localStorage.getItem(`order_${orderId}`);
        
        if (storedOrderData) {
          const orderData = JSON.parse(storedOrderData);
          
          // Find address details
          const address = addresses.find(addr => addr._id === orderData.addressId) || {};
          const addressText = address.house_no ? 
            `${address.house_no}, ${address.street}, ${address.city}` : 
            'Address not available';
          
          const formattedOrder = {
            id: orderId,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            items: orderData.items || [],
            total: Math.round(orderData.total || 0),
            deliveryAddress: addressText,
            paymentMethod: "Cash on Delivery",
          };
          
          setOrderDetails(formattedOrder);
          
          // Clean up stored order data after use
          localStorage.removeItem(`order_${orderId}`);
        } else {
          // Fallback if no stored data
          setOrderDetails({
            id: orderId,
            date: new Date().toLocaleDateString(),
            time: new Date().toLocaleTimeString(),
            items: [],
            total: 0,
            deliveryAddress: 'Address not available',
            paymentMethod: "Cash on Delivery",
          });
        }
      } catch (error) {
        console.error('Error getting order details:', error);
        // Final fallback
        setOrderDetails({
          id: orderId,
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString(),
          items: [],
          total: 0,
          deliveryAddress: 'Address not available',
          paymentMethod: "Cash on Delivery",
        });
      } finally {
        setLoading(false);
      }
    };

    if (orderId) {
      getOrderDetails();
    }
  }, [orderId, addresses]);

  useEffect(() => {
    // Start animation after component mounts
    setTimeout(() => setAnimate(true), 100);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p>Loading order details...</p>
        </div>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">Order not found</p>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-gray-200 rounded-lg"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center p-6">
      {/* Animated check mark */}
      <div
        className={`relative mb-8 transition-all duration-1000 ${
          animate ? "scale-100" : "scale-0"
        }`}
      >
        <div className="w-24 h-24 rounded-full bg-green-100 flex items-center justify-center">
          <div
            className={`w-16 h-16 rounded-full bg-green-500 flex items-center justify-center transition-all duration-700 ${
              animate ? "scale-100" : "scale-0"
            }`}
          >
            <FaCheck className="text-white text-3xl" />
          </div>
        </div>
      </div>

      {/* Order confirmation text */}
      <h1 className="text-2xl font-bold mb-2 text-center">Order Confirmed!</h1>
      <p className="text-gray-600 mb-6 text-center">
        Your order has been placed successfully
      </p>

      {/* Order details */}
      <div className="w-full max-w-md bg-gray-50 rounded-lg p-4 mb-6">
        <div className="flex justify-between mb-2">
          <span className="font-medium">Order ID:</span>
          <span>{orderDetails.id}</span>
        </div>
        <div className="flex justify-between mb-4">
          <span className="font-medium">Date & Time:</span>
          <span>
            {orderDetails.date}, {orderDetails.time}
          </span>
        </div>

        <div className="border-t border-gray-200 pt-3 mb-3">
          {orderDetails.items.map((item, index) => (
            <div key={index} className="flex justify-between mb-2">
              <span>
                {item.quantity}x {item.name}
              </span>
              <span>₹{item.price * item.quantity}</span>
            </div>
          ))}
        </div>

        <div className="border-t border-gray-200 pt-3 mb-3">
          <div className="flex justify-between font-bold">
            <span>Total:</span>
            <span>₹{orderDetails.total}</span>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-3">
          <div className="mb-2">
            <span className="font-medium">Delivery Address:</span>
            <p className="text-gray-600">{orderDetails.deliveryAddress}</p>
          </div>
          <div>
            <span className="font-medium">Payment Method:</span>
            <p className="text-gray-600">{orderDetails.paymentMethod}</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="flex flex-col w-full max-w-md gap-3">
        <button
          onClick={() => navigate(`/order/${orderId}`)}
          className="w-full py-3 bg-green-600 text-white rounded-lg font-medium"
        >
          Track Order
        </button>
        <button
          onClick={() => navigate("/")}
          className="w-full py-3 border border-gray-300 rounded-lg font-medium"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default OrderConfirmation;
