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
  const [showAllVendors, setShowAllVendors] = useState(false);
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
      const response = await fetch('http://localhost:3000/api/canteen', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();

      if (data.success) {
        setVendors(data.data || []);
        // Find vendor owned by this user
        const user = JSON.parse(localStorage.getItem('user'));
        const myVendor = data.data?.find(v => v.owner?._id === user.id);
        setVendor(myVendor);
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
      status: vendor.status || 'active',
    });
    setShowAddForm(true);
  };

  const handleDeleteVendor = async (vendorId) => {
    if (!confirm('Are you sure you want to delete this vendor?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/canteen/${vendorId}`, {
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
        body: JSON.stringify(articleData),
      });

      if (response.ok) {
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
        fetchAllBlogs();
        alert(editingBlog ? 'Article updated successfully!' : 'Article published successfully!');
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
      tags: blog.tags,
      imageUrl: blog.imageUrl,
    });
    setShowArticleForm(true);
  };

  const handleDeleteBlog = async (blogId) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/api/blogs/${blogId}`, {
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
      console.error('Error deleting blog:', error);
      alert('Error deleting article');
    }
  };

  // Filter vendors based on category and search
  const filteredVendors = vendors.filter(vendor => {
    const matchesCategory = selectedCategory === 'all' || vendor.category === selectedCategory;
    const matchesSearch = vendor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vendor.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

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

  const handleArticleInputChange = (e) => {
    const { name, value } = e.target;
    setArticleData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleTagsChange = (e) => {
    const tags = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    setArticleData(prev => ({
      ...prev,
      tags,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading vendor dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
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
              <button
                onClick={() => setShowAllVendors(!showAllVendors)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl font-medium hover:bg-blue-600 transition-colors"
              >
                <StoreIcon size={18} />
                {showAllVendors ? 'My Vendor' : 'All Vendors'}
              </button>
              {!vendor && !showAllVendors && (
                <button
                  onClick={() => setShowAddForm(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
                >
                  <PlusIcon size={18} />
                  Add Vendor
                </button>
              )}
              {showAllVendors && (
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
              onClick={() => setActiveTab('all-vendors')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-colors ${
                activeTab === 'all-vendors'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <StoreIcon size={18} className="inline mr-2" />
              All Vendors
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

          {/* Filtering Section - Show when viewing all vendors */}
          {activeTab === 'all-vendors' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-lg p-6 mb-8"
            >
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vendors by name or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <button
                        key={category.id}
                        onClick={() => setSelectedCategory(category.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                          selectedCategory === category.id
                            ? 'bg-brand-500 text-white'
                            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                      >
                        <Icon size={16} />
                        <span>{category.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

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
                  placeholder="Brief summary of your article"
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
                  className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                >
                  {editingBlog ? 'Update Article' : 'Publish Article'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Specialties (comma-separated)</label>
                    <input
                      type="text"
                      name="specialties"
                      value={formData.specialties.join(', ')}
                      onChange={handleSpecialtiesChange}
                      placeholder="e.g., Coffee, Tea, Sandwiches"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Price Range</label>
                      <select
                        name="priceRange"
                        value={formData.priceRange}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                      >
                        {priceRanges.map(pr => (
                          <option key={pr.id} value={pr.id}>{pr.name}</option>
                        ))}
                      </select>
                    </div>
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

        {activeTab === 'all-vendors' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">
                All Vendors ({filteredVendors.length})
              </h3>
              
              {filteredVendors.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="pb-3 font-semibold text-gray-900">Vendor</th>
                        <th className="pb-3 font-semibold text-gray-900">Category</th>
                        <th className="pb-3 font-semibold text-gray-900">Status</th>
                        <th className="pb-3 font-semibold text-gray-900">Rating</th>
                        <th className="pb-3 font-semibold text-gray-900">Price Range</th>
                        <th className="pb-3 font-semibold text-gray-900">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredVendors.map((vendor) => {
                        const status = statusOptions.find(s => s.id === (vendor.status || 'active'));
                        const StatusIcon = status?.icon || CheckCircleIcon;
                        return (
                          <tr key={vendor._id} className="border-b border-gray-100 hover:bg-gray-50">
                            <td className="py-4">
                              <div>
                                <div className="font-medium text-gray-900">{vendor.name}</div>
                                <div className="text-sm text-gray-600">{vendor.location}</div>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium capitalize">
                                {vendor.category}
                              </span>
                            </td>
                            <td className="py-4">
                              <div className={`flex items-center gap-1 ${status?.color || 'text-green-600'}`}>
                                <StatusIcon size={16} />
                                <span className="text-sm font-medium">{status?.name || 'Active'}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <div className="flex items-center gap-1">
                                <StarIcon size={16} className="text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{vendor.rating?.toFixed(1) || '0.0'}</span>
                              </div>
                            </td>
                            <td className="py-4">
                              <span className="text-sm font-medium">{vendor.priceRange}</span>
                            </td>
                            <td className="py-4">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEditVendor(vendor)}
                                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                  <EditIcon size={16} />
                                </button>
                                <button 
                                  onClick={() => handleDeleteVendor(vendor._id)}
                                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <TrashIcon size={16} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <StoreIcon size={48} className="text-gray-300 mx-auto mb-4" />
                  <p>No vendors found matching your criteria.</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'articles' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Article Management Header */}
            <div className="text-center">
              <FileTextIcon size={64} className="text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Article Management</h2>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Create and manage your blog posts, news articles, and announcements. Keep your customers informed about your latest offerings and updates.
              </p>
              <button
                onClick={() => setShowArticleForm(true)}
                className="inline-flex items-center gap-2 px-8 py-3 bg-green-500 text-white rounded-xl font-medium hover:bg-green-600 transition-colors"
              >
                <PenToolIcon size={20} />
                Write New Article
              </button>
            </div>

            {/* All Articles List */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-xl font-bold text-gray-900 mb-6">All Articles ({blogs.length})</h3>
              
              {blogs.length > 0 ? (
                <div className="space-y-4">
                  {blogs.map((blog) => {
                    // Ensure blog is valid before rendering
                    if (!blog || typeof blog !== 'object') {
                      console.warn('Invalid blog data:', blog);
                      return null;
                    }
                    
                    // Debug log to see what we're working with
                    console.log('Rendering blog:', blog);
                    
                    return (
                    <div key={blog._id || Math.random()} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="text-lg font-semibold text-gray-900 mb-2">{String(blog.title || 'Untitled')}</h4>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {String(blog.excerpt || (blog.content ? blog.content.substring(0, 100) : 'No content'))}...
                          </p>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span className="px-2 py-1 bg-brand-100 text-brand-700 rounded-full text-xs">
                              {String(typeof blog.category === 'string' ? blog.category : 'blog')}
                            </span>
                            <span>{String(blog.createdAt ? new Date(blog.createdAt).toLocaleDateString() : 'No date')}</span>
                            <span>{String(blog.likes || 0)} likes</span>
                            <span>{String(blog.comments || 0)} comments</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEditBlog(blog)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          >
                            <EditIcon size={16} />
                          </button>
                          <button 
                            onClick={() => handleDeleteBlog(blog._id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <TrashIcon size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FileTextIcon size={48} className="text-gray-300 mx-auto mb-4" />
                  <p>No articles found. Create your first article to get started!</p>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {activeTab === 'vendor' && vendor && !showAddForm && !showArticleForm && (
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
                      ) : (
                        <>
                          <PauseCircleIcon size={20} className="text-gray-600" />
                          <span className="font-medium text-gray-600">Inactive</span>
                        </>
                      )}
                    </div>
                  </div>
                  {vendor.image && (
                    <div className="w-24 h-24 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        src={vendor.image}
                        alt={vendor.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {!vendor && !showAddForm && !showArticleForm && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <StoreIcon size={64} className="text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">No Vendor Profile Yet</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              You haven't created a vendor profile yet. Add your canteen vendor to start managing your business on our platform.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
            >
              <PlusIcon size={20} />
              Create Vendor Profile
            </button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

