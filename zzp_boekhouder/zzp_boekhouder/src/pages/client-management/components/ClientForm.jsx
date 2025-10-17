import React, { useState, useEffect } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ClientForm = ({ client, onSave, onCancel, isOpen }) => {
  const [formData, setFormData] = useState({
    name: '',
    kvkNumber: '',
    vatNumber: '',
    contactPerson: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      houseNumber: '',
      postalCode: '',
      city: '',
      country: 'Nederland'
    },
    paymentTerms: 30,
    status: 'active',
    notes: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (client) {
      setFormData(client);
    } else {
      setFormData({
        name: '',
        kvkNumber: '',
        vatNumber: '',
        contactPerson: '',
        email: '',
        phone: '',
        website: '',
        address: {
          street: '',
          houseNumber: '',
          postalCode: '',
          city: '',
          country: 'Nederland'
        },
        paymentTerms: 30,
        status: 'active',
        notes: ''
      });
    }
    setErrors({});
  }, [client, isOpen]);

  const paymentTermsOptions = [
    { value: 14, label: '14 dagen' },
    { value: 30, label: '30 dagen' },
    { value: 60, label: '60 dagen' },
    { value: 90, label: '90 dagen' }
  ];

  const statusOptions = [
    { value: 'active', label: 'Actief' },
    { value: 'inactive', label: 'Inactief' }
  ];

  const countryOptions = [
    { value: 'Nederland', label: 'Nederland' },
    { value: 'België', label: 'België' },
    { value: 'Duitsland', label: 'Duitsland' },
    { value: 'Frankrijk', label: 'Frankrijk' }
  ];

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.name?.trim()) {
      newErrors.name = 'Bedrijfsnaam is verplicht';
    }

    if (!formData?.contactPerson?.trim()) {
      newErrors.contactPerson = 'Contactpersoon is verplicht';
    }

    if (!formData?.email?.trim()) {
      newErrors.email = 'Email is verplicht';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/?.test(formData?.email)) {
      newErrors.email = 'Ongeldig email adres';
    }

    if (formData?.kvkNumber && !/^\d{8}$/?.test(formData?.kvkNumber?.replace(/\s/g, ''))) {
      newErrors.kvkNumber = 'KvK nummer moet 8 cijfers bevatten';
    }

    if (formData?.vatNumber && !/^NL\d{9}B\d{2}$/?.test(formData?.vatNumber?.replace(/\s/g, ''))) {
      newErrors.vatNumber = 'BTW nummer moet het formaat NL123456789B01 hebben';
    }

    if (formData?.address?.postalCode && !/^\d{4}\s?[A-Z]{2}$/i?.test(formData?.address?.postalCode)) {
      newErrors.postalCode = 'Postcode moet het formaat 1234AB hebben';
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev?.[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSave({
        ...formData,
        id: client?.id || Date.now(),
        createdAt: client?.createdAt || new Date()?.toISOString(),
        updatedAt: new Date()?.toISOString()
      });
    } catch (error) {
      console.error('Error saving client:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {client ? 'Klant bewerken' : 'Nieuwe klant toevoegen'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onCancel}
            iconName="X"
            iconSize={20}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Bedrijfsgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Bedrijfsnaam"
                type="text"
                value={formData?.name}
                onChange={(e) => handleInputChange('name', e?.target?.value)}
                error={errors?.name}
                required
                placeholder="Bijv. Acme BV"
              />
              
              <Input
                label="KvK nummer"
                type="text"
                value={formData?.kvkNumber}
                onChange={(e) => handleInputChange('kvkNumber', e?.target?.value)}
                error={errors?.kvkNumber}
                placeholder="12345678"
                description="8 cijfers"
              />
            </div>

            <Input
              label="BTW nummer"
              type="text"
              value={formData?.vatNumber}
              onChange={(e) => handleInputChange('vatNumber', e?.target?.value)}
              error={errors?.vatNumber}
              placeholder="NL123456789B01"
              description="Optioneel, formaat: NL123456789B01"
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Contactgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Contactpersoon"
                type="text"
                value={formData?.contactPerson}
                onChange={(e) => handleInputChange('contactPerson', e?.target?.value)}
                error={errors?.contactPerson}
                required
                placeholder="Voor- en achternaam"
              />
              
              <Input
                label="Email adres"
                type="email"
                value={formData?.email}
                onChange={(e) => handleInputChange('email', e?.target?.value)}
                error={errors?.email}
                required
                placeholder="contact@bedrijf.nl"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Telefoonnummer"
                type="tel"
                value={formData?.phone}
                onChange={(e) => handleInputChange('phone', e?.target?.value)}
                placeholder="+31 6 12345678"
              />
              
              <Input
                label="Website"
                type="url"
                value={formData?.website}
                onChange={(e) => handleInputChange('website', e?.target?.value)}
                placeholder="https://www.bedrijf.nl"
              />
            </div>
          </div>

          {/* Address Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Adresgegevens</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <Input
                  label="Straatnaam"
                  type="text"
                  value={formData?.address?.street}
                  onChange={(e) => handleInputChange('address.street', e?.target?.value)}
                  placeholder="Hoofdstraat"
                />
              </div>
              
              <Input
                label="Huisnummer"
                type="text"
                value={formData?.address?.houseNumber}
                onChange={(e) => handleInputChange('address.houseNumber', e?.target?.value)}
                placeholder="123A"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Input
                label="Postcode"
                type="text"
                value={formData?.address?.postalCode}
                onChange={(e) => handleInputChange('address.postalCode', e?.target?.value)}
                error={errors?.postalCode}
                placeholder="1234AB"
              />
              
              <Input
                label="Plaats"
                type="text"
                value={formData?.address?.city}
                onChange={(e) => handleInputChange('address.city', e?.target?.value)}
                placeholder="Amsterdam"
              />
              
              <Select
                label="Land"
                options={countryOptions}
                value={formData?.address?.country}
                onChange={(value) => handleInputChange('address.country', value)}
              />
            </div>
          </div>

          {/* Business Settings */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">Zakelijke instellingen</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Select
                label="Betalingstermijn"
                options={paymentTermsOptions}
                value={formData?.paymentTerms}
                onChange={(value) => handleInputChange('paymentTerms', value)}
                description="Standaard betalingstermijn voor facturen"
              />
              
              <Select
                label="Status"
                options={statusOptions}
                value={formData?.status}
                onChange={(value) => handleInputChange('status', value)}
              />
            </div>

            <Input
              label="Notities"
              type="text"
              value={formData?.notes}
              onChange={(e) => handleInputChange('notes', e?.target?.value)}
              placeholder="Aanvullende informatie over deze klant..."
              description="Optioneel"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-3 pt-6 border-t border-border">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              loading={isSubmitting}
              iconName="Save"
              iconPosition="left"
            >
              {client ? 'Wijzigingen opslaan' : 'Klant toevoegen'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ClientForm;