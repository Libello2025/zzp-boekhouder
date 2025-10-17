import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';

const ConnectionStatusIndicator = ({ 
  service = 'bank', 
  className = '',
  showLabel = true,
  size = 'default' 
}) => {
  const [status, setStatus] = useState('connected');
  const [lastSync, setLastSync] = useState(new Date());

  // Simulate connection status changes
  useEffect(() => {
    const interval = setInterval(() => {
      // Simulate occasional disconnections or sync states
      const random = Math.random();
      if (random < 0.05) {
        setStatus('disconnected');
      } else if (random < 0.1) {
        setStatus('syncing');
      } else {
        setStatus('connected');
        setLastSync(new Date());
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const getStatusConfig = () => {
    switch (status) {
      case 'connected':
        return {
          icon: 'CheckCircle',
          color: 'var(--color-success)',
          bgColor: 'bg-success/10',
          textColor: 'text-success',
          label: 'Verbonden',
          message: `Laatste sync: ${lastSync?.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}`
        };
      case 'disconnected':
        return {
          icon: 'XCircle',
          color: 'var(--color-error)',
          bgColor: 'bg-error/10',
          textColor: 'text-error',
          label: 'Niet verbonden',
          message: 'Klik om opnieuw te verbinden'
        };
      case 'syncing':
        return {
          icon: 'RefreshCw',
          color: 'var(--color-warning)',
          bgColor: 'bg-warning/10',
          textColor: 'text-warning',
          label: 'Synchroniseren...',
          message: 'Transacties worden bijgewerkt'
        };
      default:
        return {
          icon: 'Circle',
          color: 'var(--color-muted-foreground)',
          bgColor: 'bg-muted',
          textColor: 'text-muted-foreground',
          label: 'Onbekend',
          message: 'Status onbekend'
        };
    }
  };

  const config = getStatusConfig();
  const iconSize = size === 'sm' ? 12 : size === 'lg' ? 20 : 16;

  const handleClick = () => {
    if (status === 'disconnected') {
      setStatus('syncing');
      setTimeout(() => {
        setStatus('connected');
        setLastSync(new Date());
      }, 2000);
    }
  };

  return (
    <div 
      className={`flex items-center space-x-2 ${className} ${
        status === 'disconnected' ? 'cursor-pointer' : ''
      }`}
      onClick={handleClick}
      title={config?.message}
    >
      <div className={`p-1 rounded-full ${config?.bgColor}`}>
        <Icon 
          name={config?.icon} 
          size={iconSize} 
          color={config?.color}
          className={status === 'syncing' ? 'animate-spin' : ''}
        />
      </div>
      {showLabel && (
        <span className={`text-sm font-medium ${config?.textColor}`}>
          {config?.label}
        </span>
      )}
    </div>
  );
};

export default ConnectionStatusIndicator;