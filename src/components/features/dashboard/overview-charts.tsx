'use client';

import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OverviewChartsProps {
  accuracy: number;
  activityData: { name: string; xp: number }[];
}

export function OverviewCharts({
  accuracy,
  activityData,
}: OverviewChartsProps) {
  const pieData = [
    { name: 'Верно', value: accuracy },
    { name: 'Ошибки', value: 100 - accuracy },
  ];
  const COLORS = ['var(--color-primary)', 'var(--color-destructive)'];

  return (
    <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-7'>
      {/* График активности */}
      <Card className='lg:col-span-4 border-none shadow-md bg-card/50 backdrop-blur'>
        <CardHeader>
          <CardTitle className='text-lg font-bold'>
            Активность за неделю (XP)
          </CardTitle>
        </CardHeader>
        <CardContent className='pl-0'>
          <div className='h-[250px] w-full'>
            <ResponsiveContainer width='100%' height='100%'>
              <AreaChart
                data={activityData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
              >
                <defs>
                  <linearGradient id='colorXp' x1='0' y1='0' x2='0' y2='1'>
                    <stop
                      offset='5%'
                      stopColor='var(--color-primary)'
                      stopOpacity={0.3}
                    />
                    <stop
                      offset='95%'
                      stopColor='var(--color-primary)'
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey='name'
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke='#888888'
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `${value}`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-background)',
                    borderRadius: '8px',
                    border: '1px solid var(--color-border)',
                  }}
                  itemStyle={{ color: 'var(--color-foreground)' }}
                />
                <Area
                  type='monotone'
                  dataKey='xp'
                  stroke='var(--color-primary)'
                  strokeWidth={3}
                  fillOpacity={1}
                  fill='url(#colorXp)'
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Круговая диаграмма точности */}
      <Card className='lg:col-span-3 border-none shadow-md bg-card/50 backdrop-blur'>
        <CardHeader>
          <CardTitle className='text-lg font-bold'>
            Доля верных ответов
          </CardTitle>
        </CardHeader>
        <CardContent className='flex justify-center items-center h-[250px]'>
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <Pie
                data={pieData}
                cx='50%'
                cy='50%'
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey='value'
                stroke='none'
              >
                {pieData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--color-background)',
                  borderRadius: '8px',
                  border: 'none',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
                itemStyle={{
                  color: 'var(--color-foreground)',
                  fontWeight: 'bold',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          {/* Индикатор в центре кольца */}
          <div className='absolute flex flex-col items-center justify-center'>
            <span className='text-3xl font-black text-primary'>
              {accuracy}%
            </span>
            <span className='text-xs text-muted-foreground uppercase tracking-wider font-bold'>
              Точность
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
