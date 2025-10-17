import React, { useState } from 'react';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';


const ClientSelector = ({ selectedClient, onClientChange, onAddClient }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const clients = [
    {
      value: 'client-1',
      label: 'TechCorp B.V.',
      description: 'Hoofdstraat 123, Amsterdam - contact@techcorp.nl'
    },
    {
      value: 'client-2',
      label: 'Design Studio Amsterdam',
      description: 'Prinsengracht 456, Amsterdam - info@designstudio.nl'
    },
    {
      value: 'client-3',
      label: 'Marketing Plus B.V.',
      description: 'Damrak 789, Amsterdam - hello@marketingplus.nl'
    },
    {
      value: 'client-4',
      label: 'Consultancy Partners',
      description: 'Vondelpark 12, Amsterdam - partners@consultancy.nl'
    },
    {
      value: 'client-5',
      label: 'E-commerce Solutions',
      description: 'Nieuwmarkt 34, Amsterdam - support@ecommerce.nl'
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <Select
            label="Selecteer Klant"
            description="Kies de klant voor deze factuur"
            placeholder="Zoek en selecteer een klant..."
            options={clients}
            value={selectedClient}
            onChange={onClientChange}
            searchable
            required
          />
        </div>
        <Button
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
          onClick={onAddClient}
          className="mb-0"
        >
          Nieuwe Klant
        </Button>
      </div>
      {selectedClient && (
        <div className="bg-muted p-4 rounded-lg">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <h3 className="font-medium text-foreground">
                {clients?.find(c => c?.value === selectedClient)?.label}
              </h3>
              <p className="text-sm text-muted-foreground">
                {clients?.find(c => c?.value === selectedClient)?.description}
              </p>
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <span>BTW-nummer: NL123456789B01</span>
                <span>Betalingstermijn: 30 dagen</span>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              iconName="Edit"
              iconSize={14}
              onClick={() => {}}
            >
              Bewerken
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientSelector;