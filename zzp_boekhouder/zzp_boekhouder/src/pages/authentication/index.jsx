import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';

const Authentication = () => {
  const navigate = useNavigate();
  const { signIn, loading } = useAuth();
  const [activeTab, setActiveTab] = useState('inloggen');
  const [loginData, setLoginData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [registerData, setRegisterData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    companyName: '',
    kvkNumber: '',
    btwNumber: '',
    acceptTerms: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
  };

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleRegisterChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setRegisterData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateLogin = () => {
    const newErrors = {};
    
    if (!loginData?.email) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(loginData?.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }
    
    if (!loginData?.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const validateRegister = () => {
    const newErrors = {};
    
    if (!registerData?.email) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(registerData?.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }
    
    if (!registerData?.password) {
      newErrors.password = 'Wachtwoord is verplicht';
    } else if (registerData?.password?.length < 6) {
      newErrors.password = 'Wachtwoord moet minimaal 6 tekens bevatten';
    }
    
    if (!registerData?.confirmPassword) {
      newErrors.confirmPassword = 'Bevestig je wachtwoord';
    } else if (registerData?.password !== registerData?.confirmPassword) {
      newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
    }
    
    if (!registerData?.fullName) {
      newErrors.fullName = 'Volledige naam is verplicht';
    }
    
    if (!registerData?.companyName) {
      newErrors.companyName = 'Bedrijfsnaam is verplicht';
    }
    
    if (!registerData?.kvkNumber) {
      newErrors.kvkNumber = 'KvK nummer is verplicht';
    } else if (!/^\d{8}$/?.test(registerData?.kvkNumber)) {
      newErrors.kvkNumber = 'KvK nummer moet 8 cijfers bevatten';
    }
    
    if (registerData?.btwNumber && !/^NL\d{9}B\d{2}$/?.test(registerData?.btwNumber)) {
      newErrors.btwNumber = 'BTW nummer format: NL123456789B01';
    }
    
    if (!registerData?.acceptTerms) {
      newErrors.acceptTerms = 'Je moet akkoord gaan met de voorwaarden';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleLoginSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateLogin()) return;
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const { error } = await signIn(loginData?.email, loginData?.password);
      
      if (error) {
        if (error?.message?.includes('Invalid login credentials')) {
          setErrors({ general: 'Ongeldige inloggegevens. Controleer je e-mailadres en wachtwoord.' });
        } else if (error?.message?.includes('Email not confirmed')) {
          setErrors({ general: 'Je e-mailadres is nog niet bevestigd. Controleer je inbox.' });
        } else if (error?.message?.includes('Too many requests')) {
          setErrors({ general: 'Te veel inlogpogingen. Probeer het later opnieuw.' });
        } else {
          setErrors({ general: error?.message || 'Er is een fout opgetreden bij het inloggen.' });
        }
        return;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'Er is een onverwachte fout opgetreden.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateRegister()) return;
    
    // For now, redirect to signup page for full registration flow
    navigate('/signup');
  };

  const handleDemoLogin = async (email, password) => {
    setIsLoading(true);
    setErrors({});
    
    try {
      const { error } = await signIn(email, password);
      
      if (error) {
        setErrors({ general: 'Demo login mislukt: ' + (error?.message || 'Onbekende fout') });
        return;
      }
      
      navigate('/dashboard');
    } catch (err) {
      setErrors({ general: 'Demo login mislukt' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="Building2" size={32} color="var(--color-primary)" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            ZZP Boekhouder
          </h1>
          <p className="text-muted-foreground">
            Veilige toegang voor Nederlandse freelancers
          </p>
        </div>

        {/* Authentication Form */}
        <div className="bg-card border border-border rounded-lg shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-border">
            <button
              type="button"
              onClick={() => handleTabChange('inloggen')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'inloggen' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Inloggen
            </button>
            <button
              type="button"
              onClick={() => handleTabChange('registreren')}
              className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'registreren' ?'bg-primary text-primary-foreground' :'text-muted-foreground hover:text-foreground hover:bg-muted/50'
              }`}
            >
              Registreren
            </button>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'inloggen' ? (
              // Login Form
              (<form onSubmit={handleLoginSubmit} className="space-y-4">
                <Input
                  label="E-mailadres"
                  type="email"
                  name="email"
                  value={loginData?.email}
                  onChange={handleLoginChange}
                  placeholder="je@voorbeeld.nl"
                  required
                  disabled={isLoading}
                  error={errors?.email}
                />
                <Input
                  label="Wachtwoord"
                  type="password"
                  name="password"
                  value={loginData?.password}
                  onChange={handleLoginChange}
                  placeholder="Je wachtwoord"
                  required
                  disabled={isLoading}
                  error={errors?.password}
                />
                <div className="flex items-center justify-between">
                  <Checkbox
                    name="rememberMe"
                    checked={loginData?.rememberMe}
                    onChange={handleLoginChange}
                    label="Onthouden"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-sm text-primary hover:underline"
                    disabled={isLoading}
                  >
                    Wachtwoord vergeten?
                  </button>
                </div>
                {errors?.general && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                    <div className="flex items-start space-x-2">
                      <Icon name="AlertCircle" size={16} color="var(--color-destructive)" className="mt-0.5" />
                      <p className="text-sm text-destructive">{errors?.general}</p>
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
                {/* Demo Accounts */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-sm font-medium text-foreground mb-3">Demo Accounts</h3>
                  <div className="space-y-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleDemoLogin('admin@zzpaccounting.nl', 'admin123')}
                      disabled={isLoading}
                    >
                      <Icon name="UserCheck" size={16} className="mr-2" />
                      Admin Demo (admin@zzpaccounting.nl)
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      className="w-full justify-start"
                      onClick={() => handleDemoLogin('user@zzpaccounting.nl', 'user123')}
                      disabled={isLoading}
                    >
                      <Icon name="User" size={16} className="mr-2" />
                      Gebruiker Demo (user@zzpaccounting.nl)
                    </Button>
                  </div>
                </div>
                {/* DigiD Integration Placeholder */}
                <div className="mt-6 pt-6 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full"
                    disabled
                  >
                    <Icon name="Shield" size={16} className="mr-2" />
                    DigiD Inloggen (Binnenkort beschikbaar)
                  </Button>
                </div>
              </form>)
            ) : (
              // Register Form Preview
              (<form onSubmit={handleRegisterSubmit} className="space-y-4">
                <div className="space-y-4">
                  <Input
                    label="Volledige naam"
                    type="text"
                    name="fullName"
                    value={registerData?.fullName}
                    onChange={handleRegisterChange}
                    placeholder="Voor- en achternaam"
                    required
                    disabled={isLoading}
                    error={errors?.fullName}
                  />

                  <Input
                    label="E-mailadres"
                    type="email"
                    name="email"
                    value={registerData?.email}
                    onChange={handleRegisterChange}
                    placeholder="je@voorbeeld.nl"
                    required
                    disabled={isLoading}
                    error={errors?.email}
                  />

                  <Input
                    label="Bedrijfsnaam"
                    type="text"
                    name="companyName"
                    value={registerData?.companyName}
                    onChange={handleRegisterChange}
                    placeholder="Jouw bedrijfsnaam"
                    required
                    disabled={isLoading}
                    error={errors?.companyName}
                  />

                  <Input
                    label="KvK nummer"
                    type="text"
                    name="kvkNumber"
                    value={registerData?.kvkNumber}
                    onChange={handleRegisterChange}
                    placeholder="12345678"
                    required
                    disabled={isLoading}
                    error={errors?.kvkNumber}
                    maxLength="8"
                  />
                </div>
                <div className="bg-muted/30 border border-border rounded-md p-4">
                  <div className="flex items-start space-x-3">
                    <Icon name="Info" size={20} color="var(--color-primary)" className="mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-foreground mb-1">
                        Volledige Registratie
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        Voor een complete registratie met alle bedrijfsgegevens en wachtwoordbeveiliging, 
                        gebruik de uitgebreide registratiepagina.
                      </p>
                    </div>
                  </div>
                </div>
                <Button
                  type="submit"
                  variant="default"
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Doorgaan...</span>
                    </div>
                  ) : (
                    'Doorgaan naar Volledige Registratie'
                  )}
                </Button>
              </form>)
            )}
          </div>
        </div>

        {/* Security Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-muted-foreground">
            <Icon name="Lock" size={12} className="inline mr-1" />
            SSL-versleuteling • AVG-compliant • Veilige dataopslag
          </p>
        </div>

        {/* Forgot Password Modal */}
        {showForgotPassword && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="bg-card border border-border rounded-lg p-6 w-full max-w-sm">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-foreground">
                  Wachtwoord Vergeten
                </h3>
                <button
                  type="button"
                  onClick={() => setShowForgotPassword(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <Icon name="X" size={20} />
                </button>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Voer je e-mailadres in om een wachtwoord reset link te ontvangen.
              </p>
              <Input
                label="E-mailadres"
                type="email"
                placeholder="je@voorbeeld.nl"
              />
              <div className="flex space-x-3 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowForgotPassword(false)}
                >
                  Annuleren
                </Button>
                <Button
                  type="button"
                  variant="default"
                  className="flex-1"
                >
                  Versturen
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Authentication;