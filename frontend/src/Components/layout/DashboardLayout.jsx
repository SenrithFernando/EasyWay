import React, { useState } from 'react';
import { MenuIcon } from 'lucide-react';
import { Sidebar } from './Sidebar';
import { motion, AnimatePresence } from 'framer-motion';

export function DashboardLayout({ children, role }) {
    const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
    
    return (
      <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block h-full shadow-sm z-20">
          <Sidebar role={role}/>
        </div>

        {/* Mobile Sidebar Overlay */}
        <AnimatePresence>
          {isMobileSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden" 
                onClick={() => setIsMobileSidebarOpen(false)}
              />
              <motion.div 
                initial={{ x: '-100%' }} 
                animate={{ x: 0 }} 
                exit={{ x: '-100%' }} 
                transition={{ type: 'spring', bounce: 0, duration: 0.4 }} 
                className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-xl"
              >
                <Sidebar role={role} onClose={() => setIsMobileSidebarOpen(false)}/>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          {/* Mobile Header */}
          <header className="lg:hidden h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 z-10 shrink-0">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-gray-900">
                Easy<span className="text-orange-500">Food</span>
              </span>
            </div>
            <button 
              onClick={() => setIsMobileSidebarOpen(true)} 
              className="p-2 -mr-2 text-gray-600 hover:text-orange-500 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <MenuIcon size={24}/>
            </button>
          </header>

          {/* Scrollable Content */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{children}</div>
          </main>
        </div>
      </div>
    );
}
