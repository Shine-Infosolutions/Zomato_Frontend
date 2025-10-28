// src/pages/OrderDetailsPage.jsx
import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { FaCheck, FaClock, FaMotorcycle, FaCheckCircle } from "react-icons/fa";
import { IoArrowBack } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { GiCookingPot } from "react-icons/gi";
import { MdLocationOn } from "react-icons/md";
import { BiReceipt } from "react-icons/bi";

const OrderDetailsPage = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [orderStatus, setOrderStatus] = useState("pending");

  const getOrderStatus = () => {
    if (!orderDetails) return "pending";

    switch (orderDetails.order_status) {
      case 1:
        return "pending";
      case 2:
        return "preparing";
      case 3:
        return "preparing";
      case 4:
        return "preparing";
      case 5:
        return "delivering";
      case 6:
        return "delivered";
      case 7:
        return "cancelled";
      default:
        return "pending";
    }
  };

  // Dummy order data (to be replaced with API call)
  // const orderDetails = {
  //   id: orderId || "OD123456789",
  //   status: orderStatus,
  //   date: "May 15, 2023",
  //   time: "7:30 PM",
  //   items: [
  //     { name: "Butter Chicken", quantity: 1, price: 350 },
  //     { name: "Garlic Naan", quantity: 2, price: 60 },
  //   ],
  //   subtotal: 470,
  //   deliveryFee: 40,
  //   taxes: 25,
  //   total: 535,
  //   deliveryAddress: "123 Main Street, Apartment 4B, City, State, 110001",
  //   paymentMethod: "Cash on Delivery",
  //   statusTimeline: {
  //     pending: "7:30 PM",
  //     preparing: "7:45 PM",
  //     delivering: "8:15 PM",
  //     delivered: "8:45 PM",
  //   },
  // };

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes cooking {
        0% { transform: scale(1); }
        50% { transform: rotate(8deg); }
        100% { transform: rotate(-8deg); }
      }
      @keyframes ticking {
        0% { transform: rotate(0deg); }
        25% { transform: rotate(10deg); }
        50% { transform: rotate(0deg); }
        75% { transform: rotate(-10deg); }
        100% { transform: rotate(0deg); }
      }
      @keyframes checkmark {
        0% { transform: scale(1); }
        50% { transform: scale(1.1); }
        100% { transform: scale(1); }
      }
      .cooking-animation {
        animation: cooking 0.5s infinite;
      }
      .ticking-animation {
        animation: ticking 1s infinite;
      }
      .checkmark-animation {
        animation: checkmark 1.5s 3;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Update orderStatus when orderDetails changes
  useEffect(() => {
    if (orderDetails) {
      setOrderStatus(getOrderStatus());
    }
  }, [orderDetails]);

  // Poll for order updates every 30 seconds
  useEffect(() => {
    if (!orderId) return;
    
    const interval = setInterval(async () => {
      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/order/timeline/${orderId}`
        );
        const data = await response.json();
        
        if (data.message === "Order fetched successfully" && data.order) {
          setOrderDetails(data.order);
        }
      } catch (err) {
        console.error("Error polling order updates:", err);
      }
    }, 30000);
    
    return () => clearInterval(interval);
  }, [orderId]);

  useEffect(() => {
    const fetchOrderDetails = async () => {
      if (!orderId) {
        setError("Order ID is missing");
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/order/timeline/${orderId}`
        );
        const data = await response.json();

        if (data.message === "Order fetched successfully" && data.order) {
          setOrderDetails(data.order);
        } else {
          setError(data.message || "Failed to fetch order details");
        }
      } catch (err) {
        setError("Error connecting to server. Please try again later.");
        console.error("Error fetching order details:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetails();
  }, [orderId]);

  // Calculate progress percentage based on status
  const getProgressPercentage = () => {
    if (!orderDetails) return 0;
    
    switch (orderDetails.order_status) {
      case 1:
        return 20;
      case 2:
      case 3:
        return 40;
      case 4:
        return 60;
      case 5:
        return 80;
      case 6:
        return 100;
      case 7:
        return 0;
      default:
        return 0;
    }
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Format time for display
  const formatTime = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const generatePDF = async () => {
    const { jsPDF } = await import("jspdf");
    // Create a new PDF document
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();

    // Add restaurant info
    doc.setFontSize(18);
    doc.text("Buddha Avenue", pageWidth / 2, 20, { align: "center" });

    doc.setFontSize(12);
    doc.text(`Invoice #INV-${orderDetails.id}`, pageWidth / 2, 30, {
      align: "center",
    });
    doc.text(`Date: ${orderDetails.date}`, pageWidth / 2, 40, {
      align: "center",
    });

    // Add order details
    doc.setFontSize(14);
    doc.text("Order Details", 20, 60);

    doc.setFontSize(10);
    doc.text(`Order ID: ${orderDetails.id}`, 20, 70);
    doc.text(`Order Date: ${orderDetails.date}, ${orderDetails.time}`, 20, 80);
    doc.text(`Payment Method: ${orderDetails.paymentMethod}`, 20, 90);

    // Add delivery address
    doc.setFontSize(14);
    doc.text("Delivery Address", 20, 110);

    doc.setFontSize(10);
    doc.text(orderDetails.deliveryAddress, 20, 120);

    // Add order items
    doc.setFontSize(14);
    doc.text("Order Items", 20, 140);

    let yPos = 150;
    doc.setFontSize(10);

    // Table header
    doc.text("Item", 20, yPos);
    doc.text("Quantity", 100, yPos);
    doc.text("Price", 150, yPos);
    yPos += 10;

    // Table content
    orderDetails.items.forEach((item) => {
      doc.text(item.name, 20, yPos);
      doc.text(item.quantity.toString(), 100, yPos);
      doc.text(`Rs.${item.price * item.quantity}`, 150, yPos);
      yPos += 10;
    });

    // Add payment details
    yPos += 10;
    doc.setFontSize(14);
    doc.text("Payment Details", 20, yPos);
    yPos += 10;

    doc.setFontSize(10);
    doc.text("Item Total:", 100, yPos);
    doc.text(`Rs.${orderDetails.subtotal}`, 150, yPos);
    yPos += 10;

    doc.text("Delivery Fee:", 100, yPos);
    doc.text(`Rs.${orderDetails.deliveryFee}`, 150, yPos);
    yPos += 10;

    doc.text("Taxes:", 100, yPos);
    doc.text(`Rs.${orderDetails.taxes}`, 150, yPos);
    yPos += 10;

    // Total
    doc.setFontSize(12);
    doc.text("Total:", 100, yPos);
    doc.text(`Rs.${orderDetails.total}`, 150, yPos);
    yPos += 20;

    // Payment status
    doc.text("Payment Status: Paid", 100, yPos);

    // Save the PDF
    doc.save(`Order_${orderDetails.id}_Invoice.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-pulse">Loading order details...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate("/orders", { replace: true })}
          className="bg-gray-200 px-4 py-2 rounded-md"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  if (!orderDetails) {
    return (
      <div className="p-4">
        <div className="bg-yellow-100 text-yellow-700 p-4 rounded-md mb-4">
          Order not found
        </div>
        <button
          onClick={() => navigate("/orders", { replace: true })}
          className="bg-gray-200 px-4 py-2 rounded-md"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen pb-8">
      {/* Header */}
      <div className="bg-white p-4 flex items-center shadow-sm">
        <button onClick={() => navigate("/orders", { replace: true })} className="mr-4">
          <IoArrowBack size={24} className="text-gray-700" />
        </button>
        <h1 className="text-xl font-semibold text-gray-800">
          Order #{orderDetails._id.slice(-6)}
        </h1>
      </div>

      <div className="max-w-xl mx-auto p-4 space-y-4 overflow-y-auto">
        {/* Order Status Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Order Status</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              orderDetails.order_status === 6 ? 'bg-green-100 text-green-800' :
              orderDetails.order_status === 5 ? 'bg-blue-100 text-blue-800' :
              orderDetails.order_status >= 2 ? 'bg-yellow-100 text-yellow-800' :
              'bg-gray-100 text-gray-800'
            }`}>
              {orderDetails.order_status === 6 ? 'Delivered' :
               orderDetails.order_status === 5 ? 'Out for Delivery' :
               orderDetails.order_status === 4 ? 'Prepared' :
               orderDetails.order_status >= 2 ? 'Preparing' : 'Pending'}
            </span>
          </div>

          {/* Progress Steps */}
          <div className="space-y-4">
            {/* Pending */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                orderDetails.order_status >= 1 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {orderDetails.order_status >= 1 ? <FaCheck size={14} /> : <FaClock size={14} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Order Placed</p>
                {orderDetails.order_status >= 1 && (
                  <p className="text-sm text-gray-500">{formatTime(orderDetails.createdAt)}</p>
                )}
              </div>
            </div>

            {/* Preparing */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                orderDetails.order_status >= 2 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {orderDetails.order_status >= 2 ? <FaCheck size={14} /> : <GiCookingPot size={14} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Preparing</p>
                {orderDetails.order_status >= 2 && (
                  <p className="text-sm text-gray-500">
                    {formatTime(orderDetails.status_timestamps?.preparing || orderDetails.status_timestamps?.accepted || orderDetails.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Prepared */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                orderDetails.order_status >= 4 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {orderDetails.order_status >= 4 ? <FaCheck size={14} /> : <FaCheckCircle size={14} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Prepared</p>
                {orderDetails.order_status >= 4 && (
                  <p className="text-sm text-gray-500">
                    {formatTime(orderDetails.status_timestamps?.prepared || orderDetails.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Out for Delivery */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                orderDetails.order_status >= 5 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                {orderDetails.order_status >= 5 ? <FaCheck size={14} /> : <FaMotorcycle size={14} />}
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Out for Delivery</p>
                {orderDetails.order_status >= 5 && (
                  <p className="text-sm text-gray-500">
                    {formatTime(orderDetails.status_timestamps?.out_for_delivery || orderDetails.updatedAt)}
                  </p>
                )}
              </div>
            </div>

            {/* Delivered */}
            <div className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-4 ${
                orderDetails.order_status === 6 ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                <FaCheck size={14} />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-800">Delivered</p>
                {orderDetails.order_status === 6 && (
                  <p className="text-sm text-gray-500">
                    {formatTime(orderDetails.status_timestamps?.delivered || orderDetails.updatedAt)}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Order Info Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <BiReceipt className="text-gray-600 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Order Information</h2>
          </div>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Order Date</span>
              <span className="font-medium">{formatDate(orderDetails.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Order Time</span>
              <span className="font-medium">{formatTime(orderDetails.createdAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Method</span>
              <span className="font-medium">Cash on Delivery</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Payment Status</span>
              <span className={`font-medium ${
                orderDetails.payment_status === 'success' ? 'text-green-600' : 'text-yellow-600'
              }`}>
                {orderDetails.payment_status === 'success' ? 'Paid' : 'Pending'}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Address Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center mb-4">
            <MdLocationOn className="text-red-500 mr-2" size={20} />
            <h2 className="text-lg font-semibold text-gray-800">Delivery Address</h2>
          </div>
          <div className="text-gray-700">
            {orderDetails.address_id ? (
              <>
                <p className="font-medium">
                  {orderDetails.address_id.house_no || 'N/A'}, {orderDetails.address_id.street || 'N/A'}
                </p>
                <p>{orderDetails.address_id.city || 'N/A'}, {orderDetails.address_id.state || 'N/A'}</p>
                <p>{orderDetails.address_id.pincode || 'N/A'}</p>
              </>
            ) : (
              <p className="text-gray-500">Address information not available</p>
            )}
          </div>
        </div>

        {/* Bill Details Card */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Bill Details</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Item Total</span>
              <span className="font-medium">₹{orderDetails.amount?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GST ({orderDetails.gst}%)</span>
              <span className="font-medium">₹{((orderDetails.amount * orderDetails.gst) / 100).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Delivery Fee</span>
              <span className="font-medium">₹40.00</span>
            </div>
            <hr className="my-3" />
            <div className="flex justify-between text-lg font-semibold">
              <span>Total Amount</span>
              <span className="text-green-600">₹{(orderDetails.amount + 40).toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsPage;
