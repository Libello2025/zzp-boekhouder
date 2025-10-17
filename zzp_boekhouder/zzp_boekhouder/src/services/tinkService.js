import { supabase } from '../lib/supabase';

/**
 * Tink Integration Service
 * Handles real Tink API integration for production-ready bank connections
 */

class TinkService {
  constructor() {
    // Tink API configuration - these would be set via environment variables
    this.clientId = import.meta.env?.VITE_TINK_CLIENT_ID;
    this.clientSecret = import.meta.env?.VITE_TINK_CLIENT_SECRET;
    this.redirectUri = `${window.location?.origin}/bank-integration/callback`;
    this.tinkApiBase = 'https://api.tink.com';
    this.tinkLinkBase = 'https://link.tink.com';
  }

  /**
   * Generate Tink Link URL for bank authentication
   */
  generateTinkLinkUrl(market = 'NL', locale = 'nl_NL', test = false) {
    const params = new URLSearchParams({
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'accounts:read,transactions:read', // Add required scope parameter
      response_type: 'code', // Explicitly set response type
      market,
      locale,
      test: test ? 'true' : 'false'
    });

    return `${this.tinkLinkBase}/1.0/authorize/?${params?.toString()}`;
  }

  /**
   * Exchange authorization code for access token
   */
  async exchangeCodeForToken(authorizationCode) {
    try {
      const response = await fetch(`${this.tinkApiBase}/api/v1/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          code: authorizationCode,
          client_id: this.clientId,
          client_secret: this.clientSecret,
          grant_type: 'authorization_code',
          redirect_uri: this.redirectUri
        })
      });

      if (!response?.ok) {
        throw new Error(`Tink token exchange failed: ${response.status}`);
      }

      const tokenData = await response?.json();
      return { data: tokenData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get user's connected accounts from Tink
   */
  async getAccounts(accessToken) {
    try {
      const response = await fetch(`${this.tinkApiBase}/data/v2/accounts`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response?.ok) {
        throw new Error(`Failed to fetch accounts: ${response.status}`);
      }

      const accountsData = await response?.json();
      return { data: accountsData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Get transactions for specific account
   */
  async getTransactions(accessToken, accountId, pageSize = 100) {
    try {
      const response = await fetch(`${this.tinkApiBase}/data/v2/transactions?accountIdIn=${accountId}&pageSize=${pageSize}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      });

      if (!response?.ok) {
        throw new Error(`Failed to fetch transactions: ${response.status}`);
      }

      const transactionsData = await response?.json();
      return { data: transactionsData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken) {
    try {
      const response = await fetch(`${this.tinkApiBase}/api/v1/oauth/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${btoa(`${this.clientId}:${this.clientSecret}`)}`
        },
        body: new URLSearchParams({
          refresh_token: refreshToken,
          grant_type: 'refresh_token'
        })
      });

      if (!response?.ok) {
        throw new Error(`Token refresh failed: ${response.status}`);
      }

      const tokenData = await response?.json();
      return { data: tokenData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Store encrypted tokens in Supabase
   */
  async storeConnectionTokens(connectionId, tokens) {
    try {
      const { data, error } = await supabase?.functions?.invoke('encrypt_token', {
        body: { 
          access_token: tokens?.access_token,
          refresh_token: tokens?.refresh_token
        }
      });

      if (error) {
        throw error;
      }

      const { data: updateData, error: updateError } = await supabase
        ?.from('bank_connections')
        ?.update({
          access_token_encrypted: data?.encrypted_access_token,
          refresh_token_encrypted: data?.encrypted_refresh_token,
          expires_at: new Date(Date.now() + (tokens?.expires_in * 1000))?.toISOString(),
          status: 'connected',
          last_sync_at: new Date()?.toISOString()
        })
        ?.eq('id', connectionId)
        ?.select()
        ?.single();

      if (updateError) {
        throw updateError;
      }

      return { data: updateData, error: null };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Sync accounts and transactions from Tink to Supabase
   */
  async syncAccountData(connectionId, accessToken) {
    try {
      // Fetch accounts from Tink
      const { data: accountsData, error: accountsError } = await this.getAccounts(accessToken);
      
      if (accountsError) {
        throw accountsError;
      }

      const syncedAccounts = [];
      const syncedTransactions = [];

      // Process each account
      for (const tinkAccount of accountsData?.accounts || []) {
        // Create/update account in Supabase
        const accountData = {
          connection_id: connectionId,
          external_account_id: tinkAccount?.id,
          account_name: tinkAccount?.name || `${tinkAccount?.financialInstitution?.name} Account`,
          account_number: this.maskAccountNumber(tinkAccount?.accountNumber),
          account_type: this.mapAccountType(tinkAccount?.type),
          balance: parseFloat(tinkAccount?.balance?.amount?.unscaledValue) / 100 || 0,
          available_balance: parseFloat(tinkAccount?.balance?.amount?.unscaledValue) / 100 || 0,
          currency: tinkAccount?.balance?.amount?.currencyCode || 'EUR',
          bank_name: tinkAccount?.financialInstitution?.name,
          bic_code: tinkAccount?.financialInstitution?.bic,
          metadata: {
            tink_account_id: tinkAccount?.id,
            account_holder: tinkAccount?.holderName,
            iban: tinkAccount?.identifiers?.iban,
            last_refreshed: new Date()?.toISOString()
          }
        };

        const { data: supabaseAccount, error: accountError } = await supabase
          ?.from('bank_accounts')
          ?.upsert(accountData, { 
            onConflict: 'external_account_id',
            ignoreDuplicates: false 
          })
          ?.select()
          ?.single();

        if (accountError) {
          console.error('Failed to sync account:', accountError);
          continue;
        }

        syncedAccounts?.push(supabaseAccount);

        // Fetch and sync transactions for this account
        const { data: transactionsData, error: transactionsError } = await this.getTransactions(
          accessToken, 
          tinkAccount?.id
        );

        if (transactionsError) {
          console.error('Failed to fetch transactions:', transactionsError);
          continue;
        }

        // Process transactions
        for (const tinkTransaction of transactionsData?.transactions || []) {
          const transactionData = {
            account_id: supabaseAccount?.id,
            external_transaction_id: tinkTransaction?.id,
            amount: parseFloat(tinkTransaction?.amount?.unscaledValue) / 100,
            currency: tinkTransaction?.amount?.currencyCode || 'EUR',
            description: tinkTransaction?.description || tinkTransaction?.originalDescription,
            transaction_date: tinkTransaction?.date,
            value_date: tinkTransaction?.date,
            booking_date: new Date()?.toISOString(),
            counterpart_name: tinkTransaction?.counterparties?.[0]?.name || null,
            counterpart_account: tinkTransaction?.counterparties?.[0]?.accountNumber || null,
            reference: tinkTransaction?.reference || null,
            category: this.mapTransactionCategory(tinkTransaction?.categoryType),
            status: this.mapTransactionStatus(tinkTransaction?.status),
            metadata: {
              tink_transaction_id: tinkTransaction?.id,
              merchant_name: tinkTransaction?.merchantInformation?.merchantName,
              category_code: tinkTransaction?.categoryCode,
              original_description: tinkTransaction?.originalDescription
            }
          };

          const { data: supabaseTransaction, error: transactionError } = await supabase
            ?.from('transactions')
            ?.upsert(transactionData, { 
              onConflict: 'external_transaction_id',
              ignoreDuplicates: false 
            })
            ?.select()
            ?.single();

          if (!transactionError && supabaseTransaction) {
            syncedTransactions?.push(supabaseTransaction);
          }
        }
      }

      return { 
        data: { 
          accounts: syncedAccounts, 
          transactions: syncedTransactions 
        }, 
        error: null 
      };
    } catch (error) {
      return { data: null, error };
    }
  }

  /**
   * Helper method to mask account numbers for security
   */
  maskAccountNumber(accountNumber) {
    if (!accountNumber || accountNumber?.length < 4) return accountNumber;
    const visible = accountNumber?.slice(-4);
    const masked = '*'?.repeat(Math.max(0, accountNumber?.length - 4));
    return `${masked}${visible}`;
  }

  /**
   * Map Tink account types to our schema enum
   */
  mapAccountType(tinkType) {
    const typeMap = {
      'CURRENT': 'checking',
      'SAVINGS': 'savings',
      'CREDIT_CARD': 'credit',
      'BUSINESS': 'business'
    };
    return typeMap?.[tinkType] || 'checking';
  }

  /**
   * Map Tink transaction categories to our schema enum
   */
  mapTransactionCategory(tinkCategory) {
    const categoryMap = {
      'INCOME': 'income',
      'EXPENSES': 'expense',
      'TRANSFERS': 'transfer',
      'FEES_CHARGES': 'fee',
      'INTEREST': 'interest',
      'REFUNDS': 'refund'
    };
    return categoryMap?.[tinkCategory] || 'other';
  }

  /**
   * Map Tink transaction status to our schema enum
   */
  mapTransactionStatus(tinkStatus) {
    const statusMap = {
      'BOOKED': 'completed',
      'PENDING': 'pending',
      'FAILED': 'failed',
      'CANCELLED': 'cancelled'
    };
    return statusMap?.[tinkStatus] || 'completed';
  }

  /**
   * Revoke Tink access and disconnect
   */
  async revokeAccess(accessToken) {
    try {
      const response = await fetch(`${this.tinkApiBase}/api/v1/oauth/revoke`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`
        },
        body: new URLSearchParams({
          token: accessToken
        })
      });

      return { success: response?.ok, error: response?.ok ? null : 'Failed to revoke access' };
    } catch (error) {
      return { success: false, error };
    }
  }
}

// Export singleton instance
export const tinkService = new TinkService();
export default tinkService;