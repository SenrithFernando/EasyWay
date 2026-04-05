import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PlusIcon, StoreIcon, UtensilsIcon, StarIcon, ClockIcon, DollarSignIcon, EditIcon, TrashIcon, FileTextIcon, PenToolIcon, SearchIcon, FilterIcon, CoffeeIcon, PizzaIcon, SandwichIcon, CheckCircleIcon, AlertCircleIcon, PauseCircleIcon } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

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
  }, []);

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
      name: vendor.name,
      category: vendor.category,
      description: vendor.description,
      openingTime: vendor.openingTime,
      closingTime: vendor.closingTime,
      location: vendor.location,
      phone: vendor.phone,
      specialties: vendor.specialties,
      priceRange: vendor.priceRange,
      image: vendor.image,
      status: vendor.status,
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
  };

  const handleSpecialtiesChange = (e) => {
    const specialties = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      specialties,
    }));
  };

  const handleAddArticle = async (e) => {
    e.preventDefault();
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  name="image"
                  value={formData.image}
                  onChange={handleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingVendor(null);
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                <input
                  type="text"
                  name="imageUrl"
                  value={articleData.imageUrl}
                  onChange={handleArticleInputChange}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowArticleForm(false);
                    setEditingBlog(null);
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
                      name: vendor.name || '',
                      category: vendor.category || 'beverages',
                      description: vendor.description || '',
                      openingTime: vendor.openingTime || '',
                      closingTime: vendor.closingTime || '',
                      location: vendor.location || '',
                      phone: vendor.phone || '',
                      specialties: vendor.specialties || [],
                      priceRange: vendor.priceRange || '$$',
                      image: vendor.image || '',
                      status: vendor.status || 'active',
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
                {/* Basic Info */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <StoreIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Business Name</p>
                          <p className="font-medium text-gray-900">{vendor.name || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <UtensilsIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Category</p>
                          <p className="font-medium text-gray-900 capitalize">{vendor.category || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <DollarSignIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Price Range</p>
                          <p className="font-medium text-gray-900">{vendor.priceRange || 'Not specified'}</p>
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
                            {vendor.openingTime && vendor.closingTime 
                              ? `${vendor.openingTime} - ${vendor.closingTime}`
                              : 'Not specified'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <StoreIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Location</p>
                          <p className="font-medium text-gray-900">{vendor.location || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <EditIcon size={20} className="text-gray-400" />
                        <div>
                          <p className="text-sm text-gray-500">Phone</p>
                          <p className="font-medium text-gray-900">{vendor.phone || 'Not specified'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
      {vendor.description && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Description</h3>
          <p className="text-gray-700 leading-relaxed">{vendor.description}</p>
        </div>
      )}

      {/* Specialties */}
      {vendor.specialties && vendor.specialties.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialties</h3>
          <div className="flex flex-wrap gap-2">
            {vendor.specialties.map((specialty, index) => (
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
  {vendor.status === 'active' ? (
    <>
      <CheckCircleIcon size={20} className="text-green-600" />
      <span className="font-medium text-green-600">Active</span>
    </>
  ) : vendor.status === 'maintenance' ? (
    <>
      <AlertCircleIcon size={20} className="text-yellow-600" />
      <span className="font-medium text-yellow-600">Maintenance</span>
    </>
  ) : vendor.status === 'inactive' ? (
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

      </div> 
    </div> 
  );
}