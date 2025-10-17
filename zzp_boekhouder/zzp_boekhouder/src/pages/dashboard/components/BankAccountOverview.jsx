import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import ConnectionStatusIndicator from '../../../components/ui/ConnectionStatusIndicator';

const BankAccountOverview = () => {
  const [selectedAccount, setSelectedAccount] = useState(null);

  const accounts = [];
  const recentTransactions = [];

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatTime = (date) => {
    return date?.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Bankrekeningen</h2>
        <ConnectionStatusIndicator service="bank" />
      </div>
      
      {accounts?.length === 0 ? (
        <div className="text-center py-12">
          <Icon name="CreditCard" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
          <h3 className="text-lg font-medium text-foreground mb-2">Geen bankrekeningen gekoppeld</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Koppel je bankrekening om automatisch transacties te synchroniseren en je financiën bij te houden
          </p>
          <div className="space-y-3">
            <button className="w-full bg-primary text-primary-foreground px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors duration-200">
              <Icon name="Plus" size={16} className="inline mr-2" />
              Bankrekening koppelen
            </button>
            <p className="text-xs text-muted-foreground">
              Ondersteunt alle grote Nederlandse banken via Tink
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Account Selector */}
          <div className="mb-6">
            <div className="flex space-x-2 overflow-x-auto">
              {accounts?.map((account) => (
                <button
                  key={account?.id}
                  onClick={() => setSelectedAccount(account?.id)}
                  className={`flex-shrink-0 p-3 rounded-lg border transition-all duration-200 ${
                    selectedAccount === account?.id
                      ? 'border-primary bg-primary/10 text-primary' : 'border-border hover:bg-muted/50'
                  }`}
                >
                  <div className="text-left">
                    <p className="text-sm font-medium">{account?.name}</p>
                    <p className="text-xs text-muted-foreground">{account?.iban}</p>
                    <p className="text-lg font-bold mt-1">{formatAmount(account?.balance)}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BankAccountOverview;