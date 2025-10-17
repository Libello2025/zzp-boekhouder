import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Icon from '../../../components/AppIcon';

const ExpenseBreakdown = () => {
  const [timeRange, setTimeRange] = useState('thisMonth');

  const expenseData = [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="font-medium text-popover-foreground">{data?.name}</p>
          <p className="text-sm text-muted-foreground">
            €{data?.value?.toLocaleString('nl-NL')} ({data?.percentage?.toFixed(1)}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const totalExpenses = expenseData?.reduce((sum, item) => sum + item?.value, 0);

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Uitgaven Verdeling</h2>
        
        <div className="flex bg-muted rounded-lg p-1">
          <button
            onClick={() => setTimeRange('thisMonth')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
              timeRange === 'thisMonth' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Deze maand
          </button>
          <button
            onClick={() => setTimeRange('lastMonth')}
            className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
              timeRange === 'lastMonth' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Vorige maand
          </button>
        </div>
      </div>
      {expenseData?.length === 0 ? (
        <div className="h-80 w-full flex items-center justify-center">
          <div className="text-center">
            <Icon name="PieChart" size={64} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium text-foreground mb-2">Geen uitgaven data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Je uitgaven verdeling verschijnt hier zodra je transacties toevoegt
            </p>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Voeg je eerste uitgave toe
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={expenseData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {expenseData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-3 mt-6">
            {expenseData?.map((item, index) => (
              <div key={item?.name} className="flex items-center space-x-3">
                <div 
                  className="w-3 h-3 rounded-full flex-shrink-0" 
                  style={{ backgroundColor: COLORS?.[index % COLORS?.length] }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    €{item?.value?.toLocaleString('nl-NL')} ({item?.percentage?.toFixed(1)}%)
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Total */}
          <div className="mt-6 pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Totale uitgaven</span>
              <span className="text-lg font-bold text-foreground">
                €{totalExpenses?.toLocaleString('nl-NL')}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ExpenseBreakdown;