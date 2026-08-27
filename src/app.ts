import { createPages, isProbablyPdf, moveItem, newField, rotatePage, safeOutputName } from './model';
import { closeRenderer, exportPdf, inspectForm, openRenderer, renderPage } from './pdf';
import type { ExistingField, OverlayField, PageModel, Tool } from './types';

const icon = (name: 'lock' | 'file' | 'text' | 'check' | 'date' | 'sign' | 'pages' | 'download' | 'close') => {
  const paths = {
    lock: '<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    file: '<path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h4M9 12h6M9 16h6"/>',
    text: '<path d="M5 5h14M12 5v14M8 19h8"/>',
    check: '<rect x="4" y="4" width="16" height="16" rx="2"/><path d="m8 12 3 3 6-7"/>',
    date: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M8 14h2M14 14h2M8 17h2"/>',
    sign: '<path d="M3 18c3-1 4-8 6-8s-1 7 1 7 3-5 5-4-1 4 1 4 3-2 5-2"/>',
    pages: '<rect x="6" y="3" width="13" height="16" rx="1"/><path d="M6 7H3v14h12v-2"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M4 21h16"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
  };
  return `<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${paths[name]}</svg>`;
};

type Route = 'app' | 'privacy' | 'terms';

export class FieldDeskApp {
  private root: HTMLElement;
  private route: Route = this.routeFromLocation();
  private bytes: Uint8Array | null = null;
  private filename = '';
  private pages: PageModel[] = [];
  private fields: OverlayField[] = [];
  private existingFields: ExistingField[] = [];
  private selectedPageId = '';
  private selectedFieldId = '';
  private tool: Tool = 'select';
  private loading = false;
  private exporting = false;
  private error = '';
  private notice = '';
  private hasXfa = false;
  private deletedPage: { page: PageModel; index: number; fields: OverlayField[] } | null = null;
  private signatureDraft: { mode: 'draw' | 'type'; data: string; value: string } | null = null;
  private dragDepth = 0;
  // Geometry is written to a same-origin stylesheet via CSSOM.  Keeping it out
  // of style attributes lets the production CSP retain `style-src 'self'`.
  private geometrySheet: CSSStyleSheet | null = null;
  private geometryRules = new Map<string, CSSStyleRule>();

  constructor(root: HTMLElement) {
    this.root = root;
    document.querySelector<HTMLLinkElement>('#field-positions')?.addEventListener('load', () => {
      this.geometrySheet = null;
      this.syncFieldGeometries();
    });
    window.addEventListener('popstate', () => {
      this.route = this.routeFromLocation();
      this.render();
    });
    window.addEventListener('online', () => this.render());
    window.addEventListener('offline', () => this.render());
    this.render();
  }

  private routeFromLocation(): Route {
    if (location.pathname === '/privacy') return 'privacy';
    if (location.pathname === '/terms') return 'terms';
    return 'app';
  }

  private navigate(path: string): void {
    history.pushState({}, '', path);
    this.route = this.routeFromLocation();
    this.render();
    window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  }

  private render(): void {
    this.root.innerHTML = `
      <header class="site-header">
        <a class="wordmark" href="/" data-nav="/" aria-label="Field Desk home">
          <span class="wordmark-mark" aria-hidden="true"><i></i><i></i><i></i></span>
          <span>Field Desk</span>
        </a>
        <div class="privacy-indicator" title="No upload endpoint. Processing happens in this tab.">
          <span class="status-lamp" aria-hidden="true"></span>${icon('lock')}<span>Stays on this device</span>
        </div>
      </header>
      ${navigator.onLine ? '' : '<div class="offline-bar" role="status">Offline mode — the editor still works with files on this device.</div>'}
      ${this.route === 'app' ? this.renderApp() : this.renderLegal()}
      <footer class="site-footer">
        <span>Field Desk · no uploads, accounts, or tracking</span>
        <nav aria-label="Legal"><a href="/privacy" data-nav="/privacy">Privacy</a><a href="/terms" data-nav="/terms">Terms</a></nav>
        <span class="asset-note">Original AI-assisted illustration</span>
      </footer>
      <div class="toast-region" aria-live="polite" aria-atomic="true">${this.notice ? `<div class="toast">${this.escape(this.notice)}${this.deletedPage ? '<button type="button" data-action="undo-delete">Undo</button>' : ''}</div>` : ''}</div>
      ${this.renderSignatureDialog()}
      ${this.renderExportDialog()}
    `;
    this.bindGlobal();
    if (this.bytes && this.route === 'app') {
      this.syncFieldGeometries();
      this.markEditorReady();
      void this.renderCanvases();
    }
  }

  private renderApp(): string {
    if (!this.bytes) return this.renderLanding();
    return this.renderEditor();
  }

