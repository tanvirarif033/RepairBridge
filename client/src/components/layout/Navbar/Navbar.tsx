import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FiMenu, FiX, FiUser, FiLogOut, FiHome, FiTool, 
  FiInfo, FiPhone, FiHelpCircle, FiChevronDown,
  FiSettings, FiFileText,  FiCreditCard, FiStar,
  FiDollarSign, FiCalendar, FiShield, FiLayout, FiUsers
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

  // Customer menu items
  const customerMenuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiHome },
    { name: 'My Requests', path: '/my-requests', icon: FiFileText },
    { name: 'Quotations', path: '/quotations', icon: FiDollarSign },
    { name: 'Appointments', path: '/appointments', icon: FiCalendar },
    { name: 'Payments', path: '/payments', icon: FiCreditCard },
    { name: 'Reviews', path: '/reviews', icon: FiStar },
    { name: 'Profile', path: '/profile', icon: FiUser },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  // Admin menu items
  const adminMenuItems = [
    { name: 'Admin Dashboard', path: '/admin', icon: FiShield },
    { name: 'Manage Users', path: '/admin/users', icon: FiUsers },
    { name: 'Manage Requests', path: '/admin/requests', icon: FiFileText },
    { name: 'Quotations', path: '/admin/quotations', icon: FiDollarSign },
    { name: 'Appointments', path: '/admin/appointments', icon: FiCalendar },
    { name: 'Payments', path: '/admin/payments', icon: FiCreditCard },
    { name: 'Reviews', path: '/admin/reviews', icon: FiStar },
    { name: 'Settings', path: '/admin/settings', icon: FiSettings },
  ];

  // Get menu items based on user role
  const getMenuItems = () => {
    if (user?.role === 'ADMIN') {
      return adminMenuItems;
    }
    return customerMenuItems;
  };

  // Check if user is admin
  const isAdmin = user?.role === 'ADMIN';

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container-custom">
        <div className="flex justify-between items-center h-20 md:h-24">
          {/* Logo - Larger */}
          <Link to="/" className="flex items-center space-x-3">
            <span className="text-3xl font-bold text-blue-600">🔧 Repair</span>
            <span className="text-3xl font-bold text-gray-800">Bridge</span>
            {isAdmin && (
              <span className="ml-2 text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-semibold">
                Admin
              </span>
            )}
          </Link>

          {/* Desktop Menu - Larger Text */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition-colors duration-200 font-medium flex items-center gap-2 text-base"
              >
                <link.icon className="text-xl" />
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4 relative">
                {/* User Info with Dropdown */}
                <button
                  onClick={toggleDropdown}
                  className="flex items-center gap-3 bg-gray-100 hover:bg-gray-200 rounded-full px-5 py-2.5 transition-colors duration-200"
                >
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-base">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <span className="text-base font-medium text-gray-700">{user?.name}</span>
                  <FiChevronDown className={`text-gray-500 text-lg transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-xl shadow-lg py-2 border border-gray-100 animate-fadeIn">
                    {/* User Info */}
                    <div className="px-4 py-3 border-b border-gray-100">
                      <p className="text-base font-semibold text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className={`inline-block px-2.5 py-1 text-xs rounded-full font-medium ${
                          isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isAdmin ? 'Admin' : 'Customer'}
                        </span>
                        {isAdmin && (
                          <span className="inline-block px-2.5 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium">
                            <FiShield className="inline w-3 h-3 mr-0.5" />
                            Verified
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-1">
                      {getMenuItems().map((item) => (
                        <Link
                          key={item.path}
                          to={item.path}
                          className="flex items-center gap-3 px-4 py-2.5 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <item.icon className="text-gray-400 text-lg" />
                          {item.name}
                          {item.path === '/admin' && (
                            <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                              Admin
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>

                    {/* Divider for Admin - Show Customer Dashboard link */}
                    {isAdmin && (
                      <div className="border-t border-gray-100 py-1">
                        <Link
                          to="/dashboard"
                          className="flex items-center gap-3 px-4 py-2.5 text-base text-gray-700 hover:bg-gray-50 transition-colors"
                          onClick={() => setIsDropdownOpen(false)}
                        >
                          <FiLayout className="text-gray-400 text-lg" />
                          Customer Dashboard
                        </Link>
                      </div>
                    )}

                    {/* Logout */}
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-2.5 text-base text-red-600 hover:bg-red-50 transition-colors w-full font-medium"
                      >
                        <FiLogOut className="text-red-400 text-lg" />
                        Logout
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login" className="btn-outline text-base px-6 py-2.5">
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-base px-6 py-2.5">
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-gray-700 hover:text-blue-600 transition-colors p-2"
          >
            {isOpen ? <FiX className="text-3xl" /> : <FiMenu className="text-3xl" />}
          </button>
        </div>

        {/* Mobile Menu */}
        <div className={`md:hidden ${isOpen ? 'block' : 'hidden'} pb-4 border-t border-gray-100`}>
          <div className="flex flex-col space-y-3 pt-4">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="text-gray-700 hover:text-blue-600 transition-colors font-medium flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-50 text-base"
                onClick={toggleMenu}
              >
                <link.icon className="text-xl" />
                {link.name}
              </Link>
            ))}
            
            {isAuthenticated ? (
              <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                {/* User Info */}
                <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-lg">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div>
                    <p className="text-base font-semibold text-gray-900">{user?.name}</p>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                    <span className={`inline-block mt-1 px-2.5 py-1 text-xs rounded-full font-medium ${
                      isAdmin ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isAdmin ? 'Admin' : 'Customer'}
                    </span>
                  </div>
                </div>

                {/* Menu Items */}
                {getMenuItems().map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={toggleMenu}
                  >
                    <item.icon className="text-gray-400 text-lg" />
                    {item.name}
                    {item.path === '/admin' && (
                      <span className="ml-auto text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </Link>
                ))}

                {/* Admin to Customer toggle */}
                {isAdmin && (
                  <Link
                    to="/dashboard"
                    className="flex items-center gap-3 px-4 py-3 text-base text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                    onClick={toggleMenu}
                  >
                    <FiLayout className="text-gray-400 text-lg" />
                    Customer Dashboard
                  </Link>
                )}

                {/* Logout */}
                <button
                  onClick={() => {
                    handleLogout();
                    toggleMenu();
                  }}
                  className="flex items-center gap-3 px-4 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  <FiLogOut className="text-red-400 text-lg" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex flex-col space-y-3 pt-3 border-t border-gray-200">
                <Link to="/login" className="btn-outline text-center text-base py-3" onClick={toggleMenu}>
                  Login
                </Link>
                <Link to="/register" className="btn-primary text-center text-base py-3" onClick={toggleMenu}>
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