import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMotorcycle, FaClock, FaChevronRight } from "react-icons/fa";

const CurrentOrder = () => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Use dummy order data instead of API call
    const dummyOrder = {
      _id: "6824734335f21df44dd78619",
      orderId: "BUD1001",
      order_status: 4,
      items: [
        { name: "Butter Chicken", quantity: 1 },
        { name: "Garlic Naan", quantity: 2 },
      ],
      amount: 450,
      created_at: new Date().toISOString(),
      estimated_delivery: new Date(Date.now() + 25 * 60000).toISOString(), // 25 mins from now
    };

    setCurrentOrder(dummyOrder);
  }, []);

  // useEffect(() => {
  //   // Fetch current order data
  //   const fetchCurrentOrder = async () => {
  //     try {
  //       const userId = JSON.parse(localStorage.getItem('user'))?.uid;
  //       if (!userId) return;

  //       const response = await fetch(`https://24-7-b.vercel.app/api/user/currentorder`, {
  //         method: 'POST',
  //         headers: { 'Content-Type': 'application/json' },
  //         body: JSON.stringify({ firebaseUid: userId })
  //       });

  //       const data = await response.json();
  //       if (data.success && data.order) {
  //         setCurrentOrder(data.order);
  //       }
  //     } catch (error) {
  //       console.error('Error fetching current order:', error);
  //     }
  //   };

  //   fetchCurrentOrder();

  //   // Poll for updates every 30 seconds
  //   const interval = setInterval(fetchCurrentOrder, 30000);
  //   return () => clearInterval(interval);
  // }, []);

  if (!currentOrder) return null;

  // Map order status to user-friendly text
  const getStatusText = (status) => {
    const statusMap = {
      1: "Order Received",
      2: "Preparing",
      3: "Ready for Pickup",
      4: "Out for Delivery",
      5: "Delivered",
    };
    return statusMap[status] || "Processing";
  };

  return (
    <div
      id="currentOrder"
      className="fixed bottom-0 left-0 right-0 bg-primary shadow-lg rounded-t-xl p-4 pt-3 mx-auto max-w-xl border-t-4 border-red-800"
      onClick={() => navigate(`/order/${currentOrder._id}`)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="bg-red-100 p-2 rounded-full">
            <FaMotorcycle className="text-red-800" />
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-white">
              Order #{currentOrder.orderId || currentOrder._id.slice(-6)}
            </h3>
            <div className="flex items-center text-sm text-gray-200">
              <FaClock className="mr-1" size={12} />
              <span>{getStatusText(currentOrder.order_status)}</span>
            </div>
          </div>
        </div>
        <FaChevronRight className="text-white" />
      </div>
    </div>
  );
};

export default CurrentOrder;
