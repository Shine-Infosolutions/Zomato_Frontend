import React, { useState, useEffect } from 'react';
import { IoMdAdd } from "react-icons/io";
import { FaHome, FaBriefcase, FaEdit, FaTrash } from "react-icons/fa";
import MapAddressSelector from "./MapAddressSelector";

const API_URL = import.meta.env.VITE_API_BASE_URL;

const AddressManager = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [formData, setFormData] = useState({
    type: 'Home',
    nickname: '',
    fullAddress: '',
    house_no: '',
    street: '',
    landmark: '',
    city: '',
    state: '',
    postalCode: '',
    lat: 0,
    lng: 0,
    isDefault: false
  });

  useEffect(() => {
    console.log('AddressManager userId:', userId);
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  const fetchAddresses = async () => {
    console.log('Fetching addresses for userId:', userId);
    try {
      const response = await fetch(`${API_URL}/api/address/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      const result = await response.json();
      console.log('API result:', result);
      if (result.success) {
        console.log('Setting addresses:', result.addresses);
        setAddresses(result.addresses);
      } else {
        console.error('Failed to fetch addresses:', result.message);
      }
    } catch (error) {
      console.error('Get addresses error:', error);
    }
  };

  const handleFormSubmit = async (addressData) => {
    // Transform data to match new address model
    const transformedData = {
      userId,
      type: addressData.type?.charAt(0).toUpperCase() + addressData.type?.slice(1) || 'Home', // Capitalize first letter
      nickname: addressData.nickname || '',
      fullAddress: `${addressData.house_no || ''}, ${addressData.street || ''}, ${addressData.city || ''}, ${addressData.state || ''} ${addressData.pincode || addressData.postalCode || ''}`.trim(),
      house_no: addressData.house_no || '',
      street: addressData.street || '',
      landmark: addressData.landmark || '',
      city: addressData.city || '',
      state: addressData.state || '',
      postalCode: addressData.pincode || addressData.postalCode || '',
      lat: addressData.lat || 0,
      lng: addressData.lng || 0,
      isDefault: addressData.isDefault || false
    };
    
    console.log('Original data:', addressData);
    console.log('Transformed data:', transformedData);
    
    let result;
    try {
      if (editingAddress) {
        const response = await fetch(`${API_URL}/api/address/update`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...transformedData, addressId: editingAddress._id })
        });
        result = await response.json();
      } else {
        const response = await fetch(`${API_URL}/api/address/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transformedData)
        });
        result = await response.json();
      }
    } catch (error) {
      console.error('Address operation error:', error);
      result = { success: false, message: 'Network error' };
    }
    
    if (result.message) {
      alert(result.message);
      if (result.message.includes('successfully')) {
        fetchAddresses();
        setShowForm(false);
        setEditingAddress(null);
        return true;
      }
    }
    return false;
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setFormData(address);
    setShowForm(true);
  };

  const handleDelete = async (addressId) => {
    if (confirm('Delete this address?')) {
      try {
        const response = await fetch(`${API_URL}/api/address/delete`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, addressId })
        });
        const result = await response.json();
        if (result.message) {
          alert(result.message);
          if (result.message.includes('successfully')) {
            fetchAddresses();
          }
        }
      } catch (error) {
        console.error('Delete address error:', error);
        alert('Network error');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      type: 'Home',
      nickname: '',
      fullAddress: '',
      house_no: '',
      street: '',
      landmark: '',
      city: '',
      state: '',
      postalCode: '',
      lat: 0,
      lng: 0,
      isDefault: false
    });
  };

  // Filter addresses based on active type
  const [activeType, setActiveType] = useState("home");
  const filteredAddresses = addresses.filter((address) => {
    return address.type?.toLowerCase() === activeType.toLowerCase();
  });

  return (
    <div className="max-w-xl h-screen overflow-auto mx-auto p-4 bg-bgColor" style={{ scrollbarWidth: "none" }}>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">Saved Addresses</h1>
        <button
          onClick={() => setShowMapSelector(true)}
          className="flex items-center bg-red-800 text-white px-3 py-2 rounded-md"
        >
          <IoMdAdd className="mr-1" /> Add New
        </button>
      </div>

      {/* Address Categories */}
      <div className="mb-6">
        <div className="flex space-x-4 mb-4">
          <button
            className={`flex-1 py-2 ${
              activeType === "home"
                ? "bg-red-800 text-white"
                : "bg-white border border-gray-300 text-gray-700"
            } rounded-md flex items-center justify-center`}
            onClick={() => setActiveType("home")}
          >
            <FaHome className="mr-2" /> Home
          </button>
          <button
            className={`flex-1 py-2 ${
              activeType === "work"
                ? "bg-red-800 text-white"
                : "bg-white border border-gray-300 text-gray-700"
            } rounded-md flex items-center justify-center`}
            onClick={() => setActiveType("work")}
          >
            <FaBriefcase className="mr-2" /> Work
          </button>
        </div>
      </div>

      {/* Address List */}
      {filteredAddresses.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No {activeType} addresses saved yet
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAddresses.map((address, index) => (
            <div
              key={address._id || index}
              className="rounded-lg p-4 bg-white shadow-lg/15 cursor-pointer border-2 border-transparent"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center">
                  {address.type?.toLowerCase() === "home" ? (
                    <FaHome className="text-red-800 mr-2" />
                  ) : (
                    <FaBriefcase className="text-blue-800 mr-2" />
                  )}
                  <span className="font-medium capitalize">
                    {address.type}
                  </span>
                  {address.nickname && <span className="text-gray-600 ml-2">({address.nickname})</span>}
                </div>
                <div className="flex space-x-2">
                  <button
                    className="text-blue-600 p-1"
                    onClick={() => handleEdit(address)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 p-1"
                    onClick={() => handleDelete(address._id)}
                  >
                    <FaTrash />
                  </button>
                </div>
              </div>
              <div className="mt-2 text-gray-700">
                <p>{address.house_no}, {address.street}</p>
                <p>{address.city}, {address.state} - {address.postalCode}</p>
                {address.landmark && <p>Landmark: {address.landmark}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Address Modal */}
      <MapAddressSelector
        isOpen={showMapSelector}
        onClose={() => setShowMapSelector(false)}
        onAddressSelect={() => {
          setShowMapSelector(false);
          fetchAddresses();
        }}
      />
    </div>
  );
};

export default AddressManager;