  private renderLanding(): string {
    return `<main id="main" class="landing">
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow"><span>Local instrument 01</span><span>PDF workshop</span></p>
          <h1 id="hero-title">Paperwork,<br><em>under your control.</em></h1>
          <p class="lede">Fill forms. Add fields. Sign. Reorder pages. Your PDF never leaves this browser tab.</p>
          <div class="file-loader ${this.dragDepth ? 'is-dragging' : ''}" data-dropzone>
            <input id="pdf-file" class="sr-only" type="file" accept="application/pdf,.pdf" />
            <label for="pdf-file" class="primary-button">${icon('file')} Open a PDF</label>
            <span>or drop it here</span>
          </div>
          ${this.loading ? '<div class="loading-line" role="status"><span></span>Reading your PDF locally…</div>' : ''}
          ${this.error ? `<div class="error-panel" role="alert"><strong>Couldn’t open that file.</strong><span>${this.escape(this.error)}</span></div>` : ''}
          <p class="file-note">PDF files only · up to 175 MB · large scans depend on device memory</p>
        </div>
        <figure class="hero-visual">
          <picture>
            <source type="image/avif" srcset="/assets/field-desk-hero.avif" />
            <source type="image/webp" srcset="/assets/field-desk-hero.webp" />
            <img src="/assets/field-desk-hero.jpg" width="768" height="512" alt="Illustration of a paper form passing through a compact charcoal document console with orange controls" fetchpriority="high" decoding="async" />
          </picture>
          <figcaption><span>01</span> One private workbench for the whole document.</figcaption>
        </figure>
      </section>
      <section class="capabilities" aria-labelledby="capabilities-title">
        <div><p class="section-index">Four controls. One file.</p><h2 id="capabilities-title">The missing middle between Preview and Acrobat.</h2></div>
        <ol>
          <li><span>01</span>${icon('text')}<h3>Prepare & fill</h3><p>Complete existing form fields or place new text, checkbox, and date fields.</p></li>
          <li><span>02</span>${icon('sign')}<h3>Mark & sign</h3><p>Draw with a pointer or type a signature. It is a mark, not a qualified e-signature.</p></li>
          <li><span>03</span>${icon('pages')}<h3>Arrange pages</h3><p>Move, rotate, or remove pages. Undo a deletion before export.</p></li>
          <li><span>04</span>${icon('download')}<h3>Export locally</h3><p>Keep fields editable or flatten them into a clean, portable result.</p></li>
        </ol>
      </section>
      <section class="trust-strip" aria-label="Privacy details">
        <div class="big-lamp"><span></span></div>
        <div><p class="eyebrow">Privacy circuit</p><h2>No upload can happen.</h2><p>There is no server endpoint, account, cloud bucket, analytics script, or hidden transfer. After first load, the app works offline.</p></div>
        <dl><div><dt>File bytes sent</dt><dd>0</dd></div><div><dt>Retention</dt><dd>None</dd></div><div><dt>Account</dt><dd>Never</dd></div></dl>
      </section>
    </main>`;
  }

  private renderEditor(): string {
    const selectedPage = this.pages.find((page) => page.id === this.selectedPageId) ?? this.pages[0];
    const selectedField = this.fields.find((field) => field.id === this.selectedFieldId);
    const pagePosition = Math.max(0, this.pages.indexOf(selectedPage));
    return `<main id="main" class="editor-shell" data-editor-ready="false" aria-busy="true">
      <h1 class="sr-only">Edit ${this.escape(this.filename)} in Field Desk</h1>
      <div class="document-bar">
        <div class="document-id">${icon('file')}<div><strong data-document-filename>${this.escape(this.filename)}</strong><span>${this.pages.length} page${this.pages.length === 1 ? '' : 's'} · processing locally</span></div></div>
        <div class="document-actions"><button class="secondary-button" type="button" data-action="close-file">Close</button><button class="primary-button" type="button" data-action="open-export">${icon('download')} Export PDF</button></div>
      </div>
      ${this.hasXfa ? '<div class="warning-bar" role="status"><strong>XFA form detected.</strong> Its live fields are not supported; you can still add fields and export page content.</div>' : ''}
      <div class="editor-grid">
        <aside class="page-rail" aria-label="Document pages">
          <div class="rail-heading"><strong>Pages</strong><span>${this.pages.length}</span></div>
          <ol class="page-list">${this.pages.map((page, index) => this.renderThumbnail(page, index)).join('')}</ol>
        </aside>
        <section class="workbench" aria-label="PDF page editor">
          <div class="tool-rack" role="toolbar" aria-label="Field tools">
            ${this.toolButton('select', 'Select', 'pages')}
            ${this.toolButton('text', 'Text field', 'text')}
            ${this.toolButton('checkbox', 'Checkbox', 'check')}
            ${this.toolButton('date', 'Date field', 'date')}
            ${this.toolButton('signature', 'Signature', 'sign')}
          </div>
          <div class="page-meta"><span>Page ${pagePosition + 1} of ${this.pages.length}</span><span>${this.tool === 'select' ? 'Select a field to edit it' : `Click the page to place a ${this.tool}`}</span></div>
          <div class="canvas-scroll">
            <div class="page-stage" data-page-stage data-page-id="${selectedPage.id}">
              <canvas class="pdf-canvas" data-main-canvas aria-label="PDF page ${pagePosition + 1}"></canvas>
              <div class="field-layer">${this.fields.filter((field) => field.pageId === selectedPage.id).map((field) => this.renderOverlay(field)).join('')}</div>
            </div>
          </div>
        </section>
        <aside class="inspector" aria-label="Properties inspector">
          ${selectedField ? this.renderFieldInspector(selectedField) : this.renderDocumentInspector(pagePosition)}
        </aside>
      </div>
    </main>`;
  }

