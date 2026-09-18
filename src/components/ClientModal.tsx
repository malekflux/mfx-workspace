import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Client } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client | null;
  onAddProject?: (client: Client) => void;
}

export const ClientModal: React.FC<ClientModalProps> = ({
  isOpen,
  onClose,
  client,
  onAddProject,
}) => {
  const { addClient, updateClient } = useStore();
  const [formData, setFormData] = useState({
    namePrimary: '',
    nameSecondary: '',
    companyPrimary: '',
    companySecondary: '',
    email: '',
    phone: '',
    country: 'Egypt',
    city: 'Cairo',
  });

  useEffect(() => {
    if (client) {
      setFormData({
        namePrimary: client.namePrimary || '',
        nameSecondary: client.nameSecondary || '',
        companyPrimary: client.companyPrimary || '',
        companySecondary: client.companySecondary || '',
        email: client.email || '',
        phone: client.phone || '',
        country: client.country || 'Egypt',
        city: client.city || 'Cairo',
      });
    } else {
      setFormData({
        namePrimary: '',
        nameSecondary: '',
        companyPrimary: '',
        companySecondary: '',
        email: '',
        phone: '',
        country: 'Egypt',
        city: 'Cairo',
      });
    }
  }, [client, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namePrimary.trim()) return;

    if (client) {
      updateClient(client.id, formData);
    } else {
      addClient(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">
            {client ? 'Edit Client' : 'Add Client'}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Name (Primary) *
              </label>
              <input
                type="text"
                required
                value={formData.namePrimary}
                onChange={(e) => setFormData({ ...formData, namePrimary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Name (Secondary)
              </label>
              <input
                type="text"
                value={formData.nameSecondary}
                onChange={(e) => setFormData({ ...formData, nameSecondary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Company (Primary)
              </label>
              <input
                type="text"
                value={formData.companyPrimary}
                onChange={(e) => setFormData({ ...formData, companyPrimary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Company (Secondary)
              </label>
              <input
                type="text"
                value={formData.companySecondary}
                onChange={(e) => setFormData({ ...formData, companySecondary: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Phone
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Country
              </label>
              <input
                type="text"
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                City
              </label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            {client && onAddProject ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddProject(client);
                }}
                className="px-3 py-2 rounded-lg text-xs font-medium text-brand-primary hover:bg-brand-primary/10 transition-colors"
              >
                + Add Project
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors"
              >
                {client ? 'Save Changes' : 'Add Client'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};