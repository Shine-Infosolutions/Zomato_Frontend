// AddressPanel.jsx
import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaMapMarkerAlt,
  FaEdit,
  FaPlus,
  FaTrash,
} from "react-icons/fa";
import AddNewAddress from "./AddNewAddress";
import { useAppContext } from "../../context/AppContext";
import MapAddressSelector from "../MapAddressSelector";
import LoadingOverlay from "../LoadingOverlay";

const AddressPanel = ({ showPanel, togglePanel, onSelectAddress }) => {
  const {
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    handleAddAddress,
    handleDeleteAddress,
    addressesLoading,
    placeOrder,
  } = useAppContext();

  const [showAddNewAddress, setShowAddNewAddress] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState(null);
  const [isAddressLoading, setIsAddressLoading] = useState(false);
  const [isDeliveryLoading, setIsDeliveryLoading] = useState(false);

  // Prevent body scrolling when panel is open
  useEffect(() => {
    if (showPanel) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.body.style.overflow = "hidden";
    };
  }, [showPanel]);

  const handleSelect = (id) => setSelectedAddressId(id);

  // Handle add
  const handleAdd = async (addressData) => {
    const success = await handleAddAddress(addressData);
    if (success) {
      setShowAddNewAddress(false);
      setAddressToEdit(null);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (window.confirm("Delete this address?")) {
      await handleDeleteAddress(id);
    }
  };

  // Handle edit (optional, if you want to implement editing)
  const handleEditAddress = (id) => {
    const addrToEdit = addresses.find((addr) => addr._id === id);
    if (addrToEdit) {
      setAddressToEdit(addrToEdit);
      setShowAddNewAddress(true);
    }
  };

  // Handle order placement when "Deliver to this Address" is clicked
  const handleDeliverToThisAddress = async () => {
    if (selectedAddressId) {
      setIsDeliveryLoading(true);
      try {
        const result = await placeOrder();
        if (result.success) {
          // Optionally, show a toast or redirect to order confirmation
          // Example: alert(result.message);
          togglePanel();
          if (onSelectAddress) onSelectAddress(selectedAddressId);
        } else {
          alert(result.message);
        }
      } catch (error) {
        console.error("Error placing order:", error);
        alert("Failed to place order. Please try again.");
      } finally {
        setIsDeliveryLoading(false);
      }
    }
  };

  const handleAddressSubmit = async (addressData) => {
    setIsAddressLoading(true);
    try {
      await handleAddAddress(addressData);
      setShowAddNewAddress(false);
    } catch (error) {
      console.error("Error adding address:", error);
    } finally {
      setIsAddressLoading(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity duration-300 ${
          showPanel ? "opacity-40" : "opacity-0 pointer-events-none"
        }`}
        onClick={togglePanel}
      ></div>

      {/* Panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 transform ${
          showPanel ? "translate-y-0" : "translate-y-full"
        }`}
      >
        <div className="bg-white rounded-t-2xl p-5 shadow-lg relative">
          {isDeliveryLoading && <LoadingOverlay />}
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Delivery Address</h2>
            <button
              className="text-gray-500 p-1 hover:bg-gray-100 rounded-full"
              onClick={togglePanel}
            >
              <FaTimes />
            </button>
          </div>
          <div className="space-y-4 max-h-80 overflow-y-auto">
            {addressesLoading ? (
              <div className="text-center text-gray-400">Loading...</div>
            ) : addresses.length === 0 ? (
              <div className="text-center text-gray-400">
                No addresses found.
              </div>
            ) : (
              addresses.map((address) => (
                <div
                  key={address._id}
                  className={`border rounded-lg p-3 cursor-pointer ${
                    selectedAddressId === address._id
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200"
                  }`}
                  onClick={() => handleSelect(address._id)}
                >
                  <div className="flex justify-between">
                    <div className="flex items-center">
                      <FaMapMarkerAlt className="text-green-600 mr-2" />
                      <span className="font-medium">{address.nickname || address.type}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        className="text-blue-500 hover:text-blue-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleEditAddress(address._id);
                        }}
                      >
                        <FaEdit />
                      </button>
                      <button
                        className="text-red-500 hover:text-red-700"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(address._id);
                        }}
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                  <div className="mt-1 text-gray-600">
                    {address.house_no}, {address.street}, {address.city},{" "}
                    {address.state} - {address.postalCode || address.pincode}
                  </div>
                  {address.isDefault && (
                    <div className="mt-1 text-xs text-green-600 font-medium">
                      Default Address
                    </div>
                  )}
                </div>
              ))
            )}
            {/* Add new address button */}
            <button
              className="w-full border border-dashed border-gray-300 rounded-lg p-3 flex items-center justify-center text-blue-500 hover:bg-blue-50"
              onClick={() => {
                setAddressToEdit(null);
                setShowAddNewAddress(true);
              }}
            >
              <FaPlus className="mr-2" /> Add New Address
            </button>
          </div>
          {/* Proceed button */}
          <button
            className="w-full bg-green-700 text-white py-3 rounded-lg font-bold mt-4 hover:bg-green-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
            onClick={handleDeliverToThisAddress}
            disabled={!selectedAddressId || isDeliveryLoading}
          >
            Deliver to this Address
          </button>
        </div>
      </div>
      {/* Add Address Panel */}
      <MapAddressSelector
        isOpen={showAddNewAddress}
        onClose={() => setShowAddNewAddress(false)}
        onAddressSelect={() => {
          setShowAddNewAddress(false);
        }}
        redirectTo="/cart"
      />
    </>
  );
};

export default AddressPanel;

// new update
