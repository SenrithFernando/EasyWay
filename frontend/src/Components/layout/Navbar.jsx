import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { UtensilsIcon, MenuIcon, XIcon } from 'lucide-react';
import { Button } from '../ui/Button';
import { motion, AnimatePresence } from 'framer-motion';
export function Navbar() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const location = useLocation();
    const navLinks = [
        {
            name: 'Feedback Module',
            path: '/blog',
        },
        {
            name: 'My History',
            path: '/student/feedback/history',
        },
        {
            name: 'Vendor Rankings',
            path: '/admin/vendors/ranking',
        },
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
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="primary" size="sm">
                Sign Up
              </Button>
            </Link>
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
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="secondary" fullWidth>
                    Log in
                  </Button>
                </Link>
                <Link to="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" fullWidth>
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </motion.div>)}
      </AnimatePresence>
    </header>);
}
