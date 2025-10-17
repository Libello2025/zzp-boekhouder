import React from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      label: 'Nieuwe Factuur',
      description: 'Maak een nieuwe factuur aan',
      icon: 'FileText',
      variant: 'default',
      path: '/invoice-creation'
    },
    {
      label: 'Uitgave Toevoegen',
      description: 'Registreer een nieuwe uitgave',
      icon: 'Receipt',
      variant: 'outline',
      path: '/expense-management'
    },
    {
      label: 'Tijd Bijhouden',
      description: 'Start tijdregistratie',
      icon: 'Clock',
      variant: 'outline',
      path: '/time-tracking'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <h2 className="text-lg font-semibold text-foreground mb-6">Snelle Acties</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions?.map((action, index) => (
          <div key={index} className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors duration-200">
            <Button
              variant={action?.variant}
              fullWidth
              iconName={action?.icon}
              iconPosition="left"
              iconSize={20}
              onClick={() => navigate(action?.path)}
              className="mb-3"
            >
              {action?.label}
            </Button>
            <p className="text-sm text-muted-foreground text-center">{action?.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default QuickActions;