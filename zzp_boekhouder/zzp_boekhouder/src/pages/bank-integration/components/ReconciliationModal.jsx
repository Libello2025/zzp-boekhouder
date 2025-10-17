import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ReconciliationModal = ({ isOpen, onClose, transaction, onReconcile }) => {
  const [matchType, setMatchType] = useState('');
  const [selectedMatch, setSelectedMatch] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const matchTypeOptions = [
    { value: 'invoice', label: 'Factuur' },
    { value: 'expense', label: 'Uitgave' },
    { value: 'manual', label: 'Handmatige boeking' }
  ];

  // Mock data for potential matches
  const mockInvoices = [
    {
      id: 'inv-001',
      number: 'F2024-001',
      client: 'Acme Corporation',
      amount: 1250.00,
      date: new Date('2024-10-15'),
      status: 'sent'
    },
    {
      id: 'inv-002', 
      number: 'F2024-002',
      client: 'Tech Solutions BV',
      amount: 850.00,
      date: new Date('2024-10-14'),
      status: 'paid'
    }
  ];

  const mockExpenses = [
    {
      id: 'exp-001',
      description: 'Office supplies - Staples',
      amount: -45.99,
      date: new Date('2024-10-16'),
      category: 'office_supplies'
    },
    {
      id: 'exp-002',
      description: 'Software subscription - Adobe',
      amount: -59.99,
      date: new Date('2024-10-15'),
      category: 'software'
    }
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatDate = (date) => {
    return new Intl.DateTimeFormat('nl-NL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })?.format(date);
  };

  const getMatchingItems = () => {
    if (!transaction) return [];

    const items = matchType === 'invoice' ? mockInvoices : mockExpenses;
    
    return items?.filter(item => {
      const matchesAmount = Math.abs(Math.abs(item?.amount) - Math.abs(transaction?.amount)) < 0.01;
      const matchesSearch = searchQuery === '' || 
        (item?.number && item?.number?.toLowerCase()?.includes(searchQuery?.toLowerCase())) ||
        (item?.client && item?.client?.toLowerCase()?.includes(searchQuery?.toLowerCase())) ||
        (item?.description && item?.description?.toLowerCase()?.includes(searchQuery?.toLowerCase()));
      
      return matchesAmount || matchesSearch;
    });
  };

  const handleReconcile = () => {
    if (selectedMatch) {
      onReconcile(transaction?.id, matchType, selectedMatch);
      onClose();
    }
  };

  if (!isOpen || !transaction) return null;

  const matchingItems = getMatchingItems();

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
      <div className="bg-card border border-border rounded-lg w-full max-w-2xl mx-4 shadow-elevation-3 max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h3 className="text-lg font-semibold text-foreground">Transactie koppelen</h3>
            <p className="text-sm text-muted-foreground">
              Koppel deze transactie aan een bestaande factuur of uitgave
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Transaction Details */}
          <div className="bg-muted/30 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-foreground mb-2">Transactie details</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Datum:</span>
                <span className="ml-2 text-foreground">{formatDate(transaction?.date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Bedrag:</span>
                <span className={`ml-2 font-medium ${
                  transaction?.amount >= 0 ? 'text-success' : 'text-foreground'
                }`}>
                  {formatCurrency(transaction?.amount)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-muted-foreground">Beschrijving:</span>
                <span className="ml-2 text-foreground">{transaction?.description}</span>
              </div>
            </div>
          </div>

          {/* Match Type Selection */}
          <div className="mb-6">
            <Select
              label="Koppelen aan"
              options={matchTypeOptions}
              value={matchType}
              onChange={setMatchType}
              placeholder="Selecteer type..."
            />
          </div>

          {matchType && (
            <>
              {/* Search */}
              <div className="mb-4">
                <Input
                  type="search"
                  label="Zoeken"
                  placeholder={`Zoek ${matchType === 'invoice' ? 'factuur' : 'uitgave'}...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e?.target?.value)}
                />
              </div>

              {/* Matching Items */}
              <div className="space-y-2 mb-6">
                <h4 className="font-medium text-foreground">
                  {matchType === 'invoice' ? 'Mogelijke facturen' : 'Mogelijke uitgaven'}
                </h4>
                
                {matchingItems?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Icon name="Search" size={32} className="mx-auto mb-2" />
                    <p>Geen overeenkomende items gevonden</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {matchingItems?.map((item) => (
                      <div
                        key={item?.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors duration-200 ${
                          selectedMatch === item?.id
                            ? 'border-primary bg-primary/5' :'border-border hover:bg-muted/30'
                        }`}
                        onClick={() => setSelectedMatch(item?.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            {matchType === 'invoice' ? (
                              <>
                                <p className="font-medium text-foreground">
                                  {item?.number} - {item?.client}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(item?.date)} • Status: {item?.status}
                                </p>
                              </>
                            ) : (
                              <>
                                <p className="font-medium text-foreground">
                                  {item?.description}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {formatDate(item?.date)} • {item?.category}
                                </p>
                              </>
                            )}
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              item?.amount >= 0 ? 'text-success' : 'text-foreground'
                            }`}>
                              {formatCurrency(item?.amount)}
                            </p>
                            {Math.abs(Math.abs(item?.amount) - Math.abs(transaction?.amount)) < 0.01 && (
                              <div className="flex items-center text-xs text-success">
                                <Icon name="CheckCircle" size={12} className="mr-1" />
                                Exact bedrag
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            Annuleren
          </Button>
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              iconName="Plus"
              iconPosition="left"
              iconSize={16}
            >
              Nieuwe {matchType === 'invoice' ? 'factuur' : 'uitgave'}
            </Button>
            <Button
              variant="default"
              onClick={handleReconcile}
              disabled={!selectedMatch}
              iconName="Link"
              iconPosition="left"
              iconSize={16}
            >
              Koppelen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReconciliationModal;