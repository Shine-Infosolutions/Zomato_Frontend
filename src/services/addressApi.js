const API_URL = "https://24-7-b.vercel.app/api/address";

export const addAddress = async (addressData) => {
  try {
    const response = await fetch(`${API_URL}/add`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    return await response.json();
  } catch (error) {
    console.error('Add address error:', error);
    return { success: false, message: 'Network error' };
  }
};

export const getAddresses = async (userId) => {
  try {
    const response = await fetch(`${API_URL}/get`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Get addresses error:', error);
    return { success: false, message: 'Network error' };
  }
};

export const updateAddress = async (addressData) => {
  try {
    const response = await fetch(`${API_URL}/update`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });
    return await response.json();
  } catch (error) {
    console.error('Update address error:', error);
    return { success: false, message: 'Network error' };
  }
};

export const deleteAddress = async (userId, addressId) => {
  try {
    const response = await fetch(`${API_URL}/delete`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, addressId }),
    });
    return await response.json();
  } catch (error) {
    console.error('Delete address error:', error);
    return { success: false, message: 'Network error' };
  }
};