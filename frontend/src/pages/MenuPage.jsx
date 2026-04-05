import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ClockIcon, MapPinIcon, PhoneIcon, StarIcon, UtensilsIcon, SearchIcon, FilterIcon } from 'lucide-react';

export function MenuPage() {
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = [
    { id: 'all', name: 'All Items' },
    { id: 'beverages', name: 'Beverages' },
    { id: 'snacks', name: 'Snacks' },
    { id: 'meals', name: 'Meals' },
  ];

  useEffect(() => {
    fetchVendors();
  }, [selectedCategory, searchTerm]);

  const fetchVendors = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: 1,
        limit: 20,
      });

      if (selectedCategory !== 'all') {
        params.append('category', selectedCategory);
      }

      if (searchTerm) {
        params.append('search', searchTerm);
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

  const MenuItemCard = ({ item, vendor }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300"
    >
      <div className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h4 className="font-semibold text-gray-900 text-lg">{item.name}</h4>
            <p className="text-sm text-gray-500">{vendor.name}</p>
          </div>
          <div className="text-right">
            <div className="text-xl font-bold text-brand-600">Rs {item.price}</div>
            <div className="text-xs text-gray-400">{item.preparationTime || 15} min</div>
          </div>
        </div>
        
        {item.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">{item.description}</p>
        )}
        
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {item.category && (
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                {item.category}
              </span>
            )}
            {item.isAvailable ? (
              <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-xs font-medium">
                Available
              </span>
            ) : (
              <span className="px-2 py-1 bg-red-100 text-red-600 rounded-full text-xs font-medium">
                Unavailable
              </span>
            )}
          </div>
          <button
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              item.isAvailable
                ? 'bg-brand-500 text-white hover:bg-brand-600'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            disabled={!item.isAvailable}
          >
            {item.isAvailable ? 'Add to Cart' : 'Unavailable'}
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Campus Menu
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Browse all food items available from campus vendors. Find your favorite meals and snacks.
          </p>
        </motion.div>

        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <FilterIcon size={20} className="text-gray-400" />
              <div className="flex gap-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      selectedCategory === category.id
                        ? 'bg-brand-500 text-white'
                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </motion.div>

        {/* Menu Items Grid */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {selectedCategory === 'all' ? 'All Menu Items' : `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Items`}
          </h2>
          
          {loading ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(9)].map((_, index) => (
                <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden animate-pulse">
                  <div className="p-4">
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-3/4 mb-3"></div>
                    <div className="h-3 bg-gray-300 rounded mb-2"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : vendors.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg">No menu items found matching your criteria.</p>
            </div>
          ) : (
            <div className="space-y-8">
              {vendors.map((vendor) => (
                <div key={vendor._id}>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                    <UtensilsIcon size={20} className="text-brand-500" />
                    {vendor.name}
                    <span className="text-sm text-gray-500 font-normal">
                      ({vendor.menuItems?.filter(item => item.isAvailable).length || 0} items available)
                    </span>
                  </h3>
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {vendor.menuItems?.filter(item => item.isAvailable).map((item, index) => (
                      <MenuItemCard key={index} item={item} vendor={vendor} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Menu Guidelines */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-16"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Ordering Information</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">How to Order</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Browse menu items by category or search</li>
                <li>• Check availability and preparation time</li>
                <li>• Add items to your cart</li>
                <li>• Proceed to checkout and payment</li>
                <li>• Collect your order from the vendor</li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="font-semibold text-gray-900 mb-4">Payment Options</h3>
              <ul className="space-y-2 text-gray-600">
                <li>• Cash payments accepted at all vendors</li>
                <li>• Campus card payments available</li>
                <li>• Mobile payment options (selected vendors)</li>
                <li>• Online payment through the app</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
    </div>
  );
}
