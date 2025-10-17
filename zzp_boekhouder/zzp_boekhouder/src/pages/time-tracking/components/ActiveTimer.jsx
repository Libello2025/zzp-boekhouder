import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

const ActiveTimer = ({ onTimeEntry, projects, clients }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedClient, setSelectedClient] = useState('');
  const [taskDescription, setTaskDescription] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [lastActiveTime, setLastActiveTime] = useState(Date.now());

  // Timer effect
  useEffect(() => {
    let interval = null;
    if (isRunning && !isPaused) {
      interval = setInterval(() => {
        setSeconds(seconds => seconds + 1);
      }, 1000);
    } else if (!isRunning) {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isRunning, isPaused]);

  // Idle detection
  useEffect(() => {
    const handleActivity = () => {
      setLastActiveTime(Date.now());
    };

    const checkIdle = () => {
      if (isRunning && !isPaused) {
        const idleTime = Date.now() - lastActiveTime;
        if (idleTime > 300000) { // 5 minutes
          setIsPaused(true);
        }
      }
    };

    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events?.forEach(event => {
      document.addEventListener(event, handleActivity, true);
    });

    const idleInterval = setInterval(checkIdle, 60000); // Check every minute

    return () => {
      events?.forEach(event => {
        document.removeEventListener(event, handleActivity, true);
      });
      clearInterval(idleInterval);
    };
  }, [isRunning, isPaused, lastActiveTime]);

  const formatTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const secs = totalSeconds % 60;
    return `${hours?.toString()?.padStart(2, '0')}:${minutes?.toString()?.padStart(2, '0')}:${secs?.toString()?.padStart(2, '0')}`;
  };

  const handleStart = () => {
    if (!selectedProject) {
      alert('Selecteer eerst een project');
      return;
    }
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const handlePause = () => {
    setIsPaused(!isPaused);
  };

  const handleStop = () => {
    if (seconds > 0 && selectedProject) {
      const project = projects?.find(p => p?.id === selectedProject);
      const client = clients?.find(c => c?.id === selectedClient);
      
      const timeEntry = {
        id: Date.now(),
        date: new Date()?.toISOString()?.split('T')?.[0],
        project: project?.name || '',
        client: client?.name || '',
        description: taskDescription || 'Geen beschrijving',
        duration: seconds,
        billable: true,
        hourlyRate: project?.hourlyRate || 75,
        amount: ((seconds / 3600) * (project?.hourlyRate || 75))?.toFixed(2),
        startTime: startTime,
        endTime: new Date()
      };
      
      onTimeEntry(timeEntry);
    }
    
    setIsRunning(false);
    setIsPaused(false);
    setSeconds(0);
    setTaskDescription('');
    setStartTime(null);
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

  const currentProject = projects?.find(p => p?.id === selectedProject);
  const estimatedAmount = currentProject ? ((seconds / 3600) * currentProject?.hourlyRate)?.toFixed(2) : '0.00';

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-2">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-semibold text-foreground">Actieve Timer</h2>
        {isPaused && (
          <div className="flex items-center space-x-2 text-warning">
            <Icon name="Pause" size={16} />
            <span className="text-sm font-medium">Gepauzeerd (inactief)</span>
          </div>
        )}
      </div>
      {/* Timer Display */}
      <div className="text-center mb-8">
        <div className="text-6xl font-mono font-bold text-foreground mb-2">
          {formatTime(seconds)}
        </div>
        {currentProject && (
          <div className="text-lg text-muted-foreground">
            Geschat bedrag: €{estimatedAmount}
          </div>
        )}
      </div>
      {/* Project and Client Selection */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Select
          label="Project"
          placeholder="Selecteer project"
          options={projectOptions}
          value={selectedProject}
          onChange={setSelectedProject}
          required
          searchable
          disabled={isRunning}
        />
        <Select
          label="Klant (optioneel)"
          placeholder="Selecteer klant"
          options={clientOptions}
          value={selectedClient}
          onChange={setSelectedClient}
          searchable
          disabled={isRunning}
        />
      </div>
      {/* Task Description */}
      <div className="mb-6">
        <Input
          label="Taak beschrijving"
          type="text"
          placeholder="Waar werk je aan?"
          value={taskDescription}
          onChange={(e) => setTaskDescription(e?.target?.value)}
          disabled={isRunning && !isPaused}
        />
      </div>
      {/* Timer Controls */}
      <div className="flex justify-center space-x-4">
        {!isRunning ? (
          <Button
            variant="default"
            size="lg"
            onClick={handleStart}
            iconName="Play"
            iconPosition="left"
            iconSize={20}
            disabled={!selectedProject}
            className="px-8 py-3"
          >
            Start Timer
          </Button>
        ) : (
          <>
            <Button
              variant={isPaused ? "default" : "secondary"}
              size="lg"
              onClick={handlePause}
              iconName={isPaused ? "Play" : "Pause"}
              iconPosition="left"
              iconSize={20}
              className="px-6 py-3"
            >
              {isPaused ? 'Hervatten' : 'Pauzeren'}
            </Button>
            <Button
              variant="destructive"
              size="lg"
              onClick={handleStop}
              iconName="Square"
              iconPosition="left"
              iconSize={20}
              className="px-6 py-3"
            >
              Stoppen
            </Button>
          </>
        )}
      </div>
      {/* Session Info */}
      {isRunning && startTime && (
        <div className="mt-6 pt-4 border-t border-border">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Gestart om: {startTime?.toLocaleTimeString('nl-NL')}</span>
            <span>Project: {currentProject?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ActiveTimer;