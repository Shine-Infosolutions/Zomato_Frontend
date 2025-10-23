# Zomato-like Cart Popup Implementation

This implementation provides a Zomato-style cart popup that appears when users add items to their cart, complete with variations, quantity selection, and customization options.

## Components Added

### 1. ZomatoCartPopup.jsx
The main popup component that displays when adding items to cart.

**Features:**
- Quantity selector with +/- buttons
- Shows existing cart items for the same product
- Customization button for items with variations/add-ons
- Smooth slide-up animation
- Price calculation with quantity

### 2. CartNotification.jsx
A simple notification that appears after successfully adding items to cart.

**Features:**
- Green success notification
- Auto-dismisses after 2 seconds
- Smooth fade-in/out animation

### 3. CartPopupDemo.jsx
Demo component showcasing the functionality with sample data.

## Updated Components

### AddToCart.jsx
Enhanced to show the popup instead of directly adding items.

**Changes:**
- Shows ZomatoCartPopup on "Add" button click
- Shows VariationPage for customization
- Handles both new items and quantity changes

## How It Works

1. **User clicks "Add" button** → ZomatoCartPopup appears
2. **User selects quantity** → Updates in real-time
3. **User clicks "Add ₹X"** → Item added to cart + notification shown
4. **User clicks "Customize"** → VariationPage opens for detailed customization

## Usage Example

```jsx
import AddToCartButton from './components/AddToCart';

const FoodItem = ({ item }) => {
  const handleFoodClick = (food) => {
    // This will be called when customization is needed
    console.log('Customize:', food);
  };

  return (
    <div>
      <h3>{item.name}</h3>
      <p>₹{item.price}</p>
      <AddToCartButton item={item} onFoodClick={handleFoodClick} />
    </div>
  );
};
```

## Food Item Structure

For full functionality, food items should have this structure:

```javascript
{
  id: "unique-id",
  name: "Item Name",
  price: "199",
  description: "Item description",
  image: "image-url",
  veg: true/false,
  rating: 4.5,
  variation: [
    { id: "small", name: "Small", quantity: "8 inch", price: "199" },
    { id: "medium", name: "Medium", quantity: "10 inch", price: "299" }
  ],
  addon: [
    { id: "extra-cheese", name: "Extra Cheese", price: "50" },
    { id: "mushrooms", name: "Mushrooms", price: "40" }
  ]
}
```

## Styling

The components use Tailwind CSS classes and custom animations defined in `index.css`:

- `slideUpFadeIn` - For popup entrance
- `bounceIn` - For notification entrance
- `fadeInOverlay` - For backdrop fade

## Integration

The popup is automatically integrated with your existing cart system through the `useAppContext` hook. No additional setup required beyond importing the components.

## Demo

To see the popup in action, import and use the `CartPopupDemo` component:

```jsx
import CartPopupDemo from './components/CartPopupDemo';

function App() {
  return <CartPopupDemo />;
}
```