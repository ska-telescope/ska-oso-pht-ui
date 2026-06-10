import { pdfjs } from './pdfSetup';

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const doc = await pdfjs.getDocument({ data: buffer }).promise;
  const numPages = doc.numPages;
  await doc.destroy();
  return numPages;
}
