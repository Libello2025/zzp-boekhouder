import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import Icon from '../../../components/AppIcon';

const IncomeChart = () => {
  const [chartType, setChartType] = useState('bar');
  const [timeRange, setTimeRange] = useState('6months');

  const monthlyData = [];
  const yearlyData = [];

  const currentData = timeRange === '6months' ? monthlyData : yearlyData;

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-elevation-2">
          <p className="font-medium text-popover-foreground mb-2">{label}</p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center space-x-2 text-sm">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry?.color }}
              />
              <span className="text-muted-foreground">{entry?.name}:</span>
              <span className="font-medium text-foreground">
                €{entry?.value?.toLocaleString('nl-NL')}
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Inkomsten Overzicht</h2>
        
        <div className="flex items-center space-x-2">
          {/* Time Range Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setTimeRange('6months')}
              className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                timeRange === '6months' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              6M
            </button>
            <button
              onClick={() => setTimeRange('yearly')}
              className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                timeRange === 'yearly' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Jaar
            </button>
          </div>

          {/* Chart Type Selector */}
          <div className="flex bg-muted rounded-lg p-1">
            <button
              onClick={() => setChartType('bar')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                chartType === 'bar' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="BarChart3" size={16} />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-colors duration-200 ${
                chartType === 'line' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name="TrendingUp" size={16} />
            </button>
          </div>
        </div>
      </div>
      
      {/* Empty State */}
      {currentData?.length === 0 ? (
        <div className="h-80 w-full flex items-center justify-center">
          <div className="text-center">
            <Icon name="BarChart3" size={64} className="mx-auto mb-4 text-muted-foreground/30" />
            <h3 className="text-lg font-medium text-foreground mb-2">Geen inkomsten data</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Je inkomsten statistieken verschijnen hier zodra je transacties toevoegt
            </p>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Voeg je eerste factuur toe
            </button>
          </div>
        </div>
      ) : (
        /* Chart */
        <div className="h-80 w-full" aria-label="Maandelijks Inkomsten Overzicht">
          <ResponsiveContainer width="100%" height="100%">
            {chartType === 'bar' ? (
              <BarChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => `€${(value / 1000)?.toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="income" 
                  name="Inkomsten"
                  fill="var(--color-success)" 
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="expenses" 
                  name="Uitgaven"
                  fill="var(--color-error)" 
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            ) : (
              <LineChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                <XAxis 
                  dataKey="month" 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                />
                <YAxis 
                  stroke="var(--color-muted-foreground)"
                  fontSize={12}
                  tickFormatter={(value) => `€${(value / 1000)?.toFixed(0)}k`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="income" 
                  name="Inkomsten"
                  stroke="var(--color-success)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-success)', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="expenses" 
                  name="Uitgaven"
                  stroke="var(--color-error)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-error)', strokeWidth: 2, r: 4 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="net" 
                  name="Netto"
                  stroke="var(--color-primary)" 
                  strokeWidth={3}
                  dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        </div>
      )}
      
      {/* Legend - only show if there's data */}
      {currentData?.length > 0 && (
        <div className="flex items-center justify-center space-x-6 mt-4 pt-4 border-t border-border">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-success rounded-full"></div>
            <span className="text-sm text-muted-foreground">Inkomsten</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-error rounded-full"></div>
            <span className="text-sm text-muted-foreground">Uitgaven</span>
          </div>
          {chartType === 'line' && (
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <span className="text-sm text-muted-foreground">Netto</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default IncomeChart;