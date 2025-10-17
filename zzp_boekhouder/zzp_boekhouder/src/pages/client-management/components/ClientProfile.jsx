import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const ClientProfile = ({ client, onClose, onEdit }) => {
  const [activeTab, setActiveTab] = useState('contact');

  if (!client) return null;

  const tabs = [
    { id: 'contact', label: 'Contactgegevens', icon: 'User' },
    { id: 'projects', label: 'Projecten', icon: 'Briefcase' },
    { id: 'invoices', label: 'Facturen', icon: 'FileText' },
    { id: 'payments', label: 'Betalingen', icon: 'CreditCard' }
  ];

  const mockProjects = [
    {
      id: 1,
      name: "Website redesign",
      status: "active",
      budget: 15000,
      spent: 8500,
      startDate: "2024-01-15",
      endDate: "2024-03-15"
    },
    {
      id: 2,
      name: "SEO optimalisatie",
      status: "completed",
      budget: 5000,
      spent: 4800,
      startDate: "2023-11-01",
      endDate: "2024-01-31"
    }
  ];

  const mockInvoices = [
    {
      id: "INV-2024-001",
      date: "2024-10-15",
      amount: 2500,
      status: "paid",
      dueDate: "2024-11-14"
    },
    {
      id: "INV-2024-002",
      date: "2024-09-15",
      amount: 3200,
      status: "overdue",
      dueDate: "2024-10-15"
    },
    {
      id: "INV-2024-003",
      date: "2024-08-15",
      amount: 1800,
      status: "paid",
      dueDate: "2024-09-14"
    }
  ];

  const mockPayments = [
    {
      id: 1,
      invoiceId: "INV-2024-001",
      amount: 2500,
      date: "2024-11-10",
      method: "Bank transfer"
    },
    {
      id: 2,
      invoiceId: "INV-2024-003",
      amount: 1800,
      date: "2024-09-10",
      method: "Bank transfer"
    }
  ];

  const getStatusBadge = (status, type = 'default') => {
    const configs = {
      project: {
        active: { color: 'bg-success/10 text-success', label: 'Actief' },
        completed: { color: 'bg-muted text-muted-foreground', label: 'Voltooid' },
        paused: { color: 'bg-warning/10 text-warning', label: 'Gepauzeerd' }
      },
      invoice: {
        paid: { color: 'bg-success/10 text-success', label: 'Betaald' },
        pending: { color: 'bg-warning/10 text-warning', label: 'Openstaand' },
        overdue: { color: 'bg-error/10 text-error', label: 'Achterstallig' }
      },
      default: {
        active: { color: 'bg-success/10 text-success', label: 'Actief' },
        inactive: { color: 'bg-muted text-muted-foreground', label: 'Inactief' }
      }
    };
    
    const config = configs?.[type]?.[status] || configs?.default?.[status] || configs?.default?.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString)?.toLocaleDateString('nl-NL');
  };

  const renderContactTab = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Bedrijfsgegevens</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Bedrijfsnaam</label>
              <p className="text-foreground">{client?.name}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">KvK nummer</label>
              <p className="text-foreground">{client?.kvkNumber || 'Niet opgegeven'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">BTW nummer</label>
              <p className="text-foreground">{client?.vatNumber || 'Niet opgegeven'}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h4 className="font-medium text-foreground">Contactgegevens</h4>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-muted-foreground">Contactpersoon</label>
              <p className="text-foreground">{client?.contactPerson}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Email</label>
              <p className="text-foreground">{client?.email}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Telefoon</label>
              <p className="text-foreground">{client?.phone || 'Niet opgegeven'}</p>
            </div>
            <div>
              <label className="text-sm text-muted-foreground">Website</label>
              <p className="text-foreground">{client?.website || 'Niet opgegeven'}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="font-medium text-foreground">Adresgegevens</h4>
        <div className="text-foreground">
          {client?.address?.street && client?.address?.houseNumber && (
            <p>{client?.address?.street} {client?.address?.houseNumber}</p>
          )}
          {client?.address?.postalCode && client?.address?.city && (
            <p>{client?.address?.postalCode} {client?.address?.city}</p>
          )}
          {client?.address?.country && (
            <p>{client?.address?.country}</p>
          )}
          {!client?.address?.street && !client?.address?.city && (
            <p className="text-muted-foreground">Geen adres opgegeven</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-muted-foreground">Betalingstermijn</label>
          <p className="text-foreground">{client?.paymentTerms} dagen</p>
        </div>
        <div>
          <label className="text-sm text-muted-foreground">Status</label>
          <div className="mt-1">{getStatusBadge(client?.status)}</div>
        </div>
      </div>

      {client?.notes && (
        <div>
          <label className="text-sm text-muted-foreground">Notities</label>
          <p className="text-foreground mt-1">{client?.notes}</p>
        </div>
      )}
    </div>
  );

  const renderProjectsTab = () => (
    <div className="space-y-4">
      {mockProjects?.map((project) => (
        <div key={project?.id} className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-foreground">{project?.name}</h4>
              <p className="text-sm text-muted-foreground">
                {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
              </p>
            </div>
            {getStatusBadge(project?.status, 'project')}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Budget:</span>
              <span className="ml-2 text-foreground">{formatCurrency(project?.budget)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Besteed:</span>
              <span className="ml-2 text-foreground">{formatCurrency(project?.spent)}</span>
            </div>
          </div>
          
          <div className="mt-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Voortgang</span>
              <span className="text-foreground">{Math.round((project?.spent / project?.budget) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300"
                style={{ width: `${Math.min((project?.spent / project?.budget) * 100, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      ))}
      
      {mockProjects?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="Briefcase" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nog geen projecten voor deze klant</p>
        </div>
      )}
    </div>
  );

  const renderInvoicesTab = () => (
    <div className="space-y-4">
      {mockInvoices?.map((invoice) => (
        <div key={invoice?.id} className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-foreground">{invoice?.id}</h4>
              <p className="text-sm text-muted-foreground">
                Factuurdatum: {formatDate(invoice?.date)}
              </p>
            </div>
            {getStatusBadge(invoice?.status, 'invoice')}
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Bedrag:</span>
              <span className="ml-2 text-foreground font-medium">{formatCurrency(invoice?.amount)}</span>
            </div>
            <div>
              <span className="text-muted-foreground">Vervaldatum:</span>
              <span className="ml-2 text-foreground">{formatDate(invoice?.dueDate)}</span>
            </div>
          </div>
        </div>
      ))}
      
      {mockInvoices?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="FileText" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nog geen facturen voor deze klant</p>
        </div>
      )}
    </div>
  );

  const renderPaymentsTab = () => (
    <div className="space-y-4">
      {mockPayments?.map((payment) => (
        <div key={payment?.id} className="p-4 border border-border rounded-lg">
          <div className="flex items-start justify-between mb-3">
            <div>
              <h4 className="font-medium text-foreground">{formatCurrency(payment?.amount)}</h4>
              <p className="text-sm text-muted-foreground">
                Factuur: {payment?.invoiceId}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-foreground">{formatDate(payment?.date)}</p>
              <p className="text-xs text-muted-foreground">{payment?.method}</p>
            </div>
          </div>
        </div>
      ))}
      
      {mockPayments?.length === 0 && (
        <div className="text-center py-8">
          <Icon name="CreditCard" size={48} className="mx-auto text-muted-foreground mb-4" />
          <p className="text-muted-foreground">Nog geen betalingen voor deze klant</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-xl font-semibold text-foreground">{client?.name}</h2>
            <p className="text-muted-foreground">{client?.contactPerson}</p>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={() => onEdit(client)}
              iconName="Edit"
              iconPosition="left"
            >
              Bewerken
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              iconName="X"
              iconSize={20}
            />
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-border">
          <nav className="flex space-x-8 px-6">
            {tabs?.map((tab) => (
              <button
                key={tab?.id}
                onClick={() => setActiveTab(tab?.id)}
                className={`flex items-center space-x-2 py-4 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab?.id
                    ? 'border-primary text-primary' :'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                <Icon name={tab?.icon} size={16} />
                <span>{tab?.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'contact' && renderContactTab()}
          {activeTab === 'projects' && renderProjectsTab()}
          {activeTab === 'invoices' && renderInvoicesTab()}
          {activeTab === 'payments' && renderPaymentsTab()}
        </div>
      </div>
    </div>
  );
};

export default ClientProfile;