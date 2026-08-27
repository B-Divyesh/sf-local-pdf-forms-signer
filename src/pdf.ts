import type { ExistingField, OverlayField, PageModel } from './types';

type PdfJsDocument = {
  numPages: number;
  getPage(pageNumber: number): Promise<PdfJsPage>;
  destroy(): Promise<void>;
};

type PdfJsPage = {
  getViewport(options: { scale: number; rotation?: number }): { width: number; height: number };
  render(options: { canvasContext: CanvasRenderingContext2D; canvas: HTMLCanvasElement; viewport: unknown }): { promise: Promise<void> };
};

let pdfJsDoc: PdfJsDocument | null = null;

export async function openRenderer(bytes: Uint8Array): Promise<{ pageCount: number }> {
  if (pdfJsDoc) await pdfJsDoc.destroy();
  const pdfjs = await import('pdfjs-dist');
  const workerUrl = (await import('pdfjs-dist/build/pdf.worker.min.mjs?url')).default;
  pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
  pdfJsDoc = await pdfjs.getDocument({ data: bytes.slice() }).promise as unknown as PdfJsDocument;
  return { pageCount: pdfJsDoc.numPages };
}

export async function closeRenderer(): Promise<void> {
  if (pdfJsDoc) await pdfJsDoc.destroy();
  pdfJsDoc = null;
}

export async function renderPage(canvas: HTMLCanvasElement, page: PageModel, maxWidth: number, thumbnail = false): Promise<void> {
  if (!pdfJsDoc) throw new Error('No PDF is open.');
  const pdfPage = await pdfJsDoc.getPage(page.sourceIndex + 1);
  const base = pdfPage.getViewport({ scale: 1, rotation: page.rotation });
  const scale = Math.min(thumbnail ? 0.24 : 1.7, maxWidth / base.width);
  const viewport = pdfPage.getViewport({ scale, rotation: page.rotation });
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.floor(viewport.width * ratio);
  canvas.height = Math.floor(viewport.height * ratio);
  // The width and height attributes establish the intrinsic aspect ratio. Do
  // not write an inline style here: strict production CSP rejects style attrs.
  const context = canvas.getContext('2d', { alpha: false });
  if (!context) throw new Error('Canvas rendering is not supported in this browser.');
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  await pdfPage.render({ canvasContext: context, canvas, viewport }).promise;
}

export async function inspectForm(bytes: Uint8Array): Promise<{ fields: ExistingField[]; hasXfa: boolean }> {
  const lib = await import('pdf-lib');
  const doc = await lib.PDFDocument.load(bytes.slice(), { ignoreEncryption: false });
  const form = doc.getForm();
  const hasXfa = form.hasXFA();
  const fields = form.getFields().map((field): ExistingField => {
    if (field instanceof lib.PDFTextField) {
      return { name: field.getName(), type: 'text', value: field.getText() ?? '' };
    }
    if (field instanceof lib.PDFCheckBox) {
      return { name: field.getName(), type: 'checkbox', value: field.isChecked() ? 'true' : 'false', checked: field.isChecked() };
    }
    if (field instanceof lib.PDFDropdown || field instanceof lib.PDFOptionList) {
      return { name: field.getName(), type: 'dropdown', value: field.getSelected()[0] ?? '', options: field.getOptions() };
    }
    if (field instanceof lib.PDFRadioGroup) {
      return { name: field.getName(), type: 'radio', value: field.getSelected() ?? '', options: field.getOptions() };
    }
    return { name: field.getName(), type: 'unknown', value: '' };
  });
  return { fields, hasXfa };
}

