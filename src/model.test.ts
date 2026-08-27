import { describe, expect, it } from 'vitest';
import { clamp, createPages, isProbablyPdf, moveItem, rotatePage, safeOutputName } from './model';

describe('document model', () => {
  it('accepts PDFs without trusting MIME alone', () => {
    expect(isProbablyPdf({ name: 'form.PDF', type: '' })).toBe(true);
    expect(isProbablyPdf({ name: 'photo.png', type: 'image/png' })).toBe(false);
  });

  it('creates safe download names', () => {
    expect(safeOutputName('Tax / form.pdf')).toBe('Tax  form-field-desk.pdf');
    expect(safeOutputName('💼.pdf')).toBe('document-field-desk.pdf');
  });

  it('reorders without mutating input', () => {
    const source = ['a', 'b', 'c'];
    expect(moveItem(source, 2, 0)).toEqual(['c', 'a', 'b']);
    expect(source).toEqual(['a', 'b', 'c']);
  });

  it('normalizes rotation and bounds', () => {
    const page = createPages(1)[0];
    expect(rotatePage(page, -90).rotation).toBe(270);
    expect(clamp(4)).toBe(1);
    expect(clamp(-1)).toBe(0);
  });
});
