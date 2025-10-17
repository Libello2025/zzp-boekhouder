import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const ExpenseTable = ({ expenses, onEdit, onDelete, onViewReceipt, sortConfig, onSort }) => {
  const [selectedExpenses, setSelectedExpenses] = useState([]);

  const categoryIcons = {
    office: { icon: 'Briefcase', color: 'text-blue-600', bg: 'bg-blue-100' },
    travel: { icon: 'Car', color: 'text-green-600', bg: 'bg-green-100' },
    marketing: { icon: 'Megaphone', color: 'text-purple-600', bg: 'bg-purple-100' },
    software: { icon: 'Monitor', color: 'text-indigo-600', bg: 'bg-indigo-100' },
    equipment: { icon: 'Laptop', color: 'text-gray-600', bg: 'bg-gray-100' },
    training: { icon: 'GraduationCap', color: 'text-orange-600', bg: 'bg-orange-100' },
    meals: { icon: 'Coffee', color: 'text-amber-600', bg: 'bg-amber-100' },
    utilities: { icon: 'Zap', color: 'text-yellow-600', bg: 'bg-yellow-100' },
    other: { icon: 'Package', color: 'text-slate-600', bg: 'bg-slate-100' }
  };

  const vatRateColors = {
    21: 'text-red-600 bg-red-50',
    9: 'text-orange-600 bg-orange-50',
    0: 'text-gray-600 bg-gray-50'
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedExpenses(expenses?.map(expense => expense?.id));
    } else {
      setSelectedExpenses([]);
    }
  };

  const handleSelectExpense = (expenseId, checked) => {
    if (checked) {
      setSelectedExpenses([...selectedExpenses, expenseId]);
    } else {
      setSelectedExpenses(selectedExpenses?.filter(id => id !== expenseId));
    }
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) {
      return <Icon name="ArrowUpDown" size={14} className="text-muted-foreground" />;
    }
    return sortConfig?.direction === 'asc' 
      ? <Icon name="ArrowUp" size={14} className="text-primary" />
      : <Icon name="ArrowDown" size={14} className="text-primary" />;
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Date(date)?.toLocaleDateString('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Bulk Actions */}
      {selectedExpenses?.length > 0 && (
        <div className="bg-muted px-6 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-foreground">
              {selectedExpenses?.length} uitgave(n) geselecteerd
            </span>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" iconName="Download" iconSize={14}>
                Exporteren
              </Button>
              <Button variant="outline" size="sm" iconName="Tag" iconSize={14}>
                Categoriseren
              </Button>
              <Button variant="destructive" size="sm" iconName="Trash2" iconSize={14}>
                Verwijderen
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="w-12 px-6 py-3">
                <input
                  type="checkbox"
                  checked={selectedExpenses?.length === expenses?.length && expenses?.length > 0}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                  className="rounded border-border"
                />
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => onSort('date')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Datum</span>
                  {getSortIcon('date')}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <button
                  onClick={() => onSort('description')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary"
                >
                  <span>Beschrijving</span>
                  {getSortIcon('description')}
                </button>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Categorie</span>
              </th>
              <th className="px-6 py-3 text-right">
                <button
                  onClick={() => onSort('amount')}
                  className="flex items-center space-x-1 text-sm font-medium text-foreground hover:text-primary ml-auto"
                >
                  <span>Bedrag</span>
                  {getSortIcon('amount')}
                </button>
              </th>
              <th className="px-6 py-3 text-center">
                <span className="text-sm font-medium text-foreground">BTW</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Project</span>
              </th>
              <th className="px-6 py-3 text-left">
                <span className="text-sm font-medium text-foreground">Leverancier</span>
              </th>
              <th className="px-6 py-3 text-center">
                <span className="text-sm font-medium text-foreground">Bon</span>
              </th>
              <th className="px-6 py-3 text-center">
                <span className="text-sm font-medium text-foreground">Acties</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {expenses?.map((expense) => {
              const categoryConfig = categoryIcons?.[expense?.category] || categoryIcons?.other;
              const isSelected = selectedExpenses?.includes(expense?.id);
              
              return (
                <tr
                  key={expense?.id}
                  className={`border-b border-border hover:bg-muted/30 transition-colors ${
                    isSelected ? 'bg-primary/5' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectExpense(expense?.id, e?.target?.checked)}
                      className="rounded border-border"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">
                      {formatDate(expense?.date)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {expense?.description}
                      </p>
                      {expense?.notes && (
                        <p className="text-xs text-muted-foreground mt-1">
                          {expense?.notes}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <div className={`p-2 rounded-lg ${categoryConfig?.bg}`}>
                        <Icon
                          name={categoryConfig?.icon}
                          size={16}
                          className={categoryConfig?.color}
                        />
                      </div>
                      <span className="text-sm text-foreground">
                        {expense?.categoryName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <span className="text-sm font-medium text-foreground">
                      {formatAmount(expense?.amount)}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      vatRateColors?.[expense?.vatRate] || vatRateColors?.[0]
                    }`}>
                      {expense?.vatRate}%
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {expense?.project ? (
                      <span className="text-sm text-foreground">
                        {expense?.project}
                      </span>
                    ) : (
                      <span className="text-sm text-muted-foreground">
                        Geen project
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-foreground">
                      {expense?.supplier}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {expense?.receipt ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewReceipt(expense)}
                        iconName="FileImage"
                        iconSize={16}
                        className="text-primary hover:text-primary/80"
                      />
                    ) : (
                      <Icon name="Minus" size={16} className="text-muted-foreground mx-auto" />
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center space-x-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(expense)}
                        iconName="Edit"
                        iconSize={14}
                        className="text-muted-foreground hover:text-primary"
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(expense)}
                        iconName="Trash2"
                        iconSize={14}
                        className="text-muted-foreground hover:text-destructive"
                      />
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Empty State */}
      {expenses?.length === 0 && (
        <div className="text-center py-12">
          <Icon name="Receipt" size={48} className="text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">
            Geen uitgaven gevonden
          </h3>
          <p className="text-muted-foreground mb-4">
            Voeg je eerste uitgave toe om te beginnen met het bijhouden van je kosten.
          </p>
          <Button variant="default" iconName="Plus" iconPosition="left">
            Nieuwe Uitgave
          </Button>
        </div>
      )}
    </div>
  );
};

export default ExpenseTable;