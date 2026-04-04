import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRightIcon, UtensilsIcon, CalendarCheckIcon, HeartIcon, StarIcon, ChevronRightIcon, } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

const FEATURED_MEALS = [
    { id: 1, name: 'Jollof Rice & Chicken', vendor: "Mama's Kitchen", price: '₦1,500', rating: 4.8, emoji: '🍛', color: 'from-orange-400 to-red-500' },
    { id: 2, name: 'Fresh Fruit Smoothie', vendor: 'Smoothie Bar', price: '₦800', rating: 4.9, emoji: '🥤', color: 'from-pink-400 to-rose-500' },
    { id: 3, name: 'Grilled Chicken Salad', vendor: 'Fresh & Green', price: '₦2,000', rating: 4.7, emoji: '🥗', color: 'from-green-400 to-emerald-500' },
    { id: 4, name: 'Spicy Shawarma', vendor: 'The Grill House', price: '₦1,200', rating: 4.6, emoji: '🌯', color: 'from-yellow-400 to-orange-500' },
    { id: 5, name: 'Beef Burger & Fries', vendor: 'Campus Bites', price: '₦2,500', rating: 4.5, emoji: '🍔', color: 'from-amber-400 to-orange-600' },
    { id: 6, name: 'Vegetable Pasta', vendor: "Mama's Kitchen", price: '₦1,800', rating: 4.4, emoji: '🍝', color: 'from-red-400 to-orange-500' },
];

const VENDORS = [
    { id: 1, name: "Mama's Kitchen", type: 'Local Cuisine', rating: 4.8 },
    { id: 2, name: 'Campus Bites', type: 'Fast Food', rating: 4.5 },
    { id: 3, name: 'Fresh & Green', type: 'Healthy & Salads', rating: 4.7 },
    { id: 4, name: 'The Grill House', type: 'Grill & BBQ', rating: 4.6 },
    { id: 5, name: 'Smoothie Bar', type: 'Drinks & Desserts', rating: 4.9 },
];

