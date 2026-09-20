import { useMemo, useRef, useState } from 'react';
import { closeOnBackdrop, useDialog } from '../hooks/useDialog';
import { generateDocument, getDocumentReference } from '../documents/generate';
import type { DocumentInput, Language } from '../documents/generate';
import { ModalPortal } from './ModalPortal';
import { generateContractTerms } from '../utils/projectTerms';

export function DocumentStudio({ input, onClose }: { input: Omit<DocumentInput, 'language'>; onClose: () => void }) {
  const [language, setLanguage] = useState<Language>('en');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const exportInFlight = useRef(false);
  const dialogRef = useDialog(onClose);
  const project = input.projects[0];
  const client = input.clients.find((candidate) => candidate.id === project?.clientId);
  const generatedTerms = project ? generateContractTerms(project, client) : undefined;
  const terms = language === 'ar' ? project?.contractTermsAr || generatedTerms?.ar : project?.contractTermsEn || generatedTerms?.en;
  const html = useMemo(() => generateDocument({ ...input, language, terms }), [input, language, terms]);
  const documentReference = getDocumentReference(input.kind, client?.refId, input.date);

  const savePDF = async () => {
    if (exportInFlight.current) return;
    exportInFlight.current = true;
    setExporting(true);
    setError('');
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 50000);
    try {
      const response = await fetch('/api/pdf', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ html }), signal: controller.signal });
      if (response.status === 404) throw new Error('PDF service is missing from this deployment. Redeploy the latest project files.');
      if (!response.ok) throw new Error((await response.text()) || `PDF export failed (${response.status}).`);
      const blob = await response.blob();
      if (!blob.type.includes('application/pdf')) throw new Error('PDF server is unavailable.');
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = url;
      anchor.download = `${documentReference}-${language}.pdf`;
      anchor.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (caught) {
      setError(caught instanceof DOMException && caught.name === 'AbortError' ? 'PDF generation timed out. Please try again.' : caught instanceof Error ? caught.message : 'PDF export failed.');
    } finally {
      window.clearTimeout(timeout);
      exportInFlight.current = false;
      setExporting(false);
    }
  };

  const title = input.kind === 'invoice' ? 'MFx Invoice' : input.kind === 'contract' ? 'MFx Contract' : 'MFx Report';

  return <ModalPortal>
    <div ref={dialogRef} onMouseDown={(event) => closeOnBackdrop(event, onClose)} className="studio-overlay" role="dialog" aria-modal="true" aria-label="Document preview">
      <div className="studio-shell">
        <header className="studio-toolbar studio-toolbar-minimal">
          <h2>{title}</h2>
          <div className="studio-actions">
            <label>Language<select aria-label="Document language" value={language} onChange={(event) => { setReady(false); setLanguage(event.target.value as Language); }}><option value="en">English</option><option value="ar">العربية</option></select></label>
            <button type="button" className="primary-button" disabled={!ready || exporting} onClick={savePDF}>{exporting ? 'Creating PDF…' : 'Download PDF'}</button>
            <button type="button" className="secondary-button" onClick={onClose}>Close</button>
          </div>
        </header>
        {error && <p role="alert" className="px-6 py-2 text-red-500 text-sm">{error}</p>}
        <iframe title="Document preview" srcDoc={html} sandbox="allow-same-origin" onLoad={() => setReady(true)} />
      </div>
    </div>
  </ModalPortal>;
}
