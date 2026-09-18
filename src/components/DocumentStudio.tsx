import { useMemo, useRef, useState } from 'react';
import { useDialog } from '../hooks/useDialog';
import { useStore } from '../store/useStore';
import { generateDocument } from '../documents/generate';
import type { DocumentInput, Language } from '../documents/generate';

export function DocumentStudio({ input, onClose }: { input: Omit<DocumentInput, 'language'>; onClose: () => void }) {
  const [language, setLanguage] = useState<Language>('en');
  const [termsByLanguage, setTermsByLanguage] = useState({
    en: input.projects[0]?.contractTermsEn || '',
    ar: input.projects[0]?.contractTermsAr || '',
  });
  const terms = termsByLanguage[language];

  const setTerms = (text: string) => {
    setTermsByLanguage((current) => ({ ...current, [language]: text }));
    const project = input.projects[0];
    if (project && input.kind === 'contract') {
      useStore.getState().updateProject(
        project.id,
        language === 'ar' ? { contractTermsAr: text } : { contractTermsEn: text }
      );
    }
  };

  const dialogRef = useDialog(onClose);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);
  const frame = useRef<HTMLIFrameElement>(null);

  const html = useMemo(
    () => generateDocument({ ...input, language, terms }),
    [input, language, terms]
  );

  const print = async () => {
    try {
      const doc = frame.current?.contentDocument;
      if (!doc) throw new Error('Preview is not ready.');
      await doc.fonts.ready;
      await Promise.all(
        Array.from(doc.images).map((img) => img.decode().catch(() => undefined))
      );
      frame.current?.contentWindow?.focus();
      frame.current?.contentWindow?.print();
    } catch {
      setError('Printing was blocked. Download the HTML, open it in your browser and use Print / Save as PDF.');
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html;charset=utf-8' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = `MFx-${input.kind}-${language}.html`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  const savePDF = async () => {
    setExporting(true);
    setError('');
    try {
      const response = await fetch('/api/pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ html }),
      });

      if (!response.ok) throw new Error(await response.text());
      const blob = await response.blob();
      if (!blob.type.includes('application/pdf')) throw new Error('PDF server is unavailable.');

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${input.kind === 'report' ? 'RPT' : input.kind === 'invoice' ? 'INV' : 'CON'}-${input.projects[0]?.refId || 'MFx'}-${language}.pdf`;
      a.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch {
      // بديل تلقائي ومباشر عند الرفع على Vercel أو غياب سيرفر الـ PDF
      await print();
    } finally {
      setExporting(false);
    }
  };

  return (
    <div ref={dialogRef} className="studio-overlay" role="dialog" aria-modal="true" aria-label="Document studio">
      <div className="studio-shell">
        <header className="studio-toolbar">
          <div>
            <h2>Document studio</h2>
            <p>{input.kind} · HTML + CSS · A4</p>
          </div>
          <div className="flex flex-wrap gap-2 items-center">
            <label>
              Language{' '}
              <select
                aria-label="Document language"
                value={language}
                onChange={(e) => {
                  setReady(false);
                  setLanguage(e.target.value as Language);
                }}
              >
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </label>
            <button type="button" className="secondary-button" onClick={download}>
              Download HTML
            </button>
            <button
              type="button"
              className="primary-button"
              disabled={!ready || exporting}
              onClick={savePDF}
            >
              {exporting ? 'Creating PDF…' : 'Download PDF'}
            </button>
            <button type="button" className="secondary-button" disabled={!ready} onClick={print}>
              Print
            </button>
            <button type="button" className="secondary-button" onClick={onClose} aria-label="Close document">
              Close
            </button>
          </div>
        </header>

        {input.kind === 'contract' && (
          <label className="studio-terms">
            Agreement terms — enter the approved wording for the selected language
            <textarea
              aria-label="Agreement terms"
              dir="auto"
              value={terms}
              onChange={(e) => setTerms(e.target.value)}
              placeholder="Enter agreement terms. No penalties or commitments are added automatically."
            />
          </label>
        )}

        <p className="studio-hint">
          {language === 'ar'
            ? 'تُستخدم الترجمة العربية للخدمات إن أدخلتها؛ النصوص غير المترجمة تبقى كما هي.'
            : 'Service translations use your saved Arabic wording. Other entered text is preserved.'}{' '}
          · PDF downloads in A4 automatically. For browser Print, disable headers/footers.
        </p>

        {error && <p role="alert" className="px-6 py-2 text-red-500 text-sm">{error}</p>}

        <iframe
          ref={frame}
          title="Document preview"
          srcDoc={html}
          sandbox="allow-same-origin allow-modals"
          onLoad={() => setReady(true)}
        />
      </div>
    </div>
  );
}
