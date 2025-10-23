import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { AiOutlineCheckCircle } from "react-icons/ai";

const CartNotification = ({ isVisible, item, onClose }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  return createPortal(
    <div
      className={`fixed top-20 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ${
        show ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"
      }`}
    >
      <div className="bg-green-500 text-white px-4 py-3 rounded-lg shadow-lg flex items-center space-x-2 max-w-sm">
        <AiOutlineCheckCircle size={20} />
        <span className="text-sm font-medium">
          {item?.name} added to cart!
        </span>
      </div>
    </div>,
    document.body
  );
};

export default CartNotification;