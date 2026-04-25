const API_BASE = '/api/orders';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
  };
};

export const createOrder = async (data) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create order');
  }
  const json = await res.json();
  return json.data.order;
};

export const getAllOrders = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.studentName) params.append('studentName', filters.studentName);
  if (filters.orderType) params.append('orderType', filters.orderType);

  const query = params.toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;

  const res = await fetch(url, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch orders');
  }
  const json = await res.json();
  return json.data.orders;
};

export const getOrderById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch order');
  }
  const json = await res.json();
  return json.data.order;
};

export const updateOrderStatus = async (id, status) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({ status }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update order status');
  }
  const json = await res.json();
  return json.data.order;
};

export const cancelOrder = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/cancel`, {
    method: 'PATCH',
    headers: getHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to cancel order');
  }
  const json = await res.json();
  return json.data.order;
};
