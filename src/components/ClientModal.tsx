import { nextClientReference } from '../utils/references';
import { useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { X, Upload, Building2, User, Phone, Mail, Palette } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { Client } from '../types';

interface ClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  client?: Client;
  onAddProject?: (client:Client)=>void;
}

export const ClientModal = ({ isOpen, onClose, client, onAddProject }: ClientModalProps) => {
  const { createClient, updateClient, clients, referenceCounters } = useStore();
  const prefix="MFx-"+String(new Date().getFullYear()).slice(-2);
  const reference=client?.refId || nextClientReference(clients,referenceCounters[prefix] || 0).refId;
  const [formData, setFormData] = useState<Partial<Client>>({
    businessName: client?.businessName || '',
    contactPerson: client?.contactPerson || '',
    phone: client?.phone || '',
    email: client?.email || '',
    color: client?.color || '#0b58bd',
    logoUrl: client?.logoUrl || '',
  });

  const [error, setError] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>(client?.logoUrl || '');

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png','image/jpeg','image/webp'].includes(file.type) || file.size > 2 * 1024 * 1024) { setError('Choose a PNG, JPG or WebP image up to 2MB.'); return; }
      setError('');
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setFormData(current => ({ ...current, logoUrl: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.businessName?.trim() || !formData.contactPerson?.trim() || !formData.phone?.trim()) { setError('Complete the required fields.'); return; }
    if (!/^#[0-9a-f]{6}$/i.test(formData.color || '')) { setError('Use a valid hex color, e.g. #0b58bd.'); return; }
    formData.businessName = formData.businessName.trim();
    if (client) {
      // Update existing client
      updateClient(client.id, formData);
    } else {
      // Create new client
      const newClient = createClient({
        businessName: formData.businessName!,
        contactPerson: formData.contactPerson!,
        phone: formData.phone!,
        email: formData.email,
        color: formData.color,
        logoUrl: formData.logoUrl,
      });
      if ((e.nativeEvent as SubmitEvent).submitter?.getAttribute('value') === 'project') {onAddProject?.(newClient);return;}
    }

    onClose();
  };

  const dialogRef = useDialog(onClose);
  if (!isOpen) return null;

  return (
    <div ref={dialogRef} role="dialog" aria-modal="true" aria-label="Client form" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-line">
          <h2 className="text-xl font-bold text-ink">
            {client ? 'Edit Client' : 'Add New Client'}
          </h2>
          <button
            aria-label="Close client form" onClick={onClose}
            className="p-2 hover:bg-canvas dark:hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6"><p className="ref-preview">Client reference: <strong>{reference}</strong></p>
          {error && <p role="alert" className="text-red-600">{error}</p>}
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              Client Logo
            </label>
            <div className="flex items-center gap-4">
              <div className="w-24 h-24 rounded-lg border-2 border-dashed border-line flex items-center justify-center overflow-hidden bg-canvas bg-surface">
                {logoPreview ? (
                  <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain" />
                ) : (
                  <Upload className="w-8 h-8 text-muted" />
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  onChange={handleLogoChange}
                  className="hidden"
                  id="logo-upload"
                />
                <label
                  htmlFor="logo-upload"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-canvas bg-surface text-ink text-muted rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  Upload Logo
                </label>
                <p className="text-xs text-muted mt-2">
                  PNG, JPG or WebP (max 2MB)
                </p>
              </div>
            </div>
          </div>

          {/* Business Name */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              <Building2 className="w-4 h-4 inline mr-2" />
              Business Name *
            </label>
            <input
              type="text"
              required
              aria-label="Business name" value={formData.businessName}
              onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
              placeholder="e.g., Ghada Beauty & More"
            />
          </div>

          {/* Contact Person */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              <User className="w-4 h-4 inline mr-2" />
              Contact Person *
            </label>
            <input
              type="text"
              required
              aria-label="Contact person" value={formData.contactPerson}
              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
              className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
              placeholder="e.g., Ahmed Al-Shourbagy"
            />
          </div>

          {/* Phone & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink text-muted mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone *
              </label>
              <input
                type="tel"
                required
                aria-label="Phone" value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
                placeholder="+20 10 12345678"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink text-muted mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email
              </label>
              <input
                type="email"
                aria-label="Email" value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Color Picker */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              <Palette className="w-4 h-4 inline mr-2" />
              Brand Color
            </label>
            <div className="flex items-center gap-4">
              <input
                type="color"
                aria-label="Brand color" value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="w-16 h-10 rounded-lg border border-line cursor-pointer"
              />
              <input
                type="text"
                aria-label="Brand color" value={formData.color}
                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                className="flex-1 px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
                placeholder="#0b58bd"
              />
            </div>
            <p className="text-xs text-muted mt-2">
              Used for color coding in workspace
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-line">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-ink text-muted hover:bg-canvas dark:hover:bg-surface rounded-lg transition-colors"
            >
              Cancel
            </button>
            {!client && onAddProject && <button type="submit" value="project" className="primary-button">Add Client &amp; Project</button>}
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors font-semibold"
            >
              {client ? 'Update Client' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
