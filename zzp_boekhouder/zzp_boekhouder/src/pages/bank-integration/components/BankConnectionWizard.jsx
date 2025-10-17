import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import tinkService from '../../../services/tinkService';

const BankConnectionWizard = ({ isOpen, onClose, onConnect }) => {
  const [step, setStep] = useState(1);
  const [selectedBank, setSelectedBank] = useState('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [useTestMode, setUseTestMode] = useState(false);

  const bankOptions = [
    { value: 'ing', label: 'ING Bank', description: 'Internet bankieren vereist' },
    { value: 'rabobank', label: 'Rabobank', description: 'Rabo Internet Bankieren' },
    { value: 'abn_amro', label: 'ABN AMRO', description: 'Internet Bankieren' },
    { value: 'sns', label: 'SNS Bank', description: 'Online bankieren' },
    { value: 'asn', label: 'ASN Bank', description: 'Mijn ASN Bank' },
    { value: 'triodos', label: 'Triodos Bank', description: 'Online bankieren' },
    { value: 'knab', label: 'Knab', description: 'Knab app of website' },
    { value: 'bunq', label: 'bunq', description: 'bunq app' }
  ];

  // ✅ Hier start de echte Tink connectie
  const handleStartConnection = async () => {
    setConnectionError(null);
    setIsConnecting(true);
    setStep(3);

    try {
      // 1️⃣ Maak een unieke lokale connection aan
      const providerData = {
        provider_name: getBankName(selectedBank),
        provider_id: selectedBank,
        connection_id: `tink_${selectedBank}_${Date.now()}`,
        status: 'pending',
        metadata: {
          initiated_at: new Date().toISOString(),
          provider_type: 'tink',
          test_mode: useTestMode
        }
      };

      // 2️⃣ Sla deze verbinding op in je database via onConnect()
      const result = await onConnect(providerData, true);
      if (result?.error) throw new Error(result.error);

      // 3️⃣ Verkrijg het connection ID vanuit backend of gebruik lokale fallback
      const connectionId = result?.data?.id || providerData.connection_id;

      // 4️⃣ ✅ Sla connection info op in sessionStorage voor de callback
      localStorage.setItem('tink_connection_id', connectionId);
      localStorage.setItem('tink_connection_bank', selectedBank);

      console.log('Tink verbinding opgeslagen in sessionStorage:', {
        tink_connection_id: connectionId,
        tink_connection_bank: selectedBank
      });

      // 5️⃣ Genereer Tink-link URL en redirect
      const tinkUrl = tinkService?.generateTinkLinkUrl('NL', 'nl_NL', useTestMode);
      if (!tinkUrl) throw new Error('Geen geldige Tink URL ontvangen');

      window.location.href = tinkUrl; // 🚀 Stuur gebruiker door naar Tink

    } catch (error) {
      console.error('❌ Fout bij starten Tink verbinding:', error);
      setConnectionError(error?.message || 'Verbinding maken is mislukt');
      setIsConnecting(false);
      setStep(2);
    }
  };

  // 👇 Simuleert een test/demo connectie zonder echte bankkoppeling
  const handleTestConnection = async () => {
    setConnectionError(null);
    setIsConnecting(true);
    setStep(3);

    try {
      const providerData = {
        provider_name: getBankName(selectedBank),
        provider_id: selectedBank,
        connection_id: `demo_${selectedBank}_${Date.now()}`,
        metadata: {
          initiated_at: new Date().toISOString(),
          provider_type: 'demo',
          test_mode: true
        }
      };

      await onConnect(providerData, false);

      setTimeout(() => {
        setIsConnecting(false);
        setStep(1);
        setSelectedBank('');
        onClose();
      }, 3000);

    } catch (error) {
      console.error('❌ Demo verbinding mislukt:', error);
      setConnectionError(error?.message || 'Demo verbinding is mislukt');
      setIsConnecting(false);
      setStep(2);
    }
  };

  const getBankName = (bankValue) => {
    const bankNames = {
      'ing': 'ING Bank',
      'rabobank': 'Rabobank',
      'abn_amro': 'ABN AMRO',
      'sns': 'SNS Bank',
      'asn': 'ASN Bank',
      'triodos': 'Triodos Bank',
      'knab': 'Knab',
      'bunq': 'bunq'
    };
    return bankNames?.[bankValue] || 'Onbekende Bank';
  };

  // 👇 UI rendering — ongewijzigd
  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Building2" size={32} color="var(--color-primary)" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Bankrekening verbinden
        </h3>
        <p className="text-muted-foreground">
          Kies je bank om automatische transactiesynchronisatie in te stellen
        </p>
      </div>

      <Select
        label="Selecteer je bank"
        options={bankOptions}
        value={selectedBank}
        onChange={setSelectedBank}
        placeholder="Kies je bank..."
        searchable
      />

      {/* Test Mode Toggle */}
      <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
        <input
          type="checkbox"
          id="testMode"
          checked={useTestMode}
          onChange={(e) => setUseTestMode(e.target.checked)}
          className="w-4 h-4 text-primary"
        />
        <label htmlFor="testMode" className="flex-1">
          <p className="font-medium text-foreground">Test Modus</p>
          <p className="text-sm text-muted-foreground">
            Gebruik Tink's testomgeving met demo data
          </p>
        </label>
      </div>

      <div className="bg-muted/50 p-4 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Shield" size={20} color="var(--color-success)" className="mt-0.5" />
          <div>
            <h4 className="font-medium text-foreground mb-1">Veilig & Betrouwbaar</h4>
            <p className="text-sm text-muted-foreground">
              We gebruiken Tink's beveiligde API die voldoet aan PSD2 regelgeving. 
              Je bankgegevens worden versleuteld opgeslagen en nooit gedeeld.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onClose}>
          Annuleren
        </Button>
        <Button 
          variant="default" 
          onClick={() => setStep(2)}
          disabled={!selectedBank}
        >
          Volgende
        </Button>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name="Key" size={32} color="var(--color-primary)" />
        </div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Toestemming verlenen
        </h3>
        <p className="text-muted-foreground">
          Je wordt doorgestuurd naar {bankOptions?.find(b => b.value === selectedBank)?.label} 
          om toestemming te verlenen voor toegang tot je transacties.
        </p>
      </div>

      {connectionError && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Icon name="AlertCircle" size={20} color="var(--color-destructive)" className="mt-0.5" />
            <div>
              <h4 className="font-medium text-destructive mb-1">Verbinding Mislukt</h4>
              <p className="text-sm text-destructive/80">{connectionError}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => setStep(1)}>
          Terug
        </Button>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={handleTestConnection}
            disabled={isConnecting}
          >
            Demo Verbinding
          </Button>
          <Button 
            variant="default" 
            onClick={handleStartConnection}
            disabled={isConnecting}
          >
            Echte Verbinding
          </Button>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6 text-center">
      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
        <Icon 
          name="RefreshCw" 
          size={32} 
          color="var(--color-primary)" 
          className="animate-spin" 
        />
      </div>
      <div>
        <h3 className="text-xl font-semibold text-foreground mb-2">
          Verbinding maken...
        </h3>
        <p className="text-muted-foreground">
          {useTestMode ? 
            `Test verbinding met ${bankOptions?.find(b => b.value === selectedBank)?.label}` :
            `We maken een veilige verbinding met ${bankOptions?.find(b => b.value === selectedBank)?.label}`
          }
        </p>
      </div>
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
      <div className="bg-card border border-border rounded-lg p-6 w-full max-w-md mx-4 shadow-elevation-3">
        {!isConnecting && step === 1 && renderStep1()}
        {!isConnecting && step === 2 && renderStep2()}
        {(isConnecting || step === 3) && renderStep3()}
      </div>
    </div>
  );
};

export default BankConnectionWizard;
