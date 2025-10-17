import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Image from '../../../components/AppImage';

const ReceiptViewer = ({ isOpen, onClose, expense }) => {
  const [zoomLevel, setZoomLevel] = useState(1);
  const [showOCRData, setShowOCRData] = useState(false);

  if (!isOpen || !expense) return null;

  const mockOCRData = {
    merchantName: expense?.supplier || 'Albert Heijn',
    date: expense?.date,
    total: expense?.amount,
    items: [
      { description: 'Brood volkoren', quantity: 1, price: 2.49 },
      { description: 'Melk halfvol 1L', quantity: 2, price: 1.89 },
      { description: 'Bananen', quantity: 1.2, price: 2.38 },
      { description: 'Koffie', quantity: 1, price: 4.99 }
    ],
    vatBreakdown: {
      21: { amount: 8.76, vat: 1.84 },
      9: { amount: 2.99, vat: 0.27 }
    },
    confidence: 94
  };

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.25, 0.5));
  };

  const handleDownload = () => {
    // Simulate download functionality
    const link = document.createElement('a');
    link.href = expense?.receipt;
    link.download = `receipt-${expense?.id}.jpg`;
    link?.click();
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-1100 p-4">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-4">
            <h2 className="text-lg font-semibold text-foreground">
              Bon Weergave
            </h2>
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Icon name="Calendar" size={14} />
              <span>{new Date(expense.date)?.toLocaleDateString('nl-NL')}</span>
              <span>•</span>
              <span>{formatAmount(expense?.amount)}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowOCRData(!showOCRData)}
              iconName="FileText"
              iconPosition="left"
              iconSize={14}
            >
              {showOCRData ? 'Verberg' : 'Toon'} OCR Data
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              iconName="Download"
              iconSize={14}
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex h-[calc(90vh-80px)]">
          {/* Receipt Image */}
          <div className="flex-1 bg-muted/30 relative overflow-hidden">
            {/* Zoom Controls */}
            <div className="absolute top-4 right-4 z-10 flex items-center space-x-2 bg-card border border-border rounded-lg p-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 0.5}
                iconName="ZoomOut"
                iconSize={16}
              />
              <span className="text-sm font-medium text-foreground px-2">
                {Math.round(zoomLevel * 100)}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 3}
                iconName="ZoomIn"
                iconSize={16}
              />
            </div>

            {/* Image Container */}
            <div className="w-full h-full overflow-auto p-4">
              <div className="flex items-center justify-center min-h-full">
                <div
                  style={{ transform: `scale(${zoomLevel})` }}
                  className="transition-transform duration-200 origin-center"
                >
                  <Image
                    src={expense?.receipt || "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=600&fit=crop"}
                    alt="Receipt showing itemized purchase details with merchant name, date, items, and total amount"
                    className="max-w-none border border-border rounded-lg shadow-elevation-2"
                    style={{ width: '400px', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* OCR Data Panel */}
          {showOCRData && (
            <div className="w-80 border-l border-border bg-card overflow-y-auto">
              <div className="p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-foreground">OCR Gegevens</h3>
                  <div className="flex items-center space-x-1 text-sm">
                    <Icon name="CheckCircle" size={14} className="text-success" />
                    <span className="text-success font-medium">
                      {mockOCRData?.confidence}% nauwkeurig
                    </span>
                  </div>
                </div>

                {/* Merchant Info */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-foreground mb-2">
                    Leverancier
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    {mockOCRData?.merchantName}
                  </p>
                </div>

                {/* Items */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    Artikelen
                  </h4>
                  <div className="space-y-2">
                    {mockOCRData?.items?.map((item, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <div className="flex-1">
                          <p className="text-foreground">{item?.description}</p>
                          <p className="text-muted-foreground text-xs">
                            {item?.quantity}x
                          </p>
                        </div>
                        <span className="text-foreground font-medium">
                          {formatAmount(item?.price)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VAT Breakdown */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium text-foreground mb-3">
                    BTW Overzicht
                  </h4>
                  <div className="space-y-2">
                    {Object.entries(mockOCRData?.vatBreakdown)?.map(([rate, data]) => (
                      <div key={rate} className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          {rate}% BTW
                        </span>
                        <div className="text-right">
                          <p className="text-foreground">
                            {formatAmount(data?.amount)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            BTW: {formatAmount(data?.vat)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Total */}
                <div className="border-t border-border pt-3">
                  <div className="flex justify-between text-sm font-medium">
                    <span className="text-foreground">Totaal</span>
                    <span className="text-foreground">
                      {formatAmount(mockOCRData?.total)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-2">
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Edit"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Gegevens Bewerken
                  </Button>
                  <Button
                    variant="outline"
                    fullWidth
                    iconName="Copy"
                    iconPosition="left"
                    iconSize={14}
                  >
                    Kopiëren naar Uitgave
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReceiptViewer;