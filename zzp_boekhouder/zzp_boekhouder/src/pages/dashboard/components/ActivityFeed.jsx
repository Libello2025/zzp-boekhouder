import React from 'react';
import Icon from '../../../components/AppIcon';

const ActivityFeed = () => {
  const activities = [];

  const getColorClasses = (color) => {
    switch (color) {
      case 'success':
        return 'bg-success/10 text-success';
      case 'warning':
        return 'bg-warning/10 text-warning';
      case 'error':
        return 'bg-error/10 text-error';
      case 'secondary':
        return 'bg-secondary/10 text-secondary';
      default:
        return 'bg-primary/10 text-primary';
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const diff = now - date;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours === 0) {
      return `${minutes} min geleden`;
    } else if (hours < 24) {
      return `${hours} uur geleden`;
    } else {
      return date?.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' });
    }
  };

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-elevation-1">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-foreground">Recente Activiteiten</h2>
        <button className="text-sm text-primary hover:text-primary/80 font-medium">
          Alles bekijken
        </button>
      </div>
      <div className="space-y-4">
        {activities?.length === 0 ? (
          <div className="text-center py-12">
            <Icon name="Activity" size={48} className="mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="text-lg font-medium text-foreground mb-2">Nog geen activiteiten</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Je recente activiteiten verschijnen hier zodra je transacties, facturen of andere acties uitvoert
            </p>
            <button className="text-sm text-primary hover:text-primary/80 font-medium">
              Voeg je eerste transactie toe
            </button>
          </div>
        ) : (
          activities?.map((activity) => (
            <div key={activity?.id} className="flex items-start space-x-4 p-3 hover:bg-muted/50 rounded-lg transition-colors duration-200">
              <div className={`p-2 rounded-lg ${getColorClasses(activity?.color)} flex-shrink-0`}>
                <Icon name={activity?.icon} size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-foreground truncate">{activity?.title}</h3>
                  {activity?.amount && (
                    <span className="text-sm font-semibold text-foreground ml-2">{activity?.amount}</span>
                  )}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{activity?.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{formatTime(activity?.timestamp)}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ActivityFeed;