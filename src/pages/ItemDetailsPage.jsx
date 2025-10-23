import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAppContext } from "../context/AppContext";
import { BsArrowLeft } from "react-icons/bs";
import { BiSolidLeaf } from "react-icons/bi";
import { FaStar } from "react-icons/fa";
import { AiOutlinePlus, AiOutlineMinus } from "react-icons/ai";

const ItemDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { 
    addToCartWithQuantity, 
    cart, 
    getBaseVariationId 
  } = useAppContext();
  
  const [item, setItem] = useState(null);
  const [selectedVariation, setSelectedVariation] = useState(null);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [quantity, setQuantity] = useState(1);
  const [cookingRequest, setCookingRequest] = useState("");

  useEffect(() => {
    const loadItem = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/item/get`);
        const data = await response.json();
        const itemsData = data.itemsdata || data.items || data.data || [];
        
        const foundItem = itemsData.find(item => item._id === id);
        if (foundItem) {

          setItem(foundItem);
          setSelectedVariation(foundItem.variation?.[0] || null);
        }
      } catch (error) {
        console.error('Error loading item:', error);
      }
    };
    
    if (id) {
      loadItem();
    }
  }, [id]);

  if (!item) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading...</div>
      </div>
    );
  }

  const getBasePrice = () => {
    if (selectedVariation) {
      return parseFloat(selectedVariation.price);
    }
    return parseFloat(item.price || 0);
  };

  const getAddonPrice = () => {
    return selectedAddons.reduce(
      (total, addon) => total + parseFloat(addon.price || 0),
      0
    );
  };

  const getTotalPrice = () => {
    return (getBasePrice() + getAddonPrice()) * quantity;
  };

  const handleVariationSelect = (variation) => {
    setSelectedVariation(variation);
  };

  const handleAddonToggle = (addon) => {
    setSelectedAddons(prev => {
      const exists = prev.find(a => a._id === addon._id);
      if (exists) {
        return prev.filter(a => a._id !== addon._id);
      } else {
        return [...prev, addon];
      }
    });
  };

  const handleAddToCart = () => {
    const variationId = selectedVariation?._id || "default";
    const addonIds = selectedAddons
      .map(addon => addon._id)
      .sort()
      .join("-");

    const uniqueId = `${item._id}-${variationId}${addonIds ? `-${addonIds}` : ""}`;

    const variationText = selectedVariation
      ? `${selectedVariation.name} (${selectedVariation.quantity})`
      : "";
    const addonText = selectedAddons.length > 0
      ? `+ ${selectedAddons.map(addon => addon.name).join(", ")}`
      : "";

    const itemWithSelections = {
      ...item,
      id: uniqueId,
      price: (getBasePrice() + getAddonPrice()).toString(),
      selectedVariation,
      selectedAddons,
      variationDetails: variationText,
      addonDetails: addonText,
      cookingRequest
    };

    addToCartWithQuantity(itemWithSelections, quantity);
    navigate(-1);
  };

  return (
    <div className="min-h-screen bg-white max-w-md mx-auto">
      {/* Header */}
      <div className="sticky top-0 bg-white z-10 p-4 border-b">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600"
        >
          <BsArrowLeft size={20} />
        </button>
      </div>

      {/* Item Image and Basic Info */}
      <div className="p-4">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              {item.veg && (
                <div className="bg-green-200 inline-block text-[10px] rounded-xl p-1">
                  <BiSolidLeaf className="inline text-green-600" />
                  <span className="text-green-600 ml-1">Pure Veg</span>
                </div>
              )}
              {item.rating && (
                <div className="bg-green-600 text-white rounded-2xl flex items-center px-2 py-1 text-xs">
                  <span>{item.rating}</span>
                  <FaStar className="ml-1" size={10} />
                </div>
              )}
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">{item.name}</h1>
            <p className="text-gray-600 text-sm mb-2">{item.description}</p>
            {item.longDescription && (
              <p className="text-gray-500 text-xs mb-3">{item.longDescription}</p>
            )}
          </div>
          {item.image && (
            <img 
              src={item.image} 
              alt={item.name}
              className="w-24 h-24 rounded-lg object-cover ml-4"
            />
          )}
        </div>
      </div>

      {/* Variations */}
      {item.variation && item.variation.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Size</h3>
          <p className="text-xs text-gray-500 mb-3">Select any 1 option</p>
          <div className="space-y-2">
            {item.variation.map((variation) => (
              <div 
                key={variation._id}
                onClick={() => handleVariationSelect(variation)}
                className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer ${
                  selectedVariation?._id === variation._id 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                    selectedVariation?._id === variation._id 
                      ? 'border-red-500 bg-red-500' 
                      : 'border-gray-300'
                  }`}>
                    {selectedVariation?._id === variation._id && (
                      <div className="w-2 h-2 bg-white rounded-full m-0.5"></div>
                    )}
                  </div>
                  <div>
                    <span className="font-medium">{variation.name}</span>
                    <p className="text-xs text-gray-500">{variation.quantity}</p>
                  </div>
                </div>
                <span className="font-semibold">₹{variation.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add-ons */}
      {item.addon && item.addon.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100">
          <h3 className="font-semibold text-gray-800 mb-3">Toppings</h3>
          <p className="text-xs text-gray-500 mb-3">Select up to {item.addon.length} options</p>
          <div className="space-y-2">
            {item.addon.map((addon, index) => {
              // Handle both populated objects and ObjectId strings
              const addonId = typeof addon === 'object' ? addon._id : addon;
              const addonName = typeof addon === 'object' ? addon.name : `Addon ${index + 1}`;
              const addonPrice = typeof addon === 'object' ? addon.price : 0;
              
              return (
                <div 
                  key={addonId}
                  onClick={() => {
                    if (typeof addon === 'object') {
                      handleAddonToggle(addon);
                    }
                  }}
                  className={`flex items-center justify-between p-3 border rounded-lg ${
                    typeof addon === 'object' ? 'cursor-pointer' : 'cursor-not-allowed opacity-50'
                  } ${
                    selectedAddons.find(a => a._id === addonId)
                      ? 'border-red-500 bg-red-50' 
                      : 'border-gray-200'
                  }`}
                >
                  <div className="flex items-center">
                    <div className={`w-4 h-4 border-2 mr-3 ${
                      selectedAddons.find(a => a._id === addonId)
                        ? 'border-red-500 bg-red-500' 
                        : 'border-gray-300'
                    }`}>
                      {selectedAddons.find(a => a._id === addonId) && (
                        <div className="text-white text-xs flex items-center justify-center">✓</div>
                      )}
                    </div>
                    <div>
                      <span className="font-medium">{addonName}</span>
                      {typeof addon === 'string' && (
                        <p className="text-xs text-red-500">ID: {addon}</p>
                      )}
                    </div>
                  </div>
                  <span className="font-semibold">₹{addonPrice}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Cooking Request */}
      <div className="px-4 py-3 border-t border-gray-100">
        <h3 className="font-semibold text-gray-800 mb-3">Add a cooking request (optional)</h3>
        <textarea
          value={cookingRequest}
          onChange={(e) => setCookingRequest(e.target.value)}
          placeholder="e.g. Don't make it too spicy"
          className="w-full p-3 border border-gray-200 rounded-lg text-sm resize-none"
          rows="3"
        />
      </div>

      {/* Bottom Section - Quantity and Add to Cart */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-white border-t p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center border border-gray-300 rounded-lg">
            <button
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="p-2 text-gray-600"
              disabled={quantity <= 1}
            >
              <AiOutlineMinus size={16} />
            </button>
            <span className="px-4 py-2 font-semibold">{quantity}</span>
            <button
              onClick={() => setQuantity(quantity + 1)}
              className="p-2 text-gray-600"
            >
              <AiOutlinePlus size={16} />
            </button>
          </div>
        </div>
        
        <button
          onClick={handleAddToCart}
          className="w-full bg-red-500 text-white py-3 rounded-lg font-semibold text-lg"
        >
          Add to Cart ₹{getTotalPrice().toFixed(0)}
        </button>
      </div>

      {/* Bottom padding to account for fixed button */}
      <div className="h-32"></div>
    </div>
  );
};

export default ItemDetailsPage;