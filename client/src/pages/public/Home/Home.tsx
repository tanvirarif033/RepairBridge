import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FiSmartphone, FiBattery, FiCamera, FiTool, FiArrowRight, 
  FiStar, FiUsers, FiShield, FiClock, FiCheckCircle, 
  FiMapPin, FiAward, FiTrendingUp, FiPackage, FiZap,
  FiPhone, FiMail, FiMessageCircle
} from 'react-icons/fi';

const Home: React.FC = () => {
  const features = [
    {
      icon: FiUsers,
      title: 'Trusted Professionals',
      description: 'Connect with verified and trusted repair professionals in your area.',
      color: 'blue'
    },
    {
      icon: FiShield,
      title: 'Quality Guarantee',
      description: 'All repairs come with a quality guarantee and warranty.',
      color: 'green'
    },
    {
      icon: FiClock,
      title: 'Quick Service',
      description: 'Get your phone repaired quickly with our efficient service network.',
      color: 'purple'
    },
    {
      icon: FiAward,
      title: 'Certified Experts',
      description: 'Our technicians are certified and experienced in all phone repairs.',
      color: 'orange'
    }
  ];

  const categories = [
    { icon: FiSmartphone, name: 'Screen Replacement', description: 'Cracked screen repair', color: 'blue', bg: 'bg-blue-50' },
    { icon: FiBattery, name: 'Battery Replacement', description: 'Battery life issues', color: 'green', bg: 'bg-green-50' },
    { icon: FiCamera, name: 'Camera Repair', description: 'Camera lens & sensor', color: 'purple', bg: 'bg-purple-50' },
    { icon: FiTool, name: 'Water Damage', description: 'Liquid damage repair', color: 'orange', bg: 'bg-orange-50' },
    { icon: FiPackage, name: 'Charging Port', description: 'Charging issues', color: 'red', bg: 'bg-red-50' },
    { icon: FiZap, name: 'Software Issues', description: 'OS & app problems', color: 'indigo', bg: 'bg-indigo-50' },
  ];

  const stats = [
    { number: '10,000+', label: 'Repairs Completed', icon: FiCheckCircle },
    { number: '98%', label: 'Satisfaction Rate', icon: FiStar },
    { number: '500+', label: 'Expert Technicians', icon: FiUsers },
    { number: '4.9', label: 'Average Rating', icon: FiStar },
  ];

  const testimonials = [
    {
      name: 'Md. Rahman',
      location: 'Dhaka',
      rating: 5,
      comment: 'Excellent service! My phone screen was replaced within 2 hours. Highly recommend!',
      image: 'https://ui-avatars.com/api/?name=Md+Rahman&background=3b82f6&color=fff&size=60'
    },
    {
      name: 'Sadia Islam',
      location: 'Chittagong',
      rating: 5,
      comment: 'Professional team, fair pricing, and great quality work. Will definitely use again.',
      image: 'https://ui-avatars.com/api/?name=Sadia+Islam&background=8b5cf6&color=fff&size=60'
    },
    {
      name: 'Rafi Ahmed',
      location: 'Sylhet',
      rating: 4,
      comment: 'Fixed my water damaged phone perfectly. Saved me from buying a new one!',
      image: 'https://ui-avatars.com/api/?name=Rafi+Ahmed&background=22c55e&color=fff&size=60'
    },
  ];

  return (
    <div className="space-y-20 pb-20">
     
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-3xl shadow-2xl">
       
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-blue-400 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <div className="container-custom py-16 md:py-20 lg:py-24 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm font-medium">
                <span className="animate-pulse">✨</span>
                Trusted by 10,000+ Customers
              </div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight">
                Professional Phone
                <span className="block text-blue-200">Repair Service</span>
              </h1>
              <p className="text-lg text-blue-100 leading-relaxed max-w-lg">
                Connect with trusted repair experts in your area. Fast, reliable, and affordable phone repair services with quality guarantee.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <Link 
                  to="/request-repair" 
                  className="group bg-white text-blue-600 px-8 py-3.5 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl flex items-center gap-2"
                >
                  Request Repair
                  <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link 
                  to="/services" 
                  className="bg-white/20 backdrop-blur-sm text-white px-8 py-3.5 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30"
                >
                  Our Services
                </Link>
              </div>

            
              <div className="flex flex-wrap items-center gap-6 pt-6">
                <div className="flex items-center gap-2 text-white/90">
                  <FiStar className="text-yellow-400 fill-yellow-400" />
                  <span>4.9/5 Rating</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <FiCheckCircle className="text-green-400" />
                  <span>98% Satisfaction</span>
                </div>
                <div className="flex items-center gap-2 text-white/90">
                  <FiUsers className="text-blue-300" />
                  <span>500+ Experts</span>
                </div>
              </div>
            </div>

            
            <div className="grid grid-cols-2 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 text-center border border-white/20 hover:bg-white/20 transition-all duration-300">
                  <stat.icon className="w-8 h-8 text-blue-300 mx-auto mb-2" />
                  <div className="text-2xl md:text-3xl font-bold text-white">{stat.number}</div>
                  <div className="text-sm text-blue-200">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

     
      <section className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            Why Choose <span className="text-blue-600">Repair Bridge</span>?
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            We provide the best phone repair services with unmatched quality and customer satisfaction.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border border-gray-100"
            >
              <div className={`bg-${feature.color}-50 w-14 h-14 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className={`text-2xl text-${feature.color}-600`} />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-16">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                Popular <span className="text-blue-600">Services</span>
              </h2>
              <p className="text-gray-600 mt-2">Choose from a wide range of repair services</p>
            </div>
            <Link 
              to="/services" 
              className="text-blue-600 hover:text-blue-700 font-medium flex items-center gap-2 bg-white px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all"
            >
              View All Services <FiArrowRight />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((category, index) => (
              <Link
                key={index}
                to={`/services/${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                className="group bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border border-gray-100"
              >
                <div className={`${category.bg} w-14 h-14 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  <category.icon className={`text-2xl text-${category.color}-600`} />
                </div>
                <h3 className="font-semibold text-gray-900 text-sm">{category.name}</h3>
                <p className="text-xs text-gray-500 mt-1">{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      
      <section className="container-custom">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
            What Our <span className="text-blue-600">Customers Say</span>
          </h2>
          <p className="text-gray-600 mt-4 text-lg">
            Real reviews from real customers who trusted us with their devices.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <img 
                  src={testimonial.image} 
                  alt={testimonial.name} 
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                  <p className="text-sm text-gray-500">{testimonial.location}</p>
                </div>
              </div>
              <div className="flex text-yellow-400 mb-3">
                {[...Array(5)].map((_, i) => (
                  <FiStar key={i} className={`${i < testimonial.rating ? 'fill-yellow-400' : ''}`} />
                ))}
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">"{testimonial.comment}"</p>
            </div>
          ))}
        </div>
      </section>

    
      <section className="container-custom">
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 rounded-3xl p-10 md:p-16 text-center text-white shadow-2xl">
         
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
              <span>🚀</span> Get Started Today
            </div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Ready to Get Your Phone Repaired?
            </h2>
            <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
              Join thousands of satisfied customers who trusted us with their phone repairs. Quick, reliable, and professional service.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/request-repair" 
                className="bg-white text-blue-600 px-8 py-4 rounded-xl font-semibold hover:bg-blue-50 transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center gap-2"
              >
                Get Started Now <FiArrowRight />
              </Link>
              <Link 
                to="/contact" 
                className="bg-white/20 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-semibold hover:bg-white/30 transition-all duration-300 border border-white/30 inline-flex items-center gap-2"
              >
                <FiPhone /> Contact Us
              </Link>
            </div>
          </div>
        </div>
      </section>

     
      <section className="container-custom">
        <div className="bg-white rounded-2xl shadow-md p-8 border border-gray-100">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🔒</div>
              <p className="font-medium text-gray-900">Secure Service</p>
              <p className="text-sm text-gray-500">100% safe & trusted</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">💰</div>
              <p className="font-medium text-gray-900">Best Price</p>
              <p className="text-sm text-gray-500">Affordable rates</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">🛠️</div>
              <p className="font-medium text-gray-900">Expert Repair</p>
              <p className="text-sm text-gray-500">Certified technicians</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="text-3xl mb-2">📱</div>
              <p className="font-medium text-gray-900">All Brands</p>
              <p className="text-sm text-gray-500">Samsung, Apple, Xiaomi</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;