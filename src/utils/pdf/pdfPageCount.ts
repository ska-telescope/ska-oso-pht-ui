import { pdfjs } from './pdfSetup';

export async function getPdfPageCount(file: File): Promise<number> {
  const buffer = await file.arrayBuffer();
  const loadingTask = pdfjs.getDocument({ data: buffer });
  const doc = await loadingTask.promise;
  const numPages = doc.numPages;
  await loadingTask.destroy();
  return numPages;
}
