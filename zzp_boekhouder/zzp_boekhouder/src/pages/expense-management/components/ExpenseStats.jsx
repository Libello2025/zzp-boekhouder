import React from 'react';
import Icon from '../../../components/AppIcon';

const ExpenseStats = ({ expenses }) => {
  const calculateStats = () => {
    const currentMonth = new Date()?.getMonth();
    const currentYear = new Date()?.getFullYear();
    
    const thisMonth = expenses?.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate?.getMonth() === currentMonth && expenseDate?.getFullYear() === currentYear;
    });

    const lastMonth = expenses?.filter(expense => {
      const expenseDate = new Date(expense.date);
      const lastMonthDate = new Date(currentYear, currentMonth - 1);
      return expenseDate?.getMonth() === lastMonthDate?.getMonth() && 
             expenseDate?.getFullYear() === lastMonthDate?.getFullYear();
    });

    const thisMonthTotal = thisMonth?.reduce((sum, expense) => sum + expense?.amount, 0);
    const lastMonthTotal = lastMonth?.reduce((sum, expense) => sum + expense?.amount, 0);
    
    const monthlyChange = lastMonthTotal > 0 
      ? ((thisMonthTotal - lastMonthTotal) / lastMonthTotal) * 100 
      : 0;

    const totalVAT = thisMonth?.reduce((sum, expense) => {
      return sum + (expense?.amount * expense?.vatRate / 100);
    }, 0);

    const categoryBreakdown = thisMonth?.reduce((acc, expense) => {
      acc[expense.category] = (acc?.[expense?.category] || 0) + expense?.amount;
      return acc;
    }, {});

    const topCategory = Object.entries(categoryBreakdown)?.sort(([,a], [,b]) => b - a)?.[0];

    return {
      thisMonthTotal,
      monthlyChange,
      totalVAT,
      expenseCount: thisMonth?.length,
      topCategory: topCategory ? topCategory?.[0] : null,
      topCategoryAmount: topCategory ? topCategory?.[1] : 0
    };
  };

  const stats = calculateStats();

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const getCategoryName = (category) => {
    const categoryNames = {
      office: 'Kantoorbenodigdheden',
      travel: 'Reiskosten',
      marketing: 'Marketing & Reclame',
      software: 'Software & Licenties',
      equipment: 'Apparatuur',
      training: 'Training & Cursussen',
      meals: 'Maaltijden',
      utilities: 'Nutsvoorzieningen',
      other: 'Overige'
    };
    return categoryNames?.[category] || 'Onbekend';
  };

  const statCards = [
    {
      title: 'Uitgaven Deze Maand',
      value: formatAmount(stats?.thisMonthTotal),
      change: stats?.monthlyChange,
      icon: 'TrendingUp',
      color: 'text-primary',
      bgColor: 'bg-primary/10'
    },
    {
      title: 'Aantal Uitgaven',
      value: stats?.expenseCount?.toString(),
      subtitle: 'deze maand',
      icon: 'Receipt',
      color: 'text-secondary',
      bgColor: 'bg-secondary/10'
    },
    {
      title: 'BTW Totaal',
      value: formatAmount(stats?.totalVAT),
      subtitle: 'deze maand',
      icon: 'Calculator',
      color: 'text-accent',
      bgColor: 'bg-accent/10'
    },
    {
      title: 'Grootste Categorie',
      value: stats?.topCategory ? getCategoryName(stats?.topCategory) : 'Geen data',
      subtitle: stats?.topCategory ? formatAmount(stats?.topCategoryAmount) : '',
      icon: 'PieChart',
      color: 'text-success',
      bgColor: 'bg-success/10'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
      {statCards?.map((stat, index) => (
        <div key={index} className="bg-card border border-border rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {stat?.title}
              </p>
              <p className="text-2xl font-bold text-foreground mb-1">
                {stat?.value}
              </p>
              {stat?.change !== undefined && (
                <div className="flex items-center space-x-1">
                  <Icon
                    name={stat?.change >= 0 ? 'TrendingUp' : 'TrendingDown'}
                    size={14}
                    className={stat?.change >= 0 ? 'text-success' : 'text-destructive'}
                  />
                  <span className={`text-sm font-medium ${
                    stat?.change >= 0 ? 'text-success' : 'text-destructive'
                  }`}>
                    {Math.abs(stat?.change)?.toFixed(1)}%
                  </span>
                  <span className="text-sm text-muted-foreground">
                    vs vorige maand
                  </span>
                </div>
              )}
              {stat?.subtitle && (
                <p className="text-sm text-muted-foreground">
                  {stat?.subtitle}
                </p>
              )}
            </div>
            <div className={`p-3 rounded-lg ${stat?.bgColor}`}>
              <Icon
                name={stat?.icon}
                size={24}
                className={stat?.color}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ExpenseStats;