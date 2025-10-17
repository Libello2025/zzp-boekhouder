import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const InvoiceActions = ({ onSave, onSend, onPreview, isValid }) => {
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: `Beste,

Hierbij ontvangt u factuur {invoiceNumber} van {companyName}.

De factuur heeft een vervaldatum van {dueDate}. U kunt het bedrag overmaken naar IBAN: NL91 ABNA 0417 1643 00 onder vermelding van het factuurnummer.

Voor vragen kunt u contact met mij opnemen.

Met vriendelijke groet,
Jan Janssen
ZZP Boekhouder`
  });

  const handleSaveDraft = () => {
    onSave('draft');
  };

  const handleSendInvoice = () => {
    if (isValid) {
      setShowEmailModal(true);
    }
  };

  const handleEmailSend = () => {
    onSend(emailData);
    setShowEmailModal(false);
  };

  const handleScheduleSend = () => {
    // Implementation for scheduling
    console.log('Schedule send functionality');
  };

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-medium text-foreground mb-4">Factuur Acties</h3>
        
        <div className="space-y-4">
          {/* Primary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Button
              variant="outline"
              iconName="Save"
              iconPosition="left"
              iconSize={16}
              onClick={handleSaveDraft}
              fullWidth
            >
              Concept Opslaan
            </Button>
            
            <Button
              variant="default"
              iconName="Send"
              iconPosition="left"
              iconSize={16}
              onClick={handleSendInvoice}
              disabled={!isValid}
              fullWidth
            >
              Versturen
            </Button>
          </div>

          {/* Secondary Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              variant="ghost"
              iconName="Eye"
              iconPosition="left"
              iconSize={14}
              onClick={onPreview}
              size="sm"
              fullWidth
            >
              Voorbeeld
            </Button>
            
            <Button
              variant="ghost"
              iconName="Download"
              iconPosition="left"
              iconSize={14}
              onClick={() => onSave('pdf')}
              size="sm"
              fullWidth
            >
              PDF
            </Button>
            
            <Button
              variant="ghost"
              iconName="Calendar"
              iconPosition="left"
              iconSize={14}
              onClick={handleScheduleSend}
              size="sm"
              fullWidth
            >
              Plannen
            </Button>
          </div>

          {/* Status Indicators */}
          <div className="pt-4 border-t border-border">
            <div className="space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Status:</span>
                <span className="flex items-center space-x-1">
                  <Icon name="Circle" size={8} className="text-warning" />
                  <span className="text-warning">Concept</span>
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Laatst opgeslagen:</span>
                <span className="text-foreground">
                  {new Date()?.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-muted-foreground">Validatie:</span>
                <span className={`flex items-center space-x-1 ${isValid ? 'text-success' : 'text-error'}`}>
                  <Icon name={isValid ? "CheckCircle" : "XCircle"} size={12} />
                  <span>{isValid ? 'Compleet' : 'Incompleet'}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
          <div className="bg-card border border-border rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-medium text-foreground">Factuur Versturen</h3>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowEmailModal(false)}
                iconName="X"
                iconSize={16}
              />
            </div>
            
            <div className="p-4 space-y-4">
              <Input
                label="Naar"
                type="email"
                value={emailData?.to}
                onChange={(e) => setEmailData({ ...emailData, to: e?.target?.value })}
                placeholder="klant@bedrijf.nl"
                required
              />
              
              <Input
                label="Onderwerp"
                type="text"
                value={emailData?.subject}
                onChange={(e) => setEmailData({ ...emailData, subject: e?.target?.value })}
                placeholder="Factuur 2024-001"
                required
              />
              
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Bericht
                </label>
                <textarea
                  value={emailData?.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e?.target?.value })}
                  rows={8}
                  className="w-full px-3 py-2 border border-border rounded-md text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Voer uw bericht in..."
                />
              </div>
            </div>
            
            <div className="flex items-center justify-end space-x-2 p-4 border-t border-border">
              <Button
                variant="outline"
                onClick={() => setShowEmailModal(false)}
              >
                Annuleren
              </Button>
              <Button
                variant="default"
                iconName="Send"
                iconPosition="left"
                iconSize={16}
                onClick={handleEmailSend}
                disabled={!emailData?.to || !emailData?.subject}
              >
                Versturen
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoiceActions;