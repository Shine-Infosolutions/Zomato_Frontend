import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import LoadingOverlay from "./LoadingOverlay";

const AddNewAddressModal = ({
  showModal,
  closeModal,
  onSubmit,
  initialAddress = null,
  isLoading = false,
}) => {
  const getDefaultAddress = () => ({
    type: "home",
    house_no: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    landmark: "",
    lat: 26.7606,
    lng: 83.3732,
  });

  const [isClosing, setIsClosing] = useState(false);
  const [address, setAddress] = useState(initialAddress || getDefaultAddress());

  // Reset form when modal opens or initialAddress changes
  useEffect(() => {
    if (showModal) {
      if (initialAddress) {
        // Format the address data to match the form fields
        setAddress({
          type: initialAddress.type?.toLowerCase() || "home",
          house_no: initialAddress.house_no || "",
          street: initialAddress.street || "",
          city: initialAddress.city || "",
          state: initialAddress.state || "",
          pincode: initialAddress.pincode || initialAddress.postalCode || "",
          landmark: initialAddress.landmark || "",
          lat: initialAddress.lat || 26.7606,
          lng: initialAddress.lng || 83.3732,
          _id: initialAddress._id, // Keep the ID for editing
        });
      } else {
        setAddress(getDefaultAddress());
      }
    }
  }, [showModal, initialAddress]);

  // Map initialization with enhanced functionality
  useEffect(() => {
    let isMounted = true;
    let mapInstance = null;
    let marker = null;
    let searchPlugin = null;

    if (showModal) {
      // Clear any existing map instance
      if (window._mappls_modal_map) {
        window._mappls_modal_map = null;
      }

      setTimeout(() => {
        if (!isMounted) return;

        const mapContainer = document.getElementById("map");
        if (!window.mappls || !mapContainer) return;

        // Initialize map with enhanced options
        mapInstance = new window.mappls.Map("map", {
          center: [
            address.lat || initialAddress?.lat || 26.7606,
            address.lng || initialAddress?.lng || 83.3732,
          ],
          zoom: 15,
          zoomControl: true,
          location: true,
          fullscreenControl: true,
          traffic: true,
        });

        window._mappls_modal_map = mapInstance;

        // Add search functionality
        if (window.mappls.search) {
          searchPlugin = window.mappls.search({
            map: mapInstance,
            location: [83.3732, 26.7606], // Default location
            bridge: true,
            hyperLocal: true,
            width: 300,
          });
        }

        // Add draggable marker with custom icon
        marker = new window.mappls.Marker({
          map: mapInstance,
          position: {
            lat: address.lat || initialAddress?.lat || 26.7606,
            lng: address.lng || initialAddress?.lng || 83.3732,
          },
          fitbounds: true,
          popupHtml: "<div style='padding:5px;'>📍 Delivery Location</div>",
          draggable: true,
          icon_url: "https://apis.mapmyindia.com/map_v3/1.3/png?marker_icon=red-pushpin",
        });

        // Enhanced location update function
        function updateLocation(lat, lng, source = 'manual') {
          if (typeof lat !== 'number' || typeof lng !== 'number') return;
          
          // Update marker position
          marker.setPosition({ lat, lng });
          
          // Center map on new location
          mapInstance.setCenter([lng, lat]);
          
          // Fetch address details
          fetchAddressFromLatLng(lat, lng, source);
        }

        // Enhanced marker drag handler
        marker.addListener("dragend", function () {
          const pos = marker.getPosition();
          if (pos && typeof pos.lat === "number" && typeof pos.lng === "number") {
            updateLocation(pos.lat, pos.lng, 'drag');
          }
        });

        // Enhanced map click handler
        mapInstance.addListener("click", function (e) {
          let lat, lng;
          if (typeof e.lat === "number" && typeof e.lng === "number") {
            lat = e.lat;
            lng = e.lng;
          } else if (Array.isArray(e.lngLat) && e.lngLat.length === 2) {
            lng = e.lngLat[0];
            lat = e.lngLat[1];
          } else {
            return;
          }
          updateLocation(lat, lng, 'click');
        });

        // Add current location button
        const locationBtn = document.createElement('button');
        locationBtn.innerHTML = '📍';
        locationBtn.className = 'mappls-ctrl-btn';
        locationBtn.style.cssText = `
          position: absolute;
          top: 10px;
          right: 10px;
          z-index: 1000;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          padding: 8px;
          cursor: pointer;
          font-size: 16px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.2);
        `;
        locationBtn.title = 'Get Current Location';
        
        locationBtn.onclick = () => {
          if (navigator.geolocation) {
            locationBtn.innerHTML = '⏳';
            navigator.geolocation.getCurrentPosition(
              (position) => {
                const { latitude, longitude } = position.coords;
                updateLocation(latitude, longitude, 'gps');
                locationBtn.innerHTML = '📍';
              },
              (error) => {
                console.error('Geolocation error:', error);
                alert('Unable to get current location');
                locationBtn.innerHTML = '📍';
              },
              { enableHighAccuracy: true, timeout: 10000 }
            );
          } else {
            alert('Geolocation not supported');
          }
        };
        
        mapContainer.appendChild(locationBtn);

        // Initialize with current location if available
        if (!initialAddress && navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              updateLocation(latitude, longitude, 'auto');
            },
            () => {
              // Fallback to default location
              updateLocation(26.7606, 83.3732, 'default');
            }
          );
        } else {
          updateLocation(
            address.lat || initialAddress?.lat || 26.7606,
            address.lng || initialAddress?.lng || 83.3732,
            'initial'
          );
        }
      }, 100);
    }

    return () => {
      isMounted = false;
      if (mapInstance) {
        mapInstance.remove();
      }
      window._mappls_modal_map = null;
    };
  }, [showModal]);

  const fetchAddressFromLatLng = async (lat, lng, source = 'manual') => {
    try {
      // Skip geocoding on initial load for edit mode unless it's a new location
      if (
        initialAddress &&
        source === 'initial' &&
        lat === (initialAddress.lat || 26.7606) &&
        lng === (initialAddress.lng || 83.3732)
      ) {
        return;
      }

      // Try MapmyIndia reverse geocoding first
      if (window.mappls && window.mappls.RestApi) {
        try {
          const reverseGeocode = new window.mappls.RestApi.reverse_geocode({
            lat: lat,
            lng: lng,
          }, (data) => {
            if (data && data.results && data.results[0]) {
              const result = data.results[0];
              setAddress((prev) => ({
                ...prev,
                lat,
                lng,
                house_no: result.house_number || result.house_name || "",
                street: [
                  result.street,
                  result.subSubLocality,
                  result.subLocality,
                ].filter(Boolean).join(", "),
                city: result.city || result.district || "",
                state: result.state || "",
                pincode: result.pincode || "",
                landmark: result.poi || "",
              }));
              return;
            }
          });
        } catch (mapplsError) {
          console.log('MapmyIndia geocoding failed, trying fallback');
        }
      }

      // Fallback to alternative geocoding service
      const response = await fetch(
        `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&api_key=68356bb1a3afb750007085wdx475b3a`
      );
      const data = await response.json();

      if (data && data.address) {
        setAddress((prev) => ({
          ...prev,
          lat,
          lng,
          house_no: data.address.house_number || "",
          street: [
            data.address.road,
            data.address.neighbourhood,
            data.address.suburb,
          ].filter(Boolean).join(", "),
          city: data.address.city || data.address.town || data.address.village || "",
          state: data.address.state || "",
          pincode: data.address.postcode || "",
          landmark: data.address.attraction || data.address.public_building || "",
        }));
      }
    } catch (err) {
      console.error("Reverse geocoding failed", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAddress((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    window._mappls_modal_map = null;
    // If editing (has _id), preserve it in the submitted data
    const addressData = address._id
      ? { ...address }
      : { ...address, id: Date.now() };

    onSubmit(address);
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      closeModal();
      setIsClosing(false);
    }, 300);
  };

  if (!showModal) return null;

  return (
    <div
      className={`address-modal-overlay ${isClosing ? "closing" : ""}`}
      onClick={handleClose}
    >
      <div
        className={`address-modal-content ${isClosing ? "closing" : ""}`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Add loading overlay inside the modal */}
        {isLoading && <LoadingOverlay />}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold">
            {initialAddress ? "Edit Address" : "Add New Address"}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="relative">
          <div
            id="map"
            style={{
              margin: 0,
              padding: 0,
              width: "100%",
              height: "350px",
              borderRadius: "8px",
            }}
          ></div>
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs text-gray-600 shadow">
            📍 Drag marker or tap to set location
          </div>
        </div>

        {/* <div
          id="show-result"
          style={{
            display: "none",
            margin: "8px 0",
            color: "#d32f2f",
            fontWeight: "bold",
          }}
        ></div> */}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Type
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="home"
                  checked={address.type === "home"}
                  onChange={handleChange}
                  className="mr-2 accent-red-800"
                />
                Home
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="type"
                  value="work"
                  checked={address.type === "work"}
                  onChange={handleChange}
                  className="mr-2 accent-red-800"
                />
                Work
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              House/Flat Number*
            </label>
            <input
              type="text"
              name="house_no"
              value={address.house_no}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address*
            </label>
            <input
              type="text"
              name="street"
              value={address.street}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City*
            </label>
            <input
              type="text"
              name="city"
              value={address.city}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="state"
              value={address.state}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Pincode*
            </label>
            <input
              type="text"
              name="pincode"
              value={address.pincode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Landmark
            </label>
            <input
              type="text"
              name="landmark"
              value={address.landmark}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-red-800"
            />
          </div>

          <div className="flex space-x-4 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 bg-red-800 text-white rounded-md"
            >
              {initialAddress ? "Update Address" : "Save Address"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddNewAddressModal;
