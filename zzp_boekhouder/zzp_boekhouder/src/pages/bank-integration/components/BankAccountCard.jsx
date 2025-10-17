import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const BankAccountCard = ({ account, onRefresh, onDisconnect, refreshing = false }) => {
  if (!account) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: account?.currency || 'EUR'
    })?.format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Nooit';
    return new Date(dateString)?.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConnectionStatusColor = (status) => {
    switch (status) {
      case 'connected':
        return 'var(--color-success)';
      case 'pending':
        return 'var(--color-warning)';
      case 'error':
        return 'var(--color-destructive)';
      default:
        return 'var(--color-muted-foreground)';
    }
  };

  const getConnectionStatusIcon = (status) => {
    switch (status) {
      case 'connected':
        return 'CheckCircle';
      case 'pending':
        return 'Clock';
      case 'error':
        return 'AlertCircle';
      default:
        return 'Circle';
    }
  };

  // Handle both direct account data and nested structure
  const connectionData = account?.bank_connections || {};
  const lastSyncDate = connectionData?.last_sync_at || account?.last_sync_at;
  const connectionStatus = connectionData?.status || account?.status || 'connected';

  return (
    <div className="bg-card border border-border rounded-lg p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Building2" size={24} color="var(--color-primary)" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">{account?.bank_name}</h3>
            <p className="text-sm text-muted-foreground">{account?.account_type}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <Icon 
            name={getConnectionStatusIcon(connectionStatus)} 
            size={16} 
            color={getConnectionStatusColor(connectionStatus)} 
          />
          <span className="text-xs text-muted-foreground capitalize">
            {connectionStatus}
          </span>
        </div>
      </div>

      {/* Account Details */}
      <div className="space-y-3 mb-4">
        <div>
          <p className="text-sm text-muted-foreground">Rekeningnummer</p>
          <p className="font-mono text-sm text-foreground">{account?.account_number}</p>
        </div>
        
        <div>
          <p className="text-sm text-muted-foreground">Rekeningnaam</p>
          <p className="text-sm text-foreground">{account?.account_name}</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-muted-foreground">Saldo</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(account?.balance)}
            </p>
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Beschikbaar</p>
            <p className="text-lg font-semibold text-foreground">
              {formatCurrency(account?.available_balance || account?.balance)}
            </p>
          </div>
        </div>
      </div>

      {/* Last Sync Info */}
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
        <div className="flex items-center space-x-1">
          <Icon name="RefreshCw" size={14} />
          <span>Laatste sync: {formatDate(lastSyncDate)}</span>
        </div>
        {account?.bic_code && (
          <span className="font-mono">{account?.bic_code}</span>
        )}
      </div>

      {/* Actions */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          iconName="RefreshCw"
          iconPosition="left"
          iconSize={14}
          onClick={() => onRefresh?.(account?.id)}
          disabled={refreshing || connectionStatus !== 'connected'}
          className="flex-1"
        >
          {refreshing ? 'Synchroniseren...' : 'Vernieuwen'}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          iconName="Unlink"
          iconPosition="left"
          iconSize={14}
          onClick={() => onDisconnect?.(account?.id)}
          disabled={refreshing}
          className="text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          Ontkoppelen
        </Button>
      </div>

      {/* Additional Info */}
      {connectionStatus === 'error' && connectionData?.error_message && (
        <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="AlertTriangle" size={16} color="var(--color-destructive)" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-destructive">Verbindingsprobleem</p>
              <p className="text-xs text-destructive/80 mt-1">
                {connectionData?.error_message}
              </p>
            </div>
          </div>
        </div>
      )}

      {connectionStatus === 'pending' && (
        <div className="mt-4 p-3 bg-warning/10 border border-warning/20 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="Clock" size={16} color="var(--color-warning)" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-warning">Verbinding in uitvoering</p>
              <p className="text-xs text-warning/80 mt-1">
                Je bankverbinding wordt momenteel opgezet. Dit kan enkele minuten duren.
              </p>
            </div>
          </div>
        </div>
      )}

      {connectionData?.expires_at && (
        <div className="mt-4 p-3 bg-muted/50 rounded-md">
          <div className="flex items-start space-x-2">
            <Icon name="Calendar" size={16} color="var(--color-muted-foreground)" className="mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Toestemming verloopt</p>
              <p className="text-xs text-muted-foreground mt-1">
                {formatDate(connectionData?.expires_at)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BankAccountCard;