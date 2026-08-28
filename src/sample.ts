import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

/** A realistic, bundled-in-code sample. It never reaches storage or a server. */
export async function createSamplePdf(): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle('Harbor Street Studio intake');
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const first = pdf.addPage([612, 792]);
  const form = pdf.getForm();
  first.drawText('Harbor Street Studio', { x: 52, y: 730, size: 22, font: bold, color: rgb(.09, .13, .13) });
  first.drawText('Client project intake · sample', { x: 52, y: 706, size: 12, font, color: rgb(.28, .32, .3) });
  const fields = [
    ['client_name', 'Client name', 'Maya Chen', 650],
    ['project_name', 'Project', 'Spring window display', 584],
    ['contact_email', 'Email', 'maya@harborstreet.example', 518],
  ] as const;
  for (const [name, label, value, y] of fields) {
    first.drawText(label, { x: 52, y: y + 34, size: 11, font });
    const field = form.createTextField(name);
    field.setText(value);
    field.addToPage(first, { x: 52, y, width: 356, height: 25, borderColor: rgb(.3, .35, .33), textColor: rgb(.1, .13, .13), font });
  }
  first.drawText('Project type', { x: 52, y: 460, size: 11, font });
  const type = form.createDropdown('project_type');
  type.addOptions(['Window display', 'Store signage', 'Editorial layout']);
  type.select('Window display');
  type.addToPage(first, { x: 52, y: 426, width: 356, height: 25, borderColor: rgb(.3, .35, .33), font });
  const approved = form.createCheckBox('approved_for_quote');
  approved.check();
  approved.addToPage(first, { x: 52, y: 371, width: 18, height: 18, borderColor: rgb(.3, .35, .33) });
  first.drawText('Ready for an estimate', { x: 78, y: 375, size: 11, font });
  first.drawText('Sample signature: Maya Chen', { x: 52, y: 300, size: 14, font: await pdf.embedFont(StandardFonts.HelveticaOblique), color: rgb(.12, .28, .27) });
  first.drawLine({ start: { x: 52, y: 292 }, end: { x: 330, y: 292 }, thickness: 1, color: rgb(.25, .3, .28) });
  const second = pdf.addPage([612, 792]);
  second.drawText('Project notes', { x: 52, y: 730, size: 22, font: bold, color: rgb(.09, .13, .13) });
  second.drawText('Preferred install: Thursday morning. Keep the existing brass frame.', { x: 52, y: 685, size: 13, font });
  second.drawText('This second page is included so you can move, rotate, remove, and restore pages.', { x: 52, y: 650, size: 12, font, color: rgb(.28, .32, .3) });
  return pdf.save();
}
