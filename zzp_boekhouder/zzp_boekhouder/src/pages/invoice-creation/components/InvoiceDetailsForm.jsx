import React from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const InvoiceDetailsForm = ({ invoiceData, onInvoiceDataChange }) => {
  const paymentTermOptions = [
    { value: '14', label: '14 dagen' },
    { value: '30', label: '30 dagen' },
    { value: '60', label: '60 dagen' },
    { value: '90', label: '90 dagen' }
  ];

  const handleInputChange = (field, value) => {
    onInvoiceDataChange({
      ...invoiceData,
      [field]: value
    });
  };

  // Generate next invoice number
  const generateInvoiceNumber = () => {
    const year = new Date()?.getFullYear();
    const month = String(new Date()?.getMonth() + 1)?.padStart(2, '0');
    const sequence = String(Math.floor(Math.random() * 1000) + 1)?.padStart(3, '0');
    return `${year}${month}-${sequence}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Factuurnummer"
          type="text"
          value={invoiceData?.number || generateInvoiceNumber()}
          onChange={(e) => handleInputChange('number', e?.target?.value)}
          placeholder="2024-001"
          required
        />
        
        <Input
          label="Factuurdatum"
          type="date"
          value={invoiceData?.date || new Date()?.toISOString()?.split('T')?.[0]}
          onChange={(e) => handleInputChange('date', e?.target?.value)}
          required
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Vervaldatum"
          type="date"
          value={invoiceData?.dueDate}
          onChange={(e) => handleInputChange('dueDate', e?.target?.value)}
          required
        />
        
        <Select
          label="Betalingstermijn"
          options={paymentTermOptions}
          value={invoiceData?.paymentTerm || '30'}
          onChange={(value) => handleInputChange('paymentTerm', value)}
          placeholder="Selecteer termijn"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Project/Referentie"
          type="text"
          value={invoiceData?.reference}
          onChange={(e) => handleInputChange('reference', e?.target?.value)}
          placeholder="Projectnaam of referentie"
        />
        
        <Input
          label="PO Nummer"
          type="text"
          value={invoiceData?.poNumber}
          onChange={(e) => handleInputChange('poNumber', e?.target?.value)}
          placeholder="Inkoopordernummer (optioneel)"
        />
      </div>
      <div>
        <Input
          label="Opmerkingen"
          type="text"
          value={invoiceData?.notes}
          onChange={(e) => handleInputChange('notes', e?.target?.value)}
          placeholder="Aanvullende opmerkingen voor de klant"
          description="Deze tekst verschijnt onderaan de factuur"
        />
      </div>
    </div>
  );
};

export default InvoiceDetailsForm;