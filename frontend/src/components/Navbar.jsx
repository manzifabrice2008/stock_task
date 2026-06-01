import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar = ({ onLogout }) => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white';
  };

  return (
    <nav className="bg-slate-950 border-b border-slate-800 sticky top-0 z-10 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-2">
                <svg className="w-6 h-6 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
                StockMaster
              </span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-2 sm:items-center">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/')}`}>
                Dashboard
              </Link>
              <Link to="/add-product" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/add-product')}`}>
                Add Product
              </Link>
              <Link to="/incoming" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/incoming')}`}>
                Incoming Stock
              </Link>
              <Link to="/outgoing" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/outgoing')}`}>
                Outgoing Stock
              </Link>
              <Link to="/reports" className={`px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${isActive('/reports')}`}>
                Reports
              </Link>
              <div className="pl-4 border-l border-slate-700 ml-2">
                <button 
                  onClick={onLogout} 
                  className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500 hover:text-white rounded-md text-sm font-medium transition-colors duration-200"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
