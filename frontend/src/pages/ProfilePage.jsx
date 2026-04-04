import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { UserIcon, MailIcon, ShieldIcon, AlertCircleIcon, EditIcon, SaveIcon, PhoneIcon, CreditCardIcon, BuildingIcon, CameraIcon } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export function ProfilePage() {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [userProfile, setUserProfile] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    studentId: '',
    department: '',
    role: 'Student',
    noFoodOrders: 0,
    penaltyStatus: 'None',
  });

  useEffect(() => {
    const storedUserStr = localStorage.getItem('user');
    if (storedUserStr) {
      const storedUser = JSON.parse(storedUserStr);
      setUserProfile((prev) => ({
        ...prev,
        fullName: storedUser.fullName || '',
        email: storedUser.email || '',
        phoneNumber: storedUser.phoneNumber || '',
        studentId: storedUser.studentId || '',
        department: storedUser.department || '',
        role: storedUser.role || 'Student',
        penaltyStatus: storedUser.penaltyStatus || 'None',
      }));
    } else {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setUserProfile({ ...userProfile, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    // Validations
    if (!userProfile.fullName.trim()) {
      setErrorMsg("Full name is required.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(userProfile.email)) {
      setErrorMsg("Please enter a valid email address.");
      return;
    }

    if (userProfile.phoneNumber) {
      const phoneRegex = /^\+?[0-9\s\-]{9,15}$/;
      if (!phoneRegex.test(userProfile.phoneNumber)) {
        setErrorMsg("Please enter a valid phone number.");
        return;
      }
    }

    if (userProfile.studentId) {
      const studentIdRegex = /^IT\d{8}$/i;
      if (!studentIdRegex.test(userProfile.studentId)) {
        setErrorMsg("Student ID must be 'IT' followed by 8 digits.");
        return;
      }
    }

    try {
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({
          fullName: userProfile.fullName,
          email: userProfile.email,
          phoneNumber: userProfile.phoneNumber,
          studentId: userProfile.studentId,
          department: userProfile.department
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.message || 'Failed to update profile');
        return;
      }

      const storedUser = JSON.parse(localStorage.getItem('user'));
      localStorage.setItem('user', JSON.stringify({ ...storedUser, ...data.user }));
      
      setErrorMsg('');
      setIsEditing(false);
    } catch (error) {
      setErrorMsg('Network error while saving profile.');
    }
  };

  return (
    <DashboardLayout role="student">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-surface-900">
            My Profile
          </h1>
          <p className="text-surface-500 mt-1">
            Manage your personal information and account settings
          </p>
        </div>
        <button
          onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-all font-medium ${
            isEditing
              ? 'bg-brand-500 text-white hover:bg-brand-600 shadow-soft'
              : 'bg-surface-0 text-surface-700 border border-surface-200 hover:border-brand-300 hover:text-brand-600'
          }`}
        >
          {isEditing ? <SaveIcon size={18} /> : <EditIcon size={18} />}
          {isEditing ? 'Save Changes' : 'Edit Profile'}
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Profile Details Card */}
          <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-surface-900 flex items-center gap-2">
                <UserIcon size={20} className="text-brand-500" />
                Personal Information
              </h2>
            </div>
            
            {errorMsg && (
              <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm flex items-center gap-2">
                <AlertCircleIcon size={16} />
                {errorMsg}
              </div>
            )}

            {/* Profile Avatar */}
            <div className="flex items-center gap-6 mb-8 pb-8 border-b border-surface-100">
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-3xl font-bold border-4 border-surface-0 shadow-sm">
                  {userProfile.fullName ? userProfile.fullName.charAt(0).toUpperCase() : '?'}
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-1.5 bg-surface-900 text-white rounded-full hover:bg-surface-800 transition-colors shadow-sm focus:outline-none">
                    <CameraIcon size={14} />
                  </button>
                )}
              </div>
              <div>
                <h3 className="text-xl font-bold text-surface-900">{userProfile.fullName}</h3>
                <p className="text-surface-500 text-sm mt-0.5">{userProfile.role} • {userProfile.department}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <UserIcon size={18} />
                  </div>
                  <input
                    type="text"
                    name="fullName"
                    value={userProfile.fullName}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-70 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400"
                  />
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <MailIcon size={18} />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={userProfile.email}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-70 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Phone Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <PhoneIcon size={18} />
                  </div>
                  <input
                    type="tel"
                    name="phoneNumber"
                    value={userProfile.phoneNumber}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-70 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400"
                  />
                </div>
              </div>

              {/* Student ID */}
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Student ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <CreditCardIcon size={18} />
                  </div>
                  <input
                    type="text"
                    name="studentId"
                    value={userProfile.studentId}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-70 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400"
                  />
                </div>
              </div>

              {/* Department */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-surface-700 mb-2">
                  Department / Faculty
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-surface-400">
                    <BuildingIcon size={18} />
                  </div>
                  <input
                    type="text"
                    name="department"
                    value={userProfile.department}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className="w-full pl-11 pr-4 py-2.5 bg-surface-50 border rounded-xl text-surface-900 placeholder:text-surface-400 transition-all duration-200 focus:outline-none focus:ring-2 disabled:opacity-70 disabled:bg-surface-100 border-surface-200 focus:ring-brand-400 focus:border-brand-400"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6">
            <h3 className="text-lg font-bold text-surface-900 mb-4 flex items-center gap-2">
              <ShieldIcon size={20} className="text-brand-500" />
              Account Status
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-surface-100">
                <span className="text-surface-500">Role</span>
                <span className="font-medium px-3 py-1 bg-brand-50 text-brand-700 rounded-full text-xs">
                  {userProfile.role}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-surface-100">
                <span className="text-surface-500 flex items-center gap-1.5">
                  Pending Food Orders
                </span>
                <span className="font-medium text-surface-900">
                  {userProfile.noFoodOrders}
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-surface-500">Penalty Status</span>
                <span className={`font-medium px-3 py-1 rounded-full text-xs ${
                  userProfile.penaltyStatus === 'None' ? 'bg-success-50 text-success-700' : 'bg-red-50 text-red-700'
                }`}>
                  {userProfile.penaltyStatus}
                </span>
              </div>
            </div>
            
            {userProfile.noFoodOrders > 0 && (
              <div className="mt-6 bg-amber-50 rounded-xl p-4 flex gap-3 text-sm text-amber-800 border border-amber-200">
                <AlertCircleIcon size={18} className="shrink-0 mt-0.5" />
                <p>
                  You have {userProfile.noFoodOrders} unattended food orders at the moment. Please collect your orders on time.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
