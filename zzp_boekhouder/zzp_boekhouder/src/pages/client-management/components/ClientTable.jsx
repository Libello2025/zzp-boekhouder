import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const ClientTable = ({ clients, onEditClient, onDeleteClient, onViewClient }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  const statusOptions = [
    { value: 'all', label: 'Alle statussen' },
    { value: 'active', label: 'Actief' },
    { value: 'inactive', label: 'Inactief' },
    { value: 'overdue', label: 'Achterstallig' }
  ];

  const filteredClients = clients?.filter(client => {
    const matchesSearch = client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         client?.contactPerson?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         client?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    const matchesStatus = statusFilter === 'all' || client?.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sortedClients = [...filteredClients]?.sort((a, b) => {
    if (sortConfig?.key) {
      const aValue = a?.[sortConfig?.key];
      const bValue = b?.[sortConfig?.key];
      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-success/10 text-success', label: 'Actief' },
      inactive: { color: 'bg-muted text-muted-foreground', label: 'Inactief' },
      overdue: { color: 'bg-error/10 text-error', label: 'Achterstallig' }
    };
    
    const config = statusConfig?.[status] || statusConfig?.inactive;
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config?.color}`}>
        {config?.label}
      </span>
    );
  };

  const getSortIcon = (key) => {
    if (sortConfig?.key !== key) return 'ArrowUpDown';
    return sortConfig?.direction === 'asc' ? 'ArrowUp' : 'ArrowDown';
  };

  return (
    <div className="bg-card rounded-lg border border-border">
      {/* Search and Filter Controls */}
      <div className="p-6 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <Input
              type="search"
              placeholder="Zoek op naam, contactpersoon of email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e?.target?.value)}
              className="w-full"
            />
          </div>
          <div className="w-full sm:w-48">
            <Select
              options={statusOptions}
              value={statusFilter}
              onChange={setStatusFilter}
              placeholder="Filter status"
            />
          </div>
        </div>
        <div className="mt-4 text-sm text-muted-foreground">
          {sortedClients?.length} van {clients?.length} klanten
        </div>
      </div>
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center space-x-2 hover:text-primary transition-colors"
                >
                  <span>Bedrijfsnaam</span>
                  <Icon name={getSortIcon('name')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('contactPerson')}
                  className="flex items-center space-x-2 hover:text-primary transition-colors"
                >
                  <span>Contactpersoon</span>
                  <Icon name={getSortIcon('contactPerson')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Email</th>
              <th className="text-left p-4 font-medium text-foreground">
                <button
                  onClick={() => handleSort('paymentTerms')}
                  className="flex items-center space-x-2 hover:text-primary transition-colors"
                >
                  <span>Betalingstermijn</span>
                  <Icon name={getSortIcon('paymentTerms')} size={14} />
                </button>
              </th>
              <th className="text-left p-4 font-medium text-foreground">Status</th>
              <th className="text-right p-4 font-medium text-foreground">Acties</th>
            </tr>
          </thead>
          <tbody>
            {sortedClients?.map((client) => (
              <tr
                key={client?.id}
                className="border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
                onClick={() => onViewClient(client)}
              >
                <td className="p-4">
                  <div className="font-medium text-foreground">{client?.name}</div>
                  <div className="text-sm text-muted-foreground">KvK: {client?.kvkNumber}</div>
                </td>
                <td className="p-4">
                  <div className="text-foreground">{client?.contactPerson}</div>
                  <div className="text-sm text-muted-foreground">{client?.phone}</div>
                </td>
                <td className="p-4 text-foreground">{client?.email}</td>
                <td className="p-4 text-foreground">{client?.paymentTerms} dagen</td>
                <td className="p-4">{getStatusBadge(client?.status)}</td>
                <td className="p-4">
                  <div className="flex items-center justify-end space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onEditClient(client);
                      }}
                      iconName="Edit"
                      iconSize={16}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e?.stopPropagation();
                        onDeleteClient(client);
                      }}
                      iconName="Trash2"
                      iconSize={16}
                    />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden">
        {sortedClients?.map((client) => (
          <div
            key={client?.id}
            className="p-4 border-b border-border hover:bg-muted/30 cursor-pointer transition-colors"
            onClick={() => onViewClient(client)}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="font-medium text-foreground">{client?.name}</h3>
                <p className="text-sm text-muted-foreground">KvK: {client?.kvkNumber}</p>
              </div>
              {getStatusBadge(client?.status)}
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center space-x-2">
                <Icon name="User" size={14} className="text-muted-foreground" />
                <span className="text-foreground">{client?.contactPerson}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Mail" size={14} className="text-muted-foreground" />
                <span className="text-foreground">{client?.email}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Icon name="Calendar" size={14} className="text-muted-foreground" />
                <span className="text-foreground">{client?.paymentTerms} dagen betalingstermijn</span>
              </div>
            </div>
            <div className="flex items-center justify-end space-x-2 mt-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e?.stopPropagation();
                  onEditClient(client);
                }}
                iconName="Edit"
                iconSize={16}
              />
              <Button
                variant="ghost"
                size="icon"
                onClick={(e) => {
                  e?.stopPropagation();
                  onDeleteClient(client);
                }}
                iconName="Trash2"
                iconSize={16}
              />
            </div>
          </div>
        ))}
      </div>
      {sortedClients?.length === 0 && (
        <div className="p-8 text-center">
          <Icon name="Users" size={48} className="mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Geen klanten gevonden</h3>
          <p className="text-muted-foreground">
            {searchTerm || statusFilter !== 'all' ?'Probeer je zoekterm of filter aan te passen.' :'Voeg je eerste klant toe om te beginnen.'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ClientTable;