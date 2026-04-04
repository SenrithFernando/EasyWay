import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboardIcon, CalendarClockIcon, UtensilsCrossedIcon, ReceiptIcon, BellIcon, StoreIcon, BarChart3Icon, UsersIcon, SettingsIcon, LogOutIcon, UtensilsIcon, MessageSquareIcon, } from 'lucide-react';
import { Avatar } from '../ui/Avatar';
export function Sidebar({ role, onClose }) {
    const location = useLocation();
    const [vendorId, setVendorId] = useState(null);

    // Fetch vendor ID for vendor users
    useEffect(() => {
        if (role === 'vendor') {
            const fetchVendorId = async () => {
                try {
                    const token = localStorage.getItem('easyfood_token');
                    const response = await fetch('http://localhost:5000/api/feedback/me/vendor', {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setVendorId(data.data.vendorId);
                    }
                } catch (error) {
                    console.error('Failed to fetch vendor ID:', error);
                }
            };
            fetchVendorId();
        }
    }, [role]);

    const getNavItems = () => {
        switch (role) {
            case 'student':
                return [
                    {
                        name: 'My Feedback',
                        path: '/student/feedback/history',
                        icon: MessageSquareIcon,
                    },
                ];
            case 'vendor':
                return [
                    {
                        name: 'Feedback',
                        path: vendorId ? `/vendor/canteens/${vendorId}/feedback-dashboard` : '#',
                        icon: MessageSquareIcon,
                    },
                ];
            case 'admin':
                return [
                    {
                        name: 'Ranking',
                        path: '/admin/vendors/ranking',
                        icon: MessageSquareIcon,
                    },
                ];
        }
    };
    const navItems = getNavItems();
    const getUserDetails = () => {
        switch (role) {
            case 'student':
                return {
                    name: 'Alex Johnson',
                    sub: 'Student',
                };
            case 'vendor':
                return {
                    name: "Mama's Kitchen",
                    sub: 'Vendor',
                };
            case 'admin':
                return {
                    name: 'Admin Staff',
                    sub: 'System Admin',
                };
        }
    };
    const user = getUserDetails();
    return (<aside className="flex flex-col h-full bg-surface-0 border-r border-surface-200 w-72">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 border-b border-surface-100">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="bg-gradient-to-br from-brand-500 to-warm-500 p-2 rounded-xl text-white shadow-glow-orange group-hover:scale-105 transition-transform">
            <UtensilsIcon size={22}/>
          </div>
          <span className="font-bold text-2xl tracking-tight text-surface-900">
            Easy<span className="text-brand-500">Food</span>
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-surface-400 uppercase tracking-wider mb-2 px-2">
          Menu
        </div>
        {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            const Icon = item.icon;
            return (<Link key={item.name} to={item.path} onClick={onClose} className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-brand-50 text-brand-600 font-medium' : 'text-surface-600 hover:bg-surface-50 hover:text-surface-900'}`}>
              <Icon size={20} className={isActive ? 'text-brand-500' : 'text-surface-400'}/>
              {item.name}
            </Link>);
        })}
      </div>

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-surface-200">
        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors cursor-pointer mb-2">
          <Avatar fallback={user.name} size="md"/>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-surface-900 truncate">
              {user.name}
            </p>
            <p className="text-xs text-surface-500 truncate">{user.sub}</p>
          </div>
        </div>
        <Link to="/login" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-surface-600 hover:bg-red-50 hover:text-red-600 transition-colors w-full">
          <LogOutIcon size={20}/>
          <span className="text-sm font-medium">Log out</span>
        </Link>
      </div>
    </aside>);
}
