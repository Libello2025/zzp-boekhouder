import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const DeleteConfirmModal = ({ client, isOpen, onConfirm, onCancel, isDeleting }) => {
  if (!isOpen || !client) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-1100 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-md">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
              <Icon name="AlertTriangle" size={24} className="text-error" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-foreground">Klant verwijderen</h3>
              <p className="text-sm text-muted-foreground">Deze actie kan niet ongedaan worden gemaakt</p>
            </div>
          </div>

          <div className="mb-6">
            <p className="text-foreground mb-2">
              Weet je zeker dat je <strong>{client?.name}</strong> wilt verwijderen?
            </p>
            <p className="text-sm text-muted-foreground">
              Alle gekoppelde gegevens zoals facturen, projecten en betalingshistorie blijven behouden, 
              maar de klantgegevens worden permanent verwijderd.
            </p>
          </div>

          <div className="flex items-center justify-end space-x-3">
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isDeleting}
            >
              Annuleren
            </Button>
            <Button
              variant="destructive"
              onClick={onConfirm}
              loading={isDeleting}
              iconName="Trash2"
              iconPosition="left"
            >
              Definitief verwijderen
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;