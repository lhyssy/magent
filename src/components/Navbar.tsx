import { Link, useLocation } from 'react-router-dom';
import { Home, Activity } from 'lucide-react';

const navigation = [
  { name: '首页', href: '/', icon: Home },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass-effect animate-fade-in-up">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="relative avatar-glow">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-all duration-500 animate-glow-pulse"></div>
                <Activity className="relative h-8 w-8 text-white bg-gradient-to-r from-blue-500 via-purple-600 to-pink-500 p-1.5 rounded-lg animate-float" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-neon-glow group-hover:scale-105 transition-transform duration-300">连心智诊师</span>
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    isActive
                      ? 'btn-gradient text-white shadow-lg animate-glow-pulse'
                      : 'text-gray-300 hover:glass-card hover:text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}