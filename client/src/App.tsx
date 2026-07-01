import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';


import Layout from './components/layout/Layout';


import { AuthProvider } from './context/AuthContext';


import Home from './pages/public/Home/Home';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import Dashboard from './pages/customer/Dashboard/Dashboard';
import Profile from './pages/customer/Profile/Profile';
import MyRequests from './pages/customer/MyRequests/MyRequests';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Layout>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<div>About Page</div>} />
              <Route path="/services" element={<div>Services Page</div>} />
              <Route path="/contact" element={<div>Contact Page</div>} />
              <Route path="/faq" element={<div>FAQ Page</div>} />
              
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Customer Routes */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/my-requests/:id" element={<div>Request Details</div>} />
              <Route path="/request-repair" element={<div>Request Repair</div>} />
              <Route path="/quotations" element={<div>Quotations</div>} />
              <Route path="/appointments" element={<div>Appointments</div>} />
              <Route path="/payments" element={<div>Payments</div>} />
              <Route path="/reviews" element={<div>Reviews</div>} />
              
              {/* Admin Routes */}
              <Route path="/admin" element={<div>Admin Dashboard</div>} />
              <Route path="/admin/users" element={<div>Manage Users</div>} />
              <Route path="/admin/requests" element={<div>Manage Requests</div>} />
              
              {/* 404 */}
              <Route path="*" element={<div>404 - Page Not Found</div>} />
            </Routes>
          </Layout>
          <Toaster 
            position="top-right"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#363636',
                color: '#fff',
              },
              success: {
                duration: 3000,
                style: {
                  background: '#22c55e',
                  color: '#fff',
                },
              },
              error: {
                duration: 4000,
                style: {
                  background: '#ef4444',
                  color: '#fff',
                },
              },
            }}
          />
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;