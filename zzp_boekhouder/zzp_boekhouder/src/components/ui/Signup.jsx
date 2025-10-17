import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    kvkNumber: '',
    btwNumber: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData?.email || !formData?.password || !formData?.fullName) {
      setError('Vul alle verplichte velden in.');
      return false;
    }

    if (formData?.password !== formData?.confirmPassword) {
      setError('Wachtwoorden komen niet overeen.');
      return false;
    }

    if (formData?.password?.length < 6) {
      setError('Wachtwoord moet minimaal 6 tekens lang zijn.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex?.test(formData?.email)) {
      setError('Vul een geldig e-mailadres in.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const { data, error } = await supabase?.auth?.signUp({
        email: formData?.email,
        password: formData?.password,
        options: {
          data: {
            full_name: formData?.fullName,
            company_name: formData?.companyName,
            kvk_number: formData?.kvkNumber,
            btw_number: formData?.btwNumber,
            role: 'user'
          }
        }
      });

      if (error) {
        if (error?.message?.includes('User already registered')) {
          setError('Dit e-mailadres is al geregistreerd. Probeer in te loggen.');
        } else if (error?.message?.includes('Password should be at least')) {
          setError('Wachtwoord moet minimaal 6 tekens lang zijn.');
        } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
          setError('Kan geen verbinding maken met de server. Controleer je internetverbinding.');
        } else {
          setError(error?.message || 'Er is een fout opgetreden bij het registreren.');
        }
        return;
      }

      if (data?.user && !data?.user?.email_confirmed_at) {
        setSuccess(true);
      } else if (data?.user?.email_confirmed_at) {
        // Auto-confirmed, redirect to bank integration
        navigate('/bank-integration');
      }

    } catch (err) {
      setError('Er is een onverwachte fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <div className="bg-card border border-border rounded-lg p-6 shadow-sm text-center">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} color="var(--color-success)" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">
              Registratie Voltooid!
            </h2>
            <p className="text-muted-foreground mb-6">
              We hebben een bevestigingsmail gestuurd naar <strong>{formData?.email}</strong>. 
              Klik op de link in de e-mail om je account te activeren.
            </p>
            <div className="space-y-3">
              <Button
                variant="default"
                className="w-full"
                onClick={() => navigate('/login')}
              >
                Ga naar Inlogpagina
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSuccess(false)}
              >
                Registreer Opnieuw
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="UserPlus" size={32} color="var(--color-primary)" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Account Aanmaken
          </h1>
          <p className="text-muted-foreground">
            Maak een account aan voor je ZZP boekhouding
          </p>
        </div>

        {/* Signup Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Volledige naam *"
              type="text"
              name="fullName"
              value={formData?.fullName}
              onChange={handleChange}
              placeholder="Jan Janssen"
              required
              disabled={isLoading}
            />

            <Input
              label="E-mailadres *"
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleChange}
              placeholder="jan@voorbeeld.nl"
              required
              disabled={isLoading}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Wachtwoord *"
                type="password"
                name="password"
                value={formData?.password}
                onChange={handleChange}
                placeholder="Minimaal 6 tekens"
                required
                disabled={isLoading}
              />

              <Input
                label="Bevestig wachtwoord *"
                type="password"
                name="confirmPassword"
                value={formData?.confirmPassword}
                onChange={handleChange}
                placeholder="Herhaal wachtwoord"
                required
                disabled={isLoading}
              />
            </div>

            <div className="border-t border-border pt-4">
              <h3 className="text-sm font-medium text-foreground mb-3">
                Bedrijfsgegevens (optioneel)
              </h3>
              
              <Input
                label="Bedrijfsnaam"
                type="text"
                name="companyName"
                value={formData?.companyName}
                onChange={handleChange}
                placeholder="Mijn ZZP Bedrijf"
                disabled={isLoading}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="KvK nummer"
                  type="text"
                  name="kvkNumber"
                  value={formData?.kvkNumber}
                  onChange={handleChange}
                  placeholder="12345678"
                  disabled={isLoading}
                />

                <Input
                  label="BTW nummer"
                  type="text"
                  name="btwNumber"
                  value={formData?.btwNumber}
                  onChange={handleChange}
                  placeholder="NL123456789B01"
                  disabled={isLoading}
                />
              </div>
            </div>

            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                <div className="flex items-start space-x-2">
                  <Icon name="AlertCircle" size={16} color="var(--color-destructive)" className="mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm text-destructive">{error}</p>
                  </div>
                </div>
              </div>
            )}

            <Button
              type="submit"
              variant="default"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Account aanmaken...</span>
                </div>
              ) : (
                'Account Aanmaken'
              )}
            </Button>
          </form>

          {/* Additional Options */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Al een account?{' '}
              <button
                type="button"
                onClick={() => navigate('/login')}
                className="text-primary hover:underline font-medium"
                disabled={isLoading}
              >
                Inloggen
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Door je te registreren ga je akkoord met onze voorwaarden en privacybeleid
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;