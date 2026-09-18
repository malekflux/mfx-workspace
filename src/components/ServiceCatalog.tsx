import React, { useState } from 'react';
import { Plus, Search, X } from 'lucide-react';
import type { Service } from '../types';

const INITIAL_SERVICES: Service[] = [
  {
    id: 'srv-1',
    category: 'Branding',
    titleAr: 'الهوية البصرية المتكاملة',
    titleEn: 'Visual Identity System',
    descriptionAr: 'تصميم الشعار، منظومة الألوان والخطوط، ودليل استخدام الهوية الكامل.',
    descriptionEn: 'Logo design, color palette, typography guidelines, and brand book.',
    basePrice: 1500,
  },
  {
    id: 'srv-2',
    category: 'Development',
    titleAr: 'تصميم وتطوير واجهات المستخدم',
    titleEn: 'UI/UX & Web Development',
    descriptionAr: 'واجهات وتطبيقات تفاعلية متجاوبة مبنية بأحدث التقنيات وبأعلى معايير الأداء.',
    descriptionEn: 'Interactive and responsive web apps built with modern tech stacks.',
    basePrice: 2500,
  },
  {
    id: 'srv-3',
    category: 'Marketing',
    titleAr: 'إدارة الحملات والنمو الرقمي',
    titleEn: 'Performance Marketing & Ads',
    descriptionAr: 'إطلاق وتوجيه الحملات المدفوعة على منصات Meta وجوجل وتحسين الـ ROAS.',
    descriptionEn: 'Paid campaign execution across Meta and Google targeting high ROAS.',
    basePrice: 1200,
  },
];

export const ServiceCatalog: React.FC = () => {
  const [servicesList, setServicesList] = useState<Service[]>(INITIAL_SERVICES);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);

  const [formData, setFormData] = useState({
    category: 'General',
    titleAr: '',
    titleEn: '',
    descriptionAr: '',
    descriptionEn: '',
    basePrice: 0,
  });

  const categories = Array.from(new Set(servicesList.map((s) => s.category).filter(Boolean)));

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      category: 'General',
      titleAr: '',
      titleEn: '',
      descriptionAr: '',
      descriptionEn: '',
      basePrice: 0,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: Service) => {
    setEditingService(service);
    setFormData({
      category: service.category || 'General',
      titleAr: service.titleAr || '',
      titleEn: service.titleEn || '',
      descriptionAr: service.descriptionAr || '',
      descriptionEn: service.descriptionEn || '',
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
    if (!formData.titleAr.trim() && !formData.titleEn.trim()) return;

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
    const matchesSearch =
      (s.titleAr && s.titleAr.toLowerCase().includes(term)) ||
      (s.titleEn && s.titleEn.toLowerCase().includes(term)) ||
      (s.descriptionAr && s.descriptionAr.toLowerCase().includes(term)) ||
      (s.descriptionEn && s.descriptionEn.toLowerCase().includes(term));
    const matchesCategory = selectedCategory === 'all' || s.category === selectedCategory;
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
                  {service.category}
                </span>
              </div>

              <h4 className="text-base font-semibold text-text-primary mb-1">
                {service.titleEn || service.titleAr}
              </h4>
              {service.titleAr && service.titleEn && (
                <p className="text-xs text-text-secondary mb-2" dir="rtl">
                  {service.titleAr}
                </p>
              )}
              <p className="text-xs text-text-secondary line-clamp-3 mb-4">
                {service.descriptionEn || service.descriptionAr}
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
                    Title (English)
                  </label>
                  <input
                    type="text"
                    value={formData.titleEn}
                    onChange={(e) => setFormData({ ...formData, titleEn: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Title (Arabic)
                  </label>
                  <input
                    type="text"
                    dir="rtl"
                    value={formData.titleAr}
                    onChange={(e) => setFormData({ ...formData, titleAr: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-surface-hover border border-border text-text-primary focus:outline-none focus:border-brand-primary text-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-text-secondary mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
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
                  Description (English)
                </label>
                <textarea
                  rows={2}
                  value={formData.descriptionEn}
                  onChange={(e) => setFormData({ ...formData, descriptionEn: e.target.value })}
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