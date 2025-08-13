import { Card, CardContent } from '../ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

function StatCard({ 
  icon: Icon, 
  title, 
  value, 
  subtitle, 
  trend = null,
  onClick,
  className = "" 
}) {
  return (
    <Card 
      className={`border border-gray-200 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer bg-white ${className}`}
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-black rounded-xl group-hover:scale-110 transition-transform">
            <Icon className="w-5 h-5 text-white" />
          </div>
          {trend !== null && (
            trend > 0 ? (
              <TrendingUp className="w-4 h-4 text-gray-600" />
            ) : trend < 0 ? (
              <TrendingDown className="w-4 h-4 text-gray-600" />
            ) : null
          )}
        </div>
        <div className="space-y-1">
          <p className="text-sm text-gray-600 font-medium">{title}</p>
          <div className="text-3xl font-black">{value}</div>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

export default StatCard;