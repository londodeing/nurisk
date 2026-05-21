import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KpiCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  trend?: number;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  to?: string;
  onClick?: () => void;
}

const variantStyles = {
  default: 'border-l-nu-green',
  success: 'border-l-safe-green',
  warning: 'border-l-warning-yellow',
  danger: 'border-l-danger-red',
};

export function KpiCard({ 
  title, 
  value, 
  icon, 
  trend, 
  variant = 'default',
  to,
  onClick 
}: KpiCardProps) {
  const content = (
    <Card className={`border-l-4 ${variantStyles[variant]} hover:shadow-md transition-shadow cursor-pointer`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-slate-600 mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            {trend !== undefined && (
              <div className={`flex items-center gap-1 text-sm mt-1 ${
                trend > 0 ? 'text-danger-red' : trend < 0 ? 'text-safe-green' : 'text-slate-500'
              }`}>
                {trend > 0 ? <TrendingUp className="w-4 h-4" /> : 
                 trend < 0 ? <TrendingDown className="w-4 h-4" /> : 
                 <Minus className="w-4 h-4" />}
                <span>{Math.abs(trend)}%</span>
              </div>
            )}
          </div>
          <div className="text-nu-green">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );

  if (to) {
    return <Link to={to}>{content}</Link>;
  }
  
  return <div onClick={onClick}>{content}</div>;
}

export default KpiCard;