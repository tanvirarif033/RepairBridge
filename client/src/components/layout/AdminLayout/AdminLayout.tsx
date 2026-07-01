import React from 'react';
import { Link, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import {
  FiHome, FiUsers, FiFileText, FiDollarSign, FiCalendar,
  FiStar, FiSettings, FiLogOut, FiChevronLeft,
  FiBell, FiTrendingUp
} from 'react-icons/fi';

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: FiHome },
    { name: 'Users', path: '/admin/users', icon: FiUsers },
    { name: 'Repair Requests', path: '/admin/requests', icon: FiFileText },
    { name: 'Quotations', path: '/admin/quotations', icon: FiDollarSign },
    { name: 'Appointments', path: '/admin/appointments', icon: FiCalendar },
    { name: 'Payments', path: '/admin/payments', icon: FiTrendingUp },
    { name: 'Reviews', path: '/admin/reviews', icon: FiStar },
    { name: 'Settings', path: '/admin/settings', icon: FiSettings },
  ];

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 fixed h-full z-50">
        {/* Logo */}
        <div className="flex items-center gap-2 px-6 py-6 border-b border-gray-200">
          <span className="text-2xl">🔧</span>
          <span className="text-xl font-bold text-blue-600">Repair</span>
          <span className="text-xl font-bold text-gray-800">Bridge</span>
          <span className="ml-auto text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Admin</span>
        </div>

        {/* User Info */}
        <div className="px-4 py-4 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{user?.name}</p>
              <p className="text-xs text-gray-500">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4">
          <div className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                    active
                      ? 'bg-blue-50 text-blue-700 font-medium shadow-sm'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${active ? 'text-blue-600' : ''}`} />
                  <span className="text-sm">{item.name}</span>
                  {active && (
                    <div className="ml-auto w-1.5 h-6 bg-blue-600 rounded-full"></div>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 px-3 py-4">
          <button
            onClick={logout}
            className="flex items-center gap-3 px-4 py-3 w-full text-red-600 hover:bg-red-50 rounded-xl transition-all"
          >
            <FiLogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
        {/* Top Bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <button className="md:hidden text-gray-600">
              <FiChevronLeft className="w-6 h-6" />
            </button>
            <h2 className="text-lg font-semibold text-gray-900">
              {menuItems.find(item => isActive(item.path))?.name || 'Dashboard'}
            </h2>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative text-gray-500 hover:text-gray-700">
              <FiBell className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                3
              </span>
            </button>
            <div className="flex items-center gap-2 md:hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-sm">
                {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;