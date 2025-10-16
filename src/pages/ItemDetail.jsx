import React from "react";
import { BsArrowLeftCircle } from "react-icons/bs";
import { IoPeople } from "react-icons/io5";
import { HiOutlineDotsVertical } from "react-icons/hi";
import { useAppContext } from "../context/AppContext";
import { BiSolidLeaf } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { MdLocalOffer } from "react-icons/md";
import { FaMotorcycle } from "react-icons/fa";
import { useEffect, useState } from "react";
import { assets } from "../assets/assets";
import { BsCartPlus, BsCart3 } from "react-icons/bs";

const ItemDetail = () => {
  const {
    navigate,
    foodItem,
    setFoodItem,
    addToCart,
    showCartNotification,
    cart,
  } = useAppContext();
  const [activeDiv, setActiveDiv] = useState(0);
  const [showLocalNotification, setShowLocalNotification] = useState(false);
  const [isItemInCart, setIsItemInCart] = useState(false);

  // Check if the current item is in the cart
  useEffect(() => {
    const cartItems = Object.values(cart || {});
    const itemInCart = cartItems.some(
      (item) => item.name === foodItem.name && item.price === foodItem.price
    );
    setIsItemInCart(itemInCart);
  }, [cart, foodItem]);

  const messages = [
    {
      icon: <MdLocalOffer className="text-red-600 mr-1" />,
      text: "Use code WELCOME50 for 50% off on your first order",
    },
    {
      icon: <FaMotorcycle className="text-red-600 mr-1" />,
      text: "Free delivery on orders above ₹199",
    },
  ];

  // Effect to change the active div every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveDiv((prev) => (prev === 0 ? 1 : 0));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Handle add to cart
  const handleAddToCart = () => {
    addToCart(foodItem);
    setShowLocalNotification(true);

    // Hide local notification after 3 seconds
    setTimeout(() => {
      setShowLocalNotification(false);
    }, 3000);
  };

  const totalItems = Object.values(cart || {}).reduce(
    (total, item) => total + item.quantity,
    0
  );

  return (
    <div className="p-3 pb-24">
      {/* Cart notification popup */}
      {showLocalNotification && (
        <div className="fixed bottom-20 left-0 right-0 mx-auto w-4/5 bg-red-400 text-white py-2 px-4 rounded-lg shadow-lg z-50 flex items-center justify-between">
          <div>
            <p className="font-medium">Item added to cart!</p>
            <p className="text-xs">Your item is waiting in the cart</p>
          </div>
          <button
            onClick={() => navigate("/cart")}
            className="bg-white text-red-500 px-3 py-1 rounded-md text-sm font-medium"
          >
            View Cart
          </button>
        </div>
      )}
      <div className="navbar flex justify-between items-center mb-5">
        <BsArrowLeftCircle />
        <div className="flex items-center gap-3">
          <button className="flex items-center cursor-pointer gap-1">
            <IoPeople />
            <span>Group Order</span>
          </button>
          <HiOutlineDotsVertical />
        </div>
      </div>
      <div className="flex justify-between items-center my-1 px-1">
        <div className="bg-green-600 text-white rounded-2xl float-right flex items-center px-1 text-xs h-5">
          <span>{foodItem.rating}</span>
          <span>
            <FaStar />
          </span>
        </div>
        {foodItem.veg ? (
          <div className="bg-green-200 inline-block text-[10px] rounded-xl p-1 opacity-60">
            <BiSolidLeaf className="inline" />
            <span>Pure Veg</span>
          </div>
        ) : (
          ""
        )}
      </div>
      <div className="flex justify-between">
        <div>
          <div>
            <img
              className="rounded-xl w-full mb-2"
              src={assets.biryani_image}
              alt=""
            />
          </div>
          <h1 className="font-semibold text-lg">{foodItem.name}</h1>
          <p className="text-xs text-gray-500">{foodItem.category}</p>
          <p className="text-xs text-gray-500">{foodItem.description}</p>
          <p className="text-xs text-gray-500">Delivery Time:35-40mins</p>
        </div>
      </div>
      <div className="text-xs text-gray-500 flex justify-around my-4">
        <span className="bg-gray-200 rounded-2xl px-2 py-0.5">
          {" "}
          <i className="fa-solid fa-check"></i>No packaging charges
        </span>
        <span className="bg-gray-200 rounded-2xl px-2 py-0.5">
          {" "}
          <i className="fa-solid fa-check"></i>Loved by the customers
        </span>
      </div>
      <hr style={{ opacity: "50%" }} />
      {/* Animated sliding divs */}
      <div className="relative h-10 overflow-hidden mt-2">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`absolute w-full flex items-center justify-start text-xs transition-transform duration-700 ease-in-out ${
              index === activeDiv
                ? "transform translate-y-0 opacity-100" // Active div slides into view
                : "transform -translate-y-full opacity-0" // Inactive div slides out upwards
            }`}
            style={{
              transition:
                "transform 0.7s ease-in-out, opacity 0.7s ease-in-out",
            }}
          >
            <div className="flex items-center bg-gray-100 px-3 py-2 rounded-md">
              {message.icon}
              <span>{message.text}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Bottom Button - Changes based on cart state */}
      <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg border-t">
        {isItemInCart ? (
          <button
            onClick={() => navigate("/cart")}
            className="w-full bg-red-400 transition-all ease-in-out duration-300 hover:bg-red-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            <BsCart3 size={20} />
            View Cart {totalItems > 0 && `(${totalItems})`}
          </button>
        ) : (
          <button
            onClick={handleAddToCart}
            className="w-full bg-red-400 transition-all ease-in-out duration-300 hover:bg-red-800 text-white py-3 rounded-lg flex items-center justify-center gap-2 font-medium"
          >
            <BsCartPlus size={20} />
            Add to Cart
          </button>
        )}
      </div>
    </div>
  );
};

export default ItemDetail;
