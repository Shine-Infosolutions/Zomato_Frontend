import React from "react";
import FoodCard from "./HomePage/FoodCard";
import { useAppContext } from "../context/AppContext";

const CartPopupDemo = () => {
  const { setFoodItem, navigate } = useAppContext();

  // Sample food items with variations and add-ons
  const sampleFoods = [
    {
      id: "pizza-margherita",
      name: "Margherita Pizza",
      price: "199",
      description: "Fresh tomatoes, mozzarella cheese, and basil",
      image: "/api/placeholder/300/200",
      veg: true,
      rating: 4.6,
      variation: [
        { id: "small", name: "Small", quantity: "8 inch", price: "199" },
        { id: "medium", name: "Medium", quantity: "10 inch", price: "299" },
        { id: "large", name: "Large", quantity: "12 inch", price: "399" }
      ],
      addon: [
        { id: "extra-cheese", name: "Extra Cheese", price: "50" },
        { id: "mushrooms", name: "Mushrooms", price: "40" },
        { id: "olives", name: "Black Olives", price: "30" }
      ]
    },
    {
      id: "biryani-chicken",
      name: "Chicken Biryani",
      price: "220",
      description: "Aromatic basmati rice with tender chicken pieces",
      image: "/api/placeholder/300/200",
      veg: false,
      rating: 4.8,
      variation: [
        { id: "half", name: "Half", quantity: "300g", price: "220" },
        { id: "full", name: "Full", quantity: "500g", price: "350" }
      ],
      addon: [
        { id: "raita", name: "Raita", price: "25" },
        { id: "pickle", name: "Pickle", price: "15" },
        { id: "extra-gravy", name: "Extra Gravy", price: "30" }
      ]
    },
    {
      id: "burger-classic",
      name: "Classic Burger",
      price: "149",
      description: "Juicy beef patty with lettuce, tomato, and cheese",
      image: "/api/placeholder/300/200",
      veg: false,
      rating: 4.4,
      // No variations or add-ons for this item
    }
  ];

  const handleFoodClick = (food) => {
    setFoodItem(food);
    // The AddToCart component will handle showing the popup
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Zomato-like Cart Popup Demo
      </h2>
      <p className="text-gray-600 mb-6 text-center">
        Click "Add" on any item to see the cart popup with variations and quantity selector
      </p>
      
      <div className="flex flex-wrap -mx-2">
        {sampleFoods.map((food) => (
          <FoodCard
            key={food.id}
            food={food}
            onFoodClick={handleFoodClick}
          />
        ))}
      </div>

      <div className="mt-8 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-semibold mb-2">Features Demonstrated:</h3>
        <ul className="text-sm text-gray-600 space-y-1">
          <li>• Zomato-like popup when adding items to cart</li>
          <li>• Quantity selector with + and - buttons</li>
          <li>• Shows existing cart items for the same product</li>
          <li>• Customization button for items with variations/add-ons</li>
          <li>• Smooth animations and transitions</li>
          <li>• Success notification after adding to cart</li>
        </ul>
      </div>
    </div>
  );
};

export default CartPopupDemo;