export function LandingPage() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
    };
    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { type: 'spring', stiffness: 100 } },
    };
    return (<div className="min-h-screen bg-surface-50 font-sans selection:bg-brand-200 selection:text-brand-900">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Decorative background blobs */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-full overflow-hidden -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[60%] rounded-full bg-brand-200/40 blur-3xl"/>
          <div className="absolute top-[20%] right-[-5%] w-[35%] h-[50%] rounded-full bg-warm-200/40 blur-3xl"/>
          <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[40%] rounded-full bg-success-100/40 blur-3xl"/>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: 'easeOut' }} className="max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 text-brand-600 font-medium text-sm mb-6 border border-brand-100 shadow-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-500"></span>
              </span>
              Now serving 5+ campus locations
            </div>

            <h1 className="text-5xl md:text-7xl font-extrabold text-surface-900 tracking-tight mb-6 leading-tight">
              Eat{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-500 to-warm-500">
                Balanced Meals
              </span>{' '}
              Every Day.
            </h1>

            <p className="text-lg md:text-xl text-surface-600 mb-10 leading-relaxed max-w-2xl mx-auto">
              Skip the lines. Reserve your table, order ahead, and enjoy
              delicious meals from your favorite campus vendors without the
              wait.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/login">
                <button className="w-full sm:w-auto group inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 focus:ring-brand-500 shadow-soft px-8 py-3.5 text-lg">
                  Reserve a Table
                  <ArrowRightIcon className="ml-2 group-hover:translate-x-1 transition-transform" size={18}/>
                </button>
              </Link>
              <Link to="/menu">
                <button className="w-full sm:w-auto inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200 px-8 py-3.5 text-lg">
                  Browse Menu
                </button>
              </Link>
            </div>
          </motion.div>

          {/* Stats Bar */}
          <motion.div initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }} className="mt-20 grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            {[ { label: 'Active Students', value: '5,000+' }, { label: 'Food Vendors', value: '20+' }, { label: 'Meals Served', value: '50k+' } ].map((stat, i) => (<div key={i} className="bg-surface-0/60 backdrop-blur-sm border-surface-200/50 rounded-2xl overflow-hidden shadow-card border p-6">
                <div className="text-3xl font-bold text-surface-900 mb-1">
                  {stat.value}
                </div>
                <div className="text-sm font-medium text-surface-500">
                  {stat.label}
                </div>
              </div>))}
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 bg-surface-0">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
              How EasyFood Works
            </h2>
            <p className="text-lg text-surface-600 max-w-2xl mx-auto">
              Three simple steps to get your favorite campus meals.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line for desktop */}
            <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-0.5 bg-gradient-to-r from-brand-200 via-warm-200 to-success-200 z-0"/>

            {[
            { icon: UtensilsIcon, title: 'Browse Menu', desc: 'Explore delicious options from various campus vendors.', color: 'text-brand-500', bg: 'bg-brand-50' },
            { icon: CalendarCheckIcon, title: 'Reserve & Order', desc: 'Book a table and pre-order your food to skip the line.', color: 'text-warm-500', bg: 'bg-warm-50' },
            { icon: HeartIcon, title: 'Enjoy Your Meal', desc: 'Scan your QR code upon arrival and enjoy your hot meal.', color: 'text-success-500', bg: 'bg-success-50' },
        ].map((step, i) => (<div key={i} className="relative z-10 flex flex-col items-center text-center">
                <div className={`w-24 h-24 rounded-3xl ${step.bg} ${step.color} flex items-center justify-center mb-6 shadow-sm rotate-3 hover:rotate-0 transition-transform duration-300`}>
                  <step.icon size={40}/>
                </div>
                <h3 className="text-xl font-bold text-surface-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-surface-600">{step.desc}</p>
              </div>))}
          </div>
        </div>
      </section>

      {/* Featured Meals */}
      <section className="py-24 bg-surface-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-4">
                Popular Right Now
              </h2>
              <p className="text-lg text-surface-600">
                What students are loving today.
              </p>
            </div>
            <Link to="/menu" className="hidden sm:flex items-center text-brand-600 font-medium hover:text-brand-700 transition-colors">
              View full menu <ChevronRightIcon size={20}/>
            </Link>
          </div>

          <motion.div variants={containerVariants} initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-100px' }} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_MEALS.map((meal) => (<motion.div key={meal.id} variants={itemVariants}>
                <div className="bg-surface-0 rounded-2xl shadow-card border border-surface-100 overflow-hidden h-full flex flex-col group transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer">
                  <div className={`h-48 w-full bg-gradient-to-br ${meal.color} flex items-center justify-center text-7xl group-hover:scale-105 transition-transform duration-500`}>
                    {meal.emoji}
                  </div>
                  <div className="p-6 flex flex-col flex-1 bg-surface-0 relative z-10">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-bold text-surface-900 line-clamp-1">
                        {meal.name}
                      </h3>
                      <div className="flex items-center gap-1 bg-surface-100 px-2 py-1 rounded-md text-sm font-medium text-surface-700">
                        <StarIcon size={14} className="text-warm-500 fill-warm-500"/>
                        {meal.rating}
                      </div>
                    </div>
                    <p className="text-surface-500 text-sm mb-4">
                      {meal.vendor}
                    </p>
                    <div className="mt-auto flex items-center justify-between pt-4 border-t border-surface-100">
                      <span className="text-xl font-bold text-surface-900">
                        {meal.price}
                      </span>
                      <Link to="/login">
                        <button className="inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200 px-3 py-1.5 text-sm">
                          Order
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </motion.div>))}
          </motion.div>

          <div className="mt-8 text-center sm:hidden">
            <Link to="/menu">
              <button className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200 px-5 py-2.5 text-base">
                View full menu
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Vendors (Horizontal Scroll) */}
      <section className="py-24 bg-surface-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-surface-900 mb-12 text-center">
            Top Rated Vendors
          </h2>

          <div className="flex overflow-x-auto pb-8 -mx-4 px-4 sm:mx-0 sm:px-0 gap-6 snap-x hide-scrollbar">
            {VENDORS.map((vendor) => (<div key={vendor.id} className="bg-surface-0 rounded-2xl overflow-hidden shadow-card border border-surface-100 p-6 min-w-[280px] sm:min-w-[320px] snap-center shrink-0 transition-all duration-300 hover:shadow-elevated hover:-translate-y-1 cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="bg-brand-100 text-brand-700 relative inline-flex items-center justify-center rounded-full overflow-hidden font-semibold border-2 border-surface-0 shadow-sm w-12 h-12 text-base">
                    <span>{vendor.name.substring(0, 2).toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-surface-900 text-lg">
                      {vendor.name}
                    </h3>
                    <p className="text-surface-500 text-sm">{vendor.type}</p>
                    <div className="flex items-center gap-1 mt-1 text-sm font-medium text-surface-700">
                      <StarIcon size={14} className="text-warm-500 fill-warm-500"/>
                      {vendor.rating}
                    </div>
                  </div>
                </div>
              </div>))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface-900 text-surface-400 py-12 border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-2 mb-4">
                <div className="bg-brand-500 p-1.5 rounded-lg text-white">
                  <UtensilsIcon size={18}/>
                </div>
                <span className="font-bold text-xl tracking-tight text-white">
                  Easy<span className="text-brand-500">Food</span>
                </span>
              </Link>
              <p className="max-w-xs mb-6">
                Making university dining simpler, faster, and more enjoyable for
                everyone.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                <li>
                  <Link to="/menu" className="hover:text-brand-400 transition-colors">
                    Menu
                  </Link>
                </li>
                <li>
                  <Link to="/reservation" className="hover:text-brand-400 transition-colors">
                    Reservations
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="hover:text-brand-400 transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Legal</h4>
              <ul className="space-y-2">
                <li>
                  <a href="#" className="hover:text-brand-400 transition-colors">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-400 transition-colors">
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-brand-400 transition-colors">
                    Contact Us
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-surface-800 text-sm text-center md:text-left flex flex-col md:flex-row justify-between items-center">
            <p>© 2026 EasyFood University System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>);
}