  private toolButton(tool: Tool, label: string, iconName: 'pages' | 'text' | 'check' | 'date' | 'sign'): string {
    return `<button type="button" class="tool-button ${this.tool === tool ? 'is-active' : ''}" data-tool="${tool}" aria-pressed="${this.tool === tool}">${icon(iconName)}<span>${label}</span></button>`;
  }

  private renderThumbnail(page: PageModel, index: number): string {
    const selected = page.id === this.selectedPageId;
    return `<li class="page-thumb-row ${selected ? 'is-active' : ''}">
      <button class="page-thumb" type="button" data-select-page="${page.id}" aria-label="Show page ${index + 1}" aria-current="${selected ? 'page' : 'false'}">
        <canvas data-thumb="${page.id}" aria-hidden="true"></canvas><span>${index + 1}</span>
      </button>
      <div class="page-quick-actions">
        <button type="button" data-move-page="up" data-page-id="${page.id}" ${index === 0 ? 'disabled' : ''} aria-label="Move page ${index + 1} earlier">↑</button>
        <button type="button" data-move-page="down" data-page-id="${page.id}" ${index === this.pages.length - 1 ? 'disabled' : ''} aria-label="Move page ${index + 1} later">↓</button>
      </div>
    </li>`;
  }

  private renderOverlay(field: OverlayField): string {
    const display = field.kind === 'checkbox' ? (field.checked ? '✓' : '') : field.kind === 'signature' ? (field.value || 'Signature') : (field.value || field.label);
    return `<button type="button" class="placed-field field-${field.kind} ${field.id === this.selectedFieldId ? 'is-selected' : ''}" data-field-id="${field.id}" aria-label="${this.escape(field.label)}. Select to edit; arrow keys move; Shift plus arrow moves farther."><span>${this.escape(display)}</span><i class="resize-handle" data-resize aria-hidden="true"></i></button>`;
  }

  private renderDocumentInspector(pageIndex: number): string {
    return `<div class="inspector-heading"><p>Document controls</p><h2>Page ${pageIndex + 1}</h2></div>
      <div class="control-group"><p class="control-label">Page operations</p>
        <button class="inspector-button" type="button" data-action="rotate-page">↻ <span>Rotate 90°</span></button>
        <button class="inspector-button danger" type="button" data-action="delete-page" ${this.pages.length === 1 ? 'disabled title="A PDF must keep at least one page"' : ''}>× <span>Remove page</span></button>
      </div>
      <div class="control-group"><p class="control-label">Existing form fields <span>${this.existingFields.length}</span></p>
        ${this.existingFields.length ? `<div class="existing-fields">${this.existingFields.map((field, index) => this.renderExistingField(field, index)).join('')}</div>` : '<p class="empty-note">No standard AcroForm fields found. Add your own with the tools above.</p>'}
      </div>
      <div class="inspector-tip"><strong>Keyboard tip</strong><p>Use Tab to reach page controls and placed fields. Arrow keys move a selected field; Delete removes it.</p></div>`;
  }

  private renderExistingField(field: ExistingField, index: number): string {
    const id = `existing-${index}`;
    const label = this.escape(field.name);
    if (field.type === 'checkbox') return `<label class="check-control" for="${id}"><input id="${id}" type="checkbox" data-existing-index="${index}" ${field.checked ? 'checked' : ''}/><span>${label}</span></label>`;
    if ((field.type === 'dropdown' || field.type === 'radio') && field.options?.length) return `<label class="form-control" for="${id}"><span>${label}</span><select id="${id}" data-existing-index="${index}">${field.options.map((option) => `<option ${option === field.value ? 'selected' : ''}>${this.escape(option)}</option>`).join('')}</select></label>`;
    if (field.type === 'text') return `<label class="form-control" for="${id}"><span>${label}</span><input id="${id}" type="text" value="${this.escapeAttr(field.value)}" data-existing-index="${index}" /></label>`;
    return `<div class="unsupported-field"><span>${label}</span><small>Unsupported field type</small></div>`;
  }

  private renderFieldInspector(field: OverlayField): string {
    return `<div class="inspector-heading"><button type="button" class="back-button" data-action="deselect-field">← Page controls</button><p>Selected element</p><h2>${this.escape(field.label)}</h2></div>
      <div class="control-group">
        <label class="form-control" for="field-label"><span>Field label</span><input id="field-label" data-field-prop="label" value="${this.escapeAttr(field.label)}" /></label>
        ${field.kind === 'checkbox'
          ? `<label class="check-control" for="field-checked"><input id="field-checked" type="checkbox" data-field-prop="checked" ${field.checked ? 'checked' : ''}/><span>Checked</span></label>`
          : `<label class="form-control" for="field-value"><span>${field.kind === 'signature' ? 'Signed name' : 'Default value'}</span><input id="field-value" data-field-prop="value" type="${field.kind === 'date' ? 'date' : 'text'}" value="${this.escapeAttr(field.value)}" /></label>`}
      </div>
      <div class="control-group"><p class="control-label">Size</p><div class="size-grid">
        <label for="field-width">Width<input id="field-width" data-field-prop="width" type="range" min="5" max="80" value="${Math.round(field.width * 100)}" /></label>
        <label for="field-height">Height<input id="field-height" data-field-prop="height" type="range" min="3" max="30" value="${Math.round(field.height * 100)}" /></label>
      </div></div>
      ${field.kind === 'signature' ? '<button class="inspector-button" type="button" data-action="edit-signature">✎ <span>Change signature</span></button>' : ''}
      <button class="inspector-button danger" type="button" data-action="delete-field">× <span>Remove field</span></button>`;
  }

