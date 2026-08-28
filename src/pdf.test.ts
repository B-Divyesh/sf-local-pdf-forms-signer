import { describe, expect, it, vi } from 'vitest';
import { PDFDict, PDFDocument, PDFName, PDFString, StandardFonts } from 'pdf-lib';
import { exportPdf, inspectForm } from './pdf';
import type { OverlayField, PageModel } from './types';

describe('PDF export', () => {
  it('reorders pages and creates a real editable text field', async () => {
    const source = await PDFDocument.create();
    const font = await source.embedFont(StandardFonts.Helvetica);
    source.addPage([300, 400]).drawText('First', { x: 20, y: 360, font });
    source.addPage([300, 400]).drawText('Second', { x: 20, y: 360, font });
    const pages: PageModel[] = [
      { id: 'second', sourceIndex: 1, rotation: 90 },
      { id: 'first', sourceIndex: 0, rotation: 0 },
    ];
    const fields: OverlayField[] = [{
      id: 'test-field', pageId: 'second', kind: 'text', x: .1, y: .2, width: .4, height: .08,
      label: 'Case number', value: 'FD-42',
    }];
    const result = await exportPdf(await source.save(), pages, fields, [], false);
    const exported = await PDFDocument.load(result);
    expect(exported.getPageCount()).toBe(2);
    expect(exported.getPage(0).getRotation().angle).toBe(90);
    const textField = exported.getForm().getTextField('field_desk_text_testfield');
    expect(textField.getText()).toBe('FD-42');
  });

  it('keeps filled source AcroForm fields editable in a non-flattened export', async () => {
    const source = await PDFDocument.create();
    const page = source.addPage([300, 400]);
    const fullName = source.getForm().createTextField('full_name');
    fullName.addToPage(page, { x: 30, y: 300, width: 180, height: 28 });
    const result = await exportPdf(
      await source.save(),
      [{ id: 'page', sourceIndex: 0, rotation: 0 }],
      [],
      [{ name: 'full_name', type: 'text', value: 'Ada Lovelace' }],
      false,
    );
    const exported = await PDFDocument.load(result);
    expect(exported.getForm().getFields().map((field) => field.getName())).toContain('full_name');
    expect(exported.getForm().getTextField('full_name').getText()).toBe('Ada Lovelace');
  });

  it('keeps source AcroForm fields while reordering pages in an editable export', async () => {
    const source = await PDFDocument.create();
    const first = source.addPage([300, 400]);
    const fullName = source.getForm().createTextField('full_name');
    fullName.addToPage(first, { x: 30, y: 300, width: 180, height: 28 });
    source.addPage([300, 400]);
    const result = await exportPdf(
      await source.save(),
      [
        { id: 'second', sourceIndex: 1, rotation: 0 },
        { id: 'first', sourceIndex: 0, rotation: 0 },
      ],
      [],
      [{ name: 'full_name', type: 'text', value: 'Ada Lovelace' }],
      false,
    );
    const exported = await PDFDocument.load(result);
    expect(exported.getPageCount()).toBe(2);
    expect(exported.getForm().getTextField('full_name').getText()).toBe('Ada Lovelace');
  });

  it('flattens newly created controls', async () => {
    const source = await PDFDocument.create();
    source.addPage([300, 400]);
    const result = await exportPdf(
      await source.save(),
      [{ id: 'page', sourceIndex: 0, rotation: 0 }],
      [{ id: 'check', pageId: 'page', kind: 'checkbox', x: .2, y: .2, width: .06, height: .05, label: 'Approved', value: '', checked: true }],
      [],
      true,
    );
    const exported = await PDFDocument.load(result);
    expect(exported.getForm().getFields()).toHaveLength(0);
  });

  it('detects XFA before pdf-lib removes it', async () => {
    const source = await PDFDocument.create();
    source.addPage([300, 400]);
    source.getForm().createTextField('standard_field');
    const acroForm = source.catalog.lookup(PDFName.of('AcroForm'), PDFDict);
    acroForm.set(PDFName.of('XFA'), PDFString.of('<xdp:xdp/>'));
    const warning = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const result = await inspectForm(await source.save({ updateFieldAppearances: false }));
    expect(result).toEqual({ fields: [], hasXfa: true });
    expect(warning).not.toHaveBeenCalled();
    warning.mockRestore();
  });
});
