import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const TimeEntriesTable = ({ 
  timeEntries, 
  onEditEntry, 
  onDeleteEntry, 
  onToggleBillable,
  projects,
  clients 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProject, setFilterProject] = useState('');
  const [filterClient, setFilterClient] = useState('');
  const [filterBillable, setFilterBillable] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('date');
  const [sortDirection, setSortDirection] = useState('desc');
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [selectedEntries, setSelectedEntries] = useState([]);

  const formatDuration = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}:${minutes?.toString()?.padStart(2, '0')}`;
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR'
    })?.format(amount);
  };

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const handleEdit = (entry) => {
    setEditingId(entry?.id);
    setEditValues({
      description: entry?.description,
      duration: Math.floor(entry?.duration / 3600) + ':' + Math.floor((entry?.duration % 3600) / 60)?.toString()?.padStart(2, '0')
    });
  };

  const handleSaveEdit = (entryId) => {
    const [hours, minutes] = editValues?.duration?.split(':')?.map(Number);
    const totalSeconds = (hours * 3600) + (minutes * 60);
    
    onEditEntry(entryId, {
      description: editValues?.description,
      duration: totalSeconds
    });
    
    setEditingId(null);
    setEditValues({});
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSelectEntry = (entryId, checked) => {
    if (checked) {
      setSelectedEntries([...selectedEntries, entryId]);
    } else {
      setSelectedEntries(selectedEntries?.filter(id => id !== entryId));
    }
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedEntries(filteredAndSortedEntries?.map(entry => entry?.id));
    } else {
      setSelectedEntries([]);
    }
  };

  const handleBulkDelete = () => {
    if (window.confirm(`${selectedEntries?.length} tijdregistraties verwijderen?`)) {
      selectedEntries?.forEach(id => onDeleteEntry(id));
      setSelectedEntries([]);
    }
  };

  const handleBulkToggleBillable = () => {
    selectedEntries?.forEach(id => onToggleBillable(id));
    setSelectedEntries([]);
  };

  // Filter and sort entries
  let filteredAndSortedEntries = timeEntries?.filter(entry => {
    const matchesSearch = entry?.description?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         entry?.project?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
                         entry?.client?.toLowerCase()?.includes(searchTerm?.toLowerCase());
    
    const matchesProject = !filterProject || entry?.project === filterProject;
    const matchesClient = !filterClient || entry?.client === filterClient;
    const matchesBillable = filterBillable === '' || 
                           (filterBillable === 'billable' && entry?.billable) ||
                           (filterBillable === 'non-billable' && !entry?.billable);
    
    const matchesDateFrom = !dateFrom || entry?.date >= dateFrom;
    const matchesDateTo = !dateTo || entry?.date <= dateTo;
    
    return matchesSearch && matchesProject && matchesClient && matchesBillable && matchesDateFrom && matchesDateTo;
  });

  filteredAndSortedEntries?.sort((a, b) => {
    let aValue = a?.[sortField];
    let bValue = b?.[sortField];
    
    if (sortField === 'date') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }
    
    if (sortDirection === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });

  const projectOptions = [
    { value: '', label: 'Alle projecten' },
    ...Array.from(new Set(timeEntries.map(entry => entry.project)))?.map(project => ({ value: project, label: project }))
  ];

  const clientOptions = [
    { value: '', label: 'Alle klanten' },
    ...Array.from(new Set(timeEntries.map(entry => entry.client)))?.filter(client => client)?.map(client => ({ value: client, label: client }))
  ];

  const billableOptions = [
    { value: '', label: 'Alle registraties' },
    { value: 'billable', label: 'Alleen factureerbaar' },
    { value: 'non-billable', label: 'Alleen niet-factureerbaar' }
  ];

  const totalHours = filteredAndSortedEntries?.reduce((sum, entry) => sum + entry?.duration, 0) / 3600;
  const totalAmount = filteredAndSortedEntries?.reduce((sum, entry) => sum + parseFloat(entry?.amount), 0);
  const billableHours = filteredAndSortedEntries?.filter(entry => entry?.billable)?.reduce((sum, entry) => sum + entry?.duration, 0) / 3600;
  const billableAmount = filteredAndSortedEntries?.filter(entry => entry?.billable)?.reduce((sum, entry) => sum + parseFloat(entry?.amount), 0);

  return (
    <div className="bg-card border border-border rounded-lg shadow-elevation-2">
      {/* Header with Filters */}
      <div className="p-6 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-foreground">Tijdregistraties</h2>
          <div className="flex space-x-2">
            {selectedEntries?.length > 0 && (
              <>
                <Button
                  variant="outline"
                  onClick={handleBulkToggleBillable}
                  iconName="ToggleLeft"
                  iconPosition="left"
                  iconSize={16}
                >
                  Factureerbaar wijzigen ({selectedEntries?.length})
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleBulkDelete}
                  iconName="Trash2"
                  iconPosition="left"
                  iconSize={16}
                >
                  Verwijderen ({selectedEntries?.length})
                </Button>
              </>
            )}
            <Button
              variant="outline"
              iconName="Download"
              iconPosition="left"
              iconSize={16}
            >
              Exporteren
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <Input
            type="text"
            placeholder="Zoeken..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
          />
          <Select
            placeholder="Project"
            options={projectOptions}
            value={filterProject}
            onChange={setFilterProject}
          />
          <Select
            placeholder="Klant"
            options={clientOptions}
            value={filterClient}
            onChange={setFilterClient}
          />
          <Select
            placeholder="Status"
            options={billableOptions}
            value={filterBillable}
            onChange={setFilterBillable}
          />
          <Input
            type="date"
            placeholder="Van datum"
            value={dateFrom}
            onChange={(e) => setDateFrom(e?.target?.value)}
          />
          <Input
            type="date"
            placeholder="Tot datum"
            value={dateTo}
            onChange={(e) => setDateTo(e?.target?.value)}
          />
        </div>

        {/* Summary */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Totaal uren:</span>
            <span className="ml-2 font-medium">{totalHours?.toFixed(2)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Factureerbaar:</span>
            <span className="ml-2 font-medium">{billableHours?.toFixed(2)} uur</span>
          </div>
          <div>
            <span className="text-muted-foreground">Totaal bedrag:</span>
            <span className="ml-2 font-medium">{formatCurrency(totalAmount)}</span>
          </div>
          <div>
            <span className="text-muted-foreground">Factureerbaar bedrag:</span>
            <span className="ml-2 font-medium">{formatCurrency(billableAmount)}</span>
          </div>
        </div>
      </div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted/50">
            <tr>
              <th className="p-3 text-left">
                <Checkbox
                  checked={selectedEntries?.length === filteredAndSortedEntries?.length && filteredAndSortedEntries?.length > 0}
                  onChange={(e) => handleSelectAll(e?.target?.checked)}
                />
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('date')}
              >
                <div className="flex items-center space-x-1">
                  <span>Datum</span>
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('project')}
              >
                <div className="flex items-center space-x-1">
                  <span>Project</span>
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th className="p-3 text-left">Klant</th>
              <th className="p-3 text-left">Beschrijving</th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('duration')}
              >
                <div className="flex items-center space-x-1">
                  <span>Duur</span>
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th className="p-3 text-left">Factureerbaar</th>
              <th 
                className="p-3 text-left cursor-pointer hover:bg-muted/70"
                onClick={() => handleSort('amount')}
              >
                <div className="flex items-center space-x-1">
                  <span>Bedrag</span>
                  <Icon name="ArrowUpDown" size={14} />
                </div>
              </th>
              <th className="p-3 text-left">Acties</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedEntries?.map((entry) => (
              <tr key={entry?.id} className="border-t border-border hover:bg-muted/30">
                <td className="p-3">
                  <Checkbox
                    checked={selectedEntries?.includes(entry?.id)}
                    onChange={(e) => handleSelectEntry(entry?.id, e?.target?.checked)}
                  />
                </td>
                <td className="p-3 text-sm">
                  {new Date(entry.date)?.toLocaleDateString('nl-NL')}
                </td>
                <td className="p-3 text-sm font-medium">{entry?.project}</td>
                <td className="p-3 text-sm text-muted-foreground">{entry?.client || '-'}</td>
                <td className="p-3 text-sm">
                  {editingId === entry?.id ? (
                    <Input
                      type="text"
                      value={editValues?.description}
                      onChange={(e) => setEditValues({...editValues, description: e?.target?.value})}
                      className="w-full"
                    />
                  ) : (
                    entry?.description
                  )}
                </td>
                <td className="p-3 text-sm font-mono">
                  {editingId === entry?.id ? (
                    <Input
                      type="text"
                      value={editValues?.duration}
                      onChange={(e) => setEditValues({...editValues, duration: e?.target?.value})}
                      placeholder="H:MM"
                      className="w-20"
                    />
                  ) : (
                    formatDuration(entry?.duration)
                  )}
                </td>
                <td className="p-3">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onToggleBillable(entry?.id)}
                    iconName={entry?.billable ? "Check" : "X"}
                    iconSize={16}
                    className={entry?.billable ? "text-success" : "text-muted-foreground"}
                  />
                </td>
                <td className="p-3 text-sm font-medium">
                  {formatCurrency(entry?.amount)}
                </td>
                <td className="p-3">
                  <div className="flex space-x-1">
                    {editingId === entry?.id ? (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveEdit(entry?.id)}
                          iconName="Check"
                          iconSize={14}
                          className="text-success"
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={handleCancelEdit}
                          iconName="X"
                          iconSize={14}
                          className="text-muted-foreground"
                        />
                      </>
                    ) : (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(entry)}
                          iconName="Edit2"
                          iconSize={14}
                        />
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onDeleteEntry(entry?.id)}
                          iconName="Trash2"
                          iconSize={14}
                          className="text-destructive"
                        />
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {filteredAndSortedEntries?.length === 0 && (
        <div className="p-8 text-center text-muted-foreground">
          <Icon name="Clock" size={48} className="mx-auto mb-4 opacity-50" />
          <p>Geen tijdregistraties gevonden</p>
          <p className="text-sm">Start de timer of voeg handmatig een registratie toe</p>
        </div>
      )}
    </div>
  );
};

export default TimeEntriesTable;