import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getAllMenuItems } from '../api/menuItemsApi.js';
import { createOrder, getAllOrders, cancelOrder } from '../api/ordersApi.js';
import '../styles/StudentOrderPage.css';

const CATEGORIES = ['all', 'rice', 'snack', 'beverage', 'dessert', 'other'];
const CATEGORY_EMOJIS = {
  rice: '🍚',
  snack: '🍟',
  beverage: '🥤',
  dessert: '🍰',
  other: '📦',
};

export default function StudentOrderPage() {
  /* ---- tabs ---- */
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' | 'orders'

  /* ---- menu state ---- */
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  /* ---- cart state ---- */
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);

  /* ---- checkout state ---- */
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState({
    studentName: '',
    studentId: '',
    phone: '',
    orderType: 'Pickup',
    deliveryAddress: '',
  });
  const [studentIdError, setStudentIdError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [placing, setPlacing] = useState(false);

  /* ---- order confirmation ---- */
  const [confirmedOrder, setConfirmedOrder] = useState(null);

  /* ---- my orders ---- */
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  /* ---- toast ---- */
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* ================================================================
     MENU FETCHING
     ================================================================ */
  const fetchMenu = useCallback(async () => {
    try {
      setMenuLoading(true);
      setMenuError(null);
      const filters = { available: true };
      if (activeCategory !== 'all') filters.category = activeCategory;
      const data = await getAllMenuItems(filters);
      setMenuItems(data);
    } catch (err) {
      setMenuError(err.message);
    } finally {
      setMenuLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  /* ================================================================
     MY ORDERS FETCHING
     ================================================================ */
  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const data = await getAllOrders();
      setOrders(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setOrdersLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 'orders') fetchOrders();
  }, [activeTab, fetchOrders]);

  /* ================================================================
     SEARCH FILTER
     ================================================================ */
  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  /* ================================================================
     CART HELPERS
     ================================================================ */
  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) {
        return prev.map((c) =>
          c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`${item.name} added to cart`);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) =>
      prev
        .map((c) =>
          c._id === id ? { ...c, quantity: c.quantity + delta } : c
        )
        .filter((c) => c.quantity > 0)
    );
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((c) => c._id !== id));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce((sum, c) => sum + c.price * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  /* ================================================================
     CHECKOUT
     ================================================================ */
  const STUDENT_ID_ERROR_MESSAGE = 'Student ID must start with 2 letters followed by 8 numbers';

  const validateStudentId = (studentId) => {
    if (!studentId) return '';
    return /^[A-Za-z]{2}\d{8}$/.test(studentId)
      ? ''
      : STUDENT_ID_ERROR_MESSAGE;
  };

  const sanitizeStudentId = (value) => {
    const upperValue = value.toUpperCase();
    let formatted = '';

    for (const ch of upperValue) {
      if (formatted.length < 2) {
        if (/^[A-Z]$/.test(ch)) formatted += ch;
      } else if (/^\d$/.test(ch)) {
        formatted += ch;
      }

      if (formatted.length === 10) break;
    }

    return formatted;
  };

  const handleStudentIdKeyDown = (e) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

    if (e.ctrlKey || e.metaKey || allowedKeys.includes(e.key)) return;

    const { selectionStart, selectionEnd, value } = e.currentTarget;
    const hasSelection = selectionStart !== selectionEnd;
    const cursorPos = selectionStart ?? value.length;

    if (value.length >= 10 && !hasSelection) {
      e.preventDefault();
      return;
    }

    if (cursorPos < 2) {
      if (!/^[a-zA-Z]$/.test(e.key)) e.preventDefault();
      return;
    }

    if (!/^\d$/.test(e.key)) e.preventDefault();
  };

  const validatePhoneNumber = (phone) => {
    if (!phone) return '';
    return phone.length === 10
      ? ''
      : 'Phone number must be exactly 10 digits';
  };

  const handlePhoneKeyDown = (e) => {
    const allowedKeys = ['Backspace', 'Delete', 'ArrowLeft', 'ArrowRight', 'Tab', 'Home', 'End'];

    if (e.ctrlKey || e.metaKey || allowedKeys.includes(e.key)) return;

    const hasSelection = e.currentTarget.selectionStart !== e.currentTarget.selectionEnd;
    const isDigit = /^\d$/.test(e.key);

    if (!isDigit || (checkoutForm.phone.length >= 10 && !hasSelection)) {
      e.preventDefault();
    }
  };

  const handleCheckoutChange = (e) => {
    const { name, value } = e.target;

    if (name === 'studentId') {
      const sanitizedStudentId = sanitizeStudentId(value);
      setCheckoutForm((prev) => ({ ...prev, studentId: sanitizedStudentId }));
      setStudentIdError(validateStudentId(sanitizedStudentId));
      return;
    }

    if (name === 'phone') {
      const sanitizedPhone = value.replace(/\D/g, '').slice(0, 10);
      setCheckoutForm((prev) => ({ ...prev, phone: sanitizedPhone }));
      setPhoneError(validatePhoneNumber(sanitizedPhone));
      return;
    }

    setCheckoutForm((prev) => ({ ...prev, [name]: value }));

  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();

    // Validate student ID before submitting
    const studentIdValidationMessage = validateStudentId(checkoutForm.studentId.trim());
    if (studentIdValidationMessage) {
      setStudentIdError(studentIdValidationMessage);
      return;
    }

    // Validate phone number before submitting
    const phoneValidationMessage = validatePhoneNumber(checkoutForm.phone.trim());
    if (phoneValidationMessage) {
      setPhoneError(phoneValidationMessage);
      return;
    }

    setPlacing(true);
    try {
      const payload = {
        studentName: checkoutForm.studentName.trim(),
        studentId: checkoutForm.studentId.trim().toUpperCase(),
        phone: checkoutForm.phone.trim(),
        orderType: checkoutForm.orderType,
        deliveryAddress:
          checkoutForm.orderType === 'Delivery'
            ? checkoutForm.deliveryAddress.trim()
            : '',
        orderItems: cart.map((c) => ({
          menuItemId: c._id,
          name: c.name,
          quantity: c.quantity,
          price: c.price,
          subtotal: c.price * c.quantity,
        })),
        totalAmount: cartTotal,
      };

      const order = await createOrder(payload);
      setConfirmedOrder(order);
      clearCart();
      setShowCheckout(false);
      setCartOpen(false);
      showToast('Order placed successfully! 🎉');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setPlacing(false);
    }
  };

  /* ================================================================
     CANCEL ORDER
     ================================================================ */
  const handleCancelOrder = async (id) => {
    try {
      const updated = await cancelOrder(id);
      setOrders((prev) =>
        prev.map((o) => (o._id === updated._id ? updated : o))
      );
      showToast('Order cancelled');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  /* ================================================================
     STATUS HELPERS
     ================================================================ */
  const statusConfig = {
    Pending: { emoji: '⏳', cls: 'status-pending' },
    Completed: { emoji: '✅', cls: 'status-completed' },
    Cancelled: { emoji: '❌', cls: 'status-cancelled' },
  };

  /* ================================================================
     RENDER
     ================================================================ */
  return (
    <div className="student-order-page">
      {/* ===== HEADER ===== */}
      <header className="so-header">
        <div className="so-header-left">
          <h1>🍽️ EasyWay</h1>
          <p className="so-header-subtitle">Order your favourite food</p>
        </div>
        <div className="so-header-right">
          <div className="tab-switcher">
            <button
              className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
              onClick={() => { setActiveTab('menu'); setConfirmedOrder(null); }}
            >
              🍕 Menu
            </button>
            <button
              className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
              onClick={() => setActiveTab('orders')}
            >
              📋 My Orders
            </button>
          </div>
          {activeTab === 'menu' && (
            <button
              className="cart-fab"
              onClick={() => setCartOpen(true)}
            >
              🛒
              {cartCount > 0 && (
                <span className="cart-badge">{cartCount}</span>
              )}
            </button>
          )}
        </div>
      </header>

      {/* ===== ORDER CONFIRMATION ===== */}
      {confirmedOrder && activeTab === 'menu' && (
        <div className="confirmation-banner">
          <div className="confirmation-icon">🎉</div>
          <h2>Order Placed!</h2>
          <p className="conf-id">Order #{confirmedOrder._id?.slice(-8).toUpperCase()}</p>
          <div className="conf-details">
            <span>📋 {confirmedOrder.orderItems?.length} item(s)</span>
            <span>💰 Rs. {confirmedOrder.totalAmount?.toFixed(2)}</span>
            <span>📦 {confirmedOrder.orderType}</span>
          </div>
          <p className="conf-status">Status: <strong>⏳ Pending</strong></p>
          <div className="so-confirmation-actions">
            <button
              className="btn-continue"
              onClick={() => setConfirmedOrder(null)}
            >
              Continue Ordering
            </button>
            <Link
              to={`/feedback?orderId=${confirmedOrder._id}`}
              className="btn-give-feedback"
            >
              Share Your Experience
            </Link>
          </div>
        </div>
      )}

      {/* ===== MENU TAB ===== */}
      {activeTab === 'menu' && !confirmedOrder && (
        <>
          {/* Search */}
          <div className="search-bar-wrapper">
            <div className="search-bar">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button
                  className="search-clear"
                  onClick={() => setSearchQuery('')}
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Categories */}
          <div className="so-category-filters">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                className={`so-chip ${activeCategory === cat ? 'active' : ''}`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat === 'all' ? '🔖 All' : `${CATEGORY_EMOJIS[cat]} ${cat}`}
              </button>
            ))}
          </div>

          {/* Error */}
          {menuError && (
            <div className="so-error-banner">
              <span>⚠️</span> {menuError}
            </div>
          )}

          {/* Loading */}
          {menuLoading && (
            <div className="so-skeleton-grid">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="so-skeleton-card" />
              ))}
            </div>
          )}

          {/* Items Grid */}
          {!menuLoading && filteredItems.length > 0 && (
            <div className="so-items-grid">
              {filteredItems.map((item) => {
                const inCart = cart.find((c) => c._id === item._id);
                return (
                  <div key={item._id} className="so-menu-card">
                    <div className="so-card-top">
                      <h3 className="so-item-name">{item.name}</h3>
                      <span className={`so-badge so-badge-${item.category}`}>
                        {CATEGORY_EMOJIS[item.category]} {item.category}
                      </span>
                    </div>
                    {item.description && (
                      <p className="so-item-desc">{item.description}</p>
                    )}
                    <div className="so-card-bottom">
                      <div className="so-item-meta">
                        <span className="so-item-price">
                          Rs. {item.price?.toFixed(2)}
                        </span>
                        {item.preparationTime != null && (
                          <span className="so-prep-time">
                            ⏱ {item.preparationTime} min
                          </span>
                        )}
                      </div>
                      {inCart ? (
                        <div className="so-qty-controls">
                          <button
                            className="so-qty-btn"
                            onClick={() => updateQuantity(item._id, -1)}
                          >
                            −
                          </button>
                          <span className="so-qty-value">{inCart.quantity}</span>
                          <button
                            className="so-qty-btn"
                            onClick={() => updateQuantity(item._id, 1)}
                          >
                            +
                          </button>
                        </div>
                      ) : (
                        <button
                          className="btn-add-to-cart"
                          onClick={() => addToCart(item)}
                        >
                          + Add
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Empty */}
          {!menuLoading && filteredItems.length === 0 && !menuError && (
            <div className="so-empty-state">
              <div className="so-empty-icon">🍽️</div>
              <h3>No items found</h3>
              <p>Try a different category or search term</p>
            </div>
          )}
        </>
      )}

      {/* ===== MY ORDERS TAB ===== */}
      {activeTab === 'orders' && (
        <div className="my-orders-section">
          <div className="my-orders-header">
            <h2>📋 My Orders</h2>
          </div>

          {ordersLoading && (
            <div className="so-skeleton-grid">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="so-skeleton-card" />
              ))}
            </div>
          )}

          {!ordersLoading && orders.length === 0 && (
            <div className="so-empty-state">
              <div className="so-empty-icon">📦</div>
              <h3>No orders yet</h3>
              <p>Place your first order from the menu!</p>
              <button
                className="btn-continue"
                onClick={() => setActiveTab('menu')}
              >
                Browse Menu
              </button>
            </div>
          )}

          {!ordersLoading && orders.length > 0 && (
            <div className="orders-list">
              {orders.map((order) => {
                const sc = statusConfig[order.status] || statusConfig.Pending;
                return (
                  <div key={order._id} className="order-card">
                    <div className="order-card-header">
                      <div>
                        <span className="order-id">
                          #{order._id?.slice(-8).toUpperCase()}
                        </span>
                        <span className={`order-status ${sc.cls}`}>
                          {sc.emoji} {order.status}
                        </span>
                      </div>
                      <span className="order-date">
                        {new Date(order.createdAt).toLocaleDateString('en-LK', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="order-items-list">
                      {order.orderItems?.map((oi, idx) => (
                        <div key={idx} className="order-item-row">
                          <span>
                            {oi.name} × {oi.quantity}
                          </span>
                          <span>Rs. {oi.subtotal?.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    <div className="order-card-footer">
                      <div className="order-total">
                        Total: <strong>Rs. {order.totalAmount?.toFixed(2)}</strong>
                      </div>
                      <div className="order-meta-tags">
                        <span className="order-type-tag">
                          {order.orderType === 'Delivery' ? '🚚' : '🏪'}{' '}
                          {order.orderType}
                        </span>
                      </div>
                      {order.status === 'Pending' && (
                        <button
                          className="btn-cancel-order"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          ✕ Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ===== CART SLIDE-OUT ===== */}
      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-panel" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>🛒 Your Cart</h2>
              <button
                className="cart-close"
                onClick={() => setCartOpen(false)}
              >
                ✕
              </button>
            </div>

            {cart.length === 0 && (
              <div className="cart-empty">
                <div className="cart-empty-icon">🛒</div>
                <p>Your cart is empty</p>
                <span>Add items from the menu</span>
              </div>
            )}

            {cart.length > 0 && (
              <>
                <div className="cart-items">
                  {cart.map((c) => (
                    <div key={c._id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{c.name}</span>
                        <span className="cart-item-price">
                          Rs. {(c.price * c.quantity).toFixed(2)}
                        </span>
                      </div>
                      <div className="cart-item-controls">
                        <div className="so-qty-controls">
                          <button
                            className="so-qty-btn"
                            onClick={() => updateQuantity(c._id, -1)}
                          >
                            −
                          </button>
                          <span className="so-qty-value">{c.quantity}</span>
                          <button
                            className="so-qty-btn"
                            onClick={() => updateQuantity(c._id, 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          className="cart-remove-btn"
                          onClick={() => removeFromCart(c._id)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="cart-summary">
                  <div className="cart-total-row">
                    <span>Total</span>
                    <span className="cart-total-amount">
                      Rs. {cartTotal.toFixed(2)}
                    </span>
                  </div>
                  <div className="cart-action-row">
                    <button className="btn-clear-cart" onClick={clearCart}>
                      Clear Cart
                    </button>
                    <button
                      className="btn-checkout"
                      onClick={() => {
                        setCartOpen(false);
                        setShowCheckout(true);
                      }}
                    >
                      Checkout →
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ===== CHECKOUT MODAL ===== */}
      {showCheckout && (
        <div
          className="so-modal-overlay"
          onClick={() => setShowCheckout(false)}
        >
          <div
            className="so-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>📝 Checkout</h2>

            <div className="checkout-summary">
              <div className="checkout-items-count">
                {cartCount} item(s) — Rs. {cartTotal.toFixed(2)}
              </div>
            </div>

            <form onSubmit={handlePlaceOrder}>
              <div className="so-form-group">
                <label htmlFor="studentName">Your Name</label>
                <input
                  id="studentName"
                  name="studentName"
                  value={checkoutForm.studentName}
                  onChange={handleCheckoutChange}
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="so-form-group">
                <label htmlFor="studentId">Student ID Number</label>
                <input
                  id="studentId"
                  name="studentId"
                  value={checkoutForm.studentId}
                  onChange={handleCheckoutChange}
                  onKeyDown={handleStudentIdKeyDown}
                  placeholder="e.g. IT12345678"
                  type="text"
                  inputMode="text"
                  pattern="[A-Za-z]{2}\d{8}"
                  maxLength={10}
                  required
                  className={studentIdError ? 'input-error' : ''}
                />
                {studentIdError && (
                  <span className="field-error">{studentIdError}</span>
                )}
              </div>

              <div className="so-form-group">
                <label htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  name="phone"
                  type="text"
                  value={checkoutForm.phone}
                  onChange={handleCheckoutChange}
                  onKeyDown={handlePhoneKeyDown}
                  placeholder="07X XXX XXXX"
                  inputMode="numeric"
                  pattern="\d{10}"
                  maxLength={10}
                  required
                  className={phoneError ? 'input-error' : ''}
                />
                {phoneError && (
                  <span className="field-error">{phoneError}</span>
                )}
              </div>

              <div className="so-form-group">
                <label>Order Type</label>
                <div className="order-type-toggle">
                  <button
                    type="button"
                    className={`type-btn ${checkoutForm.orderType === 'Pickup' ? 'active' : ''}`}
                    onClick={() =>
                      setCheckoutForm((p) => ({ ...p, orderType: 'Pickup' }))
                    }
                  >
                    🏪 Pickup
                  </button>
                  <button
                    type="button"
                    className={`type-btn ${checkoutForm.orderType === 'Delivery' ? 'active' : ''}`}
                    onClick={() =>
                      setCheckoutForm((p) => ({ ...p, orderType: 'Delivery' }))
                    }
                  >
                    🚚 Delivery
                  </button>
                </div>
              </div>

              {checkoutForm.orderType === 'Delivery' && (
                <div className="so-form-group">
                  <label htmlFor="deliveryAddress">Delivery Address</label>
                  <textarea
                    id="deliveryAddress"
                    name="deliveryAddress"
                    value={checkoutForm.deliveryAddress}
                    onChange={handleCheckoutChange}
                    placeholder="Room / Building / Hostel..."
                    required
                  />
                </div>
              )}

              <div className="so-modal-actions">
                <button
                  type="button"
                  className="so-btn-cancel"
                  onClick={() => setShowCheckout(false)}
                >
                  Back
                </button>
                <button
                  type="submit"
                  className="so-btn-place"
                  disabled={placing || cart.length === 0}
                >
                  {placing ? 'Placing…' : `Place Order — Rs. ${cartTotal.toFixed(2)}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== TOAST ===== */}
      {toast && (
        <div className={`so-toast so-toast-${toast.type}`}>
          {toast.message}
        </div>
      )}
    </div>
  );
}
