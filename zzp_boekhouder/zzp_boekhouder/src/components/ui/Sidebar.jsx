import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [connectionStatus, setConnectionStatus] = useState('connected');

  const navigationItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/client-management', label: 'Klanten', icon: 'Users' },
    { path: '/invoice-creation', label: 'Facturen', icon: 'FileText' },
    { path: '/time-tracking', label: 'Tijd', icon: 'Clock' },
    { path: '/expense-management', label: 'Uitgaven', icon: 'Receipt' },
    { 
      path: '/bank-integration', 
      label: 'Bank', 
      icon: 'CreditCard',
      hasStatus: true,
      status: connectionStatus
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
  };

  const isActive = (path) => location?.pathname === path;

  const getStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return { icon: 'CheckCircle', color: 'var(--color-success)' };
      case 'disconnected':
        return { icon: 'XCircle', color: 'var(--color-error)' };
      case 'syncing':
        return { icon: 'RefreshCw', color: 'var(--color-warning)' };
      default:
        return { icon: 'Circle', color: 'var(--color-muted-foreground)' };
    }
  };

  return (
    <aside className={`fixed left-0 top-0 h-full bg-card border-r border-border z-100 transition-all duration-300 ease-out ${
      isCollapsed ? 'w-16' : 'w-60'
    }`}>
      <div className="flex flex-col h-full">
        {/* Logo Section */}
        <div className="flex items-center h-16 px-4 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center flex-shrink-0">
              <Icon name="Calculator" size={20} color="white" />
            </div>
            {!isCollapsed && (
              <span className="text-lg font-semibold text-foreground">ZZP Boekhouder</span>
            )}
          </div>
          {onToggleCollapse && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className={`ml-auto ${isCollapsed ? 'mx-auto' : ''}`}
              iconName={isCollapsed ? "ChevronRight" : "ChevronLeft"}
              iconSize={16}
            />
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4">
          <div className="space-y-1">
            {navigationItems?.map((item) => {
              const statusInfo = item?.hasStatus ? getStatusIcon(item?.status) : null;
              
              return (
                <button
                  key={item?.path}
                  onClick={() => handleNavigation(item?.path)}
                  className={`w-full flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                    isActive(item?.path)
                      ? 'bg-primary text-primary-foreground shadow-elevation-1'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                  }`}
                  title={isCollapsed ? item?.label : undefined}
                >
                  <Icon 
                    name={item?.icon} 
                    size={18} 
                    className={`flex-shrink-0 ${isCollapsed ? 'mx-auto' : 'mr-3'}`}
                  />
                  {!isCollapsed && (
                    <>
                      <span className="flex-1 text-left">{item?.label}</span>
                      {statusInfo && (
                        <Icon 
                          name={statusInfo?.icon} 
                          size={14} 
                          color={statusInfo?.color}
                          className={`ml-2 ${item?.status === 'syncing' ? 'animate-spin' : ''}`}
                        />
                      )}
                    </>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Quick Actions */}
        {!isCollapsed && (
          <div className="px-3 py-4 border-t border-border">
            <div className="space-y-2">
              <Button
                variant="default"
                fullWidth
                iconName="Plus"
                iconPosition="left"
                iconSize={16}
                onClick={() => navigate('/invoice-creation')}
                className="justify-start"
              >
                Nieuwe Factuur
              </Button>
              <Button
                variant="outline"
                fullWidth
                iconName="Receipt"
                iconPosition="left"
                iconSize={16}
                onClick={() => navigate('/expense-management')}
                className="justify-start"
              >
                Uitgave Toevoegen
              </Button>
            </div>
          </div>
        )}

        {/* User Profile */}
        <div className="px-3 py-4 border-t border-border">
          <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'space-x-3'}`}>
            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
              <Icon name="User" size={16} color="var(--color-muted-foreground)" />
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Jan Janssen</p>
                <p className="text-xs text-muted-foreground truncate">jan@zzpboekhouder.nl</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;