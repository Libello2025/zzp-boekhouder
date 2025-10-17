import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ExpenseFilters = ({ onFiltersChange, onNewExpense, onBulkImport }) => {
  const [filters, setFilters] = useState({
    dateRange: 'all',
    category: 'all',
    project: 'all',
    supplier: 'all',
    search: ''
  });

  const dateRangeOptions = [
    { value: 'all', label: 'Alle periodes' },
    { value: 'today', label: 'Vandaag' },
    { value: 'week', label: 'Deze week' },
    { value: 'month', label: 'Deze maand' },
    { value: 'quarter', label: 'Dit kwartaal' },
    { value: 'year', label: 'Dit jaar' },
    { value: 'custom', label: 'Aangepaste periode' }
  ];

  const categoryOptions = [
    { value: 'all', label: 'Alle categorieën' },
    { value: 'office', label: 'Kantoorbenodigdheden' },
    { value: 'travel', label: 'Reiskosten' },
    { value: 'marketing', label: 'Marketing & Reclame' },
    { value: 'software', label: 'Software & Licenties' },
    { value: 'equipment', label: 'Apparatuur' },
    { value: 'training', label: 'Training & Cursussen' },
    { value: 'meals', label: 'Maaltijden' },
    { value: 'utilities', label: 'Nutsvoorzieningen' },
    { value: 'other', label: 'Overige' }
  ];

  const projectOptions = [
    { value: 'all', label: 'Alle projecten' },
    { value: 'website-redesign', label: 'Website Redesign - TechCorp' },
    { value: 'mobile-app', label: 'Mobile App - StartupXYZ' },
    { value: 'consulting', label: 'Consulting - RetailCo' },
    { value: 'branding', label: 'Branding Project - CreativeAgency' },
    { value: 'no-project', label: 'Geen project' }
  ];

  const supplierOptions = [
    { value: 'all', label: 'Alle leveranciers' },
    { value: 'office-depot', label: 'Office Depot' },
    { value: 'ns', label: 'Nederlandse Spoorwegen' },
    { value: 'google', label: 'Google Ads' },
    { value: 'microsoft', label: 'Microsoft' },
    { value: 'apple', label: 'Apple Store' },
    { value: 'udemy', label: 'Udemy' },
    { value: 'restaurant-central', label: 'Restaurant Central' },
    { value: 'vattenfall', label: 'Vattenfall' }
  ];

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearchChange = (e) => {
    const value = e?.target?.value;
    handleFilterChange('search', value);
  };

  const clearFilters = () => {
    const clearedFilters = {
      dateRange: 'all',
      category: 'all',
      project: 'all',
      supplier: 'all',
      search: ''
    };
    setFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const hasActiveFilters = Object.values(filters)?.some(value => value !== 'all' && value !== '');

  return (
    <div className="bg-card border border-border rounded-lg p-6 mb-6">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 space-y-4 sm:space-y-0">
        <div className="flex flex-wrap gap-3">
          <Button
            variant="default"
            onClick={onNewExpense}
            iconName="Plus"
            iconPosition="left"
            iconSize={16}
          >
            Nieuwe Uitgave
          </Button>
          <Button
            variant="outline"
            onClick={onBulkImport}
            iconName="Upload"
            iconPosition="left"
            iconSize={16}
          >
            Bulk Import
          </Button>
          <Button
            variant="outline"
            iconName="Camera"
            iconPosition="left"
            iconSize={16}
          >
            Bon Scannen
          </Button>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            onClick={clearFilters}
            iconName="X"
            iconPosition="left"
            iconSize={14}
            className="text-muted-foreground"
          >
            Filters Wissen
          </Button>
        )}
      </div>
      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div>
          <Input
            type="search"
            placeholder="Zoek uitgaven..."
            value={filters?.search}
            onChange={handleSearchChange}
            className="w-full"
          />
        </div>

        <Select
          options={dateRangeOptions}
          value={filters?.dateRange}
          onChange={(value) => handleFilterChange('dateRange', value)}
          placeholder="Periode"
        />

        <Select
          options={categoryOptions}
          value={filters?.category}
          onChange={(value) => handleFilterChange('category', value)}
          placeholder="Categorie"
        />

        <Select
          options={projectOptions}
          value={filters?.project}
          onChange={(value) => handleFilterChange('project', value)}
          placeholder="Project"
        />

        <Select
          options={supplierOptions}
          value={filters?.supplier}
          onChange={(value) => handleFilterChange('supplier', value)}
          placeholder="Leverancier"
        />
      </div>
      {/* Active Filters Display */}
      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {filters?.search && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <Icon name="Search" size={12} className="mr-1" />
              <span>"{filters?.search}"</span>
              <button
                onClick={() => handleFilterChange('search', '')}
                className="ml-2 hover:text-destructive"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          {filters?.dateRange !== 'all' && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <Icon name="Calendar" size={12} className="mr-1" />
              <span>{dateRangeOptions?.find(opt => opt?.value === filters?.dateRange)?.label}</span>
              <button
                onClick={() => handleFilterChange('dateRange', 'all')}
                className="ml-2 hover:text-destructive"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
          {filters?.category !== 'all' && (
            <div className="flex items-center bg-muted px-3 py-1 rounded-full text-sm">
              <Icon name="Tag" size={12} className="mr-1" />
              <span>{categoryOptions?.find(opt => opt?.value === filters?.category)?.label}</span>
              <button
                onClick={() => handleFilterChange('category', 'all')}
                className="ml-2 hover:text-destructive"
              >
                <Icon name="X" size={12} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ExpenseFilters;