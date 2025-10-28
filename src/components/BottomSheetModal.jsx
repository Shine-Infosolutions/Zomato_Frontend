import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";

const ANIMATION_DURATION = 400;

const BottomSheetModal = ({ open, onClose, children, height = "80vh" }) => {
  const [shouldRender, setShouldRender] = useState(open);
  const [isActive, setIsActive] = useState(false);
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    let btnTimeout;
    let activateTimeout;
    
    if (open) {
      setShouldRender(true);
      activateTimeout = setTimeout(() => setIsActive(true), 50);
      btnTimeout = setTimeout(
        () => setShowCloseButton(true),
        ANIMATION_DURATION
      );
      document.body.style.overflow = "hidden";
    } else {
      setIsActive(false);
      setShowCloseButton(false);
      const timeout = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "";
      }, ANIMATION_DURATION);
      return () => {
        clearTimeout(timeout);
        clearTimeout(btnTimeout);
        clearTimeout(activateTimeout);
        document.body.style.overflow = "";
      };
    }
    return () => {
      clearTimeout(btnTimeout);
      clearTimeout(activateTimeout);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!shouldRender) return null;

  return createPortal(
    <>
      {/* Dimmed overlay */}
      <div
        className={`bottomsheet-overlay${isActive ? ' active' : ''}`}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onClose();
        }}
      />
      {/* Close button just above the modal */}
      {showCloseButton && (
        <button
          className="fixed left-1/2 z-50 items-center -translate-x-1/2 mb-2 bg-white rounded-full shadow-lg border border-gray-200 w-10 h-10 flex justify-center text-2xl text-gray-500 close-btn-animate"
          style={{ bottom: height }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
        >
          &times;
        </button>
      )}
      {/* Sliding bottom sheet */}
      <div
        className={`bottomsheet-sheet${isActive ? ' open' : ''}`}
        style={{
          height,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex-1 overflow-y-auto px-2">{children}</div>
      </div>
    </>,
    document.body
  );
};

export default BottomSheetModal;
