import React, { useState, useEffect, useRef } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { RiArrowDropDownLine } from "react-icons/ri";
import { LuReceiptIndianRupee } from "react-icons/lu";
import { FaUser, FaSearch } from "react-icons/fa";
import { TiMicrophone } from "react-icons/ti";
import { BiSolidLeaf } from "react-icons/bi";
import FoodSlider from "./FoodSlider";
import FilterSlider from "./FilterSlider";
import FoodCard from "./FoodCard";
import { FiLogOut } from "react-icons/fi";
import { useAppContext } from "../../context/AppContext";
import LocationPicker from "../LocationPicker";

const Header = ({ selectedAddress, onSearchSelect }) => {
  const [toggle, setToggle] = useState(false);
  const { logout, user, navigate, vegModeEnabled, toggleVegMode } = useAppContext();
  const [showMenu, setShowMenu] = useState(false);
  const [showMapSelector, setShowMapSelector] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [addresses, setAddresses] = useState([]);
  
  const API_URL = import.meta.env.VITE_API_BASE_URL;
  const userId = user?._id;

  const fetchAddresses = async () => {
    console.log('Fetching addresses for userId:', userId);
    console.log('User object:', user);
    if (!userId) {
      console.log('No userId available');
      return;
    }
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
        console.log('Rendering addresses:', result.addresses);
        setAddresses(result.addresses);
      } else {
        console.error('Failed to fetch addresses:', result.message);
      }
    } catch (error) {
      console.error('Get addresses error:', error);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchAddresses();
    }
  }, [userId]);

  const handleProfileClick = () => {
    navigate("/profile");
  };

  const handleSearch = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    try {
      console.log('Searching for:', query);
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/search/universal?query=${encodeURIComponent(query)}`);
      const data = await response.json();
      
      console.log('Search response:', data);
      
      if (data.success && data.results) {
        let items = (data.results.items || []).map(item => ({ 
          ...item, 
          name: item.name, 
          type: 'Dish',
          price: item.price 
        }));
        
        // Filter items based on veg mode
        if (vegModeEnabled) {
          items = items.filter(item => item.veg === true);
        }
        
        const results = [
          ...items,
          ...(data.results.categories || []).map(category => ({ 
            ...category, 
            name: category.category, 
            type: 'Category' 
          }))
        ];
        
        console.log('Processed results:', results);
        setSearchResults(results);
        setShowSearchResults(results.length > 0);
      } else {
        console.log('No results found');
        setSearchResults([]);
        setShowSearchResults(false);
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    
    // Clear previous timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const newTimeout = setTimeout(() => {
      handleSearch(query);
    }, 300);
    
    setSearchTimeout(newTimeout);
  };

  const handleVoiceSearch = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Voice search not supported. Use Chrome or Edge browser.');
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      handleSearch(transcript);
    };

    recognition.onerror = (event) => {
      setIsListening(false);
      if (event.error === 'not-allowed') {
        alert('Please allow microphone access and try again.');
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  const getAddressLine1 = () => {
    const deliveryLocation = JSON.parse(localStorage.getItem('selectedDeliveryLocation') || '{}');
    if (deliveryLocation.name) return deliveryLocation.name;
    if (!selectedAddress || !selectedAddress.street) return "Azad Colony";
    const firstWord = selectedAddress.street.split(" ")[0];
    return firstWord || "Azad Colony";
  };

  const getAddressLine2 = () => {
    const deliveryLocation = JSON.parse(localStorage.getItem('selectedDeliveryLocation') || '{}');
    if (deliveryLocation.city) return deliveryLocation.city;
    if (!selectedAddress || !selectedAddress.city) return "Abc Colony";
    return selectedAddress.city;
  };

  return (
    <>
      <div className="flex justify-between relative">
        <div className=" flex items-center m-2 text-xl w-[200px]">
          <div className="flex flex-col">
            <div 
              className="font-bold flex items-center gap-1 text-xl cursor-pointer"
              onClick={() => setShowMapSelector(true)}
            >
              <FaLocationDot className=" text-red-500 h-[18px] mt-[3px]" />
              {getAddressLine1()}
              <RiArrowDropDownLine className="text-lg" />
            </div>
            <div
              className="text-sm ml-2 -translate-y-[3px]"
            >
              {getAddressLine2()}
            </div>
          </div>
        </div>

        {/* Location Picker */}
        <LocationPicker
          isOpen={showMapSelector}
          onClose={() => setShowMapSelector(false)}
          onLocationSelect={(location) => {
            console.log('Selected location:', location);
            // Update the displayed address
            localStorage.setItem('selectedDeliveryLocation', JSON.stringify(location));
            setShowMapSelector(false);
          }}
          addresses={addresses}
        />

        <div className="flex items-center text-2xl">
          <div 
            onClick={toggleVegMode}
            className={`flex items-center px-2 py-1 rounded-full cursor-pointer mx-2 transition-colors ${
              vegModeEnabled ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
            }`}
            title={vegModeEnabled ? 'Veg Mode On' : 'Veg Mode Off'}
          >
            <BiSolidLeaf className="text-sm mr-1" />
            <span className="text-xs font-medium">VEG</span>
          </div>
          
          <div className="relative group mx-2">
            <FaUser onClick={handleProfileClick} className="cursor-pointer" />
            <div
              className={`absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg transition-all duration-300 z-50 ${
                showMenu ? "opacity-100 visible" : "opacity-0 invisible"
              }`}
            >
              {user && (
                <div className="px-4 py-2 text-sm text-gray-700 border-b">
                  <p className="font-medium">{user.name || "User"}</p>
                  <p className="text-xs">{user.phone}</p>
                </div>
              )}
              <button
                onClick={logout}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
              >
                <FiLogOut className="mr-2" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className=" flex justify-between mt-2 ">
        <div className="flex relative rounded-lg justify-center items-center flex-grow ">
          <FaSearch className="text-2xl text-red-600 absolute left-8  bottom-2 " />
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchChange}
            className="shadow-md rounded-lg p-2 pl-12 ml-6 mt-4 mr-6 flex-grow"
            placeholder="Search for dishes, categories..."
          />
          <TiMicrophone 
            className={`text-2xl absolute right-6 bottom-2 cursor-pointer ${
              isListening ? 'text-green-600 animate-pulse' : 'text-red-600'
            }`}
            onClick={handleVoiceSearch}
            title="Voice Search"
          />
          
          {showSearchResults && searchResults.length > 0 && (
            <div className="absolute top-full left-6 right-6 bg-white shadow-lg rounded-lg mt-1 z-50 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                  onClick={() => {
                    if (result.type === 'Dish') {
                      onSearchSelect(result.name);
                    }
                    setShowSearchResults(false);
                    setSearchQuery('');
                  }}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{result.name}</div>
                      <div className="text-sm text-gray-500">{result.type}</div>
                    </div>
                    {result.price && (
                      <div className="text-sm font-medium text-green-600">Rs.{result.price}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {showSearchResults && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowSearchResults(false)}
        />
      )}
    </>
  );
};

export default Header;