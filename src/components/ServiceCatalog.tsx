import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { Service } from '../types';

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    name: 'Brand Identity & Visual System',
    description: 'Logo design, color palette, typography guidelines, and brand system.',
    descriptionAr: 'تصميم الشعار، منظومة الألوان والخطوط، ودليل استخدام الهوية الكامل.',
    basePrice: 1500,
  },
  {
    id: 'srv-2',
    name: 'UI/UX Design & Web Platform',
    description: 'Interactive and responsive web applications built with modern frameworks.',
    descriptionAr: 'تصميم وتطوير واجهات وتطبيقات تفاعلية متجاوبة بأعلى معايير الأداء.',
    basePrice: 2500,
  },
  {
    id: 'srv-3',
    name: 'Performance Marketing & Campaigns',
    description: 'Paid campaign execution across digital channels targeting maximum ROAS.',
    descriptionAr: 'إطلاق وتوجيه الحملات الإعلانية المدفوعة وتحسين العائد الإعلاني ومعدلات التحويل.',
    basePrice: 1200,
  },
];

export const ServiceCatalog: React.FC = () => {
  const [servicesList, setServicesList] = useState<Service[]>(INITIAL_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    descriptionAr: '',
    basePrice: 0,
  });

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      name: '',
      description: '',
      descriptionAr: '',
      basePrice: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name || '',
      description: service.description || '',
      descriptionAr: service.descriptionAr || '',
      basePrice: service.basePrice || 0,
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

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
      };
      setServicesList((prev) => [newService, ...prev]);
    }
    handleCloseModal();
  };

  const filteredServices = servicesList.filter((s) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = s.name.toLowerCase().includes(term);
    const descMatch = s.description ? s.description.toLowerCase().includes(term) : false;
    const descArMatch = s.descriptionAr ? s.descriptionAr.toLowerCase().includes(term) : false;
    return nameMatch || descMatch || descArMatch;
  });

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-surface p-4 rounded-xl border border-border">
        <div className="relative w-full sm:w-80">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search services..."
            className="w-full pl-9 pr-4 py-2 rounded-lg bg-surface-hover border border-border text-text-primary placeholder-text-secondary text-sm focus:outline-none focus:border-brand-primary"
          />
          <Search className="w-4 h-4 text-text-secondary absolute left-3 top-2.5" />
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
              <h4 className="text-base font-semibold text-text-primary mb-1">
                {service.name}
              </h4>
              {service.description && (
                <p className="text-xs text-text-secondary line-clamp-2 mb-2">
                  {service.description}
                </p>
              )}
              {service.descriptionAr && (
                <p className="text-xs text-text-secondary/80 line-clamp-2 mb-4" dir="rtl">
                  {service.descriptionAr}
                </p>
              )}
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
              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Service Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Media Buying Campaign"
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

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-text-secondary mb-1">
                  Description (Arabic)
                </label>
                <textarea
                  rows={2}
                  dir="rtl"
                  value={formData.descriptionAr}
                  onChange={(e) => setFormData({ ...formData, descriptionAr: e.target.value })}
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