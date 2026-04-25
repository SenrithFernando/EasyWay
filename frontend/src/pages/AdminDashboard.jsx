import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlusIcon, StoreIcon, EditIcon, TrashIcon, UserIcon, SearchIcon, CheckCircleIcon, AlertCircleIcon, PauseCircleIcon, ShieldCheck, ShieldOff, Users } from 'lucide-react';
import { Navbar } from '../Components/layout/Navbar';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('canteens');
  const [canteens, setCanteens] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingCanteen, setEditingCanteen] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [vendorSearch, setVendorSearch] = useState('');
  const [vendorToast, setVendorToast] = useState(null);
  const [formErrors, setFormErrors] = useState({});
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
    owner: '',
  });

  const categories = [
    { id: 'beverages', name: 'Beverages' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'meals', name: 'Meals' },
    { id: 'all', name: 'All' },
  ];

  const statusOptions = [
    { id: 'active', name: 'Active', icon: CheckCircleIcon, color: 'text-green-600' },
    { id: 'inactive', name: 'Inactive', icon: PauseCircleIcon, color: 'text-gray-600' },
    { id: 'maintenance', name: 'Maintenance', icon: AlertCircleIcon, color: 'text-yellow-600' },
  ];

  useEffect(() => {
    fetchCanteens();
    fetchVendors();
  }, []);

  const fetchCanteens = async () => {
    try {
      const token = localStorage.getItem('token');
      // Use isActive=all to fetch both active and inactive canteens for the admin
      const response = await fetch('/api/canteen?isActive=all', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setCanteens(data.data);
      }
    } catch (error) {
      console.error('Error fetching canteens:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchVendors = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/vendors', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSpecialtiesChange = (e) => {
    const specialties = e.target.value.split(',').map(s => s.trim()).filter(s => s);
    setFormData(prev => ({
      ...prev,
      specialties,
    }));
    if (formErrors.specialties) {
      setFormErrors(prev => ({ ...prev, specialties: undefined }));
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) errors.name = 'Canteen name is required';
    if (!formData.description.trim()) errors.description = 'Description is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required';
    
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

    if (!formData.openingTime.trim()) {
      errors.openingTime = 'Opening time is required';
    } else {
      openTimeVal = parseTime(formData.openingTime);
      if (openTimeVal === null) errors.openingTime = 'Please enter a valid time (e.g., 8:00 AM)';
    }

    if (!formData.closingTime.trim()) {
      errors.closingTime = 'Closing time is required';
    } else {
      closeTimeVal = parseTime(formData.closingTime);
      if (closeTimeVal === null) errors.closingTime = 'Please enter a valid time (e.g., 8:00 PM)';
    }

    if (openTimeVal !== null && closeTimeVal !== null) {
      if (closeTimeVal <= openTimeVal) {
        errors.closingTime = 'Closing time must be after opening time';
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    try {
      const token = localStorage.getItem('token');
      const url = editingCanteen 
        ? `/api/canteen/${editingCanteen._id}`
        : '/api/canteen';
      
      const response = await fetch(url, {
        method: editingCanteen ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setShowAddForm(false);
        setEditingCanteen(null);
        setFormErrors({});
        fetchCanteens();
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
          owner: '',
        });
        alert(editingCanteen ? 'Canteen updated successfully!' : 'Canteen added successfully!');
      }
    } catch (error) {
      console.error('Error saving canteen:', error);
      alert('Error saving canteen');
    }
  };

  const handleEdit = (canteen) => {
    setEditingCanteen(canteen);
    setFormData({
      name: canteen.name,
      category: canteen.category,
      description: canteen.description,
      openingTime: canteen.openingTime,
      closingTime: canteen.closingTime,
      location: canteen.location,
      phone: canteen.phone,
      specialties: canteen.specialties,
      priceRange: canteen.priceRange,
      image: canteen.image,
      status: canteen.status,
      owner: canteen.owner?._id || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this canteen?')) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`/api/canteen/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        if (response.ok) {
          fetchCanteens();
          alert('Canteen deleted successfully!');
        }
      } catch (error) {
        console.error('Error deleting canteen:', error);
        alert('Error deleting canteen');
      }
    }
  };

  const handleVendorStatus = async (vendorId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/users/vendors/${vendorId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (data.success) {
        setVendors(prev => prev.map(v => v._id === vendorId ? { ...v, status: newStatus } : v));
        setVendorToast({ msg: data.message, type: 'success' });
        setTimeout(() => setVendorToast(null), 3000);
      }
    } catch (err) {
      setVendorToast({ msg: 'Failed to update vendor status', type: 'error' });
      setTimeout(() => setVendorToast(null), 3000);
    }
  };

  const filteredCanteens = canteens.filter(canteen =>
    canteen.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    canteen.location.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVendors = vendors.filter(v =>
    v.fullName?.toLowerCase().includes(vendorSearch.toLowerCase()) ||
    v.email?.toLowerCase().includes(vendorSearch.toLowerCase())
  );

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-1">Manage canteens and vendors</p>
          </div>
          {activeTab === 'canteens' && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-2 px-6 py-3 bg-brand-500 text-white rounded-xl font-medium hover:bg-brand-600 transition-colors"
            >
              <PlusIcon size={20} />
              Add New Canteen
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('canteens')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'canteens' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <StoreIcon size={16} /> Canteen Management
          </button>
          <button
            onClick={() => setActiveTab('vendors')}
            className={`flex items-center gap-2 px-6 py-3 font-semibold text-sm border-b-2 transition-all ${
              activeTab === 'vendors' ? 'border-brand-500 text-brand-600' : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users size={16} /> Vendor Management
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs font-bold ${
              vendors.filter(v => v.status === 'inactive').length > 0 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-500'
            }`}>
              {vendors.filter(v => v.status === 'inactive').length} pending
            </span>
          </button>
        </div>

        {/* Toast */}
        <AnimatePresence>
          {vendorToast && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`fixed top-6 right-6 z-50 px-6 py-3 rounded-2xl shadow-xl text-white font-bold ${
                vendorToast.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              }`}>
              {vendorToast.msg}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-md">
            <SearchIcon size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search canteens..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Add/Edit Canteen Form */}
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-lg p-8 mb-8"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {editingCanteen ? 'Edit Canteen' : 'Add New Canteen'}
              </h2>
              <button 
                onClick={() => {
                  setShowAddForm(false);
                  setEditingCanteen(null);
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
                    owner: '',
                  });
                }} 
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Canteen Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.name && <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>}
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
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${formErrors.description ? 'border-red-500' : 'border-gray-300'}`}
                />
                {formErrors.description && <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${formErrors.openingTime ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.openingTime && <p className="mt-1 text-sm text-red-600">{formErrors.openingTime}</p>}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${formErrors.closingTime ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.closingTime && <p className="mt-1 text-sm text-red-600">{formErrors.closingTime}</p>}
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
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${formErrors.location ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.location && <p className="mt-1 text-sm text-red-600">{formErrors.location}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                  <input
                    type="text"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent ${formErrors.phone ? 'border-red-500' : 'border-gray-300'}`}
                  />
                  {formErrors.phone && <p className="mt-1 text-sm text-red-600">{formErrors.phone}</p>}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Assign Vendor *</label>
                  <select
                    name="owner"
                    value={formData.owner}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                  >
                    <option value="">Select a vendor</option>
                    {vendors.map(vendor => (
                      <option key={vendor._id} value={vendor._id}>
                        {vendor.fullName} ({vendor.email})
                      </option>
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
                    setEditingCanteen(null);
                  }}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors"
                >
                  {editingCanteen ? 'Update Canteen' : 'Add Canteen'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Canteens List */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">All Canteens ({filteredCanteens.length})</h2>
          </div>
          
          {filteredCanteens.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Canteen</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vendor</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Location</th>
                    <th className="px-8 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredCanteens.map((canteen) => {
                    const status = statusOptions.find(s => s.id === (canteen.status || 'active'));
                    const StatusIcon = status?.icon || CheckCircleIcon;
                    return (
                      <tr key={canteen._id} className="hover:bg-gray-50">
                        <td className="px-8 py-4">
                          <div className="flex items-center">
                            {canteen.image && (
                              <img
                                src={canteen.image}
                                alt={canteen.name}
                                className="w-12 h-12 rounded-lg object-cover mr-4 bg-gray-100"
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.style.display = 'none';
                                }}
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{canteen.name}</div>
                              <div className="text-sm text-gray-500">{canteen.category}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className="flex items-center">
                            <UserIcon size={16} className="text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {canteen.owner?.fullName || 'Unassigned'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {canteen.owner?.email || 'No vendor assigned'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-4">
                          <div className={`flex items-center ${status?.color || 'text-green-600'}`}>
                            <StatusIcon size={16} className="mr-2" />
                            <span className="text-sm font-medium">{status?.name || 'Active'}</span>
                          </div>
                        </td>
                        <td className="px-8 py-4 text-sm text-gray-900">{canteen.location}</td>
                        <td className="px-8 py-4">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleEdit(canteen)}
                              className="text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              <EditIcon size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(canteen._id)}
                              className="text-red-600 hover:text-red-800 transition-colors"
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
            <div className="text-center py-12">
              <StoreIcon size={64} className="text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No canteens found</h3>
              <p className="text-gray-500">Get started by adding your first canteen.</p>
            </div>
          )}
        </div>

        {/* ── VENDOR MANAGEMENT TAB ── */}
        {activeTab === 'vendors' && (
          <div className="space-y-6">
            {/* Search */}
            <div className="relative max-w-md">
              <SearchIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search vendors by name or email..."
                value={vendorSearch}
                onChange={e => setVendorSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500"
              />
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Total Vendors', value: vendors.length, color: 'bg-blue-50 text-blue-700' },
                { label: 'Active', value: vendors.filter(v => v.status === 'active').length, color: 'bg-green-50 text-green-700' },
                { label: 'Pending Activation', value: vendors.filter(v => v.status === 'inactive').length, color: 'bg-red-50 text-red-700' },
              ].map(s => (
                <div key={s.label} className={`rounded-2xl p-5 ${s.color}`}>
                  <div className="text-3xl font-black">{s.value}</div>
                  <div className="text-sm font-semibold mt-1">{s.label}</div>
                </div>
              ))}
            </div>

            {/* Vendor Table */}
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <div className="px-8 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-lg font-black text-gray-900">All Vendor Accounts ({filteredVendors.length})</h2>
              </div>
              {filteredVendors.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Users size={48} className="mx-auto mb-3 opacity-30" />
                  <p>No vendors found.</p>
                </div>
              ) : (
                <div className="divide-y divide-gray-50">
                  {filteredVendors.map(vendor => (
                    <div key={vendor._id} className="flex items-center justify-between px-8 py-5 hover:bg-gray-50 transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white font-black text-lg">
                          {vendor.fullName?.charAt(0) || 'V'}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{vendor.fullName}</p>
                          <p className="text-sm text-gray-500">{vendor.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          vendor.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'
                        }`}>
                          {vendor.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
                        {vendor.status === 'inactive' ? (
                          <button
                            onClick={() => handleVendorStatus(vendor._id, 'active')}
                            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white text-sm font-bold rounded-xl hover:bg-green-600 transition-colors"
                          >
                            <ShieldCheck size={15} /> Activate
                          </button>
                        ) : (
                          <button
                            onClick={() => handleVendorStatus(vendor._id, 'inactive')}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 text-sm font-bold rounded-xl hover:bg-red-100 hover:text-red-600 transition-colors"
                          >
                            <ShieldOff size={15} /> Deactivate
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
