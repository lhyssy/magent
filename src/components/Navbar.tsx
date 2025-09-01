import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Upload, Activity, FileText, Users, LogOut, Play } from 'lucide-react';

const navigation = [
  { name: '首页', href: '/', icon: Home },
  { name: '数据上传', href: '/upload', icon: Upload },
  { name: '患者管理', href: '/patients', icon: Users },
  { name: '系统演示', href: '/demo', icon: Activity },
];

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleStartDemo = () => {
    navigate('/demo');
    // 延迟一下确保页面加载完成后再启动演示
    setTimeout(() => {
      const event = new CustomEvent('startDemo');
      window.dispatchEvent(event);
    }, 100);
  };

  return (
    <nav className="bg-blue-600 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <Activity className="h-8 w-8 text-white" />
              <span className="text-xl font-bold text-white">连心智诊师</span>
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
                  className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-700 text-white'
                      : 'text-blue-100 hover:bg-blue-500 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            
            <button 
              onClick={handleStartDemo}
              className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium bg-green-600 text-white hover:bg-green-700 transition-colors"
            >
              <Play className="h-4 w-4" />
              <span>启动演示</span>
            </button>
            
            <button className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-blue-100 hover:bg-blue-500 hover:text-white transition-colors">
              <LogOut className="h-4 w-4" />
              <span>退出</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}