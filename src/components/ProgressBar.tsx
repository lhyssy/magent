interface ProgressBarProps {
  progress: number; // 0-100
  label?: string;
  showPercentage?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  size?: 'sm' | 'md' | 'lg';
}

const colorClasses = {
  blue: 'bg-gradient-to-r from-blue-500 to-blue-600',
  green: 'bg-gradient-to-r from-green-500 to-green-600',
  red: 'bg-gradient-to-r from-red-500 to-red-600',
  yellow: 'bg-gradient-to-r from-yellow-500 to-yellow-600',
};

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

export default function ProgressBar({
  progress,
  label,
  showPercentage = true,
  color = 'blue',
  size = 'md',
}: ProgressBarProps) {
  const clampedProgress = Math.min(Math.max(progress, 0), 100);

  return (
    <div className="w-full">
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(clampedProgress)}%</span>
          )}
        </div>
      )}
      <div className={`w-full bg-gray-200 rounded-full ${sizeClasses[size]} overflow-hidden shadow-inner`}>
        <div
          className={`${colorClasses[color]} ${sizeClasses[size]} rounded-full transition-all duration-500 ease-in-out transform origin-left animate-pulse shadow-sm`}
          style={{ 
            width: `${clampedProgress}%`,
            animation: clampedProgress > 0 && clampedProgress < 100 ? 'pulse 2s infinite' : 'none'
          }}
        />
      </div>
    </div>
  );
}