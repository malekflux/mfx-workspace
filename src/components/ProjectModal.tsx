import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Project } from '../types';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project | null;
  clientId?: string;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  clientId,
}) => {
  const { clients, addProject, updateProject } = useStore();
  const [formData, setFormData] = useState({
    namePrimary: '',
    nameSecondary: '',
    clientId: clientId || '',
    billingModel: 'fixed' as Project['billingModel'],
    currency: 'USD' as Project['currency'],
    scopeSummaryPrimary: '',
    scopeSummarySecondary: '',
    total: 0,
    paidAmount: 0,
  });

  useEffect(() => {
    if (project) {
      setFormData({
        namePrimary: project.namePrimary || '',
        nameSecondary: project.nameSecondary || '',
        clientId: project.clientId || '',
        billingModel: project.billingModel || 'fixed',
        currency: project.currency || 'USD',
        scopeSummaryPrimary: project.scopeSummaryPrimary || '',
        scopeSummarySecondary: project.scopeSummarySecondary || '',
        total: project.total || 0,
        paidAmount: project.paidAmount || 0,
      });
    } else {
      setFormData({
        namePrimary: '',
        nameSecondary: '',
        clientId: clientId || (clients[0]?.id || ''),
        billingModel: 'fixed',
        currency: 'USD',
        scopeSummaryPrimary: '',
        scopeSummarySecondary: '',
        total: 0,
        paidAmount: 0,
      });
    }
  }, [project, clients, clientId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namePrimary.trim() || !formData.clientId) return;

    if (project) {
      updateProject(project.id, formData);
    } else {
      addProject({
        ...formData,
        services: [],
      });
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="text-lg font-semibold text-text-primary">
            {project ? 'Edit Project' : 'Add Project'}
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
                Project Name (Primary) *
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
                Project Name (Secondary)
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
                Client *
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              >
                <option value="" disabled>Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.namePrimary} {c.companyPrimary ? `(${c.companyPrimary})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Billing Model
              </label>
              <select
                value={formData.billingModel}
                onChange={(e) => setFormData({ ...formData, billingModel: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              >
                <option value="fixed">Fixed</option>
                <option value="monthly-retainer">Monthly Retainer</option>
                <option value="milestone">Milestone</option>
                <option value="time-and-materials">Time & Materials</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Currency
              </label>
              <select
                value={formData.currency}
                onChange={(e) => setFormData({ ...formData, currency: e.target.value as any })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="EGP">EGP</option>
                <option value="SAR">SAR</option>
                <option value="AED">AED</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Total Budget
              </label>
              <input
                type="number"
                value={formData.total}
                onChange={(e) => setFormData({ ...formData, total: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-text-secondary mb-1">
                Paid Amount
              </label>
              <input
                type="number"
                value={formData.paidAmount}
                onChange={(e) => setFormData({ ...formData, paidAmount: Number(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Scope Summary (Primary)
            </label>
            <textarea
              rows={3}
              value={formData.scopeSummaryPrimary}
              onChange={(e) => setFormData({ ...formData, scopeSummaryPrimary: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm resize-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
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
              {project ? 'Save Changes' : 'Add Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};