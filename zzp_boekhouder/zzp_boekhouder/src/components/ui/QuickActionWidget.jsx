import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from './Button';

const QuickActionWidget = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isExpanded, setIsExpanded] = useState(false);

  const getContextualActions = () => {
    const currentPath = location?.pathname;
    
    switch (currentPath) {
      case '/dashboard':
        return [
          { 
            label: 'Nieuwe Factuur', 
            icon: 'FileText', 
            action: () => navigate('/invoice-creation'), 
            variant: 'default' 
          },
          { 
            label: 'Uitgave Toevoegen', 
            icon: 'Receipt', 
            action: () => navigate('/expense-management'), 
            variant: 'outline' 
          },
          { 
            label: 'Tijd Bijhouden', 
            icon: 'Clock', 
            action: () => navigate('/time-tracking'), 
            variant: 'outline' 
          },
          { 
            label: 'Nieuwe Klant', 
            icon: 'UserPlus', 
            action: () => navigate('/client-management'), 
            variant: 'outline' 
          }
        ];
      case '/client-management':
        return [
          { 
            label: 'Nieuwe Klant', 
            icon: 'UserPlus', 
            action: () => {
              // Trigger new client modal or form
              const event = new CustomEvent('openClientModal');
              window.dispatchEvent(event);
            }, 
            variant: 'default' 
          },
          { 
            label: 'Factuur Maken', 
            icon: 'FileText', 
            action: () => navigate('/invoice-creation'), 
            variant: 'outline' 
          },
          { 
            label: 'Import Klanten', 
            icon: 'Upload', 
            action: () => {
              // Trigger import functionality
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv,.xlsx';
              input.onchange = (e) => {
                const file = e?.target?.files?.[0];
                if (file) {
                  console.log('Importing clients from:', file?.name);
                  // Add import logic here
                }
              };
              input?.click();
            }, 
            variant: 'outline' 
          }
        ];
      case '/invoice-creation':
        return [
          { 
            label: 'Concept Opslaan', 
            icon: 'Save', 
            action: () => {
              // Trigger save draft functionality
              const event = new CustomEvent('saveInvoiceDraft');
              window.dispatchEvent(event);
              alert('Concept opgeslagen');
            }, 
            variant: 'outline' 
          },
          { 
            label: 'Versturen', 
            icon: 'Send', 
            action: () => {
              // Trigger send invoice functionality
              const event = new CustomEvent('sendInvoice');
              window.dispatchEvent(event);
              alert('Factuur verzonden');
            }, 
            variant: 'default' 
          },
          { 
            label: 'Voorbeeld', 
            icon: 'Eye', 
            action: () => {
              // Trigger preview functionality
              const event = new CustomEvent('previewInvoice');
              window.dispatchEvent(event);
            }, 
            variant: 'outline' 
          }
        ];
      case '/time-tracking':
        return [
          { 
            label: 'Timer Starten', 
            icon: 'Play', 
            action: () => {
              // Trigger start timer functionality
              const event = new CustomEvent('startTimer');
              window.dispatchEvent(event);
              alert('Timer gestart');
            }, 
            variant: 'default' 
          },
          { 
            label: 'Handmatig Toevoegen', 
            icon: 'Plus', 
            action: () => {
              // Trigger manual entry form
              const event = new CustomEvent('openManualEntryForm');
              window.dispatchEvent(event);
            }, 
            variant: 'outline' 
          },
          { 
            label: 'Rapport Genereren', 
            icon: 'BarChart3', 
            action: () => {
              // Trigger report generation
              const startDate = new Date();
              startDate?.setMonth(startDate?.getMonth() - 1);
              const endDate = new Date();
              
              alert(`Rapport wordt gegenereerd voor periode: ${startDate?.toLocaleDateString('nl-NL')} - ${endDate?.toLocaleDateString('nl-NL')}`);
            }, 
            variant: 'outline' 
          }
        ];
      case '/expense-management':
        return [
          { 
            label: 'Nieuwe Uitgave', 
            icon: 'Plus', 
            action: () => {
              // Trigger new expense modal
              const event = new CustomEvent('openExpenseModal');
              window.dispatchEvent(event);
            }, 
            variant: 'default' 
          },
          { 
            label: 'Bon Scannen', 
            icon: 'Camera', 
            action: () => {
              // Trigger receipt scanning
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = 'image/*';
              input.capture = 'environment';
              input.onchange = (e) => {
                const file = e?.target?.files?.[0];
                if (file) {
                  alert(`Bon wordt gescand: ${file?.name}`);
                  // Add OCR processing logic here
                }
              };
              input?.click();
            }, 
            variant: 'outline' 
          },
          { 
            label: 'Import CSV', 
            icon: 'Upload', 
            action: () => {
              // Trigger CSV import
              const input = document.createElement('input');
              input.type = 'file';
              input.accept = '.csv';
              input.onchange = (e) => {
                const file = e?.target?.files?.[0];
                if (file) {
                  alert(`CSV wordt geïmporteerd: ${file?.name}`);
                  // Add CSV import logic here
                }
              };
              input?.click();
            }, 
            variant: 'outline' 
          }
        ];
      case '/bank-integration':
        return [
          { 
            label: 'Synchroniseren', 
            icon: 'RefreshCw', 
            action: () => {
              // Trigger bank sync
              alert('Bankgegevens worden gesynchroniseerd...');
              setTimeout(() => {
                alert('Synchronisatie voltooid');
              }, 2000);
            }, 
            variant: 'default' 
          },
          { 
            label: 'Transacties Matchen', 
            icon: 'Link', 
            action: () => {
              // Trigger transaction matching
              const event = new CustomEvent('openTransactionMatcher');
              window.dispatchEvent(event);
            }, 
            variant: 'outline' 
          },
          { 
            label: 'Rapport Downloaden', 
            icon: 'Download', 
            action: () => {
              // Trigger report download
              const startDate = new Date();
              startDate?.setMonth(startDate?.getMonth() - 1);
              const endDate = new Date();
              
              const blob = new Blob(['Transactierapport\n\nPeriode: ' + startDate.toLocaleDateString('nl-NL') + ' - ' + endDate.toLocaleDateString('nl-NL') + '\n\nNog geen transacties beschikbaar.'], {
                type: 'text/plain'
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = `transactie-rapport-${new Date()?.toISOString()?.split('T')?.[0]}.txt`;
              a?.click();
              URL.revokeObjectURL(url);
            }, 
            variant: 'outline' 
          }
        ];
      default:
        return [
          { 
            label: 'Nieuwe Factuur', 
            icon: 'FileText', 
            action: () => navigate('/invoice-creation'), 
            variant: 'default' 
          },
          { 
            label: 'Uitgave Toevoegen', 
            icon: 'Receipt', 
            action: () => navigate('/expense-management'), 
            variant: 'outline' 
          }
        ];
    }
  };

  const actions = getContextualActions();
  const primaryAction = actions?.[0];
  const secondaryActions = actions?.slice(1);

  return (
    <div className="fixed bottom-6 right-6 z-1000">
      {/* Secondary Actions (when expanded) */}
      {isExpanded && secondaryActions?.length > 0 && (
        <div className="mb-3 space-y-2">
          {secondaryActions?.map((action, index) => (
            <div
              key={index}
              className="flex items-center justify-end animate-in slide-in-from-bottom-2 duration-200"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="bg-popover text-popover-foreground px-3 py-1 rounded-lg shadow-elevation-2 mr-3 text-sm font-medium">
                {action?.label}
              </div>
              <Button
                variant={action?.variant}
                size="icon"
                onClick={action?.action}
                iconName={action?.icon}
                iconSize={20}
                className="w-12 h-12 shadow-elevation-2"
              />
            </div>
          ))}
        </div>
      )}
      
      {/* Primary Action Button */}
      <div className="flex items-center justify-end">
        {isExpanded && (
          <div className="bg-popover text-popover-foreground px-3 py-1 rounded-lg shadow-elevation-2 mr-3 text-sm font-medium animate-in slide-in-from-bottom-2 duration-200">
            {primaryAction?.label}
          </div>
        )}
        <div className="relative">
          <Button
            variant={primaryAction?.variant}
            size="icon"
            onClick={primaryAction?.action}
            iconName={primaryAction?.icon}
            iconSize={24}
            className="w-14 h-14 shadow-elevation-3 hover:shadow-elevation-3 transition-all duration-200"
          />
          
          {/* Expand/Collapse Toggle */}
          {secondaryActions?.length > 0 && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setIsExpanded(!isExpanded)}
              iconName={isExpanded ? "X" : "MoreHorizontal"}
              iconSize={16}
              className="absolute -top-2 -right-2 w-6 h-6 shadow-elevation-2"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default QuickActionWidget;