  private renderSignatureDialog(): string {
    return `<dialog id="signature-dialog" class="panel-dialog" aria-labelledby="signature-title">
      <form method="dialog" class="dialog-card" data-signature-form>
        <div class="dialog-heading"><div><p class="eyebrow">Signature instrument</p><h2 id="signature-title">Create your signature</h2></div><button type="button" class="icon-button" data-action="close-signature" aria-label="Close signature dialog">${icon('close')}</button></div>
        <p class="dialog-note">This adds a visual mark only. It is not a qualified electronic signature or an audit trail.</p>
        <div class="signature-tabs" role="tablist" aria-label="Signature method"><button type="button" role="tab" aria-selected="true" data-signature-tab="draw">Draw</button><button type="button" role="tab" aria-selected="false" data-signature-tab="type">Type</button></div>
        <div class="signature-pane" data-signature-pane="draw"><canvas id="signature-pad" width="720" height="220" aria-label="Signature drawing pad. Draw with a pointer."></canvas><button type="button" class="text-button" data-action="clear-signature">Clear drawing</button></div>
        <div class="signature-pane" data-signature-pane="type" hidden><label class="form-control" for="typed-signature"><span>Your name</span><input id="typed-signature" autocomplete="name" /></label><div class="typed-preview" aria-hidden="true" data-typed-preview>Signature</div></div>
        <div class="dialog-actions"><button type="button" class="secondary-button" data-action="close-signature">Cancel</button><button type="submit" class="primary-button">Use signature</button></div>
      </form>
    </dialog>`;
  }

  private renderExportDialog(): string {
    return `<dialog id="export-dialog" class="panel-dialog" aria-labelledby="export-title">
      <form method="dialog" class="dialog-card" data-export-form>
        <div class="dialog-heading"><div><p class="eyebrow">Output control</p><h2 id="export-title">Export your PDF</h2></div><button type="button" class="icon-button" data-action="close-export" aria-label="Close export dialog">${icon('close')}</button></div>
        <label class="form-control" for="output-name"><span>File name</span><input id="output-name" value="${this.escapeAttr(safeOutputName(this.filename || 'document'))}" required /></label>
        <fieldset class="export-options"><legend>Field behavior</legend>
          <label><input type="radio" name="flatten" value="false" checked/><span><strong>Keep fields editable</strong><small>Recipients can change original and new fields in compatible PDF readers.</small></span></label>
          <label><input type="radio" name="flatten" value="true"/><span><strong>Flatten completed fields</strong><small>Burns values and signatures into the pages for portability.</small></span></label>
        </fieldset>
        <p class="dialog-note">Standard AcroForm fields remain editable after page changes. Legacy PDF readers can vary in how they show field appearances, so review the exported file before sending.</p>
        <div class="dialog-actions"><button type="button" class="secondary-button" data-action="close-export">Cancel</button><button type="submit" class="primary-button" ${this.exporting ? 'disabled' : ''}>${this.exporting ? 'Building PDF…' : `${icon('download')} Download PDF`}</button></div>
      </form>
    </dialog>`;
  }

  private renderLegal(): string {
    const privacy = this.route === 'privacy';
    return `<main id="main" class="legal-page"><p class="eyebrow">Field Desk record 0${privacy ? '2' : '3'}</p><h1>${privacy ? 'Privacy, plainly.' : 'Terms of use.'}</h1>
      <p class="legal-lede">${privacy ? 'Field Desk is built so your document does not need our trust.' : 'Use Field Desk for documents you are allowed to edit and sign.'}</p>
      ${privacy ? `<section><h2>What we collect</h2><p>Nothing. Field Desk has no accounts, analytics, advertising, cookies, upload endpoint, or server-side document processing. We do not receive your PDF, edits, signatures, filename, or exported file.</p></section>
      <section><h2>What stays on your device</h2><p>Your file is held in the memory of the current browser tab while you work. It is cleared when you close or reload the tab. The service worker may cache the public application code so the tool can open offline; it never caches your documents.</p></section>
      <section><h2>Network requests</h2><p>After the app loads, document work makes no network request. All libraries and artwork are served from this site, with no third-party runtime scripts or fonts.</p></section>`
      : `<section><h2>Local utility, no warranty</h2><p>Field Desk is provided “as is” under the MIT License. You are responsible for reviewing the exported PDF and keeping a backup of the original.</p></section>
      <section><h2>Signatures</h2><p>A drawn or typed signature made here is a visual mark. Field Desk does not verify identity, issue a digital certificate, create an audit trail, or provide a qualified electronic signature. Whether a mark is legally effective depends on your context and jurisdiction.</p></section>
      <section><h2>Supported use</h2><p>Do not use the tool to alter documents without permission or misrepresent another person. XFA forms, encrypted files without accessible content, OCR, and edits to existing page text are outside this version’s scope.</p></section>`}
      <a href="/" data-nav="/" class="primary-button">Return to Field Desk</a>
    </main>`;
  }

