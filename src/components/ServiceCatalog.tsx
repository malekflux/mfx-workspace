import { useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import { closeOnBackdrop, useDialog } from '../hooks/useDialog';
import { useStore } from '../store/useStore';
import type { Service } from '../types';
import { ModalPortal } from './ModalPortal';

export function ServiceCatalog() {
  const { servicesCatalog, addServiceToCatalog, updateServiceInCatalog, deleteServiceFromCatalog } = useStore();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  return (
    <section className="panel">
      <div className="section-heading">
        <div><h2>Service catalog</h2><p>Reusable services. Existing project prices remain independent.</p></div>
        <button className="primary-button" onClick={() => { setEditing(null); setOpen(true); }}>New Service</button>
      </div>
      <details className="catalog-details">
        <summary>Browse {servicesCatalog.length} services</summary>
        <div className="catalog-grid">
          {servicesCatalog.map((service) => (
            <article
              className="catalog-item"
              key={service.id}
              role="button"
              tabIndex={0}
              aria-label={`Edit ${service.name}`}
              onClick={() => { setEditing(service); setOpen(true); }}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); setEditing(service); setOpen(true); } }}
            >
              <Pencil className="catalog-edit-icon" aria-hidden="true" />
              <div className="catalog-item-copy">
                <span>{service.name}</span>
                <small dir="auto">{service.nameAr || 'Add Arabic wording'}</small>
                <strong>{service.basePrice.toLocaleString()} <small>base price</small></strong>
              </div>
            </article>
          ))}
        </div>
      </details>
      {open && <ServiceForm key={editing?.id || 'new'} service={editing} close={() => setOpen(false)} remove={(service) => { if (window.confirm(`Delete “${service.name}” from the catalog? Existing projects will keep their saved copy.`)) { deleteServiceFromCatalog(service.id); setOpen(false); } }} save={(service) => { if (editing) updateServiceInCatalog(service.id, service); else addServiceToCatalog(service); setOpen(false); }} />}
    </section>
  );
}

function ServiceForm({ service, close, save, remove }: { service: Service | null; close: () => void; save: (service: Service) => void; remove: (service: Service) => void }) {
  const [error, setError] = useState('');
  const dialogRef = useDialog(close);
  return <ModalPortal>
    <div ref={dialogRef} onMouseDown={(event) => closeOnBackdrop(event, close)} className="studio-overlay" role="dialog" aria-modal="true" aria-label="Service form">
      <form className="service-form panel" onSubmit={(event) => {
        event.preventDefault();
        const data = new FormData(event.currentTarget);
        const name = String(data.get('name')).trim();
        const price = Number(data.get('price'));
        if (!name || !Number.isFinite(price) || price < 0) { setError('Enter a service name and a valid non-negative price.'); return; }
        save({id: service?.id || crypto.randomUUID(), name, nameAr: String(data.get('nameAr')).trim(), description: String(data.get('description')).trim(), descriptionAr: String(data.get('descriptionAr')).trim(), subServices: String(data.get('deliverables')).split('\n').map(value => value.trim()).filter(Boolean), subServicesAr: String(data.get('deliverablesAr')).split('\n').map(value => value.trim()).filter(Boolean), basePrice: price, isRecurring: data.has('recurring'), isVariable: data.has('variable')});
      }}>
        <div className="section-heading"><h2>{service ? 'Edit Service' : 'New Service'}</h2><button type="button" className="secondary-button" onClick={close}>Close</button></div>
        {error && <p role="alert">{error}</p>}
        <div className="form-columns">
          <label>Service name (English)<input name="name" required defaultValue={service?.name}/></label>
          <label>اسم الخدمة بالعربية<input name="nameAr" dir="rtl" defaultValue={service?.nameAr}/></label>
          <label>Description (English)<textarea name="description" defaultValue={service?.description}/></label>
          <label>الوصف بالعربية<textarea name="descriptionAr" dir="rtl" defaultValue={service?.descriptionAr}/></label>
          <label>Deliverables — one per line<textarea name="deliverables" rows={4} defaultValue={service?.subServices?.join('\n')}/></label>
          <label>المخرجات — بند في كل سطر<textarea name="deliverablesAr" dir="rtl" rows={4} defaultValue={service?.subServicesAr?.join('\n')}/></label>
        </div>
        <label>Base price (in the project's selected currency)<input name="price" type="number" min="0" step="0.01" required defaultValue={service?.basePrice ?? 0}/></label>
        <div className="flex gap-5"><label><input name="recurring" type="checkbox" defaultChecked={service?.isRecurring}/> Recurring</label><label><input name="variable" type="checkbox" defaultChecked={service?.isVariable}/> Variable</label></div>
        <div className="service-form-actions">
          {service && <button type="button" className="danger-button" onClick={() => remove(service)}><Trash2 aria-hidden="true" /> Delete Service</button>}
          <button className="primary-button">Save Service</button>
        </div>
      </form>
    </div>
  </ModalPortal>;
}
