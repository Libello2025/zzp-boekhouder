import React, { useState } from 'react';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import Button from '../../../components/ui/Button';
import Icon from '../../../components/AppIcon';

const LineItemsTable = ({ lineItems, onLineItemsChange }) => {
  const vatRateOptions = [
    { value: '21', label: '21% (Hoog tarief)' },
    { value: '9', label: '9% (Laag tarief)' },
    { value: '0', label: '0% (Vrijgesteld)' }
  ];

  const addLineItem = () => {
    const newItem = {
      id: Date.now(),
      description: '',
      quantity: 1,
      rate: 0,
      vatRate: '21',
      amount: 0
    };
    onLineItemsChange([...lineItems, newItem]);
  };

  const removeLineItem = (id) => {
    onLineItemsChange(lineItems?.filter(item => item?.id !== id));
  };

  const updateLineItem = (id, field, value) => {
    const updatedItems = lineItems?.map(item => {
      if (item?.id === id) {
        const updatedItem = { ...item, [field]: value };
        
        // Calculate amount when quantity or rate changes
        if (field === 'quantity' || field === 'rate') {
          updatedItem.amount = (updatedItem?.quantity || 0) * (updatedItem?.rate || 0);
        }
        
        return updatedItem;
      }
      return item;
    });
    onLineItemsChange(updatedItems);
  };

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

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-foreground">Factuurregels</h3>
        <Button
          variant="outline"
          iconName="Plus"
          iconPosition="left"
          iconSize={16}
          onClick={addLineItem}
        >
          Regel Toevoegen
        </Button>
      </div>
      <div className="border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-3 text-sm font-medium text-muted-foreground">Omschrijving</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground w-24">Aantal</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground w-32">Tarief (€)</th>
                <th className="text-center p-3 text-sm font-medium text-muted-foreground w-32">BTW</th>
                <th className="text-right p-3 text-sm font-medium text-muted-foreground w-32">Bedrag (€)</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {lineItems?.map((item, index) => (
                <tr key={item?.id} className="border-t border-border">
                  <td className="p-3">
                    <Input
                      type="text"
                      value={item?.description}
                      onChange={(e) => updateLineItem(item?.id, 'description', e?.target?.value)}
                      placeholder="Beschrijving van de dienst of product"
                      className="border-0 bg-transparent p-0 focus:ring-0"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={item?.quantity}
                      onChange={(e) => updateLineItem(item?.id, 'quantity', parseFloat(e?.target?.value) || 0)}
                      min="0"
                      step="0.01"
                      className="border-0 bg-transparent p-0 text-center focus:ring-0"
                    />
                  </td>
                  <td className="p-3">
                    <Input
                      type="number"
                      value={item?.rate}
                      onChange={(e) => updateLineItem(item?.id, 'rate', parseFloat(e?.target?.value) || 0)}
                      min="0"
                      step="0.01"
                      className="border-0 bg-transparent p-0 text-right focus:ring-0"
                    />
                  </td>
                  <td className="p-3">
                    <Select
                      options={vatRateOptions}
                      value={item?.vatRate}
                      onChange={(value) => updateLineItem(item?.id, 'vatRate', value)}
                      className="border-0 bg-transparent"
                    />
                  </td>
                  <td className="p-3 text-right font-medium">
                    €{(item?.amount || 0)?.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td className="p-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeLineItem(item?.id)}
                      iconName="Trash2"
                      iconSize={16}
                      className="text-destructive hover:text-destructive"
                    />
                  </td>
                </tr>
              ))}
              {lineItems?.length === 0 && (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-muted-foreground">
                    <div className="space-y-2">
                      <Icon name="FileText" size={32} className="mx-auto opacity-50" />
                      <p>Geen factuurregels toegevoegd</p>
                      <p className="text-sm">Klik op "Regel Toevoegen" om te beginnen</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        {lineItems?.length > 0 && (
          <div className="border-t border-border bg-muted/50">
            <div className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotaal:</span>
                <span className="font-medium">€{totals?.subtotal?.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
              
              {Object.entries(totals?.vatAmounts)?.map(([rate, amount]) => (
                <div key={rate} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">BTW {rate}%:</span>
                  <span className="font-medium">€{amount?.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
              ))}
              
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                <span>Totaal:</span>
                <span>€{totals?.total?.toLocaleString('nl-NL', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LineItemsTable;