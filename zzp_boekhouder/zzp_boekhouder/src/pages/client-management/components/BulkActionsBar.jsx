import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';

const BulkActionsBar = ({ selectedClients, onBulkAction, onClearSelection }) => {
  const [selectedAction, setSelectedAction] = useState('');

  const actionOptions = [
    { value: '', label: 'Kies een actie...' },
    { value: 'activate', label: 'Activeren' },
    { value: 'deactivate', label: 'Deactiveren' },
    { value: 'export', label: 'Exporteren naar CSV' },
    { value: 'delete', label: 'Verwijderen' }
  ];

  const handleExecuteAction = () => {
    if (selectedAction && selectedClients?.length > 0) {
      onBulkAction(selectedAction, selectedClients);
      setSelectedAction('');
    }
  };

  if (selectedClients?.length === 0) {
    return null;
  }

  return (
    <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Icon name="CheckSquare" size={20} className="text-primary" />
            <span className="text-foreground font-medium">
              {selectedClients?.length} klant{selectedClients?.length !== 1 ? 'en' : ''} geselecteerd
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Select
              options={actionOptions}
              value={selectedAction}
              onChange={setSelectedAction}
              placeholder="Kies een actie..."
              className="w-48"
            />
            
            <Button
              variant="default"
              onClick={handleExecuteAction}
              disabled={!selectedAction}
              iconName="Play"
              iconPosition="left"
              iconSize={16}
            >
              Uitvoeren
            </Button>
          </div>
        </div>

        <Button
          variant="ghost"
          onClick={onClearSelection}
          iconName="X"
          iconPosition="left"
          iconSize={16}
        >
          Selectie wissen
        </Button>
      </div>
    </div>
  );
};

export default BulkActionsBar;