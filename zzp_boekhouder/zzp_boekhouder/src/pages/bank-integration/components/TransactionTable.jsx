import React, { useState, useMemo } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const TransactionTable = ({ transactions = [], onCategorize, onReconcile, loading = false }) => {
  const [selectedTransactions, setSelectedTransactions] = useState([]);
  const [sortField, setSortField] = useState('transaction_date');
  const [sortDirection, setSortDirection] = useState('desc');

  const categoryOptions = [
    { value: 'income', label: 'Inkomsten', color: 'text-success' },
    { value: 'expense', label: 'Uitgaven', color: 'text-destructive' },
    { value: 'transfer', label: 'Overboekingen', color: 'text-primary' },
    { value: 'fee', label: 'Kosten', color: 'text-warning' },
    { value: 'interest', label: 'Rente', color: 'text-success' },
    { value: 'refund', label: 'Terugbetaling', color: 'text-success' },
    { value: 'payment', label: 'Betaling', color: 'text-destructive' },
    { value: 'withdrawal', label: 'Opname', color: 'text-destructive' },
    { value: 'deposit', label: 'Storting', color: 'text-success' },
    { value: 'other', label: 'Overig', color: 'text-muted-foreground' }
  ];

  const statusOptions = [
    { value: 'pending', label: 'In behandeling', color: 'text-warning' },
    { value: 'completed', label: 'Voltooid', color: 'text-success' },
    { value: 'failed', label: 'Mislukt', color: 'text-destructive' },
    { value: 'cancelled', label: 'Geannuleerd', color: 'text-muted-foreground' }
  ];

  const formatCurrency = (amount, currency = 'EUR') => {
    const value = parseFloat(amount) || 0;
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency
    })?.format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString)?.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString)?.toLocaleString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getCategoryInfo = (category) => {
    return categoryOptions?.find(opt => opt?.value === category) || categoryOptions?.find(opt => opt?.value === 'other');
  };

  const getStatusInfo = (status) => {
    return statusOptions?.find(opt => opt?.value === status) || statusOptions?.find(opt => opt?.value === 'completed');
  };

  const getAmountColor = (amount) => {
    const value = parseFloat(amount) || 0;
    if (value > 0) return 'text-success';
    if (value < 0) return 'text-destructive';
    return 'text-foreground';
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedTransactions = React.useMemo(() => {
    if (!transactions?.length) return [];

    return [...transactions]?.sort((a, b) => {
      let aValue = a?.[sortField];
      let bValue = b?.[sortField];

      // Handle date fields
      if (sortField === 'transaction_date' || sortField === 'created_at') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      // Handle numeric fields
      if (sortField === 'amount') {
        aValue = parseFloat(aValue) || 0;
        bValue = parseFloat(bValue) || 0;
      }

      // Handle string comparison
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        aValue = aValue?.toLowerCase();
        bValue = bValue?.toLowerCase();
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : aValue < bValue ? -1 : 0;
      } else {
        return aValue < bValue ? 1 : aValue > bValue ? -1 : 0;
      }
    });
  }, [transactions, sortField, sortDirection]);

  const handleSelectTransaction = (transactionId) => {
    setSelectedTransactions(prev => {
      if (prev?.includes(transactionId)) {
        return prev?.filter(id => id !== transactionId);
      } else {
        return [...prev, transactionId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedTransactions?.length === sortedTransactions?.length) {
      setSelectedTransactions([]);
    } else {
      setSelectedTransactions(sortedTransactions?.map(tx => tx?.id));
    }
  };

  const getSortIcon = (field) => {
    if (sortField !== field) return 'ArrowUpDown';
    return sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  if (loading) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-muted-foreground">Transacties laden...</p>
      </div>
    );
  }

  if (!transactions?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-12 text-center">
        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Receipt" size={32} color="var(--color-muted-foreground)" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Geen transacties gevonden
        </h3>
        <p className="text-muted-foreground">
          Er zijn nog geen transacties om weer te geven. Verbind je bankrekening om automatisch transacties te synchroniseren.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Table Header */}
      <div className="border-b border-border p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={selectedTransactions?.length === sortedTransactions?.length}
              onChange={handleSelectAll}
              className="rounded border-border"
            />
            <span className="text-sm text-muted-foreground">
              {selectedTransactions?.length > 0 
                ? `${selectedTransactions?.length} geselecteerd`
                : `${sortedTransactions?.length} transacties`
              }
            </span>
          </div>
          
          {selectedTransactions?.length > 0 && (
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                Categoriseren
              </Button>
              <Button variant="outline" size="sm">
                Reconciliëren
              </Button>
            </div>
          )}
        </div>
      </div>
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 w-12">
                <input
                  type="checkbox"
                  checked={selectedTransactions?.length === sortedTransactions?.length}
                  onChange={handleSelectAll}
                  className="rounded border-border"
                />
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleSort('transaction_date')}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">Datum</span>
                  <Icon name={getSortIcon('transaction_date')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleSort('description')}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">Beschrijving</span>
                  <Icon name={getSortIcon('description')} size={14} />
                </div>
              </th>
              <th 
                className="text-left p-4 cursor-pointer hover:bg-muted/30 transition-colors"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-foreground">Bedrag</span>
                  <Icon name={getSortIcon('amount')} size={14} />
                </div>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-foreground">Categorie</span>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-foreground">Status</span>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-foreground">Tegenpartij</span>
              </th>
              <th className="text-left p-4">
                <span className="font-medium text-foreground">Rekening</span>
              </th>
              <th className="text-right p-4 w-32">
                <span className="font-medium text-foreground">Acties</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedTransactions?.map((transaction, index) => {
              const categoryInfo = getCategoryInfo(transaction?.category);
              const statusInfo = getStatusInfo(transaction?.status);
              const isSelected = selectedTransactions?.includes(transaction?.id);

              return (
                <tr 
                  key={transaction?.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="p-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleSelectTransaction(transaction?.id)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {formatDate(transaction?.transaction_date)}
                      </div>
                      {transaction?.value_date && transaction?.value_date !== transaction?.transaction_date && (
                        <div className="text-xs text-muted-foreground">
                          Waarde: {formatDate(transaction?.value_date)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="text-sm">
                      <div className="font-medium text-foreground truncate">
                        {transaction?.description}
                      </div>
                      {transaction?.reference && (
                        <div className="text-xs text-muted-foreground font-mono">
                          {transaction?.reference}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className={`text-sm font-semibold ${getAmountColor(transaction?.amount)}`}>
                      {formatCurrency(transaction?.amount, transaction?.currency)}
                    </div>
                  </td>
                  <td className="p-4">
                    <Select
                      value={transaction?.category}
                      onChange={(value) => onCategorize?.(transaction?.id, value)}
                      options={categoryOptions}
                      size="sm"
                      className="min-w-32"
                    />
                  </td>
                  <td className="p-4">
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        statusInfo?.value === 'completed' ? 'bg-success' :
                        statusInfo?.value === 'pending' ? 'bg-warning' :
                        statusInfo?.value === 'failed'? 'bg-destructive' : 'bg-muted-foreground'
                      }`}></div>
                      <span className={`text-xs ${statusInfo?.color}`}>
                        {statusInfo?.label}
                      </span>
                    </div>
                    {transaction?.is_reconciled && (
                      <div className="flex items-center space-x-1 mt-1">
                        <Icon name="CheckCircle" size={12} color="var(--color-success)" />
                        <span className="text-xs text-success">Gematcht</span>
                      </div>
                    )}
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="text-sm">
                      {transaction?.counterpart_name && (
                        <div className="font-medium text-foreground truncate">
                          {transaction?.counterpart_name}
                        </div>
                      )}
                      {transaction?.counterpart_account && (
                        <div className="text-xs text-muted-foreground font-mono truncate">
                          {transaction?.counterpart_account}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm">
                      <div className="font-medium text-foreground">
                        {transaction?.bank_accounts?.bank_name}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono">
                        {transaction?.bank_accounts?.account_name}
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end space-x-1">
                      {!transaction?.is_reconciled && (
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="Link"
                          onClick={() => onReconcile?.(transaction?.id)}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          title="Reconciliëren"
                        />
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        iconName="MoreHorizontal"
                        className="text-muted-foreground hover:text-foreground"
                        title="Meer opties"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Table Footer */}
      <div className="border-t border-border p-4">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div>
            Totaal: {sortedTransactions?.length} transacties
          </div>
          <div className="flex items-center space-x-4">
            <div>
              Inkomsten: <span className="text-success font-medium">
                {formatCurrency(
                  sortedTransactions?.filter(tx => parseFloat(tx?.amount) > 0)?.reduce((sum, tx) => sum + parseFloat(tx?.amount || 0), 0)
                )}
              </span>
            </div>
            <div>
              Uitgaven: <span className="text-destructive font-medium">
                {formatCurrency(
                  Math.abs(sortedTransactions?.filter(tx => parseFloat(tx?.amount) < 0)?.reduce((sum, tx) => sum + parseFloat(tx?.amount || 0), 0))
                )}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TransactionTable;