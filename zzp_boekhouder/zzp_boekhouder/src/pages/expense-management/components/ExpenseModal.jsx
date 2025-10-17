import React, { useState, useRef } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Image from '../../../components/AppImage';

const ExpenseModal = ({ isOpen, onClose, expense = null, onSave }) => {
  const [formData, setFormData] = useState({
    date: expense?.date || new Date()?.toISOString()?.split('T')?.[0],
    description: expense?.description || '',
    amount: expense?.amount || '',
    category: expense?.category || '',
    vatRate: expense?.vatRate || 21,
    supplier: expense?.supplier || '',
    project: expense?.project || '',
    notes: expense?.notes || '',
    receipt: expense?.receipt || null
  });

  const [dragActive, setDragActive] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState(null);
  const fileInputRef = useRef(null);

  const categoryOptions = [
    { value: 'office', label: 'Kantoorbenodigdheden' },
    { value: 'travel', label: 'Reiskosten' },
    { value: 'marketing', label: 'Marketing & Reclame' },
    { value: 'software', label: 'Software & Licenties' },
    { value: 'equipment', label: 'Apparatuur' },
    { value: 'training', label: 'Training & Cursussen' },
    { value: 'meals', label: 'Maaltijden' },
    { value: 'utilities', label: 'Nutsvoorzieningen' },
    { value: 'other', label: 'Overige' }
  ];

  const vatRateOptions = [
    { value: 21, label: '21% (Hoog tarief)' },
    { value: 9, label: '9% (Laag tarief)' },
    { value: 0, label: '0% (Vrijgesteld)' }
  ];

  const projectOptions = [
    { value: '', label: 'Geen project' },
    { value: 'website-redesign', label: 'Website Redesign - TechCorp' },
    { value: 'mobile-app', label: 'Mobile App - StartupXYZ' },
    { value: 'consulting', label: 'Consulting - RetailCo' },
    { value: 'branding', label: 'Branding Project - CreativeAgency' }
  ];

  const supplierOptions = [
    { value: 'office-depot', label: 'Office Depot' },
    { value: 'ns', label: 'Nederlandse Spoorwegen' },
    { value: 'google', label: 'Google Ads' },
    { value: 'microsoft', label: 'Microsoft' },
    { value: 'apple', label: 'Apple Store' },
    { value: 'udemy', label: 'Udemy' },
    { value: 'restaurant-central', label: 'Restaurant Central' },
    { value: 'vattenfall', label: 'Vattenfall' },
    { value: 'other', label: 'Andere leverancier' }
  ];

  if (!isOpen) return null;

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Trigger AI suggestions when description changes
    if (field === 'description' && value?.length > 3) {
      simulateAISuggestions(value);
    }
  };

  const simulateAISuggestions = (description) => {
    const lowerDesc = description?.toLowerCase();
    let suggestions = null;

    if (lowerDesc?.includes('laptop') || lowerDesc?.includes('computer')) {
      suggestions = {
        category: 'equipment',
        vatRate: 21,
        confidence: 95,
        reason: 'Apparatuur wordt meestal gecategoriseerd als equipment met 21% BTW'
      };
    } else if (lowerDesc?.includes('trein') || lowerDesc?.includes('reis')) {
      suggestions = {
        category: 'travel',
        vatRate: 21,
        confidence: 90,
        reason: 'Reiskosten vallen onder de travel categorie'
      };
    } else if (lowerDesc?.includes('software') || lowerDesc?.includes('licentie')) {
      suggestions = {
        category: 'software',
        vatRate: 21,
        confidence: 98,
        reason: 'Software en licenties hebben standaard 21% BTW'
      };
    }

    setAiSuggestions(suggestions);
  };

  const applySuggestions = () => {
    if (aiSuggestions) {
      setFormData(prev => ({
        ...prev,
        category: aiSuggestions?.category,
        vatRate: aiSuggestions?.vatRate
      }));
      setAiSuggestions(null);
    }
  };

  const handleDrag = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (e?.type === 'dragenter' || e?.type === 'dragover') {
      setDragActive(true);
    } else if (e?.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setDragActive(false);
    
    if (e?.dataTransfer?.files && e?.dataTransfer?.files?.[0]) {
      handleFile(e?.dataTransfer?.files?.[0]);
    }
  };

  const handleFileInput = (e) => {
    if (e?.target?.files && e?.target?.files?.[0]) {
      handleFile(e?.target?.files?.[0]);
    }
  };

  const handleFile = (file) => {
    if (file?.type?.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          receipt: {
            file: file,
            preview: e?.target?.result,
            name: file?.name
          }
        }));
        
        // Simulate OCR processing
        setTimeout(() => {
          simulateOCRProcessing(file?.name);
        }, 1000);
      };
      reader?.readAsDataURL(file);
    }
  };

  const simulateOCRProcessing = (fileName) => {
    // Simulate OCR extracted data based on filename
    if (fileName?.toLowerCase()?.includes('albert')) {
      setFormData(prev => ({
        ...prev,
        description: prev?.description || 'Boodschappen Albert Heijn',
        amount: prev?.amount || '23.45',
        supplier: 'albert-heijn'
      }));
    } else if (fileName?.toLowerCase()?.includes('ns')) {
      setFormData(prev => ({
        ...prev,
        description: prev?.description || 'Treinreis Amsterdam - Utrecht',
        amount: prev?.amount || '8.90',
        supplier: 'ns',
        category: 'travel'
      }));
    }
  };

  const removeReceipt = () => {
    setFormData(prev => ({ ...prev, receipt: null }));
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">
            {expense ? 'Uitgave Bewerken' : 'Nieuwe Uitgave'}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form Fields */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label="Datum"
                    value={formData?.date}
                    onChange={(e) => handleInputChange('date', e?.target?.value)}
                    required
                  />
                  <Input
                    type="number"
                    label="Bedrag"
                    placeholder="0,00"
                    value={formData?.amount}
                    onChange={(e) => handleInputChange('amount', e?.target?.value)}
                    required
                    step="0.01"
                  />
                </div>

                <Input
                  type="text"
                  label="Beschrijving"
                  placeholder="Beschrijf de uitgave..."
                  value={formData?.description}
                  onChange={(e) => handleInputChange('description', e?.target?.value)}
                  required
                />

                {/* AI Suggestions */}
                {aiSuggestions && (
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                          <Icon name="Sparkles" size={16} className="text-primary" />
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-foreground mb-1">
                            AI Suggestie ({aiSuggestions?.confidence}% zekerheid)
                          </h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {aiSuggestions?.reason}
                          </p>
                          <div className="flex items-center space-x-4 text-xs">
                            <span>Categorie: <strong>{categoryOptions?.find(c => c?.value === aiSuggestions?.category)?.label}</strong></span>
                            <span>BTW: <strong>{aiSuggestions?.vatRate}%</strong></span>
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={applySuggestions}
                        >
                          Toepassen
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setAiSuggestions(null)}
                          iconName="X"
                          iconSize={14}
                        />
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label="Categorie"
                    options={categoryOptions}
                    value={formData?.category}
                    onChange={(value) => handleInputChange('category', value)}
                    placeholder="Selecteer categorie"
                    required
                  />
                  <Select
                    label="BTW Tarief"
                    options={vatRateOptions}
                    value={formData?.vatRate}
                    onChange={(value) => handleInputChange('vatRate', value)}
                    required
                  />
                </div>

                <Select
                  label="Leverancier"
                  options={supplierOptions}
                  value={formData?.supplier}
                  onChange={(value) => handleInputChange('supplier', value)}
                  placeholder="Selecteer leverancier"
                  searchable
                />

                <Select
                  label="Project (optioneel)"
                  options={projectOptions}
                  value={formData?.project}
                  onChange={(value) => handleInputChange('project', value)}
                  placeholder="Koppel aan project"
                />

                <Input
                  type="textarea"
                  label="Notities (optioneel)"
                  placeholder="Extra informatie..."
                  value={formData?.notes}
                  onChange={(e) => handleInputChange('notes', e?.target?.value)}
                  rows={3}
                />
              </div>

              {/* Right Column - Receipt Upload */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Bon/Receipt
                  </label>
                  
                  {formData?.receipt ? (
                    <div className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-foreground">
                          {formData?.receipt?.name}
                        </span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={removeReceipt}
                          iconName="Trash2"
                          iconSize={14}
                          className="text-destructive"
                        />
                      </div>
                      <div className="aspect-[3/4] bg-muted rounded-lg overflow-hidden">
                        <Image
                          src={formData?.receipt?.preview}
                          alt="Receipt preview showing uploaded document"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  ) : (
                    <div
                      className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                        dragActive
                          ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
                      }`}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >
                      <Icon name="Upload" size={48} className="text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-foreground mb-2">
                        Sleep je bon hierheen
                      </h3>
                      <p className="text-muted-foreground mb-4">
                        Of klik om een bestand te selecteren
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef?.current?.click()}
                        iconName="FileImage"
                        iconPosition="left"
                        iconSize={16}
                      >
                        Bestand Kiezen
                      </Button>
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <p className="text-xs text-muted-foreground mt-2">
                        Ondersteunde formaten: JPG, PNG, PDF (max 10MB)
                      </p>
                    </div>
                  )}
                </div>

                {/* OCR Processing Indicator */}
                {formData?.receipt && (
                  <div className="bg-muted/50 border border-border rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                      <Icon name="Scan" size={16} className="text-primary" />
                      <div>
                        <h4 className="text-sm font-medium text-foreground">
                          OCR Verwerking
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          Tekst wordt automatisch uitgelezen en ingevuld
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-border bg-muted/30">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Annuleren
          </Button>
          <Button
            type="submit"
            variant="default"
            onClick={handleSubmit}
            iconName="Save"
            iconPosition="left"
            iconSize={16}
          >
            {expense ? 'Bijwerken' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ExpenseModal;