import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../AppIcon';
import Button from './Button';
import Input from './Input';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
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

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(formData?.email, formData?.password);

      if (error) {
        if (error?.message?.includes('Invalid login credentials')) {
          setError('Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.');
        } else if (error?.message?.includes('Email not confirmed')) {
          setError('Je e-mailadres is nog niet bevestigd. Controleer je inbox.');
        } else if (error?.message?.includes('Too many requests')) {
          setError('Te veel inlogpogingen. Probeer het later opnieuw.');
        } else if (error?.message?.includes('Failed to fetch') || error?.message?.includes('NetworkError')) {
          setError('Kan geen verbinding maken met de server. Controleer je internetverbinding of probeer het later opnieuw.');
        } else {
          setError(error?.message || 'Er is een fout opgetreden bij het inloggen.');
        }
        return;
      }

      // Success - redirect to dashboard
      navigate('/bank-integration');
    } catch (err) {
      setError('Er is een onverwachte fout opgetreden. Probeer het opnieuw.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async (email, password) => {
    setFormData({ email, password });
    setError('');
    setIsLoading(true);

    try {
      const { error } = await signIn(email, password);

      if (error) {
        setError('Demo login mislukt: ' + (error?.message || 'Onbekende fout'));
        return;
      }

      navigate('/bank-integration');
    } catch (err) {
      setError('Demo login mislukt: Onverwachte fout');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Building2" size={32} color="var(--color-primary)" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ZZP Boekhouding
          </h1>
          <p className="text-muted-foreground">
            Inloggen om je bankintegratie te beheren
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="E-mailadres"
              type="email"
              name="email"
              value={formData?.email}
              onChange={handleChange}
              placeholder="je@voorbeeld.nl"
              required
              disabled={isLoading}
            />

            <Input
              label="Wachtwoord"
              type="password"
              name="password"
              value={formData?.password}
              onChange={handleChange}
              placeholder="Je wachtwoord"
              required
              disabled={isLoading}
            />

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
              disabled={isLoading || loading}
            >
              {isLoading || loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Inloggen...</span>
                </div>
              ) : (
                'Inloggen'
              )}
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-border">
            <h3 className="text-sm font-medium text-foreground mb-3">Demo Inloggegevens</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                <div className="text-sm">
                  <div className="font-medium text-foreground">Admin Account</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    admin@zzpaccounting.nl / admin123
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('admin@zzpaccounting.nl', 'admin123')}
                  disabled={isLoading}
                >
                  Login
                </Button>
              </div>
              
              <div className="flex items-center justify-between bg-muted/50 rounded-md p-2">
                <div className="text-sm">
                  <div className="font-medium text-foreground">User Account</div>
                  <div className="text-xs text-muted-foreground font-mono">
                    user@zzpaccounting.nl / user123
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDemoLogin('user@zzpaccounting.nl', 'user123')}
                  disabled={isLoading}
                >
                  Login
                </Button>
              </div>
            </div>
          </div>

          {/* Additional Options */}
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Nog geen account?{' '}
              <button
                type="button"
                onClick={() => navigate('/signup')}
                className="text-primary hover:underline font-medium"
              >
                Registreren
              </button>
            </p>
          </div>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            Veilige verbinding met je bankrekeningen via Tink API
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;