  private bindGlobal(): void {
    this.root.querySelectorAll<HTMLElement>('[data-nav]').forEach((link) => link.addEventListener('click', (event) => {
      event.preventDefault();
      this.navigate(link.getAttribute('href') || '/');
    }));
    this.root.querySelector('[data-action="undo-delete"]')?.addEventListener('click', () => this.undoDelete());
    if (this.route !== 'app') return;
    if (!this.bytes) this.bindLanding();
    else this.bindEditor();
    this.bindDialogs();
  }

  private bindLanding(): void {
    const input = this.root.querySelector<HTMLInputElement>('#pdf-file');
    input?.addEventListener('change', () => {
      const file = input.files?.[0];
      if (file) void this.loadFile(file);
    });
    const dropzone = this.root.querySelector<HTMLElement>('[data-dropzone]');
    ['dragenter', 'dragover'].forEach((type) => dropzone?.addEventListener(type, (event) => {
      event.preventDefault();
      this.dragDepth = 1;
      dropzone.classList.add('is-dragging');
    }));
    ['dragleave', 'drop'].forEach((type) => dropzone?.addEventListener(type, (event) => {
      event.preventDefault();
      this.dragDepth = 0;
      dropzone.classList.remove('is-dragging');
    }));
    dropzone?.addEventListener('drop', (event) => {
      const file = event.dataTransfer?.files[0];
      if (file) void this.loadFile(file);
    });
  }

  private async loadFile(file: File): Promise<void> {
    this.error = '';
    if (!isProbablyPdf(file)) {
      this.error = 'Choose a file ending in .pdf.';
      this.render();
      return;
    }
    if (file.size > 175 * 1024 * 1024) {
      this.error = 'This file is over 175 MB and may exhaust browser memory. Try a smaller or compressed copy.';
      this.render();
      return;
    }
    this.loading = true;
    this.render();
    try {
      const bytes = new Uint8Array(await file.arrayBuffer());
      const [{ pageCount }, formInfo] = await Promise.all([openRenderer(bytes), inspectForm(bytes)]);
      this.bytes = bytes;
      this.filename = file.name;
      this.pages = createPages(pageCount);
      this.selectedPageId = this.pages[0]?.id ?? '';
      this.existingFields = formInfo.fields;
      this.hasXfa = formInfo.hasXfa;
      this.notice = `${pageCount} page${pageCount === 1 ? '' : 's'} opened locally.`;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'The PDF could not be read.';
      this.error = /encrypt|password/i.test(message) ? 'This PDF is password-protected. Remove its password in a trusted PDF reader, then try again.' : 'The file may be damaged or use an unsupported PDF format.';
      await closeRenderer();
    } finally {
      this.loading = false;
      this.render();
    }
  }

  private bindEditor(): void {
    this.root.querySelectorAll<HTMLElement>('[data-tool]').forEach((button) => button.addEventListener('click', () => {
      const tool = button.dataset.tool as Tool;
      if (tool === 'signature' && !this.signatureDraft) {
        this.openDialog('signature-dialog');
        return;
      }
      this.tool = tool;
      this.selectedFieldId = '';
      this.render();
    }));
    this.root.querySelectorAll<HTMLElement>('[data-select-page]').forEach((button) => button.addEventListener('click', () => {
      this.selectedPageId = button.dataset.selectPage || '';
      this.selectedFieldId = '';
      this.render();
    }));
    this.root.querySelectorAll<HTMLButtonElement>('[data-move-page]').forEach((button) => button.addEventListener('click', () => {
      const index = this.pages.findIndex((page) => page.id === button.dataset.pageId);
      this.pages = moveItem(this.pages, index, index + (button.dataset.movePage === 'up' ? -1 : 1));
      this.notice = `Page moved to position ${this.pages.findIndex((page) => page.id === button.dataset.pageId) + 1}.`;
      this.render();
    }));
    this.root.querySelector('[data-action="close-file"]')?.addEventListener('click', () => void this.closeFile());
    this.root.querySelector('[data-action="open-export"]')?.addEventListener('click', () => this.openDialog('export-dialog'));
    this.root.querySelector('[data-action="rotate-page"]')?.addEventListener('click', () => this.rotateCurrentPage());
    this.root.querySelector('[data-action="delete-page"]')?.addEventListener('click', () => this.deleteCurrentPage());
    this.root.querySelector('[data-action="deselect-field"]')?.addEventListener('click', () => { this.selectedFieldId = ''; this.render(); });
    this.root.querySelector('[data-action="delete-field"]')?.addEventListener('click', () => this.deleteField());
    this.root.querySelector('[data-action="edit-signature"]')?.addEventListener('click', () => this.openDialog('signature-dialog'));
    this.root.querySelectorAll<HTMLInputElement | HTMLSelectElement>('[data-existing-index]').forEach((input) => input.addEventListener('input', () => {
      const field = this.existingFields[Number(input.dataset.existingIndex)];
      if (!field) return;
      if (input instanceof HTMLInputElement && input.type === 'checkbox') {
        field.checked = input.checked;
        field.value = String(input.checked);
      } else field.value = input.value;
    }));
    this.root.querySelectorAll<HTMLInputElement>('[data-field-prop]').forEach((input) => input.addEventListener('input', () => this.updateSelectedField(input)));
    const stage = this.root.querySelector<HTMLElement>('[data-page-stage]');
    stage?.addEventListener('click', (event) => this.placeField(event, stage));
    this.root.querySelectorAll<HTMLElement>('[data-field-id]').forEach((element) => this.bindPlacedField(element, stage));
  }

