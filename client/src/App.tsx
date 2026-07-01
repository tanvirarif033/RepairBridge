import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';


import Layout from './components/layout/Layout';
import AdminLayout from './components/layout/AdminLayout/AdminLayout';


import { AuthProvider } from './context/AuthContext';


import Home from './pages/public/Home/Home';
import Login from './pages/auth/Login/Login';
import Register from './pages/auth/Register/Register';
import Dashboard from './pages/customer/Dashboard/Dashboard';
import Profile from './pages/customer/Profile/Profile';
import MyRequests from './pages/customer/MyRequests/MyRequests';
import RequestDetails from './pages/customer/RequestDetails/RequestDetails';
import RequestRepair from './pages/customer/RequestRepair/RequestRepair';
import Quotations from './pages/customer/Quotations/Quotations';
import Appointments from './pages/customer/Appointments/Appointments';
import Payments from './pages/customer/Payments/Payments';
import Reviews from './pages/customer/Reviews/Reviews';


import AdminDashboard from './pages/admin/AdminDashboard/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers/AdminUsers';
import AdminRequests from './pages/admin/AdminRequests/AdminRequests';


import AdminRoute from './components/shared/AdminRoute';

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
          <Routes>
            
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<div>About Page</div>} />
              <Route path="/services" element={<div>Services Page</div>} />
              <Route path="/contact" element={<div>Contact Page</div>} />
              <Route path="/faq" element={<div>FAQ Page</div>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
             
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/my-requests" element={<MyRequests />} />
              <Route path="/my-requests/:id" element={<RequestDetails />} />
              <Route path="/request-repair" element={<RequestRepair />} />
              <Route path="/quotations" element={<Quotations />} />
              <Route path="/quotations/:id" element={<div>Quotation Details</div>} />
              <Route path="/appointments" element={<Appointments />} />
              <Route path="/appointments/:id" element={<div>Appointment Details</div>} />
              <Route path="/payments" element={<Payments />} />
              <Route path="/payments/:id" element={<div>Payment Details</div>} />
              <Route path="/reviews" element={<Reviews />} />
              <Route path="/reviews/create/:requestId" element={<div>Create Review</div>} />
              <Route path="/reviews/edit/:id" element={<div>Edit Review</div>} />
            </Route>

            
            <Route element={<AdminRoute />}>
              <Route element={<AdminLayout />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/requests" element={<AdminRequests />} />
                <Route path="/admin/quotations" element={<div>Admin Quotations</div>} />
                <Route path="/admin/appointments" element={<div>Admin Appointments</div>} />
                <Route path="/admin/payments" element={<div>Admin Payments</div>} />
                <Route path="/admin/reviews" element={<div>Admin Reviews</div>} />
                <Route path="/admin/settings" element={<div>Admin Settings</div>} />
              </Route>
            </Route>

         
            <Route path="*" element={
              <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-6xl font-bold text-gray-300">404</h1>
                  <p className="text-gray-500 mt-2">Page not found</p>
                </div>
              </div>
            } />
          </Routes>
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