import React, { useState, useEffect } from "react";
import { FaFilter, FaChevronDown, FaChevronUp, FaStar } from "react-icons/fa";
import { BiSolidLeaf } from "react-icons/bi";
import { fetchFoodItems } from "../../services/api";
import { useAppContext } from "../../context/AppContext";
import { AiOutlineMinus, AiOutlinePlus } from "react-icons/ai";
import AddToCartButton from "../AddToCart";
import axios from "axios";

// Category mapping for display names
// const CATEGORY_NAMES = {
//   1: "Main Course",
//   2: "Lunch Favorites",
//   3: "Dinner Delights",
//   4: "Desserts",
//   5: "Biryani Collection",
//   6: "South Indian",
//   7: "Chinese",
//   8: "Fast Food",
//   9: "Beverages",
//   // Add more categories as needed
// };

const Recommendation = ({ food, onFoodClick, selectedCategory }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [originalCategories, setOriginalCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState("Recommended");
  const [activeQuickFilter, setActiveQuickFilter] = useState(null);
  const [expandedAccordion, setExpandedAccordion] = useState(null);

  const {
    addToCart,
    cart,
    removeFromCart,
    updateCartItemQuantity,
    vegModeEnabled,
  } = useAppContext();

  const getItemQuantityInCart = (itemId) => {
    const cartItem = Object.values(cart).find((item) => item.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  const filterOptions = [
    "All",
    "Recommended",
    "Rating",
    "Price: Low to High",
    "Price: High to Low",
    "Delivery Time",
  ];
  const quickFilters = ["Veg Only", "Non-Veg", "Less than ₹200", "Bestseller"];

  // useEffect(() => {
  //   const runTest = async () => {
  //     let total = 0;
  //     for (let i = 0; i < 50; i++) {
  //       const start = Date.now();
  //       await axios.get(
  //         "https://24-7-b.vercel.app/api/user/category"
  //       );
  //       total += Date.now() - start;
  //     }
  //     console.log("Average Time:", total / 50, "ms");
  //   };

  //   runTest();
  // }, []);

  // Fetch data from API and organize by categories
  // Fetch data from API and organize by categories
  useEffect(() => {
    const loadItems = async () => {
      try {
        setLoading(true);

        // Fetch both items and categories directly without cache
        const [itemsResponse, categoriesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/item/get`).then(res => res.json()),
          fetch(`${import.meta.env.VITE_API_BASE_URL}/api/category/get`).then(res => res.json())
        ]);
        
        // Extract items from response
        const rawItems = itemsResponse.itemsdata || itemsResponse.items || itemsResponse.data || [];
        
        // Format items
        const items = rawItems.map(item => ({
          _id: item._id,
          id: item._id,
          name: item.name,
          categoryId: item.category?._id || item.category,
          price: parseFloat(item.price),
          priceFormatted: `₹${item.price}`,
          rating: item.rating || 4.5,
          image: item.image,
          veg: item.veg,
          description: item.description,
          longDescription: item.longDescription,
          variation: item.variation || [],
          addon: item.addon || []
        }));
        
        console.log('Items fetched:', items);
        console.log('Categories fetched:', categoriesResponse);
        
        // Create category mapping
        const categoryMapping = {};
        let categories = [];
        if (categoriesResponse.success && categoriesResponse.categories) {
          categories = categoriesResponse.categories;
        } else if (Array.isArray(categoriesResponse)) {
          categories = categoriesResponse;
        }
        categories.forEach((category) => {
          const cleanName = (category.category || category.name || 'Category').replace(/"/g, '');
          categoryMapping[category._id] = cleanName;
        });
        
        // If no items, show error
        if (!items || items.length === 0) {
          setError('No items found');
          return;
        }

        // Group items by category
        const groupedItems = items.reduce((acc, item) => {
          const categoryId = item.categoryId ? item.categoryId : 0;
          // Use API category name if available, otherwise use a default name
          const categoryName = categoryMapping[categoryId] || 'Other Items';

          if (!acc[categoryName]) {
            acc[categoryName] = {
              name: categoryName,
              items: [],
            };
          }

          // Add bestseller flag based on rating
          const enhancedItem = {
            ...item,
            price: parseFloat(item.price),
            bestseller: item.rating >= 4.6,
            deliveryTime: Math.floor(Math.random() * 20) + 20, // Random delivery time between 20-40 mins
          };

          acc[categoryName].items.push(enhancedItem);
          return acc;
        }, {});

        const categoriesArray = Object.values(groupedItems);
        setOriginalCategories(categoriesArray);
        setFilteredCategories(categoriesArray);
        setExpandedAccordion(categoriesArray[0]?.name); // Expand first category by default
      } catch (err) {
        setError("Failed to load recommendations");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadItems();
  }, []);

  // Apply filters and sorting to categories
  useEffect(() => {
    // Create a deep copy of the original categories
    let newCategories = JSON.parse(JSON.stringify(originalCategories));

    // First apply veg mode filter if enabled
    if (vegModeEnabled) {
      newCategories = newCategories.map((category) => {
        const vegItems = category.items.filter((item) => item.veg === true);
        return { ...category, items: vegItems };
      });
    }

    // Apply quick filter if active
    if (activeQuickFilter) {
      newCategories = newCategories.map((category) => {
        const filteredItems = category.items.filter((item) => {
          switch (activeQuickFilter) {
            case "Veg Only":
              return item.veg;
            case "Non-Veg":
              return !item.veg;
            case "Less than ₹200":
              return item.price < 200;
            case "Bestseller":
              return item.bestseller;
            default:
              return true;
          }
        });
        return { ...category, items: filteredItems };
      });
    }

    // Apply sorting based on active filter
    newCategories = newCategories.map((category) => {
      let sortedItems = [...category.items];

      switch (activeFilter) {
        case "Rating":
          sortedItems.sort((a, b) => b.rating - a.rating);
          break;
        case "Price: Low to High":
          sortedItems.sort((a, b) => a.price - b.price);
          break;
        case "Price: High to Low":
          sortedItems.sort((a, b) => b.price - a.price);
          break;
        case "Delivery Time":
          sortedItems.sort((a, b) => a.deliveryTime - b.deliveryTime);
          break;
        case "All":
          // No sorting, keep original order
          break;
        case "Recommended":
        default:
          // For recommended, prioritize bestsellers and higher ratings
          sortedItems.sort((a, b) => {
            if (a.bestseller && !b.bestseller) return -1;
            if (!a.bestseller && b.bestseller) return 1;
            return b.rating - a.rating;
          });
          break;
      }

      return { ...category, items: sortedItems };
    });

    // Filter out categories with no items
    newCategories = newCategories.filter(
      (category) => category.items.length > 0
    );

    setFilteredCategories(newCategories);
  }, [activeFilter, activeQuickFilter, originalCategories, vegModeEnabled]);

  // Effect to handle selected category changes
  useEffect(() => {
    if (selectedCategory && filteredCategories.length > 0) {
      // Find the category with matching name
      const categoryToExpand = filteredCategories.find(
        (cat) => cat.name === selectedCategory.name
      );

      if (categoryToExpand) {
        setExpandedAccordion(categoryToExpand.name);
      }
    }
  }, [selectedCategory, filteredCategories]);

  // Toggle filter dropdown
  const toggleFilter = () => {
    setIsFilterOpen(!isFilterOpen);
  };

  // Select filter option
  const selectFilter = (filter) => {
    setActiveFilter(filter);
    setIsFilterOpen(false);
  };

  // Toggle accordion
  const toggleAccordion = (categoryName) => {
    if (expandedAccordion === categoryName) {
      setExpandedAccordion(null);
    } else {
      setExpandedAccordion(categoryName);
    }
  };

  // Toggle quick filter
  const toggleQuickFilter = (filter) => {
    if (activeQuickFilter === filter) {
      setActiveQuickFilter(null);
    } else {
      setActiveQuickFilter(filter);
    }
  };

  // Check if a non-default filter is active
  const isNonDefaultFilterActive = activeFilter !== "Recommended" && activeFilter !== "All";

  if (loading) {
    return <div className="p-3 bg-white">Loading recommendations...</div>;
  }

  if (error) {
    return <div className="p-3 bg-white text-red-500">{error}</div>;
  }

  const handleItemClick = (item) => {
    if (onFoodClick) {
      onFoodClick(item);
    }
  };

  return (
    <div className="p-3 bg-white">
      <h2 className="text-lg font-semibold mb-4">Recommendations</h2>

      {/* Filter section */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          {/* Filter dropdown */}
          <div className="relative">
            <button
              className={`flex items-center gap-2 border rounded-2xl px-3 py-1 text-xs mr-1 transition-colors ${
                isNonDefaultFilterActive
                  ? "border-red-800 bg-red-50 text-red-800"
                  : "border-gray-300 text-gray-700"
              }`}
              onClick={toggleFilter}
            >
              <FaFilter
                className={
                  isNonDefaultFilterActive ? "text-red-800" : "text-gray-500"
                }
              />
              <span>Filter</span>
              <FaChevronDown
                className={`transition-transform ${
                  isFilterOpen ? "rotate-180" : ""
                } ${
                  isNonDefaultFilterActive ? "text-red-800" : "text-gray-500"
                }`}
              />
            </button>

            {/* Filter dropdown menu */}
            {isFilterOpen && (
              <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-20">
                {filterOptions.map((option) => (
                  <button
                    key={option}
                    className={`block w-full text-left px-4 py-2 text-sm hover:bg-gray-100 ${
                      activeFilter === option
                        ? "bg-red-50 text-red-800 font-medium"
                        : ""
                    }`}
                    onClick={() => selectFilter(option)}
                  >
                    {option}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick filter chips */}
          <div
            className="flex gap-2 overflow-x-auto"
            style={{ scrollbarWidth: "none" }}
          >
            {quickFilters.map((filter) => (
              <button
                key={filter}
                className={`whitespace-nowrap text-xs border rounded-full px-3 py-1 transition-colors ${
                  activeQuickFilter === filter
                    ? "bg-red-800 text-white border-red-800"
                    : "border-gray-300 hover:bg-gray-100"
                }`}
                onClick={() => toggleQuickFilter(filter)}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Category accordions */}
      <div className="space-y-3">
        {filteredCategories.length > 0 ? (
          filteredCategories.map((category) => (
            <div
              key={category.name}
              className="border-b-gray-200 rounded-md overflow-hidden"
            >
              {/* Accordion header */}
              <button
                className="w-full flex items-center justify-between p-3 bg-gray-50 text-left"
                onClick={() => toggleAccordion(category.name)}
              >
                <span className="font-medium">
                  {category.name} ({category.items.length})
                </span>
                {expandedAccordion === category.name ? (
                  <FaChevronUp />
                ) : (
                  <FaChevronDown />
                )}
              </button>

              {/* Accordion content */}
              {expandedAccordion === category.name && (
                <div className="p-3 space-y-4">
                  {category.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-3 cursor-pointer"
                      onClick={(e) => handleItemClick(item, e)}
                    >
                      {/* Item image */}
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />

                      {/* Item details */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-medium flex items-center">
                              {item.name}
                              {item.veg && (
                                <span className="ml-1 inline-block border border-green-600 p-0.5">
                                  <BiSolidLeaf className="text-green-600 text-xs" />
                                </span>
                              )}
                              {item.bestseller && (
                                <span className="ml-1 text-xs bg-yellow-100 text-yellow-800 px-1 rounded">
                                  Bestseller
                                </span>
                              )}
                            </h3>
                            <div className="flex items-center gap-1 mt-1">
                              <span className="bg-green-600 text-white text-xs px-1 rounded flex items-center">
                                {item.rating}{" "}
                                <FaStar className="ml-0.5 text-[8px]" />
                              </span>
                              <span className="text-xs text-gray-500">
                                • {item.deliveryTime || 30}-
                                {(item.deliveryTime || 30) + 5} mins
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">
                              {item.priceFormatted || `₹${item.price}`}
                            </div>
                            <div className="item-actions">
                              <AddToCartButton
                                item={item}
                                onFoodClick={() => onFoodClick(item)}
                              />
                            </div>
                            {/* {getItemQuantityInCart(item.id) > 0 ? (
                              <div className="mt-1 flex items-center justify-end">
                                <button
                                  className="w-6 h-6 bg-red-800 text-white rounded-l-md flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentQty = getItemQuantityInCart(
                                      item.id
                                    );
                                    if (currentQty === 1) {
                                      removeFromCart(item.id);
                                    } else {
                                      updateCartItemQuantity(
                                        item.id,
                                        currentQty - 1
                                      );
                                    }
                                  }}
                                >
                                  <AiOutlineMinus size={12} />
                                </button>
                                <span className="w-6 h-6 bg-white border-t border-b border-gray-300 flex items-center justify-center text-xs">
                                  {getItemQuantityInCart(item.id)}
                                </span>
                                <button
                                  className="w-6 h-6 bg-red-800 text-white rounded-r-md flex items-center justify-center"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentQty = getItemQuantityInCart(
                                      item.id
                                    );
                                    updateCartItemQuantity(
                                      item.id,
                                      currentQty + 1
                                    );
                                  }}
                                >
                                  <AiOutlinePlus size={12} />
                                </button>
                              </div>
                            ) : (
                              <button
                                className="mt-1 bg-white border border-red-800 text-red-800 text-xs px-3 py-1 rounded-md hover:bg-red-800 hover:text-white transition-colors"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  addToCart(item);
                                }}
                              >
                                Add
                              </button>
                            )} */}
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-4 text-gray-500">
            No items match your filters
          </div>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
