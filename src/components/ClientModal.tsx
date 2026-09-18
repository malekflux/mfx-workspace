import React, { useState, useEffect } from 'react';
import { X, User, Mail, Phone, Building, MapPin, Check, Plus } from 'lucide-react';
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
        namePrimary: (client as any).namePrimary || (client as any).name || '',
        nameSecondary: (client as any).nameSecondary || '',
        companyPrimary: (client as any).companyPrimary || (client as any).company || '',
        companySecondary: (client as any).companySecondary || '',
        email: client.email || '',
        phone: client.phone || '',
        country: (client as any).country || 'Egypt',
        city: (client as any).city || 'Cairo',
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

    const payload: any = {
      ...formData,
      name: formData.namePrimary,
      company: formData.companyPrimary,
    };

    if (client) {
      (updateClient as any)(client.id, payload);
    } else {
      (addClient as any)(payload);
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
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-zinc-100">
              {client ? 'تعديل بيانات العميل' : 'إضافة عميل جديد'}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                الاسم الأساسي <span className="text-emerald-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={formData.namePrimary}
                  onChange={(e) => setFormData({ ...formData, namePrimary: e.target.value })}
                  placeholder="أحمد نحاس"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                الاسم بالإنجليزية (اختياري)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.nameSecondary}
                  onChange={(e) => setFormData({ ...formData, nameSecondary: e.target.value })}
                  placeholder="Ahmed Nahas"
                  dir="ltr"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition text-right"
                />
                <User className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                الشركة أو العلامة
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.companyPrimary}
                  onChange={(e) => setFormData({ ...formData, companyPrimary: e.target.value })}
                  placeholder="MFx Digital Solutions"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                />
                <Building className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                الشركة بالإنجليزية
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.companySecondary}
                  onChange={(e) => setFormData({ ...formData, companySecondary: e.target.value })}
                  placeholder="MFx Agency"
                  dir="ltr"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition text-right"
                />
                <Building className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                البريد الإلكتروني
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="client@mfx360.com"
                  dir="ltr"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition text-right"
                />
                <Mail className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                رقم الهاتف
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+20 100 000 0000"
                  dir="ltr"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition text-right"
                />
                <Phone className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                الدولة
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                  placeholder="مصر"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                />
                <MapPin className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1.5">
                المدينة
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="القاهرة"
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700/80 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-sm transition"
                />
                <MapPin className="w-4 h-4 text-zinc-500 absolute right-3.5 top-3" />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            {client && onAddProject ? (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onAddProject(client);
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-blue-400 hover:bg-blue-500/10 border border-blue-500/20 transition"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مشروع له</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/80 transition"
              >
                إلغاء
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] transition shadow-lg shadow-emerald-950/40"
              >
                <Check className="w-4 h-4" />
                <span>{client ? 'حفظ التعديلات' : 'إضافة العميل'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