  private updateSelectedField(input: HTMLInputElement): void {
    const field = this.fields.find((item) => item.id === this.selectedFieldId);
    if (!field) return;
    const property = input.dataset.fieldProp;
    if (property === 'checked') field.checked = input.checked;
    else if (property === 'width' || property === 'height') field[property] = Number(input.value) / 100;
    else if (property === 'label' || property === 'value') field[property] = input.value;
    const overlay = this.root.querySelector<HTMLElement>(`[data-field-id="${field.id}"]`);
    if (overlay) {
      this.syncFieldGeometry(field);
      const span = overlay.querySelector('span');
      if (span) span.textContent = field.kind === 'checkbox' ? (field.checked ? '✓' : '') : (field.value || field.label);
    }
  }

  private placeField(event: MouseEvent, stage: HTMLElement): void {
    if (this.tool === 'select' || (event.target as HTMLElement).closest('[data-field-id]')) return;
    const rect = stage.getBoundingClientRect();
    const field = newField(this.tool, this.selectedPageId, (event.clientX - rect.left) / rect.width, (event.clientY - rect.top) / rect.height);
    if (field.kind === 'signature' && this.signatureDraft) {
      field.signatureMode = this.signatureDraft.mode;
      field.signatureData = this.signatureDraft.mode === 'draw' ? this.signatureDraft.data : undefined;
      field.value = this.signatureDraft.value;
    }
    this.fields.push(field);
    this.selectedFieldId = field.id;
    this.tool = 'select';
    this.notice = `${field.label} placed. Use arrow keys to position it precisely.`;
    this.render();
  }

  private bindPlacedField(element: HTMLElement, stage: HTMLElement | null): void {
    element.addEventListener('click', (event) => {
      event.stopPropagation();
      this.selectedFieldId = element.dataset.fieldId || '';
      this.tool = 'select';
      this.render();
    });
    element.addEventListener('keydown', (event) => {
      const field = this.fields.find((item) => item.id === element.dataset.fieldId);
      if (!field) return;
      if (event.key === 'Delete' || event.key === 'Backspace') {
        event.preventDefault();
        this.fields = this.fields.filter((item) => item.id !== field.id);
        this.selectedFieldId = '';
        this.notice = 'Field removed.';
        this.render();
        return;
      }
      const step = event.shiftKey ? 0.02 : 0.005;
      if (event.key === 'ArrowLeft') field.x -= step;
      else if (event.key === 'ArrowRight') field.x += step;
      else if (event.key === 'ArrowUp') field.y -= step;
      else if (event.key === 'ArrowDown') field.y += step;
      else return;
      event.preventDefault();
      field.x = Math.max(0, Math.min(1 - field.width, field.x));
      field.y = Math.max(0, Math.min(1 - field.height, field.y));
      this.syncFieldGeometry(field);
    });
    element.addEventListener('pointerdown', (event) => {
      if (!stage) return;
      event.preventDefault();
      event.stopPropagation();
      const field = this.fields.find((item) => item.id === element.dataset.fieldId);
      if (!field) return;
      this.selectedFieldId = field.id;
      const isResize = Boolean((event.target as HTMLElement).closest('[data-resize]'));
      const rect = stage.getBoundingClientRect();
      const startX = event.clientX;
      const startY = event.clientY;
      const start = { x: field.x, y: field.y, width: field.width, height: field.height };
      element.setPointerCapture(event.pointerId);
      const move = (moveEvent: PointerEvent) => {
        const dx = (moveEvent.clientX - startX) / rect.width;
        const dy = (moveEvent.clientY - startY) / rect.height;
        if (isResize) {
          field.width = Math.max(0.04, Math.min(1 - field.x, start.width + dx));
          field.height = Math.max(0.025, Math.min(1 - field.y, start.height + dy));
        } else {
          field.x = Math.max(0, Math.min(1 - field.width, start.x + dx));
          field.y = Math.max(0, Math.min(1 - field.height, start.y + dy));
        }
        this.syncFieldGeometry(field);
      };
      const end = () => {
        element.removeEventListener('pointermove', move);
        element.removeEventListener('pointerup', end);
        this.render();
      };
      element.addEventListener('pointermove', move);
      element.addEventListener('pointerup', end);
    });
  }

