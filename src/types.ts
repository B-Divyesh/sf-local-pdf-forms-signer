export type Tool = 'select' | 'text' | 'checkbox' | 'date' | 'signature';

export type PageModel = {
  id: string;
  sourceIndex: number;
  rotation: number;
};

export type FieldKind = Exclude<Tool, 'select'>;

export type OverlayField = {
  id: string;
  pageId: string;
  kind: FieldKind;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  value: string;
  checked?: boolean;
  signatureData?: string;
  signatureMode?: 'draw' | 'type';
};

export type ExistingField = {
  name: string;
  type: 'text' | 'checkbox' | 'dropdown' | 'radio' | 'unknown';
  value: string;
  options?: string[];
  checked?: boolean;
};

export type ExportOptions = {
  flatten: boolean;
  filename: string;
};
