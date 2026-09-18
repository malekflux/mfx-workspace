import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import { services as initialServices } from '../data/services';
import type { Service } from '../types';

export const ServiceCatalog: React.FC = () => {
  const [servicesList, setServicesList] = useState<Service[]>(initialServices);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    code: '',
    categoryPrimary: '',
    categorySecondary: '',
    titlePrimary: '',
    titleSecondary: '',
    descriptionPrimary: '',
    descriptionSecondary: '',
    basePrice: 0,
    unit: 'project',
  });

  const categories = Array.from(new Set(servicesList.map((s) => s.categoryPrimary).filter(Boolean)));

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      code: `SRV-${servicesList.length + 1}`,
      categoryPrimary: 'General',
      categorySecondary: 'General',
      titlePrimary: '',
      titleSecondary: '',
      descriptionPrimary: '',
      descriptionSecondary: '',
      basePrice: 0,
      unit: 'project',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      code: service.code || '',
      categoryPrimary: service.categoryPrimary || '',
      categorySecondary: service.categorySecondary || '',
      titlePrimary: service.titlePrimary || '',
      titleSecondary: service.titleSecondary || '',
      descriptionPrimary: service.descriptionPrimary || '',
      descriptionSecondary: service.descriptionSecondary || '',
      basePrice: service.basePrice || 0,
      unit: service.unit || 'project',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.titlePrimary.trim()) return;

    if (editingService) {
      setServicesList((prev) =>
        prev.map((s) =>
          s.id === editingService.id
            ? {
                ...s,
                ...formData,
              }
            : s
        )
      );
    } else {
      const newService: Service = {
        id: `srv-${Date.now()}`,
        ...formData,
        deliverables: [],
        timelineEstimatePrimary: '2-4 weeks',
        timelineEstimateSecondary: '2-4 weeks',
      };
      setServicesList((prev) => [newService, ...prev]);
    }
    handleCloseModal();
  };

  const filteredServices = servicesList.filter((s) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      s.titlePrimary.toLowerCase().includes(term) ||
      (s.titleSecondary && s.titleSecondary.toLowerCase().includes(term)) ||
      s.descriptionPrimary.toLowerCase().includes(term);
    const matchesCategory = selectedCategory === 'all' || s.categoryPrimary === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search services..."
              className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-hover border border-border text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:border-brand-primary"
            />
            <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-brand-primary text-white'
                  : 'text-text-secondary hover:bg-surface-hover'
              }`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-brand-primary text-white'
                    : 'text-text-secondary hover:bg-surface-hover'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Service</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service) => (
          <div
            key={service.id}
            className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between hover:border-brand-primary/50 transition-colors"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-surface-hover text-text-secondary border border-border">
                  {service.categoryPrimary}
                </span>
                <span className="text-[11px] font-mono text-text-secondary">
                  {service.code}
                </span>
              </div>

              <h4 className="text-base font-semibold text-text-primary mb-1">
                {service.titlePrimary}
              </h4>
              {service.titleSecondary && (
                <p className="text-xs text-text-secondary mb-2">
                  {service.titleSecondary}
                </p>
              )}
              <p className="text-xs text-text-secondary line-clamp-3 mb-4">
                {service.descriptionPrimary}
              </p>
            </div>

            <div className="pt-3 border-t border-border flex items-center justify-between mt-auto">
              <span className="text-sm font-bold text-brand-primary">
                ${service.basePrice.toLocaleString()}
              </span>
              <button
                type="button"
                onClick={() => handleOpenEdit(service)}
                className="px-3 py-1 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
              >
                Edit
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="relative w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">
                {editingService ? 'Edit Service' : 'Add Service'}
              </h3>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-text-secondary hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Title (Primary) *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.titlePrimary}
                    onChange={(e) => setFormData({ ...formData, titlePrimary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Title (Secondary)
                  </label>
                  <input
                    type="text"
                    value={formData.titleSecondary}
                    onChange={(e) => setFormData({ ...formData, titleSecondary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Category (Primary)
                  </label>
                  <input
                    type="text"
                    value={formData.categoryPrimary}
                    onChange={(e) => setFormData({ ...formData, categoryPrimary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Base Price ($)
                  </label>
                  <input
                    type="number"
                    value={formData.basePrice}
                    onChange={(e) => setFormData({ ...formData, basePrice: Number(e.target.value) || 0 })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Description (Primary)
                </label>
                <textarea
                  rows={3}
                  value={formData.descriptionPrimary}
                  onChange={(e) => setFormData({ ...formData, descriptionPrimary: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-4 border-t border-border">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-text-secondary hover:bg-surface-hover transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg text-xs font-medium text-white bg-brand-primary hover:bg-brand-primary/90 transition-colors"
                >
                  {editingService ? 'Save Changes' : 'Add Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};