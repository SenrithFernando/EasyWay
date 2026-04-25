import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CalendarClockIcon, UtensilsCrossedIcon, UserIcon, QrCodeIcon, ClockIcon, MapPinIcon, BellIcon, UsersIcon, Trash2Icon } from 'lucide-react';
import { DashboardLayout } from '../Components/layout/DashboardLayout';

// Removed static RECENT_ORDERS to use dynamic data from API

const NOTIFICATIONS = [
    { id: 1, title: 'Reservation Confirmed', message: "Table 12 at Mama's Kitchen is reserved for 1:00 PM.", time: '10 min ago', unread: true },
    { id: 2, title: 'Order Ready', message: 'Your smoothie is ready for pickup at Smoothie Bar.', time: '2 hours ago', unread: false },
    { id: 3, title: 'New Menu Item', title_color: 'text-brand-600', message: 'Campus Bites just added Spicy Wings to their menu!', time: '1 day ago', unread: false },
];

export function StudentDashboard() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [reservations, setReservations] = useState([]);
    const [orders, setOrders] = useState([]);
    const [isLoadingReservations, setIsLoadingReservations] = useState(true);
    const [isLoadingOrders, setIsLoadingOrders] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            
            const fetchDashboardData = async () => {
                const userId = parsedUser.id || parsedUser._id;
                const token = localStorage.getItem('token');
                
                // Fetch Reservations
                try {
                    const resResponse = await fetch(`/api/reservations/myreservations/${userId}`);
                    if (resResponse.ok) {
                        const data = await resResponse.json();
                        setReservations(data.filter(r => r.status !== 'Cancelled').reverse());
                    }
                } catch (error) { console.error("Res error:", error); } 
                finally { setIsLoadingReservations(false); }

                // Fetch Orders
                try {
                    const orderResponse = await fetch(`/api/orders`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    if (orderResponse.ok) {
                        const data = await orderResponse.json();
                        setOrders(data.slice(0, 3)); // Show top 3 recent
                    }
                } catch (error) { console.error("Order error:", error); } 
                finally { setIsLoadingOrders(false); }
            };
            fetchDashboardData();
        } else {
            navigate('/login');
        }
    }, [navigate]);

    const handleDeleteReservation = async (e, id) => {
        e.stopPropagation();
        if (!window.confirm('Are you sure you want to cancel this reservation?')) return;
        
        try {
            const response = await fetch(`/api/reservations/${id}`, {
                method: 'DELETE'
            });
            if (response.ok) {
                setReservations(prev => prev.filter(r => r._id !== id));
            } else {
                const data = await response.json();
                alert(data.message || 'Failed to delete reservation');
            }
        } catch (error) {
            console.error('Error deleting reservation:', error);
            alert('Error deleting reservation');
        }
    };

    return (<DashboardLayout role="student">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-surface-900">
          Good morning, {user?.fullName?.split(' ')[0] || 'Student'}! 👋
        </h1>
        <p className="text-surface-500 mt-1">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Quick Actions */}
        <motion.div variants={itemVariants} className="md:col-span-12 grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { title: 'Reserve Table', icon: CalendarClockIcon, color: 'from-brand-500 to-brand-400', path: '/table' },
            { title: 'Order Food', icon: UtensilsCrossedIcon, color: 'from-success-500 to-success-400', path: '/menu' },
            { title: 'My Profile', icon: UserIcon, color: 'from-blue-500 to-blue-400', path: '/profile' },
            { title: 'Scan QR', icon: QrCodeIcon, color: 'from-warm-500 to-warm-400', path: '#' },
        ].map((action, i) => (<Link key={i} to={action.path}>
              <motion.div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-4 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer flex items-center gap-4 border-none shadow-sm bg-surface-0">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${action.color} text-white shadow-sm`}>
                  <action.icon size={20}/>
                </div>
                <span className="font-semibold text-surface-800">
                  {action.title}
                </span>
              </motion.div>
            </Link>))}
        </motion.div>

        {/* Main Column */}
        <div className="md:col-span-8 space-y-6">
          {/* Active Reservation */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-surface-900">
                My Reservations
              </h2>
              <Link to="/table" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                Book new
              </Link>
            </div>
            
            <div className="space-y-4">
              {isLoadingReservations ? (
                  <div className="bg-surface-0 rounded-2xl p-6 text-center shadow-card border border-surface-100 text-surface-500">
                      Loading your reservations...
                  </div>
              ) : reservations.length === 0 ? (
                  <div className="bg-surface-0 rounded-2xl p-8 text-center shadow-card border border-surface-100">
                      <div className="w-16 h-16 bg-brand-50 text-brand-500 rounded-full flex items-center justify-center mx-auto mb-4">
                          <CalendarClockIcon size={32} />
                      </div>
                      <h3 className="text-lg font-bold text-surface-900 mb-2">No upcoming reservations</h3>
                      <p className="text-surface-500 mb-6 text-sm">You haven't booked any tables yet.</p>
                      <Link to="/table" className="inline-flex py-2 px-5 bg-brand-500 hover:bg-brand-600 text-white font-medium rounded-xl transition-colors">
                          Reserve a Table
                      </Link>
                  </div>
              ) : (
                  reservations.map((res, idx) => (
                      <div key={res._id || idx} className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6 relative overflow-hidden border-brand-200">
                        <div className={`absolute top-0 left-0 w-1 h-full ${res.status === 'Checked-In' ? 'bg-success-500' : 'bg-brand-500'}`}></div>
                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                          <div>
                            <div className="flex items-center gap-2 mb-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border ${res.status === 'Checked-In' ? 'bg-success-100 text-success-700 border-success-200' : 'bg-brand-100 text-brand-700 border-brand-200'}`}>
                                  {res.status}
                              </span>
                              <span className="text-sm font-medium text-surface-500">
                                PIN: {res.reservationCode || 'N/A'}
                              </span>
                            </div>
                            <h3 className="text-xl font-bold text-surface-900 mb-2">
                              {res.location}
                            </h3>
                            <div className="space-y-2 text-surface-600">
                              <div className="flex items-center gap-2">
                                <ClockIcon size={16} className="text-brand-500"/>
                                <span className="text-sm font-medium">{res.date}, {res.time}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <UsersIcon size={16} className="text-brand-500"/>
                                <span className="text-sm font-medium">Table {res.tableId} • {res.seats} Seats</span>
                              </div>
                            </div>
                            
                            {res.status !== 'Checked-In' && (
                                <button 
                                    onClick={(e) => handleDeleteReservation(e, res._id)}
                                    className="mt-4 flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-red-100"
                                >
                                    <Trash2Icon size={14} /> Cancel Reservation
                                </button>
                            )}
                          </div>
                          <div className="flex flex-col items-center justify-center bg-surface-50 p-4 rounded-xl border border-surface-200 min-w-[140px] cursor-pointer group hover:bg-surface-100 transition-colors"
                            onClick={() => {
                                // Extract the id string if formatted differently, or pass safely to checkin
                                const rawLoc = Object.entries({
                                    'main-dining': 'Main Dining Area',
                                    'study-area': 'Study Area Main',
                                    'anohana': 'Anohana Canteen',
                                    'birdnest-dining': 'Bird Nest Canteen Dining Area'
                                }).find(([id, name]) => name === res.location)?.[0] || 'main-dining';
                                navigate(`/checkin/${rawLoc}/${res.tableId}`);
                            }}>
                            <QrCodeIcon size={64} className="text-surface-800 mb-2 group-hover:scale-105 transition-transform"/>
                            <span className="text-xs font-medium text-brand-600 text-center uppercase tracking-wider block">
                                {res.reservationCode}
                            </span>
                            <span className="text-[10px] text-surface-500 mt-1 block">Click to Check In</span>
                          </div>
                        </div>
                      </div>
                  ))
              )}
            </div>
          </motion.div>

          {/* Recent Orders */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-surface-900">
                Recent Orders
              </h2>
              <Link to="/student/order" className="text-sm font-medium text-brand-600 hover:text-brand-700">
                View all
              </Link>
            </div>
            <div className="bg-surface-0 rounded-2xl shadow-card border border-surface-100 overflow-hidden">
              <div className="divide-y divide-surface-100">
                {isLoadingOrders ? (
                  <div className="p-8 text-center text-surface-400 text-sm">Loading history...</div>
                ) : orders.length === 0 ? (
                  <div className="p-12 text-center">
                    <p className="text-surface-500 text-sm">No orders found.</p>
                    <Link to="/menu" className="text-brand-600 text-xs font-bold mt-2 inline-block">Order Now</Link>
                  </div>
                ) : (
                  orders.map((order, i) => (
                    <div key={order._id || i} className="p-4 hover:bg-surface-50 transition-colors flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-surface-900">
                          {order.orderItems?.[0]?.name} {order.orderItems?.length > 1 ? `+ ${order.orderItems.length - 1} more` : ''}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-sm text-surface-500">
                          <span className="font-mono text-[10px]">#{order._id?.slice(-8).toUpperCase()}</span>
                          <span>•</span>
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-surface-900 mb-1">
                          Rs. {order.totalAmount}
                        </p>
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tight border ${
                          order.status === 'Completed' ? 'bg-success-100 text-success-700 border-success-200' : 
                          order.status === 'Cancelled' ? 'bg-red-100 text-red-700 border-red-200' :
                          'bg-amber-100 text-amber-700 border-amber-200'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Column */}
        <div className="md:col-span-4 space-y-6">
          {/* Notifications */}
          <motion.div variants={itemVariants}>
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-bold text-surface-900">
                Notifications
              </h2>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium border bg-brand-100 text-brand-700 border-brand-200 bg-brand-100 text-brand-700">
                2 New
              </span>
            </div>
            <div className="bg-surface-0 rounded-2xl shadow-card border border-surface-100 overflow-hidden">
              <div className="divide-y divide-surface-100">
                {NOTIFICATIONS.map((note) => (<div key={note.id} className={`p-4 flex gap-3 ${note.unread ? 'bg-brand-50/50' : ''}`}>
                    <div className={`mt-0.5 p-2 rounded-full h-fit ${note.unread ? 'bg-brand-100 text-brand-600' : 'bg-surface-100 text-surface-500'}`}>
                      <BellIcon size={16}/>
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${note.title_color || 'text-surface-900'}`}>
                        {note.title}
                      </h4>
                      <p className="text-sm text-surface-600 mt-0.5 leading-snug">
                        {note.message}
                      </p>
                      <span className="text-xs text-surface-400 mt-2 block">
                        {note.time}
                      </span>
                    </div>
                  </div>))}
              </div>
              <div className="p-3 border-t border-surface-100 text-center">
                <button className="text-sm font-medium text-brand-600 hover:text-brand-700">
                  Mark all as read
                </button>
              </div>
            </div>
          </motion.div>

          {/* Spending Summary */}
          <motion.div variants={itemVariants}>
            <div className="bg-surface-0 rounded-2xl overflow-hidden shadow-card p-6 bg-gradient-to-br from-surface-900 to-surface-800 text-white border-none">
              <h3 className="text-surface-400 text-sm font-medium mb-1">
                This Week's Spending
              </h3>
              <p className="text-3xl font-bold mb-6">RS.3,000</p>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-surface-300">Food Orders</span>
                  <span className="font-medium">Rs.3,000</span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-1.5">
                  <div className="bg-brand-500 h-1.5 rounded-full" style={{ width: '80%', }}></div>
                </div>

                <div className="flex items-center justify-between text-sm pt-2">
                  <span className="text-surface-300">Reservations</span>
                  <span className="font-medium">6</span>
                </div>
                <div className="w-full bg-surface-700 rounded-full h-1.5">
                  <div className="bg-warm-500 h-1.5 rounded-full" style={{ width: '20%', }}></div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </DashboardLayout>);
}
