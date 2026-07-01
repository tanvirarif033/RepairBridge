import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiHome, FiTool, 
  FiInfo, FiPhone, FiHelpCircle, FiChevronDown,
  FiSettings, FiFileText, FiClock, FiCreditCard, FiStar
} from 'react-icons/fi';
import { useAuth } from '../../../context/AuthContext';

const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMenu = () => setIsOpen(!isOpen);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsDropdownOpen(false);
  };

  const navLinks = [
    { name: 'Home', path: '/', icon: FiHome },
    { name: 'Services', path: '/services', icon: FiTool },
    { name: 'About', path: '/about', icon: FiInfo },
    { name: 'Contact', path: '/contact', icon: FiPhone },
    { name: 'FAQ', path: '/faq', icon: FiHelpCircle },
  ];

  const userMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'My Requests', path: '/my-requests', icon: FiFileText },
    { name: 'Appointments', path: '/appointments', icon: FiClock },
    { name: 'Payments', path: '/payments', icon: FiCreditCard },
    { name: 'Reviews', path: '/reviews', icon: FiStar },
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-16 md:h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-blue-600">🔧 Repair</span>
            <span className="text-2xl font-bold text-gray-800">Bridge</span>
          </Link>

     
          <div className="hidden md:flex items-center space-x-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center gap-1"
              >
                <link.icon className="text-lg" />
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-3 relative">
               
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 rounded-full px-4 py-2 transition-colors duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
                  <FiChevronDown className={`text-gray-500 transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

               
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg py-2 border border-gray-100 animate-fadeIn">
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                      <span className={`inline-block mt-1 px-2 py-0.5 text-xs rounded-full ${
                        user?.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {user?.role === 'ADMIN' ? 'Admin' : 'Customer'}
                      </span>
                    </div>
                    <div className="py-1">
                      {userMenuItems.map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <item.icon className="text-gray-400" />
                          {item.name}
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors w-full"
                      >
                        <FiLogOut className="text-red-400" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link to="/login" className="btn-outline text-sm">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-sm">
                  Register
                </Link>
              </div>
            )}
          </div>

         
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors"
          >
            {isOpen ? <FiX className="text-2xl" /> : <FiMenu className="text-2xl" />}
          </button>
        </div>

        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} pb-4 border-t border-gray-100`}>
          <div className="flex flex-col space-y-3 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center gap-2 px-2 py-2 rounded-lg hover:bg-gray-50"
                onClick={toggleMenu}
              >
                <link.icon className="text-lg" />
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-3 px-2 py-2 bg-gray-50 rounded-lg">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                  </div>
                </div>
                {userMenuItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-2 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={toggleMenu}
                  >
                    <item.icon className="text-gray-400" />
                    {item.name}
                  </Link>
                ))}
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center gap-3 px-2 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <FiLogOut className="text-red-400" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-2 pt-2 border-t border-gray-200">
                <Link to="/login" className="btn-outline text-center" onClick={toggleMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-center" onClick={toggleMenu}>
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;