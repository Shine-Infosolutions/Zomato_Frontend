import React, { useState, useEffect } from 'react';
import { FaTimes, FaLocationArrow } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import MyLocationPointer from './MyLocationPointer';
import DeliveryTracker from './DeliveryTracker';

const API_URL = import.meta.env.VITE_API_BASE_URL;

const MapAddressSelector = ({ isOpen, onClose, onAddressSelect, onParentClose, redirectTo = '/' }) => {
  // Restaurant location (source) - Fixed location
  const restaurantLocation = { lat: 26.785759952866332, lng: 83.38553180232579 };
  
  const [selectedLocation, setSelectedLocation] = useState({ lat: 26.7606, lng: 83.3732 });
  const [currentLocation, setCurrentLocation] = useState(null);
  const [address, setAddress] = useState('');
  const [addressFields, setAddressFields] = useState({
    houseNumber: '',
    street: '',
    city: '',
    state: '',
    pincode: '',
    landmark: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [distance, setDistance] = useState(null);

  const fetchAddressFromMappls = async (lat, lng) => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `https://geocode.maps.co/reverse?lat=${lat}&lon=${lng}&api_key=68356bb1a3afb750007085wdx475b3a`
      );
      const data = await response.json();
      if (data && data.display_name) {
        setAddress(data.display_name);
        
        // Parse and auto-fill address fields
        const parts = data.display_name.split(', ');
        setAddressFields({
          houseNumber: data.address?.house_number || parts[0] || '1',
          street: data.address?.road || parts[1] || parts[0] || 'Street',
          city: data.address?.city || data.address?.town || data.address?.village || parts[2] || 'City',
          state: data.address?.state || parts[3] || 'State',
          pincode: data.address?.postcode || '000000',
          landmark: data.address?.attraction || ''
        });
      }
    } catch (error) {
      setAddress(`Location: ${lat.toFixed(6)}, ${lng.toFixed(6)}`);
    } finally {
      setIsLoading(false);
    }
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      return;
    }

    setIsLoading(true);
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setSelectedLocation({ lat: latitude, lng: longitude });
        setCurrentLocation({ lat: latitude, lng: longitude });
        fetchAddressFromMappls(latitude, longitude);
      },
      () => {
        setIsLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

  // Auto-get current location when modal opens
  useEffect(() => {
    if (isOpen) {
      getCurrentLocation();
    }
  }, [isOpen]);

  useEffect(() => {
    let mapInstance = null;
    let marker = null;

    if (isOpen && currentLocation) {
      const initMap = () => {
        const mapContainer = document.getElementById('address-selector-map');
        
        if (!mapContainer) {
          console.log('Map container not found, retrying...');
          setTimeout(initMap, 200);
          return;
        }
        
        if (!window.mappls && !window.MapmyIndia) {
          console.log('MapmyIndia SDK not available on localhost, using fallback');
          // Create interactive fallback map for localhost
          mapContainer.className = 'bg-gradient-to-br from-blue-100 to-green-100 relative cursor-pointer';
          
          const centerDiv = document.createElement('div');
          centerDiv.className = 'absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center';
          
          centerDiv.innerHTML = `
            <div class="text-3xl mb-2">📍</div>
            <div class="text-gray-700 font-medium">Interactive Map</div>
            <div class="text-xs text-gray-500 mt-1">Click to select location</div>
            <div id="coord-display" class="text-xs text-gray-500 mt-1">Lat: ${currentLocation.lat.toFixed(4)}, Lng: ${currentLocation.lng.toFixed(4)}</div>
          `;
          
          const labelDiv = document.createElement('div');
          labelDiv.className = 'absolute top-2 right-2 bg-white px-2 py-1 rounded text-xs text-gray-600';
          labelDiv.textContent = 'MapmyIndia Fallback';
          
          mapContainer.appendChild(centerDiv);
          mapContainer.appendChild(labelDiv);
          
          // Make fallback map clickable
          mapContainer.addEventListener('click', (e) => {
            const rect = mapContainer.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width;
            const y = (e.clientY - rect.top) / rect.height;
            
            const newLat = 26.715511 + (0.5 - y) * 0.02;
            const newLng = 83.378906 + (x - 0.5) * 0.02;
            
            setSelectedLocation({ lat: newLat, lng: newLng });
            fetchAddressFromMappls(newLat, newLng);
            
            const coordDisplay = document.getElementById('coord-display');
            if (coordDisplay) {
              coordDisplay.textContent = `Lat: ${newLat.toFixed(4)}, Lng: ${newLng.toFixed(4)}`;
            }
          });
          
          fetchAddressFromMappls(currentLocation.lat, currentLocation.lng);
          return;
        }
        
        const mapAPI = window.mappls || window.MapmyIndia;
        
        console.log('Latest Mappls SDK loaded successfully');
        
        console.log('MapmyIndia SDK loaded, initializing map...');

        mapInstance = new mapAPI.Map('address-selector-map', {
          center: [currentLocation.lng, currentLocation.lat],
          zoom: 15,
          minZoom: 10,
          maxZoom: 18,
          zoomControl: true,
          scrollwheel: true
        });
        
        console.log('Map instance created:', mapInstance);
        
        // Hide current location marker
        const style = document.createElement('style');
        style.textContent = `
          .leaflet-marker-icon img[src*="current_location.png"] { display: none !important; }
          .leaflet-control-locate { display: none !important; }
        `;
        document.head.appendChild(style);
        
        // Create markers immediately after map creation
        console.log('Creating markers...');
        
        // Create markers
        setTimeout(() => {
          try {
            if (window.L && window.L.marker) {
              // Fixed restaurant marker (red)
              const restaurantMarker = window.L.marker([restaurantLocation.lat, restaurantLocation.lng], {
                draggable: false
              }).addTo(mapInstance);
              
              // User delivery marker (blue, draggable) at current location
              marker = window.L.marker([currentLocation.lat, currentLocation.lng], {
                draggable: true
              }).addTo(mapInstance);
              
              // Marker drag event
              marker.on('dragend', (e) => {
                const pos = e.target.getLatLng();
                updateLocation(pos.lat, pos.lng);
              });
              
              console.log('Restaurant and user markers created');
            }
          } catch (error) {
            console.error('Error creating markers:', error);
          }
        }, 1000);
        
        // Map click event - move marker to clicked location
        if (mapInstance && mapInstance.on) {
          mapInstance.on('click', (e) => {
            const lat = e.latlng.lat;
            const lng = e.latlng.lng;
            
            if (marker && marker.setLatLng) {
              marker.setLatLng([lat, lng]);
              updateLocation(lat, lng);
            }
          });
        }

        mapContainer._mapInstance = mapInstance;
        mapContainer._marker = marker;
        
        console.log('Map initialized successfully, creating markers...');
        
        let debounceTimer;
        const updateLocation = (lat, lng) => {
          console.log('Updating location to:', lat, lng);
          setSelectedLocation({ lat, lng });
          
          // Calculate distance
          const dist = calculateDistance(restaurantLocation.lat, restaurantLocation.lng, lat, lng);
          setDistance(dist);
          
          // Debounce API calls to avoid too many requests
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            fetchAddressFromMappls(lat, lng);
          }, 500);
        };


        

      };
      
      setTimeout(initMap, 500);
    }

    return () => {
      // Cleanup map instance
      if (mapInstance) {
        try {
          mapInstance.remove();
          mapInstance = null;
        } catch (e) {
          console.log('Map cleanup error:', e);
        }
      }
      
      // Clear container references
      const mapContainer = document.getElementById('address-selector-map');
      if (mapContainer) {
        mapContainer._mapInstance = null;
        mapContainer._marker = null;
        mapContainer.innerHTML = '';
      }
    };
  }, [isOpen, currentLocation]);

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in kilometers
  };





  const { user, fetchAddresses, navigate } = useAppContext();

  const handleConfirm = async () => {
    // Validate required fields
    if (!addressFields.houseNumber || !addressFields.street || !addressFields.city || !addressFields.pincode) {
      alert('Please fill in all required fields (House Number, Street, City, Pincode)');
      return;
    }

    if (!user?._id) {
      alert('Please log in to save address');
      return;
    }

    setIsLoading(true);
    
    try {
      // Save address to database
      const addressData = {
        userId: user._id,
        type: 'Home', // Default type
        nickname: '',
        fullAddress: `${addressFields.houseNumber}, ${addressFields.street}, ${addressFields.city}, ${addressFields.state} ${addressFields.pincode}`,
        house_no: addressFields.houseNumber,
        street: addressFields.street,
        landmark: addressFields.landmark,
        city: addressFields.city,
        state: addressFields.state,
        postalCode: addressFields.pincode,
        lat: selectedLocation.lat,
        lng: selectedLocation.lng,
        isDefault: false
      };

      const response = await fetch(`${API_URL}/api/address/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(addressData)
      });

      const result = await response.json();
      
      if (result.message === 'Address saved successfully' || result.success) {
        // Close modal first
        onClose();
        if (onParentClose) onParentClose();
        
        // Navigate to cart page
        if (redirectTo === '/cart') {
          setTimeout(() => {
            window.location = '/cart';
          }, 100);
        } else {
          window.location.reload();
        }
      } else {

        alert(result.message || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      alert('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[95vh] sm:max-h-[90vh] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between p-4 sm:p-6 border-b bg-gray-50">
          <h2 className="text-lg sm:text-xl font-bold text-gray-900">Select Delivery Location</h2>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded-full transition-colors"
          >
            <FaTimes className="w-4 h-4" />
          </button>
        </div>

        <div className="relative">
          <div
            id="address-selector-map"
            className="w-full h-[250px] sm:h-[300px] relative bg-gradient-to-br from-blue-50 to-green-50 block visible"
          ></div>
          
          <button
            onClick={getCurrentLocation}
            disabled={isLoading}
            className="absolute top-3 right-3 bg-white p-3 rounded-full shadow-lg border hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            <FaLocationArrow className="text-red-600 w-4 h-4" />
          </button>
          
          <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg text-xs shadow-lg border">
            <div className="flex items-center gap-2">
              <span>🍽️ Restaurant</span>
              <span>📍 Your Location</span>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-6 overflow-y-auto flex-1">
          <div className="mb-6">
            <label className="block text-sm font-semibold text-gray-700 mb-2">Selected Address:</label>
            <div className="p-3 bg-gray-50 rounded-xl text-sm min-h-[50px] border">
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full"></div>
                  Getting address...
                </div>
              ) : (
                address || 'Click on map to select location'
              )}
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">House/Flat Number*</label>
                <input 
                  type="text" 
                  value={addressFields.houseNumber}
                  onChange={(e) => setAddressFields({...addressFields, houseNumber: e.target.value})}
                  placeholder="e.g. 123, A-45" 
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Street Address*</label>
                <input 
                  type="text" 
                  value={addressFields.street}
                  onChange={(e) => setAddressFields({...addressFields, street: e.target.value})}
                  placeholder="e.g. Main Street, Park Road" 
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City*</label>
                <input 
                  type="text" 
                  value={addressFields.city}
                  onChange={(e) => setAddressFields({...addressFields, city: e.target.value})}
                  placeholder="e.g. Gorakhpur" 
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">State</label>
                <input 
                  type="text" 
                  value={addressFields.state}
                  onChange={(e) => setAddressFields({...addressFields, state: e.target.value})}
                  placeholder="e.g. Uttar Pradesh" 
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Pincode*</label>
                <input 
                  type="text" 
                  value={addressFields.pincode}
                  onChange={(e) => setAddressFields({...addressFields, pincode: e.target.value})}
                  placeholder="e.g. 273001" 
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Landmark</label>
                <input 
                  type="text" 
                  value={addressFields.landmark}
                  onChange={(e) => setAddressFields({...addressFields, landmark: e.target.value})}
                  placeholder="e.g. Near Metro Station" 
                  className="w-full p-3 border border-gray-300 rounded-xl bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all" 
                />
              </div>
            </div>
          </div>
          
          {distance && (
            <div className="mt-6 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Distance from Restaurant:</label>
              <div className="p-3 bg-blue-50 rounded-xl text-sm border border-blue-200">
                <div className="flex items-center gap-2">
                  <span className="text-blue-600">📍</span>
                  <span className="font-medium">{distance.toFixed(2)} km away</span>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-4 border-t">
            <button
              onClick={onClose}
              className="flex-1 py-3 px-4 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!address || isLoading}
              className="flex-1 py-3 px-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold hover:from-red-700 hover:to-red-800 disabled:from-gray-400 disabled:to-gray-400 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                  Saving...
                </div>
              ) : (
                'Confirm Location'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapAddressSelector;