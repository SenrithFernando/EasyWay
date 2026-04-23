import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Navbar } from '../Components/layout/Navbar';

export function VendorAnalyticsPage() {
  const [vendorId, setVendorId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (!userStr) throw new Error("Not logged in");
        const user = JSON.parse(userStr);

        const response = await fetch(`http://localhost:3000/api/canteen?owner=${user.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        
        if (data.success && data.data && data.data.length > 0) {
          setVendorId(data.data[0]._id);
        } else {
          setError("No canteen found for this vendor account.");
        }
      } catch (err) {
        setError(err.message || "Failed to load vendor profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchVendor();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96 text-gray-500">
          Loading your analytics dashboard...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="flex items-center justify-center h-96 text-red-500">
          {error}
        </div>
      </div>
    );
  }

  // Once we have the vendorId, redirect them to their specific analytics dashboard
  return <Navigate to={`/vendor/canteens/${vendorId}/feedback-dashboard`} replace />;
}
