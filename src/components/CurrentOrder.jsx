import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaMotorcycle, FaClock, FaChevronRight } from "react-icons/fa";

const CurrentOrder = () => {
  const [currentOrder, setCurrentOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch current order data
    const fetchCurrentOrder = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user?.phone) return;

        const response = await fetch(`https://24-7-b.vercel.app/api/order/current`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: user.phone })
        });

        const data = await response.json();
        if (data.success && data.order) {
          setCurrentOrder(data.order);
        } else {
          setCurrentOrder(null);
        }
      } catch (error) {
        console.error('Error fetching current order:', error);
        setCurrentOrder(null);
      }
    };

    fetchCurrentOrder();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchCurrentOrder, 30000);
    return () => clearInterval(interval);
  }, []);



  if (!currentOrder) return null;

  // Map order status to user-friendly text
  const getStatusText = (status) => {
    const statusMap = {
      1: "Order Received",
      2: "Accepted",
      3: "Preparing",
      4: "Prepared",
      5: "Out for Delivery",
      6: "Delivered",
      7: "Cancelled"
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
