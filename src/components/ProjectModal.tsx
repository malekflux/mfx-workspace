import React, { useState, useEffect } from 'react';
import { X, FolderPlus, DollarSign, Check } from 'lucide-react';
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
    description: '',
    budget: '',
    currency: 'USD',
  });

  useEffect(() => {
    if (project) {
      setFormData({
        namePrimary: (project as any).namePrimary || (project as any).title || (project as any).name || '',
        nameSecondary: (project as any).nameSecondary || '',
        clientId: (project as any).clientId || '',
        description: (project as any).description || '',
        budget: String((project as any).budget || (project as any).total || ''),
        currency: (project as any).currency || 'USD',
      });
    } else {
      setFormData({
        namePrimary: '',
        nameSecondary: '',
        clientId: clientId || (clients[0]?.id ? String(clients[0].id) : ''),
        description: '',
        budget: '',
        currency: 'USD',
      });
    }
  }, [project, clients, clientId, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.namePrimary.trim()) return;

    const payload: any = {
      ...formData,
      name: formData.namePrimary,
      title: formData.namePrimary,
      budget: Number(formData.budget) || 0,
      total: Number(formData.budget) || 0,
    };

    if (project) {
      (updateProject as any)(project.id, payload);
    } else {
      (addProject as any)(payload);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400">
              <FolderPlus className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              {project ? 'تعديل المشروع' : 'إضافة مشروع جديد'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-100 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto flex-1 text-right">
          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              اسم المشروع <span className="text-blue-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.namePrimary}
              onChange={(e) => setFormData({ ...formData, namePrimary: e.target.value })}
              placeholder="مثال: الحملة الإعلانية وتطوير المتجر"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                العميل <span className="text-blue-500">*</span>
              </label>
              <select
                required
                value={formData.clientId}
                onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
              >
                <option value="" disabled>اختر العميل</option>
                {clients.map((c: any) => {
                  const clientName = c.namePrimary || c.name || 'عميل بدون اسم';
                  const company = c.companyPrimary || c.company || '';
                  return (
                    <option key={c.id} value={c.id}>
                      {clientName} {company ? `(${company})` : ''}
                    </option>
                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                الميزانية
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  placeholder="0.00"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition"
                />
                <DollarSign className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1.5">
              الوصف والملاحظات
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="تفاصيل المشروع ونطاق العمل..."
              className="w-full p-3.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-sm transition resize-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 active:scale-[0.98] transition shadow-lg shadow-blue-950/40"
            >
              <Check className="w-4 h-4" />
              <span>{project ? 'حفظ التعديلات' : 'إنشاء المشروع'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};