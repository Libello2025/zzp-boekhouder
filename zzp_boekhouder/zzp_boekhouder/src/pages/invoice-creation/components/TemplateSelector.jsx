import React, { useState } from 'react';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';

const TemplateSelector = ({ selectedTemplate, onTemplateChange, customization, onCustomizationChange }) => {
  const [activeCategory, setActiveCategory] = useState('professional');

  const templateCategories = [
  { id: 'professional', label: 'Professioneel', icon: 'Briefcase' },
  { id: 'modern', label: 'Modern', icon: 'Zap' },
  { id: 'creative', label: 'Creatief', icon: 'Palette' },
  { id: 'minimal', label: 'Minimaal', icon: 'Circle' }];


  const templates = {
    professional: [
    {
      id: 'prof-1',
      name: 'Corporate Blue',
      preview: "https://images.unsplash.com/photo-1676838111094-945a440d4f4d",
      previewAlt: 'Professional invoice template with blue header and clean layout',
      primaryColor: '#1E3A5F',
      features: ['Logo placement', 'QR-code', 'Handtekening veld']
    },
    {
      id: 'prof-2',
      name: 'Business Classic',
      preview: "https://images.unsplash.com/photo-1658157146592-b530d4070229",
      previewAlt: 'Classic business invoice template with gray header and structured layout',
      primaryColor: '#4A5568',
      features: ['Traditioneel', 'BTW overzicht', 'Betalingsinfo']
    },
    {
      id: 'prof-3',
      name: 'Executive Green',
      preview: "https://images.unsplash.com/photo-1716703373020-17ff360924ee",
      previewAlt: 'Executive invoice template with green accents and professional styling',
      primaryColor: '#38A169',
      features: ['Premium look', 'Uitgebreide footer', 'Logo integratie']
    }],

    modern: [
    {
      id: 'mod-1',
      name: 'Tech Orange',
      preview: "https://images.unsplash.com/photo-1656588360305-095657d15c6f",
      previewAlt: 'Modern tech invoice template with orange highlights and geometric design',
      primaryColor: '#E17B47',
      features: ['Geometrisch', 'QR-code', 'Modern font']
    },
    {
      id: 'mod-2',
      name: 'Digital Purple',
      preview: "https://images.unsplash.com/photo-1718357886069-6f9d24a09128",
      previewAlt: 'Digital invoice template with purple gradients and contemporary layout',
      primaryColor: '#805AD5',
      features: ['Gradient header', 'Icon set', 'Responsive']
    }],

    creative: [
    {
      id: 'cre-1',
      name: 'Artist Pink',
      preview: "https://images.unsplash.com/photo-1718357886069-6f9d24a09128",
      previewAlt: 'Creative invoice template with pink watercolor elements and artistic design',
      primaryColor: '#ED64A6',
      features: ['Watercolor', 'Artistiek', 'Uniek design']
    },
    {
      id: 'cre-2',
      name: 'Designer Teal',
      preview: "https://images.unsplash.com/photo-1660142106193-908a56b4af97",
      previewAlt: 'Designer invoice template with teal color scheme and creative typography',
      primaryColor: '#319795',
      features: ['Typography focus', 'Creatieve layout', 'Brand friendly']
    }],

    minimal: [
    {
      id: 'min-1',
      name: 'Clean White',
      preview: "https://images.unsplash.com/photo-1588713015632-454244741f2d",
      previewAlt: 'Minimal white invoice template with clean lines and simple typography',
      primaryColor: '#2D3748',
      features: ['Minimalistisch', 'Wit design', 'Focus op inhoud']
    },
    {
      id: 'min-2',
      name: 'Simple Gray',
      preview: "https://images.unsplash.com/photo-1633817268177-b5a0ae392217",
      previewAlt: 'Simple gray invoice template with minimal design and clear structure',
      primaryColor: '#718096',
      features: ['Eenvoudig', 'Grijstinten', 'Leesbaar']
    }]

  };

  const colorOptions = [
  { name: 'Navy', value: '#1E3A5F' },
  { name: 'Blue', value: '#4A90A4' },
  { name: 'Green', value: '#38A169' },
  { name: 'Orange', value: '#E17B47' },
  { name: 'Purple', value: '#805AD5' },
  { name: 'Pink', value: '#ED64A6' },
  { name: 'Teal', value: '#319795' },
  { name: 'Gray', value: '#718096' }];


  const handleCustomizationChange = (field, value) => {
    onCustomizationChange({
      ...customization,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex space-x-1 bg-muted p-1 rounded-lg">
        {templateCategories?.map((category) =>
        <button
          key={category?.id}
          onClick={() => setActiveCategory(category?.id)}
          className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
          activeCategory === category?.id ?
          'bg-card text-foreground shadow-elevation-1' :
          'text-muted-foreground hover:text-foreground'}`
          }>

            <Icon name={category?.icon} size={16} />
            <span>{category?.label}</span>
          </button>
        )}
      </div>
      {/* Template Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates?.[activeCategory]?.map((template) =>
        <div
          key={template?.id}
          className={`relative group cursor-pointer border-2 rounded-lg overflow-hidden transition-all duration-200 ${
          selectedTemplate === template?.id ?
          'border-primary shadow-elevation-2' :
          'border-border hover:border-primary/50'}`
          }
          onClick={() => onTemplateChange(template?.id)}>

            <div className="aspect-[3/4] overflow-hidden">
              <Image
              src={template?.preview}
              alt={template?.previewAlt}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />

            </div>
            
            <div className="p-3 bg-card">
              <h4 className="font-medium text-foreground mb-1">{template?.name}</h4>
              <div className="flex flex-wrap gap-1 mb-2">
                {template?.features?.map((feature, index) =>
              <span
                key={index}
                className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">

                    {feature}
                  </span>
              )}
              </div>
              <div className="flex items-center space-x-2">
                <div
                className="w-4 h-4 rounded-full border border-border"
                style={{ backgroundColor: template?.primaryColor }} />

                <span className="text-xs text-muted-foreground">Primaire kleur</span>
              </div>
            </div>

            {selectedTemplate === template?.id &&
          <div className="absolute top-2 right-2 bg-primary text-primary-foreground rounded-full p-1">
                <Icon name="Check" size={16} />
              </div>
          }
          </div>
        )}
      </div>
      {/* Customization Options */}
      {selectedTemplate &&
      <div className="border border-border rounded-lg p-4 space-y-4">
          <h3 className="font-medium text-foreground">Template Aanpassingen</h3>
          
          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Primaire Kleur
            </label>
            <div className="flex flex-wrap gap-2">
              {colorOptions?.map((color) =>
            <button
              key={color?.value}
              onClick={() => handleCustomizationChange('primaryColor', color?.value)}
              className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
              customization?.primaryColor === color?.value ?
              'border-foreground scale-110' :
              'border-border hover:scale-105'}`
              }
              style={{ backgroundColor: color?.value }}
              title={color?.name} />

            )}
            </div>
          </div>

          {/* Logo Position */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Logo Positie
            </label>
            <div className="flex space-x-2">
              {['left', 'center', 'right']?.map((position) =>
            <Button
              key={position}
              variant={customization?.logoPosition === position ? 'default' : 'outline'}
              size="sm"
              onClick={() => handleCustomizationChange('logoPosition', position)}>

                  {position === 'left' ? 'Links' : position === 'center' ? 'Midden' : 'Rechts'}
                </Button>
            )}
            </div>
          </div>

          {/* Additional Options */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
              type="checkbox"
              id="showQR"
              checked={customization?.showQRCode}
              onChange={(e) => handleCustomizationChange('showQRCode', e?.target?.checked)}
              className="rounded border-border" />

              <label htmlFor="showQR" className="text-sm text-foreground">
                QR-code tonen
              </label>
            </div>
            
            <div className="flex items-center space-x-2">
              <input
              type="checkbox"
              id="showSignature"
              checked={customization?.showSignature}
              onChange={(e) => handleCustomizationChange('showSignature', e?.target?.checked)}
              className="rounded border-border" />

              <label htmlFor="showSignature" className="text-sm text-foreground">
                Handtekening veld
              </label>
            </div>
          </div>
        </div>
      }
    </div>);

};

export default TemplateSelector;