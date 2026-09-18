import React, { useState } from 'react';
import { 
  Plus, Edit2, Trash2, Check, X, Search, 
  Layers, DollarSign, Tag, Sparkles
} from 'lucide-react';
import { defaultServices } from '../data/services';
import type { Service } from '../types';

export const ServiceCatalog: React.FC = () => {
  const [servicesList, setServicesList] = useState<any[]>(() => {
    return Array.isArray(defaultServices) ? defaultServices : [];
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any | null>(null);
  
  const [formData, setFormData] = useState({
    namePrimary: '',
    nameSecondary: '',
    category: '',
    rate: '',
    description: '',
    deliverables: '',
  });

  const categories: string[] = Array.from(
    new Set(
      servicesList
        .map((s: any) => s.category || s.categoryPrimary || '')
        .filter((c: string) => Boolean(c))
    )
  );

  const handleOpenAdd = () => {
    setEditingService(null);
    setFormData({
      namePrimary: '',
      nameSecondary: '',
      category: '',
      rate: '',
      description: '',
      deliverables: '',
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (service: any) => {
    setEditingService(service);
    setFormData({
      namePrimary: service.namePrimary || service.name || '',
      nameSecondary: service.nameSecondary || '',
      category: service.category || service.categoryPrimary || '',
      rate: String(service.rate || service.price || service.basePrice || 0),
      description: service.descriptionPrimary || service.description || '',
      deliverables: Array.isArray(service.deliverables) 
        ? service.deliverables.map((d: any) => typeof d === 'string' ? d : (d.titlePrimary || d.title || '')).join('\n') 
        : '',
    });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingService(null);
  };

  const handleDelete = (id: string | number) => {
    setServicesList((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namePrimary.trim()) return;

    const deliverablesArray = formData.deliverables
      .split('\n')
      .map((d) => d.trim())
      .filter(Boolean)
      .map((item, idx) => ({
        id: `del-${Date.now()}-${idx}`,
        titlePrimary: item,
        titleSecondary: item,
      }));

    const payload: any = {
      id: editingService ? editingService.id : `srv-${Date.now()}`,
      namePrimary: formData.namePrimary.trim(),
      nameSecondary: formData.nameSecondary.trim() || formData.namePrimary.trim(),
      name: formData.namePrimary.trim(),
      category: formData.category.trim() || 'General',
      categoryPrimary: formData.category.trim() || 'General',
      rate: Number(formData.rate) || 0,
      price: Number(formData.rate) || 0,
      basePrice: Number(formData.rate) || 0,
      descriptionPrimary: formData.description.trim(),
      description: formData.description.trim(),
      deliverables: deliverablesArray,
    };

    if (editingService) {
      setServicesList((prev) => prev.map((s) => (s.id === editingService.id ? payload : s)));
    } else {
      setServicesList((prev) => [payload, ...prev]);
    }
    handleCloseModal();
  };

  const filteredServices = servicesList.filter((s: any) => {
    const sName = (s.namePrimary || s.name || '').toLowerCase();
    const sDesc = (s.descriptionPrimary || s.description || '').toLowerCase();
    const sCat = s.category || s.categoryPrimary || '';
    const q = searchTerm.toLowerCase();

    const matchesSearch = sName.includes(q) || sDesc.includes(q);
    const matchesCategory = selectedCategory === 'all' || sCat === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6" dir="rtl">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/40 p-4 rounded-2xl border border-zinc-800/80">
        <div className="flex-1 w-full sm:w-auto flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-72">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن خدمة..."
              className="w-full pl-3.5 pr-10 py-2 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
            <Search className="w-4 h-4 text-zinc-500 absolute right-3.5 top-2.5" />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
            <button
              type="button"
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              الكل
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
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
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-950/40"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة خدمة جديدة</span>
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredServices.map((service: any) => {
          const serviceName = service.namePrimary || service.name || 'خدمة';
          const serviceCat = service.category || service.categoryPrimary || 'عام';
          const serviceDesc = service.descriptionPrimary || service.description || '';
          const servicePrice = service.rate || service.price || service.basePrice || 0;
          const rawDeliverables = Array.isArray(service.deliverables) ? service.deliverables : [];

          return (
            <div
              key={String(service.id)}
              className="group relative bg-zinc-900/60 hover:bg-zinc-900/90 border border-zinc-800/90 hover:border-zinc-700/80 rounded-2xl p-5 flex flex-col justify-between transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-zinc-800 text-zinc-300 border border-zinc-700/60">
                    {serviceCat}
                  </span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(service)}
                      className="p-1.5 text-zinc-400 hover:text-emerald-400 hover:bg-zinc-800 rounded-lg transition"
                      title="تعديل الخدمة"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(service.id)}
                      className="p-1.5 text-zinc-400 hover:text-rose-400 hover:bg-zinc-800 rounded-lg transition"
                      title="حذف الخدمة"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h4 className="text-base font-bold text-zinc-100 mb-1.5 group-hover:text-emerald-400 transition-colors">
                  {serviceName}
                </h4>
                <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2 mb-4">
                  {serviceDesc || 'لا يوجد وصف مضاف لهذه الخدمة.'}
                </p>

                {rawDeliverables.length > 0 && (
                  <div className="space-y-1 mb-4 pt-2 border-t border-zinc-800/60">
                    {rawDeliverables.slice(0, 3).map((item: any, idx: number) => {
                      const text = typeof item === 'string' ? item : (item.titlePrimary || item.title || '');
                      return (
                        <div key={idx} className="flex items-center gap-1.5 text-[11px] text-zinc-400">
                          <Sparkles className="w-3 h-3 text-emerald-500/70 shrink-0" />
                          <span className="truncate">{text}</span>
                        </div>
                      );
                    })}
                    {rawDeliverables.length > 3 && (
                      <span className="text-[10px] text-zinc-500 block pt-0.5">
                        +{rawDeliverables.length - 3} عناصر إضافية
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-zinc-800/80 flex items-center justify-between mt-auto">
                <span className="text-xs text-zinc-500">السعر المقترح</span>
                <span className="text-base font-extrabold text-emerald-400" dir="ltr">
                  ${Number(servicePrice).toLocaleString()}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="p-12 text-center border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/40">
          <Layers className="w-10 h-10 text-zinc-600 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-400">لا توجد خدمات مطابقة</p>
          <p className="text-xs text-zinc-600 mt-1">جرّب البحث بكلمات أخرى أو أضف خدمة جديدة الآن.</p>
        </div>
      )}

      {/* Add / Edit Service Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            dir="rtl"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-zinc-100">
                  {editingService ? 'تعديل الخدمة' : 'إضافة خدمة جديدة'}
                </h3>
              </div>
              <button
                type="button"
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-right">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    اسم الخدمة بالعربية <span className="text-emerald-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.namePrimary}
                    onChange={(e) => setFormData({ ...formData, namePrimary: e.target.value })}
                    placeholder="مثال: إدارة الحملات الإعلانية"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    اسم الخدمة بالإنجليزية
                  </label>
                  <input
                    type="text"
                    value={formData.nameSecondary}
                    onChange={(e) => setFormData({ ...formData, nameSecondary: e.target.value })}
                    placeholder="Media Buying & Ads"
                    dir="ltr"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition text-right"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    التصنيف (Category)
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      placeholder="Marketing, Branding, Web"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                    />
                    <Tag className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                    السعر الافتراضي ($)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={formData.rate}
                      onChange={(e) => setFormData({ ...formData, rate: e.target.value })}
                      placeholder="0.00"
                      className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                    />
                    <DollarSign className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  وصف الخدمة
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="اكتب شرحاً مختصراً عما تقدمه هذه الخدمة..."
                  className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition resize-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                  المخرجات والمسلمات (عنصر في كل سطر)
                </label>
                <textarea
                  rows={3}
                  value={formData.deliverables}
                  onChange={(e) => setFormData({ ...formData, deliverables: e.target.value })}
                  placeholder="إعداد الحملات على Meta Ads&#10;تصميم الكرييتف والفيديو&#10;تقرير شهري بالأداء و ROAS"
                  className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition resize-none"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-950/40"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingService ? 'حفظ التعديلات' : 'إضافة الخدمة'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};