import React from 'react';
import Icon from '../../../components/AppIcon';


const InvoicePreview = ({ invoiceData, lineItems, selectedClient, selectedTemplate, customization }) => {
  const calculateTotals = () => {
    const subtotal = lineItems?.reduce((sum, item) => sum + (item?.amount || 0), 0);
    const vatAmounts = lineItems?.reduce((acc, item) => {
      const vatRate = parseFloat(item?.vatRate || 0);
      const vatAmount = (item?.amount || 0) * (vatRate / 100);
      acc[vatRate] = (acc?.[vatRate] || 0) + vatAmount;
      return acc;
    }, {});
    
    const totalVat = Object.values(vatAmounts)?.reduce((sum, amount) => sum + amount, 0);
    const total = subtotal + totalVat;

    return { subtotal, vatAmounts, totalVat, total };
  };

  const totals = calculateTotals();
  const primaryColor = customization?.primaryColor || '#1E3A5F';

  const clientData = {
    'client-1': { name: 'TechCorp B.V.', address: 'Hoofdstraat 123\n1012 AB Amsterdam', vat: 'NL123456789B01' },
    'client-2': { name: 'Design Studio Amsterdam', address: 'Prinsengracht 456\n1016 HK Amsterdam', vat: 'NL987654321B01' },
    'client-3': { name: 'Marketing Plus B.V.', address: 'Damrak 789\n1012 LM Amsterdam', vat: 'NL456789123B01' }
  };

  const client = clientData?.[selectedClient] || { name: 'Selecteer een klant', address: '', vat: '' };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Preview Header */}
      <div className="bg-muted px-4 py-3 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-foreground">Live Voorbeeld</h3>
          <div className="flex items-center space-x-2">
            <Icon name="Eye" size={16} className="text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Template: {selectedTemplate || 'Geen'}</span>
          </div>
        </div>
      </div>
      {/* Invoice Preview Content */}
      <div className="p-6 bg-white text-gray-900 min-h-[600px]">
        {/* Header Section */}
        <div className="flex justify-between items-start mb-8">
          <div className={`${customization?.logoPosition === 'center' ? 'mx-auto' : customization?.logoPosition === 'right' ? 'ml-auto' : ''}`}>
            <div className="w-16 h-16 rounded-lg flex items-center justify-center mb-2" style={{ backgroundColor: primaryColor }}>
              <Icon name="Calculator" size={24} color="white" />
            </div>
            <div className="space-y-1">
              <h1 className="text-xl font-bold" style={{ color: primaryColor }}>ZZP Boekhouder</h1>
              <p className="text-sm text-gray-600">Jan Janssen</p>
              <p className="text-sm text-gray-600">Keizersgracht 123</p>
              <p className="text-sm text-gray-600">1015 CJ Amsterdam</p>
              <p className="text-sm text-gray-600">BTW: NL001234567B01</p>
            </div>
          </div>
          
          <div className="text-right">
            <h2 className="text-2xl font-bold mb-2" style={{ color: primaryColor }}>FACTUUR</h2>
            <div className="space-y-1 text-sm">
              <p><span className="font-medium">Nummer:</span> {invoiceData?.number || '2024-001'}</p>
              <p><span className="font-medium">Datum:</span> {invoiceData?.date ? new Date(invoiceData.date)?.toLocaleDateString('nl-NL') : new Date()?.toLocaleDateString('nl-NL')}</p>
              <p><span className="font-medium">Vervaldatum:</span> {invoiceData?.dueDate ? new Date(invoiceData.dueDate)?.toLocaleDateString('nl-NL') : 'Niet ingesteld'}</p>
            </div>
          </div>
        </div>

        {/* Client Information */}
        <div className="mb-8">
          <h3 className="font-medium mb-2" style={{ color: primaryColor }}>Factuuradres:</h3>
          <div className="bg-gray-50 p-4 rounded">
            <p className="font-medium">{client?.name}</p>
            <p className="text-sm text-gray-600 whitespace-pre-line">{client?.address}</p>
            {client?.vat && <p className="text-sm text-gray-600">BTW: {client?.vat}</p>}
          </div>
        </div>

        {/* Line Items */}
        <div className="mb-8">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b-2" style={{ borderColor: primaryColor }}>
                <th className="text-left py-2 font-medium" style={{ color: primaryColor }}>Omschrijving</th>
                <th className="text-center py-2 font-medium w-20" style={{ color: primaryColor }}>Aantal</th>
                <th className="text-right py-2 font-medium w-24" style={{ color: primaryColor }}>Tarief</th>
                <th className="text-center py-2 font-medium w-20" style={{ color: primaryColor }}>BTW</th>
                <th className="text-right py-2 font-medium w-24" style={{ color: primaryColor }}>Bedrag</th>
              </tr>
            </thead>
            <tbody>
              {lineItems?.length > 0 ? lineItems?.map((item, index) => (
                <tr key={item?.id} className="border-b border-gray-200">
                  <td className="py-3">{item?.description || 'Omschrijving'}</td>
                  <td className="py-3 text-center">{item?.quantity || 0}</td>
                  <td className="py-3 text-right">€{(item?.rate || 0)?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</td>
                  <td className="py-3 text-center">{item?.vatRate || 21}%</td>
                  <td className="py-3 text-right font-medium">€{(item?.amount || 0)?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan="5" className="py-8 text-center text-gray-500">
                    Geen factuurregels toegevoegd
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals */}
        {lineItems?.length > 0 && (
          <div className="flex justify-end mb-8">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span>Subtotaal:</span>
                <span>€{totals?.subtotal?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
              
              {Object.entries(totals?.vatAmounts)?.map(([rate, amount]) => (
                <div key={rate} className="flex justify-between">
                  <span>BTW {rate}%:</span>
                  <span>€{amount?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
                </div>
              ))}
              
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-300" style={{ color: primaryColor }}>
                <span>Totaal:</span>
                <span>€{totals?.total?.toLocaleString('nl-NL', { minimumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h3 className="font-medium mb-2" style={{ color: primaryColor }}>Betalingsinformatie:</h3>
            <div className="text-sm space-y-1">
              <p><span className="font-medium">IBAN:</span> NL91 ABNA 0417 1643 00</p>
              <p><span className="font-medium">BIC:</span> ABNANL2A</p>
              <p><span className="font-medium">Betalingstermijn:</span> {invoiceData?.paymentTerm || 30} dagen</p>
            </div>
          </div>
          
          {customization?.showQRCode && (
            <div className="flex justify-end">
              <div className="text-center">
                <div className="w-24 h-24 bg-gray-200 rounded flex items-center justify-center mb-2">
                  <Icon name="QrCode" size={32} className="text-gray-500" />
                </div>
                <p className="text-xs text-gray-600">Scan voor betaling</p>
              </div>
            </div>
          )}
        </div>

        {/* Notes */}
        {invoiceData?.notes && (
          <div className="mb-8">
            <h3 className="font-medium mb-2" style={{ color: primaryColor }}>Opmerkingen:</h3>
            <p className="text-sm text-gray-600">{invoiceData?.notes}</p>
          </div>
        )}

        {/* Signature Field */}
        {customization?.showSignature && (
          <div className="border-t border-gray-300 pt-8">
            <div className="flex justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-8">Handtekening klant:</p>
                <div className="border-b border-gray-300 w-48"></div>
              </div>
              <div>
                <p className="text-sm text-gray-600 mb-8">Datum:</p>
                <div className="border-b border-gray-300 w-32"></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoicePreview;