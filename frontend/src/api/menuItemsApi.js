const API_BASE = '/api/menu-items';

export const getAllMenuItems = async (filters = {}) => {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.vendor) params.append('vendor', filters.vendor);
  if (filters.available !== undefined)
    params.append('available', filters.available);

  const query = params.toString();
  const url = query ? `${API_BASE}?${query}` : API_BASE;

  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to fetch menu items');
  }
  const json = await res.json();
  return json.data.menuItems;
};

export const createMenuItem = async (data) => {
  const res = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to create menu item');
  }
  const json = await res.json();
  return json.data.menuItem;
};

export const updateMenuItem = async (id, data) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to update menu item');
  }
  const json = await res.json();
  return json.data.menuItem;
};

export const deleteMenuItem = async (id) => {
  const res = await fetch(`${API_BASE}/${id}`, {
    method: 'DELETE',
  });
  if (!res.ok && res.status !== 204) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'Failed to delete menu item');
  }
};
