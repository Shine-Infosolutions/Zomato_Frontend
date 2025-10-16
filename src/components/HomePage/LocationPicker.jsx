import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaLocationArrow, FaTimes, FaPlus } from 'react-icons/fa';
import { useAppContext } from '../context/AppContext';
import MapAddressSelector from './MapAddressSelector';

const LocationPicker = ({ isOpen, onClose, onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [localAddresses, setLocalAddresses] = useState([]);
  const searchTimeoutRef = useRef(null);
  const { setSelectedAddressId, user } = useAppContext();
  
  // Fetch addresses directly from API
  const fetchSavedAddresses = async () => {
    console.log('LocationPicker user:', user);
    if (!user?._id) {
      console.log('No user ID available');
      return;
    }
    
    try {
      console.log('Fetching addresses for userId:', user._id);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/address/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });
      
      const data = await response.json();
      console.log('LocationPicker API response:', data);
      
      if (data.success && data.addresses) {
        console.log('Setting addresses:', data.addresses);
        setLocalAddresses(data.addresses);
      } else {
        console.log('No addresses found or API failed');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
    }
  };
  
  // Fetch addresses when modal opens
  useEffect(() => {
    if (isOpen && user?._id) {
      fetchSavedAddresses();
    }
  }, [isOpen, user?._id]);
  


  // Get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      setIsSearching(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          
          try {
            const response = await fetch(
              `https://geocode.maps.co/reverse?lat=${latitude}&lon=${longitude}&api_key=68356bb1a3afb750007085wdx475b3a`
            );
            const data = await response.json();
            
            const locationData = {
              id: 'current-location',
              name: 'Current Location',
              address: data.display_name || `${latitude}, ${longitude}`,
              lat: latitude,
              lng: longitude,
              type: 'current'
            };
            
            setCurrentLocation(locationData);
          } catch (error) {
            console.error('Failed to get address for current location:', error);
          } finally {
            setIsSearching(false);
          }
        },
        () => {
          setIsSearching(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  };



  // Search locations using MapmyIndia API
  const searchLocations = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      // Use MapmyIndia search if available
      if (window.mappls && window.mappls.RestApi) {
        const searchApi = new window.mappls.RestApi.search({
          query: query,
          region: 'IND',
          location: [83.3732, 26.7606], // Default to Gorakhpur
        }, (data) => {
          if (data && data.suggestedLocations) {
            const results = data.suggestedLocations.map(location => ({
              id: location.placeName + location.placeAddress,
              name: location.placeName,
              address: location.placeAddress,
              lat: location.latitude,
              lng: location.longitude,
              type: 'search'
            }));
            setSearchResults(results);
          }
          setIsSearching(false);
        });
      } else {
        // Fallback search
        const response = await fetch(
          `https://geocode.maps.co/search?q=${encodeURIComponent(query)}&api_key=68356bb1a3afb750007085wdx475b3a&countrycodes=in&limit=5`
        );
        const data = await response.json();
        
        if (data && Array.isArray(data)) {
          const results = data.map(item => ({
            id: item.place_id,
            name: item.display_name.split(',')[0],
            address: item.display_name,
            lat: parseFloat(item.lat),
            lng: parseFloat(item.lon),
            type: 'search'
          }));
          setSearchResults(results);
        }
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  // Debounced search
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    searchTimeoutRef.current = setTimeout(() => {
      searchLocations(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);



  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center pt-16">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 max-h-[80vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Select Location</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FaTimes />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-4 border-b">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search for area, street name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              autoFocus
            />
          </div>
        </div>

        {/* Current Location Button */}
        <div className="p-4 border-b">
          <button
            onClick={getCurrentLocation}
            disabled={isSearching}
            className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg disabled:opacity-50"
          >
            <FaLocationArrow className="text-red-600 mr-3" />
            <div>
              <div className="font-medium text-red-600">
                {isSearching ? 'Getting location...' : 'Use current location'}
              </div>
              <div className="text-sm text-gray-500">
                Enable location for better experience
              </div>
            </div>
          </button>
        </div>

        {/* Results */}
        <div className="max-h-96 overflow-y-auto">
          {/* Saved Addresses */}
          <div className="p-4 border-b">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Saved Addresses</h3>
            
            {/* Add Address Option */}
            <button
              onClick={() => setShowMapSelector(true)}
              className="flex items-center w-full p-3 text-left hover:bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 mb-3"
            >
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3">
                <FaPlus className="text-red-600 text-sm" />
              </div>
              <div className="flex-1">
                <div className="font-medium text-red-600">Add Address</div>
                <div className="text-sm text-gray-500">
                  Add a new delivery address
                </div>
              </div>
            </button>
            
            {/* Debug info */}
            {console.log('Rendering addresses:', localAddresses)}
            
            {/* Existing Saved Addresses */}
            {localAddresses?.map((address) => (
              <button
                key={address._id}
                onClick={() => {
                  setSelectedAddressId(address._id);
                  onLocationSelect({
                    id: address._id,
                    name: address.type,
                    address: `${address.house_no}, ${address.street}, ${address.city}`,
                    lat: address.lat,
                    lng: address.lng,
                    type: 'saved'
                  });
                }}
                className="flex items-start w-full p-3 text-left hover:bg-gray-50 rounded-lg mb-2"
              >
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3 mt-1">
                  {address.type === 'Home' ? '🏠' : address.type === 'Work' ? '🏢' : '📍'}
                </div>
                <div className="flex-1">
                  <div className="font-medium">{address.nickname || address.type}</div>
                  <div className="text-sm text-gray-500">
                    {address.house_no}, {address.street}
                  </div>
                  <div className="text-sm text-gray-400">
                    {address.city}, {address.state}
                  </div>
                </div>
              </button>
            ))}
            
            {(!localAddresses || localAddresses.length === 0) && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No saved addresses yet
              </div>
            )}
          </div>

          {/* Search Results */}
          {searchQuery && (
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Search Results</h3>
              {isSearching ? (
                <div className="text-center py-4 text-gray-500">Searching...</div>
              ) : searchResults.length === 0 ? (
                <div className="text-center py-4 text-gray-500">No results found</div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={result.id}
                    onClick={() => onLocationSelect(result)}
                    className="flex items-start w-full p-3 text-left hover:bg-gray-50 rounded-lg"
                  >
                    <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center mr-3 mt-1">
                      📍
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {result.address}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
        
        {/* Map Address Selector Modal */}
        <MapAddressSelector
          isOpen={showMapSelector}
          onClose={() => setShowMapSelector(false)}
          onParentClose={onClose}
          onAddressSelect={(selectedAddress) => {
            setShowMapSelector(false);
            // Refresh the addresses list after adding new address
            fetchSavedAddresses();
            onLocationSelect(selectedAddress);
            // Close the location picker modal
            onClose();
          }}
        />
      </div>
    </div>
  );
};

export default LocationPicker;