export async function exportPdf(
  bytes: Uint8Array,
  pages: PageModel[],
  overlayFields: OverlayField[],
  existingFields: ExistingField[],
  flatten: boolean,
): Promise<Uint8Array> {
  const lib = await import('pdf-lib');
  const source = await lib.PDFDocument.load(bytes.slice(), { ignoreEncryption: false });
  const sourceForm = source.getForm();

  for (const model of existingFields) {
    try {
      const field = sourceForm.getField(model.name);
      if (field instanceof lib.PDFTextField) field.setText(model.value);
      else if (field instanceof lib.PDFCheckBox) model.checked ? field.check() : field.uncheck();
      else if (field instanceof lib.PDFDropdown || field instanceof lib.PDFOptionList) {
        if (model.value) field.select(model.value);
      } else if (field instanceof lib.PDFRadioGroup && model.value) field.select(model.value);
    } catch {
      // A malformed field should not prevent export of the rest of the document.
    }
  }
  try {
    sourceForm.updateFieldAppearances();
    if (flatten) sourceForm.flatten();
  } catch {
    // Some legacy forms cannot generate appearances; copied page content still exports.
  }

  const output = await lib.PDFDocument.create();
  output.setCreator('Field Desk — local-pdf-forms-signer');
  output.setProducer('pdf-lib (processed locally in browser)');
  const copied = await output.copyPages(source, pages.map((page) => page.sourceIndex));
  for (let index = 0; index < copied.length; index += 1) {
    const copiedPage = copied[index];
    const sourceAngle = copiedPage.getRotation().angle;
    copiedPage.setRotation(lib.degrees((sourceAngle + pages[index].rotation) % 360));
    output.addPage(copiedPage);
  }

  const form = output.getForm();
  const font = await output.embedFont(lib.StandardFonts.Helvetica);
  const italic = await output.embedFont(lib.StandardFonts.HelveticaOblique);

  for (const field of overlayFields) {
    const pageIndex = pages.findIndex((page) => page.id === field.pageId);
    if (pageIndex < 0) continue;
    const page = output.getPage(pageIndex);
    const { width, height } = page.getSize();
    const x = field.x * width;
    const fieldWidth = Math.max(14, field.width * width);
    const fieldHeight = Math.max(14, field.height * height);
    const y = height - (field.y * height) - fieldHeight;
    const name = `field_desk_${field.kind}_${field.id.replace(/-/g, '')}`;

    if (field.kind === 'signature') {
      if (field.signatureMode === 'draw' && field.signatureData) {
        const png = await output.embedPng(field.signatureData);
        page.drawImage(png, { x, y, width: fieldWidth, height: fieldHeight });
      } else {
        page.drawText(field.value || 'Signature', {
          x: x + 3,
          y: y + Math.max(3, fieldHeight * 0.28),
          size: Math.min(22, fieldHeight * 0.52),
          font: italic,
          color: lib.rgb(0.08, 0.12, 0.12),
          maxWidth: fieldWidth - 6,
        });
      }
      page.drawLine({ start: { x, y }, end: { x: x + fieldWidth, y }, thickness: 0.7, color: lib.rgb(0.25, 0.28, 0.27) });
      continue;
    }

    if (field.kind === 'checkbox') {
      const check = form.createCheckBox(name);
      check.addToPage(page, { x, y, width: fieldWidth, height: fieldHeight, borderWidth: 1, borderColor: lib.rgb(0.2, 0.24, 0.23) });
      if (field.checked) check.check();
      check.updateAppearances();
      continue;
    }

    const text = form.createTextField(name);
    text.addToPage(page, {
      x,
      y,
      width: fieldWidth,
      height: fieldHeight,
      font,
      borderWidth: 0.8,
      borderColor: lib.rgb(0.35, 0.38, 0.35),
      backgroundColor: lib.rgb(1, 0.99, 0.94),
    });
    text.setText(field.value);
    text.setFontSize(Math.min(12, fieldHeight * 0.5));
    text.updateAppearances(font);
  }

  try {
    if (flatten) form.flatten({ updateFieldAppearances: false });
  } catch {
    // Export remains usable even if a malformed source annotation cannot flatten.
  }
  return output.save({ useObjectStreams: true });
}
