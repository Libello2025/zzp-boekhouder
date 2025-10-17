import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import QuickActionWidget from '../../components/ui/QuickActionWidget';
import AIChatWidget from '../../components/ui/AIChatWidget';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

// Import components
import ClientSelector from './components/ClientSelector';
import InvoiceDetailsForm from './components/InvoiceDetailsForm';
import LineItemsTable from './components/LineItemsTable';
import TemplateSelector from './components/TemplateSelector';
import InvoicePreview from './components/InvoicePreview';
import InvoiceActions from './components/InvoiceActions';

const InvoiceCreation = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [selectedClient, setSelectedClient] = useState('');
  const [invoiceData, setInvoiceData] = useState({
    number: '',
    date: new Date()?.toISOString()?.split('T')?.[0],
    dueDate: '',
    paymentTerm: '30',
    reference: '',
    poNumber: '',
    notes: ''
  });
  const [lineItems, setLineItems] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState('prof-1');
  const [customization, setCustomization] = useState({
    primaryColor: '#1E3A5F',
    logoPosition: 'left',
    showQRCode: true,
    showSignature: false
  });

  // Calculate due date when payment term changes
  useEffect(() => {
    if (invoiceData?.date && invoiceData?.paymentTerm) {
      const invoiceDate = new Date(invoiceData.date);
      const dueDate = new Date(invoiceDate);
      dueDate?.setDate(dueDate?.getDate() + parseInt(invoiceData?.paymentTerm));
      
      setInvoiceData(prev => ({
        ...prev,
        dueDate: dueDate?.toISOString()?.split('T')?.[0]
      }));
    }
  }, [invoiceData?.date, invoiceData?.paymentTerm]);

  // Add initial line item
  useEffect(() => {
    if (lineItems?.length === 0) {
      setLineItems([{
        id: Date.now(),
        description: '',
        quantity: 1,
        rate: 0,
        vatRate: '21',
        amount: 0
      }]);
    }
  }, []);

  const tabs = [
    { id: 'details', label: 'Factuurgegevens', icon: 'FileText' },
    { id: 'items', label: 'Factuurregels', icon: 'List' },
    { id: 'template', label: 'Template', icon: 'Palette' },
    { id: 'preview', label: 'Voorbeeld', icon: 'Eye' }
  ];

  const handleAddClient = () => {
    console.log('Add new client functionality');
  };

  const handleSave = (type) => {
    console.log(`Saving invoice as ${type}:`, {
      client: selectedClient,
      invoice: invoiceData,
      items: lineItems,
      template: selectedTemplate,
      customization
    });
  };

  const handleSend = (emailData) => {
    console.log('Sending invoice:', emailData);
  };

  const handlePreview = () => {
    setActiveTab('preview');
  };

  const isValid = selectedClient && invoiceData?.number && lineItems?.some(item => item?.description && item?.amount > 0);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={sidebarCollapsed} 
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)} 
      />
      <main className={`transition-all duration-300 ease-out pt-16 ${
        sidebarCollapsed ? 'ml-16' : 'ml-60'
      }`}>
        <div className="p-6">
          {/* Page Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={20} color="white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-foreground">Nieuwe Factuur</h1>
                <p className="text-muted-foreground">Maak een professionele factuur voor je klant</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                iconName="ArrowLeft"
                iconPosition="left"
                iconSize={16}
                onClick={() => window.history?.back()}
              >
                Terug
              </Button>
              <Button
                variant="outline"
                iconName="HelpCircle"
                iconSize={16}
              />
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="CheckCircle" size={16} className={selectedClient ? 'text-success' : 'text-muted-foreground'} />
              <span className={`text-sm ${selectedClient ? 'text-success' : 'text-muted-foreground'}`}>
                Klant geselecteerd
              </span>
              
              <div className={`w-8 h-0.5 ${selectedClient ? 'bg-success' : 'bg-muted'}`} />
              
              <Icon name="CheckCircle" size={16} className={lineItems?.some(item => item?.description) ? 'text-success' : 'text-muted-foreground'} />
              <span className={`text-sm ${lineItems?.some(item => item?.description) ? 'text-success' : 'text-muted-foreground'}`}>
                Factuurregels toegevoegd
              </span>
              
              <div className={`w-8 h-0.5 ${lineItems?.some(item => item?.description) ? 'bg-success' : 'bg-muted'}`} />
              
              <Icon name="CheckCircle" size={16} className={isValid ? 'text-success' : 'text-muted-foreground'} />
              <span className={`text-sm ${isValid ? 'text-success' : 'text-muted-foreground'}`}>
                Klaar om te versturen
              </span>
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* Left Column - Form Content */}
            <div className="xl:col-span-2 space-y-6">
              {/* Tab Navigation */}
              <div className="flex space-x-1 bg-muted p-1 rounded-lg">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 ${
                      activeTab === tab?.id
                        ? 'bg-card text-foreground shadow-elevation-1'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <Icon name={tab?.icon} size={16} />
                    <span>{tab?.label}</span>
                  </button>
                ))}
              </div>

              {/* Tab Content */}
              <div className="bg-card border border-border rounded-lg p-6">
                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <ClientSelector
                      selectedClient={selectedClient}
                      onClientChange={setSelectedClient}
                      onAddClient={handleAddClient}
                    />
                    <InvoiceDetailsForm
                      invoiceData={invoiceData}
                      onInvoiceDataChange={setInvoiceData}
                    />
                  </div>
                )}

                {activeTab === 'items' && (
                  <LineItemsTable
                    lineItems={lineItems}
                    onLineItemsChange={setLineItems}
                  />
                )}

                {activeTab === 'template' && (
                  <TemplateSelector
                    selectedTemplate={selectedTemplate}
                    onTemplateChange={setSelectedTemplate}
                    customization={customization}
                    onCustomizationChange={setCustomization}
                  />
                )}

                {activeTab === 'preview' && (
                  <div className="xl:hidden">
                    <InvoicePreview
                      invoiceData={invoiceData}
                      lineItems={lineItems}
                      selectedClient={selectedClient}
                      selectedTemplate={selectedTemplate}
                      customization={customization}
                    />
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between">
                <Button
                  variant="outline"
                  iconName="ChevronLeft"
                  iconPosition="left"
                  iconSize={16}
                  onClick={() => {
                    const currentIndex = tabs?.findIndex(tab => tab?.id === activeTab);
                    if (currentIndex > 0) {
                      setActiveTab(tabs?.[currentIndex - 1]?.id);
                    }
                  }}
                  disabled={activeTab === 'details'}
                >
                  Vorige
                </Button>
                
                <div className="flex items-center space-x-2">
                  {tabs?.map((tab, index) => (
                    <div
                      key={tab?.id}
                      className={`w-2 h-2 rounded-full ${
                        activeTab === tab?.id ? 'bg-primary' : 'bg-muted'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  iconName="ChevronRight"
                  iconPosition="right"
                  iconSize={16}
                  onClick={() => {
                    const currentIndex = tabs?.findIndex(tab => tab?.id === activeTab);
                    if (currentIndex < tabs?.length - 1) {
                      setActiveTab(tabs?.[currentIndex + 1]?.id);
                    }
                  }}
                  disabled={activeTab === 'preview'}
                >
                  Volgende
                </Button>
              </div>
            </div>

            {/* Right Column - Preview & Actions */}
            <div className="space-y-6">
              {/* Live Preview (Desktop Only) */}
              <div className="hidden xl:block">
                <InvoicePreview
                  invoiceData={invoiceData}
                  lineItems={lineItems}
                  selectedClient={selectedClient}
                  selectedTemplate={selectedTemplate}
                  customization={customization}
                />
              </div>

              {/* Actions */}
              <InvoiceActions
                onSave={handleSave}
                onSend={handleSend}
                onPreview={handlePreview}
                isValid={isValid}
              />
            </div>
          </div>
        </div>
      </main>
      <QuickActionWidget />
      <AIChatWidget />
    </div>
  );
};

export default InvoiceCreation;