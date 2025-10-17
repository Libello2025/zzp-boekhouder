import React from 'react';

import Button from '../../../components/ui/Button';

const QuickActions = ({ 
  onManualEntry, 
  onExportData, 
  onBulkEdit,
  selectedCount = 0,
  totalEntries = 0,
  totalHours = 0,
  billableHours = 0 
}) => {
  const formatHours = (hours) => {
    return hours?.toFixed(1);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-2 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="text-center lg:text-left">
            <div className="text-2xl font-bold text-foreground">{totalEntries}</div>
            <div className="text-muted-foreground">Registraties</div>
          </div>
          <div className="text-center lg:text-left">
            <div className="text-2xl font-bold text-foreground">{formatHours(totalHours)}</div>
            <div className="text-muted-foreground">Totaal uren</div>
          </div>
          <div className="text-center lg:text-left">
            <div className="text-2xl font-bold text-primary">{formatHours(billableHours)}</div>
            <div className="text-muted-foreground">Factureerbaar</div>
          </div>
          <div className="text-center lg:text-left">
            <div className="text-2xl font-bold text-success">
              {totalHours > 0 ? Math.round((billableHours / totalHours) * 100) : 0}%
            </div>
            <div className="text-muted-foreground">Efficiency</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant="default"
            onClick={onManualEntry}
            iconName="Plus"
            iconPosition="left"
            iconSize={16}
          >
            Handmatig Toevoegen
          </Button>
          
          <Button
            variant="outline"
            onClick={onExportData}
            iconName="Download"
            iconPosition="left"
            iconSize={16}
          >
            Exporteren
          </Button>

          {selectedCount > 0 && (
            <Button
              variant="secondary"
              onClick={onBulkEdit}
              iconName="Edit2"
              iconPosition="left"
              iconSize={16}
            >
              Bulk Bewerken ({selectedCount})
            </Button>
          )}

          <Button
            variant="outline"
            iconName="BarChart3"
            iconPosition="left"
            iconSize={16}
          >
            Rapport
          </Button>

          <Button
            variant="outline"
            iconName="Settings"
            iconPosition="left"
            iconSize={16}
          >
            Instellingen
          </Button>
        </div>
      </div>

      {/* Quick Filters */}
      <div className="mt-4 pt-4 border-t border-border">
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" iconName="Calendar" iconPosition="left" iconSize={14}>
            Vandaag
          </Button>
          <Button variant="ghost" size="sm" iconName="Calendar" iconPosition="left" iconSize={14}>
            Deze Week
          </Button>
          <Button variant="ghost" size="sm" iconName="Calendar" iconPosition="left" iconSize={14}>
            Deze Maand
          </Button>
          <Button variant="ghost" size="sm" iconName="DollarSign" iconPosition="left" iconSize={14}>
            Alleen Factureerbaar
          </Button>
          <Button variant="ghost" size="sm" iconName="Clock" iconPosition="left" iconSize={14}>
            Actieve Projecten
          </Button>
        </div>
      </div>
    </div>
  );
};

export default QuickActions;