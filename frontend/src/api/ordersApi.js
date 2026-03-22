const API_BASE = '/api/orders';

export const createOrder = async (data) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch orders');
  }
  const json = await res.json();
  return json.data.orders;
};

export const getOrderById = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch order');
  }
  const json = await res.json();
  return json.data.order;
};

export const cancelOrder = async (id) => {
  const res = await fetch(`${API_BASE}/${id}/cancel`, {
    method: 'PATCH',
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to cancel order');
  }
  const json = await res.json();
  return json.data.order;
};
