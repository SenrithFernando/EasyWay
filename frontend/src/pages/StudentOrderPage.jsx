import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, ShoppingCart, X, Plus, Minus, Clock, 
  ChevronRight, CheckCircle, Package, Utensils, 
  Trash2, MessageSquare, Info 
} from 'lucide-react';
import { DashboardLayout } from '../Components/layout/DashboardLayout';
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

const FALLBACK_MENU_ITEMS = [
  { _id: 'ui-fallback-1', name: 'Veg Rice Bowl', description: 'Healthy rice bowl with mixed vegetables.', price: 450, category: 'rice', preparationTime: 15, available: true },
  { _id: 'ui-fallback-2', name: 'Chicken Kottu', description: 'Classic spicy kottu with chicken.', price: 650, category: 'snack', preparationTime: 20, available: true },
  { _id: 'ui-fallback-3', name: 'Fruit Smoothie', description: 'Fresh seasonal fruit smoothie.', price: 350, category: 'beverage', preparationTime: 8, available: true },
];

const CANCELLATION_WINDOW_MS = 2 * 60 * 1000;
const LOCAL_ORDERS_KEY = 'easyway_orders_cache';

const loadLocalOrders = () => {
  try {
    const raw = localStorage.getItem(LOCAL_ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch { return []; }
};

const saveLocalOrders = (orders) => {
  localStorage.setItem(LOCAL_ORDERS_KEY, JSON.stringify(orders));
};

const mergeOrdersById = (primary, secondary) => {
  const map = new Map();
  // Prioritize primary (server/fresh) data over secondary (cached) data
  [...secondary, ...primary].forEach((order) => {
    if (order && order._id) map.set(order._id, order);
  });
  return Array.from(map.values()).sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

export default function StudentOrderPage({ initialTab = 'menu' }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab);
  const [menuItems, setMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [brokenImages, setBrokenImages] = useState({});
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [checkoutForm, setCheckoutForm] = useState(() => {
    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : null;
    return {
      studentName: user?.fullName || '',
      studentId: user?.studentId || '',
      phone: user?.phoneNumber || '',
      orderType: 'Pickup',
      deliveryAddress: '',
    };
  });
  const [placing, setPlacing] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [orders, setOrders] = useState([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resolveImageUrl = (imageUrl) => {
    if (!imageUrl) return null;
    const trimmed = imageUrl.trim();
    if (/^https?:\/\//i.test(trimmed)) return trimmed;
    const backendOrigin = import.meta.env.VITE_API_ORIGIN || 'http://localhost:3000';
    return trimmed.startsWith('/') ? `${backendOrigin}${trimmed}` : `${backendOrigin}/${trimmed}`;
  };

  const fetchMenu = useCallback(async () => {
    try {
      setMenuLoading(true);
      const filters = { available: true };
      if (activeCategory !== 'all') filters.category = activeCategory;
      const data = await getAllMenuItems(filters);
      setMenuItems(data?.length ? data : FALLBACK_MENU_ITEMS);
    } catch (err) {
      setMenuItems(FALLBACK_MENU_ITEMS);
      setMenuError('Could not load live menu. Showing sample items.');
    } finally { setMenuLoading(false); }
  }, [activeCategory]);

  useEffect(() => { fetchMenu(); }, [fetchMenu]);

  const fetchOrders = useCallback(async () => {
    try {
      setOrdersLoading(true);
      const data = await getAllOrders();
      const cached = loadLocalOrders();
      const merged = mergeOrdersById(data || [], cached);
      setOrders(merged);
      saveLocalOrders(merged);
    } catch (err) {
      const cached = loadLocalOrders();
      setOrders(cached);
    } finally { setOrdersLoading(false); }
  }, []);

  useEffect(() => { if (activeTab === 'orders') fetchOrders(); }, [activeTab, fetchOrders]);

  useEffect(() => {
    const itv = setInterval(() => setCurrentTime(Date.now()), 1000);
    return () => clearInterval(itv);
  }, []);

  const filteredItems = menuItems.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addToCart = (item) => {
    setCart((prev) => {
      const existing = prev.find((c) => c._id === item._id);
      if (existing) return prev.map((c) => c._id === item._id ? { ...c, quantity: c.quantity + 1 } : c);
      return [...prev, { ...item, quantity: 1 }];
    });
    showToast(`${item.name} added to cart`);
  };

  const updateQuantity = (id, delta) => {
    setCart((prev) => prev.map((c) => c._id === id ? { ...c, quantity: c.quantity + delta } : c).filter((c) => c.quantity > 0));
  };

  const cartTotal = cart.reduce((sum, c) => sum + (c.price || 0) * c.quantity, 0);
  const cartCount = cart.reduce((sum, c) => sum + c.quantity, 0);

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setPlacing(true);
    try {
      const payload = {
        studentName: checkoutForm.studentName,
        studentId: checkoutForm.studentId,
        phone: checkoutForm.phone,
        orderType: checkoutForm.orderType,
        orderItems: cart.map(c => ({ menuItemId: c._id, name: c.name, quantity: c.quantity, price: c.price, subtotal: c.price * c.quantity })),
        totalAmount: cartTotal,
      };
      const order = await createOrder(payload);
      setConfirmedOrder(order);
      setOrders(prev => mergeOrdersById([order], prev));
      setCart([]);
      setShowCheckout(false);
      setCartOpen(false);
      showToast('Order placed successfully! 🎉');
    } catch (err) { showToast(err.message, 'error'); } 
    finally { setPlacing(false); }
  };

  const handleCancelOrder = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await cancelOrder(id);
      showToast('Order cancelled successfully');
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } }
  };

  return (
    <DashboardLayout role="student">
      <div className="student-order-page">
        {/* Header Section */}
        <header className="so-header">
          <div className="so-header-left">
            <h1>Fine Dining, Faster.</h1>
            <p className="text-surface-500 text-sm">Experience the best campus flavors from your favorites.</p>
          </div>
          
          <div className="so-header-right">
            <div className="tab-switcher">
              <button 
                className={`tab-btn ${activeTab === 'menu' ? 'active' : ''}`}
                onClick={() => { setActiveTab('menu'); setConfirmedOrder(null); }}
              >
                <Utensils size={16} /> Menu
              </button>
              <button 
                className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
                onClick={() => setActiveTab('orders')}
              >
                <Package size={16} /> My Orders
              </button>
            </div>
            
            <button className="cart-fab" onClick={() => setCartOpen(true)}>
              <ShoppingCart size={20} />
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </button>
          </div>
        </header>

        {/* Controls Row */}
        {activeTab === 'menu' && !confirmedOrder && (
          <div className="so-controls-row">
            <div className="search-bar">
              <Search className="search-icon" size={18} />
              <input 
                type="text" 
                placeholder="Search flavors..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="so-category-filters">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat} 
                  className={`so-chip ${activeCategory === cat ? 'active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                >
                  {cat === 'all' ? 'All Items' : `${CATEGORY_EMOJIS[cat]} ${cat}`}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Order Confirmation Banner */}
        <AnimatePresence>
          {confirmedOrder && activeTab === 'menu' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }} 
              animate={{ opacity: 1, scale: 1 }} 
              exit={{ opacity: 0 }}
              className="confirmation-banner"
            >
              <div className="confirmation-icon">
                <CheckCircle size={40} />
              </div>
              <h2 className="text-2xl font-bold mb-2">Order Confirmed!</h2>
              <p className="text-brand-600 font-mono text-sm mb-6">ID: #{confirmedOrder._id?.slice(-8).toUpperCase()}</p>
              
              <div className="flex justify-center gap-6 mb-8 text-sm font-medium text-surface-600">
                <span className="flex items-center gap-1.5"><Package size={16}/> {confirmedOrder.orderItems?.length} Items</span>
                <span className="flex items-center gap-1.5"><Clock size={16}/> Pickup</span>
                <span className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border ${
                  confirmedOrder.status === 'Ready' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                  confirmedOrder.status === 'Preparing' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
                  'bg-brand-50 text-brand-700 border-brand-100'
                }`}>
                  <Info size={14}/> {confirmedOrder.status || 'Pending'}
                </span>
              </div>
              
              <div className="flex gap-4">
                <button className="btn-add-to-cart w-full" onClick={() => setConfirmedOrder(null)}>
                  Order More
                </button>
                <Link to="/feedback" className="btn-chatbot-nav w-full py-3">
                  Give Feedback
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Menu Tab */}
        {activeTab === 'menu' && !confirmedOrder && (
          <motion.div 
            variants={containerVariants} 
            initial="hidden" 
            animate="visible"
            className="so-items-grid"
          >
            {filteredItems.map(item => {
              const inCart = cart.find(c => c._id === item._id);
              return (
                <motion.div key={item._id} variants={itemVariants} className="so-menu-card">
                  <div className="so-item-image-wrap">
                    {resolveImageUrl(item.image) ? (
                      <img 
                        src={resolveImageUrl(item.image)} 
                        alt={item.name} 
                        className="so-item-image"
                        onError={(e) => { e.target.style.display='none'; }}
                      />
                    ) : (
                      <div className="so-item-image-fallback">{CATEGORY_EMOJIS[item.category]}</div>
                    )}
                  </div>
                  
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="so-item-name">{item.name}</h3>
                    <span className={`so-badge so-badge-${item.category}`}>{item.category}</span>
                  </div>
                  <p className="so-item-desc line-clamp-2">{item.description}</p>
                  
                  <div className="so-card-bottom">
                    <span className="so-item-price">Rs. {item.price?.toFixed(0)}</span>
                    
                    {inCart ? (
                      <div className="so-qty-controls">
                        <button className="so-qty-btn" onClick={() => updateQuantity(item._id, -1)}><Minus size={14}/></button>
                        <span className="so-qty-value">{inCart.quantity}</span>
                        <button className="so-qty-btn" onClick={() => updateQuantity(item._id, 1)}><Plus size={14}/></button>
                      </div>
                    ) : (
                      <button className="btn-add-to-cart" onClick={() => addToCart(item)}>
                        Add to Cart
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}

        {/* My Orders Tab */}
        {activeTab === 'orders' && (
          <div className="my-orders-section">
            <div className="p-6 border-b border-surface-100 flex flex-col md:flex-row justify-between items-start md:items-center bg-white gap-4">
              <div>
                <h2 className="font-bold text-lg">Order History</h2>
                <p className="text-xs text-surface-400">Track and manage your campus dining requests.</p>
              </div>
              <div className="flex bg-surface-50 p-1 rounded-xl border border-surface-100 flex-wrap">
                {['All', 'Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled'].map(s => (
                  <button 
                    key={s} 
                    onClick={() => setOrderStatusFilter(s)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      orderStatusFilter === s 
                        ? 'bg-white text-brand-600 shadow-sm border border-surface-100' 
                        : 'text-surface-400 hover:text-surface-600'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="orders-list">
              {ordersLoading ? (
                <div className="p-12 text-center text-surface-400">Loading your history...</div>
              ) : orders.length === 0 ? (
                <div className="p-20 text-center">
                  <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Package size={32} />
                  </div>
                  <h3 className="font-bold text-lg">Your orders will appear here</h3>
                  <button className="text-brand-600 font-medium mt-2" onClick={() => setActiveTab('menu')}>Go to Menu</button>
                </div>
              ) : (
                orders
                  .filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter)
                  .map(order => (
                  <div key={order._id} className="order-card">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-surface-900">Order #{order._id?.slice(-8).toUpperCase()}</span>
                          <span className={`order-status status-${order.status?.toLowerCase()}`}>{order.status}</span>
                        </div>
                        <p className="text-xs text-surface-400">
                          {new Date(order.createdAt).toLocaleDateString('en-LK', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'})}
                        </p>
                      </div>
                      <span className="font-bold text-lg text-surface-900">Rs. {order.totalAmount?.toFixed(0)}</span>
                    </div>
                    
                    <div className="text-sm text-surface-600 mb-4 bg-surface-50 p-3 rounded-lg flex flex-wrap gap-x-6 gap-y-1">
                      {order.orderItems?.map(oi => (
                        <span key={oi._id}>{oi.name} × {oi.quantity}</span>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-3">
                      {order.status === 'Pending' && (
                        <button 
                          className="text-red-500 text-xs font-bold hover:bg-red-50 px-3 py-1.5 rounded-lg border border-red-100 transition-colors"
                          onClick={() => handleCancelOrder(order._id)}
                        >
                          Cancel Order
                        </button>
                      )}
                      <button 
                        className="text-brand-600 text-xs font-bold hover:bg-brand-50 px-3 py-1.5 rounded-lg border border-brand-100 transition-colors"
                        onClick={() => setSelectedOrder(order)}
                      >
                        View Details
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Shopping Cart Slide-out */}
        <AnimatePresence>
          {cartOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }}
                className="cart-overlay" 
                onClick={() => setCartOpen(false)} 
              />
              <motion.div 
                initial={{ x: '100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="cart-panel"
              >
                <div className="cart-header">
                  <h2 className="text-xl font-bold">Shopping Cart</h2>
                  <button onClick={() => setCartOpen(false)} className="p-2 hover:bg-surface-100 rounded-full">
                    <X size={20} />
                  </button>
                </div>
                
                <div className="cart-items">
                  {cart.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-surface-400">
                      <ShoppingCart size={48} className="mb-4 opacity-20" />
                      <p>Your cart is empty</p>
                    </div>
                  ) : (
                    cart.map(item => (
                      <div key={item._id} className="cart-item">
                        <div className="cart-item-info">
                          <h4 className="font-bold text-sm mb-1">{item.name}</h4>
                          <span className="text-brand-600 font-bold text-sm">Rs. {item.price}</span>
                        </div>
                        <div className="so-qty-controls">
                          <button className="so-qty-btn" onClick={() => updateQuantity(item._id, -1)}><Minus size={12}/></button>
                          <span className="so-qty-value">{item.quantity}</span>
                          <button className="so-qty-btn" onClick={() => updateQuantity(item._id, 1)}><Plus size={12}/></button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
                
                {cart.length > 0 && (
                  <div className="cart-summary">
                    <div className="cart-total-row">
                      <span>Total Amount</span>
                      <span>Rs. {cartTotal.toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-surface-400 mb-6 flex items-center gap-1.5">
                      <Info size={12}/> Inclusive of all campus taxes.
                    </p>
                    <button className="btn-checkout" onClick={() => setShowCheckout(true)}>
                      Proceed to Checkout
                    </button>
                  </div>
                )}
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Checkout Modal */}
        <AnimatePresence>
          {showCheckout && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="so-modal-overlay" 
              onClick={() => setShowCheckout(false)}
            >
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="so-modal" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Secure Checkout</h2>
                  <button onClick={() => setShowCheckout(false)}><X size={24}/></button>
                </div>
                
                <form onSubmit={handlePlaceOrder}>
                  <div className="so-form-group">
                    <label>Confirm Name</label>
                    <input 
                      type="text" 
                      value={checkoutForm.studentName} 
                      onChange={e => setCheckoutForm({...checkoutForm, studentName: e.target.value})}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="so-form-group">
                      <label>Student ID</label>
                      <input 
                        type="text" 
                        value={checkoutForm.studentId} 
                        readOnly
                        className="bg-surface-100"
                      />
                    </div>
                    <div className="so-form-group">
                      <label>Phone Number</label>
                      <input 
                        type="text" 
                        value={checkoutForm.phone} 
                        onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="bg-brand-50 p-4 rounded-xl mb-6">
                    <div className="flex justify-between font-bold text-brand-900 border-b border-brand-200 pb-2 mb-2">
                      <span>Total Due</span>
                      <span>Rs. {cartTotal.toFixed(0)}</span>
                    </div>
                    <p className="text-xs text-brand-700">Payment will be handled at the canteen counter upon pickup.</p>
                  </div>
                  
                  <button 
                    type="submit" 
                    className="btn-checkout" 
                    disabled={placing}
                  >
                    {placing ? 'Placing Order...' : 'Confirm Order'}
                  </button>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Order Details Modal */}
        <AnimatePresence>
          {selectedOrder && (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="so-modal-overlay" 
              onClick={() => setSelectedOrder(null)}
            >
              <motion.div 
                initial={{ y: 20, opacity: 0 }} 
                animate={{ y: 0, opacity: 1 }}
                className="so-modal max-w-lg" 
                onClick={e => e.stopPropagation()}
              >
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-extrabold text-surface-900">Order Summary</h2>
                    <p className="text-xs text-brand-600 font-mono mt-1">ID: #{selectedOrder._id?.toUpperCase()}</p>
                  </div>
                  <button onClick={() => setSelectedOrder(null)} className="p-2 hover:bg-surface-100 rounded-full transition-colors">
                    <X size={20}/>
                  </button>
                </div>

                <div className="space-y-4 mb-8">
                  {selectedOrder.orderItems?.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-surface-50 p-4 rounded-xl border border-surface-100">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center font-bold text-xs text-surface-400">
                          {item.quantity}x
                        </div>
                        <span className="font-bold text-surface-800">{item.name}</span>
                      </div>
                      <span className="font-bold text-surface-900">Rs. {(item.price * item.quantity).toFixed(0)}</span>
                    </div>
                  ))}
                </div>

                <div className="border-t-2 border-dashed border-surface-200 pt-6 space-y-3">
                  <div className="flex justify-between text-surface-500 font-medium">
                    <span>Subtotal</span>
                    <span>Rs. {selectedOrder.totalAmount?.toFixed(0)}</span>
                  </div>
                  <div className="flex justify-between text-surface-900 text-xl font-black pt-2">
                    <span>Total Paid</span>
                    <span className="text-brand-600">Rs. {selectedOrder.totalAmount?.toFixed(0)}</span>
                  </div>
                </div>

                <div className="mt-8 flex items-center gap-3 p-4 bg-brand-50 rounded-2xl text-brand-700 text-sm">
                  <Info size={18} />
                  <p>Status: <span className="font-black uppercase tracking-tight">{selectedOrder.status}</span> — {
                    selectedOrder.status === 'Completed' ? 'Picked up' : 
                    selectedOrder.status === 'Ready' ? 'Ready for pickup' :
                    selectedOrder.status === 'Preparing' ? 'Being prepared' :
                    selectedOrder.status === 'Cancelled' ? 'Order cancelled' :
                    'Waiting for vendor acceptance'
                  }</p>
                </div>

                <button 
                  className="w-full mt-6 py-4 bg-surface-900 text-white font-bold rounded-2xl hover:bg-black transition-all"
                  onClick={() => setSelectedOrder(null)}
                >
                  Close Receipt
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Toast Message */}
        {toast && (
          <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-2xl shadow-xl z-[2000] flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-surface-900 text-white'}`}>
            {toast.type === 'error' ? <Info size={18}/> : <CheckCircle size={18}/>}
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
