import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon, PhoneIcon, StarIcon, UtensilsIcon, CoffeeIcon, PizzaIcon, SandwichIcon, InfoIcon, TrendingUpIcon, UsersIcon, DollarSignIcon, CheckCircleIcon, AlertCircleIcon } from 'lucide-react';
import { Navbar } from '../Components/layout/Navbar';

export function CanteenPage() {
  const navigate = useNavigate();
  const [vendors, setVendors] = useState([]);
  const [stats, setStats] = useState({ totalVendors: 0, categoryStats: [], averageRating: 0 });
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [showDetails, setShowDetails] = useState(false);

  const categories = [
    { id: 'all', name: 'All', icon: UtensilsIcon },
    { id: 'beverages', name: 'Beverages', icon: CoffeeIcon },
    { id: 'snacks', name: 'Snacks', icon: SandwichIcon },
    { id: 'meals', name: 'Meals', icon: PizzaIcon },
  ];

  useEffect(() => {
    fetchVendors();
    fetchStats();
  }, [selectedCategory]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 10,
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      const response = await fetch(`/api/canteen?${params}`);
      const data = await response.json();

      if (data.success) {
        setVendors(data.data);
      }
    } catch (error) {
      console.error('Error fetching vendors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/canteen/stats');
      const data = await response.json();

      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleRating = async (vendorId, rating) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please login to rate vendors');
        return;
      }

      const response = await fetch(`/api/canteen/${vendorId}/rating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ rating }),
      });

      if (response.ok) {
        fetchVendors(); // Refresh vendors to update rating
      }
    } catch (error) {
      console.error('Error rating vendor:', error);
    }
  };

  const getValidImageUrl = (imageUrl) => {
    if (!imageUrl) {
      return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
    }
    // If it's a base64 image or valid URL, return as-is
    if (imageUrl.startsWith('data:') || imageUrl.startsWith('http') || imageUrl.startsWith('/')) {
      return imageUrl;
    }
    // Fallback to placeholder
    return "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
  };

  const VendorCard = ({ vendor }) => {
    const imageUrl = getValidImageUrl(vendor.image);

    return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
    >
      <div className="relative h-48">
        <img
          src={imageUrl}
          alt={vendor.name}
          className="w-full h-full object-cover"
          onError={(e) => {
            e.target.src = "https://images.unsplash.com/photo-1554118811-1e0d58224f24?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80";
          }}
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-sm font-semibold text-gray-700">
          {vendor.priceRange}
        </div>
      </div>
      
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold text-gray-900">{vendor.name}</h3>
          <div className="flex items-center gap-1">
            <StarIcon size={16} className="text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">{vendor.rating.toFixed(1)}</span>
            <span className="text-sm text-gray-500">({vendor.reviews})</span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 line-clamp-2">{vendor.description}</p>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <ClockIcon size={16} className="text-gray-400" />
            <span>{vendor.openingTime} - {vendor.closingTime}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPinIcon size={16} className="text-gray-400" />
            <span>{vendor.location}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <PhoneIcon size={16} className="text-gray-400" />
            <span>{vendor.phone}</span>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {vendor.specialties.map((specialty, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-brand-100 text-brand-700 rounded-full text-xs font-medium"
            >
              {specialty}
            </span>
          ))}
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/vendors/${vendor._id}/feedback`);
            }}
            className="flex-1 bg-white border border-brand-200 hover:border-brand-500 text-brand-600 font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <StarIcon size={16} className="fill-brand-100" />
            Reviews
          </button>
          <button
            onClick={() => {
              setSelectedVendor(vendor);
              setShowDetails(true);
            }}
            className="flex-[1.2] bg-brand-500 hover:bg-brand-600 text-white font-medium py-2 px-3 rounded-lg transition-colors duration-200 flex items-center justify-center gap-1.5 shadow-sm"
          >
            <InfoIcon size={16} />
            View Details
          </button>
        </div>
      </div>
    </motion.div>
  );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Campus Canteen
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover delicious food options available across campus. From quick snacks to full meals, find your perfect dining spot.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-brand-500 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  <Icon size={20} />
                  <span>{category.name}</span>
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Canteen Info Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid md:grid-cols-3 gap-6 mb-12"
        >
          <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">{stats.totalVendors}</div>
            <div className="text-brand-100">Total Vendors</div>
          </div>
          <div className="bg-gradient-to-br from-warm-500 to-orange-600 text-white rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">{stats.averageRating.toFixed(1)}</div>
            <div className="text-orange-100">Average Rating</div>
          </div>
          <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white rounded-2xl p-6 text-center">
            <div className="text-3xl font-bold mb-2">{vendors.length}</div>
            <div className="text-green-100">Active Vendors</div>
          </div>
        </motion.div>

        {/* Vendors Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'All Vendors' : `${categories.find(c => c.id === selectedCategory)?.name} Vendors`}
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-lg overflow-hidden animate-pulse">
                  <div className="h-48 bg-gray-300"></div>
                  <div className="p-6">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-4"></div>
                    <div className="space-y-2">
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                      <div className="h-3 bg-gray-300 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No vendors found in this category.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vendors.map((vendor) => (
                <VendorCard key={vendor._id} vendor={vendor} />
              ))}
            </div>
          )}
        </motion.section>

        {/* Additional Information Section */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Campus Dining Information</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-brand-100 p-3 rounded-lg">
                  <ClockIcon size={24} className="text-brand-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Peak Hours</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span><strong>Breakfast:</strong> 7:00 AM - 9:00 AM</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                  <span><strong>Lunch:</strong> 12:00 PM - 2:00 PM</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span><strong>Dinner:</strong> 6:00 PM - 8:00 PM</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-green-100 p-3 rounded-lg">
                  <CheckCircleIcon size={24} className="text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Popular Choices</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Local Sri Lankan Cuisine</li>
                <li>• International Food Options</li>
                <li>• Vegetarian & Vegan Choices</li>
                <li>• Healthy Meal Plans</li>
                <li>• Quick Snack Options</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <AlertCircleIcon size={24} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Important Notices</h3>
              </div>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Student ID required for discounts</li>
                <li>• Pre-ordering available for groups</li>
                <li>• Special dietary accommodations</li>
                <li>• Feedback system active</li>
              </ul>
            </div>
          </div>
        </motion.section>

        {/* Canteen Rules */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Canteen Guidelines</h2>
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Operating Hours</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Most vendors operate between 7:00 AM - 8:00 PM</li>
                  <li>• Some vendors have extended hours until 10:00 PM</li>
                  <li>• Weekend hours may vary</li>
                  <li>• Holiday schedules will be announced separately</li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">Payment Methods</h3>
                <ul className="space-y-2 text-gray-600">
                  <li>• Cash accepted at all vendors</li>
                  <li>• Campus card payments available</li>
                  <li>• Mobile payment options (selected vendors)</li>
                  <li>• Contactless payments encouraged</li>
                </ul>
              </div>
            </div>
          </div>
        </motion.section>

        {/* Vendor Details Modal */}
        {showDetails && selectedVendor && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
            onClick={() => setShowDetails(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative">
                <img
                  src={getValidImageUrl(selectedVendor.image)}
                  alt={selectedVendor.name}
                  className="w-full h-64 object-cover"
                />
                <button
                  onClick={() => setShowDetails(false)}
                  className="absolute top-4 right-4 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100"
                >
                  ×
                </button>
              </div>
              
              <div className="p-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">{selectedVendor.name}</h2>
                    <p className="text-gray-600">{selectedVendor.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 mb-2">
                      <StarIcon size={20} className="text-yellow-400 fill-current" />
                      <span className="text-lg font-semibold">{selectedVendor.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({selectedVendor.reviews} reviews)</span>
                    </div>
                    <div className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-sm font-semibold">
                      {selectedVendor.priceRange}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <InfoIcon size={20} />
                      Basic Information
                    </h3>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <ClockIcon size={18} className="text-gray-400" />
                        <div>
                          <p className="font-medium">Operating Hours</p>
                          <p className="text-sm text-gray-600">{selectedVendor.openingTime} - {selectedVendor.closingTime}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPinIcon size={18} className="text-gray-400" />
                        <div>
                          <p className="font-medium">Location</p>
                          <p className="text-sm text-gray-600">{selectedVendor.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <PhoneIcon size={18} className="text-gray-400" />
                        <div>
                          <p className="font-medium">Contact</p>
                          <p className="text-sm text-gray-600">{selectedVendor.phone}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <UtensilsIcon size={20} />
                      Specialties
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedVendor.specialties.map((specialty, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-brand-100 text-brand-700 rounded-full text-sm font-medium"
                        >
                          {specialty}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <TrendingUpIcon size={20} />
                    Vendor Statistics
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <UsersIcon size={24} className="mx-auto mb-2 text-brand-500" />
                      <p className="text-2xl font-bold text-gray-900">{selectedVendor.reviews}</p>
                      <p className="text-sm text-gray-600">Total Reviews</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <StarIcon size={24} className="mx-auto mb-2 text-yellow-400 fill-current" />
                      <p className="text-2xl font-bold text-gray-900">{selectedVendor.rating.toFixed(1)}</p>
                      <p className="text-sm text-gray-600">Average Rating</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <DollarSignIcon size={24} className="mx-auto mb-2 text-green-500" />
                      <p className="text-2xl font-bold text-gray-900">{selectedVendor.priceRange}</p>
                      <p className="text-sm text-gray-600">Price Range</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <CheckCircleIcon size={24} className="mx-auto mb-2 text-blue-500" />
                      <p className="text-2xl font-bold text-gray-900">Active</p>
                      <p className="text-sm text-gray-600">Status</p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 flex gap-4">
                  <button
                    onClick={() => {
                      setShowDetails(false);
                      navigate(`/feedback?vendorId=${selectedVendor._id}`);
                    }}
                    className="flex-1 bg-brand-500 hover:bg-brand-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Submit Feedback
                  </button>
                  <button
                    onClick={() => setShowDetails(false)}
                    className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 px-6 rounded-lg transition-colors duration-200"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}