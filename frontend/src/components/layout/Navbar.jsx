import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { UtensilsIcon, MenuIcon, XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const [user, setUser] = React.useState(null);

    React.useEffect(() => {
        const storedUserStr = localStorage.getItem('user');
        if (storedUserStr) {
            setUser(JSON.parse(storedUserStr));
        }
    }, []);

    const dashboardPath = user ? `/${user.role}` : '/login';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
        setIsMobileMenuOpen(false);
        navigate('/');
    };

    const navLinks = [
        { name: 'Home', path: '/' },
        { name: 'Menu', path: '/menu' },
        { name: 'Reserve', path: '/table' },
        { name: 'Blog & Feedback', path: '/blog' },
    ];
    const isActive = (path) => {
        if (path === '/' && location.pathname !== '/')
            return false;
        return location.pathname.startsWith(path);
    };
    return (<header className="sticky top-0 z-50 w-full bg-surface-0/80 backdrop-blur-md border-b border-surface-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="bg-gradient-to-br from-brand-500 to-warm-500 p-2 rounded-xl text-white shadow-glow-orange group-hover:scale-105 transition-transform">
              <UtensilsIcon size={20}/>
            </div>
            <span className="font-bold text-xl tracking-tight text-surface-900">
              Easy<span className="text-brand-500">Food</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (<Link key={link.name} to={link.path} className={`text-sm font-medium transition-colors hover:text-brand-500 ${isActive(link.path) ? 'text-brand-500' : 'text-surface-600'}`}>
                {link.name}
              </Link>))}
          </nav>

          {/* CTA */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-surface-700 hidden lg:inline">
                  Welcome, {user.fullName?.split(" ")[0]}!
                </span>
                <Link to={dashboardPath}>
                  <button className="inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 shadow-soft px-4 py-2 text-sm">
                    Dashboard
                  </button>
                </Link>
                <button
                  onClick={handleLogout}
                  className="inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-surface-100 text-surface-700 hover:bg-red-50 hover:text-red-600 px-4 py-2 text-sm"
                >
                  Log out
                </button>
              </div>
            ) : (
              <>
                <Link to="/login">
                  <button className="inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-transparent hover:bg-surface-100 text-surface-700 focus:ring-surface-200 px-3 py-1.5 text-sm">
                    Log in
                  </button>
                </Link>
                <Link to="/login">
                  <button className="inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 focus:ring-brand-500 shadow-soft px-3 py-1.5 text-sm">
                    Sign Up
                  </button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 text-surface-600 hover:text-brand-500 transition-colors" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <XIcon size={24}/> : <MenuIcon size={24}/>}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (<motion.div initial={{
                opacity: 0,
                height: 0,
            }} animate={{
                opacity: 1,
                height: 'auto',
            }} exit={{
                opacity: 0,
                height: 0,
            }} className="md:hidden border-t border-surface-200 bg-surface-0 overflow-hidden">
            <div className="px-4 py-6 flex flex-col gap-4">
              {navLinks.map((link) => (<Link key={link.name} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`block px-4 py-3 rounded-xl text-base font-medium ${isActive(link.path) ? 'bg-brand-50 text-brand-600' : 'text-surface-700 hover:bg-surface-50'}`}>
                  {link.name}
                </Link>))}
              <div className="h-px bg-surface-200 my-2"/>
              <div className="flex flex-col gap-3 px-4">
                {user ? (
                  <>
                    <span className="text-sm font-medium text-surface-700 bg-surface-50 p-3 rounded-xl border border-surface-200 text-center">
                      Logged in as {user.fullName}
                    </span>
                    <Link to={dashboardPath} onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 shadow-soft px-5 py-2.5 text-base">
                        Go to Dashboard
                      </button>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 bg-surface-100 text-surface-700 hover:bg-red-50 hover:text-red-600 px-5 py-2.5 text-base"
                    >
                      Log out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-surface-0 text-surface-800 border-2 border-surface-200 hover:border-brand-500 hover:text-brand-600 focus:ring-surface-200 px-5 py-2.5 text-base">
                        Log in
                      </button>
                    </Link>
                    <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                      <button className="w-full inline-flex items-center justify-center font-medium rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-brand-500 to-brand-400 text-white hover:from-brand-600 hover:to-brand-500 focus:ring-brand-500 shadow-soft px-5 py-2.5 text-base">
                        Sign Up
                      </button>
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </header>);
}
