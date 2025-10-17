import React, { useState, useEffect } from 'react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import QuickActionWidget from '../../components/ui/QuickActionWidget';
import AIChatWidget from '../../components/ui/AIChatWidget';
import ActiveTimer from './components/ActiveTimer';
import TimeEntriesTable from './components/TimeEntriesTable';
import ManualEntryForm from './components/ManualEntryForm';
import QuickActions from './components/QuickActions';

const TimeTracking = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [showManualForm, setShowManualForm] = useState(false);
  const [timeEntries, setTimeEntries] = useState([]);
  const [selectedEntries, setSelectedEntries] = useState([]);

  // Mock data for projects and clients
  const projects = [
    {
      id: "proj-1",
      name: "Website Redesign",
      client: "TechCorp BV",
      clientId: "client-1",
      hourlyRate: 85,
      status: "active"
    },
    {
      id: "proj-2", 
      name: "Mobile App Development",
      client: "StartupXYZ",
      clientId: "client-2",
      hourlyRate: 95,
      status: "active"
    },
    {
      id: "proj-3",
      name: "SEO Optimization",
      client: "E-commerce Plus",
      clientId: "client-3", 
      hourlyRate: 75,
      status: "active"
    },
    {
      id: "proj-4",
      name: "Database Migration",
      client: "DataSystems Ltd",
      clientId: "client-4",
      hourlyRate: 110,
      status: "completed"
    },
    {
      id: "proj-5",
      name: "API Integration",
      client: "TechCorp BV",
      clientId: "client-1",
      hourlyRate: 90,
      status: "active"
    }
  ];

  const clients = [
    {
      id: "client-1",
      name: "TechCorp BV",
      email: "contact@techcorp.nl",
      phone: "+31 20 123 4567"
    },
    {
      id: "client-2",
      name: "StartupXYZ",
      email: "hello@startupxyz.com",
      phone: "+31 6 987 6543"
    },
    {
      id: "client-3",
      name: "E-commerce Plus",
      email: "info@ecommerceplus.nl",
      phone: "+31 30 555 0123"
    },
    {
      id: "client-4",
      name: "DataSystems Ltd",
      email: "support@datasystems.com",
      phone: "+31 10 444 5678"
    }
  ];

  // Initialize with mock time entries
  useEffect(() => {
    const mockEntries = [
      {
        id: 1,
        date: "2025-10-17",
        project: "Website Redesign",
        client: "TechCorp BV",
        description: "Frontend component development en responsive design implementatie",
        duration: 14400, // 4 hours
        billable: true,
        hourlyRate: 85,
        amount: "340.00",
        startTime: new Date("2025-10-17T09:00:00"),
        endTime: new Date("2025-10-17T13:00:00")
      },
      {
        id: 2,
        date: "2025-10-17",
        project: "Mobile App Development", 
        client: "StartupXYZ",
        description: "API endpoints configuratie en testing",
        duration: 7200, // 2 hours
        billable: true,
        hourlyRate: 95,
        amount: "190.00",
        startTime: new Date("2025-10-17T14:00:00"),
        endTime: new Date("2025-10-17T16:00:00")
      },
      {
        id: 3,
        date: "2025-10-16",
        project: "SEO Optimization",
        client: "E-commerce Plus",
        description: "Keyword research en content optimalisatie",
        duration: 10800, // 3 hours
        billable: true,
        hourlyRate: 75,
        amount: "225.00",
        startTime: new Date("2025-10-16T10:00:00"),
        endTime: new Date("2025-10-16T13:00:00")
      },
      {
        id: 4,
        date: "2025-10-16",
        project: "Database Migration",
        client: "DataSystems Ltd",
        description: "Schema migratie en data validatie",
        duration: 18000, // 5 hours
        billable: true,
        hourlyRate: 110,
        amount: "550.00",
        startTime: new Date("2025-10-16T09:00:00"),
        endTime: new Date("2025-10-16T14:00:00")
      },
      {
        id: 5,
        date: "2025-10-15",
        project: "API Integration",
        client: "TechCorp BV",
        description: "Third-party API integratie en error handling",
        duration: 9000, // 2.5 hours
        billable: true,
        hourlyRate: 90,
        amount: "225.00",
        startTime: new Date("2025-10-15T15:00:00"),
        endTime: new Date("2025-10-15T17:30:00")
      },
      {
        id: 6,
        date: "2025-10-15",
        project: "Website Redesign",
        client: "TechCorp BV",
        description: "Project planning en client meeting",
        duration: 3600, // 1 hour
        billable: false,
        hourlyRate: 85,
        amount: "0.00",
        startTime: new Date("2025-10-15T11:00:00"),
        endTime: new Date("2025-10-15T12:00:00")
      },
      {
        id: 7,
        date: "2025-10-14",
        project: "Mobile App Development",
        client: "StartupXYZ", 
        description: "UI/UX design review en feedback verwerking",
        duration: 5400, // 1.5 hours
        billable: true,
        hourlyRate: 95,
        amount: "142.50",
        startTime: new Date("2025-10-14T16:00:00"),
        endTime: new Date("2025-10-14T17:30:00")
      },
      {
        id: 8,
        date: "2025-10-14",
        project: "SEO Optimization",
        client: "E-commerce Plus",
        description: "Technical SEO audit en performance optimalisatie",
        duration: 12600, // 3.5 hours
        billable: true,
        hourlyRate: 75,
        amount: "262.50",
        startTime: new Date("2025-10-14T09:00:00"),
        endTime: new Date("2025-10-14T12:30:00")
      }
    ];
    setTimeEntries(mockEntries);
  }, []);

  const handleAddTimeEntry = (entry) => {
    setTimeEntries(prev => [entry, ...prev]);
  };

  const handleEditEntry = (entryId, updates) => {
    setTimeEntries(prev => prev?.map(entry => {
      if (entry?.id === entryId) {
        const updatedEntry = { ...entry, ...updates };
        // Recalculate amount if duration or rate changed
        if (updates?.duration || updates?.hourlyRate) {
          const hours = updatedEntry?.duration / 3600;
          updatedEntry.amount = (hours * updatedEntry?.hourlyRate)?.toFixed(2);
        }
        return updatedEntry;
      }
      return entry;
    }));
  };

  const handleDeleteEntry = (entryId) => {
    if (window.confirm('Tijdregistratie verwijderen?')) {
      setTimeEntries(prev => prev?.filter(entry => entry?.id !== entryId));
    }
  };

  const handleToggleBillable = (entryId) => {
    setTimeEntries(prev => prev?.map(entry => {
      if (entry?.id === entryId) {
        const billable = !entry?.billable;
        const amount = billable ? ((entry?.duration / 3600) * entry?.hourlyRate)?.toFixed(2) : "0.00";
        return { ...entry, billable, amount };
      }
      return entry;
    }));
  };

  const handleExportData = () => {
    // Mock export functionality
    const csvContent = [
      ['Datum', 'Project', 'Klant', 'Beschrijving', 'Duur (uren)', 'Factureerbaar', 'Uurtarief', 'Bedrag'],
      ...timeEntries?.map(entry => [
        entry?.date,
        entry?.project,
        entry?.client,
        entry?.description,
        (entry?.duration / 3600)?.toFixed(2),
        entry?.billable ? 'Ja' : 'Nee',
        `€${entry?.hourlyRate}`,
        `€${entry?.amount}`
      ])
    ]?.map(row => row?.join(','))?.join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL?.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tijdregistraties-${new Date()?.toISOString()?.split('T')?.[0]}.csv`;
    a?.click();
    window.URL?.revokeObjectURL(url);
  };

  const handleBulkEdit = () => {
    // Mock bulk edit functionality
    alert('Bulk bewerken functionaliteit wordt binnenkort toegevoegd');
  };

  // Calculate statistics
  const totalHours = timeEntries?.reduce((sum, entry) => sum + entry?.duration, 0) / 3600;
  const billableHours = timeEntries?.filter(entry => entry?.billable)?.reduce((sum, entry) => sum + entry?.duration, 0) / 3600;

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
        <div className="p-6 space-y-6">
          {/* Page Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Tijdregistratie</h1>
              <p className="text-muted-foreground mt-1">
                Houd je werkuren bij en optimaliseer je productiviteit
              </p>
            </div>
          </div>

          {/* Active Timer Section */}
          <ActiveTimer
            onTimeEntry={handleAddTimeEntry}
            projects={projects}
            clients={clients}
          />

          {/* Quick Actions */}
          <QuickActions
            onManualEntry={() => setShowManualForm(true)}
            onExportData={handleExportData}
            onBulkEdit={handleBulkEdit}
            selectedCount={selectedEntries?.length}
            totalEntries={timeEntries?.length}
            totalHours={totalHours}
            billableHours={billableHours}
          />

          {/* Time Entries Table */}
          <TimeEntriesTable
            timeEntries={timeEntries}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
            onToggleBillable={handleToggleBillable}
            projects={projects}
            clients={clients}
          />
        </div>
      </main>
      {/* Manual Entry Form Modal */}
      {showManualForm && (
        <ManualEntryForm
          onAddEntry={handleAddTimeEntry}
          projects={projects}
          clients={clients}
          onClose={() => setShowManualForm(false)}
        />
      )}
      {/* Floating Widgets */}
      <QuickActionWidget />
      <AIChatWidget />
    </div>
  );
};

export default TimeTracking;