import React from 'react';
import Icon from '../../../components/AppIcon';

const UpcomingDeadlines = () => {
  const deadlines = [];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-error bg-error/10';
      case 'medium':
        return 'text-warning bg-warning/10';
      case 'low':
        return 'text-success bg-success/10';
      default:
        return 'text-muted-foreground bg-muted';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'tax':
        return 'FileText';
      case 'invoice':
        return 'Clock';
      default:
        return 'Calendar';
    }
  };

  const getDaysUntil = (date) => {
    const now = new Date();
    const diffTime = date - now;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'Verlopen';
    if (diffDays === 0) return 'Vandaag';
    if (diffDays === 1) return 'Morgen';
    return `${diffDays} dagen`;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Aankomende Deadlines</h2>
        <Icon name="Calendar" size={20} className="text-muted-foreground" />
      </div>
      <div className="space-y-4">
        {deadlines?.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Calendar" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Geen deadlines</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Je belasting deadlines, factuur vervaldatums en andere belangrijke datums verschijnen hier
            </p>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Voeg een deadline toe
            </button>
          </div>
        ) : (
          deadlines?.map((deadline) => (
            <div key={deadline?.id} className="flex items-start space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
              <div className={`p-2 rounded-lg ${getPriorityColor(deadline?.priority)} flex-shrink-0`}>
                <Icon name={getTypeIcon(deadline?.type)} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground truncate">{deadline?.title}</h3>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${getPriorityColor(deadline?.priority)}`}>
                    {getDaysUntil(deadline?.dueDate)}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">{deadline?.description}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {deadline?.dueDate?.toLocaleDateString('nl-NL', { 
                    day: '2-digit', 
                    month: 'long', 
                    year: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default UpcomingDeadlines;