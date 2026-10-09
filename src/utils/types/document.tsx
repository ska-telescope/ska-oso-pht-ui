import type { Document } from '@/generated/models/document';

export type DocumentBackend = Document;

export type DocumentPDF = {
  documentId?: string;
  isUploadedPdf?: boolean;
};