  private rotateCurrentPage(): void {
    const index = this.pages.findIndex((page) => page.id === this.selectedPageId);
    if (index < 0) return;
    this.pages[index] = rotatePage(this.pages[index]);
    this.notice = `Page ${index + 1} rotated 90 degrees.`;
    this.render();
  }

  private deleteCurrentPage(): void {
    if (this.pages.length <= 1) return;
    const index = this.pages.findIndex((page) => page.id === this.selectedPageId);
    const page = this.pages[index];
    const fields = this.fields.filter((field) => field.pageId === page.id);
    this.deletedPage = { page, index, fields };
    this.pages.splice(index, 1);
    this.fields = this.fields.filter((field) => field.pageId !== page.id);
    this.selectedPageId = this.pages[Math.min(index, this.pages.length - 1)].id;
    this.selectedFieldId = '';
    this.notice = `Page ${index + 1} removed.`;
    this.render();
  }

  private undoDelete(): void {
    if (!this.deletedPage) return;
    this.pages.splice(this.deletedPage.index, 0, this.deletedPage.page);
    this.fields.push(...this.deletedPage.fields);
    this.selectedPageId = this.deletedPage.page.id;
    this.deletedPage = null;
    this.notice = 'Page restored.';
    this.render();
  }

  private deleteField(): void {
    this.fields = this.fields.filter((field) => field.id !== this.selectedFieldId);
    this.selectedFieldId = '';
    this.notice = 'Field removed.';
    this.render();
  }

  private async closeFile(): Promise<void> {
    await closeRenderer();
    this.bytes = null;
    this.pages = [];
    this.fields = [];
    this.existingFields = [];
    this.filename = '';
    this.clearFieldGeometries();
    this.error = '';
    this.notice = 'Document cleared from this tab.';
    this.render();
  }

  private async renderCanvases(): Promise<void> {
    const page = this.pages.find((item) => item.id === this.selectedPageId);
    const main = this.root.querySelector<HTMLCanvasElement>('[data-main-canvas]');
    if (page && main) {
      const scroll = main.closest<HTMLElement>('.canvas-scroll');
      try { await renderPage(main, page, Math.max(280, (scroll?.clientWidth ?? 800) - 64)); } catch { this.notice = 'This page could not be rendered, but it may still export.'; }
      if (this.root.contains(main)) main.dataset.pageRendered = 'true';
    }
    const thumbs = [...this.root.querySelectorAll<HTMLCanvasElement>('[data-thumb]')];
    for (const canvas of thumbs) {
      const thumbPage = this.pages.find((item) => item.id === canvas.dataset.thumb);
      if (thumbPage) void renderPage(canvas, thumbPage, 96, true).catch(() => undefined);
    }
  }

  // The editor can accept field edits before PDF.js has rasterized a canvas.
  // Keeping this state independent of rendering avoids a slow worker or a
  // thumbnail queue making the product appear unusable to keyboard users and
  // automated consumers.
  private markEditorReady(): void {
    const editor = this.root.querySelector<HTMLElement>('[data-editor-ready]');
    if (!editor) return;
    editor.dataset.editorReady = 'true';
    editor.setAttribute('aria-busy', 'false');
  }

  private fieldPositionSheet(): CSSStyleSheet | null {
    const sheet = document.querySelector<HTMLLinkElement>('#field-positions')?.sheet;
    if (!(sheet instanceof CSSStyleSheet)) return null;
    if (this.geometrySheet !== sheet) {
      this.geometrySheet = sheet;
      this.geometryRules.clear();
    }
    return sheet;
  }

  private syncFieldGeometries(): void {
    this.fields.forEach((field) => this.syncFieldGeometry(field));
  }

  private syncFieldGeometry(field: OverlayField): void {
    const sheet = this.fieldPositionSheet();
    if (!sheet) return;
    let rule = this.geometryRules.get(field.id);
    if (!rule) {
      const selector = `[data-field-id="${CSS.escape(field.id)}"]`;
      const ruleIndex = sheet.insertRule(`${selector}{}`, sheet.cssRules.length);
      const inserted = sheet.cssRules[ruleIndex];
      if (!(inserted instanceof CSSStyleRule)) return;
      rule = inserted;
      this.geometryRules.set(field.id, rule);
    }
    rule.style.setProperty('left', `${field.x * 100}%`);
    rule.style.setProperty('top', `${field.y * 100}%`);
    rule.style.setProperty('width', `${field.width * 100}%`);
    rule.style.setProperty('height', `${field.height * 100}%`);
  }

  private clearFieldGeometries(): void {
    const sheet = this.fieldPositionSheet();
    if (sheet) while (sheet.cssRules.length) sheet.deleteRule(0);
    this.geometryRules.clear();
  }

