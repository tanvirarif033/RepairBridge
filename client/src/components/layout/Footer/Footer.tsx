import React from 'react';
import { Link } from 'react-router-dom';
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          
          <div>
            <h3 className="text-2xl font-bold mb-4">
              <span className="text-blue-400">🔧 Repair</span>
              <span>Bridge</span>
            </h3>
            <p className="text-gray-400 mb-4">
              Your trusted mobile phone repair service marketplace. Connecting customers with professional repair shops.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiFacebook className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiTwitter className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiInstagram className="text-xl" />
              </a>
              <a href="#" className="text-gray-400 hover:text-blue-400 transition-colors">
                <FiYoutube className="text-xl" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-blue-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Services</h4>
            <ul className="space-y-2">
              <li className="text-gray-400">Screen Replacement</li>
              <li className="text-gray-400">Battery Replacement</li>
              <li className="text-gray-400">Camera Repair</li>
              <li className="text-gray-400">Water Damage Repair</li>
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <FiMapPin className="text-blue-400 mt-1" />
                <span className="text-gray-400">Dhaka, Bangladesh</span>
              </div>
              <div className="flex items-center gap-3">
                <FiPhone className="text-blue-400" />
                <span className="text-gray-400">+880 1234 567890</span>
              </div>
              <div className="flex items-center gap-3">
                <FiMail className="text-blue-400" />
                <span className="text-gray-400">info@repairbridge.com</span>
              </div>
            </div>
          </div>
        </div>

       
        <div className="border-t border-gray-800 mt-8 pt-6 text-center">
          <p className="text-gray-400 text-sm">
            &copy; {currentYear} Repair Bridge. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;