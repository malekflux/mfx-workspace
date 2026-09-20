import { nextProjectReference } from '../utils/references';
import { useState } from 'react';
import { closeOnBackdrop, useDialog } from '../hooks/useDialog';
import { X, Plus, Trash2, DollarSign, Calendar, CreditCard, FileText } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { PaymentDueMethod, Project, Service } from '../types';
import { ModalPortal } from './ModalPortal';
import { generateContractTerms, normalizeDueDays } from '../utils/projectTerms';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project?: Project;
  clientId?: string;
}

export const ProjectModal = ({ isOpen, onClose, project, clientId: initialClientId }: ProjectModalProps) => {
  const { clients, projects, referenceCounters, createProject, updateProject, servicesCatalog } = useStore();

  const [clientId, setClientId] = useState(initialClientId || project?.clientId || '');
  const selectedClient=clients.find(c=>c.id===clientId);
  const reference=project?.clientId===clientId ? project.refId : selectedClient ? nextProjectReference(selectedClient,projects,referenceCounters['project:'+clientId] || 0).refId : 'Select a client';
  const [selectedServices, setSelectedServices] = useState<Service[]>(project?.services || []);
  const [billingModel, setBillingModel] = useState<'monthly' | 'fixed' | 'hourly' | 'retainer'>(
    project?.billingModel || 'fixed'
  );
  const [paymentMethod, setPaymentMethod] = useState<'instapay' | 'bank-transfer' | 'cash' | 'card'>(
    project?.paymentMethod || 'instapay'
  );
  const [contractStartDate, setContractStartDate] = useState(
    project?.contractStartDate?.slice(0,10) || new Date(Date.now()-new Date().getTimezoneOffset()*60000).toISOString().slice(0,10)
  );
  const [deadline, setDeadline] = useState(project?.deadline?.split('T')[0] || '');
  const [paymentDueMethod, setPaymentDueMethod] = useState<PaymentDueMethod>(project?.paymentDueMethod || ((project?.billingModel || 'fixed') === 'fixed' ? 'split-50-50' : 'due-days'));
  const [paymentDueDaysText, setPaymentDueDaysText] = useState(project?.paymentDueDays?.join(',') || String(project?.paymentDueDay || 1));
  const [currency, setCurrency] = useState<Project['currency']>(project?.currency || 'EGP');
  const [projectStatus, setProjectStatus] = useState<Project['projectStatus']>(project?.projectStatus || 'active');
  const [error, setError] = useState('');
  const [notes, setNotes] = useState(project?.notes || '');
  const [contractTermsEn, setContractTermsEn] = useState(project?.contractTermsEn || '');
  const [contractTermsAr, setContractTermsAr] = useState(project?.contractTermsAr || '');
  const [isTermsEditorOpen, setIsTermsEditorOpen] = useState(false);
  const [paidAmount, setPaidAmount] = useState(project?.paidAmount || 0);

  const totalAmount = Math.round(selectedServices.reduce((sum, s) => sum + s.basePrice, 0) * 100) / 100;
  const remainingAmount = Math.round((totalAmount - paidAmount)*100)/100;

  const handleAddService = (service: Service) => {
    setSelectedServices([...selectedServices, {
      ...service,
      id: crypto.randomUUID(),
      subServices: [...(service.subServices || [])],
      subServicesAr: [...(service.subServicesAr || [])],
    }]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(selectedServices.filter(s => s.id !== serviceId));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || selectedServices.length === 0) { setError('Select a client and at least one service.'); return; }
    if (!contractStartDate || (deadline && deadline < contractStartDate)) { setError('Deadline must be on or after the start date.'); return; }
    if (!Number.isFinite(totalAmount) || selectedServices.some(s => !Number.isFinite(s.basePrice) || s.basePrice < 0) || paidAmount < 0 || paidAmount > totalAmount) { setError('Check service prices and the amount paid.'); return; }
    const paymentDueDays = billingModel === 'hourly' || paymentDueMethod !== 'due-days' ? [] : normalizeDueDays(paymentDueDaysText);
    if (billingModel !== 'hourly' && paymentDueMethod === 'due-days' && !paymentDueDays.length) { setError('Enter payment days from 1 to 31, separated by commas.'); return; }

    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    const termsProject = {
      ...(project || { id: '', refId: reference, sourceRef: undefined }),
      clientId, services: selectedServices, billingModel, totalAmount, paidAmount, remainingAmount,
      paymentMethod, paymentDueMethod: billingModel === 'hourly' ? undefined : paymentDueMethod,
      paymentDueDays, paymentDueDay: paymentDueDays[0], contractStartDate, deadline: deadline || undefined,
      paymentStatus: 'pending' as const, projectStatus, notes, currency, currencySymbol: currency,
    } as Project;
    const generatedTerms = generateContractTerms(termsProject, client);
    const termsEn = contractTermsEn.trim() || generatedTerms.en;
    const termsAr = contractTermsAr.trim() || generatedTerms.ar;

    const paymentStatus: 'pending' | 'partial' | 'paid' | 'overdue' =
      paidAmount >= totalAmount ? 'paid' :
      paidAmount > 0 ? 'partial' : 'pending';

    if (project) {
      // Update existing project
      updateProject(project.id, {
        clientId, currency, currencySymbol: currency, projectStatus,
        services: selectedServices,
        billingModel,
        totalAmount,
        paidAmount,
        remainingAmount,
        paymentMethod,
        paymentDueMethod: billingModel === 'hourly' ? undefined : paymentDueMethod,
        paymentDueDays,
        paymentDueDay: paymentDueDays[0],
        contractStartDate,
        deadline: deadline || undefined,
        paymentStatus,
        notes,
        contractTermsEn: termsEn,
        contractTermsAr: termsAr,
      });
    } else {
      // Create new project
      createProject({
        clientId,
        services: selectedServices,
        billingModel,
        totalAmount,
        paidAmount,
        remainingAmount,
        paymentMethod,
        paymentDueMethod: billingModel === 'hourly' ? undefined : paymentDueMethod,
        paymentDueDays,
        paymentDueDay: paymentDueDays[0],
        contractStartDate,
        deadline: deadline || undefined,
        paymentStatus,
        projectStatus,
        notes,
        contractTermsEn: termsEn,
        contractTermsAr: termsAr,
        currency,
        currencySymbol: currency,
      });
    }

    onClose();
  };

  const dialogRef = useDialog(onClose);
  if (!isOpen) return null;

  return <ModalPortal>
    <div ref={dialogRef} onMouseDown={(event) => closeOnBackdrop(event, onClose)} role="dialog" aria-modal="true" aria-label="Project form" className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-surface rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-line">
          <h2 className="text-xl font-bold text-ink">
            {project ? 'Edit Project' : 'New Project'}
          </h2>
          <button
            aria-label="Close project form" onClick={onClose}
            className="p-2 hover:bg-canvas dark:hover:bg-surface rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-muted" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6"><p className="ref-preview">Project reference: <strong>{reference}</strong></p>
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <div className="grid grid-cols-2 gap-4"><label>Currency<select aria-label="Currency" value={currency} onChange={e => setCurrency(e.target.value as Project['currency'])}>{['EGP','USD','EUR','GBP'].map(c => <option key={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></label><label>Project status<select aria-label="Project status" value={projectStatus} onChange={e => setProjectStatus(e.target.value as Project['projectStatus'])}>{['active','paused','completed','cancelled'].map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase()+c.slice(1)}</option>)}</select></label></div>
          {/* Client Selection */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              Client *
            </label>
            <select
              required
              aria-label="Client" value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
            >
              <option value="">Select a client</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>
                  {client.businessName} ({client.refId})
                </option>
              ))}
            </select>
          </div>

          {/* Services */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              Services *
            </label>

            {/* Service Catalog */}
            <div className="mb-4 p-4 bg-canvas bg-surface rounded-lg border border-line">
              <p className="text-xs font-semibold text-muted uppercase tracking-wide mb-3">
                Add from Catalog
              </p>
              <div className="flex flex-wrap gap-2">
                {servicesCatalog.map(service => (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => handleAddService(service)}
                    className="px-3 py-1.5 bg-surface border border-line rounded-lg text-sm hover:bg-primary hover:text-white hover:border-primary transition-colors"
                  >
                    <Plus className="w-3 h-3 inline mr-1" />
                    {service.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Selected Services */}
            <div className="space-y-2">
              {selectedServices.length === 0 ? (
                <p className="text-sm text-muted text-center py-4">
                  No services selected
                </p>
              ) : (
                selectedServices.map(service => (
                  <div key={service.id} className="p-3 bg-surface border border-line rounded-lg">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1"><p className="font-semibold text-ink">{service.name}</p>{service.description && <p className="text-xs text-muted">{service.description}</p>}</div>
                      <div className="flex items-center gap-3">
                      <input aria-label={`Price for ${service.name}`} type="number" min="0" step="0.01" value={service.basePrice} className="w-28" onChange={e => setSelectedServices(selectedServices.map(s => s.id === service.id ? {...s, basePrice: Number(e.target.value)} : s))} />
                      <button
                        type="button"
                        onClick={() => handleRemoveService(service.id)}
                        className="p-1 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      <label className="text-xs text-muted">Deliverables for this project — one per line
                        <textarea aria-label={`Deliverables for ${service.name}`} rows={4} value={(service.subServices || []).join('\n')} onChange={(event) => setSelectedServices(selectedServices.map((item) => item.id === service.id ? { ...item, subServices: event.target.value.split('\n').map((value) => value.trim()).filter(Boolean) } : item))} />
                      </label>
                      <label dir="rtl" className="text-xs text-muted">مخرجات هذا المشروع — بند في كل سطر
                        <textarea aria-label={`Arabic deliverables for ${service.name}`} rows={4} value={(service.subServicesAr || []).join('\n')} onChange={(event) => setSelectedServices(selectedServices.map((item) => item.id === service.id ? { ...item, subServicesAr: event.target.value.split('\n').map((value) => value.trim()).filter(Boolean) } : item))} />
                      </label>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Total */}
            <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-ink">Total Amount:</span>
                <span className="text-2xl font-bold text-primary">{currency} {totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Billing & Payment */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink text-muted mb-2">
                <DollarSign className="w-4 h-4 inline mr-2" />
                Billing Model
              </label>
              <select
                aria-label="Billing model" value={billingModel}
                onChange={(e) => setBillingModel(e.target.value as Project['billingModel'])}
                className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
              >
                <option value="fixed">Fixed Price</option>
                <option value="monthly">Monthly</option>
                <option value="hourly">Hourly</option>
                <option value="retainer">Retainer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink text-muted mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Payment Method
              </label>
              <select
                aria-label="Payment method" value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as Project['paymentMethod'])}
                className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
              >
                <option value="instapay">InstaPay</option>
                <option value="bank-transfer">Bank Transfer</option>
                <option value="cash">Cash</option>
                <option value="card">Card</option>
              </select>
            </div>
          </div>

          {billingModel !== 'hourly' && <div className="grid grid-cols-2 gap-4">
            <label className="block text-sm font-semibold text-ink text-muted">Payment due method
              <select aria-label="Payment due method" value={paymentDueMethod} onChange={(event) => setPaymentDueMethod(event.target.value as PaymentDueMethod)}>
                <option value="split-50-50">50% / 50%</option>
                <option value="due-days">Specific days every month</option>
              </select>
            </label>
            {paymentDueMethod === 'due-days' && <label className="block text-sm font-semibold text-ink text-muted">Payment due days
              <input aria-label="Payment due days" value={paymentDueDaysText} onChange={(event) => setPaymentDueDaysText(event.target.value)} placeholder="1,15" inputMode="numeric" />
              <span className="block text-xs font-normal mt-1">Examples: 1,15 or 1,11,21</span>
            </label>}
          </div>}
          {billingModel === 'hourly' && <p className="text-sm text-muted">Hourly projects use approved time records and the due date below.</p>}

          {/* Dates */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-ink text-muted mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Project / Payment Start Date
              </label>
              <input
                type="date" required
                aria-label="Start date" value={contractStartDate}
                onChange={(e) => setContractStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-ink text-muted mb-2">
                Deadline
              </label>
              <input
                type="date"
                required={false} min={contractStartDate} aria-label="Deadline" value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
              />
            </div>
          </div>

          {/* Paid Amount */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              Amount Paid
            </label>
            <input
              type="number"
              min="0"
              max={totalAmount} step="0.01"
              aria-label="Amount paid" value={paidAmount}
              onChange={(e) => setPaidAmount(parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink"
              placeholder="0"
            />
            <p className="text-xs text-muted mt-1">
              Remaining: {currency} {remainingAmount.toLocaleString()}
            </p>
          </div>

          <div className="p-4 bg-canvas border border-line rounded-lg flex items-center justify-between gap-4">
            <div><p className="font-semibold text-ink">Terms & Conditions</p><p className="text-sm text-muted">Generated from this project’s scope, value, payment plan, and delivery type.</p></div>
            <button type="button" onClick={() => setIsTermsEditorOpen(true)} className="secondary-button">Review terms</button>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-ink text-muted mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Notes
            </label>
            <textarea
              aria-label="Project notes" value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 bg-canvas bg-surface border border-line rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-ink resize-none"
              placeholder="Add any additional notes or requirements..."
            />
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
            <button
              type="submit"
              disabled={!clientId || selectedServices.length === 0}
              className="primary-button"
            >
              {project ? 'Update Project' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
      {isTermsEditorOpen && <TermsEditor project={{ ...(project || { id: '', refId: reference }), clientId, services: selectedServices, billingModel, totalAmount, paidAmount, remainingAmount, paymentMethod, paymentDueMethod, paymentDueDays: normalizeDueDays(paymentDueDaysText), contractStartDate, deadline: deadline || undefined, paymentStatus: 'pending', projectStatus, currency, currencySymbol: currency } as Project} client={selectedClient} valueEn={contractTermsEn} valueAr={contractTermsAr} onSave={(en, ar) => { setContractTermsEn(en); setContractTermsAr(ar); setIsTermsEditorOpen(false); }} onClose={() => setIsTermsEditorOpen(false)} />}
    </div>
  </ModalPortal>;
};

function TermsEditor({ project, client, valueEn, valueAr, onSave, onClose }: {
  project: Project;
  client?: ReturnType<typeof useStore.getState>['clients'][number];
  valueEn: string;
  valueAr: string;
  onSave: (en: string, ar: string) => void;
  onClose: () => void;
}) {
  const generated = generateContractTerms(project, client);
  const [en, setEn] = useState(valueEn || generated.en);
  const [ar, setAr] = useState(valueAr || generated.ar);
  const editorRef = useDialog(onClose);
  return <div ref={editorRef} onMouseDown={(event) => closeOnBackdrop(event, onClose)} className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" role="dialog" aria-modal="true" aria-label="Contract terms editor">
    <div className="bg-surface border border-line rounded-lg max-w-4xl w-full max-h-[88vh] overflow-y-auto p-6">
      <div className="flex items-center justify-between gap-4 mb-5"><div><h3 className="text-lg font-bold text-ink">Terms & Conditions</h3><p className="text-sm text-muted">Edit the generated agreement before saving this project.</p></div><button type="button" onClick={onClose} className="secondary-button">Close</button></div>
      <div className="grid grid-cols-2 gap-4"><label>English terms<textarea aria-label="Contract terms in English" rows={16} value={en} onChange={(event) => setEn(event.target.value)} /></label><label dir="rtl">بنود العقد بالعربية<textarea aria-label="Contract terms in Arabic" rows={16} value={ar} onChange={(event) => setAr(event.target.value)} /></label></div>
      <div className="flex justify-end gap-3 mt-5"><button type="button" onClick={() => { setEn(generated.en); setAr(generated.ar); }} className="secondary-button">Regenerate from project</button><button type="button" onClick={() => onSave(en, ar)} className="primary-button">Save terms</button></div>
    </div>
  </div>;
}
