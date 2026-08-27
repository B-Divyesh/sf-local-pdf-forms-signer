import type { OverlayField, PageModel, Tool } from './types';

export const ACCEPTED_PDF_TYPES = ['application/pdf', 'application/x-pdf'];

export function isProbablyPdf(file: Pick<File, 'name' | 'type'>): boolean {
  return ACCEPTED_PDF_TYPES.includes(file.type) || file.name.toLowerCase().endsWith('.pdf');
}

export function safeOutputName(input: string): string {
  const stem = input.replace(/\.pdf$/i, '').replace(/[^a-z0-9._ -]/gi, '').trim() || 'document';
  return `${stem}-field-desk.pdf`;
}

export function createPages(count: number): PageModel[] {
  return Array.from({ length: count }, (_, sourceIndex) => ({
    id: `page-${sourceIndex}-${crypto.randomUUID()}`,
    sourceIndex,
    rotation: 0,
  }));
}

export function moveItem<T>(items: T[], from: number, to: number): T[] {
  if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) return items;
  const next = [...items];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function newField(tool: Exclude<Tool, 'select'>, pageId: string, x: number, y: number): OverlayField {
  const sizes = {
    text: [0.28, 0.055],
    checkbox: [0.052, 0.052],
    date: [0.2, 0.055],
    signature: [0.3, 0.1],
  } as const;
  const [width, height] = sizes[tool];
  return {
    id: crypto.randomUUID(),
    pageId,
    kind: tool,
    x: clamp(x, 0, 1 - width),
    y: clamp(y, 0, 1 - height),
    width,
    height,
    label: `${tool[0].toUpperCase()}${tool.slice(1)} field`,
    value: tool === 'date' ? new Date().toISOString().slice(0, 10) : '',
    checked: false,
  };
}

export function rotatePage(page: PageModel, amount = 90): PageModel {
  return { ...page, rotation: (page.rotation + amount + 360) % 360 };
}
