import { z } from 'zod';
import { PDF_NAME_PREFIXES, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '@/utils/constants';
import type { Document as DocumentTransport } from '@/generated/models/document';

// Reference and upload status only; file payloads never enter the form.
export function getDocumentRefSchema() {
  return z
    .object({
      documentId: z.string().optional(),
      isUploadedPdf: z.boolean().optional()
    })
    .nullish();
}

export type DocumentRef = z.infer<ReturnType<typeof getDocumentRefSchema>>;

export type DocumentValues = {
  sciencePDF: DocumentRef;
  technicalPDF: DocumentRef;
};

export const getDocumentValues = (proposal?: Partial<DocumentValues>): DocumentValues => ({
  sciencePDF: proposal?.sciencePDF ?? null,
  technicalPDF: proposal?.technicalPDF ?? null
});

export const isSameDocumentRef = (a: DocumentRef, b: DocumentRef): boolean =>
  !!a === !!b && a?.documentId === b?.documentId && a?.isUploadedPdf === b?.isUploadedPdf;

// Same rule as validateSciencePage / validateTechnicalPage.
export const getDocumentPageStatus = (ref: DocumentRef): number => {
  if (!ref || typeof ref !== 'object') return STATUS_ERROR;
  return ref.isUploadedPdf ? STATUS_OK : STATUS_PARTIAL;
};

// Finds a document in the PDM by its filename prefix, returning the first match if any.
const findDocument = (documents: DocumentTransport[] | null | undefined, prefix: string) =>
  documents?.find((document) => document.document_id?.startsWith(prefix));

const toRef = (document?: DocumentTransport): DocumentRef =>
  document ? { documentId: document.document_id, isUploadedPdf: document.uploaded_pdf } : null;

export const documentsFromPdm = (
  documents: DocumentTransport[] | null | undefined
): Pick<DocumentValues, 'sciencePDF' | 'technicalPDF'> => ({
  sciencePDF: toRef(findDocument(documents, PDF_NAME_PREFIXES.SCIENCE)),
  technicalPDF: toRef(findDocument(documents, PDF_NAME_PREFIXES.TECHNICAL))
});

/** Maps the form's document references to PDM documents. */
export const documentsToPdm = ({
  sciencePDF,
  technicalPDF
}: Pick<Partial<DocumentValues>, 'sciencePDF' | 'technicalPDF'>): DocumentTransport[] => {
  const toDocument = (ref: DocumentRef): DocumentTransport[] =>
    ref ? [{ document_id: ref.documentId as string, uploaded_pdf: ref.isUploadedPdf }] : [];
  return [...toDocument(sciencePDF), ...toDocument(technicalPDF)];
};
