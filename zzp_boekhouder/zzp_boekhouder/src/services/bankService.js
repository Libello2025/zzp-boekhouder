import { supabase } from '../lib/supabase';

/**
 * Bank Service - Handles all bank-related operations with Supabase
 * Replaces mock data with real database operations
 */

class BankService {
  /**
   * Get all bank connections for the current user
   */
  async getBankConnections() {
    try {
      const { data, error } = await supabase?.from('bank_connections')?.select(`
          *,
          bank_accounts (
            id,
            account_number,
            account_name,
            account_type,
            balance,
            available_balance,
            bank_name,
            currency,
            is_active
          )
        `)?.eq('status', 'connected')?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get all bank accounts for the current user
   */
  async getBankAccounts() {
    try {
      const { data, error } = await supabase?.from('bank_accounts')?.select(`
          *,
          bank_connections!inner (
            id,
            provider_name,
            status,
            last_sync_at
          )
        `)?.eq('is_active', true)?.order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get transactions with filtering options
   */
  async getTransactions(filters = {}) {
    try {
      let query = supabase?.from('transactions')?.select(`
          *,
          bank_accounts!inner (
            id,
            account_name,
            account_number,
            bank_name
          )
        `);

      // Apply filters
      if (filters?.search) {
        query = query?.or(`description.ilike.%${filters?.search}%,counterpart_name.ilike.%${filters?.search}%,reference.ilike.%${filters?.search}%`);
      }

      if (filters?.category) {
        query = query?.eq('category', filters?.category);
      }

      if (filters?.status) {
        query = query?.eq('status', filters?.status);
      }

      if (filters?.accountId) {
        query = query?.eq('account_id', filters?.accountId);
      }

      if (filters?.dateFrom) {
        query = query?.gte('transaction_date', filters?.dateFrom);
      }

      if (filters?.dateTo) {
        query = query?.lte('transaction_date', filters?.dateTo);
      }

      if (filters?.amountMin) {
        query = query?.gte('amount', filters?.amountMin);
      }

      if (filters?.amountMax) {
        query = query?.lte('amount', filters?.amountMax);
      }

      // Order by transaction date (newest first)
      query = query?.order('transaction_date', { ascending: false });

      const { data, error } = await query;

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Create a new bank connection (initiate Tink integration)
   */
  async createBankConnection(providerData) {
    try {
      // Get current user from Supabase auth
      const { data: { user }, error: authError } = await supabase?.auth?.getUser();
      
      if (authError || !user) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase?.from('bank_connections')?.insert({
          user_id: user?.id, // Fix: Add the missing user_id field
          provider_name: providerData?.provider_name,
          provider_id: providerData?.provider_id,
          connection_id: providerData?.connection_id,
          status: 'pending',
          metadata: providerData?.metadata || {}
        })?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Update bank connection status
   */
  async updateBankConnection(connectionId, updates) {
    try {
      const { data, error } = await supabase?.from('bank_connections')?.update({
          ...updates,
          updated_at: new Date()?.toISOString()
        })?.eq('id', connectionId)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Enhanced refresh method that supports both Tink API and demo accounts
   */
  async refreshBankAccount(accountId) {
    try {
      // Get account connection details
      const { data: accountData, error: accountError } = await supabase
        ?.from('bank_accounts')
        ?.select(`
          id,
          connection_id,
          external_account_id,
          bank_connections!inner (
            id,
            access_token_encrypted,
            provider_type,
            metadata
          )
        `)
        ?.eq('id', accountId)
        ?.single();

      if (accountError) {
        throw accountError;
      }

      const connection = accountData?.bank_connections;
      const isRealTink = connection?.access_token_encrypted && 
                        connection?.metadata?.provider_type === 'tink';

      if (isRealTink) {
        // For real Tink connections, we should use the TinkService
        // This method serves as fallback for demo accounts only
        console.warn('Use TinkService.syncAccountData() for real Tink connections');
      }

      // Update last_sync_at for demo accounts or fallback
      const { data: connectionData, error: connectionError } = await supabase
        ?.from('bank_connections')
        ?.update({
          last_sync_at: new Date()?.toISOString(),
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', accountData?.connection_id)
        ?.select()
        ?.single();

      if (connectionError) {
        throw connectionError;
      }

      return { data: connectionData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Enhanced disconnect method that properly handles Tink OAuth revocation
   */
  async disconnectBankAccount(connectionId) {
    try {
      // Get connection details first
      const { data: connectionData, error: fetchError } = await supabase
        ?.from('bank_connections')
        ?.select('access_token_encrypted, metadata')
        ?.eq('id', connectionId)
        ?.single();

      if (fetchError) {
        throw fetchError;
      }

      // If this is a real Tink connection, revoke OAuth access
      if (connectionData?.access_token_encrypted && 
          connectionData?.metadata?.provider_type === 'tink') {
        
        try {
          // Decrypt access token
          const { data: decryptedData, error: decryptError } = await supabase?.functions?.invoke('decrypt_token', {
            body: { encrypted_token: connectionData?.access_token_encrypted }
          });

          if (!decryptError && decryptedData?.access_token) {
            // Import TinkService dynamically to avoid circular dependency
            const { tinkService } = await import('./tinkService');
            await tinkService?.revokeAccess(decryptedData?.access_token);
          }
        } catch (revokeError) {
          console.warn('Failed to revoke Tink access:', revokeError);
          // Continue with disconnection even if revocation fails
        }
      }

      // Mark connection as disconnected
      const { data, error } = await supabase
        ?.from('bank_connections')
        ?.update({
          status: 'disconnected',
          access_token_encrypted: null,
          refresh_token_encrypted: null,
          expires_at: null,
          updated_at: new Date()?.toISOString()
        })
        ?.eq('id', connectionId)
        ?.select()
        ?.single();

      if (error) {
        throw error;
      }

      // Mark associated accounts as inactive
      await supabase
        ?.from('bank_accounts')
        ?.update({ is_active: false })
        ?.eq('connection_id', connectionId);

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Categorize a transaction
   */
  async categorizeTransaction(transactionId, category) {
    try {
      const { data, error } = await supabase?.from('transactions')?.update({
          category,
          updated_at: new Date()?.toISOString()
        })?.eq('id', transactionId)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Reconcile a transaction
   */
  async reconcileTransaction(transactionId, reconciliationData) {
    try {
      const { data, error } = await supabase?.from('transactions')?.update({
          is_reconciled: true,
          reconciled_with: reconciliationData?.reconciled_with,
          status: 'completed',
          updated_at: new Date()?.toISOString()
        })?.eq('id', transactionId)?.select()?.single();

      if (error) {
        throw error;
      }

      return { data, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get transaction statistics
   */
  async getTransactionStats() {
    try {
      const { data: transactions, error } = await supabase?.from('transactions')?.select('amount, category, transaction_date');

      if (error) {
        throw error;
      }

      const stats = {
        totalTransactions: transactions?.length || 0,
        totalIncome: 0,
        totalExpenses: 0,
        categoryCounts: {},
        monthlyTotals: {}
      };

      transactions?.forEach(transaction => {
        const amount = parseFloat(transaction?.amount) || 0;
        const category = transaction?.category || 'other';
        const date = new Date(transaction?.transaction_date);
        const monthKey = `${date?.getFullYear()}-${String(date?.getMonth() + 1)?.padStart(2, '0')}`;

        // Income vs Expenses
        if (amount > 0) {
          stats.totalIncome += amount;
        } else {
          stats.totalExpenses += Math.abs(amount);
        }

        // Category counts
        stats.categoryCounts[category] = (stats?.categoryCounts?.[category] || 0) + 1;

        // Monthly totals
        if (!stats?.monthlyTotals?.[monthKey]) {
          stats.monthlyTotals[monthKey] = { income: 0, expenses: 0 };
        }
        
        if (amount > 0) {
          stats.monthlyTotals[monthKey].income += amount;
        } else {
          stats.monthlyTotals[monthKey].expenses += Math.abs(amount);
        }
      });

      return { data: stats, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Export transactions to CSV
   */
  async exportTransactions(filters = {}) {
    try {
      const { data: transactions, error } = await this.getTransactions(filters);

      if (error) {
        throw error;
      }

      // Convert to CSV format
      const headers = [
        'Datum',
        'Beschrijving',
        'Bedrag',
        'Categorie',
        'Tegenpartij',
        'Referentie',
        'Rekening',
        'Status'
      ];

      const csvData = transactions?.map(tx => [
        new Date(tx?.transaction_date)?.toLocaleDateString('nl-NL'),
        tx?.description || '',
        new Intl.NumberFormat('nl-NL', { 
          style: 'currency', 
          currency: tx?.currency || 'EUR' 
        })?.format(tx?.amount || 0),
        tx?.category || '',
        tx?.counterpart_name || '',
        tx?.reference || '',
        tx?.bank_accounts?.account_name || '',
        tx?.status || ''
      ]);

      const csvContent = [headers, ...csvData]?.map(row => row?.map(cell => `"${cell}"`)?.join(','))?.join('\n');

      return { data: csvContent, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Real-time subscription for transactions
   */
  subscribeToTransactions(callback) {
    const subscription = supabase?.channel('transactions-changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        callback
      )?.subscribe();

    return subscription;
  }

  /**
   * Real-time subscription for bank accounts
   */
  subscribeToBankAccounts(callback) {
    const subscription = supabase?.channel('bank-accounts-changes')?.on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bank_accounts'
        },
        callback
      )?.subscribe();

    return subscription;
  }

  /**
   * Unsubscribe from real-time updates
   */
  unsubscribe(subscription) {
    if (subscription) {
      supabase?.removeChannel(subscription);
    }
  }
}

// Export singleton instance
export const bankService = new BankService();
export default bankService;