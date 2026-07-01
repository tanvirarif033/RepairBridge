import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { FiUser, FiMail, FiPhone, FiEdit2, FiSave, FiX, FiUpload } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Profile: React.FC = () => {
  const { user, token, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        phone: user.phone || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
    
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = () => {
    toast.success('Image upload coming soon!');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
  
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="btn-primary flex items-center gap-2"
        >
          {isEditing ? <FiX /> : <FiEdit2 />}
          {isEditing ? 'Cancel' : 'Edit Profile'}
        </button>
      </div>

   
      <div className="bg-white rounded-2xl shadow-md p-6 md:p-8">
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
        
          <div className="flex flex-col items-center gap-3">
            <div className="relative">
              <div className="w-32 h-32 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <button
                onClick={handleImageUpload}
                className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg"
              >
                <FiUpload className="w-4 h-4" />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-500">{user?.role === 'ADMIN' ? 'Admin' : 'Customer'}</p>
              <span className={`inline-block px-3 py-1 text-xs rounded-full mt-1 ${
                user?.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {user?.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
          </div>

      
          <div className="flex-1 w-full">
            {isEditing ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="label">Full Name</label>
                  <div className="relative">
                    <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="input-field pl-10"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="input-field pl-10"
                      disabled
                      className="input-field pl-10 bg-gray-50"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="label">Phone Number</label>
                  <div className="relative">
                    <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="input-field pl-10"
                      placeholder="+880 1234 567890"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex items-center gap-2" disabled={loading}>
                    {loading ? (
                      <span className="flex items-center gap-2">
                        <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                        Saving...
                      </span>
                    ) : (
                      <>
                        <FiSave /> Save Changes
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiUser className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Full Name</p>
                    <p className="font-medium text-gray-900">{user?.name}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiMail className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Email Address</p>
                    <p className="font-medium text-gray-900">{user?.email}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <FiPhone className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-sm text-gray-500">Phone Number</p>
                    <p className="font-medium text-gray-900">{user?.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-blue-600 mt-1">📅</div>
                  <div>
                    <p className="text-sm text-gray-500">Member Since</p>
                    <p className="font-medium text-gray-900">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      }) : 'N/A'}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Account Settings</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Change Password</p>
              <p className="text-sm text-gray-500">Update your password regularly</p>
            </div>
            <button className="btn-outline text-sm">Change Password</button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">Email Notifications</p>
              <p className="text-sm text-gray-500">Manage your notification preferences</p>
            </div>
            <button className="btn-outline text-sm">Manage</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;