  private bindDialogs(): void {
    this.root.querySelectorAll('[data-action="close-signature"]').forEach((button) => button.addEventListener('click', () => this.closeDialog('signature-dialog')));
    this.root.querySelectorAll('[data-action="close-export"]').forEach((button) => button.addEventListener('click', () => this.closeDialog('export-dialog')));
    this.root.querySelector('[data-action="clear-signature"]')?.addEventListener('click', () => this.clearSignatureCanvas());
    const typed = this.root.querySelector<HTMLInputElement>('#typed-signature');
    typed?.addEventListener('input', () => { const preview = this.root.querySelector('[data-typed-preview]'); if (preview) preview.textContent = typed.value || 'Signature'; });
    this.root.querySelectorAll<HTMLButtonElement>('[data-signature-tab]').forEach((tab) => tab.addEventListener('click', () => {
      this.root.querySelectorAll<HTMLButtonElement>('[data-signature-tab]').forEach((item) => item.setAttribute('aria-selected', String(item === tab)));
      this.root.querySelectorAll<HTMLElement>('[data-signature-pane]').forEach((pane) => { pane.hidden = pane.dataset.signaturePane !== tab.dataset.signatureTab; });
      if (tab.dataset.signatureTab === 'draw') this.prepareSignatureCanvas(); else typed?.focus();
    }));
    this.root.querySelector<HTMLFormElement>('[data-signature-form]')?.addEventListener('submit', (event) => {
      event.preventDefault();
      const active = this.root.querySelector<HTMLButtonElement>('[data-signature-tab][aria-selected="true"]')?.dataset.signatureTab;
      const canvas = this.root.querySelector<HTMLCanvasElement>('#signature-pad');
      if (active === 'type') {
        const value = typed?.value.trim() || '';
        if (!value) { typed?.focus(); return; }
        this.signatureDraft = { mode: 'type', data: '', value };
      } else if (canvas) {
        this.signatureDraft = { mode: 'draw', data: canvas.toDataURL('image/png'), value: typed?.value.trim() || 'Signature' };
      }
      const selected = this.fields.find((field) => field.id === this.selectedFieldId && field.kind === 'signature');
      if (selected && this.signatureDraft) {
        selected.signatureMode = this.signatureDraft.mode;
        selected.signatureData = this.signatureDraft.mode === 'draw' ? this.signatureDraft.data : undefined;
        selected.value = this.signatureDraft.value;
      } else this.tool = 'signature';
      this.closeDialog('signature-dialog');
      this.notice = selected ? 'Signature updated.' : 'Signature ready. Click the page to place it.';
      this.render();
    });
    this.root.querySelector<HTMLFormElement>('[data-export-form]')?.addEventListener('submit', (event) => { event.preventDefault(); void this.handleExport(); });
  }

  private openDialog(id: string): void {
    const dialog = this.root.querySelector<HTMLDialogElement>(`#${id}`);
    if (!dialog) return;
    dialog.showModal();
    if (id === 'signature-dialog') requestAnimationFrame(() => this.prepareSignatureCanvas());
  }

  private closeDialog(id: string): void {
    this.root.querySelector<HTMLDialogElement>(`#${id}`)?.close();
  }

  private prepareSignatureCanvas(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('#signature-pad');
    if (!canvas || canvas.dataset.ready) return;
    canvas.dataset.ready = 'true';
    const context = canvas.getContext('2d');
    if (!context) return;
    context.lineWidth = 5;
    context.lineCap = 'round';
    context.strokeStyle = '#17201f';
    let drawing = false;
    const point = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return { x: (event.clientX - rect.left) * (canvas.width / rect.width), y: (event.clientY - rect.top) * (canvas.height / rect.height) };
    };
    canvas.addEventListener('pointerdown', (event) => {
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      const p = point(event);
      context.beginPath();
      context.moveTo(p.x, p.y);
    });
    canvas.addEventListener('pointermove', (event) => {
      if (!drawing) return;
      const p = point(event);
      context.lineTo(p.x, p.y);
      context.stroke();
    });
    canvas.addEventListener('pointerup', () => { drawing = false; });
  }

  private clearSignatureCanvas(): void {
    const canvas = this.root.querySelector<HTMLCanvasElement>('#signature-pad');
    canvas?.getContext('2d')?.clearRect(0, 0, canvas.width, canvas.height);
  }

  private async handleExport(): Promise<void> {
    if (!this.bytes || this.exporting) return;
    const form = this.root.querySelector<HTMLFormElement>('[data-export-form]');
    if (!form) return;
    const nameInput = form.querySelector<HTMLInputElement>('#output-name');
    const flatten = form.querySelector<HTMLInputElement>('input[name="flatten"]:checked')?.value === 'true';
    const name = (nameInput?.value.trim() || safeOutputName(this.filename)).replace(/\.pdf$/i, '') + '.pdf';
    this.exporting = true;
    const submit = form.querySelector<HTMLButtonElement>('button[type="submit"]');
    if (submit) { submit.disabled = true; submit.textContent = 'Building PDF…'; }
    try {
      const output = await exportPdf(this.bytes, this.pages, this.fields, this.existingFields, flatten);
      const blob = new Blob([output as BlobPart], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 15_000);
      this.closeDialog('export-dialog');
      this.notice = `${name} downloaded. Review it before sending.`;
    } catch (error) {
      this.notice = error instanceof Error ? `Export failed: ${error.message}` : 'Export failed. Try flattening the fields.';
    } finally {
      this.exporting = false;
      this.render();
    }
  }

  private escape(value: string): string {
    return value.replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' })[character] || character);
  }

  private escapeAttr(value: string): string {
    return this.escape(value).replace(/`/g, '&#96;');
  }
}
