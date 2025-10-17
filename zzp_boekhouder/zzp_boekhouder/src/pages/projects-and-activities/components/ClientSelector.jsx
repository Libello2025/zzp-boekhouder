import React, { useState, useEffect } from 'react';
import { X, Plus, User, Mail, Phone, Building, MapPin, AlertCircle } from 'lucide-react';
import projectsService from '../../../services/projectsService';

const ClientSelector = ({ onSelect, onClose, allowCreate = false, selectedClientId = null }) => {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Create form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    notes: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Load clients on mount
  React.useEffect(() => {
    loadClients();
  }, []);

  const loadClients = async () => {
    setLoading(true);
    try {
      const result = await projectsService?.getClients();
      if (!result?.error) {
        setClients(result?.data || []);
      }
    } catch (error) {
      console.error('Failed to load clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData?.name?.trim()) {
      errors.name = 'Client name is required';
    }
    
    if (formData?.email && !/\S+@\S+\.\S+/?.test(formData?.email)) {
      errors.email = 'Please enter a valid email address';
    }

    setFormErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleCreateSubmit = async (e) => {
    e?.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setCreating(true);
    try {
      const result = await projectsService?.createClient(formData);
      
      if (result?.error) {
        setFormErrors({ submit: result?.error });
        return;
      }

      // Add new client to list and select it
      const newClient = result?.data;
      setClients(prev => [...prev, newClient]);
      onSelect?.(newClient);
    } catch (error) {
      console.error('Failed to create client:', error);
      setFormErrors({ submit: 'Failed to create client. Please try again.' });
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (formErrors?.[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  // Filter clients based on search term
  const filteredClients = clients?.filter(client => 
    client?.name?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    client?.email?.toLowerCase()?.includes(searchTerm?.toLowerCase()) ||
    client?.company?.toLowerCase()?.includes(searchTerm?.toLowerCase())
  ) || [];

  if (showCreateForm) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
        <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Create New Client</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Client Name *
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData?.name}
                  onChange={(e) => handleInputChange('name', e?.target?.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors?.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Enter client name"
                />
              </div>
              {formErrors?.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors?.name}
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="email"
                  value={formData?.email}
                  onChange={(e) => handleInputChange('email', e?.target?.value)}
                  className={`w-full pl-10 pr-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formErrors?.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="client@example.com"
                />
              </div>
              {formErrors?.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-1" />
                  {formErrors?.email}
                </p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="tel"
                  value={formData?.phone}
                  onChange={(e) => handleInputChange('phone', e?.target?.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+31 6 1234 5678"
                />
              </div>
            </div>

            {/* Company */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              <div className="relative">
                <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={formData?.company}
                  onChange={(e) => handleInputChange('company', e?.target?.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Company name"
                />
              </div>
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Address
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <textarea
                  value={formData?.address}
                  onChange={(e) => handleInputChange('address', e?.target?.value)}
                  rows={2}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Street address, city, postal code"
                />
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData?.notes}
                onChange={(e) => handleInputChange('notes', e?.target?.value)}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Additional notes about the client"
              />
            </div>

            {/* Error Message */}
            {formErrors?.submit && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <p className="text-sm text-red-600 flex items-center">
                  <AlertCircle className="w-4 h-4 mr-2" />
                  {formErrors?.submit}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {creating ? 'Creating...' : 'Create Client'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Select Client</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-6 border-b border-gray-200">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e?.target?.value)}
            placeholder="Search clients..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Client List */}
        <div className="max-h-64 overflow-y-auto">
          {loading ? (
            <div className="p-6 text-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-sm text-gray-600">Loading clients...</p>
            </div>
          ) : filteredClients?.length === 0 ? (
            <div className="p-6 text-center">
              <User className="mx-auto h-8 w-8 text-gray-400 mb-4" />
              <h3 className="text-sm font-medium text-gray-900 mb-2">
                {searchTerm ? 'No clients found' : 'No clients yet'}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {searchTerm 
                  ? 'Try adjusting your search terms.' :'Create your first client to get started.'
                }
              </p>
              {allowCreate && (
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Client
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {filteredClients?.map((client) => (
                <button
                  key={client?.id}
                  onClick={() => onSelect?.(client)}
                  className={`w-full text-left p-4 hover:bg-gray-50 transition-colors ${
                    selectedClientId === client?.id ? 'bg-blue-50 border-r-4 border-blue-600' : ''
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                      {client?.company ? (
                        <Building className="w-5 h-5 text-gray-600" />
                      ) : (
                        <User className="w-5 h-5 text-gray-600" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {client?.name}
                      </p>
                      {client?.company && (
                        <p className="text-xs text-gray-500 truncate">
                          {client?.company}
                        </p>
                      )}
                      {client?.email && (
                        <p className="text-xs text-blue-600 truncate">
                          {client?.email}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {allowCreate && !loading && (
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create New Client
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientSelector;