import React from 'react';
import Header from '../../components/ui/Header';
import QuickActionWidget from '../../components/ui/QuickActionWidget';
import AIChatWidget from '../../components/ui/AIChatWidget';
import KPICard from './components/KPICard';
import ActivityFeed from './components/ActivityFeed';
import QuickActions from './components/QuickActions';
import UpcomingDeadlines from './components/UpcomingDeadlines';
import BankAccountOverview from './components/BankAccountOverview';
import IncomeChart from './components/IncomeChart';
import ExpenseBreakdown from './components/ExpenseBreakdown';

const Dashboard = () => {
  const kpiData = [
    {
      title: 'Inkomsten Deze Maand',
      value: '€0,00',
      change: '0%',
      changeType: 'neutral',
      icon: 'TrendingUp',
      color: 'success'
    },
    {
      title: 'Uitgaven Deze Maand',
      value: '€0,00',
      change: '0%',
      changeType: 'neutral',
      icon: 'Receipt',
      color: 'error'
    },
    {
      title: 'Openstaande Facturen',
      value: '€0,00',
      change: '0 facturen',
      changeType: 'neutral',
      icon: 'FileText',
      color: 'warning'
    },
    {
      title: 'BTW Te Betalen',
      value: '€0,00',
      change: 'Q4 2024',
      changeType: 'neutral',
      icon: 'Calculator',
      color: 'primary'
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-16">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Welkom bij je ZZP Administratie!
            </h1>
            <p className="text-muted-foreground">
              Begin met het toevoegen van je eerste transacties en gegevens voor {new Date()?.toLocaleDateString('nl-NL', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {kpiData?.map((kpi, index) => (
              <KPICard
                key={index}
                title={kpi?.title}
                value={kpi?.value}
                change={kpi?.change}
                changeType={kpi?.changeType}
                icon={kpi?.icon}
                color={kpi?.color}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <QuickActions />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-8">
              <IncomeChart />
              <ExpenseBreakdown />
            </div>

            {/* Right Column - Activity & Deadlines */}
            <div className="space-y-8">
              <ActivityFeed />
              <UpcomingDeadlines />
            </div>
          </div>

          {/* Bank Account Overview */}
          <div className="mb-8">
            <BankAccountOverview />
          </div>
        </div>
      </main>
      {/* Floating Widgets */}
      <QuickActionWidget />
      <AIChatWidget />
    </div>
  );
};

export default Dashboard;