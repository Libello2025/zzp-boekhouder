import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const TransactionFilters = ({ onFilterChange, onExport }) => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    amountMin: '',
    amountMax: '',
    category: '',
    status: '',
    search: ''
  });

  const categoryOptions = [
    { value: '', label: 'Alle categorieën' },
    { value: 'income', label: 'Inkomsten' },
    { value: 'office_supplies', label: 'Kantoorbenodigdheden' },
    { value: 'travel', label: 'Reiskosten' },
    { value: 'marketing', label: 'Marketing & Reclame' },
    { value: 'software', label: 'Software & Abonnementen' },
    { value: 'professional_services', label: 'Professionele Diensten' },
    { value: 'utilities', label: 'Nutsvoorzieningen' },
    { value: 'other', label: 'Overig' }
  ];

  const statusOptions = [
    { value: '', label: 'Alle statussen' },
    { value: 'matched', label: 'Gematcht' },
    { value: 'pending', label: 'In behandeling' },
    { value: 'unmatched', label: 'Niet gematcht' },
    { value: 'ignored', label: 'Genegeerd' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      dateFrom: '',
      dateTo: '',
      amountMin: '',
      amountMax: '',
      category: '',
      status: '',
      search: ''
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  const getActiveFilterCount = () => {
    return Object.values(filters)?.filter(value => value !== '')?.length;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} color="var(--color-foreground)" />
          <h3 className="text-lg font-semibold text-foreground">Filters</h3>
          {getActiveFilterCount() > 0 && (
            <span className="bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            iconName="Download"
            iconPosition="left"
            iconSize={16}
            onClick={onExport}
          >
            Exporteren
          </Button>
          {getActiveFilterCount() > 0 && (
            <Button
              variant="ghost"
              size="sm"
              iconName="X"
              iconPosition="left"
              iconSize={16}
              onClick={handleReset}
            >
              Reset
            </Button>
          )}
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="lg:col-span-2">
          <Input
            type="search"
            label="Zoeken"
            placeholder="Zoek op beschrijving of referentie..."
            value={filters?.search}
            onChange={(e) => handleFilterChange('search', e?.target?.value)}
          />
        </div>

        {/* Category Filter */}
        <Select
          label="Categorie"
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
        />

        {/* Status Filter */}
        <Select
          label="Status"
          options={statusOptions}
          value={filters?.status}
          onChange={(value) => handleFilterChange('status', value)}
        />

        {/* Date From */}
        <Input
          type="date"
          label="Van datum"
          value={filters?.dateFrom}
          onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
        />

        {/* Date To */}
        <Input
          type="date"
          label="Tot datum"
          value={filters?.dateTo}
          onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
        />

        {/* Amount Min */}
        <Input
          type="number"
          label="Min. bedrag (€)"
          placeholder="0,00"
          value={filters?.amountMin}
          onChange={(e) => handleFilterChange('amountMin', e?.target?.value)}
        />

        {/* Amount Max */}
        <Input
          type="number"
          label="Max. bedrag (€)"
          placeholder="1.000,00"
          value={filters?.amountMax}
          onChange={(e) => handleFilterChange('amountMax', e?.target?.value)}
        />
      </div>
      {/* Quick Filter Buttons */}
      <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
            handleFilterChange('dateFrom', startOfMonth?.toISOString()?.split('T')?.[0]);
            handleFilterChange('dateTo', today?.toISOString()?.split('T')?.[0]);
          }}
        >
          Deze maand
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            const today = new Date();
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
            handleFilterChange('dateFrom', lastMonth?.toISOString()?.split('T')?.[0]);
            handleFilterChange('dateTo', endOfLastMonth?.toISOString()?.split('T')?.[0]);
          }}
        >
          Vorige maand
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleFilterChange('status', 'unmatched');
          }}
        >
          Niet gematcht
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            handleFilterChange('amountMin', '0');
          }}
        >
          Alleen inkomsten
        </Button>
      </div>
    </div>
  );
};

export default TransactionFilters;