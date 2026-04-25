import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, StoreIcon, UtensilsIcon, StarIcon, ClockIcon, DollarSignIcon, EditIcon, TrashIcon, FileTextIcon, PenToolIcon, SearchIcon, FilterIcon, CoffeeIcon, PizzaIcon, SandwichIcon, CheckCircleIcon, AlertCircleIcon, PauseCircleIcon, CalendarIcon, UserIcon } from 'lucide-react';
import { Navbar } from '../Components/layout/Navbar';
import { getAllOrders, updateOrderStatus } from '../api/ordersApi.js';

export function VendorDashboard() {
  const [vendor, setVendor] = useState(null);
  const [vendors, setVendors] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showArticleForm, setShowArticleForm] = useState(false);
  const [activeTab, setActiveTab] = useState('vendor');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [editingVendor, setEditingVendor] = useState(null);
  const [editingBlog, setEditingBlog] = useState(null);
  const [user, setUser] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [articleErrors, setArticleErrors] = useState({});
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'beverages',
    description: '',
    openingTime: '',
    closingTime: '',
    location: '',
    phone: '',
    specialties: [],
    priceRange: '$$',
    image: '',
    status: 'active',
  });
  const [articleData, setArticleData] = useState({
    title: '',
    content: '',
    excerpt: '',
    category: 'blog',
    tags: [],
    imageUrl: '',
  });

  const categories = [
    { id: 'all', name: 'All', icon: UtensilsIcon },
    { id: 'beverages', name: 'Beverages', icon: CoffeeIcon },
    { id: 'snacks', name: 'Snacks', icon: SandwichIcon },
    { id: 'meals', name: 'Meals', icon: PizzaIcon },
  ];

  const statusOptions = [
    { id: 'active', name: 'Active', icon: CheckCircleIcon, color: 'text-green-600' },
    { id: 'inactive', name: 'Inactive', icon: PauseCircleIcon, color: 'text-gray-600' },
    { id: 'maintenance', name: 'Maintenance', icon: AlertCircleIcon, color: 'text-yellow-600' },
  ];

  const priceRanges = [
    { id: '$', name: 'Budget ($)' },
    { id: '$$', name: 'Moderate ($$)' },
    { id: '$$$', name: 'Expensive ($$$)' },
    { id: '$$$$', name: 'Premium ($$$$)' },
  ];

  const articleCategories = [
    { id: 'blog', name: 'Blog Post' },
    { id: 'news', name: 'News Article' },
    { id: 'announcement', name: 'Announcement' },
  ];

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user'));
    setUser(userData);
    fetchVendorProfile();
    fetchAllBlogs();
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setOrdersLoading(true);
      const data = await getAllOrders();
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching vendor orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleUpdateOrderStatus = async (id, status) => {
    try {
      await updateOrderStatus(id, status);
      fetchOrders();
      alert(`Order status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update status');
    }
  };

  const fetchAllBlogs = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/api/blogs', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setBlogs(data.data || []);
      } else {
        console.error('Failed to fetch blogs:', data.message);
        setBlogs([]);
      }
    } catch (error) {
      console.error('Error fetching blogs:', error);
      setBlogs([]);
    }
  };

  const fetchVendorProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      const userData = JSON.parse(localStorage.getItem('user'));
      
      // Fetch only the canteen owned by this user, regardless of role (admin or vendor)
      const url = `http://localhost:3000/api/canteen?owner=${userData.id}`;
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setVendors(data.data || []);
        // Set the owned canteen
        setVendor(data.data?.[0] || null);
      } else {
        console.error('Failed to fetch vendors:', data.message);
        setVendors([]);
        setVendor(null);
      }
    } catch (error) {
      console.error('Error fetching vendor profile:', error);
      setVendors([]);
      setVendor(null);
    } finally {
      setLoading(false);
    }
  };

  const handleAddVendor = async (e) => {
    e.preventDefault();
    if (!validateVendorForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingVendor 
        ? `http://localhost:3000/api/canteen/${editingVendor._id}`
        : 'http://localhost:3000/api/canteen';
      
      const response = await fetch(url, {
        method: editingVendor ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingVendor(null);
        setFormErrors({});
        fetchVendorProfile();
        setFormData({
          name: '',
          category: 'beverages',
          description: '',
          openingTime: '',
          closingTime: '',
          location: '',
          phone: '',
          specialties: [],
          priceRange: '$$',
          image: '',
          status: 'active',
        });
        alert(editingVendor ? 'Vendor updated successfully!' : 'Vendor added successfully!');
      }
    } catch (error) {
      console.error('Error adding/updating vendor:', error);
      alert('Error saving vendor');
    }
  };

  const handleEditVendor = (vendor) => {
    setEditingVendor(vendor);
    setFormData({
      name: vendor?.name || '',
      category: vendor?.category || 'beverages',
      description: vendor?.description || '',
      openingTime: vendor?.openingTime || '',
      closingTime: vendor?.closingTime || '',
      location: vendor?.location || '',
      phone: vendor?.phone || '',
      specialties: vendor?.specialties || [],
      priceRange: vendor?.priceRange || '$$',
      image: vendor?.image || '',
      status: vendor?.status || 'active',
    });
    setShowAddForm(true);
  };

  const handleDeleteVendor = async (id) => {
    if (window.confirm('Are you sure you want to delete this vendor?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/canteen/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchVendorProfile();
          alert('Vendor deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting vendor:', error);
        alert('Error deleting vendor');
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    // Clear the specific error when user starts typing
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSpecialtiesChange = (e) => {
    const value = e.target.value;
    
    // Clear error
    if (formErrors.specialties) {
      setFormErrors(prev => ({ ...prev, specialties: undefined }));
    }

    if (!value.trim()) {
      setFormData(prev => ({
        ...prev,
        specialties: [],
      }));
      return;
    }
    const specialties = value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      specialties,
    }));
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
    if (!validateArticleForm()) {
      return;
    }
    
    try {
      const token = localStorage.getItem('token');
      const url = editingBlog 
        ? `http://localhost:3000/api/blogs/${editingBlog._id}`
        : 'http://localhost:3000/api/blogs';
      
      const response = await fetch(url, {
        method: editingBlog ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...articleData,
          author: user?.fullName || 'Vendor',
        }),
      });

      if (response.ok) {
        setShowArticleForm(false);
        setEditingBlog(null);
        setArticleErrors({});
        fetchAllBlogs();
        setArticleData({
          title: '',
          content: '',
          excerpt: '',
          category: 'blog',
          tags: [],
          imageUrl: '',
        });
        alert(editingBlog ? 'Article updated successfully!' : 'Article added successfully!');
      }
    } catch (error) {
      console.error('Error adding/updating article:', error);
      alert('Error saving article');
    }
  };

  const handleEditBlog = (blog) => {
    setEditingBlog(blog);
    setArticleData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      category: blog.category,
      tags: blog.tags || [],
      imageUrl: blog.imageUrl || '',
    });
    setShowArticleForm(true);
  };

  const handleDeleteBlog = async (id) => {
    if (window.confirm('Are you sure you want to delete this article?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/blogs/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchAllBlogs();
          alert('Article deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting article:', error);
        alert('Error deleting article');
      }
    }
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(t => t.trim()).filter(t => t);
    setArticleData(prev => ({
      ...prev,
      tags,
    }));
  };

  const handleArticleInputChange = (e) => {
    const { name, value } = e.target;
    setArticleData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (articleErrors[name]) {
      setArticleErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Validation functions
  const validateVendorForm = () => {
    const errors = {};
    
    // Name validation
    if (!formData.name.trim()) {
      errors.name = 'Vendor name is required';
    } else if (formData.name.trim().length < 2) {
      errors.name = 'Vendor name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      errors.name = 'Vendor name must be less than 50 characters';
    }
    
    // Category validation
    if (!formData.category) {
      errors.category = 'Category is required';
    }
    
    // Description validation
    if (!formData.description.trim()) {
      errors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      errors.description = 'Description must be at least 10 characters';
    } else if (formData.description.trim().length > 500) {
      errors.description = 'Description must be less than 500 characters';
    }
    
    const parseTime = (timeStr) => {
      const match = timeStr.trim().match(/^(1[0-2]|0?[1-9]):([0-5][0-9])\s?(AM|PM|am|pm)$/i);
      if (!match) return null;
      let hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const period = match[3].toUpperCase();
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return hours + (minutes / 60);
    };

    let openTimeVal = null;
    let closeTimeVal = null;
    
    // Opening Time validation
    if (!formData.openingTime.trim()) {
      errors.openingTime = 'Opening time is required';
    } else {
      openTimeVal = parseTime(formData.openingTime);
      if (openTimeVal === null) {
        errors.openingTime = 'Please enter a valid time (e.g., 8:00 AM)';
      }
    }
    
    // Closing Time validation
    if (!formData.closingTime.trim()) {
      errors.closingTime = 'Closing time is required';
    } else {
      closeTimeVal = parseTime(formData.closingTime);
      if (closeTimeVal === null) {
        errors.closingTime = 'Please enter a valid time (e.g., 8:00 PM)';
      }
    }

    if (openTimeVal !== null && closeTimeVal !== null) {
      if (closeTimeVal <= openTimeVal) {
        errors.closingTime = 'Closing time must be after opening time';
      }
    }
    
    // Location validation
    if (!formData.location.trim()) {
      errors.location = 'Location is required';
    } else if (formData.location.trim().length < 3) {
      errors.location = 'Location must be at least 3 characters';
    } else if (formData.location.trim().length > 100) {
      errors.location = 'Location must be less than 100 characters';
    }
    
    // Phone validation
    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required';
    } else if (!/^\+?[\d\s\-\(\)]{10}$/.test(formData.phone.replace(/\s/g, ''))) {
      errors.phone = 'Phone number must be 10 digits (e.g., 0771234567 or +94771234567)';
    } else if (formData.phone.replace(/\D/g, '').length < 10) {
      errors.phone = 'Phone number must be at least 10 digits';
    } else if (formData.phone.replace(/\D/g, '').length > 10) {
      errors.phone = 'Phone number must not exceed 10 digits';
    }
    
    // Image validation
    if (formData.image && !formData.image.startsWith('data:') && !formData.image.startsWith('http') && !formData.image.startsWith('/')) {
      errors.image = 'Please enter a valid image URL or base64 data';
    }
    
    // Specialties validation
    if (formData.specialties.length === 0) {
      errors.specialties = 'Please add at least one specialty';
    } else if (formData.specialties.length > 10) {
      errors.specialties = 'Maximum 10 specialties allowed';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateArticleForm = () => {
    const errors = {};
    
    if (!articleData.title.trim()) {
      errors.title = 'Article title is required';
    } else if (articleData.title.trim().length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }
    
    if (!articleData.content.trim()) {
      errors.content = 'Content is required';
    } else if (articleData.content.trim().length < 20) {
      errors.content = 'Content must be at least 20 characters';
    }
    
    if (articleData.excerpt && articleData.excerpt.trim().length > 200) {
      errors.excerpt = 'Excerpt must be less than 200 characters';
    }
    
    if (articleData.imageUrl && !articleData.imageUrl.startsWith('http') && !articleData.imageUrl.startsWith('/') && !articleData.imageUrl.startsWith('data:')) {
      errors.imageUrl = 'Please enter a valid image URL';
    }
    
    setArticleErrors(errors);
    return Object.keys(errors).length === 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96">
          <div className="text-gray-500">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Vendor Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your canteen vendor profile and content</p>
            </div>
            <div className="flex gap-2">
              {!vendor && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
                >
                  <PlusIcon size={18} />
                  Add Vendor
                </button>
              )}
              <button
                onClick={() => setShowArticleForm(true)}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                <PenToolIcon size={18} />
                Write Article
              </button>
            </div>
          </div>

          <div className="flex gap-1 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setActiveTab('vendor')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'vendor'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <StoreIcon size={18} className="inline mr-2" />
              Vendor Profile
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'articles'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <FileTextIcon size={18} className="inline mr-2" />
              Articles
            </button>
            <button
              onClick={() => {
                setActiveTab('orders');
                fetchOrders();
              }}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'orders'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <ClockIcon size={18} className="inline mr-2" />
              Orders
            </button>
          </div>
        </motion.div>

        {/* Add/Edit Vendor Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingVendor ? 'Edit Vendor' : 'Add New Vendor'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingVendor(null);
                  setFormErrors({});
                  setFormData({
                    name: '',
                    category: 'beverages',
                    description: '',
                    openingTime: '',
                    closingTime: '',
                    location: '',
                    phone: '',
                    specialties: [],
                    priceRange: '$$',
                    image: '',
                    status: 'active',
                  });
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddVendor} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendor Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      formErrors.category ? 'border-red-500' : 'border-gray-300'
                    }`}
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                  {formErrors.category && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.category}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description *</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    formErrors.description ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.description && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Opening Time *</label>
                  <input
                    type="text"
                    name="openingTime"
                    value={formData.openingTime}
                    onChange={handleInputChange}
                    placeholder="e.g., 8:00 AM"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      formErrors.openingTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.openingTime && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.openingTime}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Closing Time *</label>
                  <input
                    type="text"
                    name="closingTime"
                    value={formData.closingTime}
                    onChange={handleInputChange}
                    placeholder="e.g., 8:00 PM"
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      formErrors.closingTime ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.closingTime && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.closingTime}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Location *</label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      formErrors.location ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.location && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                      formErrors.phone ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Status *</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {statusOptions.map(status => (
                      <option key={status.id} value={status.id}>{status.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                  <select
                    name="priceRange"
                    value={formData.priceRange}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {priceRanges.map(range => (
                      <option key={range.id} value={range.id}>{range.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma-separated)</label>
                <input
                  type="text"
                  name="specialties"
                  value={formData.specialties.join(', ')}
                  onChange={handleSpecialtiesChange}
                  placeholder="e.g., Coffee, Sandwiches, Pasta"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    formErrors.specialties ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.specialties && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.specialties}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    formErrors.image ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {formErrors.image && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.image}</p>
                )}
                {formData.image && (
                  <div className="mt-2">
                    <img 
                      src={formData.image} 
                      alt="Preview" 
                      className="h-32 w-32 object-cover rounded-lg border border-gray-200"
                      onError={(e) => {
                        e.target.src = 'https://picsum.photos/seed/invalid/128/128.jpg';
                      }}
                    />
                    <p className="text-xs text-gray-500 mt-1">Image preview</p>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingVendor(null);
                    setFormErrors({});
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  {editingVendor ? 'Update Vendor' : 'Add Vendor'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Article Form */}
        {showArticleForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingBlog ? 'Edit Article' : 'Create New Article'}
              </h2>
              <button 
                onClick={() => {
                  setShowArticleForm(false);
                  setEditingBlog(null);
                  setArticleData({
                    title: '',
                    content: '',
                    excerpt: '',
                    category: 'blog',
                    tags: [],
                    imageUrl: '',
                  });
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAddArticle} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Article Title *</label>
                <input
                  type="text"
                  name="title"
                  value={articleData.title}
                  onChange={handleArticleInputChange}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    articleErrors.title ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {articleErrors.title && (
                  <p className="mt-1 text-sm text-red-600">{articleErrors.title}</p>
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <select
                    name="category"
                    value={articleData.category}
                    onChange={handleArticleInputChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {articleCategories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tags (comma-separated)</label>
                  <input
                    type="text"
                    name="tags"
                    value={articleData.tags.join(', ')}
                    onChange={handleTagsChange}
                    placeholder="e.g., food, promotion, update"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Excerpt</label>
                <textarea
                  name="excerpt"
                  value={articleData.excerpt}
                  onChange={handleArticleInputChange}
                  rows={2}
                  placeholder="Brief description of your article"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    articleErrors.excerpt ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {articleErrors.excerpt && (
                  <p className="mt-1 text-sm text-red-600">{articleErrors.excerpt}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Content *</label>
                <textarea
                  name="content"
                  value={articleData.content}
                  onChange={handleArticleInputChange}
                  required
                  rows={8}
                  placeholder="Write your article content here..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    articleErrors.content ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {articleErrors.content && (
                  <p className="mt-1 text-sm text-red-600">{articleErrors.content}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={articleData.imageUrl}
                  onChange={handleArticleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${
                    articleErrors.imageUrl ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {articleErrors.imageUrl && (
                  <p className="mt-1 text-sm text-red-600">{articleErrors.imageUrl}</p>
                )}
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowArticleForm(false);
                    setEditingBlog(null);
                    setArticleErrors({});
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  {editingBlog ? 'Update Article' : 'Add Article'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Vendor Profile */}
        {activeTab === 'vendor' && !showAddForm && !showArticleForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Vendor Profile Header */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">Vendor Profile</h2>
                  <p className="text-gray-600">Manage your canteen vendor information</p>
                </div>
                <button
                  onClick={() => {
                    setEditingVendor(vendor);
                    setFormData({
                      name: vendor?.name || '',
                      category: vendor?.category || 'beverages',
                      description: vendor?.description || '',
                      openingTime: vendor?.openingTime || '',
                      closingTime: vendor?.closingTime || '',
                      location: vendor?.location || '',
                      phone: vendor?.phone || '',
                      specialties: vendor?.specialties || [],
                      priceRange: vendor?.priceRange || '$$',
                      image: vendor?.image || '',
                      status: vendor?.status || 'active',
                    });
                    setShowAddForm(true);
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  <EditIcon size={16} />
                  Edit Profile
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {/* Image Display */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Canteen Image</h3>
                    <div className="space-y-3">
                      {vendor?.image ? (
                        <img 
                          src={vendor.image} 
                          alt="Canteen" 
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                          onError={(e) => {
                            e.target.src = 'https://picsum.photos/seed/noimage/400/200.jpg';
                          }}
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 rounded-lg border border-gray-200 flex items-center justify-center">
                          <p className="text-gray-500">No image uploaded</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <StoreIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Business Name</p>
                          <p className="font-medium text-gray-900">{vendor?.name || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <UtensilsIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium text-gray-900 capitalize">{vendor?.category || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSignIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Price Range</p>
                          <p className="font-medium text-gray-900">{vendor?.priceRange || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact & Location */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Contact & Location</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ClockIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Operating Hours</p>
                          <p className="font-medium text-gray-900">
                            {vendor?.openingTime && vendor?.closingTime 
                              ? `${vendor.openingTime} - ${vendor.closingTime}`
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StoreIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">{vendor?.location || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <EditIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{vendor?.phone || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
      {vendor?.description && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{vendor?.description}</p>
        </div>
      )}

      {/* Specialties */}
      {vendor?.specialties && vendor.specialties.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {vendor?.specialties?.map((specialty, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-sm font-medium"
              >
                {specialty}
              </span>
            ))}
          </div>
        </div>
      )}

           {/* Status */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Status</p>
            <div className="flex items-center gap-2 mt-1">
             <div className="flex items-center gap-2 mt-1">
  {vendor?.status === 'active' ? (
    <>
      <CheckCircleIcon size={20} className="text-green-600" />
      <span className="font-medium text-green-600">Active</span>
    </>
  ) : vendor?.status === 'maintenance' ? (
    <>
      <AlertCircleIcon size={20} className="text-yellow-600" />
      <span className="font-medium text-yellow-600">Maintenance</span>
    </>
  ) : vendor?.status === 'inactive' ? (
    <>
      <PauseCircleIcon size={20} className="text-gray-600" />
      <span className="font-medium text-gray-600">Inactive</span>
    </>
  ) : null}
</div>
            </div>

            
          </div>
        </div>
      </div>

    </div> {/* card */}
  </motion.div>
)} {/* end vendor tab */}

        {/* Articles Tab */}
        {activeTab === 'articles' && !showArticleForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Your Articles</h2>
                <button
                  onClick={() => setShowArticleForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  <PlusIcon size={16} />
                  Write Article
                </button>
              </div>

              {blogs.length === 0 ? (
                <div className="text-center py-12">
                  <FileTextIcon size={48} className="mx-auto text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No articles yet</h3>
                  <p className="text-gray-500 mb-4">Start by writing your first article</p>
                  <button
                    onClick={() => setShowArticleForm(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    Write Article
                  </button>
                </div>
              ) : (
                <div className="grid gap-6">
                  {blogs.map((blog) => (
                    <motion.div
                      key={blog._id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{blog.title}</h3>
                          {blog.excerpt && (
                            <p className="text-gray-600 mb-3">{blog.excerpt}</p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <CalendarIcon size={16} />
                              {new Date(blog.createdAt).toLocaleDateString()}
                            </span>
                            <span className="flex items-center gap-1">
                              <UserIcon size={16} />
                              {blog.author?.fullName || blog.author || 'Unknown'}
                            </span>
                            <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                              {blog.category}
                            </span>
                          </div>
                          {blog.tags && blog.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-3">
                              {blog.tags.map((tag, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs"
                                >
                                  {tag}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                        {blog.imageUrl && (
                          <img
                            src={blog.imageUrl}
                            alt={blog.title}
                            className="w-24 h-24 object-cover rounded-lg ml-4"
                            onError={(e) => {
                              e.target.src = 'https://picsum.photos/seed/article/96/96.jpg';
                            }}
                          />
                        )}
                      </div>
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEditBlog(blog)}
                          className="px-3 py-1 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        >
                          <EditIcon size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteBlog(blog._id)}
                          className="px-3 py-1 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <TrashIcon size={16} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Orders Tab */}
        {activeTab === 'orders' && !showAddForm && !showArticleForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Orders Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  label: "Today's Orders", 
                  value: orders.filter(o => {
                    const orderDate = new Date(o.createdAt);
                    const today = new Date();
                    return orderDate.getDate() === today.getDate() && 
                           orderDate.getMonth() === today.getMonth() && 
                           orderDate.getFullYear() === today.getFullYear();
                  }).length, 
                  icon: Package, 
                  color: 'bg-blue-50 text-blue-600' 
                },
                { 
                  label: "Pending Orders", 
                  value: orders.filter(o => o.status === 'Pending').length, 
                  icon: ClockIcon, 
                  color: 'bg-amber-50 text-amber-600' 
                },
                { 
                  label: "Total Revenue", 
                  value: `Rs. ${orders.filter(o => o.status === 'Completed').reduce((acc, o) => acc + (o.totalAmount || 0), 0).toLocaleString()}`, 
                  icon: DollarSignIcon, 
                  color: 'bg-success-50 text-success-600' 
                }
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-2xl p-6 shadow-soft border border-gray-100 flex items-center gap-4">
                  <div className={`p-3 rounded-xl ${stat.color}`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white rounded-2xl shadow-card border border-gray-100 overflow-hidden">
              <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Manage Orders</h2>
                  <p className="text-sm text-gray-500 mt-0.5">Real-time view of customer requests</p>
                </div>
                <button
                  onClick={fetchOrders}
                  className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  <ClockIcon size={16} />
                  Refresh
                </button>
              </div>

              {ordersLoading ? (
                <div className="flex flex-col items-center justify-center py-20 bg-gray-50/50">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500 mb-4"></div>
                  <p className="text-gray-500 font-medium">Fetching orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-24">
                  <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <UtensilsIcon size={32} className="text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">No Orders Yet</h3>
                  <p className="text-gray-500 max-w-xs mx-auto mt-1">When customers place orders from your canteen, they will appear here.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <tr>
                        <th className="px-6 py-4 text-left font-bold">Order Details</th>
                        <th className="px-6 py-4 text-left font-bold">Customer</th>
                        <th className="px-6 py-4 text-left font-bold">Total Amount</th>
                        <th className="px-6 py-4 text-left font-bold">Status</th>
                        <th className="px-6 py-4 text-center font-bold">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((order) => (
                        <tr key={order._id} className="group hover:bg-surface-50 transition-colors">
                          <td className="px-6 py-5">
                            <div className="font-bold text-gray-900">#{order._id.slice(-6).toUpperCase()}</div>
                            <div className="text-xs text-brand-600 font-medium mt-1 uppercase">{order.orderType || 'Pickup'}</div>
                            <div className="text-[11px] text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center font-bold text-sm">
                                {order.studentName?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="text-sm font-bold text-gray-900">{order.studentName}</div>
                                <div className="text-xs text-gray-500">{order.phone}</div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-5 font-bold text-gray-900 text-sm">
                            Rs. {order.totalAmount?.toLocaleString()}
                          </td>
                          <td className="px-6 py-5">
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-tight ${
                              order.status === 'Completed' ? 'bg-success-100 text-success-700' :
                              order.status === 'Cancelled' ? 'bg-red-100 text-red-700' :
                              'bg-amber-100 text-amber-700 animate-pulse'
                            }`}>
                              {order.status === 'Pending' ? '⏱ ' : order.status === 'Completed' ? '✓ ' : '✕ '}
                              {order.status}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <div className="flex items-center justify-center gap-2">
                              {order.status === 'Pending' ? (
                                <>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order._id, 'Completed')}
                                    className="p-2 text-success-600 hover:bg-success-50 rounded-xl transition-all hover:scale-110"
                                    title="Mark as Completed"
                                  >
                                    <CheckCircleIcon size={20} />
                                  </button>
                                  <button
                                    onClick={() => handleUpdateOrderStatus(order._id, 'Cancelled')}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-xl transition-all hover:scale-110"
                                    title="Cancel Order"
                                  >
                                    <TrashIcon size={20} />
                                  </button>
                                </>
                              ) : (
                                <button
                                  className="p-2 text-gray-400 hover:bg-gray-50 rounded-xl transition-all cursor-not-allowed"
                                  title="View Details"
                                >
                                  <ChevronRight size={20} />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </motion.div>
        )}

      </div> 
    </div> 
  );
}