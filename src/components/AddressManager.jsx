import React, { useState, useEffect } from 'react';
import { addAddress, getAddresses, updateAddress, deleteAddress } from '../services/addressApi';
import { IoMdAdd } from "react-icons/io";
import { FaHome, FaBriefcase, FaEdit, FaTrash } from "react-icons/fa";
import AddNewAddressModal from "./AddNewAddressModal";

const AddressManager = ({ userId }) => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
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
    const result = await getAddresses(userId);
    console.log('API result:', result);
    if (result.success) {
      console.log('Setting addresses:', result.addresses);
      setAddresses(result.addresses);
    } else {
      console.error('Failed to fetch addresses:', result.message);
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
    if (editingAddress) {
      result = await updateAddress({ ...transformedData, addressId: editingAddress._id });
    } else {
      result = await addAddress(transformedData);
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
      const result = await deleteAddress(userId, addressId);
      if (result.message) {
        alert(result.message);
        if (result.message.includes('successfully')) {
          fetchAddresses();
        }
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
          onClick={() => setShowForm(true)}
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

      {/* Add/Edit Address Modal */}
      <AddNewAddressModal
        showModal={showForm}
        closeModal={() => {
          setShowForm(false);
          setEditingAddress(null);
        }}
        onSubmit={handleFormSubmit}
        initialAddress={editingAddress}
        isLoading={false}
      />
    </div>
  );
};

export default AddressManager;