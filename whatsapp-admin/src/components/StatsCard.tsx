import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard ({
  title,
  value,
  change,
  trend,
  icon: Icon
}: {
  title: string
  value: string | number
  change?: string
  trend?: 'up' | 'down'
  icon?: any
}) {
  return (
    <Card className="hover:shadow-md transition-shadow border-none shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change && (
          <p className="text-xs mt-1">
            <span className={`inline-flex items-center gap-1 font-medium ${
              trend === 'up' ? 'text-green-600' : 'text-blue-600'
            }`}>
              {trend === 'up' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
              {change}
            </span>
            <span className="text-muted-foreground ml-1">vs last month</span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
