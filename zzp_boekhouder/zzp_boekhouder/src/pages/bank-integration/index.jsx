import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import QuickActionWidget from '../../components/ui/QuickActionWidget';
import AIChatWidget from '../../components/ui/AIChatWidget';
import BankAccountCard from './components/BankAccountCard';
import TransactionTable from './components/TransactionTable';
import TransactionFilters from './components/TransactionFilters';
import BankConnectionWizard from './components/BankConnectionWizard';
import ReconciliationModal from './components/ReconciliationModal';
import bankService from '../../services/bankService';
import tinkService from '../../services/tinkService';
import { supabase } from '../../lib/supabase';

const BankIntegration = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isConnectionWizardOpen, setIsConnectionWizardOpen] = useState(false);
  const [isReconciliationModalOpen, setIsReconciliationModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  // Data states
  const [connectedAccounts, setConnectedAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [transactionStats, setTransactionStats] = useState(null);
  
  // Loading states
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);

  // Error states
  const [error, setError] = useState(null);

  // Load initial data
  useEffect(() => {
    if (isAuthenticated && user) {
      loadBankAccounts();
      loadTransactions();
      loadTransactionStats();
    }
  }, [isAuthenticated, user]);

  // Real-time subscriptions
  useEffect(() => {
    if (!isAuthenticated) return;

    const transactionSubscription = bankService?.subscribeToTransactions((payload) => {
      console.log('Transaction change:', payload);
      loadTransactions(); // Reload transactions on changes
    });

    const accountSubscription = bankService?.subscribeToBankAccounts((payload) => {
      console.log('Account change:', payload);
      loadBankAccounts(); // Reload accounts on changes
    });

    return () => {
      bankService?.unsubscribe(transactionSubscription);
      bankService?.unsubscribe(accountSubscription);
    };
  }, [isAuthenticated]);

  // Handle Tink OAuth callback
  useEffect(() => {
    const handleTinkCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const authCode = urlParams?.get('code');
      const error = urlParams?.get('error');
      const connectionId = sessionStorage?.getItem('tink_connection_id');

      if (authCode && connectionId) {
        setProcessingCallback(true);
        
        try {
          // Exchange code for tokens
          const { data: tokenData, error: tokenError } = await tinkService?.exchangeCodeForToken(authCode);
          
          if (tokenError) {
            throw new Error('Failed to exchange authorization code');
          }

          // Store encrypted tokens
          const { error: storeError } = await tinkService?.storeConnectionTokens(connectionId, tokenData);
          
          if (storeError) {
            throw new Error('Failed to store connection tokens');
          }

          // Sync account data
          const { error: syncError } = await tinkService?.syncAccountData(connectionId, tokenData?.access_token);
          
          if (syncError) {
            console.error('Failed to sync account data:', syncError);
          }

          // Clean up and reload data
          sessionStorage?.removeItem('tink_connection_id');
          sessionStorage?.removeItem('tink_connection_bank');
          window.history?.replaceState({}, document.title, '/bank-integration');
          
          await loadBankAccounts();
          await loadTransactions();
          
        } catch (err) {
          setError(`Tink verbinding mislukt: ${err?.message}`);
          
          // Mark connection as failed
          if (connectionId) {
            await bankService?.updateBankConnection(connectionId, {
              status: 'error',
              error_message: err?.message
            });
          }
        } finally {
          setProcessingCallback(false);
        }
      } else if (error) {
        setError(`Tink autorisatie geweigerd: ${error}`);
        sessionStorage?.removeItem('tink_connection_id');
        sessionStorage?.removeItem('tink_connection_bank');
        window.history?.replaceState({}, document.title, '/bank-integration');
      }
    };

    handleTinkCallback();
  }, []);

  const loadBankAccounts = async () => {
    setAccountsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await bankService?.getBankAccounts();
      
      if (error) {
        throw new Error(error?.message || 'Failed to load bank accounts');
      }
      
      setConnectedAccounts(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load bank accounts');
      setConnectedAccounts([]);
    } finally {
      setAccountsLoading(false);
    }
  };

  const loadTransactions = async (filters = {}) => {
    setTransactionsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await bankService?.getTransactions(filters);
      
      if (error) {
        throw new Error(error?.message || 'Failed to load transactions');
      }
      
      setTransactions(data || []);
      setFilteredTransactions(data || []);
    } catch (err) {
      setError(err?.message || 'Failed to load transactions');
      setTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setTransactionsLoading(false);
    }
  };

  const loadTransactionStats = async () => {
    try {
      const { data, error } = await bankService?.getTransactionStats();
      
      if (error) {
        console.error('Failed to load transaction stats:', error);
        return;
      }
      
      setTransactionStats(data);
    } catch (err) {
      console.error('Failed to load transaction stats:', err);
    }
  };

  const handleRefreshAccount = async (accountId) => {
    setRefreshing(true);
    
    try {
      // Get account's connection details
      const { data: accountData, error: accountError } = await supabase
        ?.from('bank_accounts')
        ?.select(`
          connection_id,
          bank_connections!inner (
            id,
            access_token_encrypted,
            refresh_token_encrypted,
            expires_at
          )
        `)
        ?.eq('id', accountId)
        ?.single();

      if (accountError) {
        throw new Error('Failed to get account connection details');
      }

      const connection = accountData?.bank_connections;
      
      // Check if this is a real Tink connection
      if (connection?.access_token_encrypted) {
        // Decrypt and use access token for real sync
        const { data: decryptedData, error: decryptError } = await supabase?.functions?.invoke('decrypt_token', {
          body: { encrypted_token: connection?.access_token_encrypted }
        });

        if (decryptError) {
          throw new Error('Failed to decrypt access token');
        }

        // Sync with Tink API
        const { error: syncError } = await tinkService?.syncAccountData(
          connection?.id, 
          decryptedData?.access_token
        );
        
        if (syncError) {
          throw new Error('Failed to sync with Tink API');
        }
      } else {
        // Fallback to regular refresh for demo accounts
        const { error } = await bankService?.refreshBankAccount(accountId);
        
        if (error) {
          throw new Error(error?.message || 'Failed to refresh account');
        }
      }
      
      // Reload data after refresh
      await loadBankAccounts();
      await loadTransactions();
      
    } catch (err) {
      setError(err?.message || 'Failed to refresh account');
    } finally {
      setRefreshing(false);
    }
  };

  const handleDisconnectAccount = async (connectionId) => {
    try {
      const { error } = await bankService?.disconnectBankAccount(connectionId);
      
      if (error) {
        throw new Error(error?.message || 'Failed to disconnect account');
      }
      
      // Reload accounts after disconnection
      await loadBankAccounts();
      
    } catch (err) {
      setError(err?.message || 'Failed to disconnect account');
    }
  };

  const handleConnectBank = async (providerData, isRealTink = false) => {
    try {
      const { data, error } = await bankService?.createBankConnection(providerData);
      
      if (error) {
        throw new Error(error?.message || 'Failed to create bank connection');
      }
      
      if (isRealTink) {
        // Real Tink integration - return connection data for OAuth flow
        return { data, error: null };
      } else {
        // Demo/simulation mode - existing behavior
        setTimeout(async () => {
          await bankService?.updateBankConnection(data?.id, {
            status: 'connected',
            last_sync_at: new Date()?.toISOString()
          });
          
          await loadBankAccounts();
        }, 2000);
        
        return { data, error: null };
      }
    } catch (err) {
      setError(err?.message || 'Failed to connect bank');
      return { data: null, error: err };
    }
  };

  const getBankName = (bankValue) => {
    const bankNames = {
      'ing': 'ING Bank',
      'rabobank': 'Rabobank',
      'abn_amro': 'ABN AMRO',
      'sns': 'SNS Bank',
      'asn': 'ASN Bank',
      'triodos': 'Triodos Bank',
      'knab': 'Knab',
      'bunq': 'bunq'
    };
    return bankNames?.[bankValue] || 'Unknown Bank';
  };

  const handleFilterChange = async (filters) => {
    await loadTransactions(filters);
  };

  const handleCategorizeTransaction = async (transactionId, category) => {
    try {
      const { error } = await bankService?.categorizeTransaction(transactionId, category);
      
      if (error) {
        throw new Error(error?.message || 'Failed to categorize transaction');
      }
      
      // Update local state
      setTransactions(prev => 
        prev?.map(txn => 
          txn?.id === transactionId 
            ? { ...txn, category }
            : txn
        )
      );
      
      setFilteredTransactions(prev => 
        prev?.map(txn => 
          txn?.id === transactionId 
            ? { ...txn, category }
            : txn
        )
      );
      
    } catch (err) {
      setError(err?.message || 'Failed to categorize transaction');
    }
  };

  const handleReconcileTransaction = (transactionId) => {
    const transaction = transactions?.find(txn => txn?.id === transactionId);
    setSelectedTransaction(transaction);
    setIsReconciliationModalOpen(true);
  };

  const handleReconcileComplete = async (transactionId, matchType, matchId) => {
    try {
      const { error } = await bankService?.reconcileTransaction(transactionId, {
        reconciled_with: `${matchType}:${matchId}`
      });
      
      if (error) {
        throw new Error(error?.message || 'Failed to reconcile transaction');
      }
      
      // Update local state
      setTransactions(prev => 
        prev?.map(txn => 
          txn?.id === transactionId 
            ? { ...txn, is_reconciled: true, status: 'completed' }
            : txn
        )
      );
      
      setFilteredTransactions(prev => 
        prev?.map(txn => 
          txn?.id === transactionId 
            ? { ...txn, is_reconciled: true, status: 'completed' }
            : txn
        )
      );
      
    } catch (err) {
      setError(err?.message || 'Failed to reconcile transaction');
    }
  };

  const handleExportTransactions = async () => {
    try {
      const { data, error } = await bankService?.exportTransactions();
      
      if (error) {
        throw new Error(error?.message || 'Failed to export transactions');
      }
      
      // Create and download CSV file
      const blob = new Blob([data], { type: 'text/csv' });
      const url = window.URL?.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `transactions_${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
      document.body?.appendChild(a);
      a?.click();
      window.URL?.revokeObjectURL(url);
      document.body?.removeChild(a);
      
    } catch (err) {
      setError(err?.message || 'Failed to export transactions');
    }
  };

  const getAccountsSummary = () => {
    const totalBalance = connectedAccounts?.reduce((sum, account) => sum + (parseFloat(account?.balance) || 0), 0);
    const totalTransactions = transactions?.length || 0;
    const unmatchedCount = transactions?.filter(txn => !txn?.is_reconciled)?.length || 0;

    return { totalBalance, totalTransactions, unmatchedCount };
  };

  // Show processing state during Tink callback
  if (processingCallback) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Bankverbinding wordt verwerkt...</p>
        </div>
      </div>
    );
  }

  // Show loading state while authenticating
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Lock" size={32} color="var(--color-muted-foreground)" />
          </div>
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Authentication Required
          </h3>
          <p className="text-muted-foreground mb-6">
            Please sign in to access your bank integration.
          </p>
          <Button
            variant="default"
            onClick={() => navigate('/login')}
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  const summary = getAccountsSummary();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <main className={`transition-all duration-300 ease-out pt-16 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-60'
      }`}>
        <div className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-foreground mb-2">Bank Integratie</h1>
              <p className="text-muted-foreground">
                Beheer je bankverbindingen en synchroniseer transacties automatisch met Tink
              </p>
            </div>
            <Button
              variant="default"
              iconName="Plus"
              iconPosition="left"
              iconSize={20}
              onClick={() => setIsConnectionWizardOpen(true)}
              disabled={accountsLoading}
            >
              Bank Verbinden
            </Button>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 mb-6">
              <div className="flex items-start space-x-3">
                <Icon name="AlertCircle" size={20} color="var(--color-destructive)" className="mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-medium text-destructive mb-1">Error</h4>
                  <p className="text-sm text-destructive/80">{error}</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={() => setError(null)}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Totaal Saldo</p>
                  <p className="text-2xl font-bold text-foreground">
                    {new Intl.NumberFormat('nl-NL', {
                      style: 'currency',
                      currency: 'EUR'
                    })?.format(summary?.totalBalance || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="Wallet" size={24} color="var(--color-success)" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Transacties</p>
                  <p className="text-2xl font-bold text-foreground">{summary?.totalTransactions || 0}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="ArrowLeftRight" size={24} color="var(--color-primary)" />
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Niet Gematcht</p>
                  <p className="text-2xl font-bold text-foreground">{summary?.unmatchedCount || 0}</p>
                </div>
                <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertCircle" size={24} color="var(--color-warning)" />
                </div>
              </div>
            </div>
          </div>

          {/* Connected Accounts */}
          {accountsLoading ? (
            <div className="bg-card border border-border rounded-lg p-12 text-center mb-8">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading bank accounts...</p>
            </div>
          ) : connectedAccounts?.length > 0 ? (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-foreground mb-4">Verbonden Rekeningen</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {connectedAccounts?.map((account) => (
                  <BankAccountCard
                    key={account?.id}
                    account={account}
                    onRefresh={handleRefreshAccount}
                    onDisconnect={() => handleDisconnectAccount(account?.bank_connections?.id)}
                    refreshing={refreshing}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border rounded-lg p-12 text-center mb-8">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="Building2" size={32} color="var(--color-muted-foreground)" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Geen bankrekeningen verbonden
              </h3>
              <p className="text-muted-foreground mb-6">
                Verbind je bankrekening via Tink om automatisch transacties te synchroniseren en je boekhouding up-to-date te houden.
              </p>
              <Button
                variant="default"
                iconName="Plus"
                iconPosition="left"
                iconSize={20}
                onClick={() => setIsConnectionWizardOpen(true)}
              >
                Eerste Bank Verbinden
              </Button>
            </div>
          )}

          {/* Transactions Section */}
          {connectedAccounts?.length > 0 && (
            <>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-foreground">Transacties</h2>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    iconName="RefreshCw"
                    iconPosition="left"
                    iconSize={16}
                    onClick={() => {
                      loadTransactions();
                      loadBankAccounts();
                    }}
                    disabled={transactionsLoading || refreshing}
                  >
                    {transactionsLoading || refreshing ? 'Synchroniseren...' : 'Alles Synchroniseren'}
                  </Button>
                </div>
              </div>

              <TransactionFilters
                onFilterChange={handleFilterChange}
                onExport={handleExportTransactions}
                loading={transactionsLoading}
              />

              <TransactionTable
                transactions={filteredTransactions}
                onCategorize={handleCategorizeTransaction}
                onReconcile={handleReconcileTransaction}
                loading={transactionsLoading}
              />
            </>
          )}
        </div>
      </main>
      {/* Modals and Widgets */}
      <BankConnectionWizard
        isOpen={isConnectionWizardOpen}
        onClose={() => setIsConnectionWizardOpen(false)}
        onConnect={handleConnectBank}
      />
      <ReconciliationModal
        isOpen={isReconciliationModalOpen}
        onClose={() => setIsReconciliationModalOpen(false)}
        transaction={selectedTransaction}
        onReconcile={handleReconcileComplete}
      />
      <QuickActionWidget />
      <AIChatWidget />
    </div>
  );
};

export default BankIntegration;