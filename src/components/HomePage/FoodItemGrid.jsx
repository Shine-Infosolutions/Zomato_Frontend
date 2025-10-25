import React, { useMemo } from "react";
import FoodCard from "./FoodCard";
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
  const { vegModeEnabled, items, itemsLoading } = useAppContext();

  // Sort food items by rating in descending order and take only the top 6
  // const topRatedFoodItems = [...foodItems]
  //   .sort((a, b) => b.rating - a.rating)
  //   .slice(0, 6);

  // Format items for display
  const foodItems = items.map(item => ({
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
      {itemsLoading && (
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

      {/* Flex layout with exactly 3 cards per row */}
      {!itemsLoading && (
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
