import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import { Checkbox } from '../../components/ui/Checkbox';

const UserProfileManagement = () => {
  const { user, userProfile, updateProfile, signOut, loading, profileLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('persoonlijk');
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    companyName: '',
    kvkNumber: '',
    btwNumber: ''
  });
  const [preferences, setPreferences] = useState({
    language: 'nl',
    currency: 'EUR',
    dateFormat: 'DD-MM-YYYY',
    emailNotifications: true,
    invoiceReminders: true,
    paymentConfirmations: true,
    taxDeadlineAlerts: true,
    systemUpdates: false
  });
  const [security, setSecurity] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    twoFactorEnabled: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [sessions, setSessions] = useState([]);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    if (userProfile) {
      setFormData({
        fullName: userProfile?.full_name || '',
        email: userProfile?.email || '',
        companyName: userProfile?.company_name || '',
        kvkNumber: userProfile?.kvk_number || '',
        btwNumber: userProfile?.btw_number || ''
      });
    }
  }, [userProfile]);

  useEffect(() => {
    // Load active sessions (mock data for now)
    setSessions([
      {
        id: 1,
        device: 'Desktop Computer',
        browser: 'Chrome 119.0',
        location: 'Amsterdam, Nederland',
        lastActive: '2024-10-17 14:30',
        current: true
      },
      {
        id: 2,
        device: 'iPhone 15 Pro',
        browser: 'Safari Mobile',
        location: 'Amsterdam, Nederland',
        lastActive: '2024-10-16 22:15',
        current: false
      }
    ]);
  }, []);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setErrors({});
    setSuccessMessage('');
  };

  const handleFormChange = (e) => {
    const { name, value } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handlePreferencesChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setPreferences(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSecurityChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setSecurity(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e?.target?.files?.[0];
    if (file) {
      // Validate file size (max 2MB)
      if (file?.size > 2 * 1024 * 1024) {
        setErrors({ profileImage: 'Afbeelding mag maximaal 2MB groot zijn' });
        return;
      }
      
      // Validate file type
      if (!file?.type?.startsWith('image/')) {
        setErrors({ profileImage: 'Alleen afbeeldingsbestanden zijn toegestaan' });
        return;
      }
      
      setProfileImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImagePreview(e?.target?.result);
      };
      reader?.readAsDataURL(file);
      
      if (errors?.profileImage) {
        setErrors(prev => ({ ...prev, profileImage: '' }));
      }
    }
  };

  const validatePersonalForm = () => {
    const newErrors = {};
    
    if (!formData?.fullName) {
      newErrors.fullName = 'Volledige naam is verplicht';
    }
    
    if (!formData?.email) {
      newErrors.email = 'E-mailadres is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Ongeldig e-mailadres';
    }
    
    if (!formData?.companyName) {
      newErrors.companyName = 'Bedrijfsnaam is verplicht';
    }
    
    if (!formData?.kvkNumber) {
      newErrors.kvkNumber = 'KvK nummer is verplicht';
    } else if (!/^\d{8}$/?.test(formData?.kvkNumber)) {
      newErrors.kvkNumber = 'KvK nummer moet 8 cijfers bevatten';
    }
    
    if (formData?.btwNumber && !/^NL\d{9}B\d{2}$/?.test(formData?.btwNumber)) {
      newErrors.btwNumber = 'BTW nummer format: NL123456789B01';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const validateSecurityForm = () => {
    const newErrors = {};
    
    if (security?.newPassword) {
      if (!security?.currentPassword) {
        newErrors.currentPassword = 'Huidig wachtwoord is verplicht';
      }
      
      if (security?.newPassword?.length < 6) {
        newErrors.newPassword = 'Nieuw wachtwoord moet minimaal 6 tekens bevatten';
      }
      
      if (security?.newPassword !== security?.confirmPassword) {
        newErrors.confirmPassword = 'Wachtwoorden komen niet overeen';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handlePersonalSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validatePersonalForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const updates = {
        full_name: formData?.fullName,
        email: formData?.email,
        company_name: formData?.companyName,
        kvk_number: formData?.kvkNumber,
        btw_number: formData?.btwNumber || null
      };
      
      const { error } = await updateProfile(updates);
      
      if (error) {
        if (error?.message?.includes('duplicate key value')) {
          setErrors({ email: 'Dit e-mailadres is al in gebruik' });
        } else {
          setErrors({ general: error?.message || 'Er is een fout opgetreden' });
        }
        return;
      }
      
      setSuccessMessage('Profiel succesvol bijgewerkt!');
    } catch (err) {
      setErrors({ general: 'Er is een onverwachte fout opgetreden' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecuritySubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateSecurityForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      if (security?.newPassword) {
        const { error } = await supabase?.auth?.updateUser({
          password: security?.newPassword
        });
        
        if (error) {
          setErrors({ general: error?.message || 'Wachtwoord kon niet worden bijgewerkt' });
          return;
        }
        
        setSecurity({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          twoFactorEnabled: security?.twoFactorEnabled
        });
      }
      
      setSuccessMessage('Beveiligingsinstellingen bijgewerkt!');
    } catch (err) {
      setErrors({ general: 'Er is een onverwachte fout opgetreden' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRevokeSession = async (sessionId) => {
    // Mock session revocation
    setSessions(prev => prev?.filter(session => session?.id !== sessionId));
    setSuccessMessage('Sessie beëindigd!');
  };

  const handleExportData = () => {
    // Mock data export
    const exportData = {
      profile: userProfile,
      preferences: preferences,
      exportDate: new Date()?.toISOString()
    };
    
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `zzp-profile-export-${new Date()?.toISOString()?.split('T')?.[0]}.json`;
    link?.click();
    URL.revokeObjectURL(url);
    
    setSuccessMessage('Gegevens geëxporteerd!');
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-foreground">Profiel laden...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
              {profileImagePreview ? (
                <img
                  src={profileImagePreview}
                  alt="Profiel foto"
                  className="w-16 h-16 rounded-full object-cover"
                />
              ) : (
                <Icon name="User" size={32} color="var(--color-primary)" />
              )}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">
                {userProfile?.full_name || 'Welkom'}
              </h1>
              <p className="text-muted-foreground">
                {userProfile?.company_name || 'ZZP Ondernemer'}
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Navigation Tabs */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {[
                { id: 'persoonlijk', label: 'Persoonlijke gegevens', icon: 'User' },
                { id: 'bedrijf', label: 'Bedrijfsgegevens', icon: 'Building2' },
                { id: 'voorkeuren', label: 'Voorkeuren', icon: 'Settings' },
                { id: 'beveiliging', label: 'Beveiliging', icon: 'Shield' },
                { id: 'integraties', label: 'Integraties', icon: 'Link' },
                { id: 'gegevens', label: 'Gegevens beheer', icon: 'Download' }
              ]?.map(tab => (
                <button
                  key={tab?.id}
                  type="button"
                  onClick={() => handleTabChange(tab?.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    activeTab === tab?.id
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
                >
                  <Icon name={tab?.icon} size={16} />
                  <span>{tab?.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            <div className="bg-card border border-border rounded-lg shadow-sm">
              {/* Success Message */}
              {successMessage && (
                <div className="m-6 mb-0 bg-green-50 border border-green-200 rounded-md p-3">
                  <div className="flex items-center space-x-2">
                    <Icon name="CheckCircle" size={16} color="#22c55e" />
                    <p className="text-sm text-green-800">{successMessage}</p>
                  </div>
                </div>
              )}

              {activeTab === 'persoonlijk' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Persoonlijke Gegevens
                  </h2>
                  
                  <form onSubmit={handlePersonalSubmit} className="space-y-6">
                    {/* Profile Image */}
                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        Profielfoto
                      </label>
                      <div className="flex items-center space-x-4">
                        <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center overflow-hidden">
                          {profileImagePreview ? (
                            <img
                              src={profileImagePreview}
                              alt="Profiel preview"
                              className="w-20 h-20 object-cover"
                            />
                          ) : (
                            <Icon name="User" size={32} color="var(--color-muted-foreground)" />
                          )}
                        </div>
                        <div>
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleProfileImageChange}
                            className="hidden"
                            id="profile-image"
                          />
                          <label htmlFor="profile-image">
                            <Button type="button" variant="outline" size="sm" className="cursor-pointer">
                              <Icon name="Upload" size={16} className="mr-2" />
                              Foto uploaden
                            </Button>
                          </label>
                          <p className="text-xs text-muted-foreground mt-1">
                            JPG, PNG max 2MB
                          </p>
                        </div>
                      </div>
                      {errors?.profileImage && (
                        <p className="text-sm text-destructive mt-1">{errors?.profileImage}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Volledige naam"
                        name="fullName"
                        value={formData?.fullName}
                        onChange={handleFormChange}
                        placeholder="Voor- en achternaam"
                        required
                        disabled={isLoading}
                        error={errors?.fullName}
                      />

                      <Input
                        label="E-mailadres"
                        type="email"
                        name="email"
                        value={formData?.email}
                        onChange={handleFormChange}
                        placeholder="je@voorbeeld.nl"
                        required
                        disabled={isLoading}
                        error={errors?.email}
                      />
                    </div>

                    {errors?.general && (
                      <div className="bg-destructive/10 border border-destructive/20 rounded-md p-3">
                        <p className="text-sm text-destructive">{errors?.general}</p>
                      </div>
                    )}

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Opslaan...' : 'Wijzigingen Opslaan'}
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'bedrijf' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Bedrijfsgegevens
                  </h2>
                  
                  <form onSubmit={handlePersonalSubmit} className="space-y-4">
                    <Input
                      label="Bedrijfsnaam"
                      name="companyName"
                      value={formData?.companyName}
                      onChange={handleFormChange}
                      placeholder="Jouw bedrijfsnaam"
                      required
                      disabled={isLoading}
                      error={errors?.companyName}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="KvK nummer"
                        name="kvkNumber"
                        value={formData?.kvkNumber}
                        onChange={handleFormChange}
                        placeholder="12345678"
                        required
                        disabled={isLoading}
                        error={errors?.kvkNumber}
                        maxLength="8"
                      />

                      <Input
                        label="BTW nummer (optioneel)"
                        name="btwNumber"
                        value={formData?.btwNumber}
                        onChange={handleFormChange}
                        placeholder="NL123456789B01"
                        disabled={isLoading}
                        error={errors?.btwNumber}
                      />
                    </div>

                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Opslaan...' : 'Bedrijfsgegevens Opslaan'}
                    </Button>
                  </form>
                </div>
              )}

              {activeTab === 'voorkeuren' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Voorkeuren
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Language & Format Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Taal en Format
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Taal
                          </label>
                          <select
                            name="language"
                            value={preferences?.language}
                            onChange={handlePreferencesChange}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="nl">Nederlands</option>
                            <option value="en">English</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Valuta
                          </label>
                          <select
                            name="currency"
                            value={preferences?.currency}
                            onChange={handlePreferencesChange}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="EUR">Euro (€)</option>
                            <option value="USD">Dollar ($)</option>
                            <option value="GBP">Pond (£)</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-foreground mb-2">
                            Datum format
                          </label>
                          <select
                            name="dateFormat"
                            value={preferences?.dateFormat}
                            onChange={handlePreferencesChange}
                            className="w-full px-3 py-2 border border-border rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                          >
                            <option value="DD-MM-YYYY">DD-MM-YYYY</option>
                            <option value="MM-DD-YYYY">MM-DD-YYYY</option>
                            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Notification Settings */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Notificaties
                      </h3>
                      
                      <div className="space-y-3">
                        <Checkbox
                          name="emailNotifications"
                          checked={preferences?.emailNotifications}
                          onChange={handlePreferencesChange}
                          label="E-mail notificaties ontvangen"
                        />
                        <Checkbox
                          name="invoiceReminders"
                          checked={preferences?.invoiceReminders}
                          onChange={handlePreferencesChange}
                          label="Factuur herinneringen"
                        />
                        <Checkbox
                          name="paymentConfirmations"
                          checked={preferences?.paymentConfirmations}
                          onChange={handlePreferencesChange}
                          label="Betalingsbevestigingen"
                        />
                        <Checkbox
                          name="taxDeadlineAlerts"
                          checked={preferences?.taxDeadlineAlerts}
                          onChange={handlePreferencesChange}
                          label="Belastingdeadline waarschuwingen"
                        />
                        <Checkbox
                          name="systemUpdates"
                          checked={preferences?.systemUpdates}
                          onChange={handlePreferencesChange}
                          label="Systeem updates en nieuws"
                        />
                      </div>
                    </div>

                    <Button type="button">
                      Voorkeuren Opslaan
                    </Button>
                  </div>
                </div>
              )}

              {activeTab === 'beveiliging' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Beveiliging
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Password Change */}
                    <form onSubmit={handleSecuritySubmit} className="space-y-4">
                      <h3 className="text-lg font-medium text-foreground">
                        Wachtwoord wijzigen
                      </h3>
                      
                      <Input
                        label="Huidig wachtwoord"
                        type="password"
                        name="currentPassword"
                        value={security?.currentPassword}
                        onChange={handleSecurityChange}
                        placeholder="Je huidige wachtwoord"
                        disabled={isLoading}
                        error={errors?.currentPassword}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                          label="Nieuw wachtwoord"
                          type="password"
                          name="newPassword"
                          value={security?.newPassword}
                          onChange={handleSecurityChange}
                          placeholder="Minimaal 6 tekens"
                          disabled={isLoading}
                          error={errors?.newPassword}
                        />

                        <Input
                          label="Bevestig nieuw wachtwoord"
                          type="password"
                          name="confirmPassword"
                          value={security?.confirmPassword}
                          onChange={handleSecurityChange}
                          placeholder="Herhaal nieuw wachtwoord"
                          disabled={isLoading}
                          error={errors?.confirmPassword}
                        />
                      </div>

                      <Button type="submit" disabled={isLoading}>
                        {isLoading ? 'Opslaan...' : 'Wachtwoord Wijzigen'}
                      </Button>
                    </form>

                    {/* Two-Factor Authentication */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Twee-factor authenticatie
                      </h3>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                        <div>
                          <h4 className="font-medium text-foreground">
                            SMS Authenticatie
                          </h4>
                          <p className="text-sm text-muted-foreground">
                            Extra beveiliging via SMS-codes
                          </p>
                        </div>
                        <Checkbox
                          name="twoFactorEnabled"
                          checked={security?.twoFactorEnabled}
                          onChange={handleSecurityChange}
                          label=""
                        />
                      </div>
                    </div>

                    {/* Active Sessions */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Actieve sessies
                      </h3>
                      
                      <div className="space-y-3">
                        {sessions?.map(session => (
                          <div key={session?.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-md">
                            <div>
                              <div className="flex items-center space-x-2">
                                <h4 className="font-medium text-foreground">
                                  {session?.device}
                                </h4>
                                {session?.current && (
                                  <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                    Huidige sessie
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-muted-foreground">
                                {session?.browser} • {session?.location}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                Laatst actief: {session?.lastActive}
                              </p>
                            </div>
                            {!session?.current && (
                              <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                onClick={() => handleRevokeSession(session?.id)}
                              >
                                Beëindigen
                              </Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'integraties' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Integraties
                  </h2>
                  
                  <div className="space-y-4">
                    {/* Bank Connections */}
                    <div className="p-4 border border-border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon name="Building" size={24} color="var(--color-primary)" />
                          <div>
                            <h3 className="font-medium text-foreground">
                              Bankverbindingen
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Beheer je aangesloten bankrekeningen
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Beheren
                        </Button>
                      </div>
                    </div>

                    {/* API Access */}
                    <div className="p-4 border border-border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon name="Code" size={24} color="var(--color-primary)" />
                          <div>
                            <h3 className="font-medium text-foreground">
                              API Toegang
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Genereer API tokens voor externe applicaties
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Tokens beheren
                        </Button>
                      </div>
                    </div>

                    {/* Third-party Services */}
                    <div className="p-4 border border-border rounded-md">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Icon name="Zap" size={24} color="var(--color-primary)" />
                          <div>
                            <h3 className="font-medium text-foreground">
                              Externe Diensten
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              Verbind met boekhoudpakketten en tools
                            </p>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          Verbinden
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'gegevens' && (
                <div className="p-6">
                  <h2 className="text-xl font-semibold text-foreground mb-6">
                    Gegevens Beheer
                  </h2>
                  
                  <div className="space-y-6">
                    {/* Data Export */}
                    <div>
                      <h3 className="text-lg font-medium text-foreground mb-4">
                        Gegevens Exporteren
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Download een kopie van al je gegevens in JSON formaat.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleExportData}
                      >
                        <Icon name="Download" size={16} className="mr-2" />
                        Gegevens Exporteren
                      </Button>
                    </div>

                    {/* Account Deletion */}
                    <div className="pt-6 border-t border-border">
                      <h3 className="text-lg font-medium text-destructive mb-4">
                        Account Verwijderen
                      </h3>
                      <p className="text-sm text-muted-foreground mb-4">
                        Permanent verwijderen van je account en alle bijbehorende gegevens. 
                        Deze actie kan niet ongedaan worden gemaakt.
                      </p>
                      <Button variant="destructive">
                        <Icon name="Trash2" size={16} className="mr-2" />
                        Account Verwijderen
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfileManagement;