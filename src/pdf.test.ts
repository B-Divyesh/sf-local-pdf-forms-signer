import { describe, expect, it } from 'vitest';
import { PDFDocument, StandardFonts } from 'pdf-lib';
import { exportPdf } from './pdf';
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
});
