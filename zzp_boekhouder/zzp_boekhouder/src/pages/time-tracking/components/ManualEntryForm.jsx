import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const ManualEntryForm = ({ onAddEntry, projects, clients, onClose }) => {
  const [formData, setFormData] = useState({
    date: new Date()?.toISOString()?.split('T')?.[0],
    projectId: '',
    clientId: '',
    description: '',
    startTime: '',
    endTime: '',
    duration: '',
    billable: true,
    hourlyRate: 75
  });

  const [errors, setErrors] = useState({});
  const [useTimeRange, setUseTimeRange] = useState(true);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors?.[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    // Auto-calculate duration when time range changes
    if (field === 'startTime' || field === 'endTime') {
      const newFormData = { ...formData, [field]: value };
      if (newFormData?.startTime && newFormData?.endTime) {
        const start = new Date(`2000-01-01T${newFormData.startTime}`);
        const end = new Date(`2000-01-01T${newFormData.endTime}`);
        if (end > start) {
          const diffMs = end - start;
          let hours = Math.floor(diffMs / (1000 * 60 * 60));
          const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          setFormData(prev => ({
            ...prev,
            duration: `${hours}:${minutes?.toString()?.padStart(2, '0')}`
          }));
        }
      }
    }

    // Update hourly rate when project changes
    if (field === 'projectId') {
      const project = projects?.find(p => p?.id === value);
      if (project) {
        setFormData(prev => ({
          ...prev,
          hourlyRate: project?.hourlyRate,
          clientId: project?.clientId || ''
        }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData?.date) newErrors.date = 'Datum is verplicht';
    if (!formData?.projectId) newErrors.projectId = 'Project is verplicht';
    if (!formData?.description?.trim()) newErrors.description = 'Beschrijving is verplicht';

    if (useTimeRange) {
      if (!formData?.startTime) newErrors.startTime = 'Starttijd is verplicht';
      if (!formData?.endTime) newErrors.endTime = 'Eindtijd is verplicht';
      if (formData?.startTime && formData?.endTime) {
        const start = new Date(`2000-01-01T${formData.startTime}`);
        const end = new Date(`2000-01-01T${formData.endTime}`);
        if (end <= start) {
          newErrors.endTime = 'Eindtijd moet na starttijd zijn';
        }
      }
    } else {
      if (!formData?.duration) {
        newErrors.duration = 'Duur is verplicht';
      } else {
        const durationPattern = /^(\d+):([0-5]\d)$/;
        if (!durationPattern?.test(formData?.duration)) {
          newErrors.duration = 'Gebruik formaat H:MM (bijv. 2:30)';
        }
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = (e) => {
    e?.preventDefault();
    
    if (!validateForm()) return;

    const project = projects?.find(p => p?.id === formData?.projectId);
    const client = clients?.find(c => c?.id === formData?.clientId);

    let durationInSeconds;
    if (useTimeRange) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      durationInSeconds = (end - start) / 1000;
    } else {
      const [hours, minutes] = formData?.duration?.split(':')?.map(Number);
      durationInSeconds = (hours * 3600) + (minutes * 60);
    }

    const amount = (durationInSeconds / 3600) * formData?.hourlyRate;

    const timeEntry = {
      id: Date.now(),
      date: formData?.date,
      project: project?.name || '',
      client: client?.name || '',
      description: formData?.description,
      duration: durationInSeconds,
      billable: formData?.billable,
      hourlyRate: formData?.hourlyRate,
      amount: amount?.toFixed(2),
      startTime: useTimeRange ? new Date(`${formData.date}T${formData.startTime}`) : null,
      endTime: useTimeRange ? new Date(`${formData.date}T${formData.endTime}`) : null
    };

    onAddEntry(timeEntry);
    onClose();
  };

  const projectOptions = projects?.map(project => ({
    value: project?.id,
    label: `${project?.name} (€${project?.hourlyRate}/uur)`,
    description: project?.client
  }));

  const clientOptions = clients?.map(client => ({
    value: client?.id,
    label: client?.name,
    description: client?.email
  }));

  const calculateEstimatedAmount = () => {
    let hours = 0;
    if (useTimeRange && formData?.startTime && formData?.endTime) {
      const start = new Date(`2000-01-01T${formData.startTime}`);
      const end = new Date(`2000-01-01T${formData.endTime}`);
      if (end > start) {
        hours = (end - start) / (1000 * 60 * 60);
      }
    } else if (!useTimeRange && formData?.duration) {
      const [h, m] = formData?.duration?.split(':')?.map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        hours = h + (m / 60);
      }
    }
    return (hours * formData?.hourlyRate)?.toFixed(2);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000">
      <div className="bg-card border border-border rounded-lg shadow-elevation-3 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-xl font-semibold text-foreground">Handmatige Tijdregistratie</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            iconName="X"
            iconSize={20}
          />
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Date and Project */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Datum"
              type="date"
              value={formData?.date}
              onChange={(e) => handleInputChange('date', e?.target?.value)}
              error={errors?.date}
              required
            />
            <Select
              label="Project"
              placeholder="Selecteer project"
              options={projectOptions}
              value={formData?.projectId}
              onChange={(value) => handleInputChange('projectId', value)}
              error={errors?.projectId}
              required
              searchable
            />
          </div>

          {/* Client and Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select
              label="Klant (optioneel)"
              placeholder="Selecteer klant"
              options={clientOptions}
              value={formData?.clientId}
              onChange={(value) => handleInputChange('clientId', value)}
              searchable
            />
            <Input
              label="Beschrijving"
              type="text"
              placeholder="Wat heb je gedaan?"
              value={formData?.description}
              onChange={(e) => handleInputChange('description', e?.target?.value)}
              error={errors?.description}
              required
            />
          </div>

          {/* Time Input Method Toggle */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <Checkbox
                label="Gebruik start- en eindtijd"
                checked={useTimeRange}
                onChange={(e) => setUseTimeRange(e?.target?.checked)}
              />
            </div>

            {useTimeRange ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Starttijd"
                  type="time"
                  value={formData?.startTime}
                  onChange={(e) => handleInputChange('startTime', e?.target?.value)}
                  error={errors?.startTime}
                  required
                />
                <Input
                  label="Eindtijd"
                  type="time"
                  value={formData?.endTime}
                  onChange={(e) => handleInputChange('endTime', e?.target?.value)}
                  error={errors?.endTime}
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Duur"
                  type="text"
                  placeholder="H:MM (bijv. 2:30)"
                  value={formData?.duration}
                  onChange={(e) => handleInputChange('duration', e?.target?.value)}
                  error={errors?.duration}
                  description="Gebruik formaat uren:minuten"
                  required
                />
                <div></div>
              </div>
            )}
          </div>

          {/* Billing Settings */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Uurtarief (€)"
              type="number"
              min="0"
              step="0.01"
              value={formData?.hourlyRate}
              onChange={(e) => handleInputChange('hourlyRate', parseFloat(e?.target?.value) || 0)}
            />
            <div className="flex items-end">
              <Checkbox
                label="Factureerbaar"
                checked={formData?.billable}
                onChange={(e) => handleInputChange('billable', e?.target?.checked)}
              />
            </div>
          </div>

          {/* Estimated Amount */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Geschat bedrag:</span>
              <span className="text-lg font-semibold text-foreground">
                €{calculateEstimatedAmount()}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Annuleren
            </Button>
            <Button
              type="submit"
              variant="default"
              iconName="Plus"
              iconPosition="left"
              iconSize={16}
            >
              Registratie Toevoegen
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualEntryForm;