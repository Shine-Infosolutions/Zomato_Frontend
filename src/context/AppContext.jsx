import { createContext, useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { fetchUserProfile } from "../services/api";

export const AppContext = createContext();
const ADDRESSES_CACHE_KEY = "userAddresses";
const SELECTED_ADDRESS_KEY = "selectedAddressId";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export const AppContextProvider = ({ children }) => {
  const navigate = useNavigate();
  const [userNumber, setUserNumber] = useState("+91-");
  const [phone, setPhone] = useState("");
  const [isValid, setIsValid] = useState(true);
  const [otp, setOtp] = useState("");
  const [currentUser, setCurrentUser] = useState(false);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem("user")) || null
  );
  const [loading, setLoading] = useState(false);
  const [vegModeEnabled, setVegModeEnabled] = useState(
    localStorage.getItem("vegMode") === "true" || false
  );
  const [foodItem, setFoodItem] = useState({
    name: "Biryani",
    price: "150",
    quantity: "250g",
    description: "Best in the class",
    image: null,
    veg: false,
    rating: 4.5,
  });

  // Initialize cart state from localStorage
  const [cart, setCart] = useState(() => {
    try {
      const savedCart = localStorage.getItem("cart");
      return savedCart ? JSON.parse(savedCart) : {};
    } catch (error) {
      console.error("Error loading cart from localStorage:", error);
      return {};
    }
  });
  const [showCartNotification, setShowCartNotification] = useState(false);

  // Use refs to prevent infinite loops
  const isInitialMount = useRef(true);
  const isInitialCartMount = useRef(true);

  //Check if user is logged in or not

  // Check if user is logged in on app load
  useEffect(() => {
    const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
    const storedUser = localStorage.getItem("user");
    
    if (isLoggedIn && storedUser) {
      try {
        setUser(JSON.parse(storedUser));
        setCurrentUser(true);
      } catch (e) {
        localStorage.removeItem("isLoggedIn");
        localStorage.removeItem("user");
      }
    }
  }, []);

  // Save cart to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Generate unique ID for base item + variation
  const getBaseVariationId = (item, variation) => {
    const base = String(item.id).toLowerCase().replace(/\s+/g, "-");
    const variationPart = variation?.id
      ? String(variation.id).toLowerCase()
      : "default";
    return `${base}-${variationPart}`;
  };

  // Login function - simplified for new backend
  const login = async (phoneNumber) => {
    setLoading(true);
    try {
      // Mock login for now
      const userData = { phone: phoneNumber, name: "User" };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      setUser(userData);
      setCurrentUser(true);
      return { success: true, message: "Login successful" };
    } catch (error) {
      console.error("Login error:", error);
      return { success: false, message: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP function - simplified
  const verifyOTP = async (phoneNumber, otpCode) => {
    setLoading(true);
    try {
      // Mock verification
      const userData = { phone: phoneNumber, name: "User" };
      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("isLoggedIn", "true");
      setUser(userData);
      setCurrentUser(true);
      return { success: true };
    } catch (error) {
      console.error("OTP verification error:", error);
      return { success: false, message: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("userProfile");
    localStorage.removeItem("cart");
    setToken(null);
    setUser(null);
    setCurrentUser(false);
    navigate("/login");
  };

  // Update user profile function - simplified
  const updateUserProfile = async (userData) => {
    setLoading(true);
    try {
      // Update local user data
      const updatedUser = { ...user, ...userData };
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return {
        success: true,
        message: "Profile updated successfully",
      };
    } catch (error) {
      console.error("Profile update error:", error);
      return { success: false, message: "Network error. Please try again." };
    } finally {
      setLoading(false);
    }
  };

  const [profileRefreshed, setProfileRefreshed] = useState(false);

  const refreshUserProfile = async (forceRefresh = false) => {
    // Skip if already refreshed and not forcing
    if (profileRefreshed && !forceRefresh) return;

    try {
      const data = await fetchUserProfile(forceRefresh);
      if (data.success && data.user) {
        console.log("User profile fetched successfully:", data.user);
        setUser(data.user);
        localStorage.setItem(
          "user",
          JSON.stringify({
            ...JSON.parse(localStorage.getItem("user") || "{}"),
            ...data.user,
          })
        );
        localStorage.setItem("userProfile", JSON.stringify(data.user));
        setProfileRefreshed(true);
      } else {
        console.warn("Failed to fetch user profile:", data.error);
      }
    } catch (e) {
      console.error("Error in refreshUserProfile:", e);
    }
  };



  // Add item to cart
  const addToCart = (item, variation = null, addons = []) => {
    const id = getBaseVariationId(item, variation);
    setCart((prevCart) => {
      const prev = { ...prevCart };
      if (prev[id]) {
        prev[id].quantity += 1;
      } else {
        prev[id] = {
          ...item,
          id: item._id || item.id,
          variation,
          quantity: 1,
          addons: addons || [],
        };
      }
      return prev;
    });
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  const addToCartWithQuantity = (item, quantity, variation = null, addons = []) => {
    const id = getBaseVariationId(item, variation);
    setCart((prevCart) => {
      const prev = { ...prevCart };
      prev[id] = {
        ...item,
        id: item._id || item.id,
        variation,
        quantity: quantity,
        addons: addons || [],
      };
      return prev;
    });
    setShowCartNotification(true);
    setTimeout(() => setShowCartNotification(false), 3000);
  };

  // Add to cart
  const addToCartWithAddons = (item, variation, addons) => {
    const id = getBaseVariationId(item, variation);
    setCart((prevCart) => {
      const prev = { ...prevCart };
      if (prev[id]) {
        // Add new addons set for this instance
        prev[id].quantity += 1;
        prev[id].addonsList.push(addons.map((a) => a.name));
      } else {
        prev[id] = {
          ...item,
          _id: item._id,
          variation,
          quantity: 1,
          addonsList: [addons.map((a) => a.name)],
        };
      }
      return prev;
    });
  };

  // Remove one instance (by index) or all of a base+variation
  const removeOneFromCart = (id, index = null) => {
    setCart((prevCart) => {
      const prev = { ...prevCart };
      if (!prev[id]) return prev;
      if (index !== null && prev[id].addonsList.length > 1) {
        prev[id].addonsList.splice(index, 1);
        prev[id].quantity -= 1;
      } else {
        delete prev[id];
      }
      return prev;
    });
  };

  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCart((prevCart) => {
      const prev = { ...prevCart };
      delete prev[itemId];
      return prev;
    });
  };

  // Empty Cart
  const clearCart = () => {
    if (window.confirm("Delete all the items of the cart?")) {
      setCart({});
    }
  };

  // Update quantity
  const updateCartItemQuantity = (itemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    
    setCart((prevCart) => {
      const prev = { ...prevCart };
      if (prev[itemId]) {
        prev[itemId].quantity = newQuantity;
      }
      return prev;
    });
  };

  // Toggle veg mode from the profile
  const toggleVegMode = () => {
    const newValue = !vegModeEnabled;
    setVegModeEnabled(newValue);
    localStorage.setItem("vegMode", newValue);
  };

  // Price calculation
  const getCartTotals = () => {
    let baseTotal = 0;
    let addonTotal = 0;
    Object.values(cart).forEach((entry) => {
      const basePrice =
        (parseFloat(entry.price) +
          (entry.variation ? parseFloat(entry.variation.price) || 0 : 0)) *
        entry.quantity;
      baseTotal += basePrice;
      // Check if addons exists and calculate addon prices
      if (entry.addons && Array.isArray(entry.addons)) {
        entry.addons.forEach((addon) => {
          addonTotal += (parseFloat(addon.price) || 0) * entry.quantity;
        });
      }
    });
    return { baseTotal, addonTotal, total: baseTotal + addonTotal };
  };

  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(
    localStorage.getItem(SELECTED_ADDRESS_KEY) || null
  );
  const [addressesLoading, setAddressesLoading] = useState(false);

  const fetchAddresses = async (forceRefresh = false) => {
    setAddressesLoading(true);
    try {
      if (!user?._id) {
        console.log('No user ID available');
        setAddresses([]);
        setAddressesLoading(false);
        return;
      }
      
      console.log('Fetching addresses for user ID:', user._id);
      const response = await fetch(`${API_URL}/api/address/get`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user._id })
      });
      
      const data = await response.json();
      console.log('Address API response:', data);
      
      if (data.success && data.addresses) {
        console.log('Setting addresses:', data.addresses);
        setAddresses(data.addresses);
      } else {
        console.log('No addresses found or API failed');
        setAddresses([]);
      }
    } catch (e) {
      console.error('Error fetching addresses:', e);
      setAddresses([]);
    }
    setAddressesLoading(false);
  };

  const handleAddAddress = async (addressObj) => {
    try {
      if (
        !addressObj.house_no ||
        !addressObj.street ||
        !addressObj.city ||
        !addressObj.state ||
        !addressObj.pincode
      ) {
        alert("Please fill in all required fields");
        return false;
      }
      if (!user?._id) {
        alert("User information is missing. Please log in again.");
        return false;
      }
      
      const response = await fetch(`${API_URL}/api/address/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          ...addressObj
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchAddresses();
        return true;
      } else {
        alert(data.message || 'Failed to add address');
        return false;
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Network error. Please try again.");
      return false;
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      if (!user?._id) {
        alert("User information is missing. Please log in again.");
        return;
      }
      
      const response = await fetch(`${API_URL}/api/address/delete`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user._id,
          addressId: addressId
        })
      });
      
      const data = await response.json();
      if (data.success) {
        await fetchAddresses();
        if (selectedAddressId === addressId) {
          setSelectedAddressId(null);
          localStorage.removeItem(SELECTED_ADDRESS_KEY);
        }
      } else {
        alert(data.message || 'Failed to delete address');
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Network error. Please try again.");
    }
  };

  // Keep selected address in sync with localStorage
  useEffect(() => {
    if (selectedAddressId) {
      localStorage.setItem(SELECTED_ADDRESS_KEY, selectedAddressId);
    }
  }, [selectedAddressId]);

  // Fetch addresses on user change
  useEffect(() => {
    fetchAddresses();
  }, [user]);

  // order placement
  const placeOrder = async () => {
    try {
      if (!user || !user._id) {
        alert("Please log in to place an order");
        return { success: false, message: "User not logged in" };
      }

      if (!selectedAddressId) {
        alert("Please select a delivery address");
        return { success: false, message: "No address selected" };
      }

      const cartItems = Object.values(cart);
      const cartTotals = getCartTotals();

      // Calculate delivery fee and GST
      const deliveryFee = 40; // Fixed delivery fee
      const gstRate = 5; // GST rate as a number (5%)
      const gstAmount = cartTotals.total * (gstRate / 100);

      // Calculate final total including GST and delivery fee
      const finalTotal = cartTotals.total + gstAmount + deliveryFee;

      // Get the actual item IDs from the cart items
      const itemIds = cartItems.map((item) => item._id || item.id).filter(Boolean);

      // is_variation and variation
      const is_variation = cartItems.some((item) => !!item.variation);
      const variation = is_variation
        ? cartItems.map((item) => item.variation || null)
        : null;

      // is_addon and addon
      const is_addon = cartItems.some(
        (item) => Array.isArray(item.addons) && item.addons.length > 0
      );
      const addon = is_addon
        ? cartItems.map((item) => item.addons || [])
        : [];

      // Prepare order data
      const orderData = {
        customer_id: user._id || "mock_id",
        phone: user.phone,
        address_id: selectedAddressId,
        item_ids: itemIds,
        is_variation,
        variation,
        is_addon,
        addon,
        gst: gstRate,
        amount: finalTotal,
        payment_status: "success",
        payment_data: {},
        order_status: 1,
        delivery_partner_id: null,
        delivery_boy: "Own-Delivery",
        order_source: "Online",
        status: "Pending",
      };
      console.log("Order Data:", orderData);

      // Call API to create order
      const response = await fetch(
        `${API_URL}/api/order/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        }
      );

      const result = await response.json();

      if (result.success || result.message === "Order placed") {
        // Clear cart on successful order
        setCart({});
        navigate(`/order-confirmation/${result.orderId || result._id}`);
        return {
          success: true,
          orderId: result.orderId || result._id,
          message: "Order placed successfully",
        };
      } else {
        return {
          success: false,
          message: result.message || "Failed to place order",
        };
      }
    } catch (error) {
      console.error("Error placing order:", error);
      return { success: false, message: "Network error. Please try again." };
    }
  };

  const value = {
    navigate,
    userNumber,
    phone,
    setPhone,
    isValid,
    setIsValid,
    otp,
    setOtp,
    currentUser,
    setCurrentUser,
    setUserNumber,
    foodItem,
    setFoodItem,
    cart,
    addToCart,
    removeFromCart,
    showCartNotification,
    login,
    verifyOTP,
    logout,
    user,
    loading,
    clearCart,
    addToCartWithQuantity,
    getCartTotals,
    addToCartWithAddons,
    removeOneFromCart,
    updateCartItemQuantity,
    getBaseVariationId,
    updateUserProfile,
    vegModeEnabled,
    toggleVegMode,
    refreshUserProfile,
    addresses,
    setSelectedAddressId,
    selectedAddressId,
    fetchAddresses,
    handleAddAddress,
    handleDeleteAddress,
    addressesLoading,
    placeOrder,
  };
  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
  return useContext(AppContext);
};
