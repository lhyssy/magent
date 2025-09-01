import { CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react';

type Status = 'pending' | 'running' | 'completed' | 'error';

interface StatusIndicatorProps {
  status: Status;
  label: string;
  description?: string;
}

const statusConfig = {
  pending: {
    icon: Clock,
    color: 'text-gray-500',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
  },
  running: {
    icon: Clock,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  completed: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-300',
  },
  error: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
  },
};

export default function StatusIndicator({ status, label, description }: StatusIndicatorProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div className={`flex items-center space-x-3 p-3 rounded-lg border ${config.bgColor} ${config.borderColor}`}>
      <Icon className={`h-5 w-5 ${config.color} ${status === 'running' ? 'animate-pulse' : ''}`} />
      <div className="flex-1">
        <p className={`font-medium ${config.color}`}>{label}</p>
        {description && <p className="text-sm text-gray-600">{description}</p>}
      </div>
    </div>
  );
}