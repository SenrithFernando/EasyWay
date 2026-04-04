import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HomeIcon, CalendarIcon, SettingsIcon, LogOutIcon, XIcon, UserIcon, GlobeIcon } from 'lucide-react';

export function Sidebar({ role, onClose }) {
  const location = useLocation();

  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const fullName = user?.fullName || 'User';
  const displayRole = user?.role || role || 'student';
  const initial = fullName.charAt(0).toUpperCase();

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const navLinks = [
    { name: 'Main Page', path: '/', icon: GlobeIcon },
    { name: 'Dashboard', path: `/${role}`, icon: HomeIcon },
    { name: 'Reservations', path: '/table', icon: CalendarIcon },
    { name: 'Profile', path: '/profile', icon: UserIcon },
    { name: 'Settings', path: '/settings', icon: SettingsIcon },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-72">
      <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
        <span className="font-bold text-xl text-gray-900">
          Easy<span className="text-orange-500">Food</span>
        </span>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 text-gray-500 hover:text-gray-700 lg:hidden"
          >
            <XIcon size={20} />
          </button>
        )}
      </div>

      <div className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        <div className="mb-4 px-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
          {role} Menu
        </div>
        {navLinks.map((link) => {
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              to={link.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                isActive(link.path)
                  ? 'bg-orange-50 text-orange-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={20} />
              {link.name}
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-gray-200">
        <Link to="/profile" className="block">
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer mb-2">
            <div className="bg-brand-100 text-brand-700 relative inline-flex items-center justify-center rounded-full overflow-hidden font-semibold border-2 border-surface-0 shadow-sm w-10 h-10 text-sm">
              <span>{initial}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">
                {fullName}
              </p>
              <p className="text-xs text-surface-500 truncate capitalize">{displayRole}</p>
            </div>
          </div>
        </Link>
        <Link
          to="/login"
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOutIcon size={20} />
          Log Out
        </Link>
      </div>
    </div>
  );
}
