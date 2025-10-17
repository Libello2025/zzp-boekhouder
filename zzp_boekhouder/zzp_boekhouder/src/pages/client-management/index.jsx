import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import QuickActionWidget from '../../components/ui/QuickActionWidget';
import AIChatWidget from '../../components/ui/AIChatWidget';
import ClientTable from './components/ClientTable';
import ClientForm from './components/ClientForm';
import ClientProfile from './components/ClientProfile';
import BulkActionsBar from './components/BulkActionsBar';
import DeleteConfirmModal from './components/DeleteConfirmModal';

const ClientManagement = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState([]);
  const [selectedClients, setSelectedClients] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [viewingClient, setViewingClient] = useState(null);
  const [deletingClient, setDeletingClient] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Mock client data
  useEffect(() => {
    const mockClients = [
      {
        id: 1,
        name: "Acme Corporation BV",
        kvkNumber: "12345678",
        vatNumber: "NL123456789B01",
        contactPerson: "Jan van der Berg",
        email: "jan@acmecorp.nl",
        phone: "+31 20 1234567",
        website: "https://www.acmecorp.nl",
        address: {
          street: "Hoofdstraat",
          houseNumber: "123",
          postalCode: "1012AB",
          city: "Amsterdam",
          country: "Nederland"
        },
        paymentTerms: 30,
        status: "active",
        notes: "Belangrijke klant met langlopend contract",
        createdAt: "2024-01-15T10:00:00Z",
        updatedAt: "2024-10-15T14:30:00Z"
      },
      {
        id: 2,
        name: "TechStart Solutions",
        kvkNumber: "87654321",
        vatNumber: "NL987654321B01",
        contactPerson: "Sarah de Wit",
        email: "sarah@techstart.nl",
        phone: "+31 6 98765432",
        website: "https://www.techstart.nl",
        address: {
          street: "Innovatielaan",
          houseNumber: "45A",
          postalCode: "3584EA",
          city: "Utrecht",
          country: "Nederland"
        },
        paymentTerms: 14,
        status: "active",
        notes: "Startup met snelle groei, flexibele betalingsafspraken",
        createdAt: "2024-02-20T09:15:00Z",
        updatedAt: "2024-10-10T11:20:00Z"
      },
      {
        id: 3,
        name: "Retail Masters BV",
        kvkNumber: "11223344",
        vatNumber: "",
        contactPerson: "Piet Janssen",
        email: "piet@retailmasters.nl",
        phone: "+31 40 5566778",
        website: "",
        address: {
          street: "Winkelstraat",
          houseNumber: "67",
          postalCode: "5611AB",
          city: "Eindhoven",
          country: "Nederland"
        },
        paymentTerms: 60,
        status: "overdue",
        notes: "Betalingen vaak te laat, extra aandacht vereist",
        createdAt: "2024-03-10T16:45:00Z",
        updatedAt: "2024-09-25T13:10:00Z"
      },
      {
        id: 4,
        name: "Green Energy Partners",
        kvkNumber: "55667788",
        vatNumber: "NL556677889B01",
        contactPerson: "Lisa Vermeulen",
        email: "lisa@greenenergy.nl",
        phone: "+31 50 1122334",
        website: "https://www.greenenergy.nl",
        address: {
          street: "Duurzaamheidslaan",
          houseNumber: "12",
          postalCode: "9712AB",
          city: "Groningen",
          country: "Nederland"
        },
        paymentTerms: 30,
        status: "inactive",
        notes: "Project afgerond, mogelijk toekomstige samenwerking",
        createdAt: "2024-04-05T12:30:00Z",
        updatedAt: "2024-08-15T10:45:00Z"
      },
      {
        id: 5,
        name: "Digital Marketing Pro",
        kvkNumber: "99887766",
        vatNumber: "NL998877665B01",
        contactPerson: "Mark Bakker",
        email: "mark@digitalmarketing.nl",
        phone: "+31 70 9988776",
        website: "https://www.digitalmarketing.nl",
        address: {
          street: "Marketingplein",
          houseNumber: "88",
          postalCode: "2514AB",
          city: "Den Haag",
          country: "Nederland"
        },
        paymentTerms: 30,
        status: "active",
        notes: "Regelmatige opdrachten, betrouwbare betaler",
        createdAt: "2024-05-12T08:20:00Z",
        updatedAt: "2024-10-12T15:55:00Z"
      }
    ];
    setClients(mockClients);
  }, []);

  const handleAddClient = () => {
    setEditingClient(null);
    setIsFormOpen(true);
  };

  const handleEditClient = (client) => {
    setEditingClient(client);
    setIsFormOpen(true);
    setIsProfileOpen(false);
  };

  const handleViewClient = (client) => {
    setViewingClient(client);
    setIsProfileOpen(true);
  };

  const handleDeleteClient = (client) => {
    setDeletingClient(client);
    setIsDeleteModalOpen(true);
  };

  const handleSaveClient = async (clientData) => {
    try {
      if (editingClient) {
        // Update existing client
        setClients(prev => prev?.map(client => 
          client?.id === editingClient?.id ? clientData : client
        ));
      } else {
        // Add new client
        setClients(prev => [...prev, clientData]);
      }
      setIsFormOpen(false);
      setEditingClient(null);
    } catch (error) {
      console.error('Error saving client:', error);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingClient) return;
    
    setIsDeleting(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setClients(prev => prev?.filter(client => client?.id !== deletingClient?.id));
      setIsDeleteModalOpen(false);
      setDeletingClient(null);
    } catch (error) {
      console.error('Error deleting client:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkAction = async (action, selectedClientIds) => {
    try {
      switch (action) {
        case 'activate':
          setClients(prev => prev?.map(client => 
            selectedClientIds?.includes(client?.id) 
              ? { ...client, status: 'active', updatedAt: new Date()?.toISOString() }
              : client
          ));
          break;
        case 'deactivate':
          setClients(prev => prev?.map(client => 
            selectedClientIds?.includes(client?.id) 
              ? { ...client, status: 'inactive', updatedAt: new Date()?.toISOString() }
              : client
          ));
          break;
        case 'export':
          // Simulate CSV export
          const selectedClientsData = clients?.filter(client => selectedClientIds?.includes(client?.id));
          console.log('Exporting clients:', selectedClientsData);
          break;
        case 'delete':
          setClients(prev => prev?.filter(client => !selectedClientIds?.includes(client?.id)));
          break;
        default:
          break;
      }
      setSelectedClients([]);
    } catch (error) {
      console.error('Error executing bulk action:', error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <main className={`transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-60'
      } mt-16 p-6`}>
        <div className="max-w-7xl mx-auto">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-foreground">Klantenbeheer</h1>
                <p className="text-muted-foreground mt-2">
                  Beheer je klanten en hun gegevens op één centrale plek
                </p>
              </div>
              <Button
                variant="default"
                onClick={handleAddClient}
                iconName="Plus"
                iconPosition="left"
                iconSize={20}
              >
                Nieuwe klant toevoegen
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Totaal klanten</p>
                  <p className="text-2xl font-bold text-foreground">{clients?.length}</p>
                </div>
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-primary" />
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actieve klanten</p>
                  <p className="text-2xl font-bold text-foreground">
                    {clients?.filter(c => c?.status === 'active')?.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                  <Icon name="UserCheck" size={24} className="text-success" />
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Achterstallige klanten</p>
                  <p className="text-2xl font-bold text-foreground">
                    {clients?.filter(c => c?.status === 'overdue')?.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-error/10 rounded-lg flex items-center justify-center">
                  <Icon name="AlertTriangle" size={24} className="text-error" />
                </div>
              </div>
            </div>

            <div className="bg-card p-6 rounded-lg border border-border">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Deze maand toegevoegd</p>
                  <p className="text-2xl font-bold text-foreground">
                    {clients?.filter(c => {
                      const created = new Date(c.createdAt);
                      const now = new Date();
                      return created?.getMonth() === now?.getMonth() && created?.getFullYear() === now?.getFullYear();
                    })?.length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Icon name="UserPlus" size={24} className="text-accent" />
                </div>
              </div>
            </div>
          </div>

          {/* Bulk Actions Bar */}
          <BulkActionsBar
            selectedClients={selectedClients}
            onBulkAction={handleBulkAction}
            onClearSelection={() => setSelectedClients([])}
          />

          {/* Client Table */}
          <ClientTable
            clients={clients}
            onEditClient={handleEditClient}
            onDeleteClient={handleDeleteClient}
            onViewClient={handleViewClient}
          />
        </div>
      </main>
      {/* Client Form Modal */}
      <ClientForm
        client={editingClient}
        isOpen={isFormOpen}
        onSave={handleSaveClient}
        onCancel={() => {
          setIsFormOpen(false);
          setEditingClient(null);
        }}
      />
      {/* Client Profile Modal */}
      <ClientProfile
        client={viewingClient}
        onClose={() => {
          setIsProfileOpen(false);
          setViewingClient(null);
        }}
        onEdit={handleEditClient}
      />
      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        client={deletingClient}
        isOpen={isDeleteModalOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsDeleteModalOpen(false);
          setDeletingClient(null);
        }}
        isDeleting={isDeleting}
      />
      {/* Widgets */}
      <QuickActionWidget />
      <AIChatWidget />
    </div>
  );
};

export default ClientManagement;