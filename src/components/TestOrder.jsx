import React from 'react';
import { useAppContext } from '../context/AppContext';

const TestOrder = () => {
  const { user, placeOrder } = useAppContext();

  const handleTestOrder = async () => {
    if (!user) return alert('Please login first');
    const result = await placeOrder();
    alert(result.success ? 'Test order placed!' : 'Failed: ' + result.message);
  };

  return (
    <div className="p-4 bg-white rounded shadow">
      <h3 className="font-medium mb-2">Test WebSocket</h3>
      <button
        onClick={handleTestOrder}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400"
        disabled={!user}
      >
        {user ? 'Test Order' : 'Login Required'}
      </button>
    </div>
  );
};

export default TestOrder;