import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { adminService, AdminUser } from '../../../services/admin.service';
import { 
  FiSearch, FiUser, FiMail, FiPhone, FiCalendar,
  FiCheckCircle, FiXCircle, FiRefreshCw, FiLoader,
  FiInbox, FiEdit2, FiTrash2, FiEye, FiShield,
  FiChevronLeft, FiChevronRight, FiUserCheck, FiUserX,
  FiAlertCircle
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import ConfirmationModal from '../../../components/common/ConfirmationModal/ConfirmationModal';

const AdminUsers: React.FC = () => {
  const { token } = useAuth();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'USER' | 'ADMIN'>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<number | null>(null);

  
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'role' | 'status'>('role');
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [newRole, setNewRole] = useState<'USER' | 'ADMIN'>('USER');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const limit = 5;

 
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async (showRefresh = false) => {
    if (!token) return;

    try {
      if (showRefresh) setIsRefreshing(true);
      else setLoading(true);

      const response = await adminService.getUsers(
        token,
        currentPage,
        limit,
        debouncedSearch,
        filter
      );
      
      setUsers(response.data);
      setTotalPages(response.meta.totalPage);
      setTotalUsers(response.meta.total);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  }, [token, currentPage, debouncedSearch, filter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  
  const openRoleModal = (user: AdminUser, role: 'USER' | 'ADMIN') => {
    setSelectedUser(user);
    setNewRole(role);
    setModalType('role');
    setModalOpen(true);
  };

 
  const openStatusModal = (user: AdminUser) => {
    setSelectedUser(user);
    setModalType('status');
    setModalOpen(true);
  };

  
  const handleRoleChange = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const updatedUser = await adminService.changeUserRole(token!, selectedUser.id, newRole);
      
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      toast.success(`User role changed to ${newRole} successfully`);
      setModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change user role');
    } finally {
      setIsSubmitting(false);
    }
  };

  
  const handleStatusToggle = async () => {
    if (!selectedUser) return;
    
    setIsSubmitting(true);
    try {
      const updatedUser = await adminService.toggleUserStatus(token!, selectedUser.id);
      
      setUsers(users.map(user => 
        user.id === selectedUser.id ? updatedUser : user
      ));
      
      const action = updatedUser.isActive ? 'activated' : 'deactivated';
      toast.success(`User ${action} successfully`);
      setModalOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to toggle user status');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  
  const getModalContent = () => {
    if (!selectedUser) return { title: '', message: '', confirmText: '', type: 'warning' as const };

    if (modalType === 'role') {
      const isAdmin = newRole === 'ADMIN';
      return {
        title: `${isAdmin ? 'Make' : 'Remove'} Admin`,
        message: `Are you sure you want to ${isAdmin ? 'make' : 'remove'} "${selectedUser.name}" ${isAdmin ? 'an ADMIN' : 'as ADMIN'}?`,
        confirmText: `Yes, ${isAdmin ? 'Make Admin' : 'Remove Admin'}`,
        type: isAdmin ? 'success' as const : 'warning' as const,
      };
    } else {
      const isActive = !selectedUser.isActive;
      return {
        title: `${isActive ? 'Activate' : 'Deactivate'} User`,
        message: `Are you sure you want to ${isActive ? 'activate' : 'deactivate'} "${selectedUser.name}"?`,
        confirmText: `Yes, ${isActive ? 'Activate' : 'Deactivate'}`,
        type: isActive ? 'success' as const : 'danger' as const,
      };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
          <FiLoader className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600 text-xl animate-pulse" />
        </div>
      </div>
    );
  }

  const modalContent = getModalContent();

  return (
    <div className="space-y-6">
     
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Users</h1>
          <p className="text-sm text-gray-500">{totalUsers} users found</p>
        </div>
        <button
          onClick={() => fetchUsers(true)}
          disabled={isRefreshing}
          className={`flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-all ${
            isRefreshing ? 'animate-spin' : ''
          }`}
        >
          <FiRefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

     
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </div>
          <div className="flex gap-2">
            {['all', 'USER', 'ADMIN'].map((role) => (
              <button
                key={role}
                onClick={() => {
                  setFilter(role as any);
                  setCurrentPage(1);
                }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  filter === role
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {role === 'all' ? 'All' : role}
              </button>
            ))}
          </div>
        </div>
      </div>

    
      {users.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
          <div className="w-32 h-32 bg-gradient-to-br from-blue-50 to-purple-50 rounded-full flex items-center justify-center mx-auto">
            <FiInbox className="text-6xl text-blue-400" />
          </div>
          <h3 className="mt-6 text-2xl font-semibold text-gray-900">No Users Found</h3>
          <p className="mt-3 text-gray-500 max-w-md mx-auto">
            {search || filter !== 'all' 
              ? 'No users match your current filters.'
              : 'No users registered yet.'}
          </p>
        </div>
      ) : (
        <>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => {
                    const isLoading = actionLoading === user.id;
                    const isAdmin = user.role === 'ADMIN';
                    
                    return (
                      <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold text-sm">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{user.name}</p>
                              <p className="text-sm text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1 text-sm text-gray-600">
                            <FiPhone className="w-4 h-4 text-gray-400" />
                            {user.phone || 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                              isAdmin 
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}>
                              {user.role}
                            </span>
                          
                            {!isAdmin ? (
                              <button
                                onClick={() => openRoleModal(user, 'ADMIN')}
                                disabled={isLoading}
                                className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg transition-all disabled:opacity-50 group relative"
                                title="Make Admin"
                              >
                                {isLoading ? (
                                  <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FiShield className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                )}
                              </button>
                            ) : (
                              <button
                                onClick={() => openRoleModal(user, 'USER')}
                                disabled={isLoading}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all disabled:opacity-50 group relative"
                                title="Remove Admin"
                              >
                                {isLoading ? (
                                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                  <FiUser className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
                              user.isActive
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {user.isActive ? <FiCheckCircle className="w-3 h-3" /> : <FiXCircle className="w-3 h-3" />}
                              {user.isActive ? 'Active' : 'Inactive'}
                            </span>
                           
                            <button
                              onClick={() => openStatusModal(user)}
                              disabled={isLoading}
                              className={`p-1.5 rounded-lg transition-all disabled:opacity-50 group ${
                                user.isActive 
                                  ? 'text-red-600 hover:bg-red-50' 
                                  : 'text-green-600 hover:bg-green-50'
                              }`}
                              title={user.isActive ? 'Deactivate' : 'Activate'}
                            >
                              {isLoading ? (
                                <div className={`w-4 h-4 border-2 ${user.isActive ? 'border-red-600' : 'border-green-600'} border-t-transparent rounded-full animate-spin`}></div>
                              ) : (
                                user.isActive ? (
                                  <FiUserX className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                ) : (
                                  <FiUserCheck className="w-4 h-4 group-hover:scale-110 transition-transform" />
                                )
                              )}
                            </button>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          <div className="flex items-center gap-1">
                            <FiCalendar className="w-4 h-4 text-gray-400" />
                            {new Date(user.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <button 
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all group"
                              title="View Details"
                            >
                              <FiEye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button 
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-all group"
                              title="Edit User"
                            >
                              <FiEdit2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                            <button 
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-all group"
                              title="Delete User"
                            >
                              <FiTrash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>


          {totalPages > 1 && (
            <div className="flex items-center justify-between gap-4 pt-4">
              <p className="text-sm text-gray-500 hidden md:block">
                Page {currentPage} of {totalPages}
              </p>
              <div className="flex items-center gap-2 mx-auto md:mx-0">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`p-2.5 rounded-xl border transition-all ${
                    currentPage === 1
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400'
                  }`}
                >
                  <FiChevronLeft className="w-5 h-5" />
                </button>
                
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`w-10 h-10 rounded-xl font-medium transition-all ${
                          currentPage === pageNum
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>

                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`p-2.5 rounded-xl border transition-all ${
                    currentPage === totalPages
                      ? 'border-gray-200 text-gray-400 cursor-not-allowed'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-blue-400'
                  }`}
                >
                  <FiChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}

     
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={modalType === 'role' ? handleRoleChange : handleStatusToggle}
        title={modalContent.title}
        message={modalContent.message}
        confirmText={modalContent.confirmText}
        cancelText="Cancel"
        type={modalContent.type}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default AdminUsers;