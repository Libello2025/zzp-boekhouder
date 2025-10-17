import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import tinkService from '../../../services/tinkService';
import bankService from '../../../services/bankService';

// ⚙️ Vul hier je Supabase project-URL en Anon-key in
// Let op: gebruik het .functions subdomein
const SUPABASE_FUNCTION_URL = 'https://ynobexdnkvbhtvucjbop.functions.supabase.co/bright-processor';
const SUPABASE_ANON_KEY = '<<VUL_HIER_JE_ANON_KEY_IN>>';

const TinkCallbackHandler = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [processing, setProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const handleTinkCallback = async () => {
      const authCode = searchParams?.get('code');
      const errorParam = searchParams?.get('error');
      const connectionId = localStorage?.getItem('tink_connection_id');
      const bankName = localStorage?.getItem('tink_connection_bank');

      try {
        if (errorParam) throw new Error(`Tink autorisatie geweigerd: ${errorParam}`);
        if (!authCode) throw new Error('Geen autorisatiecode ontvangen van Tink');
        if (!connectionId) throw new Error('Verbinding ID niet gevonden. Probeer opnieuw.');

        // 1️⃣ Token ophalen bij Tink
        const { data: tokenData, error: tokenError } = await tinkService?.exchangeCodeForToken(authCode);
        if (tokenError) throw new Error(`Token uitwisseling mislukt: ${tokenError?.message}`);

        // 2️⃣ Tokens opslaan in DB
        const { error: storeError } = await tinkService?.storeConnectionTokens(connectionId, tokenData);
        if (storeError) throw new Error(`Tokens opslaan mislukt: ${storeError?.message}`);

        // 3️⃣ Account-data ophalen
        const { data: syncData, error: syncError } = await tinkService?.syncAccountData(
          connectionId,
          tokenData?.access_token
        );
        if (syncError) console.warn('Account data sync warning:', syncError);

        // 4️⃣ Transacties naar Edge Function sturen
        if (syncData?.transactions?.length) {
          try {
            console.log('→ Verstuur transacties naar Supabase Edge Function...');
            console.log('Aantal transacties:', syncData.transactions.length);

            const response = await fetch(SUPABASE_FUNCTION_URL, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, // ✅ Belangrijk!
              },
              body: JSON.stringify({
                user_id: sessionStorage.getItem('supabase_user_id'),
                transactions: syncData.transactions,
              }),
            });

            console.log('← Response ontvangen:', response.status);
            const result = await response.json().catch(() => ({}));
            console.log('← Response body:', result);

            if (!response.ok) {
              console.error('Supabase insert error:', result);
              throw new Error(result.message || 'Fout bij opslaan in Supabase');
            } else {
              console.info('Supabase insert success:', result.message || 'Transacties opgeslagen');
            }
          } catch (insertErr) {
            console.error('Fout bij opslaan in Supabase:', insertErr);
          }
        } else {
          console.warn('Geen transacties gevonden in Tink-sync.');
        }

        // 5️⃣ Session opschonen
        sessionStorage?.removeItem('tink_connection_id');
        sessionStorage?.removeItem('tink_connection_bank');

        // 6️⃣ Succesmelding
        setSuccess(true);
        setProcessing(false);

        // 7️⃣ Redirect
        setTimeout(() => navigate('/bank-integration', { replace: true }), 3000);
      } catch (err) {
        console.error('Tink callback error:', err);
        setError(err?.message || 'Onbekende fout bij bankverbinding');
        setProcessing(false);

        if (connectionId) {
          try {
            await bankService?.updateBankConnection(connectionId, {
              status: 'error',
              error_message: err?.message,
            });
          } catch (updateError) {
            console.error('Failed to update connection status:', updateError);
          }
        }

        sessionStorage?.removeItem('tink_connection_id');
        sessionStorage?.removeItem('tink_connection_bank');
      }
    };

    handleTinkCallback();
  }, [searchParams, navigate]);

  const handleRetry = () => navigate('/bank-integration', { replace: true });

  // 👇 UI blijft gelijk
  if (processing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="RefreshCw" size={32} color="var(--color-primary)" className="animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Bankverbinding wordt verwerkt...</h2>
          <p className="text-muted-foreground mb-6">
            We maken een veilige verbinding met je bank en synchroniseren je rekeningen.
          </p>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="CheckCircle" size={32} color="var(--color-success)" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Bankverbinding succesvol!</h2>
          <p className="text-muted-foreground mb-6">
            Je bankrekening is succesvol verbonden. Je transacties worden nu automatisch gesynchroniseerd.
          </p>
          <Button
            variant="default"
            onClick={() => navigate('/bank-integration', { replace: true })}
            iconName="ArrowRight"
            iconPosition="right"
          >
            Ga naar Bank Integratie
          </Button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Icon name="AlertCircle" size={32} color="var(--color-destructive)" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-4">Verbinding mislukt</h2>
          <p className="text-muted-foreground mb-6">
            Er is een probleem opgetreden bij het verbinden van je bankrekening.
          </p>
          <Button variant="default" onClick={handleRetry} iconName="RefreshCw" iconPosition="left">
            Opnieuw proberen
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export default TinkCallbackHandler;
