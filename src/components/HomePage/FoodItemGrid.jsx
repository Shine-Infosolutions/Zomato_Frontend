import React, { useMemo, useState, useEffect } from "react";
import FoodCard from "./FoodCard";
import { fetchFoodItems } from "../../services/api";
import { useAppContext } from "../../context/AppContext";

// Skeleton card
const SkeletonCard = () => (
  <div className="bg-white rounded-lg shadow-md overflow-hidden h-64 animate-pulse">
    <div className="bg-gray-300 h-32 w-full"></div>
    <div className="p-3">
      <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-6 bg-gray-300 rounded w-1/4"></div>
        <div className="h-8 bg-gray-300 rounded-full w-8"></div>
      </div>
    </div>
  </div>
);

const FoodItemGrid = ({ onFoodClick, searchFilter }) => {
  const [foodItems, setFoodItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { vegModeEnabled } = useAppContext();

  // Sort food items by rating in descending order and take only the top 6
  // const topRatedFoodItems = [...foodItems]
  //   .sort((a, b) => b.rating - a.rating)
  //   .slice(0, 6);

  useEffect(() => {
    const loadFoodItems = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/item/get`);
        const data = await response.json();
        
        console.log('FoodItemGrid - Raw response:', data);
        
        // Handle both array and object responses
        const items = Array.isArray(data) ? data : (data.itemsdata || data.items || data.data || []);
        
        console.log('FoodItemGrid - Extracted items:', items);
        
        if (!items || items.length === 0) {
          console.warn('FoodItemGrid - No items found');
          setError('No items available');
          return;
        }
        
        // Format items for display
        const formattedItems = items.map(item => ({
          _id: item._id,
          id: item._id,
          name: item.name,
          price: parseFloat(item.price),
          priceFormatted: `₹${item.price}`,
          image: item.image,
          veg: item.veg,
          rating: item.rating || 4.5,
          description: item.description,
          categoryId: item.category?._id || item.category,
          variation: item.variation || [],
          addon: item.addon || []
        }));
        
        console.log('FoodItemGrid - Formatted items:', formattedItems);
        setFoodItems(formattedItems);
        setError(null);
      } catch (err) {
        setError("Failed to load food items");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadFoodItems();
  }, []);

  // Filter items based on veg mode and search filter
  const filteredItems = useMemo(() => {
    let items = foodItems;
    
    // Apply veg mode filter
    if (vegModeEnabled) {
      items = items.filter((item) => item.veg === true);
    }
    
    // Apply search filter
    if (searchFilter && searchFilter.trim()) {
      items = items.filter((item) => 
        item.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchFilter.toLowerCase())
      );
    }
    
    return items;
  }, [foodItems, vegModeEnabled, searchFilter]);

  // Sort filtered items by rating
  const topItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => b.rating - a.rating);
  }, [filteredItems]);

  return (
    <div className="mt-8 px-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Dishes For You</h2>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-wrap -mx-2">
          <div className="w-1/3 p-2">
            <SkeletonCard />
          </div>
          <div className="w-1/3 p-2">
            <SkeletonCard />
          </div>
          <div className="w-1/3 p-2">
            <SkeletonCard />
          </div>
          <div className="w-1/3 p-2">
            <SkeletonCard />
          </div>
          <div className="w-1/3 p-2">
            <SkeletonCard />
          </div>
          <div className="w-1/3 p-2">
            <SkeletonCard />
          </div>
        </div>
      )}

      {/* Error state */}
      {error && <div className="text-red-500 text-center py-8">{error}</div>}

      {/* Flex layout with exactly 3 cards per row */}
      {!loading && !error && (
        <div className="flex flex-wrap -mx-2">
          {topItems.map((food) => (
            <FoodCard key={food.id} food={food} onFoodClick={onFoodClick} />
          ))}
        </div>
      )}
    </div>
  );
};

export default FoodItemGrid;
