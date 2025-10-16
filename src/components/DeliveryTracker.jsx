import React, { useState, useEffect } from 'react';
import { FaTimes, FaMotorcycle, FaCheckCircle, FaClock } from 'react-icons/fa';

const DeliveryTracker = ({ isOpen, onClose, customerLocation, restaurantLocation, orderStatus = 'preparing' }) => {
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(restaurantLocation);
  const [distanceToCustomer, setDistanceToCustomer] = useState(null);
  const [estimatedTime, setEstimatedTime] = useState(25);
  const [currentStatus, setCurrentStatus] = useState(orderStatus);
  const [deliveryBoyName] = useState('Rahul Kumar');
  const [deliveryBoyPhone] = useState('+91 98765 43210');

  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  // Simulate order status progression and delivery boy movement
  useEffect(() => {
    if (!isOpen) return;

    const statusProgression = [
      { status: 'preparing', duration: 8000, message: 'Restaurant is preparing your order' },
      { status: 'ready', duration: 3000, message: 'Order is ready for pickup' },
      { status: 'picked_up', duration: 2000, message: 'Delivery partner has picked up your order' },
      { status: 'on_the_way', duration: 20000, message: 'On the way to your location' },
      { status: 'delivered', duration: 0, message: 'Order delivered successfully!' }
    ];

    let currentIndex = statusProgression.findIndex(s => s.status === currentStatus);
    
    const progressStatus = () => {
      if (currentIndex < statusProgression.length - 1) {
        setTimeout(() => {
          currentIndex++;
          setCurrentStatus(statusProgression[currentIndex].status);
          if (statusProgression[currentIndex].status === 'picked_up') {
            setDeliveryBoyLocation(restaurantLocation);
          }
          progressStatus();
        }, statusProgression[currentIndex].duration);
      }
    };

    progressStatus();

    // Movement simulation when on the way
    const moveInterval = setInterval(() => {
      if (currentStatus === 'on_the_way' || currentStatus === 'picked_up') {
        setDeliveryBoyLocation(prev => {
          const targetLat = customerLocation.lat;
          const targetLng = customerLocation.lng;
          
          // Move towards customer location
          const stepLat = (targetLat - prev.lat) * 0.1;
          const stepLng = (targetLng - prev.lng) * 0.1;
          
          const newLat = prev.lat + stepLat + (Math.random() - 0.5) * 0.0005;
          const newLng = prev.lng + stepLng + (Math.random() - 0.5) * 0.0005;
          
          const distance = calculateDistance(newLat, newLng, customerLocation.lat, customerLocation.lng);
          setDistanceToCustomer(distance);
          setEstimatedTime(Math.max(1, Math.round(distance * 4))); // 4 minutes per km
          
          return { lat: newLat, lng: newLng };
        });
      }
    }, 3000);

    return () => clearInterval(moveInterval);
  }, [isOpen, customerLocation, currentStatus, restaurantLocation]);

  useEffect(() => {
    let mapInstance = null;

    if (isOpen) {
      const initMap = () => {
        const mapContainer = document.getElementById('delivery-tracker-map');
        
        if (!mapContainer) {
          setTimeout(initMap, 200);
          return;
        }
        
        if (!window.mappls && !window.MapmyIndia) {
          mapContainer.className = 'bg-gradient-to-br from-green-100 to-blue-100 relative';
          mapContainer.innerHTML = `
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
              <div class="text-3xl mb-2">🏍️</div>
              <div class="text-gray-700 font-medium">Delivery Tracking</div>
              <div class="text-xs text-gray-500 mt-1">Distance: ${distanceToCustomer?.toFixed(2) || '0.00'} km</div>
            </div>
          `;
          return;
        }
        
        const mapAPI = window.mappls || window.MapmyIndia;
        
        mapInstance = new mapAPI.Map('delivery-tracker-map', {
          center: [deliveryBoyLocation.lng, deliveryBoyLocation.lat],
          zoom: 14,
          zoomControl: true,
          scrollwheel: true
        });
        
        setTimeout(() => {
          try {
            if (window.L && window.L.marker) {
              // Restaurant marker
              window.L.marker([restaurantLocation.lat, restaurantLocation.lng]).addTo(mapInstance);
              
              // Customer marker
              window.L.marker([customerLocation.lat, customerLocation.lng]).addTo(mapInstance);
              
              // Delivery boy marker
              window.L.marker([deliveryBoyLocation.lat, deliveryBoyLocation.lng]).addTo(mapInstance);
            }
          } catch (error) {
            console.error('Error creating markers:', error);
          }
        }, 1000);
      };
      
      setTimeout(initMap, 500);
    }

    return () => {
      if (mapInstance) {
        try {
          mapInstance.remove();
        } catch (e) {
          console.log('Map cleanup error:', e);
        }
      }
    };
  }, [isOpen, deliveryBoyLocation, customerLocation, restaurantLocation]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b bg-green-50">
          <div>
            <h2 className="text-lg font-semibold text-green-800">Track Your Order</h2>
            <p className="text-sm text-green-600">{deliveryBoyName} • {deliveryBoyPhone}</p>
          </div>
          <button onClick={onClose} className="text-gray-500">
            <FaTimes />
          </button>
        </div>

        <div className="relative">
          <div
            id="delivery-tracker-map"
            className="w-full h-[300px] relative bg-gray-100"
          ></div>
          
          <div className="absolute bottom-2 left-2 bg-white px-2 py-1 rounded text-xs shadow">
            🍽️ Restaurant | 📍 You | 🏍️ {deliveryBoyName}
          </div>
          
          {currentStatus === 'delivered' && (
            <div className="absolute inset-0 bg-green-500 bg-opacity-90 flex items-center justify-center">
              <div className="text-center text-white">
                <FaCheckCircle className="text-4xl mb-2 mx-auto" />
                <p className="text-lg font-semibold">Order Delivered!</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4">
          {/* Order Status */}
          <div className="mb-4">
            <div className="flex items-center space-x-2 mb-2">
              <FaClock className="text-orange-500" />
              <span className="font-medium text-gray-800">
                {currentStatus === 'preparing' && 'Preparing your order...'}
                {currentStatus === 'ready' && 'Order ready for pickup'}
                {currentStatus === 'picked_up' && 'Order picked up'}
                {currentStatus === 'on_the_way' && 'On the way to you'}
                {currentStatus === 'delivered' && 'Order delivered!'}
              </span>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
              <div 
                className="bg-green-500 h-2 rounded-full transition-all duration-1000"
                style={{
                  width: `${{
                    preparing: '25%',
                    ready: '50%', 
                    picked_up: '75%',
                    on_the_way: '90%',
                    delivered: '100%'
                  }[currentStatus]}`
                }}
              ></div>
            </div>
          </div>
          
          {/* Distance and Time - only show when on the way */}
          {(currentStatus === 'on_the_way' || currentStatus === 'picked_up') && distanceToCustomer && (
            <>
              <div className="mb-3">
                <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                  <span className="text-sm font-medium">Distance</span>
                  <span className="text-sm font-bold text-blue-600">{distanceToCustomer.toFixed(1)} km</span>
                </div>
              </div>
              
              <div className="mb-4">
                <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                  <span className="text-sm font-medium">Estimated Time</span>
                  <span className="text-sm font-bold text-orange-600">{estimatedTime} min</span>
                </div>
              </div>
            </>
          )}
          
          {/* Call Button */}
          <div className="flex gap-2">
            <button
              onClick={() => window.open(`tel:${deliveryBoyPhone}`)}
              className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-medium"
            >
              Call {deliveryBoyName.split(' ')[0]}
            </button>
            <button
              onClick={onClose}
              className="flex-1 py-2 bg-gray-600 text-white rounded-lg font-medium"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeliveryTracker;