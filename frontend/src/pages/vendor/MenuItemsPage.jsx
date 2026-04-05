import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  getAllMenuItems,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} from '../../api/menuItemsApi.js';
import { Navbar } from '../../components/layout/Navbar';
import '../../styles/MenuItemsPage.css';

const CATEGORIES = ['all', 'rice', 'snack', 'beverage', 'dessert', 'other'];
const CATEGORY_EMOJIS = {
  rice: '🍚',
  snack: '🍟',
  beverage: '🥤',
  dessert: '🍰',
  other: '📦',
};

const EMPTY_FORM = {
  name: '',
  description: '',
  price: '',
  category: 'rice',
  preparationTime: '',
  image: '',
  available: true,
};

// Hardcoded vendor ID for now (will be replaced with auth context later)
const VENDOR_ID = '6839e6f3ee5b0e8b74bfda91';

export default function MenuItemsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [brokenImages, setBrokenImages] = useState({});

  // modal state
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);

  // delete confirm
  const [deleteTarget, setDeleteTarget] = useState(null);

  // toast
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl || !imageUrl.trim()) return null;

    const trimmed = imageUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;

    const backendOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:3000';
    if (trimmed.startsWith('/')) {
      return `${backendOrigin}${trimmed}`;
    }

    return `${backendOrigin}/${trimmed}`;
  };

  /* ---- fetch ---- */
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const filters = {};
      if (activeCategory !== 'all') filters.category = activeCategory;
      const data = await getAllMenuItems(filters);
      setItems(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  /* ---- form helpers ---- */
  const openAddModal = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setShowModal(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setForm({
      name: item.name || '',
      description: item.description || '',
      price: item.price?.toString() || '',
      category: item.category || 'rice',
      preparationTime: item.preparationTime?.toString() || '',
      image: item.image || '',
      available: item.available ?? true,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingItem(null);
    setForm(EMPTY_FORM);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        category: form.category,
        preparationTime: form.preparationTime
          ? Number(form.preparationTime)
          : undefined,
        image: form.image.trim() || undefined,
        available: form.available,
        vendor: VENDOR_ID,
      };

      if (editingItem) {
        const updated = await updateMenuItem(editingItem._id, payload);
        setItems((prev) =>
          prev.map((i) => (i._id === updated._id ? updated : i))
        );
        showToast('Item updated successfully');
      } else {
        const created = await createMenuItem(payload);
        setItems((prev) => [created, ...prev]);
        showToast('Item created successfully');
      }
      closeModal();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  /* ---- toggle availability ---- */
  const handleToggle = async (item) => {
    try {
      const updated = await updateMenuItem(item._id, {
        available: !item.available,
      });
      setItems((prev) =>
        prev.map((i) => (i._id === updated._id ? updated : i))
      );
      showToast(
        updated.available ? 'Item is now available' : 'Item marked unavailable'
      );
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  /* ---- delete ---- */
  const confirmDelete = async () => {
    try {
      await deleteMenuItem(deleteTarget._id);
      setItems((prev) => prev.filter((i) => i._id !== deleteTarget._id));
      showToast('Item deleted');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  /* ---- stats ---- */
  const totalItems = items.length;
  const availableItems = items.filter((i) => i.available).length;
  const categoryCounts = items.reduce((acc, item) => {
    acc[item.category] = (acc[item.category] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="menu-items-page">
      <Navbar />

      {/* Header */}
      <header className="menu-header">
        <div>
          <h1>🍽️ Menu Items</h1>
          <p className="menu-header-subtitle">
            Manage your restaurant menu items
          </p>
        </div>
        <button id="btn-add-item" className="btn-add-item" onClick={openAddModal}>
          <span className="btn-add-icon">+</span> Add Item
        </button>
      </header>

      {/* Category Filters */}
      <div className="category-filters">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`chip ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat === 'all' ? '🔖 All' : `${CATEGORY_EMOJIS[cat]} ${cat}`}
            {cat !== 'all' && categoryCounts[cat]
              ? ` (${categoryCounts[cat]})`
              : ''}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-card">
          <div className="stat-value">{totalItems}</div>
          <div className="stat-label">Total items</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{availableItems}</div>
          <div className="stat-label">Available</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{totalItems - availableItems}</div>
          <div className="stat-label">Unavailable</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">
            {Object.keys(categoryCounts).length}
          </div>
          <div className="stat-label">Categories</div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="error-banner">
          <span>⚠️</span> {error}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="skeleton-grid">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="skeleton-card" />
          ))}
        </div>
      )}

      {/* Items Grid */}
      {!loading && items.length > 0 && (
        <div className="items-grid">
          {items.map((item) => (
            <div
              key={item._id}
              className={`item-card ${!item.available ? 'unavailable' : ''}`}
            >
              {resolveImageUrl(item.image) && !brokenImages[item._id] ? (
                <div className="item-image-wrap">
                  <img
                    className="item-image"
                    src={resolveImageUrl(item.image)}
                    alt={item.name}
                    loading="lazy"
                    onError={() =>
                      setBrokenImages((prev) => ({ ...prev, [item._id]: true }))
                    }
                  />
                </div>
              ) : (
                <div className="item-image-fallback" aria-hidden="true">
                  {CATEGORY_EMOJIS[item.category] || '🍽️'}
                </div>
              )}

              <div className="item-card-top">
                <h3 className="item-name">{item.name}</h3>
                <span className={`badge badge-${item.category}`}>
                  {CATEGORY_EMOJIS[item.category]} {item.category}
                </span>
              </div>

              {item.description && (
                <p className="item-description">{item.description}</p>
              )}

              <div className="item-meta">
                <span className="item-price">
                  Rs. {item.price?.toFixed(2)}
                </span>
                {item.preparationTime != null && (
                  <span className="prep-time">
                    ⏱ {item.preparationTime} min
                  </span>
                )}
              </div>

              <div className="toggle-row">
                <span className="toggle-label">
                  {item.available ? '✅ Available' : '❌ Unavailable'}
                </span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={item.available}
                    onChange={() => handleToggle(item)}
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="card-actions">
                <button
                  className="btn-edit"
                  onClick={() => openEditModal(item)}
                >
                  ✏️ Edit
                </button>
                <button
                  className="btn-delete"
                  onClick={() => setDeleteTarget(item)}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && items.length === 0 && !error && (
        <div className="empty-state">
          <div className="empty-icon">🍽️</div>
          <h3>No menu items yet</h3>
          <p>Start adding items to build your menu</p>
          <button className="btn-add-item" onClick={openAddModal}>
            <span className="btn-add-icon">+</span> Add Your First Item
          </button>
        </div>
      )}

      <footer className="menu-footer">
        <div className="menu-footer-inner">
          <div className="menu-footer-brand">
            <h3>EasyFood Vendor</h3>
            <p>Manage your menu and keep your customers updated in real time.</p>
          </div>
          <div className="menu-footer-links">
            <Link to="/">Home</Link>
            <Link to="/menu">Browse Menu</Link>
            <Link to="/vendor/menu-items">Add Menu</Link>
            <Link to="/table">Reservations</Link>
          </div>
        </div>
      </footer>

      {/* Add / Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>{editingItem ? '✏️ Edit Item' : '➕ New Item'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Name</label>
                <input
                  id="name"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Chicken Fried Rice"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Briefly describe the item..."
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="price">Price (Rs.)</label>
                  <input
                    id="price"
                    name="price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={handleChange}
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="category">Category</label>
                  <select
                    id="category"
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    required
                  >
                    {CATEGORIES.filter((c) => c !== 'all').map((cat) => (
                      <option key={cat} value={cat}>
                        {CATEGORY_EMOJIS[cat]}{' '}
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="preparationTime">Prep Time (min)</label>
                  <input
                    id="preparationTime"
                    name="preparationTime"
                    type="number"
                    min="0"
                    value={form.preparationTime}
                    onChange={handleChange}
                    placeholder="15"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="image">Image URL</label>
                  <input
                    id="image"
                    name="image"
                    value={form.image}
                    onChange={handleChange}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="form-toggle">
                <span>Available</span>
                <label className="toggle">
                  <input
                    type="checkbox"
                    checked={form.available}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        available: e.target.checked,
                      }))
                    }
                  />
                  <span className="toggle-slider" />
                </label>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={closeModal}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving
                    ? 'Saving…'
                    : editingItem
                    ? 'Save Changes'
                    : 'Create Item'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div
          className="modal-overlay"
          onClick={() => setDeleteTarget(null)}
        >
          <div
            className="modal delete-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="delete-icon">🗑️</div>
            <h2>Delete Item?</h2>
            <p>
              Are you sure you want to delete{' '}
              <span className="delete-item-name">
                &quot;{deleteTarget.name}&quot;
              </span>
              ? This action cannot be undone.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setDeleteTarget(null)}
              >
                Cancel
              </button>
              <button
                className="btn-save btn-confirm-delete"
                onClick={confirmDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className={`toast toast-${toast.type}`}>{toast.message}</div>
      )}
    </div>
  );
}
