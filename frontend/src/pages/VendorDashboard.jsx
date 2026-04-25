import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, Store, Utensils, Star, Clock, DollarSign, Edit, Trash2, 
  FileText, PenTool, Search, Filter, Coffee, Pizza, Sandwich, 
  CheckCircle, AlertCircle, PauseCircle, Calendar, User, 
  ChevronRight, LayoutDashboard, ClipboardList, Settings,
  Package, TrendingUp, Users, Info, X, Image as ImageIcon
} from 'lucide-react';
import { DashboardLayout } from '../Components/layout/DashboardLayout';
import { getAllOrders, updateOrderStatus } from '../api/ordersApi.js';
import { getAllMenuItems, createMenuItem, updateMenuItem, deleteMenuItem } from '../api/menuItemsApi.js';

export default function VendorDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  
  // Data States
  const [vendor, setVendor] = useState(null);
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [user, setUser] = useState(null);

  // UI / Form States
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [showMenuForm, setShowMenuForm] = useState(false);
  const [editingMenuItem, setEditingMenuItem] = useState(null);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [showProfileForm, setShowProfileForm] = useState(false);
  
  const [menuFormData, setMenuFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'rice',
    available: true,
    preparationTime: 15,
    image: ''
  });

  const [profileFormData, setProfileFormData] = useState({
    name: '',
    description: '',
    location: '',
    phone: '',
    openingTime: '',
    closingTime: '',
    category: 'beverages',
    specialties: [],
    status: 'active'
  });

  const [articleData, setArticleData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'blog',
    tags: [],
    imageUrl: '',
  });

  // Notifications
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  // Fetching Data Logic
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const userData = JSON.parse(localStorage.getItem('user'));
      setUser(userData);
      const token = localStorage.getItem('token');

      // 1. Fetch Vendor Profile
      const profRes = await fetch(`/api/canteen?owner=${userData.id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const profData = await profRes.json();
      const currentVendor = profData.data?.[0] || null;
      setVendor(currentVendor);
      if (currentVendor) {
        setProfileFormData({ ...currentVendor });
      }

      // 2. Fetch Orders
      const orderData = await getAllOrders();
      setOrders(orderData || []);

      // 3. Fetch Menu Items
      if (currentVendor) {
        const menuData = await getAllMenuItems({ vendor: currentVendor._id });
        setMenuItems(menuData || []);
      }

      // 4. Fetch Articles
      const blogRes = await fetch('/api/blogs', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const blogData = await blogRes.json();
      setBlogs(blogData.data || []);

    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      showToast('Failed to sync dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Order Handlers
  const handleOrderStatusUpdate = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      showToast(`Order marked as ${status}`);
      fetchData();
    } catch (err) {
      showToast('Failed to update status', 'error');
    }
  };

  // Menu Handlers
  const handleMenuSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = { ...menuFormData, vendor: vendor._id };
      if (editingMenuItem) {
        await updateMenuItem(editingMenuItem._id, data);
        showToast('Item updated successfully');
      } else {
        await createMenuItem(data);
        showToast('Item added to menu');
      }
      setShowMenuForm(false);
      setEditingMenuItem(null);
      fetchData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Remove this item from menu?')) return;
    try {
      await deleteMenuItem(id);
      showToast('Item removed');
      fetchData();
    } catch (err) {
      showToast('Failed to delete item', 'error');
    }
  };

  // Profile Handlers
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = vendor ? `/api/canteen/${vendor._id}` : '/api/canteen';
      const res = await fetch(url, {
        method: vendor ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...profileFormData, owner: user.id })
      });
      if (res.ok) {
        showToast('Shop profile updated');
        setShowProfileForm(false);
        fetchData();
      }
    } catch (err) {
      showToast('Failed to update profile', 'error');
    }
  };

  const handleArticleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const url = editingBlog ? `/api/blogs/${editingBlog._id}` : '/api/blogs';
      const res = await fetch(url, {
        method: editingBlog ? 'PUT' : 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ ...articleData, author: user.fullName })
      });
      if (res.ok) {
        showToast(editingBlog ? 'Article updated' : 'Article published');
        setShowArticleForm(false);
        setEditingBlog(null);
        fetchData();
      }
    } catch (err) {
      showToast('Failed to save article', 'error');
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm('Delete this article?')) return;
    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/blogs/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      showToast('Article deleted');
      fetchData();
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  // Stats Calculation
  const stats = [
    { label: "Today's Orders", value: orders.filter(o => new Date(o.createdAt).toDateString() === new Date().toDateString()).length, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Pending Orders', value: orders.filter(o => o.status === 'Pending').length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Total Revenue', value: `Rs. ${orders.filter(o => o.status === 'Completed').reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Menu Items', value: menuItems.length, icon: Utensils, color: 'text-purple-600', bg: 'bg-purple-50' }
  ];

  if (loading && !vendor) {
    return (
      <DashboardLayout role="vendor">
        <div className="flex h-96 items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="vendor">
      <div className="max-w-7xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              {vendor?.name || 'Welcome, Vendor'}
            </h1>
            <p className="text-gray-500 mt-1">Manage your campus shop and fulfill orders in real-time.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`p-2 rounded-xl transition-all ${activeTab === 'overview' ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
            >
              <LayoutDashboard size={20}/>
            </button>
            <button 
              onClick={() => setActiveTab('profile')}
              className={`p-2 rounded-xl transition-all ${activeTab === 'profile' ? 'bg-brand-500 text-white' : 'bg-white border border-gray-200 text-gray-500'}`}
            >
              <Settings size={20}/>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-200 gap-8 overflow-x-auto no-scrollbar">
          {[
            { id: 'overview', label: 'Overview', icon: TrendingUp },
            { id: 'menu', label: 'Shop Menu', icon: Utensils },
            { id: 'orders', label: 'Order Board', icon: ClipboardList },
            { id: 'articles', label: 'Articles', icon: PenTool },
            { id: 'profile', label: 'Shop Profile', icon: Store },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-4 text-sm font-bold border-b-2 transition-all ${activeTab === tab.id ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {stats.map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl border border-gray-100 shadow-soft">
                      <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4`}>
                        <stat.icon size={20}/>
                      </div>
                      <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
                      <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Quick Orders List */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="font-bold text-lg">Recent Pending Orders</h3>
                      <button onClick={() => setActiveTab('orders')} className="text-brand-600 text-sm font-bold hover:underline">View All</button>
                    </div>
                    <div className="space-y-4">
                      {orders.filter(o => o.status === 'Pending').slice(0, 5).map(order => (
                        <div key={order._id} className="flex justify-between items-center p-4 bg-gray-50 rounded-xl">
                          <div>
                            <p className="font-bold text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-xs text-gray-500">{order.studentName}</p>
                          </div>
                          <button 
                            onClick={() => handleOrderStatusUpdate(order._id, 'Completed')}
                            className="bg-brand-500 text-white p-2 rounded-lg hover:bg-brand-600 transition-colors"
                          >
                            <CheckCircle size={16}/>
                          </button>
                        </div>
                      ))}
                      {orders.filter(o => o.status === 'Pending').length === 0 && (
                        <p className="text-center text-gray-400 py-8 italic">No pending orders!</p>
                      )}
                    </div>
                  </div>

                  {/* Shop Status Card */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 flex flex-col justify-center items-center text-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 ${vendor?.status === 'active' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                      <Store size={32}/>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">{vendor?.name} is {vendor?.status}</h3>
                    <p className="text-gray-500 mt-2 max-w-xs">{vendor?.location || 'Check Settings to set location'}</p>
                    <button onClick={() => setActiveTab('profile')} className="mt-6 px-6 py-2 border border-gray-200 rounded-xl font-bold text-sm hover:bg-gray-50 transition-colors">
                      Edit Profile
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* MENU TAB */}
            {activeTab === 'menu' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Catalogue Management</h2>
                    <p className="text-sm text-gray-500 mt-1">Add or update food items available in your canteen.</p>
                  </div>
                  <button 
                    onClick={() => { setEditingMenuItem(null); setMenuFormData({ name: '', description: '', price: '', category: 'rice', available: true, preparationTime: 15, image: '' }); setShowMenuForm(true); }}
                    className="flex items-center gap-2 bg-brand-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-brand-600 transition-all shadow-lg shadow-brand-100"
                  >
                    <Plus size={18}/> Add New Item
                  </button>
                </div>

                <div className="space-y-12">
                  {Object.entries(
                    menuItems.reduce((acc, item) => {
                      const cat = item.category || 'other';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(item);
                      return acc;
                    }, {})
                  ).map(([category, items]) => (
                    <div key={category} className="space-y-6">
                      <div className="flex items-center gap-4">
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-[0.2em]">{category}</h3>
                        <div className="h-px flex-1 bg-gray-100 italic"></div>
                        <span className="text-[10px] font-bold text-gray-300">{items.length} Items</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(item => (
                          <div key={item._id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-soft group hover:translate-y-[-4px] transition-all">
                            <div className="h-40 bg-gray-100 relative">
                              {item.image ? (
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400">
                                  <Utensils size={40}/>
                                </div>
                              )}
                              <button 
                                onClick={async () => {
                                  try {
                                    await updateMenuItem(item._id, { ...item, available: !item.available });
                                    showToast(`${item.name} is now ${!item.available ? 'Available' : 'Sold Out'}`);
                                    fetchData();
                                  } catch (err) { showToast('Update failed', 'error'); }
                                }}
                                className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider shadow-lg backdrop-blur-md transition-all cursor-pointer ${item.available ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}`}
                              >
                                {item.available ? '✓ Active' : '✕ Out'}
                              </button>
                            </div>
                            <div className="p-5">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{item.name}</h4>
                                <span className="text-brand-600 font-black">Rs.{item.price}</span>
                              </div>
                              <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed">{item.description}</p>
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => { setEditingMenuItem(item); setMenuFormData({ ...item }); setShowMenuForm(true); }}
                                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-gray-50 text-gray-600 rounded-lg text-xs font-bold hover:bg-brand-50 hover:text-brand-600 transition-colors"
                                >
                                  <Edit size={14}/> Edit Item
                                </button>
                                <button 
                                  onClick={() => handleDeleteItem(item._id)}
                                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-500 hover:text-white transition-colors"
                                >
                                  <Trash2 size={14}/>
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  {menuItems.length === 0 && (
                    <div className="py-20 text-center bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <Utensils size={48} className="mx-auto text-gray-300 mb-4" />
                      <p className="text-gray-500 font-bold">Your menu is empty.</p>
                      <button onClick={() => { setEditingMenuItem(null); setMenuFormData({ name: '', description: '', price: '', category: 'rice', available: true, preparationTime: 15, image: '' }); setShowMenuForm(true); }} className="text-brand-600 mt-2 font-bold hover:underline">Add your first item</button>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ORDERS TAB (Upgraded version integrated) */}
            {activeTab === 'orders' && (
              <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Order Management</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Filter and fulfill customer requests.</p>
                  </div>
                  <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-100">
                    {['All', 'Pending', 'Completed', 'Cancelled'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => setOrderStatusFilter(s)}
                        className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          orderStatusFilter === s 
                            ? 'bg-white text-brand-600 shadow-sm border border-gray-100' 
                            : 'text-gray-400 hover:text-gray-600'
                        }`}
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                      <tr>
                        <th className="px-6 py-4 text-left">Reference</th>
                        <th className="px-6 py-4 text-left">Customer</th>
                        <th className="px-6 py-4 text-left">Amount</th>
                        <th className="px-6 py-4 text-left">Status</th>
                        <th className="px-6 py-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders
                        .filter(o => orderStatusFilter === 'All' || o.status === orderStatusFilter)
                        .sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt))
                        .map(order => (
                        <tr key={order._id} className="hover:bg-gray-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-gray-900 text-sm">#{order._id.slice(-6).toUpperCase()}</p>
                            <p className="text-[10px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleTimeString()}</p>
                          </td>
                          <td className="px-6 py-4">
                            <p className="text-sm font-bold text-gray-900">{order.studentName}</p>
                            <p className="text-xs text-gray-500">{order.phone}</p>
                          </td>
                          <td className="px-6 py-4 font-black text-sm text-gray-900">
                            Rs. {order.totalAmount}
                          </td>
                          <td className="px-6 py-4">
                             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight ${
                                order.status === 'Completed' ? 'bg-green-100 text-green-700' :
                                order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                                order.status === 'Ready' ? 'bg-blue-100 text-blue-700' :
                                order.status === 'Preparing' ? 'bg-indigo-100 text-indigo-700 animate-pulse' :
                                'bg-amber-100 text-amber-700'
                            }`}>
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex justify-center gap-2">
                              {order.status === 'Pending' ? (
                                <div className="flex gap-2">
                                  <button 
                                    onClick={() => handleOrderStatusUpdate(order._id, 'Preparing')} 
                                    className="flex items-center gap-1 px-3 py-1.5 bg-green-500 text-white text-[10px] font-bold rounded-lg hover:bg-green-600 transition-all shadow-sm"
                                  >
                                    Accept
                                  </button>
                                  <button 
                                    onClick={() => handleOrderStatusUpdate(order._id, 'Cancelled')} 
                                    className="flex items-center gap-1 px-3 py-1.5 bg-red-50 text-red-600 text-[10px] font-bold rounded-lg hover:bg-red-100 transition-all border border-red-100"
                                  >
                                    Decline
                                  </button>
                                </div>
                              ) : (
                                <select 
                                  className="bg-gray-50 border border-gray-200 text-gray-700 text-[10px] font-bold rounded-lg px-2 py-1 outline-none focus:ring-1 focus:ring-brand-500"
                                  value={order.status}
                                  onChange={(e) => handleOrderStatusUpdate(order._id, e.target.value)}
                                  disabled={order.status === 'Completed' || order.status === 'Cancelled'}
                                >
                                  <option value="Preparing">Preparing</option>
                                  <option value="Ready">Ready</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Cancelled">Cancelled</option>
                                </select>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ARTICLES TAB */}
            {activeTab === 'articles' && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100">
                  <h2 className="text-xl font-bold">Campus Blog Management</h2>
                  <button onClick={() => { setEditingBlog(null); setArticleData({ title: '', content: '', excerpt: '', category: 'blog', tags: [], imageUrl: '' }); setShowArticleForm(true); }} className="flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition-all">
                    <PenTool size={18}/> Write New Article
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {blogs.map(blog => (
                    <div key={blog._id} className="bg-white p-6 rounded-2xl border border-gray-100 flex justify-between items-center group">
                      <div className="flex gap-6 items-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                          {blog.imageUrl ? <img src={blog.imageUrl} className="w-full h-full object-cover"/> : <FileText size={24} className="m-7 text-gray-300"/>}
                        </div>
                        <div>
                          <p className="text-[10px] font-black text-brand-600 uppercase mb-1">{blog.category}</p>
                          <h4 className="font-bold text-gray-900 group-hover:text-brand-600 transition-colors">{blog.title}</h4>
                          <p className="text-gray-500 text-xs mt-1">{new Date(blog.createdAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingBlog(blog); setArticleData({ ...blog }); setShowArticleForm(true); }} className="p-2 text-gray-400 hover:text-gray-900 transition-colors"><Edit size={18}/></button>
                        <button onClick={() => handleDeleteBlog(blog._id)} className="p-2 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={18}/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-soft">
                <div className="h-32 bg-gray-900 relative">
                  <div className="absolute -bottom-10 left-8 w-20 h-20 bg-white p-2 rounded-2xl shadow-lg">
                    <div className="w-full h-full bg-brand-50 text-brand-500 flex items-center justify-center rounded-xl">
                      <Store size={32}/>
                    </div>
                  </div>
                </div>
                <div className="p-8 pt-14">
                  <div className="flex justify-between items-start mb-8">
                    <div>
                      <h2 className="text-2xl font-black text-gray-900">{vendor?.name || 'Your Canteen'}</h2>
                      <p className="text-gray-500 font-medium">Campus Food Vendor Profile</p>
                    </div>
                    <button onClick={() => setShowProfileForm(true)} className="flex items-center gap-2 bg-brand-50 text-brand-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-brand-100 transition-colors">
                      <Edit size={16}/> Edit Details
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-8 py-8 border-y border-gray-50">
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <Clock size={18} className="text-gray-400"/>
                        <span className="text-sm font-medium">{vendor?.openingTime || '--:--'} - {vendor?.closingTime || '--:--'}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <Info size={18} className="text-gray-400"/>
                        <span className="text-sm font-medium capitalize">{vendor?.category || 'Catering'}</span>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center gap-3 text-gray-600">
                        <CheckCircle size={18} className="text-green-500"/>
                        <span className="text-sm font-bold text-green-600 uppercase tracking-wide">{vendor?.status}</span>
                      </div>
                      <div className="flex items-center gap-3 text-gray-600">
                        <DollarSign size={18} className="text-gray-400"/>
                        <span className="text-sm font-medium">{vendor?.priceRange || '$$'} Moderate</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8">
                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">About the Shop</h4>
                    <p className="text-gray-600 leading-relaxed text-sm italic">"{vendor?.description || 'Add a description to tell students more about your delicacies.'}"</p>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* --- MODALS --- */}
        
        {/* Menu Item Form Modal */}
        <AnimatePresence>
          {showMenuForm && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">{editingMenuItem ? 'Edit Menu Item' : 'New Menu Offering'}</h3>
                  <button onClick={() => setShowMenuForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                <div className="flex gap-8">
                  {/* Form Side */}
                  <form onSubmit={handleMenuSubmit} className="flex-1 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Item Name</label>
                        <input 
                          type="text" 
                          required 
                          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-500"
                          value={menuFormData.name}
                          onChange={e => setMenuFormData({...menuFormData, name: e.target.value})}
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Price (Rs.)</label>
                        <input 
                          type="number" 
                          required 
                          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-500"
                          value={menuFormData.price}
                          onChange={e => setMenuFormData({...menuFormData, price: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Description</label>
                      <textarea 
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-24 outline-none focus:border-brand-500 text-sm"
                        value={menuFormData.description}
                        onChange={e => setMenuFormData({...menuFormData, description: e.target.value})}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Category</label>
                        <select 
                          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-500"
                          value={menuFormData.category}
                          onChange={e => setMenuFormData({...menuFormData, category: e.target.value})}
                        >
                          <option value="rice">Rice & Curries</option>
                          <option value="snack">Fast Food / Snacks</option>
                          <option value="beverage">Drinks</option>
                          <option value="dessert">Desserts</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase">Prep Time (Mins)</label>
                        <input 
                          type="number" 
                          className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-500"
                          value={menuFormData.preparationTime}
                          onChange={e => setMenuFormData({...menuFormData, preparationTime: e.target.value})}
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase">Image URL (Optional)</label>
                      <input 
                        type="text" 
                        placeholder="https://example.com/food.jpg"
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none focus:border-brand-500 text-sm"
                        value={menuFormData.image}
                        onChange={e => setMenuFormData({...menuFormData, image: e.target.value})}
                      />
                    </div>
                    <button type="submit" className="w-full py-4 bg-brand-500 text-white font-black rounded-2xl shadow-xl shadow-brand-100 hover:bg-brand-600 transition-all mt-4">
                      {editingMenuItem ? 'Update Item' : 'Publish to Menu'}
                    </button>
                  </form>

                  {/* Preview Side */}
                  <div className="hidden lg:block w-64 space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Live Preview</label>
                    <div className="bg-white rounded-2xl border-2 border-dashed border-gray-100 p-4">
                      <div className="h-32 bg-gray-50 rounded-xl mb-4 flex items-center justify-center overflow-hidden">
                        {menuFormData.image ? (
                          <img src={menuFormData.image} alt="Preview" className="w-full h-full object-cover" />
                        ) : (
                          <Utensils size={24} className="text-gray-300"/>
                        )}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <h4 className="font-bold text-sm text-gray-900 leading-tight">
                            {menuFormData.name || 'Delicious Item'}
                          </h4>
                          <span className="text-brand-600 font-black text-xs">
                             {menuFormData.price ? `Rs.${menuFormData.price}` : 'Rs.0'}
                          </span>
                        </div>
                        <p className="text-[10px] text-gray-400 line-clamp-2">
                          {menuFormData.description || 'Description of your item will appear here...'}
                        </p>
                      </div>
                      <div className="mt-4 flex gap-1">
                        <div className="h-6 flex-1 bg-gray-900 text-white text-[10px] font-bold rounded flex items-center justify-center">Order Now</div>
                        <div className="h-6 w-8 bg-gray-100 rounded"></div>
                      </div>
                    </div>
                    <p className="text-[10px] text-gray-400 italic font-medium leading-relaxed">
                      This is how your students will see this item in their dashboard.
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Article Form Modal */}
        <AnimatePresence>
          {showArticleForm && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-2xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">{editingBlog ? 'Edit Article' : 'Write New Article'}</h3>
                  <button onClick={() => { setShowArticleForm(false); setEditingBlog(null); }} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleArticleSubmit} className="space-y-6">
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Article Title</label>
                    <input 
                      type="text" 
                      required 
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl text-lg font-bold outline-none focus:border-brand-500 transition-all"
                      placeholder="Enter a catchy title..."
                      value={articleData.title}
                      onChange={e => setArticleData({...articleData, title: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Category</label>
                      <select 
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl font-bold text-sm outline-none"
                        value={articleData.category}
                        onChange={e => setArticleData({...articleData, category: e.target.value})}
                      >
                        <option value="blog">Blog Post</option>
                        <option value="news">Campus News</option>
                        <option value="announcement">Promo/Announcement</option>
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Cover Image URL</label>
                      <input 
                        type="text" 
                        className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl outline-none"
                        placeholder="https://..."
                        value={articleData.imageUrl}
                        onChange={e => setArticleData({...articleData, imageUrl: e.target.value})}
                      />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Short Excerpt (Search Preview)</label>
                    <textarea 
                      className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl h-20 outline-none text-sm"
                      placeholder="A brief summary of your article..."
                      value={articleData.excerpt}
                      onChange={e => setArticleData({...articleData, excerpt: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Content</label>
                    <textarea 
                      required
                      className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl h-64 outline-none text-sm leading-relaxed"
                      placeholder="Start writing your thoughts here..."
                      value={articleData.content}
                      onChange={e => setArticleData({...articleData, content: e.target.value})}
                    />
                  </div>

                  <button type="submit" className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                    <PenTool size={18}/>
                    {editingBlog ? 'Update Article' : 'Publish Article'}
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Profile Update Modal */}
        <AnimatePresence>
          {showProfileForm && (
            <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-[1000] flex items-center justify-center p-4">
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-xl rounded-3xl p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-xl font-black">Shop Configuration</h3>
                  <button onClick={() => setShowProfileForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X size={20}/></button>
                </div>
                <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="col-span-full space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Shop Name</label>
                    <input type="text" required className="w-full p-3 shadow-soft border border-gray-100 rounded-xl" value={profileFormData.name} onChange={e => setProfileFormData({...profileFormData, name: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Contact Phone</label>
                    <input type="text" className="w-full p-3 shadow-soft border border-gray-100 rounded-xl" value={profileFormData.phone} onChange={e => setProfileFormData({...profileFormData, phone: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Location</label>
                    <input type="text" className="w-full p-3 shadow-soft border border-gray-100 rounded-xl" value={profileFormData.location} onChange={e => setProfileFormData({...profileFormData, location: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Opening Time</label>
                    <input type="time" className="w-full p-3 shadow-soft border border-gray-100 rounded-xl" value={profileFormData.openingTime} onChange={e => setProfileFormData({...profileFormData, openingTime: e.target.value})} />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Closing Time</label>
                    <input type="time" className="w-full p-3 shadow-soft border border-gray-100 rounded-xl" value={profileFormData.closingTime} onChange={e => setProfileFormData({...profileFormData, closingTime: e.target.value})} />
                  </div>
                  <div className="col-span-full space-y-1">
                    <label className="text-[10px] font-black text-gray-400 uppercase">Description</label>
                    <textarea className="w-full p-3 shadow-soft border border-gray-100 rounded-xl h-24" value={profileFormData.description} onChange={e => setProfileFormData({...profileFormData, description: e.target.value})} />
                  </div>
                  <button type="submit" className="col-span-full py-4 bg-gray-900 text-white font-black rounded-2xl hover:bg-black transition-all mt-4">
                    Save Shop Profile
                  </button>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Toast */}
        {toast && (
          <div className={`fixed bottom-8 right-8 px-6 py-3 rounded-2xl shadow-xl z-[2000] flex items-center gap-2 ${toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-surface-900 text-white'}`}>
            {toast.type === 'error' ? <AlertCircle size={18}/> : <CheckCircle size={18}/>}
            <span className="text-sm font-bold">{toast.message}</span>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}