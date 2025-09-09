import { ReactNode, CSSProperties } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  subtitle?: string;
  onClick?: () => void;
  style?: CSSProperties;
}

export default function Card({ children, className = '', title, subtitle, onClick, style }: CardProps) {
  return (
    <div 
      className={`relative bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/20 ${className}`}
      onClick={onClick}
      style={style}
    >
      {/* 渐变边框效果 */}
      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/15 to-blue-400/15 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* 光晕效果 */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-white/5 to-white/2 rounded-2xl opacity-100 hover:opacity-80 blur-sm transition-opacity duration-500"></div>
      
      <div className="relative">
        {(title || subtitle) && (
          <div className="px-6 py-4 border-b border-white/10">
            {title && <h3 className="text-lg font-semibold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
          </div>
        )}
        <div className="p-6">
          {children}
        </div>
      </div>
    </div>
  );
}