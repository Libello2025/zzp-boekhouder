import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const primaryNavItems = [
    { path: '/dashboard', label: 'Dashboard', icon: 'LayoutDashboard' },
    { path: '/client-management', label: 'Klanten', icon: 'Users' },
    { path: '/invoice-creation', label: 'Facturen', icon: 'FileText' },
    { path: '/time-tracking', label: 'Tijd', icon: 'Clock' },
    { path: '/expense-management', label: 'Uitgaven', icon: 'Receipt' }
  ];

  const secondaryNavItems = [
    { path: '/bank-integration', label: 'Bank', icon: 'CreditCard' }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMoreMenuOpen(false);
  };

  const isActive = (path) => location?.pathname === path;

  const handleNotificationClick = () => {
    setShowNotifications(!showNotifications);
    setShowSettings(false);
  };

  const handleSettingsClick = () => {
    setShowSettings(!showSettings);
    setShowNotifications(false);
  };

  const handleUserProfileClick = () => {
    navigate('/profile');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-100 bg-card border-b border-border">
      <div className="flex items-center justify-between h-16 px-6">
        {/* Logo */}
        <div className="flex items-center">
          <div className="flex items-center space-x-2 cursor-pointer" onClick={() => navigate('/dashboard')}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Calculator" size={20} color="white" />
            </div>
            <span className="text-xl font-semibold text-foreground">ZZP Boekhouder</span>
          </div>
        </div>

        {/* Primary Navigation */}
        <nav className="hidden lg:flex items-center space-x-1">
          {primaryNavItems?.map((item) => (
            <Button
              key={item?.path}
              variant={isActive(item?.path) ? "default" : "ghost"}
              onClick={() => handleNavigation(item?.path)}
              iconName={item?.icon}
              iconPosition="left"
              iconSize={18}
              className="px-4 py-2"
            >
              {item?.label}
            </Button>
          ))}
          
          {/* More Menu */}
          <div className="relative">
            <Button
              variant="ghost"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              iconName="MoreHorizontal"
              iconSize={18}
              className="px-4 py-2"
            >
              Meer
            </Button>
            
            {isMoreMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-popover border border-border rounded-lg shadow-elevation-2 z-200">
                <div className="py-1">
                  {secondaryNavItems?.map((item) => (
                    <button
                      key={item?.path}
                      onClick={() => handleNavigation(item?.path)}
                      className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200 ${
                        isActive(item?.path)
                          ? 'bg-primary text-primary-foreground'
                          : 'text-popover-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon name={item?.icon} size={16} className="mr-3" />
                      {item?.label}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="lg:hidden">
          <Button
            variant="ghost"
            iconName="Menu"
            iconSize={20}
            onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
          />
        </div>

        {/* User Actions */}
        <div className="hidden lg:flex items-center space-x-2 relative">
          {/* Notifications */}
          <div className="relative">
            <Button 
              variant="outline" 
              iconName="Bell" 
              iconSize={18} 
              onClick={handleNotificationClick}
              className="relative"
            >
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 bg-popover border border-border rounded-lg shadow-elevation-2 z-200">
                <div className="p-4 border-b border-border">
                  <h3 className="font-medium text-popover-foreground">Notificaties</h3>
                </div>
                <div className="p-4 text-sm text-popover-foreground">
                  <p className="text-muted-foreground">Geen nieuwe notificaties</p>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Je krijgt hier updates over openstaande facturen, betalingen en belangrijke deadlines.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Settings */}
          <div className="relative">
            <Button 
              variant="outline" 
              iconName="Settings" 
              iconSize={18} 
              onClick={handleSettingsClick}
            />
            
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-64 bg-popover border border-border rounded-lg shadow-elevation-2 z-200">
                <div className="p-1">
                  <button 
                    onClick={() => navigate('/settings/profile')}
                    className="w-full flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors duration-200"
                  >
                    <Icon name="User" size={16} className="mr-3" />
                    Profiel Instellingen
                  </button>
                  <button 
                    onClick={() => navigate('/settings/company')}
                    className="w-full flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors duration-200"
                  >
                    <Icon name="Building" size={16} className="mr-3" />
                    Bedrijfsgegevens
                  </button>
                  <button 
                    onClick={() => navigate('/settings/tax')}
                    className="w-full flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors duration-200"
                  >
                    <Icon name="FileText" size={16} className="mr-3" />
                    BTW Instellingen
                  </button>
                  <button 
                    onClick={() => navigate('/settings/backup')}
                    className="w-full flex items-center px-3 py-2 text-sm text-popover-foreground hover:bg-muted rounded-md transition-colors duration-200"
                  >
                    <Icon name="Download" size={16} className="mr-3" />
                    Backup & Export
                  </button>
                  <div className="border-t border-border my-1"></div>
                  <button 
                    onClick={() => {
                      // Handle logout
                      localStorage.clear();
                      navigate('/');
                    }}
                    className="w-full flex items-center px-3 py-2 text-sm text-destructive hover:bg-muted rounded-md transition-colors duration-200"
                  >
                    <Icon name="LogOut" size={16} className="mr-3" />
                    Uitloggen
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile */}
          <div 
            className="w-8 h-8 bg-muted rounded-full flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors duration-200"
            onClick={handleUserProfileClick}
          >
            <Icon name="User" size={16} color="var(--color-muted-foreground)" />
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation Menu */}
      {isMoreMenuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="px-4 py-2 space-y-1">
            {[...primaryNavItems, ...secondaryNavItems]?.map((item) => (
              <button
                key={item?.path}
                onClick={() => handleNavigation(item?.path)}
                className={`w-full flex items-center px-3 py-2 rounded-md text-sm transition-colors duration-200 ${
                  isActive(item?.path)
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted'
                }`}
              >
                <Icon name={item?.icon} size={16} className="mr-3" />
                {item?.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;