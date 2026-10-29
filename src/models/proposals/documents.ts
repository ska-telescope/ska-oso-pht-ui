import { z } from 'zod';
import { PDF_NAME_PREFIXES, STATUS_ERROR, STATUS_OK, STATUS_PARTIAL } from '@/utils/constants';
import type { Document as DocumentTransport } from '@/generated/models/document';

// Reference and upload status only; file payloads never enter the form.
export const documentRefSchema = z
  .object({
    documentId: z.string().optional(),
    isUploadedPdf: z.boolean().optional()
  })
  .nullish();

export const loadStatusSchema = z.number().nullish();

export type DocumentRef = z.infer<typeof documentRefSchema>;

export type DocumentValues = {
  sciencePDF: DocumentRef;
  scienceLoadStatus: number | null;
  technicalPDF: DocumentRef;
  technicalLoadStatus: number | null;
};

type DocumentSeed = {
  sciencePDF?: DocumentRef;
  scienceLoadStatus?: number | null;
  technicalPDF?: DocumentRef;
  technicalLoadStatus?: number | null;
};

export const getDocumentValues = (proposal?: DocumentSeed): DocumentValues => ({
  sciencePDF: proposal?.sciencePDF ?? null,
  scienceLoadStatus: proposal?.scienceLoadStatus ?? null,
  technicalPDF: proposal?.technicalPDF ?? null,
  technicalLoadStatus: proposal?.technicalLoadStatus ?? null
});

export const isSameDocumentRef = (a: DocumentRef, b: DocumentRef): boolean =>
  !!a === !!b && a?.documentId === b?.documentId && a?.isUploadedPdf === b?.isUploadedPdf;

// Same rule as validateSciencePage / validateTechnicalPage.
export const getDocumentPageStatus = (ref: DocumentRef): number => {
  if (!ref || typeof ref !== 'object') return STATUS_ERROR;
  return ref.isUploadedPdf ? STATUS_OK : STATUS_PARTIAL;
};

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

/**
 * Lays the form's document references over the PDM documents. An undefined reference means the
 * form has no opinion, so the base document is kept.
 */
export const documentsToPdm = (
  { sciencePDF, technicalPDF }: Pick<DocumentSeed, 'sciencePDF' | 'technicalPDF'>,
  base: DocumentTransport[] | null | undefined
): DocumentTransport[] => {
  const others = (base ?? []).filter(
    (document) =>
      !document.document_id?.startsWith(PDF_NAME_PREFIXES.SCIENCE) &&
      !document.document_id?.startsWith(PDF_NAME_PREFIXES.TECHNICAL)
  );
  const resolve = (ref: DocumentRef | undefined, prefix: string) => {
    if (ref === undefined) return findDocument(base, prefix);
    return ref
      ? ({
          document_id: ref.documentId as string,
          uploaded_pdf: ref.isUploadedPdf
        } as DocumentTransport)
      : undefined;
  };
  const science = resolve(sciencePDF, PDF_NAME_PREFIXES.SCIENCE);
  const technical = resolve(technicalPDF, PDF_NAME_PREFIXES.TECHNICAL);
  return [...others, ...(science ? [science] : []), ...(technical ? [technical] : [])];
};
